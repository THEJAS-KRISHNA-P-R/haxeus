-- ============================================================================
-- HAXEUS — Full Database Rebuild Migration
-- Generated: 2026-03-08
-- ============================================================================
-- This migration applies all fixes identified in the master audit:
--   1. user_roles RLS: removed self-referencing admin policies
--   2. orders: removed conflicting orders_service_update policy
--   3. products: added slug (UNIQUE) and is_active (DEFAULT true) columns
--   4. products read policy: updated to filter by is_active for public users
--   5. product_inventory: removed blanket USING(true) service policy
--   6. store_settings: seeded default rows
-- ============================================================================

-- ─── 1. Fix user_roles RLS ──────────────────────────────────────────────────
-- Remove self-referencing policies (admin reads must use service role client)
DROP POLICY IF EXISTS "user_roles_admin_read" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_admin_manage" ON public.user_roles;
-- Only keep: user_roles_read_own (auth.uid() = user_id)

-- ─── 2. Fix orders duplicate UPDATE policy ──────────────────────────────────
-- Service role bypasses RLS naturally — no blanket policy needed
DROP POLICY IF EXISTS "orders_service_update" ON public.orders;

-- ─── 3. Add slug and is_active to products ──────────────────────────────────
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);

-- ─── 4. Update products read policy ─────────────────────────────────────────
DROP POLICY IF EXISTS "products_read_all" ON public.products;
CREATE POLICY "products_read_all" ON public.products FOR SELECT USING (
  is_active = true OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- ─── 5. Remove blanket inventory service policy ─────────────────────────────
DROP POLICY IF EXISTS "inventory_service_role" ON public.product_inventory;

-- ─── 6. Seed store_settings defaults ────────────────────────────────────────
INSERT INTO public.store_settings (key, value) VALUES
  ('store_name', '"HAXEUS"'),
  ('store_email', '"support@haxeus.in"'),
  ('currency', '"INR"'),
  ('shipping_rate', '150'),
  ('free_shipping_above', '2000'),
  ('cod_enabled', 'false'),
  ('support_email', '"support@haxeus.in"'),
  ('support_url', '"mailto:support@haxeus.in"')
ON CONFLICT (key) DO NOTHING;

-- ─── 7. Admin user role ─────────────────────────────────────────────────────
-- IMPORTANT: Replace with your actual admin user UUID from Supabase Auth > Users
-- Uncomment and fill in the UUID after running this migration:
-- INSERT INTO public.user_roles (user_id, role) VALUES ('YOUR-ADMIN-UUID-HERE', 'admin');
