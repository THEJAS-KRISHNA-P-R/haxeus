-- ==============================================================================
-- SECTION 1 - DATABASE MIGRATION
-- Run in Supabase SQL Editor in exact order.
-- ==============================================================================

-- 1.1 - Add preorder columns to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_preorder        BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS preorder_status    TEXT
    CHECK (preorder_status IN ('active', 'sold_out', 'stopped'))
    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS expected_date      TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS max_preorders      INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS preorder_count     INTEGER NOT NULL DEFAULT 0;

-- 1.2 - Migrate existing preorder_items into products
INSERT INTO public.products (
  name,
  description,
  price,
  front_image,
  is_preorder,
  preorder_status,
  expected_date,
  max_preorders,
  preorder_count
)
SELECT
  name,
  description,
  price,
  front_image,
  TRUE,
  status,
  expected_date,
  max_preorders,
  preorder_count
FROM public.preorder_items
WHERE status != 'converted'
ON CONFLICT DO NOTHING;

-- 1.3/1.4 - Update preorder_registrations to reference products
ALTER TABLE public.preorder_registrations
  ADD COLUMN IF NOT EXISTS product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE;

-- Note: You may need to manually map existing preorder_registrations to their new product_ids
-- if there are any existing registrations before running the following line:
-- ALTER TABLE public.preorder_registrations DROP COLUMN IF EXISTS preorder_item_id;

-- 1.5 - Update the atomic counter RPC
CREATE OR REPLACE FUNCTION public.increment_preorder_count(p_product_id INTEGER)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.products
  SET preorder_count = preorder_count + 1
  WHERE id = p_product_id
    AND is_preorder = TRUE
    AND preorder_status = 'active'
    AND (max_preorders IS NULL OR preorder_count < max_preorders);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Preorder not available or limit reached';
  END IF;
END;
$$;

-- 1.6 - Drop old tables (ONLY RUN AFTER CONFIRMING DATA MIGRATION IS SUCCESSFUL)
-- DROP TABLE IF EXISTS public.preorder_registrations CASCADE;
-- DROP TABLE IF EXISTS public.preorder_items CASCADE;

-- 1.7 - Update indexes
CREATE INDEX IF NOT EXISTS idx_products_is_preorder
  ON public.products(is_preorder)
  WHERE is_preorder = TRUE;

CREATE INDEX IF NOT EXISTS idx_products_preorder_status
  ON public.products(preorder_status)
  WHERE is_preorder = TRUE;

CREATE INDEX IF NOT EXISTS idx_preorder_reg_product
  ON public.preorder_registrations(product_id);
