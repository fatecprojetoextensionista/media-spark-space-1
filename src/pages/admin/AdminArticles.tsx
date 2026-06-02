import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Pencil, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import RichTextEditor from "@/components/admin/RichTextEditor"; // Import do Editor Rico

interface Article { 
  id: string; title: string; slug: string; excerpt: string | null; content: string; 
  cover_image_url: string | null; category_id: string | null; status: string; 
  views: number; published_at: string | null;
  author_name_manual: string | null;
  group_authors: string | null;
  author_photo_url: string | null; 
}
interface Category { id: string; name: string; }

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const articleSchema = z.object({
  title: z.string().min(5, "O título precisa ter pelo menos 5 caracteres."),
  category_id: z.string().min(1, "Por favor, selecione uma categoria."),
  content: z.string().min(20, "O artigo está muito curto. Escreva algum conteúdo."),
});

const empty = { 
  title: "", slug: "", excerpt: "", content: "", cover_image_url: "", 
  category_id: "", status: "draft", author_name_manual: "", group_authors: "", author_photo_url: "" 
};

export default function AdminArticles() {
  const { user } = useAuth();
  const [items, setItems] = useState<Article[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState(empty);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAuthor, setUploadingAuthor] = useState(false);
  
  // ESTADO PARA CONTROLAR SE MOSTRA O HTML OU O EDITOR VISUAL
  const [isHtmlMode, setIsHtmlMode] = useState(false); 

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
    setOpen(true); 
    setIsHtmlMode(false); // Sempre abre no modo visual
  };
  
  const openEdit = (a: Article) => {
    setEditing(a);
    setForm({
      title: a.title, slug: a.slug, excerpt: a.excerpt ?? "", content: a.content,
      cover_image_url: a.cover_image_url ?? "", category_id: a.category_id ?? "", status: a.status,
      author_name_manual: a.author_name_manual ?? "",
      group_authors: a.group_authors ?? "",
      author_photo_url: a.author_photo_url ?? "",
    });
    setIsHtmlMode(false); // Sempre abre no modo visual primeiro
    setOpen(true);
  };

  const uploadCover = async (file: File) => {
    setUploadingCover(true);
    const path = `articles/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    
    if (error) {
      toast.error(error.message);
      setUploadingCover(false);
      return;
    }

    const { data } = supabase.storage.from("media").getPublicUrl(path);
    setForm((f) => ({ ...f, cover_image_url: data.publicUrl }));
    setUploadingCover(false);
    toast.success("Capa atualizada");
  };

  const uploadAuthorPhoto = async (file: File) => {
    setUploadingAuthor(true);
    const path = `authors/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    
    if (error) {
      toast.error(error.message);
      setUploadingAuthor(false);
      return;
    }

    const { data } = supabase.storage.from("media").getPublicUrl(path);
    setForm((f) => ({ ...f, author_photo_url: data.publicUrl }));
    setUploadingAuthor(false);
    toast.success("Foto do autor atualizada");
  };

  const save = async () => {
    const validation = articleSchema.safeParse(form);
    
    if (!validation.success) {
      const errorMessage = validation.error.errors[0].message;
      toast.error(errorMessage);
      return; 
    }

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
      author_photo_url: form.author_photo_url || null,
      published_at: form.status === "published" ? (editing?.published_at ?? new Date().toISOString()) : null,
    };
    
    const { error } = editing
      ? await supabase.from("articles").update(payload).eq("id", editing.id)
      : await supabase.from("articles").insert(payload);
      
    if (error) return toast.error(error.message);
    toast.success("Artigo salvo");
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Novo"} artigo</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              
              <div>
                <Label>Título</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} />
              </div>

              {/* DADOS DO AUTOR */}
              <div className="bg-muted/30 p-4 rounded-lg border border-border/50 space-y-4">
                <h4 className="text-sm font-semibold border-b pb-2">Informações do Autor</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Nome do Autor</Label>
                    <Input value={form.author_name_manual} onChange={(e) => setForm({ ...form, author_name_manual: e.target.value })} placeholder="Ex: Giovanna" />
                  </div>
                  <div>
                    <Label>Grupo / Equipe</Label>
                    <Input value={form.group_authors} onChange={(e) => setForm({ ...form, group_authors: e.target.value })} placeholder="Ex: Design Digital" />
                  </div>
                </div>

                <div>
                  <Label>Foto do Autor</Label>
                  <div className="flex gap-2 items-center">
                    <Input value={form.author_photo_url} onChange={(e) => setForm({ ...form, author_photo_url: e.target.value })} placeholder="URL da foto (opcional)" />
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && uploadAuthorPhoto(e.target.files[0])} />
                      <span className="inline-flex items-center gap-1 px-3 py-2 border border-border rounded-md text-sm hover:bg-muted bg-background whitespace-nowrap">
                        <Upload size={14} /> {uploadingAuthor ? "A enviar..." : "Upload"}
                      </span>
                    </label>
                  </div>
                  {form.author_photo_url && <img src={form.author_photo_url} alt="Autor" className="mt-3 h-14 w-14 rounded-full object-cover border-2 border-primary/20 shadow-sm" />}
                </div>
              </div>

              <div><Label>Resumo</Label><Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>

              {/* === CONTEÚDO COM ALTERNÂNCIA (VISUAL / HTML) === */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Conteúdo do Artigo</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsHtmlMode(!isHtmlMode)}
                  >
                    {isHtmlMode ? "🎨 Usar Editor Visual" : "⌨️ Editar Código HTML"}
                  </Button>
                </div>
                
                {isHtmlMode ? (
                  <Textarea 
                    rows={15} 
                    value={form.content} 
                    onChange={(e) => setForm({ ...form, content: e.target.value })} 
                    placeholder="Cole o seu código HTML aqui..." 
                    className="font-mono text-sm bg-muted/30"
                  />
                ) : (
                  <RichTextEditor 
                    value={form.content} 
                    onChange={(html) => setForm({ ...form, content: html })} 
                  />
                )}
              </div>
              {/* ================================================= */}
              
              <div>
                <Label>Imagem de capa principal</Label>
                <div className="flex gap-2 items-center">
                  <Input value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} placeholder="URL da imagem" />
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && uploadCover(e.target.files[0])} />
                    <span className="inline-flex items-center gap-1 px-3 py-2 border border-border rounded-md text-sm hover:bg-muted bg-background whitespace-nowrap">
                      <Upload size={14} /> {uploadingCover ? "A enviar..." : "Upload"}
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

              <div><Label>Slug (URL do artigo)</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>

              <Button onClick={save} className="w-full">Guardar Artigo</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
