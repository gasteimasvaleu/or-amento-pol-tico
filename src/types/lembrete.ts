export interface Lembrete {
  id: string;
  user_id: string;
  titulo: string;
  descricao: string | null;
  data_lembrete: string;
  hora_lembrete: string | null;
  prioridade: string;
  categoria: string;
  concluido: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface LembreteInsert {
  user_id: string;
  titulo: string;
  descricao?: string | null;
  data_lembrete: string;
  hora_lembrete?: string | null;
  prioridade?: string;
  categoria?: string;
  concluido?: boolean;
}

export interface LembreteUpdate {
  titulo?: string;
  descricao?: string | null;
  data_lembrete?: string;
  hora_lembrete?: string | null;
  prioridade?: string;
  categoria?: string;
  concluido?: boolean;
}

export const PRIORIDADES = [
  { value: "baixa", label: "Baixa", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "media", label: "Média", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "alta", label: "Alta", color: "bg-orange-100 text-orange-700 border-orange-200" },
  { value: "urgente", label: "Urgente", color: "bg-red-100 text-red-700 border-red-200" },
] as const;

export const CATEGORIAS = [
  { value: "geral", label: "Geral", icon: "📌" },
  { value: "reuniao", label: "Reunião", icon: "🤝" },
  { value: "ligacao", label: "Ligação", icon: "📞" },
  { value: "documento", label: "Documento", icon: "📄" },
  { value: "prazo", label: "Prazo", icon: "⏰" },
  { value: "pessoal", label: "Pessoal", icon: "👤" },
] as const;
