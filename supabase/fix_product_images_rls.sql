-- FIX: Add RLS policies for product_images and product_inventory
-- Run this in Supabase SQL Editor to fix permission issues

-- Enable RLS on product_images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (won't error if they don't exist)
DROP POLICY IF EXISTS "Anyone can view product images" ON product_images;
DROP POLICY IF EXISTS "Admins can insert product images" ON product_images;
DROP POLICY IF EXISTS "Admins can update product images" ON product_images;
DROP POLICY IF EXISTS "Admins can delete product images" ON product_images;

-- Anyone can view product images
CREATE POLICY "Anyone can view product images" 
ON product_images FOR SELECT 
USING (true);

-- Only admins can insert product images
CREATE POLICY "Admins can insert product images" 
ON product_images FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Only admins can update product images
CREATE POLICY "Admins can update product images" 
ON product_images FOR UPDATE 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Only admins can delete product images
CREATE POLICY "Admins can delete product images" 
ON product_images FOR DELETE 
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
