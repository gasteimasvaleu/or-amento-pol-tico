
-- Create enum for demanda status
CREATE TYPE public.demanda_status AS ENUM ('novo', 'em_andamento', 'resolvido');

-- Table: eleitores
CREATE TABLE public.eleitores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT DEFAULT '',
  endereco TEXT DEFAULT '',
  bairro TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.eleitores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own eleitores" ON public.eleitores FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own eleitores" ON public.eleitores FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own eleitores" ON public.eleitores FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own eleitores" ON public.eleitores FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_eleitores_updated_at BEFORE UPDATE ON public.eleitores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Table: demandas
CREATE TABLE public.demandas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  eleitor_id UUID NOT NULL REFERENCES public.eleitores(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  responsavel TEXT DEFAULT '',
  status demanda_status NOT NULL DEFAULT 'novo',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.demandas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own demandas" ON public.demandas FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own demandas" ON public.demandas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own demandas" ON public.demandas FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own demandas" ON public.demandas FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_demandas_updated_at BEFORE UPDATE ON public.demandas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Table: demanda_historico
CREATE TABLE public.demanda_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  demanda_id UUID NOT NULL REFERENCES public.demandas(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.demanda_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view demanda_historico" ON public.demanda_historico FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.demandas WHERE demandas.id = demanda_historico.demanda_id AND demandas.user_id = auth.uid()));
CREATE POLICY "Users can insert demanda_historico" ON public.demanda_historico FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.demandas WHERE demandas.id = demanda_historico.demanda_id AND demandas.user_id = auth.uid()));
CREATE POLICY "Users can delete demanda_historico" ON public.demanda_historico FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.demandas WHERE demandas.id = demanda_historico.demanda_id AND demandas.user_id = auth.uid()));

-- Table: demanda_anexos
CREATE TABLE public.demanda_anexos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  demanda_id UUID NOT NULL REFERENCES public.demandas(id) ON DELETE CASCADE,
  arquivo_url TEXT NOT NULL,
  arquivo_nome TEXT NOT NULL,
  arquivo_tipo TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.demanda_anexos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view demanda_anexos" ON public.demanda_anexos FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.demandas WHERE demandas.id = demanda_anexos.demanda_id AND demandas.user_id = auth.uid()));
CREATE POLICY "Users can insert demanda_anexos" ON public.demanda_anexos FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.demandas WHERE demandas.id = demanda_anexos.demanda_id AND demandas.user_id = auth.uid()));
CREATE POLICY "Users can delete demanda_anexos" ON public.demanda_anexos FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.demandas WHERE demandas.id = demanda_anexos.demanda_id AND demandas.user_id = auth.uid()));

-- Storage bucket for demandas attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('demandas', 'demandas', true);

CREATE POLICY "Authenticated users can upload demandas files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'demandas');
CREATE POLICY "Anyone can view demandas files" ON storage.objects FOR SELECT TO public USING (bucket_id = 'demandas');
CREATE POLICY "Authenticated users can delete demandas files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'demandas');
