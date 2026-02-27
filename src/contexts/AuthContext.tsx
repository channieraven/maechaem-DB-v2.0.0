import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import supabase, { isSupabaseConfigured } from '../lib/supabase';
import type { Profile, UserRole } from '../lib/database.types';

// ── Types ────────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isApproved: boolean;
  role: UserRole | null;
  canWrite: boolean;    // staff | researcher | admin
  isAdmin: boolean;
  initError: string | null;
  initTimedOut: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Pick<Profile, 'fullname' | 'position' | 'organization'>>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  retryInit: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  fullname: string;
  position?: string;
  organization?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const WRITE_ROLES: UserRole[] = ['staff', 'researcher', 'admin'];
const MSG_SUPABASE_NOT_CONFIGURED = 'ระบบยังไม่ได้ตั้งค่าการเชื่อมต่อฐานข้อมูล กรุณาติดต่อผู้ดูแลระบบ';
const MSG_DB_SCHEMA_ERROR = 'ฐานข้อมูลยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบเพื่อตั้งค่า schema ของฐานข้อมูล';
const INIT_TIMEOUT_MS = 10_000;
const MSG_INIT_TIMEOUT = 'การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง';
const MSG_INIT_ERROR = 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง';

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('TIMEOUT')), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

/** Map raw Supabase error messages to user-friendly Thai messages. */
function mapAuthError(message: string): string {
  if (
    message.toLowerCase().includes('database error querying schema') ||
    message.toLowerCase().includes('error querying schema')
  ) {
    return MSG_DB_SCHEMA_ERROR;
  }
  return message;
}

function buildState(user: User | null, profile: Profile | null, session: Session | null): AuthState {
  const role = profile?.role ?? null;
  const isAdmin = role === 'admin';
  return {
    user,
    profile,
    session,
    isLoading: false,
    // Admins are always considered approved regardless of the approved flag.
    isApproved: isAdmin || (profile?.approved ?? false),
    role,
    canWrite: role !== null && WRITE_ROLES.includes(role),
    isAdmin,
    initError: null,
    initTimedOut: false,
  };
}

// ── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    isApproved: false,
    role: null,
    canWrite: false,
    isAdmin: false,
    initError: null,
    initTimedOut: false,
  });

  // Guards to prevent redundant concurrent fetchProfile calls.
  const isLoginFetchingRef = useRef(false);
  const isInitFetchingRef = useRef(false);

  // Always-current reference to the user, used by the stable refreshProfile callback.
  const userRef = useRef(state.user);
  useEffect(() => { userRef.current = state.user; }, [state.user]);

  // Retry trigger — incrementing re-runs the init useEffect.
  const [retryCounter, setRetryCounter] = useState(0);

  const retryInit = () => {
    setState((s) => ({
      ...s,
      isLoading: true,
      initError: null,
      initTimedOut: false,
    }));
    setRetryCounter((c) => c + 1);
  };

  // Fetch the profiles row for a given user id
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      console.error('fetchProfile error:', error.message);
      return null;
    }
    return data as Profile;
  };

  // Initialise auth state from existing session
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      isInitFetchingRef.current = true;
      try {
        const { data: { session } } = await withTimeout(
          supabase.auth.getSession(),
          INIT_TIMEOUT_MS,
        );
        if (!mounted) return;

        if (session?.user) {
          const profile = await withTimeout(
            fetchProfile(session.user.id),
            INIT_TIMEOUT_MS,
          );
          if (mounted) setState(buildState(session.user, profile, session));
        } else {
          if (mounted) setState((s) => ({ ...s, isLoading: false }));
        }
      } catch (err) {
        if (!mounted) return;
        const isTimeout = err instanceof Error && err.message === 'TIMEOUT';
        setState((s) => ({
          ...s,
          isLoading: false,
          initError: isTimeout ? MSG_INIT_TIMEOUT : MSG_INIT_ERROR,
          initTimedOut: isTimeout,
        }));
      } finally {
        isInitFetchingRef.current = false;
      }
    };

    init();

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          // Skip if init() or login() is actively fetching the profile.
          if (isInitFetchingRef.current || isLoginFetchingRef.current) return;
          const profile = await fetchProfile(session.user.id);
          if (mounted) setState(buildState(session.user, profile, session));
        } else {
          if (mounted) setState(buildState(null, null, null));
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCounter]);

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { success: false, message: MSG_SUPABASE_NOT_CONFIGURED };
    }
    setState((s) => ({ ...s, isLoading: true }));
    // Mark that login() will handle the profile fetch so onAuthStateChange
    // can skip its concurrent SIGNED_IN fetch.
    isLoginFetchingRef.current = true;
    const { data: { session }, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      isLoginFetchingRef.current = false;
      setState((s) => ({ ...s, isLoading: false }));
      return { success: false, message: mapAuthError(error.message) };
    }
    // Fetch profile now so state is fully populated before we return — the
    // caller (and ProtectedRoute) can rely on it without waiting for
    // onAuthStateChange to fire.
    if (session?.user) {
      const profile = await fetchProfile(session.user.id);
      setState(buildState(session.user, profile, session));
    }
    isLoginFetchingRef.current = false;
    return { success: true };
  };

  const register = async ({ email, password, fullname, position, organization }: RegisterData) => {
    if (!isSupabaseConfigured) {
      return { success: false, message: MSG_SUPABASE_NOT_CONFIGURED };
    }
    setState((s) => ({ ...s, isLoading: true }));

    // Pass all user data as metadata so the SECURITY DEFINER trigger can
    // persist it into the profiles table even when there is no active session
    // (e.g. when email confirmation is enabled).
    // The trigger also handles first-user → admin promotion server-side,
    // avoiding the RLS issue where a pre-auth count always returns 0.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          fullname,
          position: position || null,
          organization: organization || null,
        },
      },
    });
    if (error || !data.user) {
      setState((s) => ({ ...s, isLoading: false }));
      return { success: false, message: error?.message || 'ลงทะเบียนไม่สำเร็จ' };
    }

    // The trigger already created the profile row with all fields.
    // Attempt a client-side upsert as a safety fallback (may be blocked by
    // RLS when email confirmation is pending – that is fine).
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      fullname,
      position: position || null,
      organization: organization || null,
    });
    if (profileError) {
      // Non-critical: trigger already handled the insert.
      console.warn('register: profile fallback upsert skipped:', profileError.message);
    }

    // Check whether the trigger promoted this user to admin.
    // This may fail if RLS blocks the read (e.g. email confirmation pending)
    // – in that case we fall back to the generic pending message.
    let isFirstUser = false;
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();
    if (profile?.role === 'admin') {
      isFirstUser = true;
    }

    setState((s) => ({ ...s, isLoading: false }));
    return {
      success: true,
      message: isFirstUser
        ? 'ลงทะเบียนสำเร็จ — บัญชีนี้ได้รับสิทธิ์ผู้ดูแลระบบโดยอัตโนมัติ'
        : 'ลงทะเบียนสำเร็จ — รอการอนุมัติจากผู้ดูแลระบบ',
    };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange will clear state
  };

  const updateProfile = async (data: Partial<Pick<Profile, 'fullname' | 'position' | 'organization'>>) => {
    if (!state.user) throw new Error('ไม่พบข้อมูลผู้ใช้');
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', state.user.id);
    if (error) throw new Error(error.message);
    await refreshProfile();
  };

  const refreshProfile = useCallback(async () => {
    const user = userRef.current;
    if (!user) return;
    const profile = await fetchProfile(user.id);
    setState((s) => buildState(s.user, profile, s.session));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateProfile, refreshProfile, retryInit }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
