import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EleitorInsert } from "@/types/eleitor";

interface EleitorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EleitorInsert) => Promise<any>;
  isLoading?: boolean;
}

export function EleitorModal({ open, onOpenChange, onSubmit, isLoading }: EleitorModalProps) {
  const [form, setForm] = useState<EleitorInsert>({ nome: "", telefone: "", endereco: "", bairro: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
    setForm({ nome: "", telefone: "", endereco: "", bairro: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Eleitor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input id="endereco" value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bairro">Bairro</Label>
            <Input id="bairro" value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isLoading || !form.nome}>{isLoading ? "Salvando..." : "Salvar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
