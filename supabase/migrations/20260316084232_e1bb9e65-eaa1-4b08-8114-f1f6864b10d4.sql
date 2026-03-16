
-- 1. Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Create user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 3. Add user_id to despesas_politicas (nullable for existing data)
ALTER TABLE public.despesas_politicas
  ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. Update RLS on despesas_politicas to require auth
DROP POLICY IF EXISTS "Anyone can view despesas" ON public.despesas_politicas;
DROP POLICY IF EXISTS "Anyone can insert despesas" ON public.despesas_politicas;
DROP POLICY IF EXISTS "Anyone can update despesas" ON public.despesas_politicas;
DROP POLICY IF EXISTS "Anyone can delete despesas" ON public.despesas_politicas;

CREATE POLICY "Authenticated users can view despesas" ON public.despesas_politicas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert despesas" ON public.despesas_politicas
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update despesas" ON public.despesas_politicas
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete despesas" ON public.despesas_politicas
  FOR DELETE TO authenticated USING (true);

-- 5. Add updated_at trigger to profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
