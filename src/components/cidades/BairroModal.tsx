import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import type { Bairro, BairroInsert, RecursoItem, Cidade } from "@/types/cidade";

interface BairroModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: BairroInsert) => Promise<any>;
  bairro?: Bairro | null;
  cidades: Cidade[];
  preSelectedCidadeId?: string;
  loading?: boolean;
}

const emptyForm: BairroInsert = {
  cidade_id: "",
  nome: "",
  liderancas: [],
  populacao: 0,
  eleitorado: 0,
  recursos_destinados: [],
  acoes_realizadas: "",
  emendas_parlamentares: [],
  observacoes: "",
};

function DynamicItemList({
  label,
  items,
  onChange,
}: {
  label: string;
  items: RecursoItem[];
  onChange: (items: RecursoItem[]) => void;
}) {
  const addItem = () => onChange([...items, { objeto: "", valor: 0 }]);
  const removeItem = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof RecursoItem, value: any) => {
    const updated = [...items];
    updated[i] = { ...updated[i], [field]: value };
    onChange(updated);
  };
  const total = items.reduce((sum, it) => sum + (it.valor || 0), 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-muted-foreground">{label}</Label>
        <Button type="button" variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={addItem}>
          <Plus className="h-3 w-3" /> Adicionar
        </Button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input placeholder="Objeto" value={item.objeto} onChange={(e) => updateItem(i, "objeto", e.target.value)} className="flex-1" />
          <div className="relative w-28 shrink-0">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
            <Input type="number" min={0} step={0.01} value={item.valor || ""} onChange={(e) => updateItem(i, "valor", Number(e.target.value) || 0)} className="pl-8" />
          </div>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => removeItem(i)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      {items.length > 0 && (
        <p className="text-xs text-muted-foreground text-right">
          Total: {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
      )}
    </div>
  );
}

function DynamicStringList({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const addItem = () => onChange([...items, ""]);
  const removeItem = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, value: string) => {
    const updated = [...items];
    updated[i] = value;
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-muted-foreground">{label}</Label>
        <Button type="button" variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={addItem}>
          <Plus className="h-3 w-3" /> Adicionar
        </Button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            placeholder={placeholder || "Nome"}
            value={item}
            onChange={(e) => updateItem(i, e.target.value)}
            className="flex-1"
          />
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => removeItem(i)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
}

export function BairroModal({ open, onOpenChange, onSave, bairro, cidades, preSelectedCidadeId, loading }: BairroModalProps) {
  const [form, setForm] = useState<BairroInsert>(emptyForm);

  useEffect(() => {
    if (bairro) {
      setForm({
        cidade_id: bairro.cidade_id,
        nome: bairro.nome,
        liderancas: bairro.liderancas || [],
        populacao: bairro.populacao,
        eleitorado: bairro.eleitorado,
        recursos_destinados: bairro.recursos_destinados || [],
        acoes_realizadas: bairro.acoes_realizadas,
        emendas_parlamentares: bairro.emendas_parlamentares || [],
        observacoes: bairro.observacoes,
      });
    } else {
      setForm({ ...emptyForm, cidade_id: preSelectedCidadeId || "" });
    }
  }, [bairro, open, preSelectedCidadeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
    onOpenChange(false);
  };

  const set = (field: keyof BairroInsert, value: any) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{bairro ? "Editar Bairro" : "Novo Bairro"}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-5rem)]">
          <form onSubmit={handleSubmit} className="space-y-5 p-6 pt-4">
            {/* Dados gerais */}
            <p className="text-sm font-semibold text-muted-foreground">Dados Gerais</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label>Cidade *</Label>
                <Select value={form.cidade_id} onValueChange={(v) => set("cidade_id", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {cidades.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome}{c.estado ? ` - ${c.estado}` : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label>Nome do Bairro *</Label>
                <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>População</Label>
                <Input type="number" min={0} value={form.populacao || ""} onChange={(e) => set("populacao", Number(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label>Eleitorado</Label>
                <Input type="number" min={0} value={form.eleitorado || ""} onChange={(e) => set("eleitorado", Number(e.target.value) || 0)} />
              </div>
            </div>

            <Separator />
            <DynamicStringList
              label="Lideranças"
              items={form.liderancas}
              onChange={(items) => set("liderancas", items)}
              placeholder="Nome da liderança"
            />

            <Separator />
            <DynamicItemList
              label="Recursos Destinados"
              items={form.recursos_destinados}
              onChange={(items) => set("recursos_destinados", items)}
            />

            <Separator />
            <DynamicItemList
              label="Emendas Parlamentares"
              items={form.emendas_parlamentares}
              onChange={(items) => set("emendas_parlamentares", items)}
            />

            <Separator />
            <div className="space-y-1.5">
              <Label>Ações Realizadas</Label>
              <Textarea rows={3} value={form.acoes_realizadas} onChange={(e) => set("acoes_realizadas", e.target.value)} />
            </div>

            <Separator />
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea rows={3} value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !form.nome.trim() || !form.cidade_id}>
              {bairro ? "Salvar Alterações" : "Cadastrar Bairro"}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
