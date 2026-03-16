export interface Compromisso {
  id: string;
  user_id: string;
  titulo: string;
  descricao: string | null;
  data_inicio: string;
  data_fim: string | null;
  local: string | null;
  tipo: string;
  created_at: string | null;
  updated_at: string | null;
}

export type CompromissoInsert = Omit<Compromisso, "id" | "created_at" | "updated_at">;
export type CompromissoUpdate = Partial<CompromissoInsert>;

export const TIPO_COMPROMISSO = [
  { value: "reuniao", label: "Reunião" },
  { value: "audiencia", label: "Audiência" },
  { value: "evento", label: "Evento" },
  { value: "visita", label: "Visita" },
  { value: "outro", label: "Outro" },
] as const;

export const TIPO_COLORS: Record<string, string> = {
  reuniao: "bg-blue-500",
  audiencia: "bg-purple-500",
  evento: "bg-emerald-500",
  visita: "bg-amber-500",
  outro: "bg-muted-foreground",
};
