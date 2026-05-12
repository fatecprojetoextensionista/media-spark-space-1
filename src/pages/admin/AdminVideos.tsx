import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Pencil, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

// 1. Interface atualizada com os novos campos
interface Video { 
  id: string; title: string; slug: string; description: string | null; 
  video_url: string; thumbnail_url: string | null; category_id: string | null; 
  status: string; views: number; published_at: string | null; published?: boolean;
  author_name_manual: string | null;
  group_authors: string | null;
}

interface Category { id: string; name: string; }

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// 2. Estado inicial atualizado
const empty = { 
  title: "", slug: "", description: "", video_url: "", thumbnail_url: "", 
  category_id: "", status: "draft", author_name_manual: "", group_authors: "" 
};

export default function AdminVideos() {
  const { user } = useAuth();
  const [items, setItems] = useState<Video[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Video | null>(null);
  const [form, setForm] = useState(empty);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const load = async () => {
    const [v, c] = await Promise.all([
      supabase.from("videos").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name").order("name"),
    ]);
    setItems(v.data ?? []);
    setCats(c.data ?? []);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };

  const openEdit = (v: Video) => {
    setEditing(v);
    setForm({
      title: v.title, slug: v.slug, description: v.description ?? "",
      video_url: v.video_url, thumbnail_url: v.thumbnail_url ?? "",
      category_id: v.category_id ?? "", 
      status: v.status || (v.published ? "published" : "draft"),
      author_name_manual: v.author_name_manual ?? "",
      group_authors: v.group_authors ?? "",
    });
    setOpen(true);
  };

  const upload = async (file: File, field: "video_url" | "thumbnail_url") => {
    setUploadingField(field);
    const folder = field === "video_url" ? "videos" : "thumbnails";
    const path = `${folder}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { toast.error(error.message); setUploadingField(null); return; }
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    setForm((f) => ({ ...f, [field]: data.publicUrl }));
    setUploadingField(null);
    toast.success("Ficheiro carregado com sucesso!");
  };

  const save = async () => {
    const isPublished = form.status === "published";
    
    const payload: any = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      description: form.description || null,
      video_url: form.video_url,
      thumbnail_url: form.thumbnail_url || null,
      category_id: form.category_id || null,
      status: form.status,
      published: isPublished,
      author_id: user?.id,
      author_name_manual: form.author_name_manual || null,
      group_authors: form.group_authors || null,
      published_at: isPublished ? (editing?.published_at ?? new Date().toISOString()) : null,
    };

    const { error } = editing
      ? await supabase.from("videos").update(payload).eq("id", editing.id)
      : await supabase.from("videos").insert(payload);

    if (error) return toast.error(error.message);
    
    toast.success("Alterações guardadas!");
    setOpen(false);
    await load();
  };

  const remove = async (id: string) => {
    if (!confirm("Apagar vídeo permanentemente?")) return;
    const { error } = await supabase.from("videos").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Vídeo removido");
    load();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold uppercase tracking-tighter">Vídeos</h1>
          <p className="text-muted-foreground text-sm">Gerencie o conteúdo de vídeo do portal</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="bg-primary hover:opacity-90">
              <Plus size={16} className="mr-2" />Novo vídeo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Novo"} vídeo</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Título</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} /></div>
              
              {/* 3. Novos campos de Autor e Grupo adicionados aqui */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Nome do Autor</Label>
                  <Input 
                    value={form.author_name_manual} 
                    onChange={(e) => setForm({ ...form, author_name_manual: e.target.value })} 
                    placeholder="Ex: Giovanna" 
                  />
                </div>
                <div>
                  <Label>Grupo / Equipe</Label>
                  <Input 
                    value={form.group_authors} 
                    onChange={(e) => setForm({ ...form, group_authors: e.target.value })} 
                    placeholder="Ex: Design Digital" 
                  />
                </div>
              </div>

              <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
              
              {/* Placeholder atualizado para indicar que é a descrição/resumo */}
              <div>
                <Label>Descrição / Resumo</Label>
                <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Escreva um breve resumo do vídeo..." />
              </div>

              <div>
                <Label>URL do vídeo</Label>
                <div className="flex gap-2 items-center">
                  <Input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="URL do YouTube ou carregue ficheiro" />
                  <label className="cursor-pointer">
                    <input type="file" accept="video/*" className="hidden" onChange={(e) => e.target.files && upload(e.target.files[0], "video_url")} />
                    <span className="inline-flex items-center gap-1 px-3 py-2 border border-border rounded-md text-sm hover:bg-muted transition-colors">
                      <Upload size={14} />{uploadingField === "video_url" ? "..." : "Upload"}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <Label>Thumbnail (Capa)</Label>
                <div className="flex gap-2 items-center">
                  <Input value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} placeholder="URL da imagem ou carregue ficheiro" />
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && upload(e.target.files[0], "thumbnail_url")} />
                    <span className="inline-flex items-center gap-1 px-3 py-2 border border-border rounded-md text-sm hover:bg-muted transition-colors">
                      <Upload size={14} />{uploadingField === "thumbnail_url" ? "..." : "Upload"}
                    </span>
                  </label>
                </div>
                {form.thumbnail_url && <img src={form.thumbnail_url} alt="Preview" className="mt-2 h-32 rounded-lg border border-border object-cover" />}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Categoria</Label>
                  <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecionar categoria" /></SelectTrigger>
                    <SelectContent>{cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Estado de Publicação</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={save} className="w-full bg-primary text-primary-foreground h-12">Guardar Alterações</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de listagem permanece igual */}
      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-semibold">Título</th>
              <th className="text-left p-4 font-semibold">Estado</th>
              <th className="text-left p-4 font-semibold">Views</th>
              <th className="w-24 p-4">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((v) => (
              <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium">{v.title}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    v.status === "published" || v.published 
                    ? "bg-green-100 text-green-700 border border-green-200" 
                    : "bg-amber-100 text-amber-700 border border-amber-200"
                  }`}>
                    {v.status === "published" || v.published ? "Publicado" : "Rascunho"}
                  </span>
                </td>
                <td className="p-4 text-muted-foreground">{v.views || 0}</td>
                <td className="p-4 flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(v)} className="hover:text-primary"><Pencil size={14} /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(v.id)} className="hover:text-destructive"><Trash2 size={14} /></Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="p-10 text-center text-muted-foreground italic">
                  Nenhum vídeo encontrado. Comece criando um novo!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
