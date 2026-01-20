# HAXEUS - Complete Documentation

Complete documentation for the HAXEUS E-Commerce Platform - A modern, high-performance platform for premium artistic T-shirts.

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation & Setup](#installation--setup)
4. [Database Setup](#database-setup)
5. [Authentication](#authentication)
6. [Admin Panel](#admin-panel)
7. [Email System](#email-system)
8. [Deployment](#deployment)
9. [Features](#features)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### Tech Stack

**Frontend:**
- Next.js 15 (App Router) with React 19
- TypeScript 5
- Tailwind CSS 3.4 + shadcn/ui
- Framer Motion for animations
- Lucide React for icons

**Backend:**
- Supabase (PostgreSQL 15)
- Supabase Auth for authentication
- Row Level Security (RLS)
- Edge Functions for serverless processing

**Features:**
- Product catalog with search & filters
- Shopping cart (localStorage + Supabase sync)
- User authentication & profiles
- Order tracking
- Wishlist functionality
- Product reviews & ratings
- Email notifications
- Loyalty program
- Coupons & discounts
- Returns & exchanges
- Admin dashboard

---

## Quick Start

### Prerequisites
- Node.js v18+
- npm v8+
- Supabase account

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/haxeus-ecommerce.git
cd haxeus-ecommerce

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Installation & Setup

### 1. Environment Variables

Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from your Supabase project dashboard:
- Go to [supabase.com](https://supabase.com)
- Create a new project
- Navigate to Project Settings → API
- Copy the URL and anon/public key

### 2. Install Dependencies

```bash
npm install
```

Key dependencies:
- `next@^15.0.0` - React framework
- `@supabase/supabase-js@^2.47.10` - Supabase client
- `framer-motion@^11.0.0` - Animations
- `tailwindcss@^3.4.1` - CSS framework

### 3. Development Server

```bash
npm run dev
```

The app will run on [http://localhost:3000](http://localhost:3000)

---

## Database Setup

### Complete Setup (One File)

The easiest way to set up your database is to run the complete setup file:

1. Open Supabase SQL Editor
2. Open `supabase/COMPLETE_DATABASE_SETUP.sql`
3. Execute the entire file
4. Done! All tables, policies, triggers, and sample data are created

This single file includes:
- User roles and authentication
- Products and inventory management
- Orders and cart functionality
- Reviews and ratings
- Email system and newsletter
- Loyalty program
- Coupons and discounts
- Returns and exchanges
- Analytics and tracking

### Make Yourself Admin

After running the database setup:

```sql
-- Get your user UUID from: Supabase Dashboard → Authentication → Users
INSERT INTO user_roles (user_id, role)
VALUES ('your-uuid-here', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Verify
SELECT * FROM user_roles WHERE role = 'admin';
```

### Database Structure

**Core Tables:**
- `user_roles` - User permissions (customer/admin)
- `products` - Product catalog
- `product_inventory` - Size-specific stock tracking
- `cart_items` - Shopping cart
- `orders` - Order records
- `order_items` - Items in each order
- `user_addresses` - Shipping addresses
- `wishlist` - Saved products

**Reviews & Ratings:**
- `product_reviews` - Customer reviews
- `review_images` - Review photos
- `review_votes` - Helpful/not helpful votes

**Email System:**
- `email_queue` - Emails to be sent
- `email_templates` - Email templates
- `newsletter_subscribers` - Newsletter list

**Marketing & Analytics:**
- `coupons` - Discount codes
- `coupon_usage` - Coupon redemptions
- `loyalty_points` - Rewards program
- `loyalty_transactions` - Points history
- `abandoned_carts` - Cart recovery
- `search_queries` - Search analytics
- `product_views` - View tracking
- `analytics_events` - General events

**Advanced Features:**
- `return_requests` - Returns & exchanges
- `return_items` - Items being returned
- `product_relations` - Recommendations
- `price_changes` - Price history

---

## Authentication

### Supabase Auth Setup

Authentication is handled by Supabase Auth with the following features:

**Supported Methods:**
- Email/Password
- Google OAuth (optional)
- Magic Links (optional)

### Configure Authentication

1. **Email/Password** (Enabled by default)
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable "Email" provider
   - Configure email templates if needed

2. **Google OAuth** (Optional)
   - Enable Google provider in Supabase
   - Add Google Client ID and Secret
   - Add authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)

3. **Email Settings**
   - Customize email templates in Authentication → Email Templates
   - Set up SMTP for custom email domain (optional)

### User Flow

1. **Sign Up**: `/auth` with email/password or Google
2. **Sign In**: `/auth` with credentials
3. **Email Verification**: Automatic email sent
4. **Password Reset**: Click "Forgot Password"
5. **Profile**: `/profile` to manage account

### Protected Routes

Routes that require authentication:
- `/cart` - Shopping cart (guests can browse, login to checkout)
- `/profile` - User profile and settings
- `/orders` - Order history
- `/admin/*` - Admin dashboard

---

## Admin Panel

### Access Admin Panel

1. **Make yourself admin** (see Database Setup above)
2. Sign in to your account
3. Visit `/admin` 
4. You should now see the admin dashboard

### Admin Features

**Product Management:** (`/admin/products`)
- Add new products
- Edit product details
- Update pricing
- Manage inventory
- Upload product images

**Order Management:** (`/admin/orders`)
- View all orders
- Update order status
- Add tracking information
- Process refunds

**User Management:** (`/admin/users`)
- View all users
- Assign admin roles
- View user orders

**Settings:** (`/admin/settings`)
- Site configuration
- Email templates
- Coupon management

### Admin Permissions

Admins can:
- View all orders (customers see only their own)
- Create, edit, and delete products
- Update order statuses
- View analytics
- Manage users and roles
- Access email queue

Permissions are enforced via Row Level Security (RLS) policies.

---

## Email System

### Email Setup

The email system uses Supabase Edge Functions to send emails asynchronously.

**Email Types:**
- `welcome` - Sent when user signs up
- `order_confirmation` - Sent when order is placed
- `shipping_update` - Sent when order status changes
- `newsletter_welcome` - Sent when subscribing to newsletter

### Configure Email Provider

#### Option 1: Resend (Recommended)

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add to Edge Function environment:
   ```bash
   RESEND_API_KEY=re_your_api_key_here
   ```

#### Option 2: SendGrid

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Get your API key
3. Add to Edge Function environment:
   ```bash
   SENDGRID_API_KEY=SG.your_api_key_here
   ```

### Welcome Email Trigger

The welcome email is automatically queued when a user signs up via a database trigger:

```sql
-- Already included in COMPLETE_DATABASE_SETUP.sql
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION queue_welcome_email();
```

### Manual Email Queue

To manually queue an email:

```sql
INSERT INTO email_queue (
  email_type, 
  recipient_email, 
  recipient_name, 
  subject, 
  template_data, 
  status
) VALUES (
  'order_confirmation',
  'customer@example.com',
  'John Doe',
  'Order Confirmation #12345',
  '{"orderId": "12345", "totalAmount": "2999"}'::jsonb,
  'pending'
);
```

### Email Processing

Process pending emails using the Edge Function:

```bash
# Deploy Edge Function
supabase functions deploy process-emails

# Set up cron job (optional)
# Supabase Dashboard → Edge Functions → Cron Jobs
# Schedule: */5 * * * * (every 5 minutes)
```

---

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
     ```
   - Click "Deploy"

3. **Configure Domain:**
   - Add custom domain in Vercel settings
   - Update DNS records as instructed

### Deploy to Netlify

1. **Build Settings:**
   ```toml
   # netlify.toml (already included)
   [build]
     command = "npm run build"
     publish = ".next"
   
   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

2. **Deploy:**
   - Connect repository to Netlify
   - Add environment variables
   - Deploy

### Environment Variables

Required for all deployments:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Optional for email:

```env
RESEND_API_KEY=re_your_key (for Edge Functions)
```

---

## Features

### Shopping Experience

**Product Catalog:**
- Browse all products
- Search by name/description
- Filter by price range
- Sort by price/name/date
- View product details
- Multiple product images
- Size selection

**Shopping Cart:**
- Add/remove items
- Update quantities
- Size selection
- Persistent cart (localStorage for guests)
- Synced with Supabase for logged-in users
- Cart total calculation

**Checkout:**
- Guest checkout or login
- Address management
- Apply coupon codes
- Order summary
- Order confirmation email

**Order Tracking:**
- View order history
- Track order status
- View order details
- Download invoices (coming soon)

### User Features

**Authentication:**
- Email/password signup
- Google OAuth (optional)
- Email verification
- Password reset
- Secure session management

**User Profile:**
- Update account details
- Manage addresses
- View order history
- Manage wishlist
- View loyalty points

**Wishlist:**
- Save favorite products
- Add to cart from wishlist
- Price drop notifications
- Back in stock alerts

**Reviews:**
- Rate products (1-5 stars)
- Write reviews
- Upload photos
- Verified purchase badge
- Helpful/not helpful votes

### Admin Features

**Dashboard:**
- Sales overview
- Recent orders
- Low stock alerts
- Analytics

**Product Management:**
- CRUD operations
- Bulk upload (coming soon)
- Inventory tracking
- Size/color variants

**Order Management:**
- View all orders
- Update status
- Add tracking
- Process returns

**Customer Management:**
- View customers
- Order history
- Assign roles

### Marketing & Loyalty

**Coupons:**
- Percentage discounts
- Fixed amount discounts
- Minimum purchase requirements
- Usage limits
- Expiration dates

**Loyalty Program:**
- Earn points on purchases (1 point per ₹10)
- Redeem points for discounts
- Tier system (bronze/silver/gold/platinum)
- Points history

**Newsletter:**
- Subscribe form
- Email campaigns
- Unsubscribe option
- Subscriber management

### Performance

- **Code Splitting**: Optimized bundle sizes
- **Image Optimization**: Next.js Image with AVIF/WebP
- **Lazy Loading**: Load images on demand
- **GPU Acceleration**: Hardware-accelerated animations
- **Caching**: Efficient data caching
- **SSR**: Server-side rendering for SEO

---

## Troubleshooting

### Common Issues

#### Database Connection Errors

**Error:** `Invalid API key`
```bash
# Solution:
# 1. Check .env.local has correct SUPABASE credentials
# 2. Verify keys in Supabase Dashboard → Settings → API
# 3. Restart dev server after changing .env.local
```

**Error:** `row-level security policy violation`
```bash
# Solution:
# 1. Run COMPLETE_DATABASE_SETUP.sql again
# 2. Verify RLS policies exist: Supabase → Database → Policies
# 3. Check if user is authenticated for protected operations
```

#### Build Errors

**Error:** `Module not found`
```bash
# Solution:
npm install
rm -rf .next
npm run dev
```

**Error:** `Type error in TypeScript`
```bash
# Solution:
npm run lint
# Fix type errors or add @ts-ignore if necessary
```

#### Email Not Sending

**Problem:** Welcome email not received
```bash
# Solution:
# 1. Check email_queue table has pending emails
SELECT * FROM email_queue WHERE status = 'pending';

# 2. Verify Edge Function is deployed
# 3. Check Supabase logs for errors
# 4. Ensure RESEND_API_KEY is set
```

#### Authentication Issues

**Problem:** Can't sign in
```bash
# Solution:
# 1. Verify email is confirmed
# 2. Check Supabase → Authentication → Users
# 3. Try password reset
# 4. Clear browser cache/cookies
```

**Problem:** Not redirected after login
```bash
# Solution:
# 1. Check redirect URL in auth callback
# 2. Verify SUPABASE_URL is correct
# 3. Check browser console for errors
```

#### Admin Access

**Problem:** Can't access /admin
```bash
# Solution:
# 1. Verify you're in user_roles table as admin:
SELECT * FROM user_roles WHERE user_id = auth.uid();

# 2. If not, run:
INSERT INTO user_roles (user_id, role)
VALUES ('your-uuid', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

#### Performance Issues

**Problem:** Slow page loads
```bash
# Solution:
# 1. Enable image optimization in next.config.mjs
# 2. Use lazy loading for images
# 3. Check network tab for large bundles
# 4. Optimize database queries
# 5. Enable caching in production
```

**Problem:** High memory usage
```bash
# Solution:
# 1. Clear node_modules and reinstall
npm ci

# 2. Check for memory leaks in useEffect hooks
# 3. Reduce bundle size with tree shaking
```

### Getting Help

1. **Check Logs:**
   - Browser DevTools Console
   - Supabase Dashboard → Logs
   - Vercel/Netlify deployment logs

2. **Debug Mode:**
   ```bash
   # Enable verbose logging
   NEXT_PUBLIC_DEBUG=true npm run dev
   ```

3. **Database Inspection:**
   ```sql
   -- Check table exists
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   
   -- Check RLS policies
   SELECT * FROM pg_policies;
   ```

---

## Project Structure

```
haxeus-v26/
├── app/                          # Next.js App Router
│   ├── about/page.tsx           # About page
│   ├── admin/                   # Admin dashboard
│   │   ├── layout.tsx          # Admin layout
│   │   ├── page.tsx            # Admin home
│   │   ├── orders/             # Order management
│   │   ├── products/           # Product management
│   │   ├── settings/           # Settings
│   │   └── users/              # User management
│   ├── api/                     # API routes
│   │   ├── cron/               # Cron jobs
│   │   └── process-emails/     # Email processing
│   ├── auth/                    # Authentication
│   │   ├── callback/           # OAuth callback
│   │   └── page.tsx            # Login/signup
│   ├── cart/page.tsx            # Shopping cart
│   ├── checkout/page.tsx        # Checkout flow
│   ├── contact/page.tsx         # Contact page
│   ├── orders/                  # Order pages
│   │   ├── [id]/page.tsx       # Order details
│   │   └── page.tsx            # Order list
│   ├── products/                # Product pages
│   │   ├── [id]/page.tsx       # Product details
│   │   └── page.tsx            # Product list
│   ├── profile/                 # User profile
│   │   ├── addresses/          # Address management
│   │   └── page.tsx            # Profile home
│   ├── error.tsx                # Error boundary
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── not-found.tsx            # 404 page
│   └── page.tsx                 # Landing page
│
├── components/                   # React components
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── navbar.tsx               # Navigation bar
│   ├── footer.tsx               # Footer
│   ├── ProductDetails.tsx       # Product view
│   ├── StaggeredMenu.tsx        # Mobile menu
│   └── theme-provider.tsx       # Theme context
│
├── contexts/                     # React contexts
│   ├── CartContext.tsx          # Cart state
│   └── ThemeContext.tsx         # Theme state
│
├── hooks/                        # Custom hooks
│   ├── use-mobile.tsx           # Mobile detection
│   └── use-toast.ts             # Toast notifications
│
├── lib/                          # Utilities
│   ├── supabase.ts              # Supabase client
│   ├── utils.ts                 # Helper functions
│   ├── admin.ts                 # Admin functions
│   ├── email.ts                 # Email helpers
│   └── ...
│
├── supabase/                     # Database
│   └── COMPLETE_DATABASE_SETUP.sql  # Complete schema
│
├── public/                       # Static files
│   ├── images/                  # Product images
│   └── manifest.json            # PWA manifest
│
├── .env.local                    # Environment variables
├── next.config.mjs               # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies
└── DOCUMENTATION.md              # This file
```

---

## Development Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript check

# Database
# Run SQL files in Supabase SQL Editor
```

---

## Security Best Practices

1. **Never commit `.env.local`** - Contains sensitive keys
2. **Use RLS policies** - All tables have Row Level Security enabled
3. **Validate user input** - Always sanitize and validate
4. **Use HTTPS in production** - Enforce secure connections
5. **Keep dependencies updated** - Run `npm audit` regularly
6. **Limit admin access** - Only trusted users should have admin role
7. **Monitor logs** - Check Supabase logs for suspicious activity
8. **Use strong passwords** - Enforce password requirements
9. **Enable 2FA** - For admin accounts (via Supabase)
10. **Regular backups** - Backup database regularly

---

## Performance Optimization

**Already Implemented:**
- Code splitting with Next.js
- Image optimization (AVIF/WebP)
- Lazy loading
- GPU-accelerated animations
- Font optimization
- Tree shaking
- Minification

**Additional Tips:**
- Use CDN for static assets
- Enable caching headers
- Compress images before upload
- Use database indexes (already added)
- Monitor Core Web Vitals
- Optimize database queries

---

## Support & Resources

**Documentation:**
- Next.js: [nextjs.org/docs](https://nextjs.org/docs)
- Supabase: [supabase.com/docs](https://supabase.com/docs)
- Tailwind CSS: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- Framer Motion: [framer.com/motion](https://framer.com/motion)

**Community:**
- Next.js Discord
- Supabase Discord
- Stack Overflow

---

**Last Updated:** January 2026  
**Version:** 26  
**Built with ❤️ for HAXEUS**
