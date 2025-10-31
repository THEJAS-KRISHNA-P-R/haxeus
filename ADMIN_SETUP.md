# Admin Panel Setup Guide

## 🎯 Overview

A complete admin panel has been added to your HAXEUZ e-commerce store. The admin panel includes:

- **Dashboard**: Sales overview, recent orders, low stock alerts, revenue statistics
- **Product Management**: Add, edit, delete products with inventory control
- **Order Management**: View all orders, update order status, track shipments
- **User Management**: (Placeholder - coming soon)
- **Settings**: (Placeholder - coming soon)

## 📋 Setup Steps

### 1. Update Supabase Schema

First, you need to run the updated schema in Supabase SQL Editor:

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase/schema.sql` from your project
4. Copy and paste the entire content into the SQL Editor
5. Click **Run** to execute

This will create:
- `user_roles` table for admin access control
- Updated RLS policies for admin-only operations
- Helper function `is_admin()` for role checking

### 2. Create Your First Admin User

After running the schema, you need to make yourself an admin:

1. Sign up for an account on your website (if you haven't already)
2. Go to Supabase Dashboard → **Authentication** → **Users**
3. Copy your user's UUID (the `id` field)
4. Go to **SQL Editor** and run this query:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR_USER_UUID_HERE', 'admin')
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';
```

Replace `YOUR_USER_UUID_HERE` with your actual UUID.

### 3. Access the Admin Panel

Once you're set up as an admin:

1. Make sure you're logged in to your account
2. Navigate to: `http://localhost:3000/admin`
3. You should see the admin dashboard!

## 🔐 Security Features

### Row Level Security (RLS)

The admin panel uses Supabase RLS policies to ensure:

- Only admins can create, update, or delete products
- Only admins can view all orders and update order statuses
- Regular users can only see their own orders
- Guest users have no access to admin features

### Access Control

The admin layout (`app/admin/layout.tsx`) automatically:
- Checks if the user is logged in
- Verifies the user has admin role
- Redirects unauthorized users to the home page or login

## 📊 Features Breakdown

### Dashboard (`/admin`)
- Total products count
- Total orders and pending orders count
- Total revenue calculation
- Low stock alerts (products with stock < 20)
- Recent orders list with quick view

### Product Management (`/admin/products`)
- **List View**: Search, filter, and view all products
- **Add Product** (`/admin/products/new`): Create new products
- **Edit Product** (`/admin/products/[id]/edit`): Update existing products
- Features:
  - Image uploads (front and back)
  - Price and stock management
  - Size and color variants
  - Category assignment
  - Low stock indicators

### Order Management (`/admin/orders`)
- **List View**: 
  - Search by order ID
  - Filter by status (pending, processing, shipped, delivered, cancelled)
  - View order summary statistics
- **Order Detail** (`/admin/orders/[id]`):
  - View all order items with images
  - Update order status
  - View shipping address
  - Order history and timestamps

## 🚀 Making Multiple Admins

To make other users admins, an existing admin can use the helper function in code or run the SQL query:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('TARGET_USER_UUID', 'admin')
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';
```

Or programmatically using the `makeAdmin()` function from `lib/admin.ts`:

```typescript
import { makeAdmin } from "@/lib/admin"

// Only callable by existing admins
await makeAdmin("target-user-uuid")
```

## 🎨 UI Components Used

The admin panel uses your existing Shadcn UI components:
- Card, Button, Input, Label, Textarea
- Table, Badge, Alert Dialog
- Select, Dropdown Menu
- Lucide React icons

## 📱 Responsive Design

The admin panel is fully responsive:
- Collapsible sidebar on mobile
- Touch-friendly buttons and controls
- Optimized layouts for tablets and phones

## 🔧 Customization

### Adding New Admin Features

To add new admin pages:

1. Create a new folder in `app/admin/`
2. Add a `page.tsx` file
3. Update the navigation in `app/admin/layout.tsx`

Example:
```tsx
{ href: "/admin/analytics", icon: BarChart, label: "Analytics" }
```

### Modifying Permissions

Edit the RLS policies in `supabase/schema.sql`:

```sql
-- Example: Allow admins to do something
CREATE POLICY "Admins can do X" ON table_name
FOR SELECT
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));
```

## 🐛 Troubleshooting

### "Not authorized" errors

1. Make sure you've run the updated `supabase/schema.sql`
2. Verify your user has an entry in `user_roles` table with `role = 'admin'`
3. Try logging out and logging back in

### Can't see admin panel

1. Check if you're logged in
2. Verify you're navigating to `/admin` exactly
3. Check browser console for errors
4. Ensure Supabase credentials in `.env.local` are correct

### Products/Orders not loading

1. Verify RLS policies are created correctly
2. Check Supabase logs in Dashboard → Logs
3. Open browser DevTools → Network tab to see API errors

## 📝 Next Steps

Future enhancements to consider:

1. **User Management**: 
   - View all registered users
   - Promote users to admin
   - Ban/suspend users

2. **Analytics**:
   - Sales charts and graphs
   - Customer behavior tracking
   - Popular products report

3. **Settings**:
   - Payment gateway configuration
   - Shipping method setup
   - Email template editor
   - Tax rate management

4. **Bulk Operations**:
   - Bulk product import/export (CSV)
   - Bulk order status updates
   - Inventory adjustments

## 📚 File Structure

```
app/admin/
├── layout.tsx          # Admin layout with sidebar
├── page.tsx            # Dashboard
├── products/
│   ├── page.tsx        # Product list
│   ├── new/
│   │   └── page.tsx    # Add product
│   └── [id]/
│       └── edit/
│           └── page.tsx # Edit product
├── orders/
│   ├── page.tsx        # Order list
│   └── [id]/
│       └── page.tsx    # Order detail
├── users/
│   └── page.tsx        # User management (placeholder)
└── settings/
    └── page.tsx        # Settings (placeholder)

lib/
└── admin.ts            # Admin utility functions
```

## 🎉 You're All Set!

Your admin panel is ready to use. Start managing your products and orders with ease!

Need help? Check the console logs or Supabase documentation.
