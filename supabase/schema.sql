-- CLEAN SUPABASE SCHEMA FOR E-COMMERCE
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. USER ROLES TABLE (for admin access control)
DROP TABLE IF EXISTS user_roles CASCADE;
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 1. PRODUCTS TABLE
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;

CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  front_image TEXT,
  back_image TEXT,
  available_sizes TEXT[] DEFAULT ARRAY['S', 'M', 'L', 'XL'],
  colors TEXT[] DEFAULT ARRAY['Black', 'White'],
  total_stock INTEGER DEFAULT 100,
  category TEXT DEFAULT 'apparel',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. CART ITEMS TABLE
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id, size)
);

-- 3. ORDERS TABLE
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  shipping_address JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. USER ADDRESSES TABLE
CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. WISHLIST TABLE
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX idx_wishlist_product_id ON wishlist(product_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- User Roles: Everyone can read their own role (needed to check admin status)
CREATE POLICY "Users can view own role" ON user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage roles" ON user_roles FOR ALL USING (true);

-- Products: Everyone can read, only admins can insert/update/delete
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON products FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update products" ON products FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can delete products" ON products FOR DELETE 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Cart: Users can only access their own cart
CREATE POLICY "Users can view own cart" ON cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart items" ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart items" ON cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart items" ON cart_items FOR DELETE USING (auth.uid() = user_id);

-- Orders: Users can only access their own orders, admins can see all
CREATE POLICY "Users can view own orders" ON orders FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Order Items: Users can view their order items, admins can see all
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()) 
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- User Addresses: Users can only access their own addresses
CREATE POLICY "Users can view own addresses" ON user_addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON user_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON user_addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON user_addresses FOR DELETE USING (auth.uid() = user_id);

-- Wishlist: Users can only access their own wishlist
CREATE POLICY "Users can view own wishlist" ON wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wishlist items" ON wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishlist items" ON wishlist FOR DELETE USING (auth.uid() = user_id);

-- HELPER FUNCTION TO CHECK IF USER IS ADMIN
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM user_roles WHERE user_id = user_uuid AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- REAL PRODUCT DATA FROM YOUR STORE
INSERT INTO products (name, description, price, front_image, back_image, available_sizes, colors, total_stock, category) VALUES
('BUSTED Vintage Tee', 'Make a bold statement with our BUSTED vintage wash tee. Featuring distressed tie-dye effects and striking red typography, this piece embodies rebellious spirit. Crafted from premium cotton blend for ultimate comfort and durability. Perfect for those who dare to stand out from the crowd.', 2499.00, '/images/busted-front.jpg', '/images/busted-back.jpg', ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Vintage Wash'], 100, 'apparel'),
('Save The Flower Tee', 'Eco-conscious design featuring delicate hand and flower artwork with a meaningful environmental message. This cream-colored tee represents hope and sustainability. Made from 100% organic cotton with water-based inks. A perfect blend of style and social consciousness.', 2799.00, '/images/save-flower-front.jpg', '/images/save-flower-back.jpg', ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Cream', 'Natural'], 100, 'apparel'),
('Statue Tee', 'Clean, understated design perfect for everyday wear. This minimalist tee features subtle detailing and premium construction. Crafted with the finest cotton for exceptional softness and breathability. A wardrobe essential that pairs with everything.', 2299.00, '/images/statue-front.jpg', '/images/statue-back.jpg', ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['White', 'Black'], 100, 'apparel'),
('UFO Tee', 'Modern geometric pattern with unique diagonal stripes and HEX branding. This design represents the intersection of street style and contemporary art. Premium tie-dye wash creates a unique texture. Each piece is individually crafted for a one-of-a-kind look.', 2999.00, '/images/ufo-front.jpg', '/images/ufo-back.jpg', ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Tie-Dye', 'Multi'], 100, 'apparel'),
('Renaissance Fusion Tee', 'Artistic blend of classical sculpture and contemporary sunflower elements. This unique design merges art history with modern aesthetics. Features a detailed statue bust with vibrant sunflower crown. Premium quality print on soft cotton canvas.', 3199.00, '/images/soul-front.jpg', '/images/soul-back.jpg', ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Black', 'Dark'], 100, 'apparel');
