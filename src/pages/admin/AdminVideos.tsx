import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Pencil, Plus, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Video {
  id: string; title: string; slug: string; description: string | null;
  video_url: string; thumbnail_url: string | null; category_id: string | null;
  status: string; views: number; published_at: string | null; published?: boolean;
  author_name_manual: string | null;
  group_authors: string | null;
}

interface Category { id: string; name: string; }

type StatusAutor = "draft" | "review";

const STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho",
  review: "Em revisão",
  published: "Publicado",
};

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const empty = {
  title: "", slug: "", description: "", video_url: "", thumbnail_url: "",
  category_id: "", status: "draft", author_name_manual: "", group_authors: ""
};

const ehLinkYoutube = (url: string) =>
  /^https?:\/\/(www\.|m\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)[\w-]{6,}/i.test(url.trim());

const statusDe = (v: Video) => v.status || (v.published ? "published" : "draft");

export default function AdminVideos() {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState<Video[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Video | null>(null);
  const [form, setForm] = useState(empty);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const load = async () => {
    let query = supabase.from("videos").select("*").order("created_at", { ascending: false });
    if (!isAdmin && user) query = query.eq("author_id", user.id);
    const [v, c] = await Promise.all([
      query,
      supabase.from("categories").select("id, name").order("name"),
    ]);
    const lista = (v.data ?? []) as unknown as Video[];
    setItems(isAdmin ? [...lista].sort((x, y) => Number(statusDe(y) === "review") - Number(statusDe(x) === "review")) : lista);
    setCats(c.data ?? []);
  };

  useEffect(() => { load(); }, [isAdmin, user?.id]);

  const canChange = (v: Video) => isAdmin || statusDe(v) !== "published";

  const openNew = () => {
    setEditing(null);
    setForm({ ...empty, author_name_manual: isAdmin ? "" : (user?.user_metadata?.display_name ?? "") });
    setOpen(true);
  };

  const openEdit = (v: Video) => {
    setEditing(v);
    setForm({
      title: v.title, slug: v.slug, description: v.description ?? "",
      video_url: v.video_url, thumbnail_url: v.thumbnail_url ?? "",
      category_id: v.category_id ?? "",
      status: statusDe(v),
      author_name_manual: v.author_name_manual ?? "",
      group_authors: v.group_authors ?? "",
    });
    setOpen(true);
  };

  const upload = async (file: File, field: "thumbnail_url") => {
    setUploadingField(field);
    const nomeLimpo = file.name.toLowerCase().normalize("NFD").replace(/[^a-z0-9.]+/g, "-");
    const path = `thumbnails/${Date.now()}-${nomeLimpo}`;
    const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type });
    if (error) { toast.error(error.message); setUploadingField(null); return; }
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    setForm((f) => ({ ...f, [field]: data.publicUrl }));
    setUploadingField(null);
    toast.success("Arquivo enviado.");
  };

  const save = async (statusAutor?: StatusAutor) => {
    if (form.title.trim().length < 5) return toast.error("O título precisa ter pelo menos 5 caracteres.");
    if (!ehLinkYoutube(form.video_url)) return toast.error("Cole um link do YouTube (youtube.com ou youtu.be).");
    if (!form.category_id) return toast.error("Por favor, selecione uma categoria.");

    const status = isAdmin ? form.status : (statusAutor ?? "draft");
    const isPublished = status === "published";

    const payload: Record<string, unknown> = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      description: form.description || null,
      video_url: form.video_url,
      thumbnail_url: form.thumbnail_url || null,
      category_id: form.category_id || null,
      status,
      published: isPublished,
      author_name_manual: form.author_name_manual || null,
      group_authors: form.group_authors || null,
      published_at: isPublished ? (editing?.published_at ?? new Date().toISOString()) : null,
    };
    if (!editing) payload.author_id = user?.id;

    const { data, error } = editing
      ? await supabase.from("videos").update(payload as never).eq("id", editing.id).select("id")
      : await supabase.from("videos").insert(payload as never).select("id");

    if (error) return toast.error(error.message);
    if (!data || data.length === 0) return toast.error("Sem permissão para salvar este vídeo.");

    toast.success(
      isAdmin
        ? "Alterações guardadas!"
        : status === "review"
          ? "Vídeo enviado para revisão. Um administrador vai avaliar e publicar."
          : "Rascunho salvo.",
    );
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

  const pendentes = items.filter((v) => statusDe(v) === "review").length;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold uppercase tracking-tighter">Vídeos</h1>
          <p className="text-muted-foreground text-sm">
            {isAdmin
              ? "Gerencie o conteúdo de vídeo do portal"
              : "Os seus vídeos. Salve como rascunho; um administrador revisa e publica."}
          </p>
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

              <div>
                <Label>Descrição / Resumo</Label>
                <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Escreva um breve resumo do vídeo..." />
              </div>

              <div>
                <Label htmlFor="video-url">Link do YouTube</Label>
                <Input
                  id="video-url"
                  type="url"
                  value={form.video_url}
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  aria-describedby="video-url-ajuda"
                />
                <p id="video-url-ajuda" className="mt-1 text-xs text-muted-foreground">
                  Publique o vídeo no YouTube (pode ser como "Não listado") e cole o link aqui.
                </p>
              </div>

              <div>
                <Label>Thumbnail (Capa)</Label>
                <div className="flex gap-2 items-center">
                  <Input value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} placeholder="URL da imagem ou envie o arquivo" />
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && upload(e.target.files[0], "thumbnail_url")} />
                    <span className="inline-flex items-center gap-1 px-3 py-2 border border-border rounded-md text-sm hover:bg-muted transition-colors">
                      <Upload size={14} />{uploadingField === "thumbnail_url" ? "Enviando..." : "Upload"}
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
                {isAdmin ? (
                  <div>
                    <Label htmlFor="estado-video">Estado de Publicação</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger id="estado-video"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="review">Em revisão</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium">Estado</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {STATUS_LABEL[editing ? statusDe(editing) : "draft"]}. Só um administrador pode publicar.
                    </p>
                  </div>
                )}
              </div>

              {isAdmin ? (
                <Button onClick={() => save()} className="w-full bg-primary text-primary-foreground h-12">Guardar Alterações</Button>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => save("draft")} className="h-12 hover:bg-secondary hover:text-foreground">
                    Salvar rascunho
                  </Button>
                  <Button onClick={() => save("review")} className="h-12">Enviar para revisão</Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isAdmin && pendentes > 0 && (
        <p className="mb-4 rounded-lg border border-border bg-chip px-4 py-3 text-sm text-chip-foreground" role="status">
          {pendentes} vídeo(s) aguardando revisão. Abra, revise e mude o estado para Publicado.
        </p>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-semibold">Título</th>
              <th className="text-left p-4 font-semibold">Autor</th>
              <th className="text-left p-4 font-semibold">Estado</th>
              <th className="text-left p-4 font-semibold">Views</th>
              <th className="w-24 p-4">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((v) => {
              const status = statusDe(v);
              return (
                <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium">{v.title}</td>
                  <td className="p-4 text-muted-foreground">{v.author_name_manual || "-"}</td>
                  <td className="p-4">
                    <Badge variant={status === "published" ? "chip" : status === "review" ? "review" : "draft"}>
                      {STATUS_LABEL[status] ?? status}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">{v.views || 0}</td>
                  <td className="p-4 flex gap-1">
                    {canChange(v) ? (
                      <>
                        <Button size="icon" variant="ghost" onClick={() => openEdit(v)} className="text-action-edit hover:bg-secondary hover:text-action-edit" aria-label={`Editar ${v.title}`}><Pencil size={14} /></Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(v.id)} className="text-action-delete hover:bg-secondary hover:text-action-delete" aria-label={`Apagar ${v.title}`}><Trash2 size={14} /></Button>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">Publicado pelo admin</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-muted-foreground italic">
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
