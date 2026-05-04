import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArticleCard } from "@/components/portal/ArticleCard";

interface ArticleRow {
  id: string; 
  title: string; 
  slug: string; 
  excerpt: string | null;
  cover_image_url: string | null; 
  published_at: string | null;
}

interface VideoRow {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string | null;
  published_at: string | null;
}

export default function Category() {
  const { name } = useParams();
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [catName, setCatName] = useState("");

  useEffect(() => {
    (async () => {
      // 1. Busca a categoria pelo slug (URL)
      const { data: cat } = await supabase.from("categories").select("id, name").eq("slug", name!).maybeSingle();
      if (!cat) return;
      setCatName(cat.name);

      // 2. Busca Artigos desta categoria
      const { data: artData } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, cover_image_url, published_at")
        .eq("category_id", cat.id)
        .eq("status", "published")
        .order("published_at", { ascending: false });
      setArticles(artData ?? []);

      // 3. Busca Vídeos desta categoria
      const { data: vidData } = await supabase
        .from("videos")
        .select("id, title, slug, thumbnail_url, published_at")
        .eq("category_id", cat.id)
        .eq("published", true)
        .order("published_at", { ascending: false });
      setVideos(vidData ?? []);
    })();
  }, [name]);

  const totalContent = articles.length + videos.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Cabeçalho da Categoria */}
      <div className="mb-8">
        <Link to="/" className="text-sm text-muted-foreground hover:text-accent">← Início</Link>
        <h1 className="text-3xl font-serif font-bold mt-2">{catName || "Categoria"}</h1>
        <p className="text-muted-foreground text-sm">{totalContent} publicações encontradas</p>
      </div>

      {/* SEÇÃO DE ARTIGOS */}
      {articles.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xl font-serif font-bold">Artigos</h2>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((a) => (
              <ArticleCard
                key={a.id}
                id={a.slug}
                title={a.title}
                excerpt={a.excerpt ?? ""}
                category={catName}
                author=""
                date={a.published_at ? new Date(a.published_at).toLocaleDateString("pt-BR") : ""}
                imageUrl={a.cover_image_url ?? undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* SEÇÃO DE VÍDEOS (Baseado no seu esboço de 3 colunas) */}
      {videos.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xl font-serif font-bold">Vídeos</h2>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {videos.map((v) => (
              <Link key={v.id} to={`/video/${v.slug}`} className="group block">
                <div className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all">
                  <div className="relative aspect-video">
                    <img 
                      src={v.thumbnail_url || "/placeholder.svg"} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      alt={v.title}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                      <div className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center shadow-lg">
                        ▶
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-accent transition-colors">
                      {v.title}
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {v.published_at ? new Date(v.published_at).toLocaleDateString("pt-BR") : ""}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Caso não tenha nada na categoria */}
      {totalContent === 0 && (
        <div className="bg-card border border-border rounded-lg p-10 text-center text-muted-foreground font-serif">
          Sem publicações ou vídeos nesta categoria no momento.
        </div>
      )}
    </div>
  );
}
