// Offline queue — persists pending Supabase inserts/updates in localStorage
// so they can be replayed once the device comes back online.

import type { PlantCategory } from './database.types';

const QUEUE_KEY = 'maechaem_offline_queue_v2';

export type OfflineAction = 'insert' | 'update';

export interface PendingAction {
  id: string;                          // unique — used as synced_from value
  table: string;                       // 'growth_logs', etc.
  action: OfflineAction;
  data: Record<string, unknown>;
  childTable?: string;                 // 'growth_dbh' | 'growth_bamboo' | 'growth_banana'
  childData?: Record<string, unknown>;
  plantCategory?: PlantCategory;       // for routing child insert
  timestamp: number;
  synced: boolean;
}

/** Return all queued actions (oldest first). */
export function getPendingActions(): PendingAction[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

/** Add a new action to the queue and return its id. */
export function addPendingAction(
  entry: Omit<PendingAction, 'id' | 'timestamp' | 'synced'>
): string {
  // crypto.randomUUID() is available in all modern browsers; the fallback combines
  // a millisecond timestamp with random base-36 digits and is sufficient for the
  // small local queue (uniqueness collisions are extremely unlikely in practice).
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const actions = getPendingActions();
  actions.push({ id, timestamp: Date.now(), synced: false, ...entry });
  localStorage.setItem(QUEUE_KEY, JSON.stringify(actions));
  return id;
}

/** Mark an action as synced (keep for dedup), or remove it entirely. */
export function removePendingAction(id: string): void {
  const actions = getPendingActions().filter((a) => a.id !== id);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(actions));
}

/** Number of un-synced items waiting. */
export function getPendingCount(): number {
  return getPendingActions().filter((a) => !a.synced).length;
}

/** Clear all synced entries from the queue (housekeeping). */
export function clearSyncedActions(): void {
  const actions = getPendingActions().filter((a) => !a.synced);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(actions));
}
