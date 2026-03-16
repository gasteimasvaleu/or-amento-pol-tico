import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DemandaInsert } from "@/types/eleitor";

interface DemandaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eleitorId: string;
  onSubmit: (data: DemandaInsert) => Promise<any>;
  isLoading?: boolean;
}

export function DemandaModal({ open, onOpenChange, eleitorId, onSubmit, isLoading }: DemandaModalProps) {
  const [form, setForm] = useState({ titulo: "", descricao: "", responsavel: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      eleitor_id: eleitorId,
      titulo: form.titulo,
      descricao: form.descricao,
      responsavel: form.responsavel,
      status: "novo",
    });
    setForm({ titulo: "", descricao: "", responsavel: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Demanda</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input id="titulo" required value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável</Label>
            <Input id="responsavel" value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isLoading || !form.titulo}>{isLoading ? "Salvando..." : "Abrir Chamado"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
