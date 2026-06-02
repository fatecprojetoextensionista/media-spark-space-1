import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload, User, Linkedin, Github, Plus, Trash2, Users } from "lucide-react";

interface TeamMember {
  id: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

export default function Profile() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Estados do formulário de cadastro
  const [displayName, setDisplayName] = useState("");
  const [textBio, setTextBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Busca todos os integrantes cadastrados na tabela profiles
  async function fetchTeamMembers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, bio, avatar_url")
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (data) setTeamMembers(data);
    } catch (error: any) {
      toast.error("Erro ao carregar equipe: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Faz upload da foto para o bucket 'avatars'
  async function handleUploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      // Gera um nome único para o arquivo usando o timestamp
      const fileName = `member-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      setAvatarUrl(data.publicUrl);
      toast.success("Foto carregada com sucesso!");
    } catch (error: any) {
      toast.error("Erro no upload da imagem: " + error.message);
    } finally {
      setUploading(false);
    }
  }

  // Salva o novo integrante (Gerando um uuid novo para não amarrar ao auth.uid())
  async function handleCreateMember(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName) return toast.error("O nome é obrigatório");

    try {
      setLoading(true);

      // Agrupa o texto da bio e as redes sociais em formato JSON dentro do campo bio
      const complexBio = JSON.stringify({
        text: textBio,
        linkedin: linkedin,
        github: github
      });

      // Como o e-mail é compartilhado, geramos um ID aleatório para cada perfil criado
      const randomUserId = crypto.randomUUID();

      const { error } = await supabase.from("profiles").insert([
        {
          user_id: randomUserId, // Identificador único do card do integrante
          display_name: displayName,
          bio: complexBio,
          avatar_url: avatarUrl,
        },
      ]);

      if (error) throw error;

      toast.success(`${displayName} foi adicionado à equipe com sucesso!`);
      
      // Limpa o formulário e fecha
      setDisplayName("");
      setTextBio("");
      setAvatarUrl("");
      setLinkedin("");
      setGithub("");
      setShowForm(false);
      
      // Atualiza a listagem
      fetchTeamMembers();
    } catch (error: any) {
      toast.error("Erro ao salvar integrante: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Deleta um integrante da equipe
  async function handleDeleteMember(id: string, name: string | null) {
    if (confirm(`Tem certeza que deseja remover ${name || "este integrante"} da equipe técnica?`)) {
      try {
        setLoading(true);
        const { error } = await supabase
          .from("profiles")
          .delete()
          .eq("id", id);

        if (error) throw error;

        toast.success("Integrante removido com sucesso.");
        fetchTeamMembers();
      } catch (error: any) {
        toast.error("Erro ao remover integrante: " + error.message);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Users className="w-8 h-8" /> Gerenciar Equipe do Portal
          </h1>
          <p className="text-muted-foreground">
            Adicione, visualize ou remova os colaboradores que aparecem na página Sobre do site.
          </p>
        </div>
        
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="bg-primary text-primary-foreground flex items-center gap-2">
            <Plus className="w-4 h-4" /> Adicionar Integrante
          </Button>
        )}
      </div>

      {/* FORMULÁRIO DE CADASTRO (Aparece ao clicar em Adicionar Integrante) */}
      {showForm && (
        <form onSubmit={handleCreateMember} className="bg-card p-6 rounded-xl border border-border space-y-6 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-xl font-bold text-foreground">Novo Integrante da Equipe</h2>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="text-muted-foreground">
              Cancelar
            </Button>
          </div>

          {/* Upload da Foto */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative w-24 h-24 bg-muted rounded-full overflow-hidden border-2 border-primary/20 flex items-center justify-center shadow-inner">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <label className="cursor-pointer flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {avatarUrl ? "Alterar Foto" : "Adicionar Foto"}
              <input type="file" accept="image/*" onChange={handleUploadAvatar} disabled={uploading} className="hidden" />
            </label>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome de Exibição</label>
              <Input 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
                placeholder="Ex: Giovanna Miranda" 
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Atuação / Biografia Curta</label>
              <Textarea 
                value={textBio} 
                onChange={(e) => setTextBio(e.target.value)} 
                placeholder="Ex: Aluna de Design de Mídias Digitais da Fatec. Atuei no design de componentes e estilização da página Sobre."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Linkedin size={14} className="text-blue-600" /> LinkedIn (URL)
                </label>
                <Input 
                  value={linkedin} 
                  onChange={(e) => setLinkedin(e.target.value)} 
                  placeholder="https://linkedin.com/in/perfil" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Github size={14} /> GitHub (URL)
                </label>
                <Input 
                  value={github} 
                  onChange={(e) => setGithub(e.target.value)} 
                  placeholder="https://github.com/usuario" 
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading || uploading} className="w-full bg-primary text-primary-foreground">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Salvar Integrante na Equipe
          </Button>
        </form>
      )}

      {/* LISTAGEM DOS INTEGRANTES ATUAIS (Exatamente como o gerenciador de artigos) */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Integrantes Cadastrados</h2>
        
        {loading && teamMembers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground animate-pulse">
            Buscando membros da equipe...
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl">
            Nenhum integrante cadastrado para a página Sobre até o momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teamMembers.map((member) => (
              <Card key={member.id} className="border-border bg-card shadow-sm overflow-hidden flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted border border-border flex-shrink-0 flex items-center justify-center">
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.display_name || ""} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground leading-tight">
                      {member.display_name || "Sem nome cadastrado"}
                    </h4>
                    <p className="text-xs text-primary font-medium">Colaborador DMD</p>
                  </div>
                </div>

                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDeleteMember(member.id, member.display_name)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
