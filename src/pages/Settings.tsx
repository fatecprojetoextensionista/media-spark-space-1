export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-1">Configurações</h1>
        <p className="text-muted-foreground text-sm">Gerir as configurações do portal e da sua conta</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["Geral", "Segurança", "Notificações", "Privacidade"].map((tab, i) => (
          <button key={tab} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${i === 0 ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* Personal Info */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-semibold mb-4">Informações Pessoais</h3>
          <div className="space-y-4">
            {["Nome Completo", "Email", "Telefone"].map((field) => (
              <div key={field}>
                <label className="text-sm font-medium text-muted-foreground block mb-1">{field}</label>
                <input className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card focus:outline-none focus:ring-1 focus:ring-accent" />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-1">Biografia</label>
              <textarea rows={3} className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card resize-none focus:outline-none focus:ring-1 focus:ring-accent" />
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-semibold mb-4">Preferências</h3>
          <div className="space-y-4">
            {[
              "Receber notificações por email",
              "Receber notificações push",
              "Guardar alterações automaticamente",
              "Mostrar status online",
            ].map((setting) => (
              <div key={setting} className="flex items-center justify-between py-2">
                <span className="text-sm">{setting}</span>
                <div className="w-10 h-5 bg-accent rounded-full relative cursor-pointer">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-accent-foreground rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dropdowns */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-semibold mb-4">Regional</h3>
          <div className="space-y-4">
            {[
              { label: "Idioma", options: ["Português", "English", "Español"] },
              { label: "Fuso Horário", options: ["UTC-3 (Brasília)", "UTC-0 (Londres)", "UTC+1 (Lisboa)"] },
              { label: "Formato de Data", options: ["DD/MM/AAAA", "MM/DD/AAAA", "AAAA-MM-DD"] },
            ].map((field) => (
              <div key={field.label}>
                <label className="text-sm font-medium text-muted-foreground block mb-1">{field.label}</label>
                <select className="w-full px-3 py-2 border border-border rounded-md text-sm bg-card focus:outline-none focus:ring-1 focus:ring-accent">
                  {field.options.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Danger */}
        <div className="bg-destructive/5 rounded-lg border border-destructive/30 p-6">
          <h3 className="font-semibold text-destructive mb-2">Zona de Risco</h3>
          <p className="text-sm text-muted-foreground mb-4">Ações irreversíveis. Tenha cuidado ao proceder.</p>
          <button className="px-4 py-2 border border-destructive text-destructive rounded-md text-sm hover:bg-destructive hover:text-destructive-foreground transition-colors">
            Eliminar Conta
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button className="px-6 py-2 border border-border rounded-md hover:bg-muted transition-colors text-sm">Cancelar</button>
          <button className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity">Guardar</button>
        </div>
      </div>
    </div>
  );
}
