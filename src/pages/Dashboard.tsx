import { BarChart3, FileText, Users, Eye, TrendingUp, Download } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Visão geral do portal e gestão de conteúdo</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Artigos Publicados", value: "524", icon: FileText, change: "+12 este mês" },
          { label: "Visualizações", value: "45.2K", icon: Eye, change: "+18% vs mês anterior" },
          { label: "Utilizadores", value: "3.1K", icon: Users, change: "+256 novos" },
          { label: "Downloads", value: "1.8K", icon: Download, change: "+340 este mês" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-lg border border-border p-5">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</span>
              <stat.icon size={18} className="text-accent" />
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-xs text-success flex items-center gap-1">
              <TrendingUp size={12} />
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-semibold mb-4">Visualizações por Mês</h3>
          <div className="h-48 bg-muted rounded-md flex items-end justify-around px-4 pb-4 gap-2">
            {[40, 55, 35, 70, 60, 85, 75, 90, 65, 80, 95, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-accent/80 rounded-t-sm" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2 px-2">
            <span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span>
            <span>Jul</span><span>Ago</span><span>Set</span><span>Out</span><span>Nov</span><span>Dez</span>
          </div>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-semibold mb-4">Conteúdo por Categoria</h3>
          <div className="space-y-3">
            {[
              { name: "Notícias", pct: 85 },
              { name: "Tecnologia", pct: 65 },
              { name: "Institucional", pct: 75 },
              { name: "Eventos", pct: 45 },
              { name: "Recursos", pct: 55 },
            ].map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{cat.name}</span>
                  <span className="text-muted-foreground">{cat.pct}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${cat.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent content table */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold">Publicações Recentes</h3>
          <button className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors text-sm">Exportar</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 font-medium text-muted-foreground">Título</th>
                <th className="text-left py-3 font-medium text-muted-foreground">Categoria</th>
                <th className="text-left py-3 font-medium text-muted-foreground">Data</th>
                <th className="text-left py-3 font-medium text-muted-foreground">Views</th>
              </tr>
            </thead>
            <tbody>
              {[
                { title: "Modernização Digital Anunciada", cat: "Institucional", date: "7 Abr", views: "2.4K" },
                { title: "Avanços Tecnológicos", cat: "Tecnologia", date: "6 Abr", views: "1.8K" },
                { title: "Evento de Inovação", cat: "Eventos", date: "5 Abr", views: "1.5K" },
                { title: "Relatório Anual", cat: "Institucional", date: "4 Abr", views: "3.2K" },
                { title: "Parceria Internacional", cat: "Notícias", date: "3 Abr", views: "980" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="py-3 font-medium">{row.title}</td>
                  <td className="py-3"><span className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded">{row.cat}</span></td>
                  <td className="py-3 text-muted-foreground">{row.date}</td>
                  <td className="py-3 text-muted-foreground">{row.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
