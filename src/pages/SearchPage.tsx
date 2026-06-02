import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp, Hash, BookOpen } from "lucide-react";
import { ArticleCard } from "@/components/portal/ArticleCard";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(query);
  
  // Estados para as barras laterais e sugestões
  const [trending, setTrending] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Busca dados da Sidebar e Sugestões logo que a página carrega
  useEffect(() => {
    const fetchSidebarsAndSuggestions = async () => {
      // 1. Em Alta (Ordenado por visualizações)
      const { data: trendingData } = await supabase
        .from("articles")
        .select("title, slug, views")
        .eq("status", "published")
        .order("views", { ascending: false })
        .limit(4);
      setTrending(trendingData || []);

      // 2. Categorias
      const { data: categoriesData } = await supabase
        .from("categories")
        .select("name, slug")
        .limit(6);
      setCategories(categoriesData || []);

      // 3. Sugestões (Últimos artigos para caso a pesquisa falhe ou esteja vazia)
      const { data: suggestionsData } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, cover_image_url, published_at, author_name_manual, group_authors, category:categories(name, slug)")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(4);
      setSuggestions(suggestionsData || []);
    };
    
    fetchSidebarsAndSuggestions();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setSearchParams({ q: searchTerm });
    setHasSearched(true);

    // Busca em Artigos 
    const { data: articles } = await supabase
      .from("articles")
      .select("id, title, excerpt, slug, category:categories(name), type:status, author_name_manual, group_authors")
      .ilike("title", `%${searchTerm}%`)
      .eq("status", "published");

    // Busca em Vídeos
    const { data: videos } = await supabase
      .from("videos")
      .select("id, title, description, slug, category:categories(name)")
      .ilike("title", `%${searchTerm}%`)
      .eq("status", "published");

    // Junta os dois resultados
    const combined = [
      ...(articles?.map(a => ({ ...a, kind: 'artigo' })) || []),
      ...(videos?.map(v => ({ ...v, kind: 'video' })) || [])
    ];

    setResults(combined);
    setLoading(false);
  };

  // Dispara a busca automaticamente se houver parâmetro na URL
  useEffect(() => {
    if (query) {
      setSearchTerm(query);
      handleSearch();
    }
  }, [query]);

  // Funções auxiliares para formatação
  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" }) : "";

  // Função de Autor 
  const getAuthorName = (article: any) => {
    const parts = [];
    if (article.author_name_manual) parts.push(article.author_name_manual);
    if (article.group_authors) parts.push(article.group_authors);
    return parts.length > 0 ? parts.join(" & ") : "Equipe";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* BARRA DE PESQUISA SUPERIOR */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-serif font-bold mb-4 uppercase tracking-tighter text-primary">Pesquisar</h1>
        <form onSubmit={handleSearch} className="flex gap-2 shadow-sm rounded-md">
          <Input 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar artigos, vídeos ou temas..." 
            className="h-12 border-border focus-visible:ring-primary"
          />
          <Button type="submit" className="h-12 px-8 bg-accent text-accent-foreground hover:bg-accent/90">
            <Search className="mr-2 h-4 w-4" /> Buscar
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ================= COLUNA PRINCIPAL - RESULTADOS OU SUGESTÕES (Esquerda) ================= */}
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
            <div className="text-center py-20 text-muted-foreground animate-pulse">Buscando na base de dados...</div>
          ) : (hasSearched || query) && results.length > 0 ? (
            <>
              {/* LISTAGEM DE RESULTADOS */}
              <h2 className="text-sm font-medium text-muted-foreground border-b border-border pb-2">
                Mostrando {results.length} resultados para "{query}"
              </h2>
              <div className="space-y-4">
                {results.map((item) => (
                  <Link 
                    key={`${item.kind}-${item.id}`} 
                    to={item.kind === 'artigo' ? `/artigo/${item.slug}` : `/video/${item.slug || item.id}`}
                    className="block bg-card p-6 rounded-lg border border-border hover:border-accent hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] uppercase font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">
                        {item.category?.name || "Geral"} • {item.kind}
                      </span>
                      {/* MOSTRA O AUTOR NOS RESULTADOS DA PESQUISA */}
                      {item.kind === 'artigo' && (item.author_name_manual || item.group_authors) && (
                        <span className="text-[11px] font-medium text-muted-foreground uppercase">
                          Por {getAuthorName(item)}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-serif font-bold group-hover:text-accent transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2 mt-2 font-sans text-sm">
                      {item.excerpt || item.description || "Sem descrição disponível."}
                    </p>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-10">
              {/* FEEDBACK DE NENHUM RESULTADO */}
              {(hasSearched || query) && (
                <div className="text-center py-12 bg-card border border-dashed border-border rounded-xl shadow-sm">
                  <Search className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
                  <p className="text-lg font-medium text-foreground">Nenhum resultado encontrado para "{query}"</p>
                  <p className="text-muted-foreground text-sm mt-1">Tente pesquisar usando outros termos ou confira nossas sugestões abaixo.</p>
                </div>
              )}

              {/* SUGESTÕES DE LEITURA */}
              <div>
                <h3 className="flex items-center text-xl font-serif font-bold border-b border-border pb-2 mb-6 text-foreground">
                  <BookOpen size={20} className="mr-2 text-primary" />
                  Sugestões de Leitura
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {suggestions.map((item) => (
                    <ArticleCard
                      key={item.id}
                      id={item.slug}
                      title={item.title}
                      excerpt={item.excerpt ?? ""}
                      category={item.category?.name || "Artigo"}
                      author={getAuthorName(item)}
                      date={formatDate(item.published_at)}
                      imageUrl={item.cover_image_url ?? undefined}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= COLUNA LATERAL DIREITA (Sidebar) ================= */}
        <aside className="hidden lg:block lg:col-span-4 space-y-8 lg:border-l lg:border-border lg:pl-8">
          <div className="sticky top-24 space-y-8">
            
            {/* Bloco "Em Alta" */}
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

            {/* Bloco "Categorias" */}
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
