-- Live admin updates use a PRIVATE Supabase Realtime broadcast channel ("admin-events").
-- Only signed-in, active admins may listen; browsers can never publish (no INSERT policy) — the server
-- publishes with the service key. Skipped automatically on databases without Supabase's realtime schema.

CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public."AdminUser" a WHERE a.id = auth.uid() AND a."isActive")
$$;

REVOKE ALL ON FUNCTION public.is_active_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_active_admin() TO authenticated;

DO $$
BEGIN
  IF to_regclass('realtime.messages') IS NOT NULL THEN
    DROP POLICY IF EXISTS "active admins can listen to admin-events" ON realtime.messages;
    CREATE POLICY "active admins can listen to admin-events"
      ON realtime.messages
      FOR SELECT
      TO authenticated
      USING (realtime.topic() = 'admin-events' AND public.is_active_admin());
  END IF;
END
$$;
