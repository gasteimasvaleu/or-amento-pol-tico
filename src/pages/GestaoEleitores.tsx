import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users, Phone, MapPin, Trash2 } from "lucide-react";
import { useEleitores } from "@/hooks/useEleitores";
import { useDemandas } from "@/hooks/useDemandas";
import { EleitorModal } from "@/components/eleitores/EleitorModal";
import { EleitorDetalhe } from "@/components/eleitores/EleitorDetalhe";
import type { Eleitor } from "@/types/eleitor";

export default function GestaoEleitores() {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEleitor, setSelectedEleitor] = useState<Eleitor | null>(null);
  const { eleitores, isLoading, createEleitor, deleteEleitor, isCreating } = useEleitores();
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

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
                        <p className="font-medium truncate">{eleitor.nome}</p>
                        {eleitor.telefone && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                            <Phone className="h-3 w-3" />
                            <span>{eleitor.telefone}</span>
                          </div>
                        )}
                        {eleitor.bairro && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="h-3 w-3" />
                            <span>{eleitor.bairro}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {abertas > 0 && (
                          <Badge variant="destructive" className="text-[10px]">
                            {abertas} {abertas === 1 ? "aberta" : "abertas"}
                          </Badge>
                        )}
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

      <EleitorModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={createEleitor}
        isLoading={isCreating}
      />

      <EleitorDetalhe
        eleitor={selectedEleitor}
        open={!!selectedEleitor}
        onOpenChange={(o) => !o && setSelectedEleitor(null)}
      />
    </Layout>
  );
}
