import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { ArticleCard, CoverArt } from "@/components/portal/ArticleCard";
import { TrendingWidget, CategoriesWidget } from "@/components/portal/SidebarWidget";
import { supabase } from "@/integrations/supabase/client";
import { HeroCarousel } from "@/components/portal/HeroCarousel";

interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  category_id: string | null;
  category?: { name: string; slug: string } | null;
  views?: number | null;
  author_name_manual: string | null;
  group_authors: string | null;
}

interface VideoRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  category: { name: string; slug: string } | null;
  status: string;
}

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" }) : "";

const getAuthorName = (article: ArticleRow) => {
  if (article.author_name_manual) return article.author_name_manual;
  if (article.group_authors) return article.group_authors;
  return "Equipe";
};

const FOCUS_WITHIN =
  "has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-[3px] has-[:focus-visible]:outline-ring";

function SectionHead({ id, title, path }: { id: string; title: string; path?: string }) {
  return (
    <div className="relative mb-5 flex items-center justify-between gap-4 border-b border-border pb-2.5 after:absolute after:-bottom-px after:left-0 after:h-[3px] after:w-16 after:rounded-[3px] after:bg-gradient-to-r after:from-brand-blue after:to-primary">
      <h2 id={id} className="font-serif text-2xl font-bold">
        {title}
      </h2>
      {path && (
        <Link
          to={path}
          className="rounded-sm text-[0.85rem] font-semibold text-primary underline underline-offset-[3px] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-ring"
        >
          Ver mais<span className="sr-only"> em {title}</span>
        </Link>
      )}
    </div>
  );
}

function ArticleGrid({ articles, fallbackCategory }: { articles: ArticleRow[]; fallbackCategory: string }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {articles.map((a) => (
        <ArticleCard
          key={a.id}
          id={a.slug}
          title={a.title}
          excerpt={a.excerpt ?? ""}
          category={a.category?.name || fallbackCategory}
          author={getAuthorName(a)}
          date={formatDate(a.published_at)}
          imageUrl={a.cover_image_url ?? undefined}
        />
      ))}
    </div>
  );
}

function CategorySection({ id, title, path, articles }: { id: string; title: string; path: string; articles: ArticleRow[] }) {
  if (articles.length === 0) return null;
  return (
    <section aria-labelledby={id}>
      <SectionHead id={id} title={title} path={path} />
      <ArticleGrid articles={articles} fallbackCategory={title} />
    </section>
  );
}

function VideoCard({ video }: { video: VideoRow }) {
  return (
    <article
      className={`group relative overflow-hidden rounded-[14px] border border-border bg-card transition-[transform,box-shadow] duration-200 hover:shadow-[0_1px_2px_hsl(var(--foreground)/0.06),0_8px_24px_hsl(var(--foreground)/0.07)] motion-safe:hover:-translate-y-[3px] ${FOCUS_WITHIN}`}
    >
      <div className="relative aspect-video overflow-hidden">
        {video.thumbnail_url ? (
          <img src={video.thumbnail_url} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <CoverArt seed={video.slug} className="h-full w-full" />
        )}
        <span className="absolute inset-0 m-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_1px_2px_hsl(var(--foreground)/0.06),0_8px_24px_hsl(var(--foreground)/0.07)]">
          <Play className="h-[22px] w-[22px] fill-current" aria-hidden="true" />
        </span>
      </div>
      <span className="m-3 mb-0 inline-block rounded-full bg-chip px-2.5 py-[3px] text-xs font-bold text-chip-foreground">
        {video.category?.name || "Vídeo"}
      </span>
      <h3 className="px-3 pb-3.5 pt-1.5 font-serif text-[0.95rem] font-semibold">
        <Link
          to={`/video/${video.slug}`}
          className="underline-offset-[3px] after:absolute after:inset-0 group-hover:underline focus-visible:outline-none"
        >
          <span className="sr-only">Vídeo: </span>
          {video.title}
        </Link>
      </h3>
    </article>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState<ArticleRow | null>(null);
  const [popular, setPopular] = useState<ArticleRow | null>(null);
  const [novidades, setNovidades] = useState<ArticleRow[]>([]);
  const [topViewed, setTopViewed] = useState<ArticleRow[]>([]);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [noticias, setNoticias] = useState<ArticleRow[]>([]);
  const [tecnologia, setTecnologia] = useState<ArticleRow[]>([]);
  const [institucional, setInstitucional] = useState<ArticleRow[]>([]);
  const [eventos, setEventos] = useState<ArticleRow[]>([]);
  const [recursos, setRecursos] = useState<ArticleRow[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const { data: catsData } = await supabase.from("categories").select("id, name, slug");
      
      const idNoticias = catsData?.find(c => c.slug.toLowerCase() === "noticias")?.id;
      const idTecnologia = catsData?.find(c => c.slug.toLowerCase() === "tecnologia")?.id;
      const idInstitucional = catsData?.find(c => c.slug.toLowerCase() === "institucional")?.id;
      const idEventos = catsData?.find(c => c.slug.toLowerCase() === "eventos")?.id;
      const idRecursos = catsData?.find(c => c.slug.toLowerCase() === "recursos")?.id;

      const { data: allArticles } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, cover_image_url, published_at, category_id, author_name_manual, group_authors, category:categories(name, slug)")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (allArticles && allArticles.length > 0) {
        setFeatured(allArticles[0] as any);
        setNovidades(allArticles.slice(1, 5) as any);

        const rows = allArticles as unknown as ArticleRow[];
        const { data: viewsData, error: viewsError } = await supabase
          .from("articles")
          .select("id, views")
          .eq("status", "published");

        if (viewsError || !viewsData) {
          console.error("Falha ao buscar visualizações:", viewsError);
          setPopular(null);
          setTopViewed([]);
        } else {
          const viewsById = new Map(
            (viewsData as unknown as { id: string; views: number | null }[]).map((v) => [v.id, v.views ?? 0]),
          );
          const withViews = rows.map((a) => ({ ...a, views: viewsById.get(a.id) ?? 0 }));
          const mostViewed = [...withViews].sort((a, b) => b.views - a.views);
          setPopular(mostViewed.find((a) => a.id !== rows[0].id && a.views > 0) ?? null);
          setTopViewed(mostViewed.filter((a) => (a.views ?? 0) > 0).slice(0, 4));
        }

        const filterCategory = (id: string | undefined, slugText: string) => {
          if (id) return allArticles.filter(a => a.category_id === id).slice(0, 4);
          return allArticles.filter(a => a.category?.slug?.toLowerCase() === slugText).slice(0, 4);
        };

        setNoticias(filterCategory(idNoticias, "noticias") as any);
        setTecnologia(filterCategory(idTecnologia, "tecnologia") as any);
        setInstitucional(filterCategory(idInstitucional, "institucional") as any);
        setEventos(filterCategory(idEventos, "eventos") as any);
        setRecursos(filterCategory(idRecursos, "recursos") as any);
      }

      const { data: vidData } = await supabase
        .from("videos")
        .select("id, title, slug, description, thumbnail_url, published_at, category:categories(name, slug), status")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(3);
      setVideos((vidData ?? []) as any);

      if (catsData) {
        const counts = await Promise.all(
          catsData.map(async (c) => {
            const { count } = await supabase
              .from("articles")
              .select("*", { count: "exact", head: true })
              .eq("status", "published")
              .eq("category_id", c.id);
            return { name: c.name, count: count ?? 0 };
          }),
        );
        setCategories(counts);
      }
    };

    loadData().finally(() => setLoading(false));
  }, []);

  const trending = (topViewed.length > 0 ? topViewed : novidades).map((a) => ({
    id: a.slug,
    title: a.title,
    category: a.category?.name || "Novidade",
    views: topViewed.length > 0 ? (a.views ?? 0) : undefined,
  }));

  return (
    <div className="min-h-screen bg-background">
      <HeroCarousel recent={featured} popular={popular} />

      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-12">
          <section aria-labelledby="titulo-novidades">
            <SectionHead id="titulo-novidades" title="Novidades" />
            {loading ? (
              <p role="status" className="text-muted-foreground">
                Carregando…
              </p>
            ) : novidades.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma novidade publicada por enquanto.</p>
            ) : (
              <ArticleGrid articles={novidades} fallbackCategory="Novidade" />
            )}
          </section>

          {videos.length > 0 && (
            <section aria-labelledby="titulo-videos">
              <SectionHead id="titulo-videos" title="Vídeos em Destaque" />
              <div className="grid gap-4 sm:grid-cols-3">
                {videos.map((v) => (
                  <VideoCard key={v.id} video={v} />
                ))}
              </div>
            </section>
          )}

          <CategorySection id="titulo-noticias" title="Notícias" path="/categoria/noticias" articles={noticias} />
          <CategorySection id="titulo-tecnologia" title="Tecnologia" path="/categoria/tecnologia" articles={tecnologia} />
          <CategorySection id="titulo-institucional" title="Institucional" path="/categoria/institucional" articles={institucional} />
          <CategorySection id="titulo-eventos" title="Eventos" path="/categoria/eventos" articles={eventos} />
          <CategorySection id="titulo-recursos" title="Recursos" path="/categoria/recursos" articles={recursos} />
        </div>

        <aside aria-label="Barra lateral" className="grid h-fit content-start gap-6">
          <TrendingWidget items={trending} loading={loading} />
          <CategoriesWidget categories={categories} loading={loading} />
        </aside>
      </div>
    </div>
  );
}
