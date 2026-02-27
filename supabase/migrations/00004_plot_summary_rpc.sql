-- ============================================================
-- Maechaem DB v2 – Plot summary RPC
-- Apply after 00003
--
-- Replaces the heavy client-side query that fetched every tree
-- row + nested growth_logs just to compute counts and dates.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_plot_summaries()
RETURNS TABLE (
  id               UUID,
  plot_code        TEXT,
  name_short       TEXT,
  owner_name       TEXT,
  group_number     INTEGER,
  area_sq_m        NUMERIC,
  tambon           TEXT,
  elevation_m      NUMERIC,
  boundary_geojson TEXT,
  note             TEXT,
  created_at       TIMESTAMPTZ,
  tree_count       BIGINT,
  alive_count      BIGINT,
  latest_survey_date DATE
)
LANGUAGE sql
STABLE
SECURITY INVOKER
AS $$
  SELECT
    p.*,
    COALESCE(s.tree_count, 0)        AS tree_count,
    COALESCE(s.alive_count, 0)       AS alive_count,
    s.latest_survey_date
  FROM public.plots p
  LEFT JOIN LATERAL (
    SELECT
      COUNT(DISTINCT t.id)  AS tree_count,
      COUNT(DISTINCT t.id) FILTER (WHERE latest.status = 'alive') AS alive_count,
      MAX(latest.survey_date) AS latest_survey_date
    FROM public.trees t
    LEFT JOIN LATERAL (
      SELECT gl.status, gl.survey_date
      FROM public.growth_logs gl
      WHERE gl.tree_id = t.id
      ORDER BY gl.survey_date DESC
      LIMIT 1
    ) latest ON true
    WHERE t.plot_id = p.id
  ) s ON true
  ORDER BY p.plot_code;
$$;

GRANT EXECUTE ON FUNCTION public.get_plot_summaries() TO authenticated;
