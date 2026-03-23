# 🚀 HAXEUS - Complete Deployment & GA4 Setup Guide

**Last Updated:** March 23, 2026  
**Status:** ✅ Ready for Production  
**GA4 ID:** G-NEFJJ5K2BY  
**Site URL:** https://haxeus.in

---

## 📋 TABLE OF CONTENTS

1. [⚡ QUICK START - Do This First](#quick-start)
2. [📚 What is GA4?](#what-is-ga4)
3. [✅ Pre-Deployment Checklist](#pre-deployment-checklist)
4. [🔧 GA4 Event Tracking Implementation](#ga4-event-tracking)
5. [🚀 Vercel Deployment Steps](#vercel-deployment)
6. [🤝 Agency GA4 Access Setup](#agency-setup)
7. [🔍 Verification & Testing](#verification)
8. [🛠️ Environment Variables Reference](#environment-variables)
9. [❓ Troubleshooting](#troubleshooting)

---

## <a id="quick-start"></a>⚡ QUICK START - DO THIS NOW

### Step-by-Step (15 minutes)

```
☐ Step 1: Get Razorpay Keys (5 min)
   → Go: https://dashboard.razorpay.com/app/keys
   → Copy: Key ID (rzp_live_...)
   → Copy: Key Secret
   → Copy: Webhook Secret
   
☐ Step 2: Create Vercel Account (5 min)
   → Go: https://vercel.com
   → Sign up with GitHub
   
☐ Step 3: Deploy (5 min)
   → Click "Import Project"
   → Select HAXEUS GitHub repo
   → Add environment variables (see section 8)
   → Click Deploy

☐ Step 4: Verify (5 min)
   → Visit https://haxeus.vercel.app
   → Open DevTools (F12)
   → Type: window.gtag
   → Should show: ƒ gtag() {...}
```

**Then read the detailed sections below for complete setup.**

---

## <a id="what-is-ga4"></a>📚 WHAT IS GA4?

### In Simple Terms
GA4 (Google Analytics 4) tracks how users interact with your website. It shows you:
- How many people visit
- What products they look at
- What they buy
- Where they come from (especially Google)

### Why You Need It

**Your Current Setup:**
- ✅ Vercel Analytics → Tracks page speed & performance
- ✅ Supabase → Stores your data
- ❌ Missing: Marketing insights, SEO tracking

**What GA4 Adds:**
- User behavior tracking
- E-commerce insights (revenue, products, conversions)
- Organic search tracking (for SEO agency)
- Audience creation (for marketing)
- Google Ads integration
- Free data export

### Key Features

| Feature | What It Does | Why It Matters |
|---------|-------------|----------------|
| **Real-time** | See active users now | Verify changes work immediately |
| **E-Commerce** | Track purchases & revenue | Know what sells |
| **Organic Search** | See Google search traffic | SEO agency needs this |
| **Core Web Vitals** | Monitor page speed | Impacts Google rankings |
| **Events** | Track specific actions | Understand user journey |
| **Audiences** | Create user segments | Retargeting, personalization |

### Side Effects

| Impact | Details | How We Handle |
|--------|---------|---------------|
| **Performance** | +55KB, ~100ms load time | Already configured to load async |
| **Cookies** | GA4 sets 3 cookies | Must disclose in privacy policy |
| **Ad Blockers** | Some users won't be tracked | Normal, 5-10% variance expected |
| **Privacy** | Data stored on Google servers | Configure retention (4 months) |

### GA4 Pros ✅

1. **Free & Unlimited** - No cost, handles any traffic
2. **E-Commerce Ready** - Built for online stores
3. **SEO Integration** - Google Search Console connection
4. **Real-time** - See activity as it happens
5. **Easy Sharing** - Grant agency access quickly

### GA4 Cons ❌

1. **Privacy Setup** - Need GDPR/CCPA compliance forms
2. **Learning Curve** - Different from old Google Analytics
3. **Implementation** - Need to add event tracking code
4. **Data Differences** - 10-20% variance vs Supabase normal

---

## <a id="pre-deployment-checklist"></a>✅ PRE-DEPLOYMENT CHECKLIST

### Task 1: Update Privacy Policy

Add this to `/app/privacy-policy/page.tsx`:

```markdown
### Analytics & Tracking

We use Google Analytics 4 (GA4) to understand how visitors use our site. 
GA4 collects information about:
- Pages visited and time spent browsing
- User interactions (clicks, form submissions, purchases)
- Device type and browser information
- Approximate geographic location
- E-commerce data (products viewed, items purchased, revenue)

**Your Data Privacy:**
- GA4 data is transferred to Google servers (US data centers)
- We do not use Google's advertising features
- Data is retained for 14 months
- You can disable tracking with browser's "Do Not Track" setting

**Your Privacy Rights:**
Users can opt-out by:
1. Enabling "Do Not Track" in browser settings
2. Using privacy extensions (uBlock Origin, Privacy Badger)
3. Visiting Google's opt-out page: https://tools.google.com/dlpage/gaoptout
```

### Task 2: Add GA4 Disclosure to Terms & Conditions

Add this to `/app/terms-conditions/page.tsx`:

```markdown
### Analytics Consent

By using HAXEUS, you consent to data collection by Google Analytics 4 
for the purposes of improving our website and understanding user behavior. 
No personal information is collected for advertising purposes.
```

### Task 3: Verify Robots.txt & Sitemap

Already configured, verify they work:

```bash
# Should be accessible
https://haxeus.in/robots.txt
https://haxeus.in/sitemap.xml
```

Configured in:
- `app/robots.ts` → Allows Google to crawl
- `app/sitemap.ts` → Lists all pages

### Task 4: Set Up Google Search Console (After Deployment)

This helps Google index your site faster:

1. Go to https://search.google.com/search-console
2. Click "Add Property"
3. Enter `https://haxeus.in`
4. Verify ownership (choose DNS method if possible)
5. Submit sitemap: `/sitemap.xml`
6. Request crawl of homepage

---

## <a id="ga4-event-tracking"></a>🔧 GA4 EVENT TRACKING IMPLEMENTATION

### What's Ready

✅ GA4 tracking code in `lib/ga-events.ts` - 15+ event functions ready  
✅ GA4 scripts loaded in `app/layout.tsx` - Auto loads on all pages  
✅ Environment variable set - `NEXT_PUBLIC_GA4_ID=G-NEFJJ5K2BY`  
✅ Production URL configured - `NEXT_PUBLIC_SITE_URL=https://haxeus.in`

### How It Works

GA4 automatically tracks:
- ✅ Page views (all pages)
- ✅ User sessions
- ✅ Device information
- ✅ Geographic location
- ✅ Traffic sources

You need to manually track:
- 🔧 Product views
- 🔧 Add to cart
- 🔧 Remove from cart
- 🔧 Checkout start
- 🔧 Purchase (MOST IMPORTANT!)
- 🔧 Search
- 🔧 Wishlist

### Critical Events (Do These First)

#### 1️⃣ Track Product Views

**Where:** `components/ProductDetails.tsx` or your product display component

```tsx
'use client'

import { useEffect } from 'react'
import { gaCommerceEvents } from '@/lib/ga-events'

export function ProductDetails({ product }) {
  useEffect(() => {
    // Track when user views product
    gaCommerceEvents.viewItem(
      String(product.id),           // Product ID
      product.name,                 // Product name
      product.price,                // Product price
      product.category              // Optional: category
    )
  }, [product.id, product.name, product.price, product.category])

  return <div>{/* Your product UI */}</div>
}
```

#### 2️⃣ Track Add to Cart

**Where:** Your cart handler/context

```tsx
import { gaCommerceEvents } from '@/lib/ga-events'

export async function addToCart(product, quantity = 1) {
  // Track to GA4
  gaCommerceEvents.addToCart(
    String(product.id),      // Product ID
    product.name,            // Product name
    quantity,                // How many
    product.price            // Price per unit
  )

  // Then do your normal cart logic
  await updateCartInDatabase(product.id, quantity)
}
```

#### 3️⃣ Track Remove from Cart

**Where:** Your cart handler

```tsx
import { gaCommerceEvents } from '@/lib/ga-events'

export async function removeFromCart(product, quantity) {
  // Track removal
  gaCommerceEvents.removeFromCart(
    String(product.id),
    product.name,
    quantity,
    product.price
  )

  // Remove from database
  await updateCartInDatabase(product.id, 0)
}
```

#### 4️⃣ Track Checkout Start

**Where:** Checkout button/component

```tsx
import { gaCommerceEvents } from '@/lib/ga-events'

export function CheckoutButton() {
  const handleCheckout = () => {
    const items = cartItems.map(item => ({
      id: String(item.product_id),
      name: item.product_name,
      price: item.price,
      quantity: item.quantity,
    }))

    const totalValue = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    gaCommerceEvents.beginCheckout(items, totalValue)
    
    // Navigate to checkout
    router.push('/checkout')
  }

  return <button onClick={handleCheckout}>Checkout</button>
}
```

#### 5️⃣ Track Purchase (MOST CRITICAL!)

**Where:** Order success page - `app/order-success/page.tsx`

```tsx
'use client'

import { useEffect } from 'react'
import { gaCommerceEvents } from '@/lib/ga-events'

export default function OrderSuccessPage({ params }) {
  useEffect(() => {
    if (!window.gtag) return // Wait if GA4 not loaded
    
    // Track purchase
    gaCommerceEvents.purchase(
      params.orderId,                    // Order ID
      order.total_amount,                // Revenue (required!)
      order.items.map(item => ({          // Items array
        id: String(item.product_id),
        name: item.product_name,
        price: item.price,
        quantity: item.quantity,
      })),
      order.tax_amount ?? 0,              // Tax
      order.shipping_amount ?? 0,         // Shipping
      order.coupon_code                   // Coupon (optional)
    )
  }, [params.orderId])

  return <div>Order Successful!</div>
}
```

### Other Events Available

```typescript
// Search
gaCommerceEvents.search(searchTerm, resultsCount)

// Wishlist
gaCommerceEvents.addToWishlist(productId, productName, price)

// Reviews
gaCommerceEvents.reviewSubmit(productId, rating, reviewText)

// Authentication
gaCommerceEvents.sign_up('google')  // or 'email', 'phone'
gaCommerceEvents.login('google')

// Custom Events
gaEvent('custom_event_name', { key: 'value' })
```

### Implementation Priority

🔴 **DO FIRST (Today):**
- Purchase tracking (most critical for business metrics)
- Product view tracking
- Add to cart tracking

🟠 **DO WEEK 1:**
- Checkout start
- Remove from cart
- Search

🟡 **DO LATER:**
- Wishlist
- Reviews
- Login/signup

---

## <a id="vercel-deployment"></a>🚀 VERCEL DEPLOYMENT STEPS

### Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose GitHub → Authorize → Done

### Step 2: Import Project

1. Click "Add New" → "Project"
2. Click "Import Git Repository"
3. Paste your HAXEUS GitHub URL
4. Click "Import"

### Step 3: Configure Build Settings

**Vercel auto-detects Next.js** ✓

Just verify:
- Framework: Next.js
- Root Directory: ./
- Click "Continue"

### Step 4: Add Environment Variables

**CRITICAL:** Add these BEFORE deploying!

In Vercel: Project Settings → Environment Variables

```env
# ============ SITE CONFIG ============
NEXT_PUBLIC_SITE_URL=https://haxeus.in

# ============ SUPABASE (Already production) ============
NEXT_PUBLIC_SUPABASE_URL=https://hexzhuaifunjowwqkxcy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_KEY_FROM_SUPABASE]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_KEY_FROM_SUPABASE]

# ============ RAZORPAY (⚠️ UPDATE TO PRODUCTION!) ============
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_YOUR_PROD_KEY
RAZORPAY_KEY_ID=rzp_live_YOUR_PROD_KEY
RAZORPAY_KEY_SECRET=YOUR_PROD_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_PROD_WEBHOOK

# ============ RESEND (Email) ============
RESEND_API_KEY=[YOUR_KEY_FROM_RESEND]
RESEND_FROM_EMAIL=orders@haxeus.in

# ============ EMAIL ADDRESSES ============
FROM_EMAIL=orders@haxeus.in
SUPPORT_EMAIL=support@haxeus.in
UPDATES_EMAIL=updates@haxeus.in

# ============ SECURITY ============
CRON_SECRET=[YOUR_RANDOM_SECRET]
ADMIN_CACHE_SECRET=[YOUR_RANDOM_SECRET]

# ============ REDIS ============
UPSTASH_REDIS_REST_URL=https://striking-egret-58294.upstash.io
UPSTASH_REDIS_REST_TOKEN=[YOUR_TOKEN]
REDIS_URL=rediss://default:[YOUR_TOKEN]@[YOUR_URL]:6379

# ============ GA4 ANALYTICS ============
NEXT_PUBLIC_GA4_ID=G-NEFJJ5K2BY
```

Where to find each:
- **Supabase keys:** Project Settings → API → Keys
- **Razorpay keys:** https://dashboard.razorpay.com/app/keys (PRODUCTION!)
- **Resend API:** https://resend.com/api-keys
- **Upstash:** https://console.upstash.io → Redis → Details

### Step 5: Deploy

1. Click "Deploy"
2. Wait 3-5 minutes for build
3. See "Congratulations" message → deployment successful! 🎉

**Your site is now live at:** https://haxeus.vercel.app

### Step 6: Set Custom Domain (Optional but Recommended)

1. In Vercel → Project Settings → Domains
2. Click "Add" → Enter `haxeus.in`
3. Vercel shows DNS records needed

**At your domain registrar (GoDaddy, Namecheap, etc.):**

Add this DNS record:
```
Type:  CNAME
Name:  (leave blank for root)
Value: cname.vercel-dns.com
TTL:   3600
```

⏳ **Wait 24-48 hours for DNS to propagate**

Then visit: https://haxeus.in ✓

### Step 7: Verify Deployment Works

```javascript
// In browser DevTools at your production URL:

1. Open DevTools (F12)
2. Go to Console tab
3. Type: window.gtag
   → Should show: ƒ gtag() {...}
   → Means GA4 is loaded ✓

4. Type: window.dataLayer
   → Should show: Array [...]
   → Means GA4 is active ✓

5. Visit https://analytics.google.com
6. Click "Realtime"
7. Refresh your production site
8. Active user should appear in 2-5 seconds
```

---

## <a id="agency-setup"></a>🤝 AGENCY GA4 ACCESS SETUP

### Step 1: Prepare

Ask your SEO agency for their Google account email:
- Example: `sarah@seo-agency.com` or `sarah@gmail.com`

### Step 2: Invite Agency

1. Go to https://analytics.google.com
2. Click **Admin** (lower left corner)
3. In ACCOUNT column → **Account Access Management**
4. Click **⊕ Add user**
5. Paste their email
6. Select role: **Viewer** ← Recommended for SEO
   - Can see all reports
   - Cannot break anything
7. Click **Add**

Agency receives invitation email automatically.

### Step 3: Send Them Documentation

Email your agency:

```
Subject: GA4 Access Granted - HAXEUS

Hi [Agency Name],

Your GA4 access has been set up!

Property: HAXEUS
Property ID: G-NEFJJ5K2BY
Permission: Viewer
Dashboard: https://analytics.google.com/analytics/web/

What you can track:
- Organic search traffic (Google)
- Top landing pages (for link building)
- Device breakdown (mobile vs desktop)
- Core Web Vitals (page speed - impacts rankings)
- Geographic location (where users come from)
- E-commerce data (products viewed, sales)

Next: Accept the GA4 email invitation and log in.

Questions? Let me know.
```

### Step 4: Verify Agency Access

Ask them to confirm:
- [ ] GA4 invitation accepted
- [ ] Can log into GA4 dashboard
- [ ] Can see HAXEUS property
- [ ] Can view real-time data

**They'll use these reports for SEO:**

1. **Acquisition → Organic Search** → Overall SEO performance
2. **Acquisition → Landing Pages** → Which pages drive organic traffic
3. **Engagement → Pages & Screens** → Content performance (bounce rate, duration)
4. **Technology → Device** → Mobile vs desktop breakdown (mobile-first indexing)
5. **Technology → Web Vitals** → Page speed impact on rankings (CRITICAL!)
6. **Engagement → Conversion Funnel** → User journey to purchase

---

## <a id="verification"></a>🔍 VERIFICATION & TESTING

### After Deployment - Immediate Checks (5 mins)

- [ ] Site loads at production URL without errors
- [ ] All images load correctly
- [ ] Navigation works (click menu items)
- [ ] Add to cart button works
- [ ] Checkout page loads without errors
- [ ] No console errors (F12 → Console)

### GA4 Verification (5 mins)

```javascript
// In browser console at production URL:

1. window.gtag          // Should be: ƒ gtag() {...}
2. window.dataLayer     // Should be: Array [...]
3. window.gtag('event', 'test_event')  // Should work
```

### GA4 Real-time Test (2 mins)

1. Open https://analytics.google.com
2. Select HAXEUS property
3. Click **Realtime** (top menu)
4. In new tab, visit your production site
5. Refresh the production site
6. **You should see an active user appear within 2-5 seconds**

### Payment Test (5 mins)

1. Add product to cart
2. Go to checkout
3. Enter test card: `4111 1111 1111 1111`
4. Any future date & any CVV
5. Complete purchase
6. Should see "Order Successful"
7. Check:
   - [ ] Email was sent (check inbox)
   - [ ] Order appears in Supabase (admin panel)
   - [ ] GA4 shows purchase event (give it 2 minutes)

### Email Delivery Test

1. Make a test purchase
2. Check your email at `orders@haxeus.in`
3. Confirmation email should arrive within 30 seconds

### Performance Test

```javascript
// Open DevTools → Network tab
// Reload page
// Look at:
- [ ] Largest Image: < 500KB
- [ ] Total page size: < 2MB
- [ ] Page load: < 3 seconds
- [ ] GA4 script loads: ~55KB
```

### Weekly Monitoring (After Launch)

- [ ] Check GA4 daily for first week (verify data flowing)
- [ ] Monitor Vercel error logs (no red errors)
- [ ] Check payment success rate (should be >95%)
- [ ] Verify email delivery (no bounces)
- [ ] Monitor Core Web Vitals (should be "Good" in GA4)

---

## <a id="environment-variables"></a>🛠️ ENVIRONMENT VARIABLES REFERENCE

### Complete Checklist

**Copy each of these to Vercel → Project Settings → Environment Variables:**

```env
# =============== PRODUCTION SITE CONFIG ===============
NEXT_PUBLIC_SITE_URL=https://haxeus.in

# =============== SUPABASE ===============
# Get from: https://ProjectID.supabase.co/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://hexzhuaifunjowwqkxcy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]

# =============== RAZORPAY ⚠️ CRITICAL ===============
# Get from: https://dashboard.razorpay.com/app/keys
# MUST use rzp_live_ keys, NOT rzp_test_!
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_[YOUR_KEY]
RAZORPAY_KEY_ID=rzp_live_[YOUR_KEY]
RAZORPAY_KEY_SECRET=[YOUR_SECRET]
RAZORPAY_WEBHOOK_SECRET=[YOUR_WEBHOOK_SECRET]

# =============== RESEND (Email) ===============
# Get from: https://resend.com/api-keys
RESEND_API_KEY=[YOUR_API_KEY]
RESEND_FROM_EMAIL=orders@haxeus.in

# =============== EMAIL ADDRESSES ===============
FROM_EMAIL=orders@haxeus.in
SUPPORT_EMAIL=support@haxeus.in
UPDATES_EMAIL=updates@haxeus.in

# =============== SECURITY TOKENS ===============
# Generate random strings, store securely, don't share!
CRON_SECRET=[32+ character random string]
ADMIN_CACHE_SECRET=[32+ character random string]

# =============== REDIS - UPSTASH ===============
# Get from: https://console.upstash.io
UPSTASH_REDIS_REST_URL=https://striking-egret-58294.upstash.io
UPSTASH_REDIS_REST_TOKEN=[YOUR_TOKEN]
REDIS_URL=rediss://default:[TOKEN]@[URL]:6379

# =============== GA4 ANALYTICS ===============
NEXT_PUBLIC_GA4_ID=G-NEFJJ5K2BY

# =============== OPTIONAL - Google Site Verification ===============
# Only add if you get verification token from Google Search Console
# NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=[YOUR_TOKEN]
```

### How to Get Each Key

| Service | Where | How | Secret? |
|---------|-------|-----|---------|
| **Supabase** | Project Settings → API | Copy Keys section | Yes |
| **Razorpay** | https://dashboard.razorpay.com/app/keys | Production keys | Yes |
| **Resend** | https://resend.com/api-keys | Generate new key | Yes |
| **Upstash** | https://console.upstash.io | Redis Details | Yes |
| **GA4** | Not needed - already set | G-NEFJJ5K2BY | No |

### What Each Does

```
NEXT_PUBLIC_SITE_URL → Production URL for links, emails
SUPABASE_* → Database connection
RAZORPAY_* → Payment processing
RESEND_* → Email sending
SECURITY TOKENS → Protecting internal APIs
UPSTASH_REDIS → Caching layer
GA4 → Google Analytics
```

---

## <a id="troubleshooting"></a>❓ TROUBLESHOOTING

### GA4 Shows No Data

```javascript
// Check 1: Is GA4 loaded?
window.gtag              // Should exist
window.dataLayer         // Should exist
window.MEASUREMENT_ID    // Should be: G-NEFJJ5K2BY

// Check 2: Environment variable set?
// Vercel Dashboard → Project Settings → Environment Variables
// NEXT_PUBLIC_GA4_ID should equal: G-NEFJJ5K2BY

// Check 3: Did you rebuild after changing env?
// Redeploy from Vercel or restart local dev server

// Check 4: Wait 2-4 minutes
// GA4 data takes time to appear, check Realtime again
```

### Site Shows "Not Found" Error

```
Likely causes:
1. DNS not propagated yet (if using custom domain)
   → Wait 24-48 hours
   → Use https://haxeus.vercel.app temporary URL

2. Deployment failed
   → Check Vercel dashboard for errors
   → Rebuild project

3. Custom domain not configured
   → Go to Vercel → Project Settings → Domains
   → Add haxeus.in
   → Add CNAME to domain registrar
```

### Images Not Showing

```
Likely causes:
1. Image paths incorrect in code
   → Use relative paths: /images/product.jpg
   → Not absolute paths: https://haxeus.in/images/...

2. Next.js Image optimization issue
   → Check that images are in /public folder
   → Browser DevTools → Network → check 404s

3. Build didn't include images
   → Redeploy from Vercel
```

### Payment Processing Fails

```
Checks:
1. Are you using Razorpay production keys?
   → Not rzp_test_ ?
   → Production keys start with rzp_live_

2. Is Razorpay API key correct?
   → Verify in Vercel env vars
   → Check for typos/spaces

3. Is webhook secret set?
   → RAZORPAY_WEBHOOK_SECRET must exist
   → Should match Razorpay dashboard
```

### Email Not Sending

```
Checks:
1. Is Resend API key correct?
   → Should start with re_
   → No spaces or typos

2. Is from email configured?
   → RESEND_FROM_EMAIL=orders@haxeus.in
   → Must match verified sender in Resend

3. Are you sending to valid email?
   → Check email format is correct
   → Check spam folder (may arrive there)
```

### High Page Load Time

```
Checks:
1. GA4 script loading correctly?
   → Already async, shouldn't block
   → Check network tab → gtag.js loads last

2. Large images?
   → Compress images to <200KB
   → Use WebP format where possible

3. Many API calls?
   → Implement caching (Redis already there)
   → Use pagination for large lists
```

### "Connection Refused" Error

```
Likely causes:
1. Supabase not reachable
   → Check SUPABASE_URL env var
   → Verify Supabase project is running
   → Check API key is valid

2. Redis connection issue
   → Check UPSTASH_REDIS_REST_TOKEN
   → Verify token isn't expired
   → Check URL format

Solution:
   → Go to Vercel Function Logs
   → See specific error message
   → Compare env vars to credentials
```

### Receiving 502 Errors

```
This means Vercel backend crashed.

Checks:
1. Check Vercel Function Logs (Deployments → Logs)
2. Look for error stack trace
3. Common causes:
   - Environment variable missing
   - Database connection failed
   - Unhandled JavaScript error
   - Out of memory

Solution:
   - Fix the error in code
   - Redeploy
   - Monitor logs for recurrence
```

### Agency Can't Access GA4

```
Checks:
1. Did you send invitation?
   → GA4 → Admin → Account Access Management
   → Look for their email in list

2. Did they accept the email?
   → Ask them to check inbox/spam
   → Forward invitation link if needed
   → Make sure using correct Google account

3. Check their permission level
   → Should be "Viewer" for SEO agency
   → Not "Admin"

4. Wait 5 minutes
   → GA4 permissions take a moment to propagate
```

---

## 📞 QUICK REFERENCE

| Need | Location |
|------|----------|
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **GA4 Dashboard** | https://analytics.google.com |
| **Supabase Console** | https://supabase.co (select project) |
| **Razorpay** | https://dashboard.razorpay.com |
| **Upstash Redis** | https://console.upstash.io |
| **Resend** | https://resend.com |
| **Google Search Console** | https://search.google.com/search-console |
| **Deployment URL** | https://haxeus.vercel.app → then https://haxeus.in |

---

## ✅ ARE YOU READY?

- [ ] GA4 ID: G-NEFJJ5K2BY
- [ ] Production URL: https://haxeus.in
- [ ] Razorpay production keys: Ready
- [ ] Supabase keys: Ready
- [ ] Environment variables: Ready to add
- [ ] Privacy policy: Updated with GA4 disclosure
- [ ] Agency email: Ready to invite
- [ ] Testing plan: Understood

**You're ready to deploy!** 🚀

---

**Last Updated:** March 23, 2026  
**Next Steps:** Start with Step 1 in Quick Start section
