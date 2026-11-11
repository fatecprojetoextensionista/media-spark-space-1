import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UsuarioPortal {
  user_id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  roles: string[];
}

type Papel = "editor" | "admin" | "bloqueado";

const ROTULO: Record<Papel, string> = {
  editor: "Autor",
  admin: "Administrador",
  bloqueado: "Bloqueado",
};

const papelAtual = (roles: string[]): Papel =>
  roles.includes("admin") ? "admin" : roles.includes("bloqueado") ? "bloqueado" : "editor";

const chamarRpc = (nome: string, args?: Record<string, unknown>) =>
  (supabase.rpc as unknown as (
    fn: string,
    params?: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message: string } | null }>)(nome, args);

const formatarData = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR") : "Nunca";

export default function AdminUsers() {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = useState<UsuarioPortal[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const carregar = async () => {
    setCarregando(true);
    const { data, error } = await chamarRpc("admin_listar_usuarios");
    if (error) toast.error(`Erro ao carregar usuários: ${error.message}`);
    else setUsuarios((data as UsuarioPortal[]) ?? []);
    setCarregando(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const alterarPapel = async (u: UsuarioPortal, papel: Papel) => {
    const nome = u.display_name || u.email;
    if (papel === "admin" && !confirm(`Dar acesso total de administrador a ${nome}?`)) return;
    setSalvando(u.user_id);
    const { error } = await chamarRpc("admin_definir_papel", { _user_id: u.user_id, _role: papel });
    setSalvando(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    setUsuarios((lista) => lista.map((item) => (item.user_id === u.user_id ? { ...item, roles: [papel] } : item)));
    toast.success(`${nome} agora é ${ROTULO[papel]}.`);
  };

  const termo = busca.trim().toLowerCase();
  const filtrados = termo
    ? usuarios.filter(
        (u) => u.email.toLowerCase().includes(termo) || (u.display_name ?? "").toLowerCase().includes(termo),
      )
    : usuarios;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold">Usuários</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Toda conta criada no portal já é Autor: escreve os próprios artigos e envia para revisão.
          Administradores publicam e gerenciam todo o conteúdo. Contas bloqueadas não conseguem escrever.
        </p>
      </div>

      <div className="max-w-sm">
        <label htmlFor="busca-usuarios" className="sr-only">
          Buscar por nome ou e-mail
        </label>
        <Input
          id="busca-usuarios"
          type="search"
          placeholder="Buscar por nome ou e-mail"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className="bg-card border border-border rounded-lg overflow-x-auto shadow-sm">
        {carregando ? (
          <div className="p-12 flex justify-center" role="status">
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
            <span className="sr-only">Carregando usuários…</span>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th scope="col" className="text-left p-3">Nome</th>
                <th scope="col" className="text-left p-3">E-mail</th>
                <th scope="col" className="text-left p-3">Cadastro</th>
                <th scope="col" className="text-left p-3">Último acesso</th>
                <th scope="col" className="text-left p-3 w-48">Papel</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u) => {
                const nome = u.display_name || u.email;
                const souEu = u.user_id === user?.id;
                return (
                  <tr key={u.user_id} className="border-t border-border hover:bg-muted/20">
                    <td className="p-3 font-medium">
                      {u.display_name || <span className="text-muted-foreground">Sem nome</span>}
                      {souEu && <span className="ml-2 text-xs text-muted-foreground">(você)</span>}
                    </td>
                    <td className="p-3 text-muted-foreground">{u.email}</td>
                    <td className="p-3 text-muted-foreground">{formatarData(u.created_at)}</td>
                    <td className="p-3 text-muted-foreground">{formatarData(u.last_sign_in_at)}</td>
                    <td className="p-3">
                      <Select
                        value={papelAtual(u.roles)}
                        onValueChange={(v) => alterarPapel(u, v as Papel)}
                        disabled={souEu || salvando === u.user_id}
                      >
                        <SelectTrigger aria-label={`Papel de ${nome}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="editor">Autor</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="bloqueado">Bloqueado</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                );
              })}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
