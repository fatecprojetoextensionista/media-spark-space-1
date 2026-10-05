ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS views integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.update_articles_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_articles_updated_at ON public.articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW
  WHEN (
    OLD.views IS NOT DISTINCT FROM NEW.views
    OR (to_jsonb(OLD) - 'views') IS DISTINCT FROM (to_jsonb(NEW) - 'views')
  )
  EXECUTE FUNCTION public.update_articles_updated_at_column();

CREATE OR REPLACE FUNCTION public.increment_article_views(_article_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.articles
  SET views = views + 1
  WHERE id = _article_id AND status = 'published';
$$;

REVOKE EXECUTE ON FUNCTION public.increment_article_views(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_article_views(uuid) TO anon, authenticated;
