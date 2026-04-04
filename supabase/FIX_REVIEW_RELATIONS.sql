-- 1. Ensure the 'reviews' table has a proper foreign key to 'profiles'
-- This is NECESSARY for Supabase to join the tables in a single query
-- (Run this in your Supabase SQL Editor)

ALTER TABLE public.reviews
DROP CONSTRAINT IF EXISTS reviews_user_id_fkey,
ADD CONSTRAINT reviews_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id) 
  ON DELETE SET NULL;

-- 2. Verify that the join works by running this test query:
-- SELECT r.*, p.full_name 
-- FROM reviews r 
-- JOIN profiles p ON r.user_id = p.id 
-- LIMIT 5;
