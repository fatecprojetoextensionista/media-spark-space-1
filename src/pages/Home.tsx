import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArticleCard } from "@/components/portal/ArticleCard";
import { TrendingWidget, NewsletterWidget, CategoriesWidget } from "@/components/portal/SidebarWidget";
import { supabase } from "@/integrations/supabase/client";
import heroBg from "@/assets/hero-bg.jpg";

interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  category: { name: string; slug: string } | null;
}

interface VideoRow {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  category: { name: string; slug: string } | null;
}

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" }) : "";

export default function Home() {
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    (async () => {
      // 1. Busca de Artigos
      const { data: artData } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, cover_image_url, published_at, category:categories(name, slug)")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(20);
      setArticles((artData ?? []) as any);

      // 2. Busca de Vídeos
      const { data: vidData } = await supabase
        .from("videos")
        .select("id, title, slug, description, thumbnail_url, published_at, category:categories(name, slug)")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(3);
      setVideos((vidData ?? []) as any);

      // 3. Busca de Categorias e contagem correta
      const { data: cats } = await supabase.from("categories").select("id, name, slug");
      if (cats) {
        const counts = await Promise.all(
          cats.map(async (c) => {
            const { count } = await supabase
              .from("articles")
              .select("*", { count: "exact", head: true })
              .eq("status", "published")
              .eq("category_id", c.id); // Agora filtra por categoria de verdade!
            return { name: c.name, count: count ?? 0 };
          }),
        );
        setCategories(counts);
      }
    })();
  }, []);

  const featured = articles[0];
  const grid = articles.slice(1, 5);
  const latest = articles.slice(5, 10);
  const trending = articles.slice(0, 5).map((a) => ({
    id: a.slug,
    title: a.title,
    category: a.category?.name ?? "—",
  }));

  return (
    <div>
      {/* SEÇÃO HERO */}
      <div className="relative h-[400px] overflow-hidden">
        <img
          src={featured?.cover_image_url || heroBg}
          alt={featured?.title || "Portal"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent" />
        <div className="absolute inset-0 flex items-end pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="inline-block px-3 py-1 bg-destructive text-destructive-foreground text-xs font-semibold rounded mb-3 animate-pulse">
              DESTAQUE
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-2 max-w-2xl">
              {featured?.title || "Bem-vindo ao Portal Institucional"}
            </h1>
            {featured && (
              <Link to={`/artigo/${featured.slug}`} className="inline-flex px-5 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
                Ler mais →
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-12">
            
            {/* SEÇÃO 1: ARTIGOS */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-serif font-bold">Artigos</h2>
                <div className="flex-1 h-px bg-border" />
              </div>
              {grid.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {grid.map((a) => (
                    <ArticleCard
                      key={a.id}
                      id={a.slug}
                      title={a.title}
                      excerpt={a.excerpt ?? ""}
                      category={a.category?.name ?? "—"}
                      author=""
                      date={formatDate(a.published_at)}
                      imageUrl={a.cover_image_url ?? undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground py-10 border border-dashed rounded-lg text-center font-serif">
                  Aguardando novas publicações...
                </div>
              )}
            </div>

            {/* SEÇÃO 2: VÍDEOS - CORRIGIDA */}
            {videos.length > 0 && (
              <div className="pt-4">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-2xl font-serif font-bold">Vídeos</h2>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {videos.map((v) => (
                    /* MUDANÇA AQUI: Trocamos v.slug por v.id para evitar o erro 404 */
                    <Link key={v.id} to={`/video/${v.id}`} className="group block">
                      <div className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-300">
                        <div className="relative aspect-video">
                          <img 
                            src={v.thumbnail_url || "/placeholder.svg"} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            alt={v.title}
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                            <div className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                              ▶
                            </div>
                          </div>
                        </div>
                        <div className="p-3">
                          <span className="text-[10px] uppercase tracking-wider text-accent font-bold">
                            {v.category?.name || "Vídeo"}
                          </span>
                          <h3 className="font-semibold text-sm line-clamp-2 mt-1 group-hover:text-accent transition-colors leading-tight">
                            {v.title}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* SEÇÃO 3: ÚLTIMAS PUBLICAÇÕES */}
            {latest.length > 0 && (
              <div className="pt-4">
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-2xl font-serif font-bold">Últimas Publicações</h2>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="space-y-4">
                  {latest.map((s) => (
                    <Link key={s.id} to={`/artigo/${s.slug}`} className="group block">
                      <div className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-all">
                        <div className="flex gap-4 items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs font-medium rounded">{s.category?.name ?? "—"}</span>
                              <span className="text-xs text-muted-foreground">{formatDate(s.published_at)}</span>
                            </div>
                            <h3 className="font-semibold group-hover:text-accent transition-colors mb-1">{s.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1">{s.excerpt}</p>
                          </div>
                          {s.cover_image_url && (
                            <img src={s.cover_image_url} alt="" className="w-20 h-20 rounded-md object-cover" />
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="space-y-6">
            <TrendingWidget items={trending} />
            <NewsletterWidget />
            <CategoriesWidget categories={categories} />
          </div>
        </div>
      </div>
    </div>
  );
}
