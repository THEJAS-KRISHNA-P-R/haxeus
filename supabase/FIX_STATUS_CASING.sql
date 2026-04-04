-- Run this in your Supabase SQL Editor to normalize existing data
-- This ensures that legacy "Delivered" or "Paid" statuses are converted to "delivered" and "paid"
-- This will unlock reviews and fix analytics for all existing orders

-- 1. Normalize Order Statuses
UPDATE orders 
SET status = LOWER(status) 
WHERE status IS NOT NULL;

-- 2. Normalize Payment Statuses (if any)
UPDATE orders 
SET payment_status = LOWER(payment_status) 
WHERE payment_status IS NOT NULL;

-- 3. Verify changes
SELECT id, status, payment_status FROM orders LIMIT 10;
