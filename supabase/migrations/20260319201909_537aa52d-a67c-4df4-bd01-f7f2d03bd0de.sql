-- Assign all NULL user_id records to Caio
UPDATE despesas_politicas SET user_id = '5b37e6e6-01d5-4ead-bd96-5b81d13e2324' WHERE user_id IS NULL;

-- Make user_id NOT NULL with default
ALTER TABLE despesas_politicas ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE despesas_politicas ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Drop old open policies
DROP POLICY IF EXISTS "Authenticated users can view despesas" ON despesas_politicas;
DROP POLICY IF EXISTS "Authenticated users can insert despesas" ON despesas_politicas;
DROP POLICY IF EXISTS "Authenticated users can update despesas" ON despesas_politicas;
DROP POLICY IF EXISTS "Authenticated users can delete despesas" ON despesas_politicas;

-- Create proper user-scoped policies
CREATE POLICY "Users can view own despesas" ON despesas_politicas FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own despesas" ON despesas_politicas FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own despesas" ON despesas_politicas FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own despesas" ON despesas_politicas FOR DELETE TO authenticated USING (auth.uid() = user_id);