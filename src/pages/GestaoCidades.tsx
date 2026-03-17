import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Building2, User, DollarSign, Users, Pencil, Trash2 } from "lucide-react";
import { useCidades } from "@/hooks/useCidades";
import { CidadeModal } from "@/components/cidades/CidadeModal";
import type { Cidade, CidadeInsert } from "@/types/cidade";
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

export default function GestaoCidades() {
  const { cidades, isLoading, createCidade, updateCidade, deleteCidade, isCreating } = useCidades();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Cidade | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = cidades.filter((c) =>
    `${c.nome} ${c.estado} ${c.prefeito}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (data: CidadeInsert) => {
    if (editing) {
      await updateCidade({ id: editing.id, ...data });
    } else {
      await createCidade(data);
    }
    setEditing(null);
  };

  const handleEdit = (cidade: Cidade) => {
    setEditing(cidade);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteCidade(deleteId);
      setDeleteId(null);
    }
  };

  const formatCurrency = (value: number) =>
    value > 0
      ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "—";

  const formatNumber = (value: number) =>
    value > 0 ? value.toLocaleString("pt-BR") : "—";

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Gestão de Cidades</h1>
            <p className="text-muted-foreground text-sm">Gerencie as cidades do seu mandato</p>
          </div>
          <Button onClick={() => { setEditing(null); setModalOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> Nova Cidade
          </Button>
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
          <p className="text-center text-muted-foreground py-10">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">
            {search ? "Nenhuma cidade encontrada." : "Nenhuma cidade cadastrada."}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((cidade) => (
              <Card key={cidade.id} className="group relative">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="h-5 w-5 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{cidade.nome}</p>
                        {cidade.estado && (
                          <p className="text-xs text-muted-foreground">{cidade.estado}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(cidade)}>
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
                      <span>Recursos: {formatCurrency(cidade.recursos_destinados)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CidadeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
        cidade={editing}
        loading={isCreating}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover cidade?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
