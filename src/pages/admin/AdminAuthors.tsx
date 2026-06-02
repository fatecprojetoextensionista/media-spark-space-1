import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { User, Trash2, Loader2, Linkedin, Mail, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Author {
  id: string;
  name: string;
  photo_url: string | null;
  linkedin_url: string | null;
  email: string | null;
  role_type: 'autor' | 'desenvolvedor' | 'orientador';
  created_at: string;
}

export default function AdminAuthors() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Campos do formulário estruturado
  const [name, setName] = useState("");
  const [roleType, setRoleType] = useState<'autor' | 'desenvolvedor' | 'orientador'>("autor");
  const [photoUrl, setPhotoUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [email, setEmail] = useState("");

  const { toast } = useToast();

  // Buscar integrantes cadastrados
  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("authors")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAuthors((data as Author[]) || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar lista",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  // Cadastrar Novo Membro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from("authors")
        .insert([
          { 
            name, 
            role_type: roleType, 
            photo_url: photoUrl || null,
            linkedin_url: linkedinUrl || null,
            email: email || null
          }
        ]);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `${name} foi adicionado(a) com sucesso!`,
      });

      // Limpar campos do formulário
      setName("");
      setRoleType("autor");
      setPhotoUrl("");
      setLinkedinUrl("");
      setEmail("");
      
      // Atualizar lista em tempo real
      fetchAuthors();
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Remover Integrante
  const handleDelete = async (id: string, authorName: string) => {
    if (!confirm(`Tem certeza que deseja remover ${authorName}?`)) return;

    try {
      const { error } = await supabase
        .from("authors")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Removido",
        description: "Membro removido da equipe.",
      });
      
      setAuthors(authors.filter(author => author.id !== id));
    } catch (error: any) {
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Autores e Equipe</h1>
        <p className="text-muted-foreground">
          Gerencie e cadastre os autores de artigos, desenvolvedores do portal e orientadores.
        </p>
      </div>

      {/* Grade Responsiva: Formulário à esquerda e Tabela à direita em telas grandes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Painel de Cadastro */}
        <Card className="lg:col-span-1 border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus size={18} className="text-primary" />
              Novo Integrante
            </CardTitle>
            <CardDescription>Preencha os dados do colaborador.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input 
                  id="name" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Ex: Giovanna Miranda" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role_type">Categoria do Papel *</Label>
                <Select value={roleType} onValueChange={(value: any) => setRoleType(value)}>
                  <SelectTrigger id="role_type">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="autor">Autor</SelectItem>
                    <SelectItem value="desenvolvedor">Desenvolvedor</SelectItem>
                    <SelectItem value="orientador">Orientador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">URL da Foto de Perfil</Label>
                <Input 
                  id="photo" 
                  value={photoUrl} 
                  onChange={(e) => setPhotoUrl(e.target.value)} 
                  placeholder="https://images.unsplash.com/... ou link público" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">Link do LinkedIn</Label>
                <Input 
                  id="linkedin" 
                  value={linkedinUrl} 
                  onChange={(e) => setLinkedinUrl(e.target.value)} 
                  placeholder="https://linkedin.com/in/seu-perfil" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail Corporativo / Estudantil</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="nome@fatec.sp.gov.br" 
                />
              </div>

              <Button type="submit" className="w-full mt-2" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Adicionar à Equipe"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Tabela de Listagem e Visualização */}
        <Card className="lg:col-span-2 border-border bg-card shadow-sm h-full">
          <CardHeader>
            <CardTitle className="text-lg">Integrantes Registrados</CardTitle>
            <CardDescription>Visualização em tempo real das pessoas inseridas no sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md bg-background overflow-hidden">
              {loading ? (
                <div className="p-12 flex justify-center items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : authors.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground text-sm">
                  Nenhum integrante cadastrado para exibição.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="w-[70px]">Perfil</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Redes / Contato</TableHead>
                      <TableHead className="w-[80px] text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authors.map((author) => (
                      <TableRow key={author.id} className="hover:bg-muted/20 transition-colors">
                        <TableCell>
                          <Avatar className="h-9 w-9 border border-border">
                            <AvatarImage src={author.photo_url || ""} alt={author.name} className="object-cover" />
                            <AvatarFallback><User size={15} /></AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium text-sm">{author.name}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize inline-block ${
                            author.role_type === 'orientador' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                            author.role_type === 'desenvolvedor' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {author.role_type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3 text-muted-foreground">
                            {author.linkedin_url ? (
                              <a href={author.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">
                                <Linkedin size={16} />
                              </a>
                            ) : <span className="text-xs opacity-40">-</span>}
                            {author.email ? (
                              <a href={`mailto:${author.email}`} className="hover:text-primary transition-colors">
                                <Mail size={16} />
                              </a>
                            ) : <span className="text-xs opacity-40">-</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                            onClick={() => handleDelete(author.id, author.name)}
                          >
                            <Trash2 size={15} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
