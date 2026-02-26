import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import supabase from '../lib/supabase';
import {
  getPendingActions,
  removePendingAction,
  getPendingCount,
  clearSyncedActions,
  type PendingAction,
} from '../lib/offlineQueue';

// ── Types ────────────────────────────────────────────────────────────────────

type SyncStatus = 'idle' | 'syncing' | 'error';

interface OfflineContextType {
  isOnline: boolean;
  syncStatus: SyncStatus;
  pendingCount: number;
  syncNow: () => Promise<void>;
}

// ── Context ──────────────────────────────────────────────────────────────────

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [pendingCount, setPendingCount] = useState(getPendingCount);

  // Track online/offline transitions
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Process a single pending action against Supabase
  const processPendingAction = async (action: PendingAction): Promise<boolean> => {
    try {
      // Insert / upsert the parent row
      let parentId: string | null = null;

      if (action.action === 'insert') {
        // Attach synced_from to prevent duplicate on retry
        const rowData = { ...action.data, synced_from: `offline_${action.id}` };
        const { data, error } = await supabase
          .from(action.table as any)
          .insert(rowData)
          .select('id')
          .single();
        if (error) {
          // Duplicate: unique constraint means already synced — still remove from queue
          if (error.code === '23505') {
            removePendingAction(action.id);
            return true;
          }
          console.error(`Sync insert error (${action.table}):`, error.message);
          return false;
        }
        parentId = (data as any)?.id ?? null;
      } else {
        const { id, ...rest } = action.data as Record<string, unknown>;
        const { error } = await supabase
          .from(action.table as any)
          .update(rest)
          .eq('id', id);
        if (error) {
          console.error(`Sync update error (${action.table}):`, error.message);
          return false;
        }
      }

      // Insert child row if present (e.g. growth_dbh, growth_bamboo, growth_banana)
      if (action.childTable && action.childData && parentId) {
        const childRow = { ...action.childData, growth_log_id: parentId };
        const { error: childError } = await supabase
          .from(action.childTable as any)
          .insert(childRow);
        if (childError && childError.code !== '23505') {
          console.error(`Sync child insert error (${action.childTable}):`, childError.message);
          return false;
        }
      }

      removePendingAction(action.id);
      return true;
    } catch (err) {
      console.error('processPendingAction unexpected error:', err);
      return false;
    }
  };

  const syncNow = useCallback(async () => {
    if (!isOnline) return;
    const actions = getPendingActions().filter((a) => !a.synced);
    if (actions.length === 0) return;

    setSyncStatus('syncing');
    let anyFailed = false;

    for (const action of actions) {
      const ok = await processPendingAction(action);
      if (!ok) anyFailed = true;
    }

    clearSyncedActions();
    setPendingCount(getPendingCount());
    setSyncStatus(anyFailed ? 'error' : 'idle');
  }, [isOnline]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && getPendingCount() > 0) {
      syncNow();
    }
  }, [isOnline, syncNow]);

  // Refresh badge whenever localStorage changes (same tab actions)
  useEffect(() => {
    const refreshCount = () => setPendingCount(getPendingCount());
    window.addEventListener('storage', refreshCount);
    // Also poll every 30 s so same-tab adds are reflected
    const interval = setInterval(refreshCount, 30_000);
    return () => {
      window.removeEventListener('storage', refreshCount);
      clearInterval(interval);
    };
  }, []);

  return (
    <OfflineContext.Provider value={{ isOnline, syncStatus, pendingCount, syncNow }}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline must be used within an OfflineProvider');
  return ctx;
};
