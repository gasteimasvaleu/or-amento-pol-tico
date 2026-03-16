
CREATE TABLE public.apoiadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome text NOT NULL,
  telefone text DEFAULT '',
  email text DEFAULT '',
  cidade text DEFAULT '',
  bairro text DEFAULT '',
  partido text DEFAULT '',
  cargo_pretendido text DEFAULT '',
  lideranca_comunitaria boolean DEFAULT false,
  instagram text DEFAULT '',
  facebook text DEFAULT '',
  whatsapp text DEFAULT '',
  avatar_url text,
  observacoes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.apoiadores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own apoiadores" ON public.apoiadores FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own apoiadores" ON public.apoiadores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own apoiadores" ON public.apoiadores FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own apoiadores" ON public.apoiadores FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_apoiadores_updated_at BEFORE UPDATE ON public.apoiadores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
