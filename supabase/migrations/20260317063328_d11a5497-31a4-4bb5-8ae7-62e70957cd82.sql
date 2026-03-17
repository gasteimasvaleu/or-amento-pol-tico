
-- Convert recursos_destinados from numeric to jsonb
ALTER TABLE public.cidades
  ALTER COLUMN recursos_destinados DROP DEFAULT,
  ALTER COLUMN recursos_destinados TYPE jsonb USING '[]'::jsonb,
  ALTER COLUMN recursos_destinados SET DEFAULT '[]'::jsonb;

-- Convert emendas_parlamentares from text to jsonb
ALTER TABLE public.cidades
  ALTER COLUMN emendas_parlamentares DROP DEFAULT,
  ALTER COLUMN emendas_parlamentares TYPE jsonb USING '[]'::jsonb,
  ALTER COLUMN emendas_parlamentares SET DEFAULT '[]'::jsonb;

-- Create cidade_midias table
CREATE TABLE public.cidade_midias (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cidade_id uuid NOT NULL REFERENCES public.cidades(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  arquivo_url text NOT NULL,
  arquivo_nome text NOT NULL,
  arquivo_tipo text DEFAULT '',
  descricao text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.cidade_midias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cidade_midias"
  ON public.cidade_midias FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cidade_midias"
  ON public.cidade_midias FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cidade_midias"
  ON public.cidade_midias FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
