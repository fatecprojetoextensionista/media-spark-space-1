import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, User, Trash2, Loader2, Linkedin, Mail } from "lucide-react";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Campos do formulário com o escopo solicitado
  const [name, setName] = useState("");
  const [roleType, setRoleType] = useState<'autor' | 'desenvolvedor' | 'orientador'>("autor");
  const [photoUrl, setPhotoUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [email, setEmail] = useState("");

  const { toast } = useToast();

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("authors") // Corrigido para a tabela de autores correta
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAuthors((data as Author[]) || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar autores",
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
        description: "Integrante cadastrado com sucesso.",
      });

      // Resetar o formulário
      setName("");
      setRoleType("autor");
      setPhotoUrl("");
      setLinkedinUrl("");
      setEmail("");
      setIsDialogOpen(false);
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

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este integrante?")) return;

    try {
      const { error } = await supabase
        .from("authors")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Removido",
        description: "Integrante removido com sucesso.",
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
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Autores e Equipe</h1>
          <p className="text-muted-foreground">
            Gerencie os autores, desenvolvedores e orientadores do portal.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={16} /> Novo Integrante
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Integrante</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                <Label htmlFor="role_type">Categoria *</Label>
                <Select value={roleType} onValueChange={(value: any) => setRoleType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="autor">Autor</SelectItem>
                    <SelectItem value="desenvolvedor">Desenvolvedor</SelectItem>
                    <SelectItem value="orientador">Orientador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photo">URL da Foto</Label>
                <Input 
                  id="photo" 
                  value={photoUrl} 
                  onChange={(e) => setPhotoUrl(e.target.value)} 
                  placeholder="https://exemplo.com/suafoto.jpg" 
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
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="exemplo@fatec.sp.gov.br" 
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Integrante"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-card">
        {loading ? (
          <div className="p-8 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : authors.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Nenhum integrante cadastrado ainda.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Foto</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Contatos</TableHead>
                <TableHead className="w-[100px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {authors.map((author) => (
                <TableRow key={author.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={author.photo_url || ""} alt={author.name} />
                      <AvatarFallback><User size={16} /></AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{author.name}</TableCell>
                  <TableCell className="capitalize text-muted-foreground">{author.role_type}</TableCell>
                  <TableCell>
                    <div className="flex gap-2 text-muted-foreground">
                      {author.linkedin_url && <Linkedin size={16} className="text-blue-500" />}
                      {author.email && <Mail size={16} />}
                      {!author.linkedin_url && !author.email && "-"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(author.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
