-- ============================================
-- HAXEUS E-COMMERCE COMPLETE DATABASE SETUP
-- ============================================
-- This single file contains the complete database schema for HAXEUS
-- Run this file once in your Supabase SQL Editor to set up everything
-- 
-- Includes:
-- - User roles and authentication
-- - Products and inventory management
-- - Orders and cart functionality
-- - Reviews and ratings
-- - Email system and newsletter
-- - Loyalty program
-- - Coupons and discounts
-- - Returns and exchanges
-- - Analytics and tracking
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For better search performance

-- ========================================
-- SECTION 1: USER MANAGEMENT
-- ========================================

-- USER ROLES TABLE
DROP TABLE IF EXISTS user_roles CASCADE;
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

-- Enable RLS on user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Service role can manage roles" ON user_roles;

CREATE POLICY "Users can view own role" ON user_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage roles" ON user_roles 
  FOR ALL 
  USING (true);

-- HELPER FUNCTION TO CHECK IF USER IS ADMIN
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM user_roles WHERE user_id = user_uuid AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- USER ADDRESSES TABLE
DROP TABLE IF EXISTS user_addresses CASCADE;
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

CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);

ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own addresses" ON user_addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON user_addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON user_addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON user_addresses;

CREATE POLICY "Users can view own addresses" ON user_addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses" ON user_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses" ON user_addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses" ON user_addresses FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- SECTION 2: PRODUCTS & INVENTORY
-- ========================================

-- PRODUCTS TABLE
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

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON products FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update products" ON products FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can delete products" ON products FOR DELETE 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- PRODUCT IMAGES (Multiple images per product)
DROP TABLE IF EXISTS product_images CASCADE;
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- PRODUCT VIDEOS (360° views, demos)
DROP TABLE IF EXISTS product_videos CASCADE;
CREATE TABLE product_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  video_type TEXT DEFAULT 'demo',
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_product_videos_product_id ON product_videos(product_id);

-- Enable RLS on product_images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_images
DROP POLICY IF EXISTS "Anyone can view product images" ON product_images;
DROP POLICY IF EXISTS "Admins can manage product images" ON product_images;

CREATE POLICY "Anyone can view product images" ON product_images 
  FOR SELECT USING (true);
  
CREATE POLICY "Admins can manage product images" ON product_images 
  FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- SIZE-SPECIFIC INVENTORY (Real-time stock tracking)
DROP TABLE IF EXISTS product_inventory CASCADE;
CREATE TABLE product_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT DEFAULT 'default',
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  reserved_quantity INTEGER DEFAULT 0,
  sold_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, size, color)
);

CREATE INDEX idx_product_inventory_product_id ON product_inventory(product_id);
CREATE INDEX idx_product_inventory_stock ON product_inventory(stock_quantity);

ALTER TABLE product_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view inventory" ON product_inventory;
DROP POLICY IF EXISTS "Admins can manage inventory" ON product_inventory;

CREATE POLICY "Anyone can view inventory" ON product_inventory FOR SELECT USING (true);
CREATE POLICY "Admins can manage inventory" ON product_inventory FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- ========================================
-- SECTION 3: CART & ORDERS
-- ========================================

-- CART ITEMS TABLE
DROP TABLE IF EXISTS cart_items CASCADE;
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

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;

CREATE POLICY "Users can view own cart" ON cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart items" ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart items" ON cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cart items" ON cart_items FOR DELETE USING (auth.uid() = user_id);

-- ORDERS TABLE
DROP TABLE IF EXISTS orders CASCADE;
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  shipping_address JSONB,
  coupon_code TEXT,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  loyalty_points_used INTEGER DEFAULT 0,
  loyalty_points_earned INTEGER DEFAULT 0,
  tracking_number TEXT,
  shipping_carrier TEXT,
  estimated_delivery_date DATE,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;

CREATE POLICY "Users can view own orders" ON orders FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update orders" ON orders FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- ORDER ITEMS TABLE
DROP TABLE IF EXISTS order_items CASCADE;
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;

CREATE POLICY "Users can view own order items" ON order_items FOR SELECT 
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()) 
    OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- ========================================
-- SECTION 4: WISHLIST & SAVED ITEMS
-- ========================================

-- WISHLIST TABLE
DROP TABLE IF EXISTS wishlist CASCADE;
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  notify_price_drop BOOLEAN DEFAULT true,
  notify_back_in_stock BOOLEAN DEFAULT true,
  price_at_addition DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX idx_wishlist_product_id ON wishlist(product_id);

ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own wishlist" ON wishlist;
DROP POLICY IF EXISTS "Users can insert own wishlist items" ON wishlist;
DROP POLICY IF EXISTS "Users can delete own wishlist items" ON wishlist;
DROP POLICY IF EXISTS "Users can update own wishlist items" ON wishlist;

CREATE POLICY "Users can view own wishlist" ON wishlist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wishlist items" ON wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own wishlist items" ON wishlist FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own wishlist items" ON wishlist FOR UPDATE USING (auth.uid() = user_id);

-- SAVED FOR LATER
DROP TABLE IF EXISTS saved_for_later CASCADE;
CREATE TABLE saved_for_later (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  size TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id, size)
);

CREATE INDEX idx_saved_for_later_user_id ON saved_for_later(user_id);

ALTER TABLE saved_for_later ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own saved items" ON saved_for_later;

CREATE POLICY "Users manage own saved items" ON saved_for_later FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- SECTION 5: REVIEWS & RATINGS
-- ========================================

-- PRODUCT REVIEWS TABLE
DROP TABLE IF EXISTS product_reviews CASCADE;
CREATE TABLE product_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX idx_product_reviews_rating ON product_reviews(rating);

ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view approved reviews" ON product_reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON product_reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON product_reviews;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON product_reviews;

CREATE POLICY "Anyone can view approved reviews" ON product_reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can create reviews" ON product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON product_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all reviews" ON product_reviews FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- REVIEW IMAGES
DROP TABLE IF EXISTS review_images CASCADE;
CREATE TABLE review_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES product_reviews(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_review_images_review_id ON review_images(review_id);

ALTER TABLE review_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view review images" ON review_images;
DROP POLICY IF EXISTS "Users can add images to own reviews" ON review_images;

CREATE POLICY "Anyone can view review images" ON review_images FOR SELECT USING (true);
CREATE POLICY "Users can add images to own reviews" ON review_images FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM product_reviews WHERE id = review_id AND user_id = auth.uid()));

-- REVIEW VOTES
DROP TABLE IF EXISTS review_votes CASCADE;
CREATE TABLE review_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES product_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can vote on reviews" ON review_votes;

CREATE POLICY "Users can vote on reviews" ON review_votes FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- SECTION 6: EMAIL SYSTEM
-- ========================================

-- EMAIL QUEUE TABLE
DROP TABLE IF EXISTS email_queue CASCADE;
CREATE TABLE email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  template_data JSONB,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_email_queue_status ON email_queue(status);
CREATE INDEX idx_email_queue_created ON email_queue(created_at);

ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can view email queue" ON email_queue;
DROP POLICY IF EXISTS "System can insert emails" ON email_queue;
DROP POLICY IF EXISTS "Admin can update email queue" ON email_queue;

CREATE POLICY "Admin can view email queue" ON email_queue 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "System can insert emails" ON email_queue 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admin can update email queue" ON email_queue 
  FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- EMAIL TEMPLATES TABLE
DROP TABLE IF EXISTS email_templates CASCADE;
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,
  variables JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can manage templates" ON email_templates;

CREATE POLICY "Admin can manage templates" ON email_templates 
  FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- NEWSLETTER SUBSCRIBERS TABLE
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT,
  subscribed BOOLEAN DEFAULT true,
  subscription_source TEXT,
  subscribed_at TIMESTAMP DEFAULT NOW(),
  unsubscribed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribed ON newsletter_subscribers(subscribed);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Users can view own subscription" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Users can update own subscription" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Admin can view subscribers" ON newsletter_subscribers;

CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can view own subscription" ON newsletter_subscribers FOR SELECT 
  USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update own subscription" ON newsletter_subscribers FOR UPDATE 
  USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Admin can view subscribers" ON newsletter_subscribers 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- EMAIL CAMPAIGNS TABLE
DROP TABLE IF EXISTS email_campaigns CASCADE;
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- SECTION 7: COUPONS & DISCOUNTS
-- ========================================

-- COUPONS TABLE
DROP TABLE IF EXISTS coupons CASCADE;
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
  max_discount_amount DECIMAL(10, 2),
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP DEFAULT NOW(),
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active coupons" ON coupons;
DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;

CREATE POLICY "Anyone can view active coupons" ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage coupons" ON coupons FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- COUPON USAGE TABLE
DROP TABLE IF EXISTS coupon_usage CASCADE;
CREATE TABLE coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  discount_amount DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- ========================================
-- SECTION 8: LOYALTY PROGRAM
-- ========================================

-- LOYALTY POINTS TABLE
DROP TABLE IF EXISTS loyalty_points CASCADE;
CREATE TABLE loyalty_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'bronze',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_loyalty_points_user_id ON loyalty_points(user_id);

ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own loyalty points" ON loyalty_points;

CREATE POLICY "Users can view own loyalty points" ON loyalty_points FOR SELECT USING (auth.uid() = user_id);

-- LOYALTY TRANSACTIONS TABLE
DROP TABLE IF EXISTS loyalty_transactions CASCADE;
CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own loyalty transactions" ON loyalty_transactions;

CREATE POLICY "Users can view own loyalty transactions" ON loyalty_transactions FOR SELECT USING (auth.uid() = user_id);

-- ========================================
-- SECTION 9: RETURNS & EXCHANGES
-- ========================================

-- RETURN REQUESTS TABLE
DROP TABLE IF EXISTS return_requests CASCADE;
CREATE TABLE return_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  return_type TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  refund_amount DECIMAL(10, 2),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_return_requests_order_id ON return_requests(order_id);

ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own returns" ON return_requests;
DROP POLICY IF EXISTS "Users can create returns" ON return_requests;
DROP POLICY IF EXISTS "Admins can manage all returns" ON return_requests;

CREATE POLICY "Users can view own returns" ON return_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create returns" ON return_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all returns" ON return_requests FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- RETURN ITEMS TABLE
DROP TABLE IF EXISTS return_items CASCADE;
CREATE TABLE return_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_request_id UUID REFERENCES return_requests(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  exchange_size TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;

-- ========================================
-- SECTION 10: ANALYTICS & TRACKING
-- ========================================

-- ABANDONED CARTS TABLE
DROP TABLE IF EXISTS abandoned_carts CASCADE;
CREATE TABLE abandoned_carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cart_value DECIMAL(10, 2),
  items_count INTEGER,
  email_sent_count INTEGER DEFAULT 0,
  last_email_sent_at TIMESTAMP,
  recovered BOOLEAN DEFAULT false,
  recovered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_abandoned_carts_user_id ON abandoned_carts(user_id);
CREATE INDEX idx_abandoned_carts_recovered ON abandoned_carts(recovered);

ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own abandoned carts" ON abandoned_carts;
DROP POLICY IF EXISTS "Admins can view all abandoned carts" ON abandoned_carts;

CREATE POLICY "Users can view own abandoned carts" ON abandoned_carts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all abandoned carts" ON abandoned_carts FOR SELECT 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- SEARCH QUERIES TABLE
DROP TABLE IF EXISTS search_queries CASCADE;
CREATE TABLE search_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  results_count INTEGER DEFAULT 0,
  clicked_product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_search_queries_query ON search_queries USING gin(query gin_trgm_ops);

-- PRODUCT VIEWS TABLE
DROP TABLE IF EXISTS product_views CASCADE;
CREATE TABLE product_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_product_views_product_id ON product_views(product_id);

ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;

-- ANALYTICS EVENTS TABLE
DROP TABLE IF EXISTS analytics_events CASCADE;
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);

-- ========================================
-- SECTION 11: PRODUCT RECOMMENDATIONS
-- ========================================

-- PRODUCT RELATIONS TABLE
DROP TABLE IF EXISTS product_relations CASCADE;
CREATE TABLE product_relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  related_product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL,
  score DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, related_product_id, relation_type)
);

CREATE INDEX idx_product_relations_product_id ON product_relations(product_id);

ALTER TABLE product_relations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view product relations" ON product_relations;
DROP POLICY IF EXISTS "Admins can manage relations" ON product_relations;

CREATE POLICY "Anyone can view product relations" ON product_relations FOR SELECT USING (true);
CREATE POLICY "Admins can manage relations" ON product_relations FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- PRICE CHANGES TABLE
DROP TABLE IF EXISTS price_changes CASCADE;
CREATE TABLE price_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  old_price DECIMAL(10, 2),
  new_price DECIMAL(10, 2),
  change_percentage DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- SECTION 12: TRIGGERS & FUNCTIONS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_addresses_updated_at ON user_addresses;
CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON user_addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_queue_updated_at ON email_queue;
CREATE TRIGGER update_email_queue_updated_at BEFORE UPDATE ON email_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_newsletter_updated_at ON newsletter_subscribers;
CREATE TRIGGER update_newsletter_updated_at BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Update product rating on review changes
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products SET updated_at = NOW()
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_product_rating ON product_reviews;
CREATE TRIGGER trigger_update_product_rating
AFTER INSERT OR UPDATE OR DELETE ON product_reviews
FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Function: Decrement inventory on order
CREATE OR REPLACE FUNCTION decrement_inventory()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE product_inventory
  SET 
    stock_quantity = stock_quantity - NEW.quantity,
    sold_quantity = sold_quantity + NEW.quantity,
    updated_at = NOW()
  WHERE product_id = NEW.product_id AND size = NEW.size;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_decrement_inventory ON order_items;
CREATE TRIGGER trigger_decrement_inventory
AFTER INSERT ON order_items
FOR EACH ROW EXECUTE FUNCTION decrement_inventory();

-- Function: Award loyalty points on order delivery
CREATE OR REPLACE FUNCTION award_loyalty_points()
RETURNS TRIGGER AS $$
DECLARE
  points_to_award INTEGER;
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    points_to_award := FLOOR(NEW.total_amount / 10);
    
    INSERT INTO loyalty_points (user_id, total_points, lifetime_points)
    VALUES (NEW.user_id, points_to_award, points_to_award)
    ON CONFLICT (user_id) DO UPDATE SET
      total_points = loyalty_points.total_points + points_to_award,
      lifetime_points = loyalty_points.lifetime_points + points_to_award,
      updated_at = NOW();
    
    INSERT INTO loyalty_transactions (user_id, points, transaction_type, order_id, description)
    VALUES (NEW.user_id, points_to_award, 'earned', NEW.id, 'Order completed');
    
    UPDATE orders SET loyalty_points_earned = points_to_award WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_award_loyalty_points ON orders;
CREATE TRIGGER trigger_award_loyalty_points
AFTER UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION award_loyalty_points();

-- Function: Queue welcome email on user signup
CREATE OR REPLACE FUNCTION queue_welcome_email()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_name TEXT;
BEGIN
  user_email := NEW.email;
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(user_email, '@', 1)
  );
  
  BEGIN
    INSERT INTO email_queue (
      email_type, recipient_email, recipient_name, subject, template_data, status
    ) VALUES (
      'welcome', user_email, user_name, 'Welcome to HAXEUS!',
      jsonb_build_object('name', user_name, 'email', user_email), 'pending'
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to queue welcome email for %: %', user_email, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION queue_welcome_email();

-- ========================================
-- SECTION 13: VIEWS FOR REPORTING
-- ========================================

-- Product with average rating
CREATE OR REPLACE VIEW products_with_ratings AS
SELECT 
  p.*,
  COALESCE(AVG(pr.rating), 0) as average_rating,
  COUNT(pr.id) as review_count
FROM products p
LEFT JOIN product_reviews pr ON p.id = pr.product_id AND pr.is_approved = true
GROUP BY p.id;

-- Low stock products
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
  p.name,
  pi.size,
  pi.color,
  pi.stock_quantity,
  pi.low_stock_threshold
FROM product_inventory pi
JOIN products p ON p.id = pi.product_id
WHERE pi.stock_quantity <= pi.low_stock_threshold;

-- Top selling products
CREATE OR REPLACE VIEW top_selling_products AS
SELECT 
  p.id,
  p.name,
  SUM(oi.quantity) as total_sold,
  SUM(oi.quantity * oi.price) as total_revenue
FROM products p
JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name
ORDER BY total_sold DESC;

-- ========================================
-- SECTION 14: INITIAL DATA
-- ========================================

-- Sample Email Templates
INSERT INTO email_templates (template_name, subject, html_body, text_body, variables) VALUES
('order_confirmation', 'Order Confirmation - #{orderId}',
 '<html><body><h1>Thank you for your order!</h1><p>Order ID: {orderId}</p><p>Total: ₹{totalAmount}</p></body></html>',
 'Thank you for your order! Order ID: {orderId}. Total: ₹{totalAmount}',
 '["orderId", "totalAmount", "items", "shippingAddress"]'::jsonb),
('shipping_update', 'Shipping Update - Order #{orderId}',
 '<html><body><h1>Your order has been updated</h1><p>Status: {status}</p><p>Tracking: {trackingNumber}</p></body></html>',
 'Your order has been updated. Status: {status}. Tracking: {trackingNumber}',
 '["orderId", "status", "trackingNumber", "estimatedDelivery"]'::jsonb),
('welcome', 'Welcome to HAXEUS!',
 '<html><body><h1>Welcome to HAXEUS!</h1><p>Hi {name}, thanks for joining us!</p></body></html>',
 'Welcome to HAXEUS! Hi {name}, thanks for joining us!',
 '["name"]'::jsonb),
('newsletter_welcome', 'Welcome to HAXEUS Newsletter!',
 '<html><body><h1>Thanks for subscribing!</h1><p>Stay tuned for exclusive deals and updates.</p></body></html>',
 'Thanks for subscribing! Stay tuned for exclusive deals and updates.',
 '["name"]'::jsonb)
ON CONFLICT (template_name) DO NOTHING;

-- Sample Products
INSERT INTO products (name, description, price, front_image, back_image, available_sizes, colors, total_stock, category) VALUES
('BUSTED Vintage Tee', 'Make a bold statement with our BUSTED vintage wash tee. Featuring distressed tie-dye effects and striking red typography, this piece embodies rebellious spirit. Crafted from premium cotton blend for ultimate comfort and durability. Perfect for those who dare to stand out from the crowd.', 999.00, '/images/busted-front.jpg', '/images/busted-back.jpg', ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Vintage Wash'], 100, 'apparel'),
('Save The Flower Tee', 'Eco-conscious design featuring delicate hand and flower artwork with a meaningful environmental message. This cream-colored tee represents hope and sustainability. Made from 100% organic cotton with water-based inks. A perfect blend of style and social consciousness.', 999.00, '/images/save-flower-front.jpg', '/images/save-flower-back.jpg', ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Cream', 'Natural'], 100, 'apparel'),
('Statue Tee', 'Clean, understated design perfect for everyday wear. This minimalist tee features subtle detailing and premium construction. Crafted with the finest cotton for exceptional softness and breathability. A wardrobe essential that pairs with everything.', 999.00, '/images/statue-front.jpg', '/images/statue-back.jpg', ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['White', 'Black'], 100, 'apparel'),
('UFO Tee', 'Modern geometric pattern with unique diagonal stripes and HEX branding. This design represents the intersection of street style and contemporary art. Premium tie-dye wash creates a unique texture. Each piece is individually crafted for a one-of-a-kind look.', 999.00, '/images/ufo-front.jpg', '/images/ufo-back.jpg', ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Tie-Dye', 'Multi'], 100, 'apparel'),
('Renaissance Fusion Tee', 'Artistic blend of classical sculpture and contemporary sunflower elements. This unique design merges art history with modern aesthetics. Features a detailed statue bust with vibrant sunflower crown. Premium quality print on soft cotton canvas.', 999.00, '/images/soul-front.jpg', '/images/soul-back.jpg', ARRAY['S', 'M', 'L', 'XL', 'XXL'], ARRAY['Black', 'Dark'], 100, 'apparel')
ON CONFLICT DO NOTHING;

-- Insert inventory for existing products
INSERT INTO product_inventory (product_id, size, stock_quantity, low_stock_threshold)
SELECT 
  p.id,
  unnest(p.available_sizes) as size,
  20 as stock_quantity,
  5 as low_stock_threshold
FROM products p
ON CONFLICT (product_id, size, color) DO NOTHING;

-- Sample Coupons
INSERT INTO coupons (code, discount_type, discount_value, min_purchase_amount, usage_limit, valid_until)
VALUES 
  ('WELCOME10', 'percentage', 10, 1999, 1000, NOW() + INTERVAL '30 days'),
  ('FIRST500', 'fixed', 500, 2999, 500, NOW() + INTERVAL '30 days'),
  ('SAVE20', 'percentage', 20, 4999, 100, NOW() + INTERVAL '30 days')
ON CONFLICT DO NOTHING;

-- ========================================
-- SETUP COMPLETE!
-- ========================================
-- Your database is now ready to use.
-- 
-- NEXT STEPS:
-- 1. Make yourself an admin:
--    INSERT INTO user_roles (user_id, role)
--    VALUES ('YOUR_USER_UUID_HERE', 'admin')
--    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
--
-- 2. Get your user UUID from:
--    Supabase Dashboard → Authentication → Users
--
-- 3. Start using your application!
-- ========================================
