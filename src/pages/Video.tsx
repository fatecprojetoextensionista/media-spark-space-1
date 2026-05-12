import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Video() {
  const { id } = useParams(); // 'id' aqui representa o slug na URL
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVideo() {
      if (!id) return;
      setLoading(true);
      
      const { data, error } = await supabase
        .from("videos")
        .select("*, category:categories(name)")
        .eq("slug", id) // Busca pelo slug para URLs amigáveis
        .single();
      
      if (!error && data) {
        setVideo(data);
        // Atualiza contagem de visualizações
        await supabase
          .from("videos")
          .update({ views: (data.views ?? 0) + 1 })
          .eq("id", data.id);
      }
      setLoading(false);
    }
    loadVideo();
  }, [id]);

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  if (loading) return <div className="p-20 text-center font-serif">Carregando vídeo...</div>;
  
  if (!video) return (
    <div className="p-20 text-center font-serif">
      <h2 className="text-2xl mb-4">Vídeo não encontrado</h2>
      <Link to="/" className="text-accent underline">Voltar ao início</Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 font-sans">
      <Link to="/" className="text-accent hover:underline mb-6 inline-block">← Voltar para o início</Link>
      
      {/* 1. CATEGORIA E TÍTULO */}
      <div className="mb-4">
        <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full uppercase tracking-wider">
          {video.category?.name || "Vídeo"}
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold mt-4 leading-tight">{video.title}</h1>
      </div>

      {/* 2. AUTORES E INFORMAÇÕES (Igual ao artigo) */}
      <div className="flex flex-wrap gap-x-3 gap-y-2 text-sm text-muted-foreground mb-8 border-y py-4 italic">
        {(video.author_name_manual || video.group_authors) && (
          <span className="font-semibold text-foreground not-italic">
            Por: {video.author_name_manual} {video.group_authors && `(${video.group_authors})`}
          </span>
        )}
        <span>·</span>
        <span>
          {video.created_at && new Date(video.created_at).toLocaleDateString("pt-BR", { dateStyle: "long" })}
        </span>
        <span>·</span>
        <span>{video.views || 0} visualizações</span>
      </div>

      {/* 3. RESUMO (Pega os primeiros 250 caracteres da descrição) */}
      {video.description && (
        <div className="mb-10">
          <p className="text-xl text-muted-foreground italic leading-relaxed border-l-4 border-accent/30 pl-4">
            {video.description.substring(0, 250)}...
          </p>
        </div>
      )}

      {/* 4. O VÍDEO (No centro) */}
      <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl mb-10 border border-border">
        {video.video_url.includes('youtube.com') || video.video_url.includes('youtu.be') ? (
          <iframe
            src={getEmbedUrl(video.video_url)}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video src={video.video_url} controls className="w-full h-full" />
        )}
      </div>

      {/* 5. TEXTO / DESCRIÇÃO COMPLETA */}
      <div className="prose prose-lg max-w-none">
        <h3 className="text-xl font-bold mb-4">Sobre este vídeo</h3>
        <p className="text-slate-800 leading-loose whitespace-pre-wrap">
          {video.description}
        </p>
      </div>
    </div>
  );
}
