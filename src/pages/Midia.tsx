import { useState, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { useMidias } from "@/hooks/useMidias";
import { CATEGORIAS_MIDIA } from "@/types/midia";
import type { Midia } from "@/types/midia";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Upload,
  Trash2,
  Image as ImageIcon,
  Loader2,
  X,
  Eye,
  FileImage,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MidiaPage = () => {
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [busca, setBusca] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewMidia, setPreviewMidia] = useState<Midia | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Midia | null>(null);

  // Upload form state
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("foto");
  const [tagsInput, setTagsInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { midias, isLoading, uploadAndCreate, deleteMidia } = useMidias(categoriaFiltro);

  const filteredMidias = midias.filter((m) => {
    if (!busca) return true;
    const q = busca.toLowerCase();
    return (
      m.titulo.toLowerCase().includes(q) ||
      m.tags?.some((t) => t.toLowerCase().includes(q))
    );
  });

  const resetForm = () => {
    setTitulo("");
    setDescricao("");
    setCategoria("foto");
    setTagsInput("");
    setFile(null);
  };

  const handleUpload = async () => {
    if (!file || !titulo.trim()) return;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    await uploadAndCreate.mutateAsync({ file, titulo: titulo.trim(), descricao, categoria, tags });
    resetForm();
    setUploadOpen(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const getCategoriaInfo = (val: string) =>
    CATEGORIAS_MIDIA.find((c) => c.value === val) ?? CATEGORIAS_MIDIA[0];

  const isImage = (tipo: string | null) => tipo?.startsWith("image/");

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Mídia</h1>
            <p className="text-xs text-muted-foreground">Galeria de mídias e artes</p>
          </div>
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título ou tag..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setCategoriaFiltro("todas")}
            className={cn(
              "shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
              categoriaFiltro === "todas"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border"
            )}
          >
            Todas
          </button>
          {CATEGORIAS_MIDIA.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoriaFiltro(cat.value)}
              className={cn(
                "shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
                categoriaFiltro === cat.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredMidias.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileImage className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma mídia encontrada</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setUploadOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Adicionar mídia
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredMidias.map((midia) => {
              const catInfo = getCategoriaInfo(midia.categoria);
              return (
                <Card
                  key={midia.id}
                  className="overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => setPreviewMidia(midia)}
                >
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {isImage(midia.arquivo_tipo) ? (
                      <img
                        src={midia.arquivo_url}
                        alt={midia.titulo}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                      </div>
                    )}
                    <Badge
                      className={cn("absolute top-2 left-2 text-[10px] border-0 text-white", catInfo.color)}
                    >
                      {catInfo.label}
                    </Badge>
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-foreground truncate">{midia.titulo}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {midia.created_at
                        ? new Date(midia.created_at).toLocaleDateString("pt-BR")
                        : ""}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Adicionar Mídia</DialogTitle>
            <DialogDescription>Envie uma imagem, arte ou documento visual.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
                dragOver ? "border-primary bg-primary/5" : "border-border",
                file && "border-primary/50 bg-primary/5"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf,.svg"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div className="flex items-center gap-2 justify-center">
                  <Upload className="h-4 w-4 text-primary" />
                  <span className="text-sm text-foreground truncate max-w-[200px]">{file.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Arraste ou toque para selecionar
                  </p>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label>Título *</Label>
              <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Evento inauguração..." />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_MIDIA.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição opcional..." rows={2} />
            </div>

            <div className="space-y-2">
              <Label>Tags (separadas por vírgula)</Label>
              <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="evento, 2025, inauguração" />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleUpload}
              disabled={!file || !titulo.trim() || uploadAndCreate.isPending}
              className="w-full"
            >
              {uploadAndCreate.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewMidia} onOpenChange={() => setPreviewMidia(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-lg rounded-2xl p-0 overflow-hidden">
          {previewMidia && (
            <>
              {isImage(previewMidia.arquivo_tipo) ? (
                <img
                  src={previewMidia.arquivo_url}
                  alt={previewMidia.titulo}
                  className="w-full max-h-[50vh] object-contain bg-black/5"
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center bg-muted">
                  <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}
              <div className="p-4 space-y-2">
                <DialogHeader>
                  <DialogTitle>{previewMidia.titulo}</DialogTitle>
                  {previewMidia.descricao && (
                    <DialogDescription>{previewMidia.descricao}</DialogDescription>
                  )}
                </DialogHeader>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className={cn("text-[10px] border-0 text-white", getCategoriaInfo(previewMidia.categoria).color)}>
                    {getCategoriaInfo(previewMidia.categoria).label}
                  </Badge>
                  {previewMidia.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {previewMidia.created_at && new Date(previewMidia.created_at).toLocaleDateString("pt-BR")}
                  {previewMidia.arquivo_tamanho && ` · ${(previewMidia.arquivo_tamanho / 1024 / 1024).toFixed(1)} MB`}
                </p>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={previewMidia.arquivo_url} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-4 w-4 mr-1" /> Abrir
                    </a>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => { setPreviewMidia(null); setDeleteConfirm(previewMidia); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Excluir mídia?</DialogTitle>
            <DialogDescription>
              "{deleteConfirm?.titulo}" será excluída permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              disabled={deleteMidia.isPending}
              onClick={async () => {
                if (deleteConfirm) {
                  await deleteMidia.mutateAsync(deleteConfirm);
                  setDeleteConfirm(null);
                }
              }}
            >
              {deleteMidia.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default MidiaPage;
