# 🚀 Deployment Guide for HAXEUZ E-commerce

## Prerequisites
- Node.js 18+ installed
- Supabase account and project
- Vercel account (recommended) or other hosting platform
- Django backend deployed (if using backend features)

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Setup

Create a `.env.local` file (already created, but update for production):

```bash
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_anon_key
NEXT_PUBLIC_API_URL=your_backend_api_url
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 2. Supabase Database Setup

Run the SQL script to create all necessary tables:

```sql
-- Use the supabase_setup.sql file in the root directory
-- Execute it in your Supabase SQL Editor
```

Tables created:
- `products` - Product catalog
- `cart_items` - User shopping carts
- `orders` - Order records
- `order_items` - Order line items
- `user_addresses` - Shipping addresses
- `wishlist_items` - User wishlists
- `email_queue` - Email queue system
- `newsletter_subscribers` - Newsletter subscriptions
- `email_templates` - Email templates

### 3. Upload Product Images

Ensure all images exist in `/public/images/`:
- busted-front.jpg
- busted-back.jpg
- save-flower-front.jpg
- save-flower-back.jpg
- statue-front.jpg
- statue-back.jpg
- ufo-front.jpg
- ufo-back.jpg
- soul-front.jpg
- soul-back.jpg

## 🌐 Deploy to Vercel (Recommended)

### Option 1: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production
vercel --prod
```

### Option 2: Using Vercel Dashboard

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: **Next.js**
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **Add Environment Variables:**
   In Vercel Project Settings → Environment Variables, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL` (if using backend)
   - `NEXT_PUBLIC_SITE_URL`

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live at `your-project.vercel.app`

## 🐳 Alternative: Deploy to Other Platforms

### Netlify
```bash
npm run build
# Upload the .next folder
```

### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

### Docker (Self-hosted)
```dockerfile
# Create Dockerfile (example provided in repo)
docker build -t haxeuz .
docker run -p 3000:3000 haxeuz
```

## 🔧 Post-Deployment Configuration

### 1. Update Supabase Auth Settings
- Go to Supabase Dashboard → Authentication → URL Configuration
- Add your production URL to:
  - Site URL: `https://yourdomain.com`
  - Redirect URLs: `https://yourdomain.com/auth/callback`

### 2. Configure Google OAuth
- Go to Google Cloud Console
- Update OAuth redirect URIs:
  - Add: `https://your-supabase-project.supabase.co/auth/v1/callback`
  - Add: `https://yourdomain.com/auth/callback`

### 3. Test Core Features
- ✅ User registration and login
- ✅ Google OAuth sign-in
- ✅ Add products to cart
- ✅ Add products to wishlist
- ✅ Checkout process
- ✅ Dark mode toggle
- ✅ Email notifications (if configured)

## 🎯 Performance Optimization

Already configured in `next.config.mjs`:
- ✅ Image optimization with Next.js Image
- ✅ Code splitting and lazy loading
- ✅ CSS optimization
- ✅ Console removal in production
- ✅ Compression enabled
- ✅ SWC minification

## 🔒 Security Checklist

- ✅ Environment variables not exposed
- ✅ HTTPS enforced
- ✅ Security headers configured
- ✅ Supabase Row Level Security (RLS) enabled
- ✅ API keys stored securely
- ✅ CORS properly configured

## 📊 Monitoring & Analytics

### Add Analytics (Optional)
```typescript
// Add to app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Vercel Speed Insights
```bash
npm install @vercel/speed-insights
```

## 🆘 Troubleshooting

### Build Errors
- Check all environment variables are set
- Ensure all dependencies are in `package.json`
- Run `npm install` to refresh dependencies
- Clear `.next` folder and rebuild

### Database Errors
- Verify Supabase connection URL
- Check RLS policies are configured
- Ensure all tables exist

### Image Loading Issues
- Verify images exist in `/public/images/`
- Check image paths are correct
- Add domains to `next.config.mjs` if using external images

## 📞 Support
For deployment issues, check:
- Vercel Deployment Logs
- Supabase Database Logs
- Browser Console Errors

## 🎉 Success!
Your HAXEUZ e-commerce site is now live!

**Live URL:** `https://your-project.vercel.app`

---

Made with ❤️ by HAXEUZ Team
