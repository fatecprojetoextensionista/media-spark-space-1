import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Video() {
  const { id } = useParams();
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVideo() {
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

  if (loading) return <div className="p-20 text-center font-serif text-white">Carregando vídeo...</div>;
  
  if (!video) return (
    <div className="p-20 text-center font-serif text-white">
      <h2 className="text-2xl mb-4">Vídeo não encontrado</h2>
      <Link to="/" className="text-accent underline">Voltar ao início</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 text-white">
      <Link to="/" className="text-accent hover:underline mb-6 inline-block">← Voltar para o início</Link>
      
      <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl mb-8 border border-white/10">
        {video.video_url.includes('youtube.com') || video.video_url.includes('youtu.be') ? (
          <iframe
            src={video.video_url.replace("watch?v=", "embed/")}
            className="w-full h-full"
            allowFullScreen
          />
        ) : (
          <video src={video.video_url} controls className="w-full h-full" />
        )}
      </div>

      <div className="border-b border-border pb-6 mb-6">
        <span className="px-3 py-1 bg-accent/20 text-accent text-xs font-bold rounded-full uppercase tracking-wider">
          {video.category?.name || "Vídeo"}
        </span>
        <h1 className="text-4xl font-serif font-bold mt-4">{video.title}</h1>
      </div>

      <div className="prose prose-invert max-w-none">
        <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {video.description}
        </p>
      </div>
    </div>
  );
}
