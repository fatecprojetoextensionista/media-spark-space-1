import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArticleCard } from "@/components/portal/ArticleCard";
import { TrendingWidget, CategoriesWidget } from "@/components/portal/SidebarWidget";
import { supabase } from "@/integrations/supabase/client";
import heroBg from "@/assets/Fatec.jpeg";

interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  category_id: string | null;
  category?: { name: string; slug: string } | null;
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
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    const loadData = async () => {
      // 1. Busca TODAS as categorias primeiro para termos os IDs de referência de forma segura
      const { data: catsData } = await supabase.from("categories").select("id, name, slug");
      
      // Mapeia os IDs para sabermos qual ID pertence a qual categoria
      const idNoticias = catsData?.find(c => c.slug.toLowerCase() === "noticias")?.id;
      const idTecnologia = catsData?.find(c => c.slug.toLowerCase() === "tecnologia")?.id;

      // 2. Busca TODOS os artigos publicados de uma só vez (Evita erros de junção estrita)
      const { data: allArticles } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, cover_image_url, published_at, category_id, category:categories(name, slug)")
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (allArticles && allArticles.length > 0) {
        // Banner: O primeiro mais recente
        setFeatured(allArticles[0] as any);
        
        // Novidades: Os próximos 4 artigos
        setNovidades(allArticles.slice(1, 5) as any);

        // Seção Notícias: Filtra estritamente pelo ID da categoria de notícias
        if (idNoticias) {
          const filtradosNoticias = allArticles.filter(a => a.category_id === idNoticias);
          setNoticias(filtradosNoticias.slice(0, 4) as any);
        } else {
          // Fallback caso o relacionamento por ID falhe: tenta por texto do slug
          const filtradosNoticias = allArticles.filter(a => a.category?.slug?.toLowerCase() === "noticias");
          setNoticias(filtradosNoticias.slice(0, 4) as any);
        }

        // Seção Tecnologia: Filtra estritamente pelo ID da categoria de tecnologia
        if (idTecnologia) {
          const filtradosTecnologia = allArticles.filter(a => a.category_id === idTecnologia);
          setTecnologia(filtradosTecnologia.slice(0, 4) as any);
        } else {
          // Fallback caso o relacionamento por ID falhe: tenta por texto do slug
          const filtradosTecnologia = allArticles.filter(a => a.category?.slug?.toLowerCase() === "tecnologia");
          setTecnologia(filtradosTecnologia.slice(0, 4) as any);
        }
      }

      // 3. Seção: VÍDEOS
      const { data: vidData } = await supabase
        .from("videos")
        .select("id, title, slug, description, thumbnail_url, published_at, category:categories(name, slug), status")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(3);
      setVideos((vidData ?? []) as any);

      // 4. Contagem para o Widget de Categorias da Lateral
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
      {/* SEÇÃO HERO BANNER */}
      <div className="relative h-[400px] overflow-hidden">
        <img
          src={featured?.cover_image_url || heroBg}
          alt={featured?.title || "Portal"}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        <div className="absolute inset-0 flex items-end pb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="inline-block px-3 py-1 bg-destructive text-destructive-foreground text-xs font-bold rounded mb-3 tracking-wide">
              DESTAQUE
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2 max-w-2xl leading-tight">
              {featured?.title || "Bem-vindo ao Portal Institucional TechIn"}
            </h1>
            {featured && (
              <Link to={`/artigo/${featured.slug}`} className="inline-flex px-5 py-2 bg-accent text-accent-foreground rounded-md text-sm font-semibold hover:opacity-90 transition-opacity">
                Ler mais →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* GRADE DE LAYOUT: DUAS COLUNAS PRINCIPAIS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUNA ESQUERDA: TODAS AS SEÇÕES VERTICAIS */}
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
                    author=""
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
                      author=""
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
