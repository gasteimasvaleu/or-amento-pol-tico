CREATE TABLE public.convites_institucionais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  orgao text NOT NULL,
  duracao_dias integer NOT NULL DEFAULT 365,
  usado boolean NOT NULL DEFAULT false,
  usado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  usado_em timestamptz
);

ALTER TABLE public.convites_institucionais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read convites by token"
  ON public.convites_institucionais FOR SELECT
  TO anon, authenticated
  USING (true);