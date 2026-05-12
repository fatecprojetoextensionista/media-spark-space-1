import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Pencil, Plus, Upload, Copy, Check, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Article { 
  id: string; title: string; slug: string; excerpt: string | null; content: string; 
  cover_image_url: string | null; category_id: string | null; status: string; 
  views: number; published_at: string | null;
  author_name_manual: string | null;
  group_authors: string | null;
}
interface Category { id: string; name: string; }

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const empty = { 
  title: "", slug: "", excerpt: "", content: "", cover_image_url: "", 
  category_id: "", status: "draft", author_name_manual: "", group_authors: "" 
};

export default function AdminArticles() {
  const { user } = useAuth();
  const [items, setItems] = useState<Article[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState(empty);
  const [uploading, setUploading] = useState(false);
  
  // Lista de imagens enviadas nesta sessão para não "perder" o link antes de salvar
  const [sessionImages, setSessionImages] = useState<string[]>([]);

  const load = async () => {
    const [a, c] = await Promise.all([
      supabase.from("articles").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name").order("name"),
    ]);
    setItems(a.data ?? []);
    setCats(c.data ?? []);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { 
    setEditing(null); 
    setForm(empty); 
    setSessionImages([]); 
    setOpen(true); 
  };
  
  const openEdit = (a: Article) => {
    setEditing(a);
    setForm({
      title: a.title, slug: a.slug, excerpt: a.excerpt ?? "", content: a.content,
      cover_image_url: a.cover_image_url ?? "", category_id: a.category_id ?? "", status: a.status,
      author_name_manual: a.author_name_manual ?? "",
      group_authors: a.group_authors ?? "",
    });
    setSessionImages([]);
    setOpen(true);
  };

  const uploadFile = async (file: File, target: 'cover' | 'extra') => {
    setUploading(true);
    const path = `articles/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    
    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("media").getPublicUrl(path);
    
    if (target === 'cover') {
      setForm((f) => ({ ...f, cover_image_url: data.publicUrl }));
      toast.success("Capa definida!");
    } else {
      setSessionImages(prev => [data.publicUrl, ...prev]);
      toast.success("Imagem pronta!");
    }
    
    setUploading(false);
  };

  const copyToClipboard = (url: string) => {
    // COPIA APENAS O LINK PURO
    navigator.clipboard.writeText(url);
    toast.success("Link copiado! Cole no texto.");
  };

  const save = async () => {
    const payload: any = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      excerpt: form.excerpt || null,
      content: form.content,
      cover_image_url: form.cover_image_url || null,
      category_id: form.category_id || null,
      status: form.status,
      author_id: user?.id,
      author_name_manual: form.author_name_manual || null,
      group_authors: form.group_authors || null,
      published_at: form.status === "published" ? (editing?.published_at ?? new Date().toISOString()) : null,
    };
    
    const { error } = editing
      ? await supabase.from("articles").update(payload).eq("id", editing.id)
      : await supabase.from("articles").insert(payload);
      
    if (error) return toast.error(error.message);
    toast.success("Salvo com sucesso!");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Apagar artigo?")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Apagado");
    load();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Artigos</h1>
          <p className="text-muted-foreground text-sm">Gerir publicações do portal</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus size={16} className="mr-2" />Novo artigo</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Novo"} artigo</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              
              <div>
                <Label>Título</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Nome do Autor</Label>
                  <Input value={form.author_name_manual} onChange={(e) => setForm({ ...form, author_name_manual: e.target.value })} placeholder="Ex: João Silva" />
                </div>
                <div>
                  <Label>Grupo / Equipe</Label>
                  <Input value={form.group_authors} onChange={(e) => setForm({ ...form, group_authors: e.target.value })} placeholder="Ex: Equipe TechIn" />
                </div>
              </div>

              <div><Label>Resumo</Label><Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>

              {/* ÁREA DE IMAGENS EXTRAS MELHORADA */}
              <div className="p-4 border rounded-md bg-muted/20 space-y-3">
                <Label className="text-sm flex items-center gap-2 font-bold">
                  <ImageIcon size={16} /> Imagens para o Conteúdo
                </Label>
                
                <div className="flex gap-2">
                  <Input type="file" accept="image/*" className="h-9 text-xs bg-background" onChange={(e) => e.target.files && uploadFile(e.target.files[0], 'extra')} />
                </div>

                {sessionImages.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Links gerados agora:</p>
                    {sessionImages.map((url, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-background border rounded-md">
                        <span className="text-[10px] truncate flex-1">{url}</span>
                        <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={() => copyToClipboard(url)}>
                          <Copy size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Conteúdo (Markdown ou HTML)</Label>
                <Textarea rows={10} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Cole o link aqui dentro de: ![](LINK_AQUI)" />
              </div>
              
              <div className="border-t pt-4">
                <Label className="font-bold">Imagem de Capa (Principal)</Label>
                <div className="flex gap-2 items-center mt-1">
                  <Input value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} placeholder="URL da capa" />
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && uploadFile(e.target.files[0], 'cover')} />
                    <span className="inline-flex items-center gap-1 px-3 py-2 border border-border rounded-md text-sm hover:bg-muted bg-background">
                      <Upload size={14} /> {uploading ? "..." : "Upload"}
                    </span>
                  </label>
                </div>
                {form.cover_image_url && <img src={form.cover_image_url} alt="" className="mt-2 h-24 rounded object-cover border" />}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Categoria</Label>
                  <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                    <SelectContent>{cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estado</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-2 border-t text-[10px] text-muted-foreground italic">
                Dica: Para imagens no texto, use: ![descrição](LINK_COPIADO)
              </div>

              <Button onClick={save} className="w-full">Guardar Artigo</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela... */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Título</th>
              <th className="text-left p-3">Estado</th>
              <th className="text-left p-3">Views</th>
              <th className="w-24"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="border-t border-border hover:bg-muted/20">
                <td className="p-3 font-medium">{a.title}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-xs ${a.status === "published" ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
                    {a.status === "published" ? "Publicado" : "Rascunho"}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground">{a.views}</td>
                <td className="p-3 flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(a)}><Pencil size={14} /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(a.id)}><Trash2 size={14} /></Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Sem artigos</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
