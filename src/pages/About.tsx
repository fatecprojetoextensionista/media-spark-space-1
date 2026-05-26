import { BookOpen, Target, Compass, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function About() {
  // Lista de integrantes do projeto acadêmico. 
  // O sistema gera as iniciais automaticamente para o Avatar.
  const team = [
    { name: "Henrique Reche", role: "Desenvolvedor & Designer" },
    { name: "Professor Jean", role: "Orientador / Docente" },
    // Você pode adicionar ou remover integrantes facilmente aqui
  ];

  // Função auxiliar para extrair as iniciais do nome de forma limpa
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="py-12 bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
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
              Este portal é o resultado prático de uma iniciativa desenvolvida dentro da disciplina de 
              <span className="font-semibold text-primary"> Tópicos Especiais em Mídias Digitais</span>, 
              relevante ao curso superior de tecnologia em <span className="font-semibold text-primary">Design de Mídias Digitais</span> da 
              <span className="font-semibold text-primary"> Fatec Carapicuíba</span>.
            </p>
            <p>
              A proposta nasceu com o objetivo de integrar conceitos avançados de design de interface (UI/UX), 
              arquitetura de informação, desenvolvimento front-end moderno e gerenciamento de conteúdo multimídia 
              em uma aplicação real e responsiva, focada na curadoria e distribuição de informação relevante.
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
              Promover a aplicação prática dos conhecimentos de design e desenvolvimento por meio de uma plataforma dinâmica, informativa e acessível para toda a comunidade.
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
              Tornar-se um modelo de referência para projetos práticos e acadêmicos, demonstrando o potencial técnico e criativo na produção de mídias digitais.
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
              Inovação constante, excelência em experiência do usuário (UX), colaboração mútua, ética acadêmica e democratização do acesso à informação tecnológica.
            </CardContent>
          </Card>
        </div>

        {/* Seção da Equipe */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3 border-b border-border pb-2">
            <Users className="text-primary" size={24} />
            <h2 className="text-2xl font-bold tracking-tight">Nossa Equipe</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {team.map((member) => (
              <Card key={member.name} className="border-border bg-card shadow-sm">
                <CardContent className="flex items-center space-x-4 pt-6">
                  {/* Componente de Avatar com as iniciais automáticas como Fallback */}
                  <Avatar className="h-12 w-12 border border-primary/20 text-primary">
                    <AvatarFallback className="font-semibold text-lg bg-primary/10 text-primary">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-base text-foreground">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
