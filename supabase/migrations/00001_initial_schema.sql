-- ============================================================
-- Maechaem DB v2 – Initial Schema
-- Apply once against your Supabase project:
--   Supabase Dashboard → SQL Editor → paste & run
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- ── Enum types ────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.plant_category   AS ENUM ('forest','rubber','bamboo','fruit','banana');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.tree_status      AS ENUM ('alive','dead','missing');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.user_role        AS ENUM ('pending','staff','researcher','executive','external','admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.image_type       AS ENUM ('plan_pre_1','plan_pre_2','plan_post_1','gallery');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.gallery_category AS ENUM ('tree','soil','atmosphere','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── profiles ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        TEXT        NOT NULL,
  fullname     TEXT        NOT NULL DEFAULT '',
  position     TEXT,
  organization TEXT,
  role         public.user_role NOT NULL DEFAULT 'pending',
  approved     BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── plots ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.plots (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plot_code        TEXT        NOT NULL UNIQUE,
  name_short       TEXT        NOT NULL,
  owner_name       TEXT        NOT NULL DEFAULT '',
  group_number     INTEGER     NOT NULL DEFAULT 0,
  area_sq_m        NUMERIC,
  tambon           TEXT,
  elevation_m      NUMERIC,
  boundary_geojson TEXT,
  note             TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── species ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.species (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  species_code   TEXT        NOT NULL UNIQUE,
  species_group  CHAR(1)     NOT NULL CHECK (species_group IN ('A','B')),
  group_label    TEXT        NOT NULL DEFAULT '',
  plant_category public.plant_category NOT NULL,
  name_th        TEXT        NOT NULL,
  name_en        TEXT,
  name_sci       TEXT,
  hex_color      CHAR(6)     NOT NULL DEFAULT '2d5a27',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── trees ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.trees (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tree_code    TEXT        NOT NULL UNIQUE,
  plot_id      UUID        NOT NULL REFERENCES public.plots(id) ON DELETE CASCADE,
  species_id   UUID        NOT NULL REFERENCES public.species(id),
  tree_number  INTEGER     NOT NULL,
  tag_label    TEXT,
  row_main     TEXT,
  row_sub      TEXT,
  utm_x        NUMERIC,
  utm_y        NUMERIC,
  geom         TEXT,
  grid_spacing NUMERIC,
  note         TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── growth_logs ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.growth_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tree_id     UUID        NOT NULL REFERENCES public.trees(id) ON DELETE CASCADE,
  survey_date DATE        NOT NULL,
  recorder_id UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  height_m    NUMERIC,
  status      public.tree_status,
  flowering   BOOLEAN,
  note        TEXT,
  synced_from TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── growth_dbh ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.growth_dbh (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  growth_log_id UUID    NOT NULL REFERENCES public.growth_logs(id) ON DELETE CASCADE,
  dbh_cm        NUMERIC NOT NULL
);

-- ── growth_bamboo ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.growth_bamboo (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  growth_log_id UUID    NOT NULL REFERENCES public.growth_logs(id) ON DELETE CASCADE,
  culm_count    INTEGER,
  dbh_1_cm      NUMERIC,
  dbh_2_cm      NUMERIC,
  dbh_3_cm      NUMERIC
);

-- ── growth_banana ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.growth_banana (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  growth_log_id   UUID    NOT NULL REFERENCES public.growth_logs(id) ON DELETE CASCADE,
  total_plants    INTEGER,
  plants_1yr      INTEGER,
  yield_bunches   INTEGER,
  yield_hands     INTEGER,
  price_per_hand  NUMERIC
);

-- ── plot_images ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.plot_images (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plot_id          UUID        NOT NULL REFERENCES public.plots(id) ON DELETE CASCADE,
  image_type       public.image_type NOT NULL,
  gallery_category public.gallery_category,
  legacy_url       TEXT,
  storage_path     TEXT,
  description      TEXT,
  uploaded_by      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  upload_date      DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── plot_spacing ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.plot_spacing (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plot_id       UUID        NOT NULL REFERENCES public.plots(id) ON DELETE CASCADE,
  avg_spacing   NUMERIC,
  min_spacing   NUMERIC,
  max_spacing   NUMERIC,
  tree_count    INTEGER,
  note          TEXT,
  measured_date DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── comments ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  growth_log_id UUID        NOT NULL REFERENCES public.growth_logs(id) ON DELETE CASCADE,
  author_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body          TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── notifications ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message    TEXT        NOT NULL,
  read       BOOLEAN     NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Trigger: auto-create profile on sign-up ───────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, fullname, role, approved)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'fullname', ''),
    'pending',
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Helper: get trees with lat/lng (UTM → WGS84 zone 47N) ─────
CREATE OR REPLACE FUNCTION public.get_trees_with_latlng(p_plot_id UUID)
RETURNS TABLE (
  id           UUID,
  tree_code    TEXT,
  plot_id      UUID,
  species_id   UUID,
  tree_number  INTEGER,
  tag_label    TEXT,
  row_main     TEXT,
  row_sub      TEXT,
  utm_x        NUMERIC,
  utm_y        NUMERIC,
  geom         TEXT,
  grid_spacing NUMERIC,
  note         TEXT,
  created_at   TIMESTAMPTZ,
  lat          DOUBLE PRECISION,
  lng          DOUBLE PRECISION
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    t.*,
    ST_Y(ST_Transform(ST_SetSRID(ST_MakePoint(t.utm_x, t.utm_y), 32647), 4326)) AS lat,
    ST_X(ST_Transform(ST_SetSRID(ST_MakePoint(t.utm_x, t.utm_y), 32647), 4326)) AS lng
  FROM public.trees t
  WHERE t.plot_id = p_plot_id
    AND t.utm_x IS NOT NULL
    AND t.utm_y IS NOT NULL;
$$;
