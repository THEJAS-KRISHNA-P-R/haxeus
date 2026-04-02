-- ============================================================================
-- Add Flat Shipping Columns to Orders Table
-- This migration guarantees all shipping details are available as flat columns
-- ============================================================================

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_name text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_email text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_phone text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address_1 text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address_2 text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_city text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_state text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_pincode text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_country text DEFAULT 'India';

-- Manually trigger postgREST schema cache reload just in case 
NOTIFY pgrst, 'reload schema';
