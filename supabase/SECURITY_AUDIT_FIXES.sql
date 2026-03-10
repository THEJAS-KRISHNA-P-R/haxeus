-- ============================================================
-- HAXEUS — Security Audit Fixes SQL Migration
-- Run this ENTIRE file in Supabase SQL Editor
-- Issues addressed: #11.1, #11.2, #20.1, #20.2, #20.4, #8.1
-- ============================================================

-- ============================================================
-- SECTION 1: orders table — deny UPDATE/DELETE for users (#11.1)
-- Users can SELECT and INSERT their own orders (already set).
-- Only the service role (API routes) can UPDATE (confirm, fail).
-- ============================================================

-- Drop and recreate to ensure latest state
DROP POLICY IF EXISTS "Users cannot update orders directly" ON orders;
DROP POLICY IF EXISTS "Users cannot delete orders" ON orders;

CREATE POLICY "Users cannot update orders directly"
  ON orders FOR UPDATE
  USING (false);

CREATE POLICY "Users cannot delete orders"
  ON orders FOR DELETE
  USING (false);


-- ============================================================
-- SECTION 2: order_items — full RLS (#11.2)
-- Users can only read their own items (via join to orders).
-- All mutations are blocked for client — API routes use service role.
-- ============================================================

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "No direct insert to order_items" ON order_items;
DROP POLICY IF EXISTS "No direct update to order_items" ON order_items;
DROP POLICY IF EXISTS "No direct delete to order_items" ON order_items;

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- All mutations blocked — only service role (API routes) can write
CREATE POLICY "No direct insert to order_items"
  ON order_items FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct update to order_items"
  ON order_items FOR UPDATE
  USING (false);

CREATE POLICY "No direct delete to order_items"
  ON order_items FOR DELETE
  USING (false);


-- ============================================================
-- SECTION 3: Atomic coupon application RPC (#20.1)
-- Replaces the two-step (check + later increment) pattern with
-- a single FOR UPDATE locked transaction to prevent race conditions.
-- ============================================================

CREATE OR REPLACE FUNCTION apply_coupon_atomic(
  p_coupon_id   UUID,
  p_user_id     UUID,
  p_order_id    UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  v_count INT;
  v_limit INT;
BEGIN
  -- Obtain row-level lock to prevent concurrent over-redemption
  SELECT usage_count, usage_limit
  INTO v_count, v_limit
  FROM public.coupons
  WHERE id = p_coupon_id
  FOR UPDATE;

  -- Reject if usage limit reached
  IF v_limit IS NOT NULL AND v_count >= v_limit THEN
    RETURN FALSE;
  END IF;

  -- Increment atomically
  UPDATE public.coupons
  SET usage_count = usage_count + 1
  WHERE id = p_coupon_id;

  RETURN TRUE;
END;
$$;


-- ============================================================
-- SECTION 4: Tighten decrement_inventory RPC (#20.2)
-- Adds explicit re-check after FOR UPDATE lock to prevent
-- TOCTOU (time-of-check / time-of-use) overselling.
-- ============================================================

CREATE OR REPLACE FUNCTION decrement_inventory(p_product_id UUID, p_quantity INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
DECLARE
  current_qty INT;
BEGIN
  -- FOR UPDATE acquires row-level lock — prevents concurrent oversell
  SELECT quantity INTO current_qty
  FROM public.product_inventory
  WHERE product_id = p_product_id
  FOR UPDATE;

  IF current_qty IS NULL THEN
    RAISE EXCEPTION 'Product inventory record not found for %', p_product_id;
  END IF;

  -- Re-check after lock (this is the TOCTOU-safe version)
  IF current_qty < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock for product %: has %, needs %',
      p_product_id, current_qty, p_quantity;
  END IF;

  UPDATE public.product_inventory
  SET quantity = quantity - p_quantity
  WHERE product_id = p_product_id;
END;
$$;


-- ============================================================
-- SECTION 5: coupon_redemptions table (#20.4)
-- Enforces one coupon use per user. UNIQUE(coupon_id, user_id)
-- prevents multi-account abuse.
-- ============================================================

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id   UUID        NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id    UUID        REFERENCES orders(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(coupon_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user ON coupon_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon ON coupon_redemptions(coupon_id);

-- RLS: users can see their own redemptions, nobody can insert directly
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own redemptions" ON coupon_redemptions;
DROP POLICY IF EXISTS "No direct insert to coupon_redemptions" ON coupon_redemptions;

CREATE POLICY "Users can view own redemptions"
  ON coupon_redemptions FOR SELECT
  USING (auth.uid() = user_id);

-- All writes go through service role (verify route)
CREATE POLICY "No direct insert to coupon_redemptions"
  ON coupon_redemptions FOR INSERT
  WITH CHECK (false);


-- ============================================================
-- SECTION 6: audit_log table (#8.1)
-- Track all admin mutations for forensics / insider threat detection.
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  action        TEXT        NOT NULL,   -- e.g. 'UPDATE_PRODUCT', 'DELETE_COUPON'
  table_name    TEXT,
  record_id     TEXT,
  old_values    JSONB,
  new_values    JSONB,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_admin ON audit_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);

-- RLS: only admins can read audit log; nobody can write directly (service role only)
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view audit log" ON audit_log;
DROP POLICY IF EXISTS "No direct write to audit_log" ON audit_log;

CREATE POLICY "Admins can view audit log"
  ON audit_log FOR SELECT
  USING (public.is_admin());

CREATE POLICY "No direct write to audit_log"
  ON audit_log FOR INSERT
  WITH CHECK (false);


-- ============================================================
-- SECTION 7: Pending order expiry support (#20.3)
-- This function can be called by a Supabase Edge Function cron
-- (e.g. every 10 minutes) to expire stale pending orders.
-- To set up: Dashboard → Edge Functions → Schedule → every 10 min
-- curl -X POST https://<project>.functions.supabase.co/expire-pending-orders
-- ============================================================

CREATE OR REPLACE FUNCTION expire_pending_orders()
RETURNS INT
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
-- VERIFY
-- ============================================================
SELECT 'Checking new RLS policies...' AS status;
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename IN ('orders', 'order_items', 'coupon_redemptions', 'audit_log')
ORDER BY tablename, cmd;

SELECT 'Security audit SQL migration complete.' AS result;
