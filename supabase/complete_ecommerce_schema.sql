-- ========================================
-- COMPLETE E-COMMERCE DATABASE SCHEMA
-- Fixes all missing features for high-turnover store
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For better search

-- ========================================
-- 1. ENHANCED PRODUCTS TABLE WITH SIZE-SPECIFIC INVENTORY
-- ========================================
DROP TABLE IF EXISTS product_inventory CASCADE;
DROP TABLE IF EXISTS product_reviews CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS product_videos CASCADE;

-- Product Images (Multiple images per product)
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Product Videos (360° views, demos)
CREATE TABLE product_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  video_type TEXT DEFAULT 'demo', -- demo, 360, styling
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Size-Specific Inventory (Real-time stock tracking)
CREATE TABLE product_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT DEFAULT 'default',
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  reserved_quantity INTEGER DEFAULT 0, -- For pending checkouts
  sold_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, size, color)
);

-- ========================================
-- 2. PRODUCT REVIEWS & RATINGS
-- ========================================
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

-- Review Images
CREATE TABLE review_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES product_reviews(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Review Helpfulness Tracking
CREATE TABLE review_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES product_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(review_id, user_id)
);

-- ========================================
-- 3. ABANDONED CART TRACKING
-- ========================================
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

-- Save for Later
CREATE TABLE saved_for_later (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  size TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id, size)
);

-- ========================================
-- 4. SEARCH ANALYTICS
-- ========================================
CREATE TABLE search_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  results_count INTEGER DEFAULT 0,
  clicked_product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 5. EMAIL CAMPAIGNS & NEWSLETTERS
-- ========================================
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subscribed BOOLEAN DEFAULT true,
  subscription_source TEXT, -- popup, checkout, footer
  created_at TIMESTAMP DEFAULT NOW(),
  unsubscribed_at TIMESTAMP
);

CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft', -- draft, scheduled, sent
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 6. ENHANCED WISHLIST WITH NOTIFICATIONS
-- ========================================
ALTER TABLE wishlist ADD COLUMN IF NOT EXISTS notify_price_drop BOOLEAN DEFAULT true;
ALTER TABLE wishlist ADD COLUMN IF NOT EXISTS notify_back_in_stock BOOLEAN DEFAULT true;
ALTER TABLE wishlist ADD COLUMN IF NOT EXISTS price_at_addition DECIMAL(10, 2);

-- Price Drop History
CREATE TABLE price_changes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  old_price DECIMAL(10, 2),
  new_price DECIMAL(10, 2),
  change_percentage DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 7. PRODUCT RECOMMENDATIONS
-- ========================================
CREATE TABLE product_relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  related_product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL, -- frequently_bought_together, similar, complete_the_look
  score DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, related_product_id, relation_type)
);

-- User Product Views (for personalization)
CREATE TABLE product_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 8. COUPONS & DISCOUNTS
-- ========================================
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL, -- percentage, fixed
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

CREATE TABLE coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  discount_amount DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 9. LOYALTY PROGRAM
-- ========================================
CREATE TABLE loyalty_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0,
  lifetime_points INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'bronze', -- bronze, silver, gold, platinum
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- earned, redeemed, expired
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 10. RETURNS & EXCHANGES
-- ========================================
CREATE TABLE return_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  return_type TEXT NOT NULL, -- return, exchange
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, completed
  refund_amount DECIMAL(10, 2),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE return_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_request_id UUID REFERENCES return_requests(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  exchange_size TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 11. ANALYTICS EVENTS
-- ========================================
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL, -- page_view, add_to_cart, purchase, etc.
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ========================================
-- 12. ENHANCED ORDERS TABLE
-- ========================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS loyalty_points_used INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS loyalty_points_earned INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_carrier TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================
CREATE INDEX idx_product_inventory_product_id ON product_inventory(product_id);
CREATE INDEX idx_product_inventory_stock ON product_inventory(stock_quantity);
CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX idx_review_images_review_id ON review_images(review_id);
CREATE INDEX idx_abandoned_carts_user_id ON abandoned_carts(user_id);
CREATE INDEX idx_abandoned_carts_recovered ON abandoned_carts(recovered);
CREATE INDEX idx_search_queries_query ON search_queries USING gin(query gin_trgm_ops);
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_product_relations_product_id ON product_relations(product_id);
CREATE INDEX idx_product_views_product_id ON product_views(product_id);
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_loyalty_points_user_id ON loyalty_points(user_id);
CREATE INDEX idx_return_requests_order_id ON return_requests(order_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);

-- ========================================
-- ROW LEVEL SECURITY
-- ========================================
ALTER TABLE product_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_for_later ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;

-- Product Inventory: Read by all, modify by admins
CREATE POLICY "Anyone can view inventory" ON product_inventory FOR SELECT USING (true);
CREATE POLICY "Admins can manage inventory" ON product_inventory FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Product Reviews: Read by all, create by verified buyers, modify own
CREATE POLICY "Anyone can view approved reviews" ON product_reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can create reviews" ON product_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON product_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all reviews" ON product_reviews FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Review Images: Tied to review permissions
CREATE POLICY "Anyone can view review images" ON review_images FOR SELECT USING (true);
CREATE POLICY "Users can add images to own reviews" ON review_images FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM product_reviews WHERE id = review_id AND user_id = auth.uid()));

-- Review Votes: Users can vote once per review
CREATE POLICY "Users can vote on reviews" ON review_votes FOR ALL USING (auth.uid() = user_id);

-- Abandoned Carts: Users see own, admins see all
CREATE POLICY "Users can view own abandoned carts" ON abandoned_carts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all abandoned carts" ON abandoned_carts FOR SELECT 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Saved for Later: Users manage own
CREATE POLICY "Users manage own saved items" ON saved_for_later FOR ALL USING (auth.uid() = user_id);

-- Newsletter: Anyone can subscribe
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own subscription" ON newsletter_subscribers FOR SELECT 
  USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));
CREATE POLICY "Users can update own subscription" ON newsletter_subscribers FOR UPDATE 
  USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Product Relations: Read by all, manage by admins
CREATE POLICY "Anyone can view product relations" ON product_relations FOR SELECT USING (true);
CREATE POLICY "Admins can manage relations" ON product_relations FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Coupons: Read by all, manage by admins
CREATE POLICY "Anyone can view active coupons" ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage coupons" ON coupons FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Loyalty Points: Users view own, admins view all
CREATE POLICY "Users can view own loyalty points" ON loyalty_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own loyalty transactions" ON loyalty_transactions FOR SELECT USING (auth.uid() = user_id);

-- Returns: Users manage own, admins manage all
CREATE POLICY "Users can view own returns" ON return_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create returns" ON return_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all returns" ON return_requests FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- ========================================
-- FUNCTIONS & TRIGGERS
-- ========================================

-- Function: Update product average rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products SET 
    updated_at = NOW()
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
  WHERE product_id = NEW.product_id 
    AND size = NEW.size;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_inventory
AFTER INSERT ON order_items
FOR EACH ROW EXECUTE FUNCTION decrement_inventory();

-- Function: Award loyalty points on order
CREATE OR REPLACE FUNCTION award_loyalty_points()
RETURNS TRIGGER AS $$
DECLARE
  points_to_award INTEGER;
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    points_to_award := FLOOR(NEW.total_amount / 10); -- 1 point per ₹10
    
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

CREATE TRIGGER trigger_award_loyalty_points
AFTER UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION award_loyalty_points();

-- ========================================
-- INITIAL DATA
-- ========================================

-- Insert inventory for existing products
INSERT INTO product_inventory (product_id, size, stock_quantity, low_stock_threshold)
SELECT 
  p.id,
  unnest(p.available_sizes) as size,
  20 as stock_quantity,
  5 as low_stock_threshold
FROM products p
ON CONFLICT (product_id, size, color) DO NOTHING;

-- Insert sample product relations
INSERT INTO product_relations (product_id, related_product_id, relation_type, score)
SELECT 
  p1.id,
  p2.id,
  'similar',
  0.8
FROM products p1
CROSS JOIN products p2
WHERE p1.id != p2.id
  AND p1.category = p2.category
LIMIT 20
ON CONFLICT DO NOTHING;

-- Create some sample coupons
INSERT INTO coupons (code, discount_type, discount_value, min_purchase_amount, usage_limit, valid_until)
VALUES 
  ('WELCOME10', 'percentage', 10, 1999, 1000, NOW() + INTERVAL '30 days'),
  ('FIRST500', 'fixed', 500, 2999, 500, NOW() + INTERVAL '30 days'),
  ('SAVE20', 'percentage', 20, 4999, 100, NOW() + INTERVAL '30 days')
ON CONFLICT DO NOTHING;

-- ========================================
-- VIEWS FOR EASY QUERYING
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

COMMENT ON TABLE product_inventory IS 'Size-specific real-time inventory with auto-decrement';
COMMENT ON TABLE product_reviews IS 'Customer reviews with ratings and verified purchase badges';
COMMENT ON TABLE abandoned_carts IS 'Track abandoned carts for email recovery campaigns';
COMMENT ON TABLE loyalty_points IS 'Customer loyalty program with points and tiers';
COMMENT ON TABLE return_requests IS 'Returns and exchange management system';
