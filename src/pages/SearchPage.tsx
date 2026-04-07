import { Link } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { CategoriesWidget, TrendingWidget } from "@/components/portal/SidebarWidget";

const results = Array.from({ length: 6 }, (_, i) => ({
  id: String(i + 30),
  title: `Resultado de Pesquisa: Artigo ${i + 1} Encontrado`,
  excerpt: "Conteúdo relevante encontrado com base nos termos pesquisados, incluindo informações detalhadas sobre o tema.",
  category: ["Notícias", "Tecnologia", "Institucional", "Eventos", "Recursos", "Notícias"][i],
  author: ["Maria Santos", "João Silva", "Ana Costa", "Carlos Mendes", "Lucia Ferreira", "Pedro Oliveira"][i],
  date: `${7 - i} Abr 2026`,
}));

export default function SearchPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-card rounded-lg border border-border p-6 mb-8">
        <h1 className="text-3xl font-serif font-bold mb-6">Pesquisar</h1>
        <div className="flex gap-3 mb-4">
          <div className="flex-1 flex items-center gap-3 border border-border rounded-md px-4 py-2 bg-card focus-within:ring-1 focus-within:ring-accent">
            <SearchIcon size={18} className="text-muted-foreground" />
            <input type="text" placeholder="Buscar artigos, vídeos, recursos..." className="flex-1 bg-transparent text-sm focus:outline-none" />
          </div>
          <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
            Buscar
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Todos", "Artigos", "Vídeos", "Documentos"].map((f, i) => (
            <button key={f} className={`px-3 py-1 rounded-full text-sm transition-colors ${i === 0 ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <p className="text-sm text-muted-foreground mb-4">Mostrando {results.length} resultados</p>
          {results.map((r) => (
            <Link key={r.id} to={`/artigo/${r.id}`} className="group block">
              <div className="bg-card rounded-lg border border-border p-5 hover:shadow-md transition-all">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs font-medium rounded">{r.category}</span>
                      <span className="text-xs text-muted-foreground">{r.date}</span>
                    </div>
                    <h3 className="text-lg font-semibold group-hover:text-accent transition-colors mb-2">{r.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{r.excerpt}</p>
                    <p className="text-xs text-muted-foreground mt-2">Por {r.author}</p>
                  </div>
                  <div className="w-28 h-28 rounded-md bg-muted flex-shrink-0 hidden sm:flex items-center justify-center text-3xl">📄</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="space-y-6">
          <CategoriesWidget categories={[
            { name: "Notícias", count: 42 },
            { name: "Tecnologia", count: 28 },
            { name: "Institucional", count: 35 },
            { name: "Eventos", count: 16 },
            { name: "Recursos", count: 23 },
          ]} />
          <TrendingWidget items={[
            { id: "1", title: "Modernização Digital Anunciada", category: "Institucional" },
            { id: "2", title: "Avanços Tecnológicos", category: "Tecnologia" },
            { id: "3", title: "Evento de Inovação", category: "Eventos" },
          ]} />
        </div>
      </div>
    </div>
  );
}
