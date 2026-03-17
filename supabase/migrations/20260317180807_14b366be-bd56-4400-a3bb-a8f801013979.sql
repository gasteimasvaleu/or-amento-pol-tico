
CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  status text NOT NULL DEFAULT 'expired',
  product_id text,
  expires_at timestamptz,
  original_transaction_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON public.subscribers FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access"
  ON public.subscribers FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
