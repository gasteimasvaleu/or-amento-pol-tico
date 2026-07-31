export interface Despesa {
  id: string;
  municipio: string;
  responsavel: string;
  cargo: string;
  tipo: 'Recorrente' | 'Extra';
  conta_pix: string;
  ultimo_pagamento: string;
  pagamento_agendado: string;
  pagamento_feito_em?: string;
  valor: number;
  observacao?: string;
  foto_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DespesaFormData {
  municipio: string;
  responsavel: string;
  cargo: string;
  tipo: 'Recorrente' | 'Extra';
  conta_pix: string;
  ultimo_pagamento: Date;
  pagamento_agendado?: Date;
  valor: number;
  observacao?: string;
  foto_url?: string | null;
}

export interface DespesaFilters {
  search?: string;
  municipio?: string;
  cargo?: string;
  tipo?: 'Recorrente' | 'Extra' | 'all';
  month?: number;
  year?: number;
}
