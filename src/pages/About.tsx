import React, { useEffect, useState } from "react";
import { BookOpen, Target, Compass, Users, Heart, Linkedin, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";

// Importações de imagens existentes da equipe técnica fixa e carrossel
import equipeImg from "@/assets/grupotec.png"; 
import Slide1 from "@/assets/slide1.png"; 
import Slide2 from "@/assets/slide2.png"; 
import Slide3 from "@/assets/slide3.png"; 
import Slide4 from "@/assets/slide4.png";
import Slide5 from "@/assets/slide5.png"; 
import Slide6 from "@/assets/slide6.png";
import Slide7 from "@/assets/slide7.png";
import Slide8 from "@/assets/slide8.png";
import Slide9 from "@/assets/slide9.png";
import Slide10 from "@/assets/slide10.png";

// Interface para a tipagem dos autores dinâmicos do banco de dados
interface Author {
  id: string;
  name: string;
  photo_url: string;
  linkedin_url: string;
  email: string;
  role_type: 'autor' | 'desenvolvedor' | 'orientador';
}

export default function About() {
  const [authors, setAuthors] = useState<Author[]>([]);

  // Buscar autores dinâmicos salvos no Supabase
  useEffect(() => {
    const fetchAuthors = async () => {
      const { data } = await supabase
        .from('authors')
        .select('*')
        .order('name', { ascending: true });
      if (data) setAuthors(data as Author[]);
    };

    fetchAuthors();
  }, []);

  // Filtrar os integrantes dinâmicos por categoria
  const autores = authors.filter(a => a.role_type === 'autor');
  const desenvolvedores = authors.filter(a => a.role_type === 'desenvolvedor');
  const orientadores = authors.filter(a => a.role_type === 'orientador');

  const manualSlides = [
    { id: 1, img: Slide1, alt: "Manual TechIn - Página 1" },
    { id: 2, img: Slide2, alt: "Manual TechIn - Página 2" },
    { id: 3, img: Slide3, alt: "Manual TechIn - Página 3" },
    { id: 4, img: Slide4, alt: "Manual TechIn - Página 4" },
    { id: 5, img: Slide5, alt: "Manual TechIn - Página 5" },
    { id: 6, img: Slide6, alt: "Manual TechIn - Página 6" },
    { id: 7, img: Slide7, alt: "Manual TechIn - Página 7" },
    { id: 8, img: Slide8, alt: "Manual TechIn - Página 8" },
    { id: 9, img: Slide9, alt: "Manual TechIn - Página 9" },
    { id: 10, img: Slide10, alt: "Manual TechIn - Página 10" },
  ];

  return (
    <div className="py-12 bg-background text-foreground">
      <div className="max-w-4xl mx-
