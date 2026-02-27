-- ============================================================
-- Maechaem DB v2 – Auto-approve any non-pending role
-- Apply after 00006_ensure_handle_new_user_trigger.sql
--
-- Extends the previous admin-only auto-approve trigger so that
-- ANY role change away from 'pending' sets approved=true, and
-- reverting to 'pending' sets approved=false.
-- This fixes the bug where admins could assign a role like
-- 'staff' or 'researcher' but the user remained unapproved.
-- ============================================================

-- 1. Back-fill: approve every existing user whose role is not 'pending'.
UPDATE public.profiles
SET approved = true
WHERE role <> 'pending' AND approved = false;

-- 2. Replace the trigger function to handle all roles, not just 'admin'.
CREATE OR REPLACE FUNCTION public.auto_approve_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Any non-pending role is automatically approved;
  -- reverting to pending revokes approval.
  NEW.approved := (NEW.role <> 'pending');
  RETURN NEW;
END;
$$;

-- The existing trigger (trg_auto_approve_admin) already fires
-- BEFORE INSERT OR UPDATE OF role, so no trigger recreation needed.
