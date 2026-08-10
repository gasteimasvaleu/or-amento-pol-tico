import { useState, useMemo } from "react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { PullToRefreshIndicator } from "@/components/ui/PullToRefreshIndicator";
import { Layout } from "@/components/layout/Layout";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useCompromissos } from "@/hooks/useCompromissos";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import { TIPO_COMPROMISSO, TIPO_COLORS } from "@/types/compromisso";
import type { Compromisso } from "@/types/compromisso";
import { format, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, MapPin, Clock, Pencil, Trash2, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const emptyForm = {
  titulo: "",
  descricao: "",
  data_inicio_date: "",
  data_inicio_time: "09:00",
  data_fim_date: "",
  data_fim_time: "10:00",
  local: "",
  tipo: "reuniao",
};

const Agenda = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { compromissos, isLoading, create, update, remove, isCreating, isUpdating } = useCompromissos();
  const { containerRef, refreshing, pullDistance } = usePullToRefresh({ queryKeys: [['compromissos']] });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const daysWithEvents = useMemo(() => {
    const days = new Set<string>();
    compromissos.forEach((c: any) => {
      days.add(format(parseISO(c.data_inicio), "yyyy-MM-dd"));
    });
    return days;
  }, [compromissos]);

  const dayCompromissos = useMemo(() => {
    return compromissos.filter((c: any) =>
      isSameDay(parseISO(c.data_inicio), selectedDate)
    ) as Compromisso[];
  }, [compromissos, selectedDate]);

  const openNew = () => {
    setEditingId(null);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    setForm({ ...emptyForm, data_inicio_date: dateStr, data_fim_date: dateStr });
    setDialogOpen(true);
  };

  const openEdit = (c: Compromisso) => {
    setEditingId(c.id);
    const start = parseISO(c.data_inicio);
    const end = c.data_fim ? parseISO(c.data_fim) : null;
    setForm({
      titulo: c.titulo,
      descricao: c.descricao ?? "",
      data_inicio_date: format(start, "yyyy-MM-dd"),
      data_inicio_time: format(start, "HH:mm"),
      data_fim_date: end ? format(end, "yyyy-MM-dd") : format(start, "yyyy-MM-dd"),
      data_fim_time: end ? format(end, "HH:mm") : "",
      local: c.local ?? "",
      tipo: c.tipo,
    });
    setDialogOpen(true);
  };

  const toISO = (dateStr: string, timeStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const [hh, mm] = timeStr.split(":").map(Number);
    return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0, 0);
  };

  const handleSubmit = async () => {
    if (!form.titulo || !form.data_inicio_date || !form.data_inicio_time) return;
    const startDate = toISO(form.data_inicio_date, form.data_inicio_time);
    const endDate = form.data_fim_date && form.data_fim_time
      ? toISO(form.data_fim_date, form.data_fim_time)
      : null;

    if (endDate && endDate < startDate) {
      toast({ title: "A data/hora de fim deve ser após o início", variant: "destructive" });
      return;
    }

    const data_inicio = startDate.toISOString();
    const data_fim = endDate ? endDate.toISOString() : null;

    if (editingId) {
      await update({
        id: editingId,
        titulo: form.titulo,
        descricao: form.descricao || null,
        data_inicio,
        data_fim,
        local: form.local || null,
        tipo: form.tipo,
      });
    } else {
      await create({
        user_id: user!.id,
        titulo: form.titulo,
        descricao: form.descricao || null,
        data_inicio,
        data_fim,
        local: form.local || null,
        tipo: form.tipo,
      });
    }
    setSelectedDate(startDate);
    setDialogOpen(false);
  };


  const tipoLabel = (tipo: string) =>
    TIPO_COMPROMISSO.find((t) => t.value === tipo)?.label ?? tipo;

  return (
    <Layout>
      <div ref={containerRef} className="flex flex-col gap-4 pb-20 overflow-auto">
        <PullToRefreshIndicator refreshing={refreshing} pullDistance={pullDistance} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Agenda</h1>
            <p className="text-sm text-muted-foreground">Compromissos do parlamentar</p>
          </div>
          <Button size="sm" onClick={openNew} className="gap-1.5">
            <Plus className="h-4 w-4" /> Novo
          </Button>
        </div>

        <div className="grid gap-4 items-start lg:grid-cols-[380px_1fr]">
        {/* Calendar */}
        <div className="bg-card rounded-xl border border-border p-2 w-full max-w-sm mx-auto lg:max-w-none lg:mx-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => d && setSelectedDate(d)}
            locale={ptBR}
            className="p-2 pointer-events-auto w-full"
            classNames={{
              cell: "h-10 sm:h-11 flex-1 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "inline-flex items-center justify-center rounded-md h-10 sm:h-11 w-full p-0 font-normal hover:bg-accent hover:text-accent-foreground aria-selected:opacity-100",
            }}
            modifiers={{ hasEvent: (date: Date) => daysWithEvents.has(format(date, "yyyy-MM-dd")) }}
            modifiersClassNames={{ hasEvent: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-primary" }}
          />
        </div>

        {/* Day events */}
        <div>

          <h2 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            {format(selectedDate, "dd 'de' MMMM, EEEE", { locale: ptBR })}
          </h2>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : dayCompromissos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum compromisso neste dia</p>
              <Button variant="link" size="sm" onClick={openNew} className="mt-1">
                Adicionar compromisso
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {dayCompromissos.map((c) => {
                const start = parseISO(c.data_inicio);
                const end = c.data_fim ? parseISO(c.data_fim) : null;
                return (
                  <div
                    key={c.id}
                    className="bg-card border border-border rounded-xl p-3 flex gap-3"
                  >
                    <div className={cn("w-1 rounded-full shrink-0", TIPO_COLORS[c.tipo] ?? "bg-muted-foreground")} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm text-foreground truncate">{c.titulo}</p>
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {tipoLabel(c.tipo)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(start, "HH:mm")}
                          {end && ` – ${format(end, "HH:mm")}`}
                        </span>
                        {c.local && (
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3" />
                            {c.local}
                          </span>
                        )}
                      </div>
                      {c.descricao && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.descricao}</p>
                      )}
                      <div className="flex gap-1 mt-2">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => openEdit(c)}>
                          <Pencil className="h-3 w-3 mr-1" /> Editar
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive" onClick={() => setDeleteId(c.id)}>
                          <Trash2 className="h-3 w-3 mr-1" /> Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Compromisso" : "Novo Compromisso"}</DialogTitle>
            <DialogDescription>Preencha os dados do compromisso</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Título *</Label>
              <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Reunião com vereadores" />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPO_COMPROMISSO.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Data Início *</Label>
                <Input type="date" value={form.data_inicio_date} onChange={(e) => setForm({ ...form, data_inicio_date: e.target.value })} />
              </div>
              <div>
                <Label>Hora Início *</Label>
                <Input type="time" value={form.data_inicio_time} onChange={(e) => setForm({ ...form, data_inicio_time: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Data Fim</Label>
                <Input type="date" value={form.data_fim_date} onChange={(e) => setForm({ ...form, data_fim_date: e.target.value })} />
              </div>
              <div>
                <Label>Hora Fim</Label>
                <Input type="time" value={form.data_fim_time} onChange={(e) => setForm({ ...form, data_fim_time: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Local</Label>
              <Input value={form.local} onChange={(e) => setForm({ ...form, local: e.target.value })} placeholder="Ex: Câmara Municipal" />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Detalhes do compromisso..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isCreating || isUpdating || !form.titulo}>
              {editingId ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir compromisso?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { if (deleteId) { await remove(deleteId); setDeleteId(null); } }}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Agenda;
