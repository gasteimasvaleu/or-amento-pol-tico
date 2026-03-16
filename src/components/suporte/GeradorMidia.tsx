import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ImagePlus, Loader2, Download, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  onBack: () => void;
}

const formatos = [
  { value: "story", label: "Story", desc: "1080×1920 (9:16)" },
  { value: "feed_quadrado", label: "Feed Quadrado", desc: "1080×1080 (1:1)" },
  { value: "feed_paisagem", label: "Feed Paisagem", desc: "1200×628" },
];

const estilos = [
  { value: "moderno", label: "Moderno" },
  { value: "minimalista", label: "Minimalista" },
  { value: "politico", label: "Político" },
  { value: "institucional", label: "Institucional" },
];

const GeradorMidia = ({ onBack }: Props) => {
  const [prompt, setPrompt] = useState("");
  const [formato, setFormato] = useState("feed_quadrado");
  const [estilo, setEstilo] = useState("moderno");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Digite uma descrição para a imagem", variant: "destructive" });
      return;
    }

    setLoading(true);
    setImageUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke("gerar-midia", {
        body: { prompt, formato, estilo },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setImageUrl(data.imageUrl);
      toast({ title: "Imagem gerada com sucesso!" });
    } catch (err: any) {
      toast({
        title: "Erro ao gerar imagem",
        description: err.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `post-${formato}-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Erro ao baixar imagem", variant: "destructive" });
    }
  };

  const handleSaveToGallery = async () => {
    if (!imageUrl || !user) return;
    setSaving(true);

    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const fileName = `${Date.now()}.png`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("midias")
        .upload(filePath, blob, { contentType: "image/png" });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("midias")
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from("midias").insert({
        user_id: user.id,
        titulo: prompt.slice(0, 80),
        descricao: `Gerado por IA - Formato: ${formato}, Estilo: ${estilo}`,
        categoria: "criativo",
        arquivo_url: urlData.publicUrl,
        arquivo_nome: fileName,
        arquivo_tipo: "image/png",
        arquivo_tamanho: blob.size,
        tags: ["ia", "gerado", formato, estilo],
      });

      if (insertError) throw insertError;

      toast({ title: "Imagem salva na galeria de mídias!" });
    } catch (err: any) {
      toast({
        title: "Erro ao salvar",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Gerador de Mídia</h1>
          <p className="text-xs text-muted-foreground">Crie imagens para redes sociais com IA</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label>Descrição da imagem</Label>
            <Textarea
              placeholder="Ex: Banner de inauguração de praça com logo da prefeitura, cores verde e amarelo..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Formato</Label>
            <div className="grid grid-cols-3 gap-2">
              {formatos.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFormato(f.value)}
                  className={`rounded-lg border p-2 text-center text-xs transition-colors ${
                    formato === f.value
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <div className="font-medium">{f.label}</div>
                  <div className="text-[10px] opacity-70">{f.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Estilo</Label>
            <div className="grid grid-cols-2 gap-2">
              {estilos.map((e) => (
                <button
                  key={e.value}
                  type="button"
                  onClick={() => setEstilo(e.value)}
                  className={`rounded-lg border p-2 text-center text-xs transition-colors ${
                    estilo === e.value
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Gerando imagem...
              </>
            ) : (
              <>
                <ImagePlus className="h-4 w-4 mr-2" />
                Gerar Imagem
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Gerando sua imagem com IA... Isso pode levar até 1 minuto.
            </p>
          </CardContent>
        </Card>
      )}

      {imageUrl && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <img
              src={imageUrl}
              alt="Imagem gerada"
              className="w-full rounded-lg border"
            />
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
              <Button className="flex-1" onClick={handleSaveToGallery} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar na Galeria
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GeradorMidia;
