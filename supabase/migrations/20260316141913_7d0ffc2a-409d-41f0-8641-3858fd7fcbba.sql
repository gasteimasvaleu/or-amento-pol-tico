CREATE POLICY "Authenticated users can insert electoral data"
ON public.dados_eleitorais_cache
FOR INSERT
TO authenticated
WITH CHECK (true);