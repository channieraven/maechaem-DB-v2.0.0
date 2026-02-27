-- ============================================================
-- Maechaem DB v2 – Row Level Security Policies
-- Apply after 00001_initial_schema.sql
-- ============================================================

-- ── profiles ──────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can read their own profile
CREATE POLICY "profiles: owner read"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "profiles: admin read all"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Owner can update own non-sensitive fields
CREATE POLICY "profiles: owner update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can update any profile (for approval / role changes)
CREATE POLICY "profiles: admin update all"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Allow insert from authenticated users (upsert during registration)
CREATE POLICY "profiles: authenticated insert"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ── plots ─────────────────────────────────────────────────────
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;

-- All authenticated & approved users can read plots
CREATE POLICY "plots: approved read"
  ON public.plots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.approved = true
    )
  );

-- Write-roles (staff, researcher, admin) can insert/update plots
CREATE POLICY "plots: writer insert"
  ON public.plots FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('staff','researcher','admin')
    )
  );

CREATE POLICY "plots: writer update"
  ON public.plots FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('staff','researcher','admin')
    )
  );

-- ── species ───────────────────────────────────────────────────
ALTER TABLE public.species ENABLE ROW LEVEL SECURITY;

CREATE POLICY "species: approved read"
  ON public.species FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.approved = true
    )
  );

CREATE POLICY "species: admin write"
  ON public.species FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- ── trees ─────────────────────────────────────────────────────
ALTER TABLE public.trees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trees: approved read"
  ON public.trees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.approved = true
    )
  );

CREATE POLICY "trees: writer insert"
  ON public.trees FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('staff','researcher','admin')
    )
  );

CREATE POLICY "trees: writer update"
  ON public.trees FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('staff','researcher','admin')
    )
  );

-- ── growth_logs ───────────────────────────────────────────────
ALTER TABLE public.growth_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "growth_logs: approved read"
  ON public.growth_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.approved = true
    )
  );

CREATE POLICY "growth_logs: writer insert"
  ON public.growth_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('staff','researcher','admin')
    )
  );

CREATE POLICY "growth_logs: writer update"
  ON public.growth_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('staff','researcher','admin')
    )
  );

-- ── growth_dbh / growth_bamboo / growth_banana ────────────────
ALTER TABLE public.growth_dbh    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_bamboo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_banana ENABLE ROW LEVEL SECURITY;

CREATE POLICY "growth_dbh: approved read"
  ON public.growth_dbh FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.approved = true
    )
  );

CREATE POLICY "growth_dbh: writer write"
  ON public.growth_dbh FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('staff','researcher','admin')
    )
  );

CREATE POLICY "growth_bamboo: approved read"
  ON public.growth_bamboo FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.approved = true
    )
  );

CREATE POLICY "growth_bamboo: writer write"
  ON public.growth_bamboo FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('staff','researcher','admin')
    )
  );

CREATE POLICY "growth_banana: approved read"
  ON public.growth_banana FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.approved = true
    )
  );

CREATE POLICY "growth_banana: writer write"
  ON public.growth_banana FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('staff','researcher','admin')
    )
  );

-- ── plot_images ───────────────────────────────────────────────
ALTER TABLE public.plot_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plot_images: approved read"
  ON public.plot_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.approved = true
    )
  );

CREATE POLICY "plot_images: writer write"
  ON public.plot_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('staff','researcher','admin')
    )
  );

-- ── plot_spacing ──────────────────────────────────────────────
ALTER TABLE public.plot_spacing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plot_spacing: approved read"
  ON public.plot_spacing FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.approved = true
    )
  );

CREATE POLICY "plot_spacing: writer write"
  ON public.plot_spacing FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('staff','researcher','admin')
    )
  );

-- ── comments ──────────────────────────────────────────────────
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments: approved read"
  ON public.comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.approved = true
    )
  );

CREATE POLICY "comments: writer insert"
  ON public.comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('staff','researcher','admin')
    )
  );

-- ── notifications ─────────────────────────────────────────────
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications: owner read"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notifications: owner update"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Grant execute on helper functions to authenticated role
GRANT EXECUTE ON FUNCTION public.handle_new_user()          TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_trees_with_latlng(UUID) TO authenticated;
