import { BookOpen, Target, Compass, Users, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Você pode importar a foto real da sua equipe aqui no futuro:
import equipeImg from "@/assets/grupotec.png"; 

export default function About() {
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
              Ser uma plataforma de referência em extensão universitária e divulgação científica no campo do Design e da Tecnologia. Buscamos consolidar o portal como um recurso educativo aberto essencial para a comunidade local e acadêmica, destacando o potencial dos alunos como protagonistas da transformação digital e social.
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
             Impacto Social e Caráter Extensionista: Todo conhecimento gerado deve transbordar os muros da faculdade, gerando valor prático, inclusão e desenvolvimento para a comunidade.  Colaboração e Sinergia: Estimulamos o trabalho em equipe matricial, o respeito aos diferentes saberes (técnicos e criativos) e a responsabilidade coletiva.
            </CardContent>
          </Card>
        </div>

        {/* Seção da Equipe Técnica */}
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
                  <h3 className="text-xl font-bold mb-3 font-serif">Desenvolvedores e Designers</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Nossa equipe foi responsável pela concepção visual, experiência do usuário e construção do código deste portal.
                  </p>
                  <ul className="space-y-2 font-medium text-foreground text-sm">
                    <li>• Giovanna Miranda</li>
                    <li>• Henrique Reche</li>
                    <li>• Isabela Raíza</li>
                    <li>• Raquel Barbosa</li>
                    <li>• Sarah Ágata</li>
                  </ul>
                </div>

                <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 mt-auto">
                  <h4 className="flex items-center font-bold text-primary mb-2 text-sm uppercase tracking-wider">
                    <Heart size={16} className="mr-2" fill="currentColor" /> Agradecimento Especial
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Ao <strong>Professor Jean Laine</strong>, pela orientação, apoio contínuo e por nos guiar com maestria durante o desenvolvimento deste projeto.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
