import { useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const assessorSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100),
  cargo: z.string().trim().max(100).default(""),
  telefone: z.string().trim().max(20).default(""),
  email: z.string().trim().max(255).optional().refine(
    (val) => !val || z.string().email().safeParse(val).success,
    "Email inválido"
  ),
});

interface AssessorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { nome: string; cargo: string; telefone: string; email: string }) => Promise<any>;
  isSubmitting: boolean;
  defaultValues?: { nome: string; cargo: string; telefone: string; email: string };
  title?: string;
}

export function AssessorModal({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  defaultValues,
  title = "Novo Assessor",
}: AssessorModalProps) {
  const [nome, setNome] = useState(defaultValues?.nome ?? "");
  const [cargo, setCargo] = useState(defaultValues?.cargo ?? "");
  const [telefone, setTelefone] = useState(defaultValues?.telefone ?? "");
  const [email, setEmail] = useState(defaultValues?.email ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = assessorSchema.safeParse({ nome, cargo, telefone, email: email || undefined });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    await onSubmit({ nome: result.data.nome, cargo: result.data.cargo ?? "", telefone: result.data.telefone ?? "", email: email ?? "" });
    if (!defaultValues) {
      setNome("");
      setCargo("");
      setTelefone("");
      setEmail("");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo" />
            {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cargo">Cargo / Função</Label>
            <Input id="cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex: Assessor Parlamentar" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
