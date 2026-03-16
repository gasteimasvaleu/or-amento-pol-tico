CREATE POLICY "Authenticated users can delete electoral data"
ON public.dados_eleitorais_cache
FOR DELETE
TO authenticated
USING (true);