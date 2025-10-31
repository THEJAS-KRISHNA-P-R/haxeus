-- ADMIN PANEL SETUP SCRIPT
-- Run this in Supabase SQL Editor after running schema.sql

-- Step 1: Find your user ID
-- Go to Supabase Dashboard → Authentication → Users
-- Copy your user's UUID (the 'id' column)

-- Step 2: Make yourself an admin
-- Replace 'YOUR_USER_UUID_HERE' with your actual UUID from step 1
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR_USER_UUID_HERE', 'admin')
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';

-- Step 3: Verify it worked
-- This should return your user with role = 'admin'
SELECT * FROM user_roles WHERE role = 'admin';

-- Optional: Make another user an admin
-- Replace with their UUID
-- INSERT INTO user_roles (user_id, role)
-- VALUES ('ANOTHER_USER_UUID', 'admin')
-- ON CONFLICT (user_id) 
-- DO UPDATE SET role = 'admin';

-- Done! Now you can access /admin in your app
