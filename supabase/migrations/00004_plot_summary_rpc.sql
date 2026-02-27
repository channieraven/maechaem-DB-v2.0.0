-- ============================================================
-- Maechaem DB v2 – Plot summary RPC
-- Apply after 00003_fix_handle_new_user_trigger.sql
--
-- Creates get_plot_summaries() which computes tree_count,
-- alive_count and latest_survey_date for every plot in a
-- single SQL query using LATERAL JOIN, replacing the previous
-- two-query + client-side aggregation pattern in usePlots.ts.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_plot_summaries()
RETURNS TABLE (
  id                 UUID,
  plot_code          TEXT,
  name_short         TEXT,
  owner_name         TEXT,
  group_number       INTEGER,
  area_sq_m          NUMERIC,
  tambon             TEXT,
  elevation_m        NUMERIC,
  boundary_geojson   TEXT,
  note               TEXT,
  created_at         TIMESTAMPTZ,
  tree_count         BIGINT,
  alive_count        BIGINT,
  latest_survey_date DATE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.plot_code,
    p.name_short,
    p.owner_name,
    p.group_number,
    p.area_sq_m,
    p.tambon,
    p.elevation_m,
    p.boundary_geojson,
    p.note,
    p.created_at,
    COALESCE(agg.tree_count,  0) AS tree_count,
    COALESCE(agg.alive_count, 0) AS alive_count,
    agg.latest_survey_date
  FROM public.plots p
  LEFT JOIN LATERAL (
    SELECT
      COUNT(t.id)                                               AS tree_count,
      COUNT(t.id) FILTER (WHERE latest_log.status = 'alive')   AS alive_count,
      MAX(latest_log.survey_date)                               AS latest_survey_date
    FROM public.trees t
    LEFT JOIN LATERAL (
      SELECT gl.status, gl.survey_date
      FROM public.growth_logs gl
      WHERE gl.tree_id = t.id
      ORDER BY gl.survey_date DESC, gl.created_at DESC
      LIMIT 1
    ) latest_log ON true
    WHERE t.plot_id = p.id
  ) agg ON true
  ORDER BY p.plot_code;
$$;

-- Allow authenticated users to call the function
GRANT EXECUTE ON FUNCTION public.get_plot_summaries() TO authenticated;
