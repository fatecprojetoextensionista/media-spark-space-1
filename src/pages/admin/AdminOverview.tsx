import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Video, FolderTree, Eye } from "lucide-react";

export default function AdminOverview() {
  const [stats, setStats] = useState({ articles: 0, videos: 0, categories: 0, views: 0 });

  useEffect(() => {
    (async () => {
      const [a, v, c, av] = await Promise.all([
        supabase.from("articles").select("*", { count: "exact", head: true }),
        supabase.from("videos").select("*", { count: "exact", head: true }),
        supabase.from("categories").select("*", { count: "exact", head: true }),
        supabase.from("articles").select("views"),
      ]);
      const totalViews = (av.data ?? []).reduce((s, r: any) => s + (r.views ?? 0), 0);
      setStats({
        articles: a.count ?? 0,
        videos: v.count ?? 0,
        categories: c.count ?? 0,
        views: totalViews,
      });
    })();
  }, []);

  const cards = [
    { label: "Artigos", value: stats.articles, icon: FileText },
    { label: "Vídeos", value: stats.videos, icon: Video },
    { label: "Categorias", value: stats.categories, icon: FolderTree },
    { label: "Visualizações", value: stats.views, icon: Eye },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-serif font-bold mb-1">Visão geral</h1>
      <p className="text-muted-foreground text-sm mb-8">Resumo do conteúdo do portal</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</span>
              <c.icon size={18} className="text-accent" />
            </div>
            <div className="text-3xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
