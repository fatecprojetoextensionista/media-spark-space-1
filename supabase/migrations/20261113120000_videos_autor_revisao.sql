ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DO $$
DECLARE
  con record;
BEGIN
  FOR con IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.videos'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE public.videos DROP CONSTRAINT %I', con.conname);
  END LOOP;
END $$;

ALTER TABLE public.videos
  ADD CONSTRAINT videos_status_check CHECK (status IN ('draft', 'review', 'published'));

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'videos' LOOP
    EXECUTE format('DROP POLICY %I ON public.videos', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Videos publicados visiveis para todos"
  ON public.videos FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins gerenciam videos"
  ON public.videos FOR ALL
  TO authenticated
  USING (public.tem_papel('admin'))
  WITH CHECK (public.tem_papel('admin'));

CREATE POLICY "Autores veem os proprios videos"
  ON public.videos FOR SELECT
  TO authenticated
  USING (author_id = auth.uid() AND public.pode_escrever());

CREATE POLICY "Autores criam videos em rascunho"
  ON public.videos FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid()
    AND status IN ('draft', 'review')
    AND published_at IS NULL
    AND COALESCE(published, false) = false
    AND public.pode_escrever()
  );

CREATE POLICY "Autores editam os proprios videos em rascunho"
  ON public.videos FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid() AND status IN ('draft', 'review') AND public.pode_escrever())
  WITH CHECK (
    author_id = auth.uid()
    AND status IN ('draft', 'review')
    AND published_at IS NULL
    AND COALESCE(published, false) = false
    AND public.pode_escrever()
  );

CREATE POLICY "Autores apagam os proprios videos em rascunho"
  ON public.videos FOR DELETE
  TO authenticated
  USING (author_id = auth.uid() AND status IN ('draft', 'review') AND public.pode_escrever());
