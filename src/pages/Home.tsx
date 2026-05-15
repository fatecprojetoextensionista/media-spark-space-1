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
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    const loadData = async () => {
      // 1. Destaque do Banner
      const { data: featData } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, cover_image_url, published_at, category:categories(name, slug)")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(1);
      
      if (featData && featData.length > 0) {
        setFeatured(featData[0] as any);
      }

      // 2. Seção: NOVIDADES (Os 4 artigos seguintes)
      const { data: novData } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, cover_image_url, published_at, category:categories(name, slug)")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .range(1, 4);
      novidades && setNovidades((novData ?? []) as any);

      // 3. Seção: VÍDEOS (Os 3 vídeos mais recentes)
      const { data: vidData } = await supabase
        .from("videos")
        .select("id, title, slug, description, thumbnail_url, published_at, category:categories(name, slug), status")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(3);
      setVideos((vidData ?? []) as any);

      // 4. Seção: NOTÍCIAS
      const { data: notData } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, cover_image_url, published_at, category:categories!(inner)(name, slug)")
        .eq("status", "published")
        .eq("category.slug", "noticias")
        .order("published_at", { ascending: false })
        .limit(4);
      setNoticias((notData ?? []) as any);

      // 5. Seção: TECNOLOGIA
      const { data: tecData } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, cover_image_url, published_at, category:categories!(inner)(name, slug)")
        .eq("status", "published")
        .eq("category.slug", "tecnologia")
        .order("published_at", { ascending: false })
        .limit(4);
      setTecnologia((tecData ?? []) as any);

      // 6. Busca de Categorias para o Widget da Sidebar
      const { data: cats } = await supabase.from("categories").select("id, name, slug");
      if (cats) {
        const counts = await Promise.all(
          cats.map(async (c) => {
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

  // Cria a lista de "Em Alta" com base nas novidades
  const trending = novidades.map((a) => ({
    id: a.slug,
    title: a.title,
    category: a.category?.name ?? "—",
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
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2 max-w-2xl">
