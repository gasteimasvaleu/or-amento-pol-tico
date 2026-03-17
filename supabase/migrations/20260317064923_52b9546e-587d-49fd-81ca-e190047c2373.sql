
CREATE TABLE public.geracoes_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  tipo text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.geracoes_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own geracoes" ON public.geracoes_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own geracoes" ON public.geracoes_log
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_geracoes_log_user_tipo ON public.geracoes_log(user_id, tipo, created_at);
