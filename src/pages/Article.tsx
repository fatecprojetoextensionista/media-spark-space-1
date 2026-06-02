import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, BookOpen, Hash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Função para pegar as iniciais do autor (Ex: "Henrique Reche" vira "HR")
const getInitials = (name: string) => {
  if (!name) return "EQ";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export default function Article() {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para as barras laterais
  const [trending, setTrending] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const fetchArticleAndSidebars = async () => {
      if (!id) return;
      
      setLoading(true);
      
      // 1. Busca o artigo principal
      const { data: articleData, error: articleError } = await supabase
        .from("articles")
        .select("*, category:categories(name, slug, id)")
        .eq("slug", id)
        .eq("status", "published")
        .maybeSingle();

      if (articleError) console.error("Erro ao buscar artigo:", articleError);
      setArticle(articleData);

      if (articleData) {
        // Atualiza visualizações
        await supabase.from("articles").update({ views: (articleData.views ?? 0) + 1 }).eq("id", articleData.id);

        // 2. Busca Sugestões
        if (articleData.category) {
          const { data: suggestionsData } = await supabase
            .from("articles")
            .select("title, slug, cover_image_url")
            .eq("status", "published")
            .eq("category_id", articleData.category.id)
            .neq("id", articleData.id)
            .limit(3);
          setSuggestions(suggestionsData || []);
        }

        // 3. Busca Artigos Em Alta
        const { data: trendingData } = await supabase
          .from("articles")
          .select("title, slug, views")
          .eq("status", "published")
          .order("views", { ascending: false })
          .limit(4);
        setTrending(trendingData || []);

        // 4. Busca Categorias
        const { data: categoriesData } = await supabase
          .from("categories")
          .select("name, slug")
          .limit(6);
        setCategories(categoriesData || []);
      }
      
      setLoading(false);
    };

    fetchArticleAndSidebars();
  }, [id]);

  if (loading) return <div className="max-w-7xl mx-auto p-10 text-muted-foreground font-sans text-center">A carregar o artigo...</div>;

  if (!article) return (
    <div className="max-w-3xl mx-auto p-10 text-center">
      <h1 className="text-2xl font-serif font-bold mb-2">Artigo não encontrado</h1>
      <p className="mb-4 text-muted-foreground">Não encontramos o artigo: {id}</p>
      <Link to="/" className="text-accent underline inline-flex items-center"><ArrowLeft className="mr-2" size={16} /> Voltar ao início</Link>
    </div>
  );

  const sanitizedContent = article.content ? article.content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') : '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Voltar para o Início
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* BARRA LATERAL ESQUERDA */}
        <aside className="hidden lg:block lg:col-span-3 space-y-8">
          <div className="sticky top-24">
            <h3 className="flex items-center text-lg font-bold border-b border-border pb-2 mb-4">
              <BookOpen size={18} className="mr-2 text-primary" />
              Sugestões de Leitura
            </h3>
            <div className="space-y-4">
              {suggestions.length > 0 ? (
                suggestions.map((item, idx) => (
                  <Link to={`/artigo/${item.slug}`} key={idx} className="group flex flex-col gap-2">
                    {item.cover_image_url && (
                      <div className="w-full h-24 overflow-hidden rounded-md bg-muted">
                        <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                    )}
                    <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">{item.title}</h4>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma sugestão no momento.</p>
              )}
            </div>
          </div>
        </aside>

        {/* CONTEÚDO PRINCIPAL (CENTRO) */}
        <main className="lg:col-span-6 bg-card border border-border p-6 sm:p-8 rounded-xl shadow-sm">
          {article.category && (
            <Link to={`/categoria/${article.category.slug}`} className="inline-block px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded mb-4">
              {article.category.name}
            </Link>
          )}

          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4 leading-tight">{article.title}</h1>
          
          <div className="flex flex-wrap gap-x-2 text-sm text-muted-foreground mb-6 font-sans">
            <span>
              {article.published_at && new Date(article.published_at).toLocaleDateString("pt-BR", { dateStyle: "long" })}
            </span>
          </div>

          {article.excerpt && (
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed font-sans italic border-l-4 border-primary/20 pl-4">
              {article.excerpt}
            </p>
          )}

          {article.cover_image_url && (
            <img src={article.cover_image_url} alt={article.title} className="w-full rounded-lg mb-8 shadow-sm" />
          )}

        <div 
            className="prose prose-lg dark:prose-invert max-w-none font-sans text-foreground/90" 
            dangerouslySetInnerHTML={{ __html: sanitizedContent }} 
          />

          {/* ================= CAIXA DE AUTOR SIMPLIFICADA (NO FIM DO ARTIGO) ================= */}
          {(article.author_name_manual || article.group_authors) && (
            <div className="mt-12 pt-6 border-t border-border">
              <div className="flex items-center gap-4">
                
                {/* FOTO OU INICIAIS */}
                <div className="w-16 h-16 shrink-0 rounded-full overflow-hidden bg-primary/10 border border-primary/20 flex items-center justify-center relative text-primary font-bold text-xl">
                  {/* Lógica: Se não houver foto, mostra as iniciais */}
                  {getInitials(article.author_name_manual || article.group_authors)}
                  
                  {article.author_photo_url && (
  <img src={article.author_photo_url} alt="Autor" className="absolute inset-0 w-full h-full object-cover" />
)}
                </div>

                {/* NOME E LABEL */}
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold mb-0.5">Autor(es)</p>
                  <h4 className="text-lg font-bold text-foreground font-serif">
                    {article.author_name_manual}
                    {article.author_name_manual && article.group_authors && " & "}
                    {article.group_authors}
                  </h4>
                </div>
                
              </div>
            </div>
          )}

        </main>

        {/* BARRA LATERAL DIREITA */}
        <aside className="hidden lg:block lg:col-span-3 space-y-8">
          <div className="sticky top-24 space-y-8">
            <div>
              <h3 className="flex items-center text-lg font-bold border-b border-border pb-2 mb-4">
                <TrendingUp size={18} className="mr-2 text-primary" />
                Em Alta
              </h3>
              <ul className="space-y-3">
                {trending.map((item, idx) => (
                  <li key={idx} className="flex gap-3 items-start group">
                    <span className="text-2xl font-bold text-muted-foreground/30 leading-none">{idx + 1}</span>
                    <Link to={`/artigo/${item.slug}`} className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="flex items-center text-lg font-bold border-b border-border pb-2 mb-4">
                <Hash size={18} className="mr-2 text-primary" />
                Categorias
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat, idx) => (
                  <Link 
                    key={idx} 
                    to={`/categoria/${cat.slug}`} 
                    className="px-3 py-1.5 text-xs font-medium bg-muted text-foreground hover:bg-primary hover:text-primary-foreground rounded-md transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
