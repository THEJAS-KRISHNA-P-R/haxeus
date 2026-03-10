-- Run this in your Supabase SQL Editor
-- Razorpay integration setup for HAXEUS

-- Add Razorpay fields to orders table
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS razorpay_order_id   TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id  TEXT,
  ADD COLUMN IF NOT EXISTS payment_verified_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_method       TEXT DEFAULT 'razorpay';

CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);

-- RPC: increment coupon usage atomically
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
  UPDATE public.coupons
  SET usage_count = usage_count + 1
  WHERE id = coupon_id;
END;
$$;

-- RPC: decrement inventory atomically (fails if stock would go negative)
CREATE OR REPLACE FUNCTION public.decrement_inventory(p_product_id UUID, p_quantity INT)
RETURNS VOID
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
    RAISE EXCEPTION 'Insufficient stock for product %: has %, needs %', p_product_id, current_qty, p_quantity;
  END IF;

  UPDATE public.product_inventory
  SET quantity = quantity - p_quantity
  WHERE product_id = p_product_id;
END;
$$;

-- RLS: Service role already bypasses RLS for webhook routes — no change needed.

-- RLS: users can only read their own orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
CREATE POLICY "Users can insert own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);
