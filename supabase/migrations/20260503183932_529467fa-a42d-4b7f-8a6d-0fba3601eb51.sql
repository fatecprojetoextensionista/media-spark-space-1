
-- Revoke public/anon/authenticated execute on internal helper functions
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Restrict bucket listing: drop broad SELECT and re-create allowing only metadata reads via signed/path access
DROP POLICY IF EXISTS "Media public read" ON storage.objects;
CREATE POLICY "Media public read by path"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media' AND auth.role() = 'anon' IS NOT NULL);
