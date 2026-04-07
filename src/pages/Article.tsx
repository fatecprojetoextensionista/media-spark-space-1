import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Share2, Bookmark, MessageSquare, Calendar, User } from "lucide-react";
import { NewsletterWidget } from "@/components/portal/SidebarWidget";

export default function Article() {
  const { id } = useParams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
        <Link to="/" className="flex items-center gap-1 hover:text-accent transition-colors">
          <ChevronLeft size={16} />
          <span>Início</span>
        </Link>
        <span>/</span>
        <span>Institucional</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <article className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs font-medium rounded">Institucional</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
                  Novo Projeto de Modernização Digital é Anunciado para Toda a Organização
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  A instituição revela um plano ambicioso de transformação digital que promete revolucionar os serviços oferecidos à comunidade nos próximos anos, com investimento em novas tecnologias e capacitação profissional.
                </p>

                <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">M</div>
                    <div>
                      <p className="text-sm font-medium">Maria Santos</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar size={12} />
                        <span>7 de Abril, 2026</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1" />
                  <div className="flex gap-2">
                    <button className="p-2 rounded-md border border-border hover:bg-muted transition-colors"><Share2 size={16} /></button>
                    <button className="p-2 rounded-md border border-border hover:bg-muted transition-colors"><Bookmark size={16} /></button>
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              <div className="rounded-lg overflow-hidden bg-muted aspect-video flex items-center justify-center mb-8">
                <span className="text-6xl">🏢</span>
              </div>

              {/* Content */}
              <div className="prose prose-lg max-w-none space-y-4 text-foreground/90">
                <p>A diretoria anunciou nesta segunda-feira o maior programa de modernização digital da história da instituição, com investimento previsto de R$ 50 milhões ao longo dos próximos três anos.</p>
                <p>O projeto, denominado "Portal Digital 2030", contempla a atualização de toda a infraestrutura tecnológica, implementação de novos sistemas de gestão e a criação de uma plataforma integrada de serviços digitais.</p>

                <blockquote className="border-l-4 border-accent bg-accent/5 p-6 rounded-r-lg my-8 not-italic">
                  <p className="font-serif text-lg text-foreground">"Este é um marco histórico para a nossa instituição. Estamos investindo no futuro para garantir que nossos serviços sejam acessíveis, eficientes e modernos."</p>
                  <cite className="text-sm text-muted-foreground mt-2 block">— Dr. Roberto Almeida, Diretor-Geral</cite>
                </blockquote>

                <p>Entre as principais iniciativas estão a digitalização completa de processos internos, a implementação de um sistema de atendimento online 24 horas e o desenvolvimento de aplicativos móveis para facilitar o acesso da comunidade aos serviços.</p>
                <p>O programa também inclui um amplo plano de capacitação para os colaboradores, com cursos de formação em novas tecnologias, gestão de dados e segurança da informação.</p>
                <p>As primeiras entregas estão previstas para o segundo semestre de 2026, com a implantação do novo portal de serviços e do sistema integrado de gestão documental.</p>
              </div>

              {/* Tags */}
              <div className="border-t border-border pt-6 mt-8">
                <span className="text-sm font-medium mb-3 block">Tags:</span>
                <div className="flex flex-wrap gap-2">
                  {["Modernização", "Digital", "Tecnologia", "Inovação", "Gestão"].map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full hover:bg-accent/10 hover:text-accent transition-colors cursor-pointer">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>

          {/* Comments */}
          <div className="bg-card rounded-lg border border-border p-6 md:p-8 mt-6">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare size={20} />
              <h2 className="font-serif font-semibold text-xl">Comentários (3)</h2>
            </div>
            <div className="bg-muted rounded-lg p-4 mb-6">
              <textarea placeholder="Escreva um comentário..." className="w-full bg-card rounded-md border border-border p-3 text-sm resize-none h-20 focus:outline-none focus:ring-1 focus:ring-accent mb-3" />
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
                Publicar
              </button>
            </div>
            <div className="space-y-4">
              {[
                { name: "Carlos M.", text: "Excelente iniciativa! Aguardando ansiosamente as novidades.", time: "2 horas atrás" },
                { name: "Ana P.", text: "Muito bom saber que a instituição está investindo em tecnologia.", time: "5 horas atrás" },
                { name: "Roberto S.", text: "Parabéns pela transparência na comunicação deste projeto.", time: "1 dia atrás" },
              ].map((comment, i) => (
                <div key={i} className="border-b border-border pb-4 last:border-0">
                  <div className="flex gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">{comment.name.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-medium">{comment.name}</p>
                      <p className="text-xs text-muted-foreground">{comment.time}</p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 ml-11">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card rounded-lg border border-border p-5">
            <h3 className="font-serif font-semibold text-lg mb-4">Artigos Relacionados</h3>
            <div className="space-y-4">
              {[
                { id: "2", title: "Avanços Tecnológicos na Gestão Pública" },
                { id: "3", title: "Evento de Inovação Reúne Especialistas" },
                { id: "4", title: "Relatório Anual Destaca Crescimento" },
              ].map((a) => (
                <Link key={a.id} to={`/artigo/${a.id}`} className="block group pb-3 border-b border-border last:border-0 last:pb-0">
                  <div className="rounded-md bg-muted aspect-video flex items-center justify-center mb-2 text-2xl">📄</div>
                  <p className="text-sm font-medium group-hover:text-accent transition-colors">{a.title}</p>
                </Link>
              ))}
            </div>
          </div>
          <NewsletterWidget />
        </div>
      </div>
    </div>
  );
}
