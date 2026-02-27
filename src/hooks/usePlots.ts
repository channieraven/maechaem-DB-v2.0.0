import { useEffect, useState } from 'react';
import supabase from '../lib/supabase';
import type { Plot } from '../lib/database.types';

interface PlotSummary extends Plot {
  tree_count: number;
  alive_count: number;
  latest_survey_date: string | null;
}

export function usePlots() {
  const [plots, setPlots] = useState<PlotSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchPlots = async () => {
      setIsLoading(true);
      setError(null);

      // Try the server-side RPC first (single fast query).
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_plot_summaries');

      if (!mounted) return;

      if (!rpcError && rpcData) {
        setPlots(
          (rpcData as any[]).map((r) => ({
            ...r,
            tree_count: Number(r.tree_count),
            alive_count: Number(r.alive_count),
          })),
        );
        setIsLoading(false);
        return;
      }

      // Fallback: RPC not yet deployed – use the original two-query approach.
      console.warn('get_plot_summaries RPC unavailable, falling back:', rpcError?.message);

      const { data: plotData, error: plotError } = await supabase
        .from('plots')
        .select('*')
        .order('plot_code');

      if (!mounted) return;
      if (plotError) {
        setError(plotError.message);
        setIsLoading(false);
        return;
      }

      const { data: treeData } = await supabase
        .from('trees')
        .select('id, plot_id, growth_logs(status, survey_date)');

      if (!mounted) return;

      const summaries: PlotSummary[] = (plotData ?? []).map((plot) => {
        const plotTrees = (treeData ?? []).filter((t: any) => t.plot_id === plot.id);
        const tree_count = plotTrees.length;

        let alive_count = 0;
        let latest_survey_date: string | null = null;

        for (const tree of plotTrees) {
          const logs = (tree as any).growth_logs ?? [];
          if (logs.length > 0) {
            const latestLog = [...logs].sort((a: any, b: any) =>
              b.survey_date.localeCompare(a.survey_date),
            )[0];
            if (latestLog.status === 'alive') alive_count++;
            if (!latest_survey_date || latestLog.survey_date > latest_survey_date) {
              latest_survey_date = latestLog.survey_date;
            }
          }
        }

        return { ...plot, tree_count, alive_count, latest_survey_date };
      });

      if (mounted) {
        setPlots(summaries);
        setIsLoading(false);
      }
    };

    fetchPlots();
    return () => { mounted = false; };
  }, []);

  return { plots, isLoading, error };
}
