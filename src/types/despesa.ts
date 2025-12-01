export interface Despesa {
  id: string;
  municipio: string;
  responsavel: string;
  cargo: string;
  tipo: 'Recorrente' | 'Extra';
  conta_pix: string;
  ultimo_pagamento: string;
  valor: number;
  observacao?: string;
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
  valor: number;
  observacao?: string;
}

export interface DespesaFilters {
  search?: string;
  municipio?: string;
  cargo?: string;
  tipo?: 'Recorrente' | 'Extra' | 'all';
  month?: number;
  year?: number;
}
