-- PostgreSQL Database Initialization Script for HAXEUZ

-- Create database (run this separately as superuser)
-- CREATE DATABASE haxeuz_db;
-- CREATE USER haxeuz_user WITH PASSWORD 'your_password_here';
-- GRANT ALL PRIVILEGES ON DATABASE haxeuz_db TO haxeuz_user;

-- Connect to haxeuz_db and run the following:

-- Create categories
INSERT INTO backend_category (name, slug, description, created_at) VALUES
('Eco-Conscious', 'eco-conscious', 'Environmentally friendly designs with meaningful messages', NOW()),
('Statement', 'statement', 'Bold designs that make a statement', NOW()),
('Artistic', 'artistic', 'Creative and artistic expressions', NOW()),
('Streetwear', 'streetwear', 'Urban and contemporary street fashion', NOW()),
('Gothic', 'gothic', 'Dark aesthetic with gothic elements', NOW());

-- Create products (using the 5 products with front/back images)
INSERT INTO backend_product (name, slug, description, price, front_image, back_image, category_id, sizes, stock, is_active, is_featured, created_at, updated_at) VALUES
(
    'Save The Flower Tee',
    'save-the-flower-tee',
    'Eco-conscious design featuring delicate hand and flower artwork with environmental message. Made from organic cotton blend.',
    54.99,
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1f-PO7xQ7I8HF26HRWofpY6L39QDQ8OnP.jpeg',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1b-MpdDMRsUDA86BlxL6xwRcKw7yeqSE2.jpeg',
    1,
    '["S", "M", "L", "XL"]',
    25,
    true,
    true,
    NOW(),
    NOW()
),
(
    'Busted Vintage Wash',
    'busted-vintage-wash',
    'Bold statement piece with distressed tie-dye effect and striking red typography. Features anime-inspired back design.',
    64.99,
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2f-DkFVl8oaL8xVEhTa2EXa6dlMvmfLEV.jpeg',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2b-mh4ewfS8eKVY089pTmPMvRFQFTiA0G.jpeg',
    2,
    '["S", "M", "L", "XL"]',
    18,
    true,
    true,
    NOW(),
    NOW()
),
(
    'Renaissance Fusion',
    'renaissance-fusion',
    'Artistic blend of classical sculpture with modern sunflower and typography elements. Premium minimalist back design.',
    59.99,
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3f-LwkJuGmcpkcEVKdCYLdRrm4MZHigAo.jpeg',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3b-7gJj08D5fJc9WeJiy5nWWotHkmUM3Y.jpeg',
    3,
    '["S", "M", "L", "XL"]',
    22,
    true,
    true,
    NOW(),
    NOW()
),
(
    'UFO Flame Wash',
    'ufo-flame-wash',
    'Otherworldly design featuring UFO with flame details on premium tie-dye base. HEX branding on back.',
    62.99,
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4f-ffIlWf3FhcLCrc1GVgV6ccAZKd96kZ.jpeg',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4b-CL6PlhUyvPnMLB6OuoXhACtVs9aTw9.jpeg',
    4,
    '["S", "M", "L", "XL"]',
    15,
    true,
    true,
    NOW(),
    NOW()
),
(
    'Soul Gothic Wash',
    'soul-gothic-wash',
    'Dark aesthetic with gothic typography on premium tie-dye background. Features intricate tribal spine design on back.',
    58.99,
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5f-e12aNnSjhPsJy9Cl6b74CxK2rJ2ZX3.jpeg',
    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5b-5xjSIbjs95Vv63ZwzPCN286hRHPvOY.jpeg',
    5,
    '["S", "M", "L", "XL"]',
    20,
    true,
    false,
    NOW(),
    NOW()
);

-- Create admin user (password should be hashed in production)
INSERT INTO backend_user (username, email, first_name, last_name, is_staff, is_superuser, is_active, date_joined, password) VALUES
('admin', 'admin@haxeuz.com', 'Admin', 'User', true, true, true, NOW(), 'pbkdf2_sha256$600000$your_hashed_password_here');

-- Create indexes for better performance
CREATE INDEX idx_product_category ON backend_product(category_id);
CREATE INDEX idx_product_active ON backend_product(is_active);
CREATE INDEX idx_product_featured ON backend_product(is_featured);
CREATE INDEX idx_product_created ON backend_product(created_at);
CREATE INDEX idx_order_user ON backend_order(user_id);
CREATE INDEX idx_order_status ON backend_order(status);
CREATE INDEX idx_cartitem_cart ON backend_cartitem(cart_id);
