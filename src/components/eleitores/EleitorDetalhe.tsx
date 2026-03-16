import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Phone, MapPin, AlertCircle } from "lucide-react";
import { useDemandas } from "@/hooks/useDemandas";
import { DemandaModal } from "./DemandaModal";
import { DemandaDetalhe } from "./DemandaDetalhe";
import type { Eleitor, Demanda, DemandaStatus } from "@/types/eleitor";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusBadge: Record<DemandaStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  novo: { label: "Novo", variant: "default" },
  em_andamento: { label: "Em andamento", variant: "secondary" },
  resolvido: { label: "Resolvido", variant: "outline" },
};

interface EleitorDetalheProps {
  eleitor: Eleitor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EleitorDetalhe({ eleitor, open, onOpenChange }: EleitorDetalheProps) {
  const [demandaModalOpen, setDemandaModalOpen] = useState(false);
  const [selectedDemanda, setSelectedDemanda] = useState<Demanda | null>(null);
  const { demandas, createDemanda, updateStatus, isCreating } = useDemandas(eleitor?.id);

  if (!eleitor) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-lg">{eleitor.nome}</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 mt-4">
            {/* Dados do eleitor */}
            <div className="space-y-2">
              {eleitor.telefone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{eleitor.telefone}</span>
                </div>
              )}
              {eleitor.endereco && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{eleitor.endereco}</span>
                </div>
              )}
              {eleitor.bairro && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{eleitor.bairro}</span>
                </div>
              )}
            </div>

            {/* Demandas */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold">Demandas</p>
                <Button size="sm" onClick={() => setDemandaModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Nova
                </Button>
              </div>

              {demandas.length === 0 ? (
                <div className="flex flex-col items-center py-6 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mb-2" />
                  <p className="text-sm">Nenhuma demanda registrada</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {demandas.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDemanda(d)}
                      className="w-full text-left p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{d.titulo}</p>
                          {d.responsavel && (
                            <p className="text-xs text-muted-foreground mt-0.5">Resp: {d.responsavel}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {d.created_at ? format(new Date(d.created_at), "dd/MM/yyyy", { locale: ptBR }) : "—"}
                          </p>
                        </div>
                        <Badge variant={statusBadge[d.status].variant} className="shrink-0 text-[10px]">
                          {statusBadge[d.status].label}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <DemandaModal
        open={demandaModalOpen}
        onOpenChange={setDemandaModalOpen}
        eleitorId={eleitor.id}
        onSubmit={createDemanda}
        isLoading={isCreating}
      />

      <DemandaDetalhe
        demanda={selectedDemanda}
        open={!!selectedDemanda}
        onOpenChange={(o) => !o && setSelectedDemanda(null)}
        onUpdateStatus={updateStatus}
      />
    </>
  );
}
