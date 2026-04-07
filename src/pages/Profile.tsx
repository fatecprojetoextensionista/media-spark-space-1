export default function Profile() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-1">Perfil</h1>
        <p className="text-muted-foreground text-sm">Gerir informações do seu perfil</p>
      </div>

      {/* Profile Card */}
      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-28 h-28 rounded-lg bg-primary flex-shrink-0 flex items-center justify-center text-primary-foreground text-3xl font-bold">
            MS
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-4">
              <div>
                <h2 className="text-xl font-semibold">Maria Santos</h2>
                <p className="text-sm text-muted-foreground">Gestora de Comunicação</p>
              </div>
              <button className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors text-sm">
                Editar Perfil
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {[
                { label: "Email", value: "maria@portal.org" },
                { label: "Telefone", value: "+55 11 9999-0000" },
                { label: "Departamento", value: "Comunicação" },
                { label: "Desde", value: "Jan 2024" },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{f.label}</p>
                  <p className="text-sm font-medium">{f.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="bg-card rounded-lg border border-border p-6 mb-6">
        <h3 className="font-semibold mb-3">Sobre</h3>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Profissional com mais de 10 anos de experiência em comunicação institucional, gestão de conteúdo digital e estratégias de mídia. Responsável pela coordenação editorial do Portal Institucional.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Activity */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-semibold mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            {[
              { action: "Publicou artigo sobre Modernização", time: "2h atrás" },
              { action: "Editou seção Sobre do portal", time: "5h atrás" },
              { action: "Adicionou novo vídeo institucional", time: "1 dia atrás" },
              { action: "Atualizou perfil de equipe", time: "2 dias atrás" },
            ].map((a, i) => (
              <div key={i} className="flex gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center text-accent text-xs">📝</div>
                <div>
                  <p className="text-sm">{a.action}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-semibold mb-4">Estatísticas</h3>
          <div className="space-y-4">
            {[
              { label: "Artigos Publicados", value: 142 },
              { label: "Comentários", value: 89 },
              { label: "Vídeos", value: 23 },
              { label: "Downloads Gerados", value: 1240 },
            ].map((s) => (
              <div key={s.label} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <span className="text-lg font-bold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
