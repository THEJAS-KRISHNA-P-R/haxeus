-- EMAIL & NOTIFICATIONS SETUP
-- Run this to create email queue and newsletter tables

-- 1. EMAIL QUEUE TABLE
-- Stores emails to be sent by Edge Functions
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_type TEXT NOT NULL, -- 'order_confirmation', 'shipping_update', 'welcome', 'newsletter_welcome', 'password_reset'
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  template_data JSONB, -- Dynamic data for email templates
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  error_message TEXT,
  sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. NEWSLETTER SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  subscribed BOOLEAN DEFAULT true,
  subscription_source TEXT,
  subscribed_at TIMESTAMP DEFAULT NOW(),
  unsubscribed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. EMAIL TEMPLATES TABLE (Optional - for storing custom templates)
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_name TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,
  variables JSONB, -- List of variables used in template
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_created ON email_queue(created_at);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed ON newsletter_subscribers(subscribed);

-- ROW LEVEL SECURITY
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR EMAIL QUEUE (Admin only)
DROP POLICY IF EXISTS "Admin can view email queue" ON email_queue;
CREATE POLICY "Admin can view email queue" ON email_queue 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "System can insert emails" ON email_queue;
CREATE POLICY "System can insert emails" ON email_queue 
  FOR INSERT 
  WITH CHECK (true); -- Allow system to queue emails

DROP POLICY IF EXISTS "Admin can update email queue" ON email_queue;
CREATE POLICY "Admin can update email queue" ON email_queue 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS POLICIES FOR NEWSLETTER (Public can subscribe)
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers 
  FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can unsubscribe" ON newsletter_subscribers;
CREATE POLICY "Anyone can unsubscribe" ON newsletter_subscribers 
  FOR UPDATE 
  USING (true);

DROP POLICY IF EXISTS "Admin can view subscribers" ON newsletter_subscribers;
CREATE POLICY "Admin can view subscribers" ON newsletter_subscribers 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS POLICIES FOR EMAIL TEMPLATES (Admin only)
DROP POLICY IF EXISTS "Admin can manage templates" ON email_templates;
CREATE POLICY "Admin can manage templates" ON email_templates 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- SAMPLE EMAIL TEMPLATES
INSERT INTO email_templates (template_name, subject, html_body, text_body, variables) VALUES
(
  'order_confirmation',
  'Order Confirmation - #{orderId}',
  '<html><body><h1>Thank you for your order!</h1><p>Order ID: {orderId}</p><p>Total: ₹{totalAmount}</p></body></html>',
  'Thank you for your order! Order ID: {orderId}. Total: ₹{totalAmount}',
  '["orderId", "totalAmount", "items", "shippingAddress"]'::jsonb
),
(
  'shipping_update',
  'Shipping Update - Order #{orderId}',
  '<html><body><h1>Your order has been updated</h1><p>Status: {status}</p><p>Tracking: {trackingNumber}</p></body></html>',
  'Your order has been updated. Status: {status}. Tracking: {trackingNumber}',
  '["orderId", "status", "trackingNumber", "estimatedDelivery"]'::jsonb
),
(
  'welcome',
  'Welcome to HAXEUZ!',
  '<html><body><h1>Welcome to HAXEUZ!</h1><p>Hi {name}, thanks for joining us!</p></body></html>',
  'Welcome to HAXEUZ! Hi {name}, thanks for joining us!',
  '["name"]'::jsonb
),
(
  'newsletter_welcome',
  'Welcome to HAXEUZ Newsletter!',
  '<html><body><h1>Thanks for subscribing!</h1><p>Stay tuned for exclusive deals and updates.</p></body></html>',
  'Thanks for subscribing! Stay tuned for exclusive deals and updates.',
  '["name"]'::jsonb
)
ON CONFLICT (template_name) DO NOTHING;

-- FUNCTION TO AUTOMATICALLY UPDATE updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS
DROP TRIGGER IF EXISTS update_email_queue_updated_at ON email_queue;
CREATE TRIGGER update_email_queue_updated_at
  BEFORE UPDATE ON email_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_newsletter_updated_at ON newsletter_subscribers;
CREATE TRIGGER update_newsletter_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
