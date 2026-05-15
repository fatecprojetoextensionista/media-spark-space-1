import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArticleCard } from "@/components/portal/ArticleCard";
import { supabase } from "@/integrations/supabase/client";
import heroBg from "@/assets/Fatec.jpeg";

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
  status: string;
}

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" }) : "";

export default function Home() {
  const [featured, setFeatured] = useState<ArticleRow | null>(null);
  const [novidades, setNovidades] = useState<ArticleRow[]>([]);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [noticias, setNoticias] = useState<ArticleRow[]>([]);
  const [tecnologia, setTecnologia] = useState<ArticleRow[]>([]);

  useEffect(() => {
    const loadData = async () => {
      // 1. Destaque do Banner (O mais recente de todos)
      const { data: featData } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, cover_image_url, published_at, category:categories(name, slug)")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(1);
      
      if (featData && featData.length > 0) {
        setFeatured(featData[0] as any);
      }

      // 2. Seção: NOVIDADES (Os 4 artigos seguintes mais recentes)
      const { data: novData } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, cover_image_url, published_at, category:categories(name, slug)")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .range(1, 4); // Pula o primeiro que já está no banner
      setNovidades((novData ?? []) as any);

      // 3. Seção: VÍDEOS (Os 4 vídeos mais recentes)
      const { data: vidData } = await supabase
        .from("videos")
        .select("id, title, slug, description, thumbnail_url, published_at, category:categories(name, slug), status")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(4); // Alterado para 4 conforme o teu desenho do papel
      setVideos((vidData ?? []) as any);

      // 4. Seção: NOTÍCIAS (Filtra artigos onde a categoria tem o slug 'noticias')
      const { data: notData } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, cover_image_url, published_at, category:categories!(inner)(name, slug)")
        .eq("status", "published")
        .eq("category.slug", "noticias")
        .order("published_at", { ascending: false })
        .limit(4);
      setNoticias((notData ?? []) as any);

      // 5. Seção: TECNOLOGIA (Filtra artigos onde a categoria tem o slug 'tecnologia')
      const { data: tecData } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, cover_image_url, published_at, category:categories!(inner)(name, slug)")
        .eq("status", "published")
        .eq("category.slug", "tecnologia")
        .order("published_at", { ascending: false })
        .limit(4);
      setTecnologia((tecData ?? []) as any);
    };

    loadData();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* SEÇÃO HERO BANNER */}
      <div className="relative h-[420px] overflow-hidden">
        <img
          src={featured?.cover_image_url || heroBg}
          alt={featured?.title || "Portal"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        <div className="absolute inset-0 flex items-end pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="inline-block px-3 py-1 bg-destructive text-destructive-foreground text-xs font-bold rounded mb-3 tracking-wide">
              DESTAQUE
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 max-w-3xl leading-tight">
              {featured?.title || "Bem-vindo ao Portal Institucional TechIn"}
            </h1>
            {featured && (
              <Link to={`/artigo/${featured.slug}`} className="inline-flex px-6 py-2.5 bg-accent text-accent-foreground rounded-md text-sm font-semibold hover:bg-accent/90 transition-all shadow-md">
                Ler mais →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* CONTEÚDO EM SEÇÕES VERTICAIS (IGUAL AO SEU DESENHO) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* 1. SEÇÃO: NOVIDADES */}
        <div>
          <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-3">
            <h2 className="text-2xl font-serif font-bold text-slate-900">Novidades</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {novidades.map((a) => (
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
        </div>

        {/* 2. SEÇÃO: VÍDEOS */}
        {videos.length > 0 && (
          <div className="bg-slate-900 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-10 rounded-2xl shadow-inner text-white">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-serif font-bold text-white">Vídeos em Destaque</h2>
                <div className="flex-1 h-px bg-slate-700" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {videos.map((v) => (
                  <Link key={v.id} to={`/video/${v.slug}`} className="group block">
                    <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-accent transition-all duration-300">
                      <div className="relative aspect-video">
                        <img 
                          src={v.thumbnail_url || "/placeholder.svg"} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          alt={v.title}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                          <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform font-bold">
                            ▶
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <span className="text-[10px] uppercase tracking-wider text-accent font-bold">
                          {v.category?.name || "Vídeo"}
                        </span>
                        <h3 className="font-semibold text-sm line-clamp-2 mt-1 text-slate-100 group-hover:text-accent transition-colors leading-snug">
                          {v.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. SEÇÃO: NOTÍCIAS */}
        {noticias.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-3">
              <h2 className="text-2xl font-serif font-bold text-slate-900">Notícias</h2>
              <Link to="/categoria/noticias" className="text-sm font-semibold text-accent hover:underline flex items-center gap-1">
                Ver mais <span>→</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {noticias.map((a) => (
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
          </div>
        )}

        {/* 4. SEÇÃO: TECNOLOGIA */}
        {tecnologia.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-3">
              <h2 className="text-2xl font-serif font-bold text-slate-900">Tecnologia</h2>
              <Link to="/categoria/tecnologia" className="text-sm font-semibold text-accent hover:underline flex items-center gap-1">
                Ver mais <span>→</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tecnologia.map((a) => (
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
          </div>
        )}

      </div>
    </div>
  );
}
