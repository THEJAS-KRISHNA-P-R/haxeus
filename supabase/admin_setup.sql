-- 1. Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL CHECK (role IN ('admin', 'customer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. Create store_settings table
CREATE TABLE IF NOT EXISTS public.store_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- 4. CRITICAL FIX — helper function that checks admin WITHOUT triggering RLS
-- SECURITY DEFINER bypasses RLS on user_roles so the policy doesn't call itself
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- 5. Policies for user_roles — use the function, NOT a subquery on the same table
CREATE POLICY "Users can view their own role"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage user_roles"
  ON public.user_roles
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6. Policies for store_settings
CREATE POLICY "Public can view store settings"
  ON public.store_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage store settings"
  ON public.store_settings
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 7. Default settings
INSERT INTO public.store_settings (key, value) VALUES
  ('store_name',          '"HAXEUS"'),
  ('store_email',         '"admin@haxeus.com"'),
  ('currency',            '"INR"'),
  ('shipping_rate',       '99'),
  ('free_shipping_above', '999'),
  ('cod_enabled',         'true'),
  ('maintenance_mode',    'false'),
  ('notification_email',  '"admin@haxeus.com"')
ON CONFLICT (key) DO NOTHING;

-- 8. Grant yourself admin — replace with your actual UUID from auth.users
-- INSERT INTO public.user_roles (user_id, role) VALUES ('YOUR_USER_ID_HERE', 'admin');
