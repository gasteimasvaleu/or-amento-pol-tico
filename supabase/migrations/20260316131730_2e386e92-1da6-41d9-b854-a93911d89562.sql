
CREATE TABLE public.dados_eleitorais_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ano_eleicao integer NOT NULL,
  sigla_uf text NOT NULL,
  cargo text NOT NULL,
  nome_candidato text NOT NULL,
  nome_urna text,
  sigla_partido text,
  numero_candidato text,
  situacao_eleito text,
  qtd_votos integer NOT NULL DEFAULT 0,
  nome_municipio text,
  turno integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.dados_eleitorais_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read electoral data"
  ON public.dados_eleitorais_cache
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can insert electoral data"
  ON public.dados_eleitorais_cache
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can delete electoral data"
  ON public.dados_eleitorais_cache
  FOR DELETE
  TO service_role
  USING (true);

CREATE INDEX idx_dados_eleitorais_filters
  ON public.dados_eleitorais_cache (ano_eleicao, sigla_uf, cargo);
