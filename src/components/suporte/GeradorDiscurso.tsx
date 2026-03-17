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
import { ArrowLeft, Copy, Loader2, Sparkles, Check, Share2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const TONES = [
  { value: "formal", label: "Formal" },
  { value: "inspirador", label: "Inspirador" },
  { value: "critico", label: "Crítico" },
  { value: "conciliador", label: "Conciliador" },
  { value: "emotivo", label: "Emotivo" },
  { value: "tecnico", label: "Técnico" },
];

const SIZES = [
  { value: "curto", label: "Curto (~2 min)" },
  { value: "medio", label: "Médio (~5 min)" },
  { value: "longo", label: "Longo (~10 min)" },
  { value: "extenso", label: "Extenso (~15 min+)" },
];

const STYLES = [
  { value: "tribuna", label: "Tribuna" },
  { value: "plenario", label: "Plenário" },
  { value: "comissao", label: "Comissão" },
  { value: "evento", label: "Evento" },
  { value: "redes_sociais", label: "Redes Sociais" },
];

const AUDIENCES = [
  { value: "parlamentares", label: "Parlamentares" },
  { value: "cidadaos", label: "Cidadãos" },
  { value: "imprensa", label: "Imprensa" },
  { value: "comunidade", label: "Comunidade Específica" },
];

interface GeradorDiscursoProps {
  onBack: () => void;
}

const GeradorDiscurso = ({ onBack }: GeradorDiscursoProps) => {
  const { user } = useAuth();
  const [tema, setTema] = useState("");
  const [tom, setTom] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [estilo, setEstilo] = useState("");
  const [publico, setPublico] = useState("");
  const [contexto, setContexto] = useState("");
  const [discurso, setDiscurso] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const canGenerate = tema.trim() && tom && tamanho && estilo && publico;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsLoading(true);
    setDiscurso("");

    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gerar-discurso`;

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ tema, tom, tamanho, estilo, publico, contexto }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erro ao gerar discurso" }));
        throw new Error(err.error || "Erro ao gerar discurso");
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
              setDiscurso(fullText);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Flush remaining
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
              setDiscurso(fullText);
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Erro ao gerar discurso");
    } finally {
      setIsLoading(false);
      // Log generation
      if (user) {
        supabase.from("geracoes_log" as any).insert({ user_id: user.id, tipo: "discurso" } as any).then(() => {});
      }
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(discurso);
    setCopied(true);
    toast.success("Discurso copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Button>

      <div className="space-y-1">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Gerador de Discurso
        </h2>
        <p className="text-sm text-muted-foreground">
          Preencha os campos abaixo para gerar um discurso personalizado com IA.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Configuração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tema">Tema *</Label>
            <Textarea
              id="tema"
              placeholder="Ex: Defesa da educação pública e investimentos na área..."
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tom *</Label>
              <Select value={tom} onValueChange={setTom}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tamanho *</Label>
              <Select value={tamanho} onValueChange={setTamanho}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {SIZES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Estilo *</Label>
              <Select value={estilo} onValueChange={setEstilo}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {STYLES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Público-alvo *</Label>
              <Select value={publico} onValueChange={setPublico}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {AUDIENCES.map((a) => (
                    <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contexto">Contexto adicional (opcional)</Label>
            <Textarea
              id="contexto"
              placeholder="Dados, referências, posicionamento político, nomes a mencionar..."
              value={contexto}
              onChange={(e) => setContexto(e.target.value)}
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
                <Loader2 className="h-4 w-4 animate-spin" /> Gerando discurso...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Gerar Discurso
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {(discurso || isLoading) && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Discurso Gerado</CardTitle>
            {discurso && !isLoading && (
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1">
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copiado" : "Copiar"}
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading && !discurso && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm py-8 justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparando seu discurso...
              </div>
            )}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{discurso}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GeradorDiscurso;
