import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArticleCard } from "@/components/portal/ArticleCard";

interface Row {
  id: string; title: string; slug: string; excerpt: string | null;
  cover_image_url: string | null; published_at: string | null;
}

export default function Category() {
  const { name } = useParams();
  const [items, setItems] = useState<Row[]>([]);
  const [catName, setCatName] = useState("");

  useEffect(() => {
    (async () => {
      const { data: cat } = await supabase.from("categories").select("id, name").eq("slug", name!).maybeSingle();
      if (!cat) return;
      setCatName(cat.name);
      const { data } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, cover_image_url, published_at")
        .eq("category_id", cat.id)
        .eq("status", "published")
        .order("published_at", { ascending: false });
      setItems(data ?? []);
    })();
  }, [name]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link to="/" className="text-sm text-muted-foreground hover:text-accent">← Início</Link>
        <h1 className="text-3xl font-serif font-bold mt-2">{catName || "Categoria"}</h1>
        <p className="text-muted-foreground text-sm">{items.length} publicações</p>
      </div>
      {items.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-10 text-center text-muted-foreground">
          Sem publicações nesta categoria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((a) => (
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
      )}
    </div>
  );
}
