-- ============================================================
-- Maechaem DB v2 – Ensure handle_new_user trigger is installed
-- Apply after 00005_admin_auto_approve.sql
--
-- Idempotent: safe to run multiple times.
--
-- Problem: migration 00003 recreated only the trigger FUNCTION
-- but not the trigger itself; this migration does both so that
-- every sign-up reliably inserts a row into public.profiles.
-- ============================================================

-- 1. Recreate the trigger function (CREATE OR REPLACE is safe).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_first BOOLEAN;
  _role     public.user_role;
BEGIN
  -- If no profiles exist yet, the first registrant becomes admin automatically.
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles LIMIT 1) INTO _is_first;
  _role := CASE WHEN _is_first THEN 'admin'::public.user_role
                               ELSE 'pending'::public.user_role END;

  INSERT INTO public.profiles (id, email, fullname, position, organization, role, approved)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'fullname'), ''), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'position'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'organization'), ''),
    _role,
    _is_first
  )
  ON CONFLICT (id) DO UPDATE SET
    fullname     = EXCLUDED.fullname,
    position     = EXCLUDED.position,
    organization = EXCLUDED.organization,
    role         = EXCLUDED.role,
    approved     = EXCLUDED.approved;
  RETURN NEW;
END;
$$;

-- 2. Drop any existing trigger and recreate it.
--    This ensures the trigger exists even if it was accidentally dropped
--    or was never created (e.g. only 00003 was re-applied manually).
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
