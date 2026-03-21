import { useState, useMemo } from "react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "@/components/ui/PullToRefreshIndicator";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, Phone, MapPin, Trash2, Pencil } from "lucide-react";
import { Loader2 } from "lucide-react";
import { useEleitores } from "@/hooks/useEleitores";
import { useDemandas } from "@/hooks/useDemandas";
import { EleitorModal } from "@/components/eleitores/EleitorModal";
import { EleitorDetalhe } from "@/components/eleitores/EleitorDetalhe";
import type { Eleitor } from "@/types/eleitor";
import { cn } from "@/lib/utils";

const classificacaoColor: Record<string, string> = {
  positivo: "bg-green-500",
  neutro: "bg-yellow-500",
  negativo: "bg-destructive",
};

export default function GestaoEleitores() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEleitor, setEditingEleitor] = useState<Eleitor | null>(null);
  const [selectedEleitor, setSelectedEleitor] = useState<Eleitor | null>(null);
  const { eleitores, isLoading, createEleitor, updateEleitor, deleteEleitor, isCreating } = useEleitores();
  const { demandas } = useDemandas();

  const demandasAbertasPorEleitor = useMemo(() => {
    const map: Record<string, number> = {};
    demandas.forEach((d) => {
      if (d.status !== "resolvido") {
        map[d.eleitor_id] = (map[d.eleitor_id] || 0) + 1;
      }
    });
    return map;
  }, [demandas]);

  const filtered = useMemo(() => {
    if (!search) return eleitores;
    const q = search.toLowerCase();
    return eleitores.filter(
      (e) =>
        e.nome.toLowerCase().includes(q) ||
        e.bairro?.toLowerCase().includes(q) ||
        e.telefone?.includes(q)
    );
  }, [eleitores, search]);

  const handleWhatsApp = (telefone: string) => {
    const clean = telefone.replace(/\D/g, "");
    window.open(`https://wa.me/55${clean}`, "_blank");
  };

  const handleEditSubmit = async (data: any) => {
    if (editingEleitor) {
      await updateEleitor({ id: editingEleitor.id, ...data });
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Gestão de Eleitores</h1>
            <p className="text-sm text-muted-foreground">{eleitores.length} cadastrados</p>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Novo
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, bairro ou telefone..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground">Para cadastrar demanda, clique no eleitor</p>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mb-3" />
            <p className="text-sm">{search ? "Nenhum resultado encontrado" : "Nenhum eleitor cadastrado"}</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((eleitor) => {
              const abertas = demandasAbertasPorEleitor[eleitor.id] || 0;
              return (
                <Card
                  key={eleitor.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedEleitor(eleitor)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "h-2.5 w-2.5 rounded-full shrink-0",
                              classificacaoColor[eleitor.classificacao] || "bg-yellow-500"
                            )}
                          />
                          <p className="font-medium truncate">{eleitor.nome}</p>
                        </div>
                        {eleitor.telefone && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 ml-[18px]">
                            <Phone className="h-3 w-3" />
                            <span>{eleitor.telefone}</span>
                          </div>
                        )}
                        {(eleitor.cidade || eleitor.bairro) && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 ml-[18px]">
                            <MapPin className="h-3 w-3" />
                            <span>
                              {eleitor.cidade && eleitor.bairro
                                ? `${eleitor.cidade} / ${eleitor.bairro}`
                                : eleitor.cidade || eleitor.bairro}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {abertas > 0 && (
                          <Badge variant="destructive" className="text-[10px] mr-1">
                            {abertas}
                          </Badge>
                        )}
                        {eleitor.telefone && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWhatsApp(eleitor.telefone);
                            }}
                          >
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-green-500">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingEleitor(eleitor);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEleitor(eleitor.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal criar */}
      <EleitorModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={createEleitor}
        isLoading={isCreating}
      />

      {/* Modal editar */}
      <EleitorModal
        open={!!editingEleitor}
        onOpenChange={(o) => !o && setEditingEleitor(null)}
        onSubmit={handleEditSubmit}
        eleitor={editingEleitor}
      />

      <EleitorDetalhe
        eleitor={selectedEleitor}
        open={!!selectedEleitor}
        onOpenChange={(o) => !o && setSelectedEleitor(null)}
      />
    </Layout>
  );
}
