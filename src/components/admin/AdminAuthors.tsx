import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableTableRow } from '@/components/ui/table';

interface Author {
  id: string;
  name: string;
  photo_url: string;
  linkedin_url: string;
  email: string;
  role_type: string;
}

export default function AdminAuthors() {
  const { toast } = useToast();
  const [authors, setAuthors] = useState<Author[]>([]);
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [email, setEmail] = useState('');
  const [roleType, setRoleType] = useState('autor');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({ title: "Erro ao buscar autores", description: error.message, variant: "destructive" });
    } else {
      setAuthors(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('authors').insert([
      {
        name,
        photo_url: photoUrl,
        linkedin_url: linkedin,
        email,
        role_type: roleType,
      },
    ]);

    setLoading(false);

    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sucesso!", description: "Novo integrante adicionado com sucesso." });
      setName('');
      setPhotoUrl('');
      setLinkedin('');
      setEmail('');
      fetchAuthors();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este integrante?")) return;
    
    const { error } = await supabase.from('authors').delete().eq('id', id);
    if (error) {
      toast({ title: "Erro ao deletar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Removido!", description: "Integrante removido com sucesso." });
      fetchAuthors();
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gerenciar Autores e Equipe</h1>
        <p className="text-muted-foreground">Adicione autores, desenvolvedores ou orientadores do projeto.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 border rounded-xl bg-card space-y-4 max-w-2xl">
        <h2 className="text-xl font-semibold">Novo Integrante</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Tipo de Categoria</Label>
            <Select value={roleType} onValueChange={setRoleType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o papel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="autor">Autor</SelectItem>
                <SelectItem value="desenvolvedor">Desenvolvedor</SelectItem>
                <SelectItem value="orientador">Orientador</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="photo">URL da Foto</Label>
          <Input id="photo" type="url" placeholder="https://exemplo.com/foto.jpg" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin">Link do LinkedIn</Label>
            <Input id="linkedin" type="url" placeholder="https://linkedin.com/in/perfil" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail de Contato</Label>
            <Input id="email" type="email" placeholder="nome@fatec.sp.gov.br" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Adicionar Membro"}
        </Button>
      </form>

      <div className="border rounded-xl bg-card">
        <Table>
          <TableHeader>
            <TableTableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableTableRow>
          </TableHeader>
          <TableBody>
            {authors.map((author) => (
              <TableTableRow key={author.id}>
                <TableCell className="font-medium">{author.name}</TableCell>
                <TableCell className="capitalize">{author.role_type}</TableCell>
                <TableCell>{author.email || '-'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(author.id)}>
                    Remover
                  </Button>
                </TableCell>
              </TableTableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
