
CREATE TABLE public.notificacao_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  whatsapp_phone text,
  notif_despesas boolean NOT NULL DEFAULT true,
  notif_lembretes boolean NOT NULL DEFAULT true,
  notif_agenda boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notificacao_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notificacao_config"
  ON public.notificacao_config FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notificacao_config"
  ON public.notificacao_config FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notificacao_config"
  ON public.notificacao_config FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_notificacao_config_updated_at
  BEFORE UPDATE ON public.notificacao_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
