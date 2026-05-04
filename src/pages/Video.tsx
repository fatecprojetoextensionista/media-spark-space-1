import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Video() {
  const { id } = useParams();
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVideo() {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("videos")
        .select("*, category:categories(name)")
        .eq("id", id)
        .single();
      
      if (!error) setVideo(data);
      setLoading(false);
    }
    loadVideo();
  }, [id]);

  // Função para converter links normais do YouTube em links de "embed"
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      return url.replace("youtu.be/", "youtube.com/embed/");
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
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link to="/" className="text-accent hover:underline mb-6 inline-block">← Voltar para o início</Link>
      
      <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl mb-8 border border-border">
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

      <div className="border-b border-border pb-6 mb-6">
        <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full uppercase tracking-wider">
          {video.category?.name || "Vídeo"}
        </span>
        <h1 className="text-4xl font-serif font-bold mt-4">{video.title}</h1>
      </div>

      <div className="prose prose-slate max-w-none">
        <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {video.description}
        </p>
      </div>
    </div>
  );
}
