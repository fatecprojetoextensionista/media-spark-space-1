import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Video() {
  const { id } = useParams();
  const [video, setVideo] = useState<any>(null);

  useEffect(() => {
    async function loadVideo() {
      const { data } = await supabase
        .from("videos")
        .select("*, category:categories(name)")
        .eq("id", id)
        .single();
      setVideo(data);
    }
    loadVideo();
  }, [id]);

  if (!video) return <div className="p-20 text-center font-serif">Carregando vídeo...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link to="/" className="text-accent hover:underline mb-6 block">← Voltar para o início</Link>
      
      <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl mb-6">
        <iframe
          src={video.video_url.replace("watch?v=", "embed/")}
          className="w-full h-full"
          allowFullScreen
        />
      </div>

      <div className="space-y-4">
        <span className="px-3 py-1 bg-accent/10 text-accent text-sm font-bold rounded-full">
          {video.category?.name || "Geral"}
        </span>
        <h1 className="text-3xl font-serif font-bold">{video.title}</h1>
        <p className="text-muted-foreground leading-relaxed">{video.description}</p>
      </div>
    </div>
  );
}
