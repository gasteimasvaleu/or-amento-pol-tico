export interface Cidade {
  id: string;
  user_id: string;
  nome: string;
  estado: string;
  populacao: number;
  eleitorado: number;
  prefeito: string;
  vice_prefeito: string;
  vereadores: string;
  recursos_destinados: number;
  acoes_realizadas: string;
  emendas_parlamentares: string;
  observacoes: string;
  created_at: string | null;
  updated_at: string | null;
}

export type CidadeInsert = Omit<Cidade, "id" | "user_id" | "created_at" | "updated_at">;
