import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Article() {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from("articles")
        .select("*, category:categories(name, slug)")
        .eq("slug", id)
        .eq("status", "published")
        .maybeSingle();

      if (error) console.error("Erro:", error);
      
      setArticle(data);
      setLoading(false);

      if (data) {
        await supabase.from("articles").update({ views: (data.views ?? 0) + 1 }).eq("id", data.id);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) return <div className="max-w-3xl mx-auto p-10 text-muted-foreground font-sans">A carregar...</div>;

  if (!article) return (
    <div className="max-w-3xl mx-auto p-10 text-center">
      <h1 className="text-2xl font-serif font-bold mb-2">Artigo não encontrado</h1>
      <p className="mb-4 text-muted-foreground">Não encontramos o artigo: {id}</p>
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
      
      {/* Exibição dos Autores */}
      <div className="flex flex-col gap-1 mb-6 text-sm text-muted-foreground font-sans">
        {(article.author_name_manual || article.group_authors) && (
          <div className="font-medium text-foreground">
            Por: {article.author_name_manual} {article.group_authors && `(${article.group_authors})`}
          </div>
        )}
        <div>
          {article.published_at && new Date(article.published_at).toLocaleDateString("pt-BR", { dateStyle: "long" })} · {article.views} visualizações
        </div>
      </div>

      {article.cover_image_url && (
        <img src={article.cover_image_url} alt={article.title} className="w-full rounded-lg mb-8 shadow-md" />
      )}

      {/* Renderização do Conteúdo com Markdown (Resolve o problema das imagens) */}
      <div className="prose prose-lg max-w-none font-sans dark:prose-invert">
        <ReactMarkdown>
          {article.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
