import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(query);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setSearchParams({ q: searchTerm });

    // Busca em Artigos
    const { data: articles } = await supabase
      .from("articles")
      .select("id, title, excerpt, slug, category:categories(name), type:status")
      .ilike("title", `%${searchTerm}%`)
      .eq("status", "published");

    // Busca em Vídeos
    const { data: videos } = await supabase
      .from("videos")
      .select("id, title, description, slug, category:categories(name)")
      .ilike("title", `%${searchTerm}%`)
      .eq("published", true);

    // Junta os dois resultados e marca quem é o quê
    const combined = [
      ...(articles?.map(a => ({ ...a, kind: 'artigo' })) || []),
      ...(videos?.map(v => ({ ...v, kind: 'video' })) || [])
    ];

    setResults(combined);
    setLoading(false);
  };

  useEffect(() => {
    if (query) handleSearch();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-serif font-bold mb-4 uppercase tracking-tighter">Pesquisar</h1>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
          <Input 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar artigos, vídeos..." 
            className="h-12"
          />
          <Button type="submit" className="h-12 px-8 bg-accent text-accent-foreground hover:bg-accent/90">
            <Search className="mr-2 h-4 w-4" /> Buscar
          </Button>
        </form>
      </div>

      <div className="space-y-6">
        <h2 className="text-sm font-medium text-muted-foreground border-b pb-2">
          Mostrando {results.length} resultados
        </h2>

        {loading ? (
          <p className="text-center py-10">Buscando...</p>
        ) : results.length > 0 ? (
          results.map((item) => (
            <Link 
              key={item.id} 
              to={item.kind === 'artigo' ? `/artigo/${item.slug}` : `/video/${item.id}`}
              className="block bg-card p-6 rounded-lg border border-border hover:border-accent transition-colors group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">
                  {item.category?.name || "Geral"} • {item.kind}
                </span>
              </div>
              <h3 className="text-xl font-serif font-bold group-hover:text-accent transition-colors">
                {item.title}
              </h3>
              <p className="text-muted-foreground line-clamp-2 mt-2">
                {item.excerpt || item.description || "Sem descrição disponível."}
              </p>
            </Link>
          ))
        ) : (
          <div className="text-center py-20 border border-dashed rounded-xl">
            <p className="text-muted-foreground">Nenhum resultado encontrado para "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
