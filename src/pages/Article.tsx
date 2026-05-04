import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Article() {
  const { id } = useParams(); // O Lovable usa 'id' como nome padrão na rota
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from("articles")
        .select("*, category:categories(name, slug)")
        .eq("slug", id) // Aqui dizemos: "Procura o texto da URL na coluna slug"
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
      <div className="text-sm text-muted-foreground mb-8 font-sans">
        {article.published_at && new Date(article.published_at).toLocaleDateString("pt-BR", { dateStyle: "long" })} · {article.views} visualizações
      </div>
      {article.cover_image_url && (
        <img src={article.cover_image_url} alt={article.title} className="w-full rounded-lg mb-8 shadow-md" />
      )}
      <div 
        className="prose prose-lg max-w-none whitespace-pre-wrap font-sans" 
        dangerouslySetInnerHTML={{ __html: article.content }} 
      />
    </article>
  );
}
