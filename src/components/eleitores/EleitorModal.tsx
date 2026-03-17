import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Eleitor, EleitorInsert, EleitorClassificacao } from "@/types/eleitor";
import { cn } from "@/lib/utils";

interface EleitorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EleitorInsert) => Promise<any>;
  isLoading?: boolean;
  eleitor?: Eleitor | null;
}

const classificacoes: { value: EleitorClassificacao; label: string; color: string }[] = [
  { value: "negativo", label: "Negativo", color: "bg-destructive" },
  { value: "neutro", label: "Neutro", color: "bg-yellow-500" },
  { value: "positivo", label: "Positivo", color: "bg-green-500" },
];

const emptyForm: EleitorInsert = { nome: "", telefone: "", endereco: "", bairro: "", classificacao: "neutro" };

export function EleitorModal({ open, onOpenChange, onSubmit, isLoading, eleitor }: EleitorModalProps) {
  const [form, setForm] = useState<EleitorInsert>(emptyForm);
  const isEdit = !!eleitor;

  useEffect(() => {
    if (eleitor) {
      setForm({
        nome: eleitor.nome,
        telefone: eleitor.telefone || "",
        endereco: eleitor.endereco || "",
        bairro: eleitor.bairro || "",
        classificacao: eleitor.classificacao || "neutro",
      });
    } else {
      setForm(emptyForm);
    }
  }, [eleitor, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
    setForm(emptyForm);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Eleitor" : "Novo Eleitor"}</DialogTitle>
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
          <div className="space-y-2">
            <Label>Classificação</Label>
            <div className="flex gap-2">
              {classificacoes.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm({ ...form, classificacao: c.value })}
                  className={cn(
                    "flex-1 rounded-md py-2 text-xs font-medium text-white transition-all",
                    c.color,
                    form.classificacao === c.value
                      ? "ring-2 ring-ring ring-offset-2 ring-offset-background scale-105"
                      : "opacity-40"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
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
