-- HAXEUS UX / conversion improvements
-- Note: the current codebase uses numeric product IDs, so review and drop relations
-- reference products(id) as BIGINT-compatible values instead of UUID.

CREATE TABLE IF NOT EXISTS public.email_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'popup' CHECK (source = 'popup'),
  discount_code text
);

ALTER TABLE public.email_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages email subscribers" ON public.email_subscribers;
CREATE POLICY "Service role manages email subscribers"
ON public.email_subscribers
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS public.drops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  target_date timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  product_ids bigint[] NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_drops_active_target_date
  ON public.drops (is_active, target_date);

ALTER TABLE public.drops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active drops" ON public.drops;
CREATE POLICY "Anyone can read active drops"
ON public.drops
FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS "Admins manage drops" ON public.drops;
CREATE POLICY "Admins manage drops"
ON public.drops
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id bigint NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  verified_purchase boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reviews_one_review_per_user_per_product UNIQUE (product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_created_at
  ON public.reviews (product_id, created_at DESC);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_review_delivered_product(target_product_id bigint)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.order_items oi
    INNER JOIN public.orders o ON o.id = oi.order_id
    WHERE oi.product_id = target_product_id
      AND o.user_id = auth.uid()
      AND o.status = 'delivered'
      AND o.delivered_at IS NOT NULL
  );
$$;

DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;
CREATE POLICY "Anyone can read reviews"
ON public.reviews
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Delivered buyers can insert their own reviews" ON public.reviews;
CREATE POLICY "Delivered buyers can insert their own reviews"
ON public.reviews
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND verified_purchase = true
  AND public.can_review_delivered_product(product_id)
);
