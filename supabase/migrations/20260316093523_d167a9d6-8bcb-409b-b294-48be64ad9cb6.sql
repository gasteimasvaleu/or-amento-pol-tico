
CREATE TABLE public.compromissos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  titulo text NOT NULL,
  descricao text,
  data_inicio timestamptz NOT NULL,
  data_fim timestamptz,
  local text,
  tipo text NOT NULL DEFAULT 'reuniao',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.compromissos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own compromissos" ON public.compromissos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own compromissos" ON public.compromissos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own compromissos" ON public.compromissos FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own compromissos" ON public.compromissos FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_compromissos_updated_at BEFORE UPDATE ON public.compromissos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
