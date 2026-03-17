export interface RecursoItem {
  objeto: string;
  valor: number;
}

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
  recursos_destinados: RecursoItem[];
  acoes_realizadas: string;
  emendas_parlamentares: RecursoItem[];
  observacoes: string;
  created_at: string | null;
  updated_at: string | null;
}

export type CidadeInsert = Omit<Cidade, "id" | "user_id" | "created_at" | "updated_at">;

export interface CidadeMidia {
  id: string;
  cidade_id: string;
  user_id: string;
  arquivo_url: string;
  arquivo_nome: string;
  arquivo_tipo: string;
  descricao: string;
  created_at: string | null;
}
