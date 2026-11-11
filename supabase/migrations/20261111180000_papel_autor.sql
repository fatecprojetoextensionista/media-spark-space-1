CREATE OR REPLACE FUNCTION public.tem_papel(_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role::text = _role
  )
$$;

REVOKE ALL ON FUNCTION public.tem_papel(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.tem_papel(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.pode_escrever()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role::text = 'bloqueado'
  )
$$;

REVOKE ALL ON FUNCTION public.pode_escrever() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.pode_escrever() TO authenticated;

DO $$
DECLARE
  con record;
BEGIN
  FOR con IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.articles'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE public.articles DROP CONSTRAINT %I', con.conname);
  END LOOP;
END $$;

ALTER TABLE public.articles
  ADD CONSTRAINT articles_status_check CHECK (status IN ('draft', 'review', 'published'));

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'articles' LOOP
    EXECUTE format('DROP POLICY %I ON public.articles', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Artigos publicados visiveis para todos"
  ON public.articles FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins gerenciam artigos"
  ON public.articles FOR ALL
  TO authenticated
  USING (public.tem_papel('admin'))
  WITH CHECK (public.tem_papel('admin'));

CREATE POLICY "Autores veem os proprios artigos"
  ON public.articles FOR SELECT
  TO authenticated
  USING (author_id = auth.uid() AND public.pode_escrever());

CREATE POLICY "Autores criam rascunhos"
  ON public.articles FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND status IN ('draft', 'review')
    AND published_at IS NULL
    AND public.pode_escrever()
  );

CREATE POLICY "Autores editam os proprios rascunhos"
  ON public.articles FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid() AND status IN ('draft', 'review') AND public.pode_escrever())
  WITH CHECK (
    author_id = auth.uid()
    AND status IN ('draft', 'review')
    AND published_at IS NULL
    AND public.pode_escrever()
  );

CREATE POLICY "Autores apagam os proprios rascunhos"
  ON public.articles FOR DELETE
  TO authenticated
  USING (author_id = auth.uid() AND status IN ('draft', 'review') AND public.pode_escrever());

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
  IF NOT public.tem_papel('admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem listar usuários' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.email::text,
    (u.raw_user_meta_data ->> 'display_name')::text,
    u.created_at,
    u.last_sign_in_at,
    COALESCE(ARRAY(SELECT DISTINCT r.role::text FROM public.user_roles r WHERE r.user_id = u.id), ARRAY[]::text[])
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;

DROP FUNCTION IF EXISTS public.admin_definir_papel(uuid, text, boolean);
DROP FUNCTION IF EXISTS public.dar_papel_autor_no_cadastro() CASCADE;

CREATE OR REPLACE FUNCTION public.admin_definir_papel(_user_id uuid, _role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.tem_papel('admin') THEN
    RAISE EXCEPTION 'Apenas administradores podem alterar papéis' USING ERRCODE = '42501';
  END IF;

  IF _role NOT IN ('admin', 'editor', 'bloqueado') THEN
    RAISE EXCEPTION 'Papel inválido: %', _role;
  END IF;

  IF _user_id = auth.uid() AND _role <> 'admin' THEN
    RAISE EXCEPTION 'Você não pode remover o seu próprio papel de administrador';
  END IF;

  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id) THEN
    UPDATE public.user_roles SET role = _role WHERE user_id = _user_id;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role);
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_listar_usuarios() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_definir_papel(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_listar_usuarios() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_definir_papel(uuid, text) TO authenticated;
