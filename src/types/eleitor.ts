export interface Eleitor {
  id: string;
  user_id: string;
  nome: string;
  telefone: string;
  endereco: string;
  bairro: string;
  created_at: string | null;
  updated_at: string | null;
}

export type EleitorInsert = Omit<Eleitor, "id" | "user_id" | "created_at" | "updated_at">;

export type DemandaStatus = "novo" | "em_andamento" | "resolvido";

export interface Demanda {
  id: string;
  user_id: string;
  eleitor_id: string;
  titulo: string;
  descricao: string;
  responsavel: string;
  status: DemandaStatus;
  created_at: string | null;
  updated_at: string | null;
}

export type DemandaInsert = Omit<Demanda, "id" | "user_id" | "created_at" | "updated_at">;

export interface DemandaHistorico {
  id: string;
  demanda_id: string;
  descricao: string;
  created_at: string | null;
}

export interface DemandaAnexo {
  id: string;
  demanda_id: string;
  arquivo_url: string;
  arquivo_nome: string;
  arquivo_tipo: string;
  created_at: string | null;
}
