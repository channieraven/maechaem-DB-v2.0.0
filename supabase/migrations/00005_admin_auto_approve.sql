-- ============================================================
-- Maechaem DB v2 – Ensure admins are always approved
-- Apply after 00004_plot_summary_rpc.sql
--
-- Fixes the issue where a user with role='admin' could be
-- stuck on the pending-approval page because their approved
-- column was false.
-- ============================================================

-- 1. Back-fill: set approved=true for any existing admin rows.
UPDATE public.profiles
SET approved = true
WHERE role = 'admin' AND approved = false;

-- 2. Trigger function: auto-set approved=true whenever role becomes 'admin'.
CREATE OR REPLACE FUNCTION public.auto_approve_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    NEW.approved := true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_approve_admin ON public.profiles;
CREATE TRIGGER trg_auto_approve_admin
  BEFORE INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.auto_approve_admin();
