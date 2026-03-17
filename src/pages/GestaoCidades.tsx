import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Building2, User, DollarSign, Users, Pencil, Trash2, MapPin } from "lucide-react";
import { useCidades, useBairros } from "@/hooks/useCidades";
import { CidadeModal } from "@/components/cidades/CidadeModal";
import { BairroModal } from "@/components/cidades/BairroModal";
import type { Cidade, CidadeInsert, RecursoItem, Bairro, BairroInsert } from "@/types/cidade";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function sumRecursos(items: RecursoItem[]): number {
  return (items || []).reduce((s, i) => s + (i.valor || 0), 0);
}

export default function GestaoCidades() {
  const { cidades, isLoading, createCidade, updateCidade, deleteCidade, isCreating } = useCidades();
  const { bairros, createBairro, updateBairro, deleteBairro, isCreating: isCreatingBairro } = useBairros();
  const [search, setSearch] = useState("");

  // Cidade modal
  const [cidadeModalOpen, setCidadeModalOpen] = useState(false);
  const [editingCidade, setEditingCidade] = useState<Cidade | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Bairro modal
  const [bairroModalOpen, setBairroModalOpen] = useState(false);
  const [editingBairro, setEditingBairro] = useState<Bairro | null>(null);
  const [deleteBairroId, setDeleteBairroId] = useState<string | null>(null);

  const filtered = cidades.filter((c) =>
    `${c.nome} ${c.estado} ${c.prefeito}`.toLowerCase().includes(search.toLowerCase())
  );

  // Cidade handlers
  const handleSaveCidade = async (data: CidadeInsert) => {
    if (editingCidade) {
      await updateCidade({ id: editingCidade.id, ...data });
    } else {
      await createCidade(data);
    }
    setEditingCidade(null);
  };

  const handleEditCidade = (cidade: Cidade) => {
    setEditingCidade(cidade);
    setCidadeModalOpen(true);
  };

  const handleDeleteCidade = async () => {
    if (deleteId) {
      await deleteCidade(deleteId);
      setDeleteId(null);
    }
  };

  // Bairro handlers
  const handleSaveBairro = async (data: BairroInsert) => {
    if (editingBairro) {
      await updateBairro({ id: editingBairro.id, ...data });
    } else {
      await createBairro(data);
    }
    setEditingBairro(null);
  };

  const handleEditBairro = (bairro: Bairro) => {
    setEditingBairro(bairro);
    setBairroModalOpen(true);
  };

  const handleDeleteBairro = async () => {
    if (deleteBairroId) {
      await deleteBairro(deleteBairroId);
      setDeleteBairroId(null);
    }
  };

  const formatCurrency = (value: number) =>
    value > 0 ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";
  const formatNumber = (value: number) =>
    value > 0 ? value.toLocaleString("pt-BR") : "—";

  const bairrosByCidade = (cidadeId: string) => bairros.filter((b) => b.cidade_id === cidadeId);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gestão de Cidades</h1>
            <p className="text-muted-foreground text-sm">Gerencie as cidades e bairros do seu mandato</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { setEditingCidade(null); setCidadeModalOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" /> Nova Cidade
            </Button>
            <Button variant="outline" onClick={() => { setEditingBairro(null); setBairroModalOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" /> Novo Bairro
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, estado ou prefeito..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <VideoOverlay />
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">
            {search ? "Nenhuma cidade encontrada." : "Nenhuma cidade cadastrada."}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((cidade) => {
              const totalRecursos = sumRecursos(cidade.recursos_destinados);
              const totalEmendas = sumRecursos(cidade.emendas_parlamentares);
              const cidadeBairros = bairrosByCidade(cidade.id);
              return (
                <Card key={cidade.id} className="group relative">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Building2 className="h-5 w-5 text-primary shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{cidade.nome}</p>
                          {cidade.estado && <p className="text-xs text-muted-foreground">{cidade.estado}</p>}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditCidade(cidade)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(cidade.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {cidade.prefeito && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <User className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{cidade.prefeito}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="h-3.5 w-3.5 shrink-0" />
                        <span>Pop: {formatNumber(cidade.populacao)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                        <DollarSign className="h-3.5 w-3.5 shrink-0" />
                        <span>Recursos: {formatCurrency(totalRecursos)}</span>
                      </div>
                      {totalEmendas > 0 && (
                        <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                          <DollarSign className="h-3.5 w-3.5 shrink-0" />
                          <span>Emendas: {formatCurrency(totalEmendas)}</span>
                        </div>
                      )}
                      {cidadeBairros.length > 0 && (
                        <div className="flex items-center gap-1.5 text-muted-foreground col-span-2">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span>{cidadeBairros.length} bairro{cidadeBairros.length > 1 ? "s" : ""}</span>
                        </div>
                      )}
                    </div>

                    {/* Bairros list */}
                    {cidadeBairros.length > 0 && (
                      <div className="border-t pt-2 space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">Bairros</p>
                        {cidadeBairros.map((b) => (
                          <div key={b.id} className="flex items-center justify-between gap-2 rounded-md border p-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{b.nome}</p>
                              {b.liderancas.length > 0 && (
                                <p className="text-xs text-muted-foreground truncate">
                                  Lideranças: {b.liderancas.filter(Boolean).join(", ")}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditBairro(b)}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteBairroId(b.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <CidadeModal
        open={cidadeModalOpen}
        onOpenChange={setCidadeModalOpen}
        onSave={handleSaveCidade}
        cidade={editingCidade}
        loading={isCreating}
      />

      <BairroModal
        open={bairroModalOpen}
        onOpenChange={setBairroModalOpen}
        onSave={handleSaveBairro}
        bairro={editingBairro}
        cidades={cidades}
        loading={isCreatingBairro}
      />

      {/* Delete cidade dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover cidade?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. Os bairros vinculados também serão removidos.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCidade} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete bairro dialog */}
      <AlertDialog open={!!deleteBairroId} onOpenChange={() => setDeleteBairroId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover bairro?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBairro} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
