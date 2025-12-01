-- Create despesas_politicas table
CREATE TABLE public.despesas_politicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  cargo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Recorrente', 'Extra')),
  conta_pix TEXT NOT NULL,
  ultimo_pagamento DATE NOT NULL,
  valor DECIMAL(10,2) NOT NULL DEFAULT 0,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.despesas_politicas ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (transparency principle)
CREATE POLICY "Anyone can view despesas"
ON public.despesas_politicas
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert despesas"
ON public.despesas_politicas
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update despesas"
ON public.despesas_politicas
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete despesas"
ON public.despesas_politicas
FOR DELETE
USING (true);

-- Create index for better query performance
CREATE INDEX idx_despesas_municipio ON public.despesas_politicas(municipio);
CREATE INDEX idx_despesas_tipo ON public.despesas_politicas(tipo);
CREATE INDEX idx_despesas_ultimo_pagamento ON public.despesas_politicas(ultimo_pagamento);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_despesas_politicas_updated_at
BEFORE UPDATE ON public.despesas_politicas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();