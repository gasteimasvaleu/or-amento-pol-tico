CREATE TABLE public.lembretes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  titulo text NOT NULL,
  descricao text,
  data_lembrete timestamp with time zone NOT NULL,
  hora_lembrete time,
  prioridade text NOT NULL DEFAULT 'media',
  categoria text NOT NULL DEFAULT 'geral',
  concluido boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.lembretes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lembretes" ON public.lembretes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own lembretes" ON public.lembretes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own lembretes" ON public.lembretes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own lembretes" ON public.lembretes FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_lembretes_updated_at BEFORE UPDATE ON public.lembretes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();