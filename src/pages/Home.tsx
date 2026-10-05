import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArticleCard } from "@/components/portal/ArticleCard";
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

export default function Home() {
  const [featured, setFeatured] = useState<ArticleRow | null>(null);
  const [popular, setPopular] = useState<ArticleRow | null>(null);
  const [novidades, setNovidades] = useState<ArticleRow[]>([]);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [noticias, setNoticias] = useState<ArticleRow[]>([]);
  const [tecnologia, setTecnologia] = useState<ArticleRow[]>([]);
  const [institucional, setInstitucional] = useState<ArticleRow[]>([]);
  const [eventos, setEventos] = useState<ArticleRow[]>([]);
  const [recursos, setRecursos] = useState<ArticleRow[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);

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
        } else {
          const viewsById = new Map(
            (viewsData as unknown as { id: string; views: number | null }[]).map((v) => [v.id, v.views ?? 0]),
          );
          const withViews = rows.map((a) => ({ ...a, views: viewsById.get(a.id) ?? 0 }));
          const mostViewed = [...withViews].sort((a, b) => b.views - a.views);
          setPopular(mostViewed.find((a) => a.id !== rows[0].id && a.views > 0) ?? null);
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

    loadData();
  }, []);

  const trending = novidades.map((a) => ({
    id: a.slug,
    title: a.title,
    category: a.category?.name || "Novidade",
  }));

  return (
    <div className="bg-slate-50 min-h-screen">
      <HeroCarousel recent={featured} popular={popular} />

      {/* GRADE DE LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUNA ESQUERDA VERTICAL */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* 1. SEÇÃO: NOVIDADES */}
            <div>
              <div className="flex items-center gap-4 mb-6 border-b pb-2">
                <h2 className="text-2xl font-serif font-bold text-slate-900">Novidades</h2>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {novidades.map((a) => (
                  <ArticleCard
                    key={a.id}
                    id={a.slug}
                    title={a.title}
                    excerpt={a.excerpt ?? ""}
                    category={a.category?.name || "Novidade"}
                    author={getAuthorName(a)}
                    date={formatDate(a.published_at)}
                    imageUrl={a.cover_image_url ?? undefined}
                  />
                ))}
              </div>
            </div>

            {/* 2. SEÇÃO: VÍDEOS */}
            {videos.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-6 border-b pb-2">
                  <h2 className="text-2xl font-serif font-bold text-slate-900">Vídeos em Destaque</h2>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {videos.map((v) => (
                    <Link key={v.id} to={`/video/${v.slug}`} className="group block">
                      <div className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-md transition-all duration-300">
                        <div className="relative aspect-video">
                          <img 
                            src={v.thumbnail_url || "/placeholder.svg"} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            alt={v.title}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                            <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center shadow-lg text-xs font-bold">
                              ▶
                            </div>
                          </div>
                        </div>
                        <div className="p-3">
                          <span className="text-[9px] uppercase tracking-wider text-accent font-bold">
                            {v.category?.name || "Vídeo"}
                          </span>
                          <h3 className="font-semibold text-xs line-clamp-2 mt-0.5 group-hover:text-accent transition-colors leading-tight">
                            {v.title}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 3. SEÇÃO: NOTÍCIAS */}
            {noticias.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6 border-b pb-2">
                  <h2 className="text-2xl font-serif font-bold text-slate-900">Notícias</h2>
                  <Link to="/categoria/noticias" className="text-xs font-semibold text-accent hover:underline">
                    Ver mais →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {noticias.map((a) => (
                    <ArticleCard
                      key={a.id}
                      id={a.slug}
                      title={a.title}
                      excerpt={a.excerpt ?? ""}
                      category={a.category?.name || "Notícias"}
                      author={getAuthorName(a)}
                      date={formatDate(a.published_at)}
                      imageUrl={a.cover_image_url ?? undefined}
                  />
                  ))}
                </div>
              </div>
            )}

            {/* 4. SEÇÃO: TECNOLOGIA */}
            {tecnologia.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6 border-b pb-2">
                  <h2 className="text-2xl font-serif font-bold text-slate-900">Tecnologia</h2>
                  <Link to="/categoria/tecnologia" className="text-xs font-semibold text-accent hover:underline">
                    Ver mais →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {tecnologia.map((a) => (
                    <ArticleCard
                      key={a.id}
                      id={a.slug}
                      title={a.title}
                      excerpt={a.excerpt ?? ""}
                      category={a.category?.name || "Tecnologia"}
                      author={getAuthorName(a)}
                      date={formatDate(a.published_at)}
                      imageUrl={a.cover_image_url ?? undefined}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 5. SEÇÃO: INSTITUCIONAL */}
            {institucional.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6 border-b pb-2">
                  <h2 className="text-2xl font-serif font-bold text-slate-900">Institucional</h2>
                  <Link to="/categoria/institucional" className="text-xs font-semibold text-accent hover:underline">
                    Ver mais →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {institucional.map((a) => (
                    <ArticleCard
                      key={a.id}
                      id={a.slug}
                      title={a.title}
                      excerpt={a.excerpt ?? ""}
                      category={a.category?.name || "Institucional"}
                      author={getAuthorName(a)}
                      date={formatDate(a.published_at)}
                      imageUrl={a.cover_image_url ?? undefined}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 6. SEÇÃO: EVENTOS */}
            {eventos.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6 border-b pb-2">
                  <h2 className="text-2xl font-serif font-bold text-slate-900">Eventos</h2>
                  <Link to="/categoria/eventos" className="text-xs font-semibold text-accent hover:underline">
                    Ver mais →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {eventos.map((a) => (
                    <ArticleCard
                      key={a.id}
                      id={a.slug}
                      title={a.title}
                      excerpt={a.excerpt ?? ""}
                      category={a.category?.name || "Eventos"}
                      author={getAuthorName(a)}
                      date={formatDate(a.published_at)}
                      imageUrl={a.cover_image_url ?? undefined}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 7. SEÇÃO: RECURSOS */}
            {recursos.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6 border-b pb-2">
                  <h2 className="text-2xl font-serif font-bold text-slate-900">Recursos</h2>
                  <Link to="/categoria/recursos" className="text-xs font-semibold text-accent hover:underline">
                    Ver mais →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {recursos.map((a) => (
                    <ArticleCard
                      key={a.id}
                      id={a.slug}
                      title={a.title}
                      excerpt={a.excerpt ?? ""}
                      category={a.category?.name || "Recursos"}
                      author={getAuthorName(a)}
                      date={formatDate(a.published_at)}
                      imageUrl={a.cover_image_url ?? undefined}
                    />
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* COLUNA DIREITA: SIDEBAR */}
          <div className="space-y-6 lg:border-l lg:pl-6 border-border h-fit">
            <TrendingWidget items={trending} />
            <CategoriesWidget categories={categories} />
          </div>

        </div>
      </div>
    </div>
  );
}
