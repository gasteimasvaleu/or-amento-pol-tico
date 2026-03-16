CREATE TABLE public.assessores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nome text NOT NULL,
  cargo text NOT NULL DEFAULT '',
  telefone text DEFAULT '',
  email text DEFAULT '',
  avatar_url text DEFAULT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.assessores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assessores" ON public.assessores FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assessores" ON public.assessores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assessores" ON public.assessores FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own assessores" ON public.assessores FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_assessores_updated_at BEFORE UPDATE ON public.assessores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();