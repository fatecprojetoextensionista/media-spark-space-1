import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ArticleData {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  published_at: string | null;
  views: number;
  category: { name: string; slug: string } | null;
}

export default function Article() {
  const { id } = useParams();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("articles")
        .select("id, title, excerpt, content, cover_image_url, published_at, views, category:categories(name, slug)")
        .eq("slug", id!)
        .eq("status", "published")
        .maybeSingle();
      setArticle(data as any);
      setLoading(false);
      if (data) {
        await supabase.from("articles").update({ views: (data.views ?? 0) + 1 }).eq("id", data.id);
      }
    })();
  }, [id]);

  if (loading) return <div className="max-w-3xl mx-auto p-10 text-muted-foreground">A carregar...</div>;
  if (!article) return (
    <div className="max-w-3xl mx-auto p-10 text-center">
      <h1 className="text-2xl font-serif font-bold mb-2">Artigo não encontrado</h1>
      <Link to="/" className="text-accent underline">Voltar ao início</Link>
    </div>
  );

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {article.category && (
        <Link to={`/categoria/${article.category.slug}`} className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded mb-4">
          {article.category.name}
        </Link>
      )}
      <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4">{article.title}</h1>
      {article.excerpt && <p className="text-lg text-muted-foreground mb-6">{article.excerpt}</p>}
      <div className="text-sm text-muted-foreground mb-8">
        {article.published_at && new Date(article.published_at).toLocaleDateString("pt-BR", { dateStyle: "long" })} · {article.views} visualizações
      </div>
      {article.cover_image_url && (
        <img src={article.cover_image_url} alt={article.title} className="w-full rounded-lg mb-8" />
      )}
      <div className="prose prose-lg max-w-none whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: article.content }} />
    </article>
  );
}
