import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Newspaper, LifeBuoy, FileText, ImagePlus } from "lucide-react";
import GeradorDiscurso from "@/components/suporte/GeradorDiscurso";
import AnaliseNoticia from "@/components/suporte/AnaliseNoticia";
import GeradorProjetoLei from "@/components/suporte/GeradorProjetoLei";
import GeradorMidia from "@/components/suporte/GeradorMidia";

type Tool = "hub" | "gerador-discurso" | "analise-noticia" | "gerador-projeto-lei" | "gerador-midia";

const Suporte = () => {
  const [activeTool, setActiveTool] = useState<Tool>("hub");

  return (
    <Layout>
      {activeTool === "hub" && (
        <>
          <div className="space-y-1 mb-6">
            <h1 className="text-xl font-bold text-foreground">Suporte</h1>
            <p className="text-sm text-muted-foreground">Ferramentas inteligentes para o seu mandato</p>
          </div>

          <div className="grid gap-4">
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow border-primary/20"
              onClick={() => setActiveTool("gerador-discurso")}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="bg-primary/10 rounded-xl p-3">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Gerador de Discurso</h3>
                  <p className="text-xs text-muted-foreground">
                    Crie discursos personalizados com inteligência artificial
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow border-primary/20"
              onClick={() => setActiveTool("analise-noticia")}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="bg-primary/10 rounded-xl p-3">
                  <Newspaper className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Análise de Notícia</h3>
                  <p className="text-xs text-muted-foreground">
                    Analise notícias e gere comentários políticos com IA
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-md transition-shadow border-primary/20"
              onClick={() => setActiveTool("gerador-projeto-lei")}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="bg-primary/10 rounded-xl p-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Gerador de Projeto de Lei</h3>
                  <p className="text-xs text-muted-foreground">
                    Crie projetos de lei com técnica legislativa e IA
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col items-center py-10 text-center space-y-3">
              <div className="bg-muted rounded-full p-4">
                <LifeBuoy className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-xs max-w-xs">
                Mais ferramentas em breve.
              </p>
            </div>
          </div>
        </>
      )}

      {activeTool === "gerador-discurso" && (
        <GeradorDiscurso onBack={() => setActiveTool("hub")} />
      )}

      {activeTool === "analise-noticia" && (
        <AnaliseNoticia onBack={() => setActiveTool("hub")} />
      )}

      {activeTool === "gerador-projeto-lei" && (
        <GeradorProjetoLei onBack={() => setActiveTool("hub")} />
      )}
    </Layout>
  );
};

export default Suporte;
