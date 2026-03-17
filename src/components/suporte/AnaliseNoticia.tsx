import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Search, Loader2, Copy, Check, MessageSquareQuote } from "lucide-react";
import { VideoOverlay } from "@/components/ui/VideoOverlay";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Props {
  onBack: () => void;
}

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analisar-noticia`;

async function streamFromFunction(
  body: Record<string, unknown>,
  onDelta: (text: string) => void,
  onDone: () => void,
  onError: (msg: string) => void,
  abortSignal?: AbortSignal
) {
  const resp = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(body),
    signal: abortSignal,
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Erro desconhecido" }));
    onError(err.error || `Erro ${resp.status}`);
    return;
  }

  if (!resp.body) {
    onError("Resposta vazia do servidor");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIdx: number;
    while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, newlineIdx);
      buffer = buffer.slice(newlineIdx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") {
        onDone();
        return;
      }
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buffer = line + "\n" + buffer;
        break;
      }
    }
  }
  onDone();
}

const AnaliseNoticia = ({ onBack }: Props) => {
  const [url, setUrl] = useState("");
  const [analise, setAnalise] = useState("");
  const [comentario, setComentario] = useState("");
  const [tom, setTom] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [copiedAnalise, setCopiedAnalise] = useState(false);
  const [copiedComentario, setCopiedComentario] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast.error("Cole o link da notícia");
      return;
    }

    setAnalise("");
    setComentario("");
    setAnalysisDone(false);
    setIsAnalyzing(true);

    abortRef.current = new AbortController();
    let full = "";

    await streamFromFunction(
      { tipo: "analisar", url: url.trim() },
      (delta) => {
        full += delta;
        setAnalise(full);
      },
      () => {
        setIsAnalyzing(false);
        setAnalysisDone(true);
      },
      (err) => {
        setIsAnalyzing(false);
        toast.error(err);
      },
      abortRef.current.signal
    );
  };

  const handleComment = async () => {
    if (!tom) {
      toast.error("Selecione um tom para o comentário");
      return;
    }

    setComentario("");
    setIsCommenting(true);

    abortRef.current = new AbortController();
    let full = "";

    await streamFromFunction(
      { tipo: "comentar", analise, tom },
      (delta) => {
        full += delta;
        setComentario(full);
      },
      () => setIsCommenting(false),
      (err) => {
        setIsCommenting(false);
        toast.error(err);
      },
      abortRef.current.signal
    );
  };

  const copyText = async (text: string, type: "analise" | "comentario") => {
    await navigator.clipboard.writeText(text);
    if (type === "analise") {
      setCopiedAnalise(true);
      setTimeout(() => setCopiedAnalise(false), 2000);
    } else {
      setCopiedComentario(true);
      setTimeout(() => setCopiedComentario(false), 2000);
    }
    toast.success("Copiado!");
  };

  const handleNewAnalysis = () => {
    setUrl("");
    setAnalise("");
    setComentario("");
    setTom("");
    setAnalysisDone(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Análise de Notícia</h1>
          <p className="text-xs text-muted-foreground">
            Cole o link e receba uma análise política completa
          </p>
        </div>
      </div>

      {/* URL Input */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <Label htmlFor="news-url" className="text-sm font-medium">
            Link da Notícia
          </Label>
          <div className="flex gap-2">
            <Input
              id="news-url"
              placeholder="https://exemplo.com/noticia..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isAnalyzing}
              className="flex-1"
            />
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !url.trim()}
              size="default"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Result */}
      {(analise || isAnalyzing) && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Análise</h2>
              {analysisDone && analise && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyText(analise, "analise")}
                  className="h-8 text-xs"
                >
                  {copiedAnalise ? (
                    <Check className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 mr-1" />
                  )}
                  Copiar
                </Button>
              )}
            </div>
            <div className="prose prose-sm max-w-none dark:prose-invert text-foreground">
              <ReactMarkdown>{analise}</ReactMarkdown>
            </div>
            {isAnalyzing && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Analisando notícia...
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comment Generation */}
      {analysisDone && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Gerar Comentário</h2>
            <div className="flex gap-2">
              <Select value={tom} onValueChange={setTom}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione o tom" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apoio">👍 Apoio</SelectItem>
                  <SelectItem value="critico">🔍 Crítico</SelectItem>
                  <SelectItem value="neutro">⚖️ Neutro</SelectItem>
                  <SelectItem value="cauteloso">🤔 Cauteloso</SelectItem>
                  <SelectItem value="indignado">😤 Indignado</SelectItem>
                  <SelectItem value="propositivo">💡 Propositivo</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleComment}
                disabled={isCommenting || !tom}
              >
                {isCommenting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquareQuote className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comment Result */}
      {(comentario || isCommenting) && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Comentário</h2>
              {!isCommenting && comentario && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyText(comentario, "comentario")}
                  className="h-8 text-xs"
                >
                  {copiedComentario ? (
                    <Check className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 mr-1" />
                  )}
                  Copiar
                </Button>
              )}
            </div>
            <div className="prose prose-sm max-w-none dark:prose-invert text-foreground">
              <ReactMarkdown>{comentario}</ReactMarkdown>
            </div>
            {isCommenting && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Gerando comentário...
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* New Analysis */}
      {analysisDone && (
        <Button variant="outline" onClick={handleNewAnalysis} className="w-full">
          Nova Análise
        </Button>
      )}
    </div>
  );
};

export default AnaliseNoticia;
