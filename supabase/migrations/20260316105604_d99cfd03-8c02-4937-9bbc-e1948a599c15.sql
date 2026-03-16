
-- Tabela de sites cadastrados
CREATE TABLE public.sites_noticias (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  nome text NOT NULL,
  url text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.sites_noticias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sites" ON public.sites_noticias FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sites" ON public.sites_noticias FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sites" ON public.sites_noticias FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sites" ON public.sites_noticias FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Allow service role full access for edge function
CREATE POLICY "Service role full access sites" ON public.sites_noticias FOR SELECT TO service_role USING (true);

-- Tabela de notícias com resumos
CREATE TABLE public.noticias_resumos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  site_id uuid NOT NULL REFERENCES public.sites_noticias(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  url text NOT NULL,
  resumo text NOT NULL,
  data_extracao timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.noticias_resumos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own noticias" ON public.noticias_resumos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own noticias" ON public.noticias_resumos FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service role full access noticias" ON public.noticias_resumos FOR ALL TO service_role USING (true);

-- Trigger updated_at for sites_noticias
CREATE TRIGGER update_sites_noticias_updated_at
  BEFORE UPDATE ON public.sites_noticias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
