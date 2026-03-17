import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Cidade, CidadeInsert } from "@/types/cidade";

interface CidadeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: CidadeInsert) => Promise<any>;
  cidade?: Cidade | null;
  loading?: boolean;
}

const emptyForm: CidadeInsert = {
  nome: "",
  estado: "",
  populacao: 0,
  eleitorado: 0,
  prefeito: "",
  vice_prefeito: "",
  vereadores: "",
  recursos_destinados: 0,
  acoes_realizadas: "",
  emendas_parlamentares: "",
  observacoes: "",
};

export function CidadeModal({ open, onOpenChange, onSave, cidade, loading }: CidadeModalProps) {
  const [form, setForm] = useState<CidadeInsert>(emptyForm);

  useEffect(() => {
    if (cidade) {
      setForm({
        nome: cidade.nome,
        estado: cidade.estado,
        populacao: cidade.populacao,
        eleitorado: cidade.eleitorado,
        prefeito: cidade.prefeito,
        vice_prefeito: cidade.vice_prefeito,
        vereadores: cidade.vereadores,
        recursos_destinados: cidade.recursos_destinados,
        acoes_realizadas: cidade.acoes_realizadas,
        emendas_parlamentares: cidade.emendas_parlamentares,
        observacoes: cidade.observacoes,
      });
    } else {
      setForm(emptyForm);
    }
  }, [cidade, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
    onOpenChange(false);
  };

  const set = (field: keyof CidadeInsert, value: any) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{cidade ? "Editar Cidade" : "Nova Cidade"}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-5rem)]">
          <form onSubmit={handleSubmit} className="space-y-5 p-6 pt-4">
            {/* Dados gerais */}
            <p className="text-sm font-semibold text-muted-foreground">Dados Gerais</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Nome *</Label>
                <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Estado</Label>
                <Input value={form.estado} onChange={(e) => set("estado", e.target.value)} placeholder="UF" maxLength={2} />
              </div>
              <div className="space-y-1.5">
                <Label>População</Label>
                <Input type="number" min={0} value={form.populacao || ""} onChange={(e) => set("populacao", Number(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <Label>Eleitorado</Label>
                <Input type="number" min={0} value={form.eleitorado || ""} onChange={(e) => set("eleitorado", Number(e.target.value) || 0)} />
              </div>
            </div>

            <Separator />
            <p className="text-sm font-semibold text-muted-foreground">Governo Local</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Prefeito</Label>
                <Input value={form.prefeito} onChange={(e) => set("prefeito", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Vice-Prefeito</Label>
                <Input value={form.vice_prefeito} onChange={(e) => set("vice_prefeito", e.target.value)} />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Vereadores</Label>
                <Textarea rows={3} value={form.vereadores} onChange={(e) => set("vereadores", e.target.value)} placeholder="Lista de vereadores..." />
              </div>
            </div>

            <Separator />
            <p className="text-sm font-semibold text-muted-foreground">Atuação Parlamentar</p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Recursos Destinados (R$)</Label>
                <Input type="number" min={0} step={0.01} value={form.recursos_destinados || ""} onChange={(e) => set("recursos_destinados", Number(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label>Ações Realizadas</Label>
                <Textarea rows={3} value={form.acoes_realizadas} onChange={(e) => set("acoes_realizadas", e.target.value)} placeholder="Descreva as ações realizadas na cidade..." />
              </div>
              <div className="space-y-1.5">
                <Label>Emendas Parlamentares</Label>
                <Textarea rows={3} value={form.emendas_parlamentares} onChange={(e) => set("emendas_parlamentares", e.target.value)} placeholder="Descreva as emendas destinadas..." />
              </div>
            </div>

            <Separator />
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea rows={3} value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !form.nome.trim()}>
              {cidade ? "Salvar Alterações" : "Cadastrar Cidade"}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
