-- ================================================
-- COMPLETE RLS FIX FOR ADMIN PRODUCT MANAGEMENT
-- Run this ENTIRE script in Supabase SQL Editor
-- ================================================

-- STEP 1: Fix user_roles table RLS (allow system to check admin status)
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Anyone can check admin status" ON user_roles;

-- This policy is CRITICAL - without it, other tables can't check if user is admin
CREATE POLICY "Anyone can check admin status" ON user_roles 
  FOR SELECT USING (true);

-- STEP 2: Ensure your user is admin
INSERT INTO user_roles (user_id, role) 
VALUES ('e1ca15dd-ceb2-4191-a1d7-8aec75896d4a', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- STEP 3: Fix products table RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

CREATE POLICY "Anyone can view products" ON products 
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert products" ON products 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update products" ON products 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete products" ON products 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- STEP 4: Fix product_images table RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view product images" ON product_images;
DROP POLICY IF EXISTS "Admins can manage product images" ON product_images;
DROP POLICY IF EXISTS "Admins can insert product images" ON product_images;
DROP POLICY IF EXISTS "Admins can update product images" ON product_images;
DROP POLICY IF EXISTS "Admins can delete product images" ON product_images;

CREATE POLICY "Anyone can view product images" ON product_images 
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert product images" ON product_images 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update product images" ON product_images 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete product images" ON product_images 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- STEP 5: Fix product_inventory table RLS
ALTER TABLE product_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view inventory" ON product_inventory;
DROP POLICY IF EXISTS "Admins can manage inventory" ON product_inventory;
DROP POLICY IF EXISTS "Admins can insert inventory" ON product_inventory;
DROP POLICY IF EXISTS "Admins can update inventory" ON product_inventory;
DROP POLICY IF EXISTS "Admins can delete inventory" ON product_inventory;

CREATE POLICY "Anyone can view inventory" ON product_inventory 
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert inventory" ON product_inventory 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update inventory" ON product_inventory 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete inventory" ON product_inventory 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- STEP 6: Verify everything is set up correctly
SELECT 'Checking user_roles...' as status;
SELECT * FROM user_roles WHERE user_id = 'e1ca15dd-ceb2-4191-a1d7-8aec75896d4a';

SELECT 'Checking RLS policies for products...' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('products', 'product_images', 'product_inventory', 'user_roles');

SELECT 'All RLS policies fixed! You can now manage products from the admin panel.' as result;
