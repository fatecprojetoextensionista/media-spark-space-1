import { Switch } from "@/components/ui/switch";

const PERSONAL_FIELDS = [
  { id: "cfg-nome", label: "Nome Completo", type: "text", autoComplete: "name" },
  { id: "cfg-email", label: "Email", type: "email", autoComplete: "email" },
  { id: "cfg-telefone", label: "Telefone", type: "tel", autoComplete: "tel" },
];

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-1">Configurações</h1>
        <p className="text-muted-foreground text-sm">Gerir as configurações do portal e da sua conta</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {["Geral", "Segurança", "Notificações", "Privacidade"].map((tab, i) => (
          <button
            key={tab}
            type="button"
            aria-current={i === 0 ? "true" : undefined}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-ring ${i === 0 ? 'bg-primary text-primary-foreground' : 'border border-input hover:bg-muted'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-semibold mb-4">Informações Pessoais</h3>
          <div className="space-y-4">
            {PERSONAL_FIELDS.map((field) => (
              <div key={field.id}>
                <label htmlFor={field.id} className="text-sm font-medium text-muted-foreground block mb-1">{field.label}</label>
                <input id={field.id} type={field.type} autoComplete={field.autoComplete} className="w-full px-3 py-2 border border-input rounded-md text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            ))}
            <div>
              <label htmlFor="cfg-bio" className="text-sm font-medium text-muted-foreground block mb-1">Biografia</label>
              <textarea id="cfg-bio" rows={3} className="w-full px-3 py-2 border border-input rounded-md text-sm bg-card resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-semibold mb-4">Preferências</h3>
          <div className="space-y-4">
            {[
              "Receber notificações por email",
              "Receber notificações push",
              "Guardar alterações automaticamente",
              "Mostrar status online",
            ].map((setting, i) => (
              <div key={setting} className="flex items-center justify-between py-2">
                <span id={`cfg-pref-${i}`} className="text-sm">{setting}</span>
                <Switch aria-labelledby={`cfg-pref-${i}`} defaultChecked />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-semibold mb-4">Regional</h3>
          <div className="space-y-4">
            {[
              { id: "cfg-idioma", label: "Idioma", options: ["Português", "English", "Español"] },
              { id: "cfg-fuso", label: "Fuso Horário", options: ["UTC-3 (Brasília)", "UTC-0 (Londres)", "UTC+1 (Lisboa)"] },
              { id: "cfg-data", label: "Formato de Data", options: ["DD/MM/AAAA", "MM/DD/AAAA", "AAAA-MM-DD"] },
            ].map((field) => (
              <div key={field.id}>
                <label htmlFor={field.id} className="text-sm font-medium text-muted-foreground block mb-1">{field.label}</label>
                <select id={field.id} className="w-full px-3 py-2 border border-input rounded-md text-sm bg-card focus:outline-none focus:ring-2 focus:ring-ring">
                  {field.options.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-destructive/5 rounded-lg border border-destructive/30 p-6">
          <h3 className="font-semibold text-destructive mb-2">Zona de Risco</h3>
          <p className="text-sm text-muted-foreground mb-4">Ações irreversíveis. Tenha cuidado ao proceder.</p>
          <button className="px-4 py-2 border border-destructive text-destructive rounded-md text-sm hover:bg-destructive hover:text-destructive-foreground transition-colors">
            Eliminar Conta
          </button>
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" className="px-6 py-2 border border-input rounded-md hover:bg-muted transition-colors text-sm focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-ring">Cancelar</button>
          <button type="button" className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 transition-opacity focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-ring">Guardar</button>
        </div>
      </div>
    </div>
  );
}
