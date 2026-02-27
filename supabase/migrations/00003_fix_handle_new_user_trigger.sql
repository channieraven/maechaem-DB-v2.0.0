-- ============================================================
-- Maechaem DB v2 – Fix handle_new_user trigger
-- Apply after 00002_rls_policies.sql
--
-- Fixes:
--   1. Reads fullname, position, organization from user metadata
--   2. First registered user is automatically promoted to admin
--   3. Uses ON CONFLICT DO UPDATE so data is always persisted
-- ============================================================

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
    COALESCE(NEW.raw_user_meta_data->>'fullname', ''),
    NEW.raw_user_meta_data->>'position',
    NEW.raw_user_meta_data->>'organization',
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
