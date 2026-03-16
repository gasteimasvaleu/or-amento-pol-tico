import { useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, UserPlus } from "lucide-react";
import type { ApoiadorInsert } from "@/types/apoiador";

const apoiadorSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100),
  telefone: z.string().trim().max(20).default(""),
  email: z
    .string()
    .trim()
    .max(255)
    .optional()
    .refine((val) => !val || z.string().email().safeParse(val).success, "Email inválido"),
  cidade: z.string().trim().max(100).default(""),
  bairro: z.string().trim().max(100).default(""),
  partido: z.string().trim().max(50).default(""),
  cargo_pretendido: z.string().trim().max(100).default(""),
  lideranca_comunitaria: z.boolean().default(false),
  instagram: z.string().trim().max(100).default(""),
  facebook: z.string().trim().max(100).default(""),
  whatsapp: z.string().trim().max(20).default(""),
  observacoes: z.string().trim().max(500).default(""),
});

interface ApoiadorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ApoiadorInsert) => Promise<any>;
  isSubmitting: boolean;
}

export function ApoiadorModal({ open, onOpenChange, onSubmit, isSubmitting }: ApoiadorModalProps) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [partido, setPartido] = useState("");
  const [cargoPretendido, setCargoPretendido] = useState("");
  const [lideranca, setLideranca] = useState(false);
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setNome(""); setTelefone(""); setEmail(""); setCidade(""); setBairro("");
    setPartido(""); setCargoPretendido(""); setLideranca(false);
    setInstagram(""); setFacebook(""); setWhatsapp(""); setObservacoes("");
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = apoiadorSchema.safeParse({
      nome, telefone, email: email || undefined, cidade, bairro,
      partido, cargo_pretendido: cargoPretendido, lideranca_comunitaria: lideranca,
      instagram, facebook, whatsapp, observacoes,
    });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    await onSubmit({
      nome: result.data.nome,
      telefone: result.data.telefone ?? "",
      email: email ?? "",
      cidade: result.data.cidade ?? "",
      bairro: result.data.bairro ?? "",
      partido: result.data.partido ?? "",
      cargo_pretendido: result.data.cargo_pretendido ?? "",
      lideranca_comunitaria: result.data.lideranca_comunitaria ?? false,
      instagram: result.data.instagram ?? "",
      facebook: result.data.facebook ?? "",
      whatsapp: result.data.whatsapp ?? "",
      avatar_url: null,
      observacoes: result.data.observacoes ?? "",
    });
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Apoiador</DialogTitle>
          <DialogDescription>Preencha as informações do apoiador.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dados básicos */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dados Básicos</p>
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
              {errors.nome && <p className="text-xs text-destructive">{errors.nome}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@ex.com" />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" />
              </div>
              <div className="space-y-2">
                <Label>Bairro</Label>
                <Input value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Bairro" />
              </div>
            </div>
          </div>

          {/* Dados políticos */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dados Políticos</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Partido</Label>
                <Input value={partido} onChange={(e) => setPartido(e.target.value)} placeholder="Ex: PSD" />
              </div>
              <div className="space-y-2">
                <Label>Cargo pretendido</Label>
                <Input value={cargoPretendido} onChange={(e) => setCargoPretendido(e.target.value)} placeholder="Ex: Vereador" />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label className="text-sm">Liderança comunitária</Label>
              <Switch checked={lideranca} onCheckedChange={setLideranca} />
            </div>
          </div>

          {/* Redes sociais */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Redes Sociais</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@usuario" />
              </div>
              <div className="space-y-2">
                <Label>Facebook</Label>
                <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="facebook.com/..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(00) 00000-0000" />
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Anotações sobre o apoiador..." rows={2} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              Cadastrar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
