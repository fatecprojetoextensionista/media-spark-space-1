import { useParams } from "react-router-dom";
import { Filter } from "lucide-react";
import { ArticleCard } from "@/components/portal/ArticleCard";
import { NewsletterWidget, TrendingWidget } from "@/components/portal/SidebarWidget";

const categoryNames: Record<string, string> = {
  noticias: "Notícias",
  tecnologia: "Tecnologia",
  institucional: "Institucional",
  eventos: "Eventos",
  recursos: "Recursos",
};

const mockArticles = Array.from({ length: 6 }, (_, i) => ({
  id: String(i + 20),
  title: `Artigo sobre o tema ${i + 1} com informações relevantes`,
  excerpt: "Conteúdo detalhado sobre este tópico com informações importantes para a comunidade.",
  category: "Categoria",
  author: ["Maria Santos", "João Silva", "Ana Costa", "Carlos Mendes", "Lucia Ferreira", "Pedro Oliveira"][i],
  date: `${7 - i} Abr 2026`,
}));

export default function Category() {
  const { name } = useParams();
  const categoryName = categoryNames[name || ""] || name?.charAt(0).toUpperCase() + name?.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-card rounded-lg border border-border p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-1">{categoryName}</h1>
            <p className="text-muted-foreground text-sm">Todos os artigos e publicações sobre {categoryName?.toLowerCase()}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors text-sm">
              <Filter size={16} />
              Filtrar
            </button>
            <select className="px-4 py-2 border border-border rounded-md bg-card text-sm focus:outline-none focus:ring-1 focus:ring-accent">
              <option>Mais recentes</option>
              <option>Mais lidos</option>
              <option>Mais antigos</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Featured */}
          <ArticleCard
            id="20"
            title={`Destaque em ${categoryName}: Novidades e Perspectivas para 2026`}
            excerpt="Uma análise completa das tendências e novidades mais importantes nesta área para os próximos meses."
            category={categoryName || ""}
            author="Maria Santos"
            date="7 Abr 2026"
            featured
          />

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {mockArticles.map((a) => (
              <ArticleCard key={a.id} {...a} category={categoryName || ""} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2">
            <button className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors text-sm">← Anterior</button>
            {[1, 2, 3].map((p) => (
              <button key={p} className={`px-4 py-2 rounded-md text-sm transition-colors ${p === 1 ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'}`}>
                {p}
              </button>
            ))}
            <button className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors text-sm">Próximo →</button>
          </div>
        </div>

        <div className="space-y-6">
          <TrendingWidget items={[
            { id: "20", title: `Popular em ${categoryName}`, category: categoryName || "" },
            { id: "21", title: "Segundo artigo mais lido da categoria", category: categoryName || "" },
            { id: "22", title: "Terceiro artigo em destaque", category: categoryName || "" },
          ]} />
          <NewsletterWidget />
        </div>
      </div>
    </div>
  );
}
