import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface UsuarioPortal {
  user_id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  roles: string[];
}

type PapelGerenciado = "editor" | "admin";

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

  const alterarPapel = async (u: UsuarioPortal, papel: PapelGerenciado, ativo: boolean) => {
    const chave = `${u.user_id}:${papel}`;
    setSalvando(chave);
    const { error } = await chamarRpc("admin_definir_papel", {
      _user_id: u.user_id,
      _role: papel,
      _ativo: ativo,
    });
    setSalvando(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    setUsuarios((lista) =>
      lista.map((item) =>
        item.user_id === u.user_id
          ? {
              ...item,
              roles: ativo
                ? [...new Set([...item.roles, papel])]
                : item.roles.filter((r) => r !== papel),
            }
          : item,
      ),
    );
    const nome = u.display_name || u.email;
    const rotulo = papel === "admin" ? "Administrador" : "Autor";
    toast.success(ativo ? `${nome} agora é ${rotulo}.` : `${nome} deixou de ser ${rotulo}.`);
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
          Pessoas que criaram conta no portal. Autores escrevem e editam os próprios artigos como rascunho;
          administradores publicam e gerenciam todo o conteúdo.
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
                <th scope="col" className="text-center p-3">Autor</th>
                <th scope="col" className="text-center p-3">Administrador</th>
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
                    <td className="p-3 text-center">
                      <Switch
                        checked={u.roles.includes("editor")}
                        disabled={salvando === `${u.user_id}:editor`}
                        onCheckedChange={(v) => alterarPapel(u, "editor", v)}
                        aria-label={`${nome} é autor`}
                      />
                    </td>
                    <td className="p-3 text-center">
                      <Switch
                        checked={u.roles.includes("admin")}
                        disabled={souEu || salvando === `${u.user_id}:admin`}
                        onCheckedChange={(v) => {
                          if (v && !confirm(`Dar acesso total de administrador a ${nome}?`)) return;
                          alterarPapel(u, "admin", v);
                        }}
                        aria-label={`${nome} é administrador`}
                      />
                    </td>
                  </tr>
                );
              })}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
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
