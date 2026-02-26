import { useEffect, useState } from 'react';
import supabase from '../lib/supabase';
import type { Tree, Species, Plot } from '../lib/database.types';

export interface TreeWithDetails extends Tree {
  species: Pick<Species, 'species_code' | 'name_th' | 'name_sci' | 'plant_category' | 'hex_color'>;
  plot: Pick<Plot, 'id' | 'plot_code' | 'name_short' | 'owner_name'>;
  lat?: number | null;
  lng?: number | null;
}

export function useTrees(plotId?: string) {
  const [trees, setTrees] = useState<TreeWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!plotId) {
      setTrees([]);
      setIsLoading(false);
      return;
    }
    let mounted = true;

    const fetchTrees = async () => {
      setIsLoading(true);
      setError(null);

      // Try the helper RPC first (returns lat/lng from PostGIS geom)
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_trees_with_latlng', { p_plot_id: plotId });

      let baseRows: any[] = [];
      if (!rpcError && rpcData) {
        baseRows = rpcData;
      } else {
        // Fallback: plain query without coordinate conversion
        const { data, error: qError } = await supabase
          .from('trees')
          .select('*')
          .eq('plot_id', plotId)
          .order('tree_number');
        if (qError) {
          if (mounted) { setError(qError.message); setIsLoading(false); }
          return;
        }
        baseRows = data ?? [];
      }

      // Enrich with species + plot via joins
      const treeIds = baseRows.map((r: any) => r.id);
      if (treeIds.length === 0) {
        if (mounted) { setTrees([]); setIsLoading(false); }
        return;
      }

      const { data: enriched, error: enrichError } = await supabase
        .from('trees')
        .select(`
          *,
          species:species!inner ( species_code, name_th, name_sci, plant_category, hex_color ),
          plot:plots!inner ( id, plot_code, name_short, owner_name )
        `)
        .in('id', treeIds)
        .order('tree_number');

      if (!mounted) return;
      if (enrichError) { setError(enrichError.message); setIsLoading(false); return; }

      // Merge lat/lng from RPC result
      const latLngMap = Object.fromEntries(
        baseRows.map((r: any) => [r.id, { lat: r.lat ?? null, lng: r.lng ?? null }])
      );

      const result: TreeWithDetails[] = (enriched ?? []).map((t: any) => ({
        ...t,
        lat: latLngMap[t.id]?.lat ?? null,
        lng: latLngMap[t.id]?.lng ?? null,
      }));

      if (mounted) { setTrees(result); setIsLoading(false); }
    };

    fetchTrees();
    return () => { mounted = false; };
  }, [plotId]);

  return { trees, isLoading, error };
}

/** Fetch a single tree by tree_code */
export function useTree(treeCode?: string) {
  const [tree, setTree] = useState<TreeWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!treeCode) { setIsLoading(false); return; }
    let mounted = true;

    const fetch = async () => {
      setIsLoading(true);
      const { data, error: err } = await supabase
        .from('trees')
        .select(`
          *,
          species:species!inner ( species_code, name_th, name_sci, plant_category, hex_color ),
          plot:plots!inner ( id, plot_code, name_short, owner_name )
        `)
        .eq('tree_code', treeCode)
        .single();

      if (!mounted) return;
      if (err) { setError(err.message); setIsLoading(false); return; }
      setTree(data as TreeWithDetails);
      setIsLoading(false);
    };

    fetch();
    return () => { mounted = false; };
  }, [treeCode]);

  return { tree, isLoading, error };
}
