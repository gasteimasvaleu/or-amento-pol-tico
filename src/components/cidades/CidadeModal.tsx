import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, X, Upload, Image, Trash2 } from "lucide-react";
import { useCidadeMidias } from "@/hooks/useCidades";
import type { Cidade, CidadeInsert, RecursoItem, CidadeMidia } from "@/types/cidade";

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
          <Input
            placeholder="Objeto"
            value={item.objeto}
            onChange={(e) => updateItem(i, "objeto", e.target.value)}
            className="flex-1"
          />
          <div className="relative w-28 shrink-0">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={item.valor || ""}
              onChange={(e) => updateItem(i, "valor", Number(e.target.value) || 0)}
              className="pl-8"
            />
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

function MidiasSection({ cidadeId }: { cidadeId?: string }) {
  const { midias, uploadMidia, isUploading, deleteMidia } = useCidadeMidias(cidadeId);
  const [descricao, setDescricao] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file || !cidadeId) return;
    await uploadMidia({ file, descricao, cidadeId });
    setDescricao("");
    if (fileRef.current) fileRef.current.value = "";
  };

  if (!cidadeId) return (
    <p className="text-xs text-muted-foreground italic">Salve a cidade primeiro para adicionar mídias.</p>
  );

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input ref={fileRef} type="file" accept="image/*,video/*,.pdf" className="hidden" id="cidade-midia-upload" />
            <Button type="button" variant="outline" size="sm" className="w-full gap-1 text-xs" onClick={() => fileRef.current?.click()}>
              <Upload className="h-3 w-3" /> Selecionar arquivo
            </Button>
          </div>
        </div>
        <Input placeholder="Descrição da mídia..." value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        <Button type="button" size="sm" className="w-full" disabled={isUploading} onClick={handleUpload}>
          {isUploading ? "Enviando..." : "Enviar Mídia"}
        </Button>
      </div>

      {midias.length > 0 && (
        <div className="space-y-2">
          {midias.map((m) => (
            <div key={m.id} className="flex items-center gap-2 rounded-md border p-2">
              {m.arquivo_tipo?.startsWith("image") ? (
                <img src={m.arquivo_url} alt={m.descricao} className="h-10 w-10 rounded object-cover shrink-0" />
              ) : (
                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                  <Image className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{m.arquivo_nome}</p>
                {m.descricao && <p className="text-xs text-muted-foreground truncate">{m.descricao}</p>}
              </div>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive shrink-0" onClick={() => deleteMidia(m)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
        recursos_destinados: cidade.recursos_destinados || [],
        acoes_realizadas: cidade.acoes_realizadas,
        emendas_parlamentares: cidade.emendas_parlamentares || [],
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
              <Textarea rows={3} value={form.acoes_realizadas} onChange={(e) => set("acoes_realizadas", e.target.value)} placeholder="Descreva as ações realizadas na cidade..." />
            </div>

            <Separator />
            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea rows={3} value={form.observacoes} onChange={(e) => set("observacoes", e.target.value)} />
            </div>

            <Separator />
            <p className="text-sm font-semibold text-muted-foreground">Mídias da Cidade</p>
            <MidiasSection cidadeId={cidade?.id} />

            <Button type="submit" className="w-full" disabled={loading || !form.nome.trim()}>
              {cidade ? "Salvar Alterações" : "Cadastrar Cidade"}
            </Button>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
