export interface Apoiador {
  id: string;
  user_id: string;
  nome: string;
  telefone: string;
  email: string;
  cidade: string;
  bairro: string;
  partido: string;
  cargo_pretendido: string;
  lideranca_comunitaria: boolean;
  instagram: string;
  facebook: string;
  whatsapp: string;
  avatar_url: string | null;
  observacoes: string;
  created_at: string | null;
  updated_at: string | null;
}

export type ApoiadorInsert = Omit<Apoiador, "id" | "user_id" | "created_at" | "updated_at">;
