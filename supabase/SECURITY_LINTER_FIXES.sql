-- ============================================================
-- HAXEUS — Supabase Security Linter Fixes
-- Generated: 2026-03-11
-- ============================================================
-- Run this ENTIRE file in the Supabase SQL Editor.
--
-- Issues fixed:
--   [ERROR] security_definer_view       — low_stock_products, products_with_ratings, top_selling_products
--   [ERROR] rls_disabled_in_public      — public.search_queries
--   [WARN]  function_search_path_mutable — 17 functions
--   [WARN]  extension_in_public         — pg_trgm
--   [WARN]  rls_policy_always_true      — service-only INSERT/ALL policies on 5 tables
--   [INFO]  rls_enabled_no_policy       — analytics_events, email_campaigns
--
-- Items requiring Supabase Dashboard action (cannot be fixed via SQL):
--   • auth_otp_long_expiry            → Auth → Providers → Email → OTP expiry: set < 3600s
--   • auth_leaked_password_protection → Auth → Sign In / Security → Enable "Leaked password protection"
--   • vulnerable_postgres_version     → Dashboard → Project Settings → Infrastructure → Upgrade
--
-- NOTE: The following always-true INSERT policies are INTENTIONAL (public-facing operations)
-- and are deliberately left unchanged:
--   • contact_messages.contact_insert_any          (public contact form)
--   • newsletter_subscribers.newsletter_insert_any  (public newsletter signup)
--   • product_views.product_views_insert_any        (anonymous view tracking)
-- ============================================================


-- ============================================================
-- FIX 1: Security Definer Views → Security Invoker
-- ============================================================
-- These views were executing with the VIEW CREATOR's permissions,
-- which bypasses RLS for the querying user. Switching to
-- security_invoker=on makes them run with the CALLER's permissions,
-- so RLS on the underlying tables is correctly enforced.

ALTER VIEW public.low_stock_products    SET (security_invoker = on);
ALTER VIEW public.products_with_ratings SET (security_invoker = on);
ALTER VIEW public.top_selling_products  SET (security_invoker = on);


-- ============================================================
-- FIX 2: Enable RLS on public.search_queries
-- ============================================================
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "search_queries_insert_any" ON public.search_queries;
DROP POLICY IF EXISTS "search_queries_admin_read"  ON public.search_queries;

-- Anyone (anon/authenticated) can record a search query for analytics
CREATE POLICY "search_queries_insert_any"
  ON public.search_queries FOR INSERT
  WITH CHECK (true);

-- Only admins can read raw search analytics
CREATE POLICY "search_queries_admin_read"
  ON public.search_queries FOR SELECT
  USING (public.is_admin());


-- ============================================================
-- FIX 3: Add policies to analytics_events
-- ============================================================
-- RLS was enabled but zero policies existed → table was completely
-- inaccessible to all roles (including the app).

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
-- FIX 4: Add policies to email_campaigns
-- ============================================================
-- RLS was enabled but zero policies existed → table was completely
-- inaccessible. This is an admin-only table.

ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_campaigns_admin_manage" ON public.email_campaigns;

CREATE POLICY "email_campaigns_admin_manage"
  ON public.email_campaigns FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================
-- FIX 5: Remove always-true INSERT/ALL policies on service-only tables
-- ============================================================
-- The Supabase service role has BYPASSRLS and does NOT need these policies.
-- Having WITH CHECK (true) means any authenticated or anonymous client
-- could INSERT directly into these tables, bypassing all application logic.
-- After dropping these policies, service role still works; direct client
-- inserts are blocked by default-deny RLS.

-- audit_log — only service role should ever write
DROP POLICY IF EXISTS "audit_service_insert"         ON public.audit_log;
DROP POLICY IF EXISTS "No direct write to audit_log" ON public.audit_log;
DROP POLICY IF EXISTS "audit_no_direct_write"        ON public.audit_log;
CREATE POLICY "audit_no_direct_write"
  ON public.audit_log FOR INSERT
  WITH CHECK (false);

-- coupon_usage — written only by service role via RPC
DROP POLICY IF EXISTS "coupon_usage_service_insert"  ON public.coupon_usage;

-- email_queue — managed only by service role / cron jobs
DROP POLICY IF EXISTS "email_queue_service_manage"   ON public.email_queue;
DROP POLICY IF EXISTS "System can insert emails"     ON public.email_queue;
-- Restore admin update capability (it was bundled in the ALL policy we just dropped)
DROP POLICY IF EXISTS "email_queue_admin_update"     ON public.email_queue;
CREATE POLICY "email_queue_admin_update"
  ON public.email_queue FOR UPDATE
  USING (public.is_admin());

-- order_items — inserted by server-side API using service role
DROP POLICY IF EXISTS "order_items_service_insert"      ON public.order_items;
DROP POLICY IF EXISTS "No direct insert to order_items" ON public.order_items;
DROP POLICY IF EXISTS "order_items_no_direct_insert"    ON public.order_items;
CREATE POLICY "order_items_no_direct_insert"
  ON public.order_items FOR INSERT
  WITH CHECK (false);

-- orders — inserted by server-side API using service role
DROP POLICY IF EXISTS "orders_service_insert" ON public.orders;


-- ============================================================
-- FIX 6: Move pg_trgm from public schema to extensions schema
-- ============================================================
-- Extensions in the public schema expose all their functions and
-- operators to PostgREST users unnecessarily. The extensions schema
-- is the correct home for Postgres extensions in Supabase.

-- Drop the dependent GIN index first
DROP INDEX IF EXISTS public.idx_search_queries_query;

-- Move the extension (CASCADE also drops any remaining dependent objects)
DROP EXTENSION IF EXISTS pg_trgm CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;

-- Recreate the trigram search index
-- gin_trgm_ops is resolved via search_path (extensions is included by Supabase)
CREATE INDEX IF NOT EXISTS idx_search_queries_query
  ON public.search_queries USING gin(query gin_trgm_ops);


-- ============================================================
-- FIX 7: Fix mutable search_path on all affected functions
-- ============================================================
-- Functions without a fixed search_path are vulnerable to search_path
-- injection: a malicious schema earlier in the path could shadow
-- pg_catalog builtins or public objects, redirecting calls.
-- SET search_path = public, pg_catalog locks name resolution.


-- 7a. is_admin() — no-arg version (used directly in RLS policies)
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

-- 7b. is_admin(user_uuid UUID) — arg version (for programmatic admin checks)
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_catalog
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = user_uuid AND role = 'admin'
  );
END;
$$;

-- 7c. update_product_rating() — trigger on product_reviews
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.products
  SET updated_at = NOW()
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NEW;
END;
$$;

-- 7d. decrement_inventory() — trigger function (fires on order_items INSERT)
CREATE OR REPLACE FUNCTION public.decrement_inventory()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.product_inventory
  SET
    stock_quantity = stock_quantity - NEW.quantity,
    sold_quantity  = sold_quantity  + NEW.quantity,
    updated_at     = NOW()
  WHERE product_id = NEW.product_id AND size = NEW.size;
  RETURN NEW;
END;
$$;

-- 7e. decrement_inventory(UUID, INT) — TOCTOU-safe RPC version
CREATE OR REPLACE FUNCTION public.decrement_inventory(p_product_id UUID, p_quantity INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  current_qty INT;
BEGIN
  SELECT quantity INTO current_qty
  FROM public.product_inventory
  WHERE product_id = p_product_id
  FOR UPDATE;

  IF current_qty IS NULL THEN
    RAISE EXCEPTION 'Product inventory record not found for %', p_product_id;
  END IF;

  IF current_qty < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock for product %: has %, needs %',
      p_product_id, current_qty, p_quantity;
  END IF;

  UPDATE public.product_inventory
  SET quantity = quantity - p_quantity
  WHERE product_id = p_product_id;
END;
$$;

-- 7f. award_loyalty_points() — trigger on orders (fires on status → 'delivered')
CREATE OR REPLACE FUNCTION public.award_loyalty_points()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_catalog
AS $$
DECLARE
  points_to_award INTEGER;
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    points_to_award := FLOOR(NEW.total_amount / 10);

    INSERT INTO public.loyalty_points (user_id, total_points, lifetime_points)
    VALUES (NEW.user_id, points_to_award, points_to_award)
    ON CONFLICT (user_id) DO UPDATE SET
      total_points    = public.loyalty_points.total_points    + points_to_award,
      lifetime_points = public.loyalty_points.lifetime_points + points_to_award,
      updated_at      = NOW();

    INSERT INTO public.loyalty_transactions
      (user_id, points, transaction_type, order_id, description)
    VALUES
      (NEW.user_id, points_to_award, 'earned', NEW.id, 'Order completed');

    UPDATE public.orders
    SET loyalty_points_earned = points_to_award
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- 7g. queue_welcome_email() — trigger on auth.users (fires on new signup)
CREATE OR REPLACE FUNCTION public.queue_welcome_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  user_email TEXT;
  user_name  TEXT;
BEGIN
  user_email := NEW.email;
  user_name  := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(user_email, '@', 1)
  );

  BEGIN
    INSERT INTO public.email_queue
      (email_type, recipient_email, recipient_name, subject, template_data, status)
    VALUES
      ('welcome', user_email, user_name, 'Welcome to HAXEUS!',
       jsonb_build_object('name', user_name, 'email', user_email), 'pending');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to queue welcome email for %: %', user_email, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- 7h. handle_new_user() — alternative auth trigger (creates profile row)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 7i. increment_coupon_usage(text) — increment by coupon code
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(p_coupon_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = COALESCE(used_count, 0) + 1
  WHERE code = p_coupon_code;
END;
$$;

-- 7j. increment_coupon_usage(uuid) — increment by coupon id
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(p_coupon_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = COALESCE(used_count, 0) + 1
  WHERE id = p_coupon_id;
END;
$$;

-- 7k. apply_coupon_atomic — FOR UPDATE locked coupon validation + increment
CREATE OR REPLACE FUNCTION public.apply_coupon_atomic(
  p_coupon_id UUID,
  p_user_id   UUID,
  p_order_id  UUID
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_count INT;
  v_limit INT;
BEGIN
  SELECT usage_count, usage_limit
  INTO v_count, v_limit
  FROM public.coupons
  WHERE id = p_coupon_id
  FOR UPDATE;

  IF v_limit IS NOT NULL AND v_count >= v_limit THEN
    RETURN FALSE;
  END IF;

  UPDATE public.coupons
  SET usage_count = usage_count + 1
  WHERE id = p_coupon_id;

  RETURN TRUE;
END;
$$;

-- 7l. reserve_product_stock
CREATE OR REPLACE FUNCTION public.reserve_product_stock(
  p_product_id bigint,
  p_size       text,
  p_quantity   integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.product_inventory
  SET
    reserved_quantity = reserved_quantity + p_quantity,
    updated_at        = now()
  WHERE product_id = p_product_id
    AND size = p_size
    AND stock_quantity - reserved_quantity >= p_quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product % size %', p_product_id, p_size;
  END IF;
END;
$$;

-- 7m. release_product_stock
CREATE OR REPLACE FUNCTION public.release_product_stock(
  p_product_id bigint,
  p_size       text,
  p_quantity   integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.product_inventory
  SET
    reserved_quantity = GREATEST(reserved_quantity - p_quantity, 0),
    updated_at        = now()
  WHERE product_id = p_product_id AND size = p_size;
END;
$$;

-- 7n. decrement_inventory_rpc
CREATE OR REPLACE FUNCTION public.decrement_inventory_rpc(
  p_product_id bigint,
  p_size       text,
  p_quantity   integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.product_inventory
  SET
    stock_quantity = GREATEST(stock_quantity - p_quantity, 0),
    sold_quantity  = sold_quantity + p_quantity,
    updated_at     = now()
  WHERE product_id = p_product_id AND size = p_size;
END;
$$;

-- 7o. increment_inventory
CREATE OR REPLACE FUNCTION public.increment_inventory(
  p_product_id bigint,
  p_size       text,
  p_quantity   integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.product_inventory
  SET
    stock_quantity = stock_quantity + p_quantity,
    sold_quantity  = GREATEST(sold_quantity - p_quantity, 0),
    updated_at     = now()
  WHERE product_id = p_product_id AND size = p_size;
END;
$$;

-- 7p. update_review_helpful_count
CREATE OR REPLACE FUNCTION public.update_review_helpful_count(
  p_review_id  uuid,
  p_is_helpful boolean,
  p_delta      integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  IF p_is_helpful THEN
    UPDATE public.product_reviews
    SET helpful_count = helpful_count + p_delta
    WHERE id = p_review_id;
  ELSE
    UPDATE public.product_reviews
    SET not_helpful_count = not_helpful_count + p_delta
    WHERE id = p_review_id;
  END IF;
END;
$$;

-- 7q. increment_abandoned_cart_emails
CREATE OR REPLACE FUNCTION public.increment_abandoned_cart_emails(cart_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.abandoned_carts
  SET
    email_sent_count   = email_sent_count + 1,
    last_email_sent_at = now()
  WHERE id = cart_id;
END;
$$;

-- 7r. expire_pending_orders
CREATE OR REPLACE FUNCTION public.expire_pending_orders()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  affected INT;
BEGIN
  WITH expired AS (
    UPDATE public.orders
    SET status = 'expired'
    WHERE status = 'pending'
      AND created_at < NOW() - INTERVAL '30 minutes'
    RETURNING id
  )
  SELECT COUNT(*) INTO affected FROM expired;
  RETURN affected;
END;
$$;


-- ============================================================
-- DONE
-- ============================================================
SELECT 'SECURITY_LINTER_FIXES.sql applied successfully.' AS result;
