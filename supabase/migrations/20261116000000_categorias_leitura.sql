DROP POLICY IF EXISTS "Categorias visiveis para todos" ON public.categories;
CREATE POLICY "Categorias visiveis para todos"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (true);
