import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useLembretes } from "@/hooks/useLembretes";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Plus, Pencil, Trash2, CheckCircle2, Circle } from "lucide-react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "@/components/ui/PullToRefreshIndicator";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { PRIORIDADES, CATEGORIAS } from "@/types/lembrete";
import type { Lembrete } from "@/types/lembrete";
import { LembreteModal } from "@/components/lembretes/LembreteModal";

export default function Lembretes() {
  const { user } = useAuth();
  const { lembretes, isLoading, create, update, remove } = useLembretes();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Lembrete | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const pendentes = lembretes.filter((l: Lembrete) => !l.concluido);
  const concluidos = lembretes.filter((l: Lembrete) => l.concluido);

  const handleSave = async (data: any) => {
    if (editing) {
      await update({ id: editing.id, ...data });
    } else {
      await create({ ...data, user_id: user!.id });
    }
    setModalOpen(false);
    setEditing(null);
  };

  const handleToggle = async (lembrete: Lembrete) => {
    await update({ id: lembrete.id, concluido: !lembrete.concluido });
  };

  const handleEdit = (lembrete: Lembrete) => {
    setEditing(lembrete);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await remove(deleteId);
      setDeleteId(null);
    }
  };

  const getPrioridade = (value: string) =>
    PRIORIDADES.find((p) => p.value === value) ?? PRIORIDADES[1];

  const getCategoria = (value: string) =>
    CATEGORIAS.find((c) => c.value === value) ?? CATEGORIAS[0];

  const renderCard = (lembrete: Lembrete) => {
    const prio = getPrioridade(lembrete.prioridade);
    const cat = getCategoria(lembrete.categoria);

    return (
      <Card key={lembrete.id} className="p-4 space-y-2">
        <div className="flex items-start gap-3">
          <button onClick={() => handleToggle(lembrete)} className="mt-0.5 shrink-0">
            {lembrete.concluido ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-sm ${lembrete.concluido ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {lembrete.titulo}
            </p>
            {lembrete.descricao && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{lembrete.descricao}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge variant="outline" className={`text-[10px] ${prio.color}`}>
                {prio.label}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {cat.icon} {cat.label}
              </Badge>
              <span className="text-[10px] text-muted-foreground">
                {format(new Date(lembrete.data_lembrete), "dd/MM/yyyy", { locale: ptBR })}
                {lembrete.hora_lembrete && ` às ${lembrete.hora_lembrete.slice(0, 5)}`}
              </span>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(lembrete)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(lembrete.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="flex flex-col gap-4 pb-20">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-foreground">Lembretes</h1>
            <p className="text-sm text-muted-foreground">Gerencie seus lembretes</p>
          </div>
          <Button size="sm" onClick={() => { setEditing(null); setModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> Novo
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        ) : lembretes.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <Bell className="h-12 w-12 text-muted-foreground/40 mx-auto" />
            <p className="text-muted-foreground text-sm">Nenhum lembrete cadastrado</p>
            <Button variant="outline" size="sm" onClick={() => { setEditing(null); setModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Criar primeiro lembrete
            </Button>
          </div>
        ) : (
          <>
            {pendentes.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Pendentes ({pendentes.length})
                </h2>
                {pendentes.map(renderCard)}
              </section>
            )}
            {concluidos.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Concluídos ({concluidos.length})
                </h2>
                {concluidos.map(renderCard)}
              </section>
            )}
          </>
        )}
      </div>

      <LembreteModal
        open={modalOpen}
        onOpenChange={(open) => { setModalOpen(open); if (!open) setEditing(null); }}
        onSave={handleSave}
        editing={editing}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lembrete?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
