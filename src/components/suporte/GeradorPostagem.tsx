import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Copy, Loader2, Hash, Check, Upload, X, Share2 } from "lucide-react";
import { VideoOverlay } from "@/components/ui/VideoOverlay";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const TONES = [
  { value: "formal", label: "Formal" },
  { value: "descontraido", label: "Descontraído" },
  { value: "inspirador", label: "Inspirador" },
  { value: "informativo", label: "Informativo" },
  { value: "humoristico", label: "Humorístico" },
];

const SIZES = [
  { value: "curto", label: "Curto (Twitter/X)" },
  { value: "medio", label: "Médio (Instagram)" },
  { value: "longo", label: "Longo (LinkedIn/Facebook)" },
];

const TYPES = [
  { value: "engajador", label: "Engajador" },
  { value: "critico", label: "Crítico" },
  { value: "viralizado", label: "Viralizado" },
];

interface GeradorPostagemProps {
  onBack: () => void;
}

const GeradorPostagem = ({ onBack }: GeradorPostagemProps) => {
  const { user } = useAuth();
  const [tema, setTema] = useState("");
  const [tom, setTom] = useState("");
  const [tamanho, setTamanho] = useState("");
  const [tipo, setTipo] = useState("");
  const [usarEmojis, setUsarEmojis] = useState(true);
  const [imagemBase64, setImagemBase64] = useState<string | null>(null);
  const [imagemNome, setImagemNome] = useState<string | null>(null);
  const [postagem, setPostagem] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canGenerate = tema.trim() && tom && tamanho && tipo;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpeg|webp)$/)) {
      toast.error("Formato inválido. Use PNG, JPEG ou WEBP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagemBase64(reader.result as string);
      setImagemNome(file.name);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagemBase64(null);
    setImagemNome(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsLoading(true);
    setPostagem("");

    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gerar-postagem`;

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          tema,
          tom,
          tamanho,
          tipo,
          usarEmojis,
          imagemBase64: imagemBase64 || undefined,
        }),
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Erro ao gerar postagem" }));
        throw new Error(err.error || "Erro ao gerar postagem");
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
              setPostagem(fullText);
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
              setPostagem(fullText);
            }
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Erro ao gerar postagem");
    } finally {
      setIsLoading(false);
      if (user) {
        supabase.from("geracoes_log" as any).insert({ user_id: user.id, tipo: "postagem" } as any).then(() => {});
      }
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(postagem);
    setCopied(true);
    toast.success("Postagem copiada!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(postagem)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Button>

      <div className="space-y-1">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Hash className="h-5 w-5 text-primary" />
          Gerador de Postagem
        </h2>
        <p className="text-sm text-muted-foreground">
          Crie postagens otimizadas para redes sociais com IA.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Configuração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tema-post">Tema *</Label>
            <Textarea
              id="tema-post"
              placeholder="Ex: Inauguração de nova praça no bairro central, investimento em lazer..."
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
          </div>

          <div className="space-y-2">
            <Label>Tipo *</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="emojis-switch">Usar emojis</Label>
            <Switch
              id="emojis-switch"
              checked={usarEmojis}
              onCheckedChange={setUsarEmojis}
            />
          </div>

          {/* Image upload */}
          <div className="space-y-2">
            <Label>Imagem de referência (opcional)</Label>
            {imagemBase64 ? (
              <div className="relative rounded-lg border border-border overflow-hidden">
                <img
                  src={imagemBase64}
                  alt="Referência"
                  className="w-full max-h-40 object-cover"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 rounded-full bg-background/80 p-1 hover:bg-background transition-colors"
                >
                  <X className="h-4 w-4 text-foreground" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-background/80 px-2 py-1">
                  <p className="text-[10px] text-muted-foreground truncate">{imagemNome}</p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-lg border-2 border-dashed border-border p-4 text-center text-xs text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
              >
                <Upload className="h-5 w-5 mx-auto mb-1" />
                Clique para selecionar uma imagem
                <br />
                <span className="text-[10px]">A postagem será baseada no conteúdo da imagem</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || isLoading}
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Gerando postagem...
              </>
            ) : (
              <>
                <Hash className="h-4 w-4" /> Gerar Postagem
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {(postagem || isLoading) && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Postagem Gerada</CardTitle>
            {postagem && !isLoading && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1">
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copiado" : "Copiar"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleWhatsApp} className="gap-1">
                  <Share2 className="h-3 w-3" /> WhatsApp
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoading && !postagem && <VideoOverlay />}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{postagem}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GeradorPostagem;
