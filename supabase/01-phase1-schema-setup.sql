-- HAXEUS GOD LEVEL MASTER PROMPT
-- PHASE 1: FOUNDATION - ALL SQL
-- Execute this file in the Supabase SQL Editor in the specified order.

-- ═══════════════════════════════════════════════════════════════════
-- 4.1 — Expand `store_settings` RLS for homepage config (public read)
-- ═══════════════════════════════════════════════════════════════════
-- Allow anyone to read the homepage config
DROP POLICY IF EXISTS "public_read_homepage_config" ON public.store_settings;
CREATE POLICY "public_read_homepage_config"
  ON public.store_settings FOR SELECT
  USING (key = 'homepage_config');

-- ═══════════════════════════════════════════════════════════════════
-- 4.2 — Seed the default homepage config row
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO public.store_settings (key, value)
VALUES (
  'homepage_config',
  '{
    "hero": {
      "line1": "For Those Who",
      "line2": "Won''t Change",
      "line3": "To Fit In",
      "subtext": "Bold designs for bold individuals. Express yourself unapologetically with premium streetwear that refuses to blend in.",
      "hero_product_image_url": "/images/save-flower-front.jpg",
      "hero_product_id": null,
      "badge_top": { "label": "Artistic Designs", "value": "Premium Quality", "color": "#e7bf04" },
      "badge_bottom": { "label": "Eco-Conscious", "value": "Sustainable", "color": "#07e4e1" },
      "cta_primary": { "text": "Shop Collection", "href": "/products" },
      "cta_secondary": { "text": "Our Story", "href": "/about" },
      "stats": [
        { "value": "10+", "label": "Happy Customers", "color": "#e7bf04" },
        { "value": "99%", "label": "Satisfaction Rate", "color": "#c03c9d" },
        { "value": "24/7", "label": "Support", "color": "#07e4e1" }
      ],
      "visible": true
    },
    "featured_products": {
      "heading": "Featured",
      "heading_accent": "Collection",
      "subtext": "Discover our most popular premium T-shirts, carefully crafted for ultimate comfort and style.",
      "selection_mode": "manual",
      "manual_product_ids": [],
      "count": 3,
      "visible": true
    },
    "newsletter": {
      "heading": "Join the movement. Your perfect T-shirt is just a click away.",
      "subtext": "Get exclusive offers and updates. Unsubscribe anytime.",
      "cta_text": "Shop Now",
      "visible": true
    },
    "preorder": {
      "heading": "Pre-Order Now",
      "subtext": "Secure yours before they drop. Limited quantities.",
      "visible": true
    },
    "about": {
      "heading": "Crafting",
      "heading_accent": "Premium",
      "heading_suffix": "Since 2025",
      "body1": "At HAXEUS, we believe that comfort shouldn''t compromise style.",
      "body2": "Every piece in our collection is meticulously crafted using the finest cotton blends.",
      "image_url": "/images/statue-front.jpg",
      "cta_text": "Learn More About Us",
      "cta_href": "/about",
      "features": [
        { "label": "Premium Materials", "color": "#e7bf04" },
        { "label": "Ethical Production", "color": "#c03c9d" },
        { "label": "Sustainable Practices", "color": "#07e4e1" },
        { "label": "Perfect Fit", "color": "#e93a3a" }
      ],
      "visible": true
    },
    "section_order": ["hero", "newsletter", "featured_products", "preorder", "testimonials", "about"],
    "announcement_bar": { "text": "", "bg_color": "#e93a3a", "text_color": "#ffffff", "visible": false },
    "_version": 1,
    "_updated_at": "2025-01-01T00:00:00Z"
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 4.3 — Enable Supabase Realtime on `store_settings`
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE public.store_settings REPLICA IDENTITY FULL;

-- ═══════════════════════════════════════════════════════════════════
-- 4.4 — Create `preorder_items` table
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.preorder_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  price           NUMERIC(10,2) NOT NULL,
  original_price  NUMERIC(10,2),
  front_image     TEXT,
  images          TEXT[] DEFAULT '{}',
  sizes_available TEXT[] DEFAULT '{"S","M","L","XL","XXL"}',
  expected_date   TEXT,
  max_preorders   INTEGER,
  preorder_count  INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'sold_out', 'stopped', 'converted')),
  sort_order      INTEGER NOT NULL DEFAULT 0,
  converted_product_id INTEGER REFERENCES public.products(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- 4.5 — Create `preorder_registrations` table
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.preorder_registrations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preorder_item_id UUID NOT NULL REFERENCES public.preorder_items(id) ON DELETE CASCADE,
  user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email            TEXT NOT NULL,
  name             TEXT,
  size             TEXT,
  notified         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- 4.6 — Triggers and RPCs for preorders
-- ═══════════════════════════════════════════════════════════════════
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS preorder_items_updated_at ON public.preorder_items;
CREATE TRIGGER preorder_items_updated_at
  BEFORE UPDATE ON public.preorder_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Atomic preorder counter (race-condition safe)
CREATE OR REPLACE FUNCTION public.increment_preorder_count(p_item_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.preorder_items
  SET preorder_count = preorder_count + 1
  WHERE id = p_item_id
    AND status = 'active'
    AND (max_preorders IS NULL OR preorder_count < max_preorders);
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Preorder not available or limit reached';
  END IF;
END; $$;

-- ═══════════════════════════════════════════════════════════════════
-- 4.7 — RLS for preorder tables
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE public.preorder_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preorder_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_visible_preorders" ON public.preorder_items;
CREATE POLICY "public_read_visible_preorders"
  ON public.preorder_items FOR SELECT
  USING (status IN ('active', 'sold_out'));

DROP POLICY IF EXISTS "admin_all_preorder_items" ON public.preorder_items;
CREATE POLICY "admin_all_preorder_items"
  ON public.preorder_items FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "anyone_can_register" ON public.preorder_registrations;
CREATE POLICY "anyone_can_register"
  ON public.preorder_registrations FOR INSERT
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "users_own_registrations" ON public.preorder_registrations;
CREATE POLICY "users_own_registrations"
  ON public.preorder_registrations FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "admin_all_registrations" ON public.preorder_registrations;
CREATE POLICY "admin_all_registrations"
  ON public.preorder_registrations FOR ALL
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════
-- 4.8 — Indexes
-- ═══════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_preorder_items_status   ON public.preorder_items(status);
CREATE INDEX IF NOT EXISTS idx_preorder_items_sort     ON public.preorder_items(sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_preorder_reg_item       ON public.preorder_registrations(preorder_item_id);
CREATE INDEX IF NOT EXISTS idx_preorder_reg_email      ON public.preorder_registrations(email);
CREATE INDEX IF NOT EXISTS idx_preorder_reg_user       ON public.preorder_registrations(user_id);

-- PHASE 2: POPUP SYSTEM SQL
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- 5.1 — RLS for popup campaigns (public read)
-- ═══════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "public_read_popup_campaigns" ON public.store_settings;
CREATE POLICY "public_read_popup_campaigns"
  ON public.store_settings FOR SELECT
  USING (key = 'popup_campaigns');

-- ═══════════════════════════════════════════════════════════════════
-- 5.2 — Seed popup campaigns row in store_settings
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO public.store_settings (key, value)
VALUES ('popup_campaigns', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════
-- 5.3 — Create `popup_email_captures` table
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.popup_email_captures (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     TEXT NOT NULL,
  email           TEXT NOT NULL,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_hash         TEXT NOT NULL,
  coupon_shown    TEXT,
  honeypot_hit    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════
-- 5.4 — RLS for popup_email_captures
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE public.popup_email_captures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_popup_captures" ON public.popup_email_captures;
CREATE POLICY "admin_all_popup_captures"
  ON public.popup_email_captures FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ═══════════════════════════════════════════════════════════════════
-- 5.5 — Indexes for popup_email_captures
-- ═══════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_popup_email_ip    ON public.popup_email_captures(ip_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_popup_email_email ON public.popup_email_captures(email);
CREATE INDEX IF NOT EXISTS idx_popup_campaign    ON public.popup_email_captures(campaign_id);
