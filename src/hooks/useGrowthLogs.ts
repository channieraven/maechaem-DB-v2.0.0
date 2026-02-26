import { useEffect, useState } from 'react';
import supabase from '../lib/supabase';
import type { GrowthLog, GrowthDbh, GrowthBamboo, GrowthBanana } from '../lib/database.types';
import type { TreeWithDetails } from './useTrees';

export interface GrowthLogFull extends GrowthLog {
  tree: TreeWithDetails;
  recorder: { fullname: string } | null;
  growth_dbh?: GrowthDbh | null;
  growth_bamboo?: GrowthBamboo | null;
  growth_banana?: GrowthBanana | null;
}

export function useGrowthLogs(plotId?: string) {
  const [logs, setLogs] = useState<GrowthLogFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!plotId) { setIsLoading(false); return; }
    let mounted = true;

    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from('growth_logs')
        .select(`
          *,
          tree:trees!inner (
            *,
            plot:plots!inner ( id, plot_code, name_short, owner_name ),
            species:species!inner ( species_code, name_th, name_sci, plant_category, hex_color )
          ),
          recorder:profiles ( fullname ),
          growth_dbh(*),
          growth_bamboo(*),
          growth_banana(*)
        `)
        .eq('tree.plot_id', plotId)
        .order('survey_date', { ascending: false });

      if (!mounted) return;
      if (err) { setError(err.message); setIsLoading(false); return; }
      setLogs((data ?? []) as GrowthLogFull[]);
      setIsLoading(false);
    };

    fetchLogs();
    return () => { mounted = false; };
  }, [plotId]);

  return { logs, isLoading, error };
}

/** Fetch all growth logs for a specific tree (for detail chart) */
export function useTreeGrowthLogs(treeId?: string) {
  const [logs, setLogs] = useState<GrowthLogFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!treeId) { setIsLoading(false); return; }
    let mounted = true;

    const fetchLogs = async () => {
      setIsLoading(true);
      const { data, error: err } = await supabase
        .from('growth_logs')
        .select(`
          *,
          tree:trees!inner (
            *,
            plot:plots!inner ( id, plot_code, name_short, owner_name ),
            species:species!inner ( species_code, name_th, name_sci, plant_category, hex_color )
          ),
          recorder:profiles ( fullname ),
          growth_dbh(*),
          growth_bamboo(*),
          growth_banana(*)
        `)
        .eq('tree_id', treeId)
        .order('survey_date', { ascending: true });

      if (!mounted) return;
      if (err) { setError(err.message); setIsLoading(false); return; }
      setLogs((data ?? []) as GrowthLogFull[]);
      setIsLoading(false);
    };

    fetchLogs();
    return () => { mounted = false; };
  }, [treeId]);

  return { logs, isLoading, error };
}
