-- HAXEUZ E-commerce Database Setup for Supabase
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories
INSERT INTO backend_category (name, slug, description, image, is_active, sort_order, created_at) VALUES
('Eco-Conscious', 'eco-conscious', 'Environmentally friendly designs with meaningful messages', '', true, 1, NOW()),
('Statement', 'statement', 'Bold designs that make a statement', '', true, 2, NOW()),
('Artistic', 'artistic', 'Creative and artistic expressions', '', true, 3, NOW()),
('Streetwear', 'streetwear', 'Urban and contemporary street fashion', '', true, 4, NOW()),
('Gothic', 'gothic', 'Dark aesthetic with gothic elements', '', true, 5, NOW());

-- Create products with all sizes
INSERT INTO backend_product (
    name, slug, description, short_description, price, compare_price,
    front_image, back_image, category_id, available_sizes, material,
    care_instructions, total_stock, is_active, is_featured, 
    meta_title, meta_description, tags, created_at, updated_at
) VALUES
(
    'Save The Flower Tee',
    'save-the-flower-tee',
    'Eco-conscious design featuring delicate hand and flower artwork with environmental message "Save The Flower For Better Future". Made from 100% organic cotton blend for ultimate comfort and sustainability. This premium tee represents our commitment to both style and environmental consciousness.',
    'Eco-conscious design with hand and flower artwork',
    54.99,
    69.99,
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1f-PO7xQ7I8HF26HRWofpY6L39QDQ8OnP.jpeg',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1b-MpdDMRsUDA86BlxL6xwRcKw7yeqSE2.jpeg',
    1,
    '["S", "M", "L", "XL", "XXL"]',
    '100% Organic Cotton Blend',
    'Machine wash cold with like colors. Tumble dry low. Do not bleach. Iron on reverse side.',
    125,
    true,
    true,
    'Save The Flower Eco-Conscious T-Shirt | HAXEUZ',
    'Premium eco-friendly t-shirt with artistic flower design. Made from organic cotton for comfort and sustainability.',
    '["eco-friendly", "organic", "flower", "environmental", "sustainable"]',
    NOW(),
    NOW()
),
(
    'Busted Vintage Wash',
    'busted-vintage-wash',
    'Bold statement piece featuring distressed tie-dye effect with striking red "BUSTED" typography. The back showcases anime-inspired artwork that adds urban edge to this premium streetwear essential. Perfect for those who want to make a statement.',
    'Bold tie-dye statement piece with anime-inspired back design',
    64.99,
    79.99,
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2f-DkFVl8oaL8xVEhTa2EXa6dlMvmfLEV.jpeg',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2b-mh4ewfS8eKVY089pTmPMvRFQFTiA0G.jpeg',
    2,
    '["S", "M", "L", "XL", "XXL"]',
    '100% Premium Cotton with Vintage Wash',
    'Machine wash cold separately. Tumble dry low. Do not bleach. Iron inside out.',
    90,
    true,
    true,
    'Busted Vintage Wash Statement T-Shirt | HAXEUZ',
    'Bold tie-dye statement tee with anime-inspired design. Premium vintage wash for authentic streetwear style.',
    '["statement", "tie-dye", "anime", "streetwear", "vintage"]',
    NOW(),
    NOW()
),
(
    'Renaissance Fusion',
    'renaissance-fusion',
    'Artistic masterpiece blending classical Renaissance sculpture with modern sunflower and typography elements. This unique design represents the fusion of timeless art with contemporary style. Features clean minimalist back design for versatile styling.',
    'Classical sculpture meets modern sunflower design',
    59.99,
    74.99,
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3f-LwkJuGmcpkcEVKdCYLdRrm4MZHigAo.jpeg',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3b-7gJj08D5fJc9WeJiy5nWWotHkmUM3Y.jpeg',
    3,
    '["S", "M", "L", "XL", "XXL"]',
    '100% Premium Cotton Jersey',
    'Machine wash cold. Tumble dry low. Do not bleach. Iron on low heat.',
    110,
    true,
    true,
    'Renaissance Fusion Art T-Shirt | HAXEUZ',
    'Unique artistic tee blending classical sculpture with modern sunflower design. Premium cotton for comfort.',
    '["art", "renaissance", "sculpture", "sunflower", "artistic"]',
    NOW(),
    NOW()
),
(
    'UFO Flame Wash',
    'ufo-flame-wash',
    'Otherworldly design featuring UFO with flame details on premium tie-dye base. The back displays HEX branding with diagonal stripe pattern. This cosmic-inspired piece is perfect for those who dare to be different and embrace the unknown.',
    'Cosmic UFO design with flame details on tie-dye base',
    62.99,
    77.99,
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4f-ffIlWf3FhcLCrc1GVgV6ccAZKd96kZ.jpeg',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4b-CL6PlhUyvPnMLB6OuoXhACtVs9aTw9.jpeg',
    4,
    '["S", "M", "L", "XL", "XXL"]',
    '100% Premium Cotton with Tie-Dye Finish',
    'Machine wash cold separately. Tumble dry low. Do not bleach. Iron inside out on low heat.',
    75,
    true,
    true,
    'UFO Flame Wash Cosmic T-Shirt | HAXEUZ',
    'Cosmic UFO design with flame details on premium tie-dye. Perfect for streetwear enthusiasts.',
    '["ufo", "cosmic", "flames", "tie-dye", "streetwear"]',
    NOW(),
    NOW()
),
(
    'Soul Gothic Wash',
    'soul-gothic-wash',
    'Dark aesthetic featuring gothic "SOUL" typography on premium tie-dye background. The back showcases intricate tribal spine design that adds mystique and edge. Perfect for those who embrace the darker side of fashion with premium comfort.',
    'Gothic typography with tribal spine back design',
    58.99,
    72.99,
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5f-e12aNnSjhPsJy9Cl6b74CxK2rJ2ZX3.jpeg',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5b-5xjSIbjs95Vv63ZwzPCN286hRHPvOY.jpeg',
    5,
    '["S", "M", "L", "XL", "XXL"]',
    '100% Premium Cotton with Gothic Wash',
    'Machine wash cold with dark colors. Tumble dry low. Do not bleach. Iron inside out.',
    100,
    true,
    false,
    'Soul Gothic Wash Dark T-Shirt | HAXEUZ',
    'Gothic typography tee with tribal spine design. Premium dark wash for authentic gothic style.',
    '["gothic", "soul", "tribal", "spine", "dark"]',
    NOW(),
    NOW()
);

-- Create product variants for each size
INSERT INTO backend_productvariant (product_id, size, sku, stock, price_adjustment, is_active, created_at) VALUES
-- Save The Flower Tee variants
(1, 'S', 'HXSF001-S', 25, 0, true, NOW()),
(1, 'M', 'HXSF001-M', 25, 0, true, NOW()),
(1, 'L', 'HXSF001-L', 25, 0, true, NOW()),
(1, 'XL', 'HXSF001-XL', 25, 0, true, NOW()),
(1, 'XXL', 'HXSF001-XXL', 25, 2.00, true, NOW()),

-- Busted Vintage Wash variants
(2, 'S', 'HXBV002-S', 18, 0, true, NOW()),
(2, 'M', 'HXBV002-M', 18, 0, true, NOW()),
(2, 'L', 'HXBV002-L', 18, 0, true, NOW()),
(2, 'XL', 'HXBV002-XL', 18, 0, true, NOW()),
(2, 'XXL', 'HXBV002-XXL', 18, 2.00, true, NOW()),

-- Renaissance Fusion variants
(3, 'S', 'HXRF003-S', 22, 0, true, NOW()),
(3, 'M', 'HXRF003-M', 22, 0, true, NOW()),
(3, 'L', 'HXRF003-L', 22, 0, true, NOW()),
(3, 'XL', 'HXRF003-XL', 22, 0, true, NOW()),
(3, 'XXL', 'HXRF003-XXL', 22, 2.00, true, NOW()),

-- UFO Flame Wash variants
(4, 'S', 'HXUF004-S', 15, 0, true, NOW()),
(4, 'M', 'HXUF004-M', 15, 0, true, NOW()),
(4, 'L', 'HXUF004-L', 15, 0, true, NOW()),
(4, 'XL', 'HXUF004-XL', 15, 0, true, NOW()),
(4, 'XXL', 'HXUF004-XXL', 15, 2.00, true, NOW()),

-- Soul Gothic Wash variants
(5, 'S', 'HXSG005-S', 20, 0, true, NOW()),
(5, 'M', 'HXSG005-M', 20, 0, true, NOW()),
(5, 'L', 'HXSG005-L', 20, 0, true, NOW()),
(5, 'XL', 'HXSG005-XL', 20, 0, true, NOW()),
(5, 'XXL', 'HXSG005-XXL', 20, 2.00, true, NOW());

-- Create sample coupons
INSERT INTO backend_coupon (code, description, discount_type, discount_value, minimum_amount, usage_limit, is_active, valid_from, valid_until, created_at) VALUES
('WELCOME10', 'Welcome 10% discount for new customers', 'percentage', 10.00, 50.00, 100, true, NOW(), NOW() + INTERVAL '30 days', NOW()),
('FREESHIP', 'Free shipping on orders over $75', 'fixed', 9.99, 75.00, NULL, true, NOW(), NOW() + INTERVAL '90 days', NOW()),
('SAVE20', '20% off on orders over $100', 'percentage', 20.00, 100.00, 50, true, NOW(), NOW() + INTERVAL '14 days', NOW());

-- Create admin user (you'll need to set the password via Django admin or management command)
INSERT INTO auth_user (username, email, first_name, last_name, is_staff, is_superuser, is_active, date_joined) VALUES
('admin', 'admin@haxeuz.com', 'Admin', 'User', true, true, true, NOW());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_category ON backend_product(category_id);
CREATE INDEX IF NOT EXISTS idx_product_active ON backend_product(is_active);
CREATE INDEX IF NOT EXISTS idx_product_featured ON backend_product(is_featured);
CREATE INDEX IF NOT EXISTS idx_product_created ON backend_product(created_at);
CREATE INDEX IF NOT EXISTS idx_product_price ON backend_product(price);
CREATE INDEX IF NOT EXISTS idx_product_slug ON backend_product(slug);

CREATE INDEX IF NOT EXISTS idx_order_user ON backend_order(user_id);
CREATE INDEX IF NOT EXISTS idx_order_status ON backend_order(status);
CREATE INDEX IF NOT EXISTS idx_order_created ON backend_order(created_at);
CREATE INDEX IF NOT EXISTS idx_order_number ON backend_order(order_number);

CREATE INDEX IF NOT EXISTS idx_cartitem_cart ON backend_cartitem(cart_id);
CREATE INDEX IF NOT EXISTS idx_cartitem_product ON backend_cartitem(product_id);

CREATE INDEX IF NOT EXISTS idx_productvariant_product ON backend_productvariant(product_id);
CREATE INDEX IF NOT EXISTS idx_productvariant_size ON backend_productvariant(size);

CREATE INDEX IF NOT EXISTS idx_review_product ON backend_productreview(product_id);
CREATE INDEX IF NOT EXISTS idx_review_user ON backend_productreview(user_id);
CREATE INDEX IF NOT EXISTS idx_review_approved ON backend_productreview(is_approved);

-- Enable Row Level Security (RLS) for better security
ALTER TABLE backend_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE backend_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE backend_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE backend_cartitem ENABLE ROW LEVEL SECURITY;
ALTER TABLE backend_address ENABLE ROW LEVEL SECURITY;
ALTER TABLE backend_wishlist ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (users can only access their own data)
CREATE POLICY "Users can view own profile" ON backend_user FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON backend_user FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own orders" ON backend_order FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create own orders" ON backend_order FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own cart" ON backend_cart FOR ALL USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own cart items" ON backend_cartitem FOR ALL USING (
    EXISTS (SELECT 1 FROM backend_cart WHERE id = cart_id AND auth.uid()::text = user_id::text)
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
