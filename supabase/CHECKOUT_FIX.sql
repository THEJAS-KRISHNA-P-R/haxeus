
-- FIX — ORDERS TABLE COLUMNS
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- FIX — RLS POLICIES
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
CREATE POLICY "Users can create own orders" ON orders 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items" ON order_items 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- FIX — INVENTORY DECREMENT (Strict Version)
CREATE OR REPLACE FUNCTION decrement_inventory()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE product_inventory
  SET stock_quantity = stock_quantity - NEW.quantity,
      sold_quantity = sold_quantity + NEW.quantity,
      updated_at = NOW()
  WHERE product_id = NEW.product_id 
    AND size = NEW.size
    AND stock_quantity >= NEW.quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock: product_id=%, size=%, requested=%', 
      NEW.product_id, NEW.size, NEW.quantity;
  END IF;

  RETURN NEW;
END;
$$;
