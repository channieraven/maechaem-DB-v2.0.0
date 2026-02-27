import { useEffect, useState } from 'react';
import supabase from '../lib/supabase';
import type { Database, Plot } from '../lib/database.types';

type PlotSummaryRow = Database['public']['Functions']['get_plot_summaries']['Returns'][number];

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

      // ── Fast path: server-side aggregation via RPC ──────────────────────────
      // get_plot_summaries() uses a LATERAL JOIN to compute tree_count,
      // alive_count and latest_survey_date in a single SQL query.
      // Falls back to client-side aggregation when the function is not yet
      // available (PGRST202 = function not found — migration not applied).
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_plot_summaries');

      if (!mounted) return;

      if (!rpcError) {
        setPlots(
          (rpcData ?? []).map((row: PlotSummaryRow) => ({
            ...row,
            tree_count: Number(row.tree_count ?? 0),
            alive_count: Number(row.alive_count ?? 0),
            latest_survey_date: row.latest_survey_date ?? null,
          }))
        );
        setIsLoading(false);
        return;
      }

      // Only fall back for "function not found"; surface other errors.
      if (rpcError.code !== 'PGRST202') {
        setError(rpcError.message);
        setIsLoading(false);
        return;
      }

      // ── Fallback: client-side aggregation (pre-migration) ──────────────────
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

      // Fetch tree counts and survival data per plot
      const { data: treeData } = await supabase
        .from('trees')
        .select('id, plot_id, growth_logs(status, survey_date)', { count: 'exact' });

      // Build summary per plot
      const summaries: PlotSummary[] = (plotData ?? []).map((plot) => {
        const plotTrees = (treeData ?? []).filter((t: any) => t.plot_id === plot.id);
        const tree_count = plotTrees.length;

        let alive_count = 0;
        let latest_survey_date: string | null = null;

        for (const tree of plotTrees) {
          const logs = (tree as any).growth_logs ?? [];
          if (logs.length > 0) {
            const latestLog = [...logs].sort((a: any, b: any) =>
              b.survey_date.localeCompare(a.survey_date)
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
