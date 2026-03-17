
CREATE TABLE public.bairros (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cidade_id uuid NOT NULL REFERENCES public.cidades(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  nome text NOT NULL,
  liderancas jsonb NOT NULL DEFAULT '[]'::jsonb,
  populacao integer NOT NULL DEFAULT 0,
  eleitorado integer NOT NULL DEFAULT 0,
  recursos_destinados jsonb NOT NULL DEFAULT '[]'::jsonb,
  acoes_realizadas text NOT NULL DEFAULT '',
  emendas_parlamentares jsonb NOT NULL DEFAULT '[]'::jsonb,
  observacoes text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.bairros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bairros"
  ON public.bairros FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bairros"
  ON public.bairros FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bairros"
  ON public.bairros FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bairros"
  ON public.bairros FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_bairros_updated_at
  BEFORE UPDATE ON public.bairros
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
