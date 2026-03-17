
CREATE TABLE public.cidades (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  nome text NOT NULL,
  estado text NOT NULL DEFAULT '',
  populacao integer NOT NULL DEFAULT 0,
  eleitorado integer NOT NULL DEFAULT 0,
  prefeito text NOT NULL DEFAULT '',
  vice_prefeito text NOT NULL DEFAULT '',
  vereadores text NOT NULL DEFAULT '',
  recursos_destinados numeric NOT NULL DEFAULT 0,
  acoes_realizadas text NOT NULL DEFAULT '',
  emendas_parlamentares text NOT NULL DEFAULT '',
  observacoes text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.cidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cidades" ON public.cidades FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cidades" ON public.cidades FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cidades" ON public.cidades FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cidades" ON public.cidades FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_cidades_updated_at
  BEFORE UPDATE ON public.cidades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
