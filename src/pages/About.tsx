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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Cabeçalho Principal */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-primary">
            Sobre o Projeto
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Conheça a iniciativa acadêmica por trás do desenvolvimento do nosso portal de conteúdos.
          </p>
        </div>

        {/* Descrição do Projeto Acadêmico */}
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="pt-6 space-y-4 text-base leading-relaxed">
            <p>
              Este portal é o resultado prático de uma iniciativa desenvolvida dentro da disciplina de{" "}
              <span className="font-semibold text-primary">Tópicos Especiais em Mídias Digitais</span>, 
              relevante ao curso superior de tecnologia em <span className="font-semibold text-primary">Design de Mídias Digitais</span> da{" "}
              <span className="font-semibold text-primary">Fatec Carapicuíba</span>.
            </p>
            <p>
              Nossa proposta vai além da sala de aula: buscamos democratizar o acesso ao ecossistema da inovação tecnológica. Por meio de uma linguagem multinível, conteúdos acessíveis e experiências imersivas (como vídeos, infográficos e demonstrações interativas), o portal atua como uma ponte viva entre o conhecimento acadêmico e a sociedade, impulsionando a inclusão digital em Carapicuíba e região.
            </p>
          </CardContent>
        </Card>

        {/* Seção de Missão, Visão e Valores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center space-x-3 pb-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Target size={24} />
              </div>
              <CardTitle className="text-xl">Missão</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Desmistificar e disseminar o conhecimento sobre tecnologias contemporâneas de forma didática, ética e acessível. Nosso compromisso é produzir conteúdos práticos e de utilidade pública que preparem estudantes, apoiem educadores e capacitem micro e pequenos empreendedores locais para os desafios e oportunidades do futuro digital.  
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center space-x-3 pb-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Compass size={24} />
              </div>
              <CardTitle className="text-xl">Visão</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Ser uma plataforma de referência em extensão universitária e divulgação científica no campo do Design e da Tecnologia. Buscamos consolidar o portal como um recurso educativo aberto essencial para a comunidade local e acadêmica, destacando o potencial dos alunos como protagonists da transformação digital e social.
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center space-x-3 pb-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <BookOpen size={24} />
              </div>
              <CardTitle className="text-xl">Valores</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground leading-relaxed">
              Impacto Social e Caráter Extensionista: Todo conhecimento gerado deve transbordar os muros da faculdade, gerando valor prático, inclusão e desenvolvimento para a comunidade. Colaboração e Sinergia: Estimulamos o trabalho em equipe matricial, o respeito aos diferentes saberes (técnicos e criativos) e a responsabilidade coletiva.
            </CardContent>
          </Card>
        </div>

        {/* --- MANUAL DE IDENTIDADE VISUAL (SLIDER) --- */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 border-b border-border pb-2">
            <BookOpen className="text-primary" size={24} />
            <h2 className="text-2xl font-bold tracking-tight">Manual de Identidade Visual</h2>
          </div>
          
          <div className="w-full relative px-10">
            {/* CORREÇÃO AQUI: Forçando o tipo booleano primitivo no loop para satisfazer o TypeScript */}
            <Carousel 
              opts={{ loop: true as boolean }} 
              className="w-full shadow-sm rounded-xl overflow-hidden border border-border bg-card"
            >
              <CarouselContent>
                {manualSlides.map((slide) => (
                  <CarouselItem key={slide.id}>
                    <div className="relative aspect-[16/9] w-full bg-muted flex items-center justify-center">
                      {slide.img ? (
                        <img
                          src={slide.img}
                          alt={slide.alt}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-6 text-muted-foreground text-sm">
                          {slide.alt} <br />
                          <span className="text-xs opacity-75">(Pronto para receber o arquivo de imagem)</span>
                        </div>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-popover/80 text-popover-foreground hover:bg-popover shadow-sm border border-border" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-popover/80 text-popover-foreground hover:bg-popover shadow-sm border border-border" />
            </Carousel>
          </div>

          {/* Créditos do Manual */}
          <div className="text-right px-10">
            <p className="text-xs text-muted-foreground italic">
              Desenvolvido por: Quéren Hapuque, Victoria Vieira Resende.
            </p>
          </div>
        </div>

        {/* Seção da Equipe Técnica Original */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 border-b border-border pb-2">
            <Users className="text-primary" size={24} />
            <h2 className="text-2xl font-bold tracking-tight">Equipe Técnica</h2>
          </div>

          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <div className="md:flex">
              {/* Foto em Grupo */}
              <div className="md:w-5/12 h-64 md:h-auto bg-muted relative">
                <img
                  src={equipeImg}
                  alt="Foto da Equipe Técnica"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              {/* Nomes e Agradecimentos */}
              <div className="md:w-7/12 p-6 md:p-8 flex flex-col justify-center space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-3">Desenvolvedores e Designers</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Nossa equipe foi responsável pela concepção visual, experiência do usuário e construção do código deste portal.
                  </p>
                  <ul className="space-y-2 font-medium text-foreground text-sm">
                    <li>• Giovanna Miranda</li>
