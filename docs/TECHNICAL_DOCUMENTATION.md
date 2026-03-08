# HAXEUS — Technical Documentation

## 1. Architecture Overview

HAXEUS is a server-side rendered (SSR) e-commerce application built with **Next.js 15** (App Router), **TypeScript**, and **Supabase** as the backend-as-a-service. Payments are processed via **Razorpay**. The app uses **Tailwind CSS** with a custom design system for styling and **Framer Motion** for animations.

### Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Framework      | Next.js 15 (App Router)             |
| Language       | TypeScript                          |
| Database       | PostgreSQL (via Supabase)            |
| Auth           | Supabase Auth (Email/Password, OTP) |
| Storage        | Supabase Storage (product images)    |
| Payments       | Razorpay                            |
| Rate Limiting  | Upstash Redis                       |
| Styling        | Tailwind CSS                        |
| Animations     | Framer Motion                       |
| Deployment     | Vercel                              |

### Directory Structure

```
├── app/                     # Next.js App Router pages
│   ├── admin/               # Admin dashboard (protected)
│   ├── api/                 # API routes (payment, orders, auth)
│   ├── products/[id]/       # Product detail pages (dynamic)
│   ├── checkout/            # Checkout flow
│   ├── orders/[id]/         # Order tracking
│   ├── privacy-policy/      # Legal pages
│   ├── terms-conditions/
│   ├── returns-refunds/
│   └── shipping-policy/
├── components/              # Reusable UI components
│   ├── admin/               # Admin-specific components (AdminUI)
│   ├── ui/                  # Shadcn/UI primitives
│   └── *.tsx                # Feature components
├── lib/                     # Utilities and service clients
│   ├── supabase.ts          # Supabase client initialization
│   ├── razorpay.ts          # Razorpay client
│   ├── redis.ts             # Upstash Redis rate limiter
│   ├── email.ts             # Email and newsletter service
│   ├── coupons.ts           # Coupon validation logic
│   └── utils.ts             # cn(), sanitizeText(), sanitizeEmail()
├── hooks/                   # Custom React hooks
└── docs/                    # Documentation
```

---

## 2. Authentication & Authorization

### Authentication Flow
- Uses **Supabase Auth** with `getUser()` (server-side) for secure session validation.
- `getSession()` is never used for authorization — only `getUser()`.
- Admin access is verified via the `profiles.role` column (`role === 'admin'`).

### Admin Route Protection
- `app/admin/layout.tsx` wraps all admin pages.
- A server-side `requireAdmin()` guard checks authentication and role before rendering.
- Unauthorized users are redirected to the login page.

---

## 3. Database Schema (Key Tables)

| Table                    | Purpose                                      |
|--------------------------|----------------------------------------------|
| `products`               | Product catalog (name, price, category, etc.) |
| `product_images`         | Multiple images per product                  |
| `product_inventory`      | Per-size stock tracking (size, stock_quantity) |
| `orders`                 | Order records with payment status             |
| `order_items`            | Line items per order                          |
| `profiles`               | User profiles with role (customer/admin)      |
| `user_addresses`         | Saved shipping addresses per user             |
| `coupons`                | Discount codes with validation rules          |
| `reviews`                | Product reviews with approval status          |
| `newsletter_subscribers` | Email subscriber list                         |
| `email_queue`            | Outbound email queue for processing           |

### Row Level Security (RLS)
- RLS is enabled on all public tables.
- Users can only read/write their own data (orders, addresses, profiles).
- Admin operations use the `supabaseAdmin` client (service role key, server-side only).
- The `SUPABASE_SERVICE_ROLE_KEY` is never exposed to the client.

---

## 4. Payment Integration

### Razorpay Flow
1. **Client** sends cart items + shipping address ID to `/api/payment/create-order`.
2. **Server** validates items, calculates prices server-side, creates Razorpay order.
3. **Client** opens Razorpay checkout modal with the order ID.
4. **Server** verifies payment signature at `/api/payment/verify` using HMAC-SHA256.
5. Order status is updated to `paid` only after signature verification.

### Security Measures
- Server-side price calculation (never trusts client amounts).
- CSRF origin checking on all API routes.
- Rate limiting per IP (5 req/min) and per user (10 req/5min) via Upstash Redis.
- Input validation for cart items, coupon codes, and address IDs.
- XSS sanitization on all user inputs via `sanitizeText()` and `sanitizeEmail()`.

---

## 5. Security Implementation

### XSS Protection
- `sanitizeText()` — strips all HTML tags using DOMPurify, trims, max 2000 chars.
- `sanitizeEmail()` — validates RFC format, lowercases, max 254 chars.
- Applied to: newsletter subscription, order creation address fields.

### Rate Limiting
- Implemented via `rateLimit()` function using Upstash Redis.
- Applied per-IP and per-user on payment and order endpoints.
- **Developer Experience**: In `development` mode, limits are relaxed (100 req/hour) for the Newsletter and Contact APIs to facilitate testing. In production, strict limits apply (5 for newsletter, 3 for contact).

### CSRF Protection
- Origin header validation on all POST API routes.
- Rejects requests where `origin` doesn't match `host`.

---

## 6. Admin Dashboard

### Pages
| Route                  | Component                | Data Source             |
|------------------------|-------------------------|------------------------|
| `/admin`               | `DashboardClient.tsx`   | orders, order_items     |
| `/admin/products`      | `ProductsContent.tsx`   | products, product_images|
| `/admin/orders`        | `OrdersContent.tsx`     | orders, order_items     |
| `/admin/users`         | `CustomersContent.tsx`  | profiles                |
| `/admin/coupons`       | `CouponsContent.tsx`    | coupons                 |
| `/admin/reviews`       | `ReviewsContent.tsx`    | reviews, products       |

All admin pages query Supabase directly — zero hardcoded mock data.

---

## 7. Design System

### CSS Variables (Theme)
```css
--accent: #e93a3a        /* Primary red */
--accent-yellow: #e7bf04  /* Accent yellow */
--accent-pink: #c03c9d    /* Accent pink */
--accent-cyan: #07e4e1    /* Accent cyan */
--bg: #0a0a0a             /* Dark background */
--bg-card, --bg-elevated  /* Layered surfaces */
--text, --text-2, --text-3 /* Text hierarchy */
--border                   /* Border color */
```

### Theme Toggle
- `ThemeProvider` wraps the app, provides `theme` state.
- `isDark = mounted && theme === "dark"` pattern used in all pages.
- `mounted` guard prevents hydration mismatch.

---

## 8. Environment Variables

| Variable                          | Usage                        | Exposure   |
|-----------------------------------|------------------------------|------------|
| `NEXT_PUBLIC_SUPABASE_URL`        | Supabase API endpoint        | Public     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Supabase anon/public key     | Public     |
| `SUPABASE_SERVICE_ROLE_KEY`       | Admin DB operations          | Server     |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID`     | Razorpay public key          | Public     |
| `RAZORPAY_KEY_SECRET`             | Razorpay signature verify    | Server     |
| `UPSTASH_REDIS_REST_URL`          | Rate limiting (Redis)        | Server     |
| `UPSTASH_REDIS_REST_TOKEN`        | Rate limiting auth           | Server     |
| `RESEND_API_KEY`                  | Outbound email API key       | Server     |
| `CRON_SECRET`                     | Secure email queue trigger   | Server     |
| `NEXT_PUBLIC_SITE_URL`            | Base URL for absolute links  | Public     |

> [!IMPORTANT]
> **Resend Configuration**: In production, you MUST verify your domain (e.g., `haxeus.in`) in the Resend dashboard to send from `orders@haxeus.in`. In development, if the domain is not verified, emails can only be sent to the email address associated with your Resend account.

## Vercel Deployment & Crons
The project includes a `vercel.json` for managing automated tasks:
- **Abandoned Cart Recovery**: Runs daily at 9:00 AM at `/api/cron/abandoned-carts`.
- **Email Queue Processor**: Runs daily at 10:00 AM at `/api/process-emails`.

## Analytics & Monitoring
- **Vercel Analytics**: Real-time traffic monitoring.
- **Vercel Speed Insights**: Performance metrics and Core Web Vitals tracking.
- **Resend Logs**: Detailed tracking of email delivery status.

---

## 9. Deployment

### Vercel Configuration
- Framework: Next.js (auto-detected)
- Build command: `npm run build`
- Output: `.next/`
- Environment variables configured in Vercel dashboard

### Pre-Deployment Checklist
- [ ] All environment variables set in Vercel
- [ ] Supabase RLS policies verified
- [ ] Razorpay KYC and live mode activated
- [ ] DNS records configured
- [ ] `npm run build` passes with 0 errors
