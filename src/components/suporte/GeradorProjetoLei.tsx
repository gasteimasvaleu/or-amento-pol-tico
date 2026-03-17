import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Copy, Loader2, FileText, Check } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const ESFERAS = [
  { value: "municipal", label: "Municipal" },
  { value: "estadual", label: "Estadual" },
  { value: "federal", label: "Federal" },
];

const TIPOS = [
  { value: "lei_ordinaria", label: "Lei Ordinária" },
  { value: "lei_complementar", label: "Lei Complementar" },
  { value: "emenda", label: "Emenda" },
  { value: "resolucao", label: "Resolução" },
  { value: "decreto_legislativo", label: "Decreto Legislativo" },
];

const AREAS = [
  { value: "saude", label: "Saúde" },
  { value: "educacao", label: "Educação" },
  { value: "seguranca", label: "Segurança" },
  { value: "meio_ambiente", label: "Meio Ambiente" },
  { value: "infraestrutura", label: "Infraestrutura" },
  { value: "social", label: "Social" },
  { value: "economia", label: "Economia" },
  { value: "cultura", label: "Cultura" },
];

interface GeradorProjetoLeiProps {
  onBack: () => void;
}

const GeradorProjetoLei = ({ onBack }: GeradorProjetoLeiProps) => {
  const [titulo, setTitulo] = useState("");
  const [esfera, setEsfera] = useState("");
  const [tipo, setTipo] = useState("");
  const [area, setArea] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [projeto, setProjeto] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const canGenerate = titulo.trim() && esfera && tipo && area;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsLoading(true);
    setProjeto("");

    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gerar-projeto-lei`;

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ titulo, esfera, tipo, area, justificativa }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erro ao gerar projeto de lei" }));
        throw new Error(err.error || "Erro ao gerar projeto de lei");
      }

      if (!resp.body) throw new Error("Stream não disponível");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullText += content;
              setProjeto(fullText);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullText += content;
              setProjeto(fullText);
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Erro ao gerar projeto de lei");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(projeto);
    setCopied(true);
    toast.success("Projeto de lei copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Button>

      <div className="space-y-1">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Gerador de Projeto de Lei
        </h2>
        <p className="text-sm text-muted-foreground">
          Preencha os campos abaixo para gerar um projeto de lei com IA.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Configuração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título / Assunto *</Label>
            <Textarea
              id="titulo"
              placeholder="Ex: Instituir programa de incentivo à energia solar em edifícios públicos..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Esfera *</Label>
              <Select value={esfera} onValueChange={setEsfera}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {ESFERAS.map((e) => (
                    <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Área Temática *</Label>
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {AREAS.map((a) => (
                  <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="justificativa">Justificativa / Contexto (opcional)</Label>
            <Textarea
              id="justificativa"
              placeholder="Dados, referências legais, motivação política, problemas a resolver..."
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              rows={2}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || isLoading}
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Gerando projeto de lei...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" /> Gerar Projeto de Lei
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {(projeto || isLoading) && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Projeto de Lei Gerado</CardTitle>
            {projeto && !isLoading && (
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1">
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copiado" : "Copiar"}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading && !projeto && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm py-8 justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparando seu projeto de lei...
              </div>
            )}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{projeto}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GeradorProjetoLei;
