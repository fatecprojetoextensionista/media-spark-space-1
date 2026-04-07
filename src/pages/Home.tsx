import { Link } from "react-router-dom";
import { ArticleCard } from "@/components/portal/ArticleCard";
import { TrendingWidget, NewsletterWidget, CategoriesWidget } from "@/components/portal/SidebarWidget";
import heroBg from "@/assets/hero-bg.jpg";

const featuredArticle = {
  id: "1",
  title: "Novo Projeto de Modernização Digital é Anunciado",
  excerpt: "A instituição revela plano ambicioso de transformação digital que promete revolucionar os serviços oferecidos à comunidade nos próximos anos.",
  category: "Institucional",
  author: "Maria Santos",
  date: "7 Abr 2026",
};

const articles = [
  { id: "2", title: "Avanços Tecnológicos na Gestão Pública", excerpt: "Novas ferramentas digitais estão transformando a forma como os serviços públicos são geridos e entregues.", category: "Tecnologia", author: "João Silva", date: "6 Abr 2026" },
  { id: "3", title: "Evento de Inovação Reúne Especialistas", excerpt: "Conferência anual atrai mais de 500 participantes para debater o futuro da inovação.", category: "Eventos", author: "Ana Costa", date: "5 Abr 2026" },
  { id: "4", title: "Relatório Anual Destaca Crescimento Sustentável", excerpt: "Os números do último exercício fiscal mostram um crescimento consistente em todas as áreas.", category: "Institucional", author: "Carlos Mendes", date: "4 Abr 2026" },
  { id: "5", title: "Parceria Internacional Amplia Alcance dos Projetos", excerpt: "Novo acordo de cooperação abre portas para intercâmbio de conhecimento e tecnologia.", category: "Notícias", author: "Lucia Ferreira", date: "3 Abr 2026" },
];

const latestStories = [
  { id: "6", title: "Programa de Capacitação Abre Novas Inscrições", excerpt: "Oportunidades de formação profissional disponíveis para todos os colaboradores.", category: "Recursos", author: "Pedro Oliveira", date: "2 Abr 2026" },
  { id: "7", title: "Semana da Sustentabilidade Começa Segunda-feira", excerpt: "Atividades e palestras sobre práticas sustentáveis no ambiente corporativo.", category: "Eventos", author: "Rita Souza", date: "1 Abr 2026" },
  { id: "8", title: "Novo Sistema de Atendimento Entra em Operação", excerpt: "Plataforma digital melhora a experiência dos usuários com atendimento 24/7.", category: "Tecnologia", author: "Bruno Lima", date: "31 Mar 2026" },
  { id: "9", title: "Balanço Social 2025 é Publicado", excerpt: "Documento destaca as ações sociais e o impacto positivo na comunidade.", category: "Institucional", author: "Carla Santos", date: "30 Mar 2026" },
  { id: "10", title: "Hackathon Interno Gera Soluções Inovadoras", excerpt: "Equipes multidisciplinares apresentam projetos para otimizar processos.", category: "Tecnologia", author: "Diego Ramos", date: "29 Mar 2026" },
];

const trendingItems = [
  { id: "1", title: "Novo Projeto de Modernização Digital é Anunciado", category: "Institucional" },
  { id: "2", title: "Avanços Tecnológicos na Gestão Pública", category: "Tecnologia" },
  { id: "3", title: "Evento de Inovação Reúne Especialistas", category: "Eventos" },
  { id: "6", title: "Programa de Capacitação Abre Novas Inscrições", category: "Recursos" },
  { id: "7", title: "Semana da Sustentabilidade Começa Segunda-feira", category: "Eventos" },
];

const categoriesList = [
  { name: "Notícias", count: 42 },
  { name: "Tecnologia", count: 28 },
  { name: "Institucional", count: 35 },
  { name: "Eventos", count: 16 },
  { name: "Recursos", count: 23 },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <div className="relative h-[400px] overflow-hidden">
        <img src={heroBg} alt="Portal" className="w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
            <div className="inline-block px-3 py-1 bg-destructive text-destructive-foreground text-xs font-semibold rounded mb-3 animate-pulse">
              DESTAQUE
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-2 max-w-2xl">
              {featuredArticle.title}
            </h1>
            <p className="text-primary-foreground/80 max-w-xl mb-4">{featuredArticle.excerpt}</p>
            <Link
              to={`/artigo/${featuredArticle.id}`}
              className="inline-flex px-5 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Ler mais →
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Article Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} {...article} />
              ))}
            </div>

            {/* Latest Stories */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-serif font-bold">Últimas Publicações</h2>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="space-y-4">
                {latestStories.map((story) => (
                  <Link key={story.id} to={`/artigo/${story.id}`} className="group block">
                    <div className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-all">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs font-medium rounded">{story.category}</span>
                            <span className="text-xs text-muted-foreground">{story.date}</span>
                          </div>
                          <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors mb-1">{story.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">{story.excerpt}</p>
                        </div>
                        <div className="w-24 h-24 rounded-md bg-muted flex-shrink-0 flex items-center justify-center text-2xl">
                          📄
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button className="px-8 py-3 border border-border bg-card hover:bg-muted rounded-md text-sm font-medium transition-colors">
                Carregar Mais
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <TrendingWidget items={trendingItems} />
            <NewsletterWidget />
            <CategoriesWidget categories={categoriesList} />
          </div>
        </div>
      </div>
    </div>
  );
}
