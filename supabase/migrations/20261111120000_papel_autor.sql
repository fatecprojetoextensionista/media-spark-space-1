DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'articles' LOOP
    EXECUTE format('DROP POLICY %I ON public.articles', pol.policyname);
  END LOOP;
END $$;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artigos publicados visiveis para todos"
  ON public.articles FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins gerenciam artigos"
  ON public.articles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Autores veem os proprios artigos"
  ON public.articles FOR SELECT
  TO authenticated
  USING (author_id = auth.uid() AND public.has_role(auth.uid(), 'editor'));

CREATE POLICY "Autores criam rascunhos"
  ON public.articles FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND status = 'draft'
    AND published_at IS NULL
    AND public.has_role(auth.uid(), 'editor')
  );

CREATE POLICY "Autores editam os proprios rascunhos"
  ON public.articles FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid() AND status = 'draft' AND public.has_role(auth.uid(), 'editor'))
  WITH CHECK (
    author_id = auth.uid()
    AND status = 'draft'
    AND published_at IS NULL
    AND public.has_role(auth.uid(), 'editor')
  );

CREATE POLICY "Autores apagam os proprios rascunhos"
  ON public.articles FOR DELETE
  TO authenticated
  USING (author_id = auth.uid() AND status = 'draft' AND public.has_role(auth.uid(), 'editor'));

DROP POLICY IF EXISTS "Autores enviam imagens" ON storage.objects;
CREATE POLICY "Autores enviam imagens"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] IN ('articles', 'authors')
    AND public.has_role(auth.uid(), 'editor')
  );

CREATE OR REPLACE FUNCTION public.admin_listar_usuarios()
RETURNS TABLE (
  user_id uuid,
  email text,
  display_name text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  roles text[]
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem listar usuários' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::text,
    (u.raw_user_meta_data ->> 'display_name')::text,
    u.created_at,
    u.last_sign_in_at,
    COALESCE(ARRAY(SELECT r.role::text FROM public.user_roles r WHERE r.user_id = u.id ORDER BY r.role::text), ARRAY[]::text[])
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_definir_papel(_user_id uuid, _role public.app_role, _ativo boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar papéis' USING ERRCODE = '42501';
  END IF;

  IF _role = 'admin' AND NOT _ativo AND _user_id = auth.uid() THEN
    RAISE EXCEPTION 'Você não pode remover o seu próprio papel de administrador';
  END IF;

  IF _ativo THEN
    INSERT INTO public.user_roles (user_id, role)
    SELECT _user_id, _role
    WHERE NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
  ELSE
    DELETE FROM public.user_roles WHERE user_id = _user_id AND role = _role;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_listar_usuarios() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_definir_papel(uuid, public.app_role, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_listar_usuarios() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_definir_papel(uuid, public.app_role, boolean) TO authenticated;
