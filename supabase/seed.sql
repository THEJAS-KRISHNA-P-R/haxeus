-- ============================================================================
-- HAXEUS — Seed Data
-- Run this AFTER reset_and_rebuild.sql
-- ============================================================================

-- ─── Products ───────────────────────────────────────────────────────────────
INSERT INTO public.products (name, description, price, front_image, back_image, available_sizes, colors, total_stock, category) VALUES
('HAXEUS Classic Tee', 'Premium cotton oversized tee with HAXEUS embroidered logo. Ultra-soft 280 GSM combed cotton.', 1499, 'https://hexzhuaifunjowwqkxcy.supabase.co/storage/v1/object/public/product-images/classic-tee-front.webp', 'https://hexzhuaifunjowwqkxcy.supabase.co/storage/v1/object/public/product-images/classic-tee-back.webp', ARRAY['S','M','L','XL','XXL'], ARRAY['Black','White','Graphite'], 250, 'tees'),
('HAXEUS Signature Hoodie', 'Heavyweight 400 GSM fleece hoodie with embossed logo and kangaroo pocket.', 2999, 'https://hexzhuaifunjowwqkxcy.supabase.co/storage/v1/object/public/product-images/hoodie-front.webp', 'https://hexzhuaifunjowwqkxcy.supabase.co/storage/v1/object/public/product-images/hoodie-back.webp', ARRAY['S','M','L','XL','XXL'], ARRAY['Black','Navy','Olive'], 150, 'hoodies'),
('HAXEUS Cargo Joggers', 'Relaxed-fit cargo joggers with utility pockets and adjustable cuffs.', 2499, 'https://hexzhuaifunjowwqkxcy.supabase.co/storage/v1/object/public/product-images/joggers-front.webp', 'https://hexzhuaifunjowwqkxcy.supabase.co/storage/v1/object/public/product-images/joggers-back.webp', ARRAY['S','M','L','XL','XXL'], ARRAY['Black','Khaki','Charcoal'], 180, 'bottoms'),
('HAXEUS Oversized Polo', 'Pique-knit polo with contrast collar and drop shoulder silhouette.', 1799, 'https://hexzhuaifunjowwqkxcy.supabase.co/storage/v1/object/public/product-images/polo-front.webp', 'https://hexzhuaifunjowwqkxcy.supabase.co/storage/v1/object/public/product-images/polo-back.webp', ARRAY['S','M','L','XL'], ARRAY['Black','White','Burgundy'], 120, 'tees'),
('HAXEUS Cap', 'Structured 6-panel cap with embroidered logo and adjustable strap.', 899, 'https://hexzhuaifunjowwqkxcy.supabase.co/storage/v1/object/public/product-images/cap-front.webp', NULL, ARRAY['One Size'], ARRAY['Black','White','Camo'], 300, 'accessories');


-- ─── Product Inventory (per size per product) ───────────────────────────────
-- Product 1: Classic Tee
INSERT INTO public.product_inventory (product_id, size, stock_quantity, low_stock_threshold) VALUES
(1, 'S', 40, 10), (1, 'M', 60, 10), (1, 'L', 60, 10), (1, 'XL', 50, 10), (1, 'XXL', 40, 10);
-- Product 2: Signature Hoodie
INSERT INTO public.product_inventory (product_id, size, stock_quantity, low_stock_threshold) VALUES
(2, 'S', 25, 5), (2, 'M', 35, 5), (2, 'L', 40, 5), (2, 'XL', 30, 5), (2, 'XXL', 20, 5);
-- Product 3: Cargo Joggers
INSERT INTO public.product_inventory (product_id, size, stock_quantity, low_stock_threshold) VALUES
(3, 'S', 30, 5), (3, 'M', 45, 5), (3, 'L', 45, 5), (3, 'XL', 35, 5), (3, 'XXL', 25, 5);
-- Product 4: Oversized Polo
INSERT INTO public.product_inventory (product_id, size, stock_quantity, low_stock_threshold) VALUES
(4, 'S', 25, 5), (4, 'M', 35, 5), (4, 'L', 35, 5), (4, 'XL', 25, 5);
-- Product 5: Cap
INSERT INTO public.product_inventory (product_id, size, stock_quantity, low_stock_threshold) VALUES
(5, 'One Size', 300, 20);


-- ─── Coupons ────────────────────────────────────────────────────────────────
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_purchase_amount, max_discount_amount, usage_limit, valid_from, valid_until) VALUES
('WELCOME10', 'Welcome discount — 10% off your first order', 'percentage', 10, 999, 500, 1000, now(), now() + interval '365 days'),
('FLAT200', 'Flat ₹200 off on orders above ₹1999', 'fixed', 200, 1999, NULL, 500, now(), now() + interval '180 days'),
('COMEBACK10', 'Abandoned cart recovery — 10% off', 'percentage', 10, 0, 300, NULL, now(), now() + interval '365 days'),
('LASTCHANCE15', 'Final abandoned cart offer — 15% off', 'percentage', 15, 0, 500, NULL, now(), now() + interval '365 days');


-- ─── Store Settings ─────────────────────────────────────────────────────────
INSERT INTO public.store_settings (key, value) VALUES
('store_name', '"HAXEUS"'),
('store_email', '"support@haxeus.com"'),
('store_phone', '"+91 98765 43210"'),
('currency', '"INR"'),
('tax_rate', '18'),
('free_shipping_threshold', '1499'),
('shipping_cost', '99'),
('return_window_days', '7');
