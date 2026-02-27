import React, { createContext, useContext, useEffect, useState } from 'react';
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
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Pick<Profile, 'fullname' | 'position' | 'organization'>>) => Promise<void>;
  refreshProfile: () => Promise<void>;
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

/** Map raw Supabase error messages to user-friendly Thai messages. */
function mapAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes('database error querying schema') ||
    lower.includes('error querying schema')
  ) {
    return MSG_DB_SCHEMA_ERROR;
  }
  if (lower.includes('email rate limit exceeded') || lower.includes('rate limit')) {
    return 'ส่งอีเมลบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง';
  }
  if (lower.includes('user already registered')) {
    return 'อีเมลนี้ถูกใช้ลงทะเบียนแล้ว';
  }
  if (lower.includes('invalid email')) {
    return 'รูปแบบอีเมลไม่ถูกต้อง';
  }
  if (lower.includes('password') && lower.includes('weak')) {
    return 'รหัสผ่านไม่ปลอดภัยเพียงพอ กรุณาใช้รหัสผ่านที่ซับซ้อนกว่านี้';
  }
  return message;
}

function buildState(user: User | null, profile: Profile | null, session: Session | null): AuthState {
  const role = profile?.role ?? null;
  return {
    user,
    profile,
    session,
    isLoading: false,
    isApproved: profile?.approved ?? false,
    role,
    canWrite: role !== null && WRITE_ROLES.includes(role),
    isAdmin: role === 'admin',
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
  });

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
    // Tracks whether login() already populated the state so onAuthStateChange
    // can skip the redundant fetchProfile call.
    let profileReady = false;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (mounted) {
          profileReady = true;
          setState(buildState(session.user, profile, session));
        }
      } else {
        setState((s) => ({ ...s, isLoading: false }));
      }
    };

    init();

    // Listen for auth changes (sign-in, sign-out, token refresh).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          // Skip the fetch when login() already set the state.
          if (profileReady) {
            profileReady = false;
            return;
          }
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
  }, []);

  const login = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { success: false, message: MSG_SUPABASE_NOT_CONFIGURED };
    }
    setState((s) => ({ ...s, isLoading: true }));
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setState((s) => ({ ...s, isLoading: false }));
      return { success: false, message: mapAuthError(error.message) };
    }
    // Fetch profile immediately so the state is ready before navigating.
    // This avoids the delay from waiting for onAuthStateChange to fire.
    if (data.session?.user) {
      const profile = await fetchProfile(data.session.user.id);
      setState(buildState(data.session.user, profile, data.session));
    }
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
          position: position ?? null,
          organization: organization ?? null,
        },
      },
    });
    if (error || !data.user) {
      setState((s) => ({ ...s, isLoading: false }));
      return { success: false, message: mapAuthError(error?.message || 'ลงทะเบียนไม่สำเร็จ') };
    }

    // The trigger already created the profile row with all fields.
    // Attempt a client-side upsert as a safety fallback (may be blocked by
    // RLS when email confirmation is pending – that is fine).
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      fullname,
      position: position ?? null,
      organization: organization ?? null,
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

  const refreshProfile = async () => {
    if (!state.user) return;
    const profile = await fetchProfile(state.user.id);
    setState((s) => buildState(s.user, profile, s.session));
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
