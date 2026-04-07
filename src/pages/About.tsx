import { Mail, Phone, MapPin } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Sobre o Portal</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Conheça a nossa missão, equipa e valores que orientam o nosso trabalho todos os dias.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-card rounded-lg border border-border p-8 mb-8">
        <h2 className="text-2xl font-serif font-bold mb-4">Nossa Missão</h2>
        <p className="text-foreground/80 leading-relaxed">
          O Portal Institucional foi criado para ser o principal canal de comunicação entre a nossa organização e a comunidade. Através da publicação de artigos, vídeos, documentos e recursos, buscamos manter todos informados sobre as atividades, projetos e conquistas da instituição, promovendo a transparência e o diálogo aberto.
        </p>
      </div>

      {/* Team */}
      <div className="mb-8">
        <h2 className="text-2xl font-serif font-bold mb-6">Nossa Equipe</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Dr. Roberto Almeida", role: "Diretor-Geral", initials: "RA" },
            { name: "Maria Santos", role: "Comunicação", initials: "MS" },
            { name: "João Silva", role: "Tecnologia", initials: "JS" },
            { name: "Ana Costa", role: "Eventos", initials: "AC" },
            { name: "Carlos Mendes", role: "Gestão", initials: "CM" },
            { name: "Lucia Ferreira", role: "Recursos", initials: "LF" },
          ].map((person) => (
            <div key={person.name} className="bg-card rounded-lg border border-border p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-20 h-20 rounded-full bg-primary mx-auto mb-4 flex items-center justify-center text-primary-foreground font-bold text-xl">
                {person.initials}
              </div>
              <h3 className="font-semibold mb-1">{person.name}</h3>
              <p className="text-sm text-muted-foreground">{person.role}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="bg-card rounded-lg border border-border p-8 mb-8">
        <h2 className="text-2xl font-serif font-bold mb-6">Nossos Valores</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: "🎯", title: "Transparência", desc: "Comunicação aberta e honesta com todos os públicos." },
            { icon: "🤝", title: "Colaboração", desc: "Trabalho em equipe para alcançar objetivos comuns." },
            { icon: "💡", title: "Inovação", desc: "Busca constante por soluções criativas e eficientes." },
            { icon: "🌱", title: "Sustentabilidade", desc: "Compromisso com o futuro e o desenvolvimento responsável." },
          ].map((v) => (
            <div key={v.title} className="flex gap-4">
              <div className="text-3xl">{v.icon}</div>
              <div>
                <h3 className="font-semibold mb-1">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-primary rounded-lg p-8 mb-8 text-primary-foreground">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "10M+", label: "Visitas" },
            { value: "500+", label: "Artigos" },
            { value: "50+", label: "Colaboradores" },
            { value: "24/7", label: "Disponibilidade" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-serif font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-primary-foreground/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-card rounded-lg border border-border p-8">
        <h2 className="text-2xl font-serif font-bold mb-6">Contato</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="text-accent" size={20} />
              <span className="text-sm">contato@portal.org</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="text-accent" size={20} />
              <span className="text-sm">+55 11 0000-0000</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="text-accent" size={20} />
              <span className="text-sm">Av. Principal, 1000 - São Paulo, SP</span>
            </div>
          </div>
          <div className="space-y-3">
            <input placeholder="Nome" className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card focus:outline-none focus:ring-1 focus:ring-accent" />
            <input placeholder="Email" className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card focus:outline-none focus:ring-1 focus:ring-accent" />
            <textarea placeholder="Mensagem" rows={3} className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card resize-none focus:outline-none focus:ring-1 focus:ring-accent" />
            <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
              Enviar Mensagem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
