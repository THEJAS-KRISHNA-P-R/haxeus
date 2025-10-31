# 🚀 SETUP INSTRUCTIONS - READ THIS FIRST!

## Step 1: Set up Supabase Database

1. Go to your Supabase project: https://hexzhuaifunjowwqkxcy.supabase.co
2. Click on "SQL Editor" in the left sidebar
3. Create a new query
4. Copy and paste the entire contents of `supabase/schema.sql`
5. Click "RUN" to execute the SQL

This will create:
- ✅ Products table with sample data
- ✅ Cart items table
- ✅ Orders table
- ✅ Order items table
- ✅ Proper indexes for performance
- ✅ Row Level Security (RLS) policies

## Step 2: Verify Tables Created

After running the SQL, go to "Table Editor" and you should see:
- products (with 6 sample products)
- cart_items
- orders
- order_items

## Step 3: Test the Cart

1. Open your app: http://localhost:3000
2. Browse products: http://localhost:3000/products
3. Click on any product
4. Select a size
5. Click "Add to Cart"
6. Check cart: http://localhost:3000/cart

## What Changed?

### ✅ No Backend Needed!
- Removed Django backend completely
- Direct Supabase connection from Next.js frontend
- Works for both authenticated users and guests

### ✅ Clean Architecture
- `lib/supabase.ts` - Database connection & types
- `contexts/CartContext.tsx` - Cart state management
- All product pages use Supabase directly

### ✅ Features
- Guest cart (localStorage)
- Authenticated cart (Supabase)
- Auto-sync when logging in
- Real-time updates

## Troubleshooting

### If cart doesn't work:
1. Check browser console for errors
2. Verify Supabase tables exist
3. Check RLS policies are enabled
4. Make sure you ran the SQL schema

### If products don't load:
- Don't worry! Static fallback data is included
- Products will still show even without Supabase

### Need to add products?
Use Supabase Table Editor to add products manually, or use the admin page (coming next)

## Next Steps (Optional)

Want an admin panel to manage products?
Let me know and I'll create a simple admin interface!
