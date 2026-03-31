-- ============================================================
-- HAXEUS — RLS Security Hardening
-- ============================================================
-- Apply AFTER COMPLETE_DATABASE_SETUP.sql and all other migrations.
-- Purpose: enforce least-privilege access — no table should be
--          readable by the anonymous role unless it is a public
--          catalogue (products, product_images, product_inventory,
--          product_reviews, product_relations).
--
-- Rule summary:
--   products / product_images / product_inventory / product_relations
--       → anon SELECT allowed (public catalog)
--   product_reviews   → anon SELECT only approved reviews
--   newsletter_subscribers → anon INSERT only (subscribe)
--   search_queries / analytics_events / product_views
--       → anon INSERT only (anonymous tracking)
--   ALL other tables  → authenticated, own rows only
--   Admin-only tables → require public.is_admin()
-- ============================================================

BEGIN;

-- ============================================================
-- 0. Helper: no-arg is_admin() (used in all RLS policies)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- 1. user_roles
-- ============================================================
-- PROBLEM: FIX_ALL_RLS.sql created "Anyone can check admin status"
-- with USING (true), allowing anon to enumerate all roles.
-- FIX: Only the owning user can read their own role.
--      The is_admin() function is SECURITY DEFINER so it can
--      bypass RLS internally to check roles.
-- ============================================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can check admin status"       ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role"       ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own role"             ON public.user_roles;
DROP POLICY IF EXISTS "Service role can manage roles"       ON public.user_roles;

-- Owning user may read their own role
DROP POLICY IF EXISTS "user_roles_read_own"   ON public.user_roles;
CREATE POLICY "user_roles_read_own"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Admins may read all roles (for admin dashboard)
DROP POLICY IF EXISTS "user_roles_admin_read" ON public.user_roles;
CREATE POLICY "user_roles_admin_read"
  ON public.user_roles FOR SELECT
  USING (public.is_admin());

-- Only service role writes (BYPASSRLS) — no client INSERT/UPDATE/DELETE

-- ============================================================
-- 2. profiles  (if the table exists)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    -- Drop any overly-permissive read policies
    DROP POLICY IF EXISTS "profiles_read_all"          ON public.profiles;
    DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_read_own"           ON public.profiles;
    DROP POLICY IF EXISTS "profiles_admin_read"         ON public.profiles;

    -- Users can only read their own profile
    EXECUTE $q$
      CREATE POLICY "profiles_read_own"
        ON public.profiles FOR SELECT
        USING (auth.uid() = id);
    $q$;

    -- Admins can read all profiles
    EXECUTE $q$
      CREATE POLICY "profiles_admin_read"
        ON public.profiles FOR SELECT
        USING (public.is_admin());
    $q$;
  END IF;
END;
$$;

-- ============================================================
-- 3. orders
-- ============================================================
-- Authenticated users: read/create own; no direct UPDATE/DELETE.
-- Admins: read and update all.
-- Service role (API routes): full access via BYPASSRLS.
-- ============================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders"           ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders"         ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders"            ON public.orders;
DROP POLICY IF EXISTS "Users cannot update orders directly" ON public.orders;
DROP POLICY IF EXISTS "Users cannot delete orders"          ON public.orders;

-- Authenticated owner may SELECT their orders; admins may SELECT all
DROP POLICY IF EXISTS "orders_select"       ON public.orders;
CREATE POLICY "orders_select"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_admin()
  );

-- Authenticated users create (INSERT) via checkout flow
DROP POLICY IF EXISTS "orders_insert_own"   ON public.orders;
CREATE POLICY "orders_insert_own"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only admins (or service role) may UPDATE
DROP POLICY IF EXISTS "orders_update_admin" ON public.orders;
CREATE POLICY "orders_update_admin"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

-- Nobody can DELETE orders directly
DROP POLICY IF EXISTS "orders_no_delete"    ON public.orders;
CREATE POLICY "orders_no_delete"
  ON public.orders FOR DELETE
  USING (false);

-- ============================================================
-- 4. order_items
-- ============================================================
-- Read: owner (via orders join) or admin.
-- All writes: service role only (BYPASSRLS).
-- ============================================================
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own order items"      ON public.order_items;
DROP POLICY IF EXISTS "No direct insert to order_items"     ON public.order_items;
DROP POLICY IF EXISTS "No direct update to order_items"     ON public.order_items;
DROP POLICY IF EXISTS "No direct delete to order_items"     ON public.order_items;
DROP POLICY IF EXISTS "order_items_no_direct_insert"        ON public.order_items;

DROP POLICY IF EXISTS "order_items_select"    ON public.order_items;
CREATE POLICY "order_items_select"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "order_items_no_insert" ON public.order_items;
CREATE POLICY "order_items_no_insert"
  ON public.order_items FOR INSERT
  WITH CHECK (false);

DROP POLICY IF EXISTS "order_items_no_update" ON public.order_items;
CREATE POLICY "order_items_no_update"
  ON public.order_items FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "order_items_no_delete" ON public.order_items;
CREATE POLICY "order_items_no_delete"
  ON public.order_items FOR DELETE
  USING (false);

-- ============================================================
-- 5. coupons
-- ============================================================
-- PROBLEM: "Anyone can view active coupons" lets anon read all
-- active coupon codes (discount amounts, limits, etc.).
-- FIX: Only authenticated users (at checkout) or admins.
-- ============================================================
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active coupons"  ON public.coupons;
DROP POLICY IF EXISTS "Admins can manage coupons"       ON public.coupons;
DROP POLICY IF EXISTS "coupons_admin_read"              ON public.coupons;
DROP POLICY IF EXISTS "coupons_read_active"             ON public.coupons;

-- Only authenticated users can look up active coupons (at checkout)
DROP POLICY IF EXISTS "coupons_authenticated_read" ON public.coupons;
CREATE POLICY "coupons_authenticated_read"
  ON public.coupons FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND is_active = true
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "coupons_admin_manage"       ON public.coupons;
CREATE POLICY "coupons_admin_manage"
  ON public.coupons FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- 6. loyalty_points
-- ============================================================
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own loyalty points" ON public.loyalty_points;

DROP POLICY IF EXISTS "loyalty_points_read_own"   ON public.loyalty_points;
CREATE POLICY "loyalty_points_read_own"
  ON public.loyalty_points FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "loyalty_points_admin_read" ON public.loyalty_points;
CREATE POLICY "loyalty_points_admin_read"
  ON public.loyalty_points FOR SELECT
  USING (public.is_admin());

-- ============================================================
-- 7. loyalty_transactions
-- ============================================================
ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own loyalty transactions" ON public.loyalty_transactions;

DROP POLICY IF EXISTS "loyalty_transactions_read_own"   ON public.loyalty_transactions;
CREATE POLICY "loyalty_transactions_read_own"
  ON public.loyalty_transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "loyalty_transactions_admin_read" ON public.loyalty_transactions;
CREATE POLICY "loyalty_transactions_admin_read"
  ON public.loyalty_transactions FOR SELECT
  USING (public.is_admin());

-- ============================================================
-- 8. user_addresses
-- ============================================================
-- Already correct in COMPLETE_DATABASE_SETUP.sql — confirm here.
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own addresses"   ON public.user_addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON public.user_addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON public.user_addresses;

DROP POLICY IF EXISTS "user_addresses_select" ON public.user_addresses;
CREATE POLICY "user_addresses_select"
  ON public.user_addresses FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_addresses_insert" ON public.user_addresses;
CREATE POLICY "user_addresses_insert"
  ON public.user_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_addresses_update" ON public.user_addresses;
CREATE POLICY "user_addresses_update"
  ON public.user_addresses FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_addresses_delete" ON public.user_addresses;
CREATE POLICY "user_addresses_delete"
  ON public.user_addresses FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 9. store_settings (if exists)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'store_settings') THEN
    ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "settings_read_all"         ON public.store_settings;
    DROP POLICY IF EXISTS "public_read_homepage_config" ON public.store_settings;
    DROP POLICY IF EXISTS "public_read_popup_campaigns" ON public.store_settings;
    DROP POLICY IF EXISTS "public_read_promo_popups"    ON public.store_settings;
    DROP POLICY IF EXISTS "settings_admin_read"         ON public.store_settings;
    DROP POLICY IF EXISTS "settings_admin_manage"       ON public.store_settings;

    EXECUTE $q$
      CREATE POLICY "settings_admin_read"
        ON public.store_settings FOR SELECT
        USING (public.is_admin());
    $q$;

    EXECUTE $q$
      CREATE POLICY "settings_admin_manage"
        ON public.store_settings FOR ALL
        USING (public.is_admin())
        WITH CHECK (public.is_admin());
    $q$;
  END IF;
END;
$$;

-- ============================================================
-- 10. email_templates — admin only
-- ============================================================
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can manage templates"      ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_read_all"        ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_admin_manage"    ON public.email_templates;

DROP POLICY IF EXISTS "email_templates_admin_manage" ON public.email_templates;
CREATE POLICY "email_templates_admin_manage"
  ON public.email_templates FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- 11. email_queue — admin can read/update; service role writes
-- ============================================================
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can view email queue"   ON public.email_queue;
DROP POLICY IF EXISTS "Admin can update email queue" ON public.email_queue;
DROP POLICY IF EXISTS "email_queue_admin_update"     ON public.email_queue;

DROP POLICY IF EXISTS "email_queue_admin_read"   ON public.email_queue;
CREATE POLICY "email_queue_admin_read"
  ON public.email_queue FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "email_queue_admin_update" ON public.email_queue;
CREATE POLICY "email_queue_admin_update"
  ON public.email_queue FOR UPDATE
  USING (public.is_admin());

-- ============================================================
-- 12. email_campaigns — admin only
-- ============================================================
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_campaigns_admin_manage" ON public.email_campaigns;

DROP POLICY IF EXISTS "email_campaigns_admin_manage" ON public.email_campaigns;
CREATE POLICY "email_campaigns_admin_manage"
  ON public.email_campaigns FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- 13. newsletter_subscribers
--   anon INSERT (public subscribe form) ← intentional
--   authenticated users: read/update their own row
--   admins: full access
-- ============================================================
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can subscribe to newsletter"   ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Users can view own subscription"      ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Users can update own subscription"    ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admin can view subscribers"           ON public.newsletter_subscribers;

-- Public subscribe form — anon INSERT is deliberate
DROP POLICY IF EXISTS "newsletter_insert_any" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_insert_any"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Users manage their own subscription record
DROP POLICY IF EXISTS "newsletter_select_own" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_select_own"
  ON public.newsletter_subscribers FOR SELECT
  USING (
    auth.uid() = user_id
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "newsletter_update_own" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_update_own"
  ON public.newsletter_subscribers FOR UPDATE
  USING (
    auth.uid() = user_id
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Admins can read all subscribers
DROP POLICY IF EXISTS "newsletter_admin_read" ON public.newsletter_subscribers;
CREATE POLICY "newsletter_admin_read"
  ON public.newsletter_subscribers FOR SELECT
  USING (public.is_admin());

-- ============================================================
-- 14. abandoned_carts — own + admin
-- ============================================================
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own abandoned carts"   ON public.abandoned_carts;
DROP POLICY IF EXISTS "Admins can view all abandoned carts"  ON public.abandoned_carts;
DROP POLICY IF EXISTS "abandoned_carts_service"              ON public.abandoned_carts;
DROP POLICY IF EXISTS "abandoned_carts_admin_read"           ON public.abandoned_carts;

DROP POLICY IF EXISTS "abandoned_carts_read_own"   ON public.abandoned_carts;
CREATE POLICY "abandoned_carts_read_own"
  ON public.abandoned_carts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "abandoned_carts_admin_read" ON public.abandoned_carts;
CREATE POLICY "abandoned_carts_admin_read"
  ON public.abandoned_carts FOR SELECT
  USING (public.is_admin());

-- ============================================================
-- 15. audit_log — admin read; service role writes
-- ============================================================
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit log"    ON public.audit_log;
DROP POLICY IF EXISTS "No direct write to audit_log" ON public.audit_log;
DROP POLICY IF EXISTS "audit_no_direct_write"        ON public.audit_log;

DROP POLICY IF EXISTS "audit_log_admin_read"      ON public.audit_log;
CREATE POLICY "audit_log_admin_read"
  ON public.audit_log FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "audit_log_no_direct_write" ON public.audit_log;
CREATE POLICY "audit_log_no_direct_write"
  ON public.audit_log FOR INSERT
  WITH CHECK (false);

-- ============================================================
-- 16. coupon_redemptions — own read; service role writes
-- ============================================================
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own redemptions"         ON public.coupon_redemptions;
DROP POLICY IF EXISTS "No direct insert to coupon_redemptions" ON public.coupon_redemptions;

DROP POLICY IF EXISTS "coupon_redemptions_read_own"  ON public.coupon_redemptions;
CREATE POLICY "coupon_redemptions_read_own"
  ON public.coupon_redemptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "coupon_redemptions_no_insert" ON public.coupon_redemptions;
CREATE POLICY "coupon_redemptions_no_insert"
  ON public.coupon_redemptions FOR INSERT
  WITH CHECK (false);

-- ============================================================
-- 17. preorder_registrations (if exists)
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'preorder_registrations') THEN
    ALTER TABLE public.preorder_registrations ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "users_own_registrations"         ON public.preorder_registrations;
    DROP POLICY IF EXISTS "preorder_registrations_own_read" ON public.preorder_registrations;

    EXECUTE $q$
      CREATE POLICY "preorder_registrations_own_read"
        ON public.preorder_registrations FOR SELECT
        USING (auth.uid() = user_id);
    $q$;

    EXECUTE $q$
      CREATE POLICY "preorder_registrations_admin_read"
        ON public.preorder_registrations FOR SELECT
        USING (public.is_admin());
    $q$;
  END IF;
END;
$$;

-- ============================================================
-- 18. search_queries — anon INSERT; admin read
-- ============================================================
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "search_queries_insert_any" ON public.search_queries;
DROP POLICY IF EXISTS "search_queries_admin_read" ON public.search_queries;

CREATE POLICY "search_queries_insert_any"
  ON public.search_queries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "search_queries_admin_read"
  ON public.search_queries FOR SELECT
  USING (public.is_admin());

-- ============================================================
-- 19. analytics_events — anon INSERT; admin read
-- ============================================================
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "analytics_events_insert_any" ON public.analytics_events;
DROP POLICY IF EXISTS "analytics_events_admin_read" ON public.analytics_events;

CREATE POLICY "analytics_events_insert_any"
  ON public.analytics_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "analytics_events_admin_read"
  ON public.analytics_events FOR SELECT
  USING (public.is_admin());

-- ============================================================
-- 20. product_views — anon INSERT; no read (analytics only)
-- ============================================================
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_views_insert_any" ON public.product_views;

DROP POLICY IF EXISTS "product_views_insert_any" ON public.product_views;
CREATE POLICY "product_views_insert_any"
  ON public.product_views FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "product_views_admin_read" ON public.product_views;
CREATE POLICY "product_views_admin_read"
  ON public.product_views FOR SELECT
  USING (public.is_admin());

-- ============================================================
-- VERIFY — quick policy summary
-- ============================================================
SELECT
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'user_roles', 'orders', 'order_items', 'coupons',
    'loyalty_points', 'loyalty_transactions', 'user_addresses',
    'email_queue', 'email_templates', 'email_campaigns',
    'newsletter_subscribers', 'abandoned_carts', 'audit_log',
    'coupon_redemptions', 'search_queries', 'analytics_events',
    'product_views'
  )
ORDER BY tablename, cmd;

SELECT 'SECURITY_HARDENING_RLS.sql applied successfully.' AS result;

COMMIT;
