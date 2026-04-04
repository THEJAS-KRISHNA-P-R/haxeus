-- ============================================================================
-- HAXEUS Bullet-Proof Order Number Generator
-- ============================================================================

-- 0. Ensure the column exists (safety check)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number TEXT;

-- 1. Create a sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001;

-- 2. Function to generate the human-readable ID
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'HX-' || nextval('order_number_seq')::text;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger to apply it before insert
DROP TRIGGER IF EXISTS trg_generate_order_number ON public.orders;
CREATE TRIGGER trg_generate_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_number();
