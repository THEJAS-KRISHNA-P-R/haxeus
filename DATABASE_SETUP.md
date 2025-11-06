# 🗄️ DATABASE SETUP GUIDE

## ⚠️ IMPORTANT: Run in This Order!

Execute these SQL files in Supabase SQL Editor **in this exact order**:

---

## 📋 Step-by-Step Instructions

### **Step 1: Create User Roles Table**
**File:** `FIRST_RUN_THIS.sql`

This creates the basic `user_roles` table that other files depend on.

```sql
-- Copy and paste the contents of FIRST_RUN_THIS.sql
```

**Expected result:** ✅ `user_roles` table created

---

### **Step 2: Create All E-Commerce Tables** 
**File:** `complete_ecommerce_schema.sql`

This creates 30+ tables for:
- Products & Inventory
- Orders & Cart
- Reviews & Ratings
- Abandoned Carts
- Coupons & Loyalty
- Returns & Exchanges
- Analytics
- Search
- Wishlist
- Recommendations

```sql
-- Copy and paste the contents of complete_ecommerce_schema.sql
```

**Expected result:** ✅ 30+ tables created

---

### **Step 3: Setup Email System**
**File:** `email_setup.sql`

Creates tables for:
- Email queue
- Newsletter subscribers
- Email templates

```sql
-- Copy and paste the contents of email_setup.sql
```

**Expected result:** ✅ Email tables created with sample templates

---

### **Step 4: Make Yourself Admin (Optional)**
**File:** `make_admin.sql`

Replace `YOUR_USER_EMAIL` with your actual email:

```sql
-- First, find your user ID
SELECT id, email FROM auth.users;

-- Then insert into user_roles
INSERT INTO user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'your@email.com'),
  'admin'
)
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

**Expected result:** ✅ You have admin access

---

## 🔍 Verify Installation

Run this query to check all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see 30+ tables including:
- ✅ `abandoned_carts`
- ✅ `analytics_events`
- ✅ `cart_items`
- ✅ `coupons`
- ✅ `email_queue`
- ✅ `loyalty_points`
- ✅ `newsletter_subscribers`
- ✅ `orders`
- ✅ `product_inventory`
- ✅ `product_reviews`
- ✅ `products`
- ✅ `return_requests`
- ✅ `search_queries`
- ✅ `user_roles`
- ✅ And 20+ more...

---

## ❌ Troubleshooting

### Error: "column does not exist"
**Solution:** Make sure you ran `FIRST_RUN_THIS.sql` first

### Error: "relation does not exist"
**Solution:** Run the files in the correct order (1 → 2 → 3)

### Error: "permission denied"
**Solution:** Make sure you're using the Supabase SQL Editor (not direct database access)

---

## 🎯 Quick Setup (Copy-Paste Method)

### **Option 1: One File At A Time** (Recommended)
1. Open Supabase Dashboard → SQL Editor
2. Copy `FIRST_RUN_THIS.sql` → Paste → Run ✅
3. Copy `complete_ecommerce_schema.sql` → Paste → Run ✅
4. Copy `email_setup.sql` → Paste → Run ✅
5. Update and run `make_admin.sql` → Run ✅

### **Option 2: All At Once** (Advanced)
1. Combine all files in order into one
2. Run in SQL Editor
3. Check for errors

---

## 📊 What Each File Does

| File | Purpose | Tables Created | Required? |
|------|---------|---------------|-----------|
| `FIRST_RUN_THIS.sql` | Base setup | 1 | ✅ Yes |
| `complete_ecommerce_schema.sql` | E-commerce features | 30+ | ✅ Yes |
| `email_setup.sql` | Email system | 3 | ✅ Yes |
| `make_admin.sql` | Admin access | 0 | Optional |
| `schema.sql` | Old version | Various | ❌ Skip this |
| `user_features_update.sql` | Old version | Various | ❌ Skip this |

---

## ✅ Success Checklist

After running all files, verify:

- [ ] Can see products table
- [ ] Can see product_inventory table
- [ ] Can see product_reviews table
- [ ] Can see abandoned_carts table
- [ ] Can see coupons table
- [ ] Can see loyalty_points table
- [ ] Can see email_queue table
- [ ] Can see newsletter_subscribers table
- [ ] Total tables: 30+
- [ ] Admin role assigned (if needed)

---

## 🚀 Next Steps

After database setup:
1. ✅ Add sample products (optional)
2. ✅ Test abandoned cart tracking
3. ✅ Deploy to production
4. ✅ Configure Vercel cron job
5. ✅ Test email sending

---

## 💡 Tips

- **Backup first:** Always backup before running SQL
- **Test queries:** Test each file individually
- **Check logs:** Review SQL Editor output for errors
- **Row Level Security:** All tables have RLS enabled
- **Admin access:** Make yourself admin for testing

---

**Need help?** Check the error message and ensure you ran files in order!
