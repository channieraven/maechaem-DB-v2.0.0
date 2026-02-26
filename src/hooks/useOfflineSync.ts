import { useCallback } from 'react';
import { useOffline } from '../contexts/OfflineContext';
import supabase from '../lib/supabase';
import { addPendingAction } from '../lib/offlineQueue';
import type { PlantCategory } from '../lib/database.types';

interface GrowthLogInsert {
  tree_id: string;
  survey_date: string;
  recorder_id: string | null;
  height_m: number | null;
  status: string | null;
  flowering: boolean | null;
  note: string | null;
  plantCategory: PlantCategory;
  // child data
  dbh_cm?: number | null;
  culm_count?: number | null;
  dbh_1_cm?: number | null;
  dbh_2_cm?: number | null;
  dbh_3_cm?: number | null;
  total_plants?: number | null;
  plants_1yr?: number | null;
  yield_bunches?: number | null;
  yield_hands?: number | null;
  price_per_hand?: number | null;
}

function getChildTable(plantCategory: PlantCategory): string | undefined {
  if (plantCategory === 'forest' || plantCategory === 'rubber' || plantCategory === 'fruit') return 'growth_dbh';
  if (plantCategory === 'bamboo') return 'growth_bamboo';
  if (plantCategory === 'banana') return 'growth_banana';
  return undefined;
}

function buildChildData(data: GrowthLogInsert): Record<string, unknown> | undefined {
  const { plantCategory } = data;
  if (plantCategory === 'forest' || plantCategory === 'rubber' || plantCategory === 'fruit') {
    return { dbh_cm: data.dbh_cm };
  }
  if (plantCategory === 'bamboo') {
    return {
      culm_count: data.culm_count,
      dbh_1_cm: data.dbh_1_cm,
      dbh_2_cm: data.dbh_2_cm,
      dbh_3_cm: data.dbh_3_cm,
    };
  }
  if (plantCategory === 'banana') {
    return {
      total_plants: data.total_plants,
      plants_1yr: data.plants_1yr,
      yield_bunches: data.yield_bunches,
      yield_hands: data.yield_hands,
      price_per_hand: data.price_per_hand,
    };
  }
  return undefined;
}

export function useOfflineSync() {
  const { isOnline, syncNow } = useOffline();

  /**
   * Submit a growth log with its plant-specific child.
   * When online: insert directly to Supabase.
   * When offline: queue for later sync.
   */
  const submitGrowthLog = useCallback(async (data: GrowthLogInsert): Promise<{ success: boolean; message?: string; queued?: boolean }> => {
    const parentData = {
      tree_id: data.tree_id,
      survey_date: data.survey_date,
      recorder_id: data.recorder_id,
      height_m: data.height_m,
      status: data.status,
      flowering: data.flowering,
      note: data.note,
    };
    const childTable = getChildTable(data.plantCategory);
    const childData = buildChildData(data);

    if (isOnline) {
      // Online path: insert directly
      const { data: newLog, error } = await supabase
        .from('growth_logs')
        .insert(parentData)
        .select('id')
        .single();

      if (error) return { success: false, message: error.message };

      if (childTable && childData && newLog?.id) {
        const { error: childError } = await supabase
          .from(childTable as any)
          .insert({ ...childData, growth_log_id: newLog.id });
        if (childError) return { success: false, message: childError.message };
      }

      return { success: true };
    } else {
      // Offline path: queue
      addPendingAction({
        table: 'growth_logs',
        action: 'insert',
        data: parentData,
        childTable,
        childData,
        plantCategory: data.plantCategory,
      });
      return { success: true, queued: true };
    }
  }, [isOnline]);

  return { submitGrowthLog, syncNow, isOnline };
}
