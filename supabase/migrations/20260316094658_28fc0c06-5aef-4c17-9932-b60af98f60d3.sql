
-- Tabela midias
CREATE TABLE public.midias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  titulo text NOT NULL,
  descricao text,
  categoria text NOT NULL DEFAULT 'foto',
  tags text[],
  arquivo_url text NOT NULL,
  arquivo_nome text NOT NULL,
  arquivo_tipo text,
  arquivo_tamanho bigint,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.midias ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own midias" ON public.midias FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own midias" ON public.midias FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own midias" ON public.midias FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own midias" ON public.midias FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Trigger updated_at
CREATE TRIGGER update_midias_updated_at
  BEFORE UPDATE ON public.midias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('midias', 'midias', true);

-- Storage RLS
CREATE POLICY "Users can upload midias" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'midias' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own midias files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'midias' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own midias files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'midias' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Public can view midias" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'midias');
