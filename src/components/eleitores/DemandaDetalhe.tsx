import { useState, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Paperclip, Trash2, Upload, FileText, Image } from "lucide-react";
import { useDemandaHistorico, useDemandaAnexos } from "@/hooks/useDemandas";
import type { Demanda, DemandaStatus } from "@/types/eleitor";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig: Record<DemandaStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  novo: { label: "Novo", variant: "default" },
  em_andamento: { label: "Em andamento", variant: "secondary" },
  resolvido: { label: "Resolvido", variant: "outline" },
};

interface DemandaDetalheProps {
  demanda: Demanda | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (data: { id: string; status: DemandaStatus }) => Promise<any>;
}

export function DemandaDetalhe({ demanda, open, onOpenChange, onUpdateStatus }: DemandaDetalheProps) {
  const [novaEntrada, setNovaEntrada] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { historico, addHistorico } = useDemandaHistorico(demanda?.id);
  const { anexos, uploadAnexo, deleteAnexo, isUploading } = useDemandaAnexos(demanda?.id);

  if (!demanda) return null;

  const handleAddHistorico = async () => {
    if (!novaEntrada.trim()) return;
    await addHistorico({ demanda_id: demanda.id, descricao: novaEntrada });
    setNovaEntrada("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAnexo({ demanda_id: demanda.id, file });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg">{demanda.titulo}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-4">
          {/* Status */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Status:</span>
            <Select
              value={demanda.status}
              onValueChange={(value) => onUpdateStatus({ id: demanda.id, status: value as DemandaStatus })}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="novo">Novo</SelectItem>
                <SelectItem value="em_andamento">Em andamento</SelectItem>
                <SelectItem value="resolvido">Resolvido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info */}
          {demanda.descricao && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Descrição</p>
              <p className="text-sm">{demanda.descricao}</p>
            </div>
          )}
          {demanda.responsavel && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Responsável</p>
              <p className="text-sm">{demanda.responsavel}</p>
            </div>
          )}

          {/* Anexos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-muted-foreground">Anexos</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-1" />
                {isUploading ? "Enviando..." : "Upload"}
              </Button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
            </div>
            {anexos.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum anexo</p>
            ) : (
              <div className="space-y-2">
                {anexos.map((anexo) => (
                  <div key={anexo.id} className="flex items-center justify-between p-2 rounded-lg border bg-muted/30">
                    <a
                      href={anexo.arquivo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline truncate flex-1"
                    >
                      {anexo.arquivo_tipo?.startsWith("image") ? (
                        <Image className="h-4 w-4 shrink-0" />
                      ) : (
                        <FileText className="h-4 w-4 shrink-0" />
                      )}
                      <span className="truncate">{anexo.arquivo_nome}</span>
                    </a>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => deleteAnexo(anexo.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Histórico */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Histórico de Atendimentos</p>
            <div className="space-y-2 mb-3">
              <Textarea
                placeholder="Registrar atendimento..."
                value={novaEntrada}
                onChange={(e) => setNovaEntrada(e.target.value)}
                rows={2}
              />
              <Button size="sm" onClick={handleAddHistorico} disabled={!novaEntrada.trim()}>
                Adicionar
              </Button>
            </div>
            {historico.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum registro</p>
            ) : (
              <div className="relative border-l-2 border-muted pl-4 space-y-4">
                {historico.map((entry) => (
                  <div key={entry.id} className="relative">
                    <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                    <p className="text-xs text-muted-foreground mb-0.5">
                      {entry.created_at
                        ? format(new Date(entry.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                        : "—"}
                    </p>
                    <p className="text-sm">{entry.descricao}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
