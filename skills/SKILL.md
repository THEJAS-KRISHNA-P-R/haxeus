---
name: haxeus
description: >
  Complete context and conventions for working on the HAXEUS Next.js 15 luxury streetwear
  e-commerce codebase. Use this skill for ANY task involving the HAXEUS project — adding
  features, fixing bugs, building pages, updating components, writing API routes, working
  with Supabase, payments, admin dashboard, SEO, security headers, or the navbar/GlassSurface.
  Trigger on any message mentioning HAXEUS, its pages, components, Supabase schema,
  payments, admin dashboard, the navbar, GlassSurface, or haxeus.in.
---

# HAXEUS — Codebase Skill

## Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 15, App Router | TypeScript strict mode |
| Database | Supabase (PostgreSQL + RLS + Auth) | `@supabase/ssr` only |
| Payments | Razorpay (INR, individual account) | Paise in API, INR in DB |
| Styling | Tailwind CSS | Inline only — no separate CSS files |
| Animations | Framer Motion | Wrap all with `useReducedMotion` |
| 3D Background | Three.js via `LightPillar.tsx` | `pillarWidth=7.5, pillarRotation=235, glowAmount=0.004` |
| Cache / Rate limit | Redis Enterprise Cloud via `ioredis` | NOT Upstash |
| Auth | Supabase Auth + `@supabase/ssr` | NOT `auth-helpers-nextjs` |
| State | React Context | `CartContext`, `ThemeProvider` |
| Deployment | Vercel | `vercel.json` is canonical — ignore `netlify/` |
| Domain | haxeus.in | metadataBase always `https://haxeus.in` (no www) |

---

## Project Structure

```
app/                          Next.js App Router pages
  (legal)/                    Legal pages group (privacy, returns, terms, size-guide)
  admin/                      Admin dashboard — protected by middleware
  auth/                       Auth pages — noindex in metadata
  blog/                       Blog index + [slug] — MDX powered
  products/[id]/              Product detail — generateMetadata + JSON-LD
  sitemap.ts                  Dynamic sitemap (fetches product IDs from Supabase)
  robots.ts                   Crawler rules
  layout.tsx                  Root layout — metadata, ThemeProvider, CartProvider
components/
  ui/                         shadcn/ui primitives
  GlassSurface.tsx            Navbar glass pill — read displacement map notes below
  navbar.tsx                  Fixed top nav — clearance: pt-[88px] on all pages
  footer.tsx                  Links to all pages — no dead links allowed
  TrustBadges.tsx             Below Add-to-Cart + above Checkout button
  SizeGuide.tsx               shadcn Dialog modal — on every product page
  ReviewList.tsx              Star display + review cards for product pages
  ReviewStars.tsx             Read-only and interactive star rating modes
  AddReviewForm.tsx           Auth-required review submission
  EmailCapturePopup.tsx       8s delay, localStorage-gated, WELCOME10 coupon
  WhatsAppButton.tsx          Fixed bottom-right, all pages except checkout
  DropCountdown.tsx           DD:HH:MM:SS — reads `drops` table, null when no active drop
contexts/
  CartContext.tsx              Global cart — Client Component boundary only
hooks/
  use-mobile.tsx
  use-toast.ts
lib/
  supabase.ts                  Client-side Supabase client
  redis.ts                     ioredis client — import { redis, cached, rateLimit, invalidate }
  utils.ts
types/
  index.ts                     All Supabase table interfaces — Product, Order, Review etc.
supabase/
  COMPLETE_DATABASE_SETUP.sql  Single source of truth for DB schema
content/
  blog/                        MDX files with frontmatter
netlify/                       LEGACY — ignore entirely, Vercel is canonical
_disabled/                     Incomplete features — DO NOT re-enable without full review
```

---

## Design System

### Brand colors
| Token | Value | Usage |
|---|---|---|
| Red accent | `#e93a3a` | CTAs, active nav, badges, borders |
| Teal | `#07e4e1` | User icon hover (dark mode) |
| Pink | `#c03c9d` | Wishlist hover |
| Teal light | `#059e9b` | User icon hover (light mode) |

### Dark mode text opacity scale
| Role | Dark | Light |
|---|---|---|
| Primary | `text-white` | `text-black` |
| Secondary | `text-white/65` | `text-black/65` |
| Muted | `text-white/50` | `text-black/55` |
| Very muted | `text-white/30` | `text-black/35` |

### Backgrounds
- Dark page: `bg-[#0a0a0a]`
- Light page: `bg-[#f5f4f0]`
- Card dark: `bg-white/[0.03]` + `border-white/[0.07]`
- Card light: `bg-black/[0.02]` + `border-black/[0.07]`

### Navbar clearance
Navbar is `position: fixed, top-4, height: 56px`. **All pages must start with `pt-[88px]` minimum.** No exceptions.

### Typography
- Section labels: `text-xs tracking-[0.25em] font-medium uppercase`
- Subsection labels: `text-xs font-bold tracking-[0.15em] uppercase`
- Page h1: `text-3xl md:text-4xl font-bold tracking-tight`
- Body: `text-sm leading-relaxed`

### Border radius
- Cards / containers: `rounded-2xl`
- Buttons (pill shape): `rounded-full`
- Small elements: `rounded-xl`

### Buttons
```tsx
// Primary CTA
className="bg-[#e93a3a] hover:bg-[#ff4a4a] text-white font-bold rounded-full tracking-wide shadow-lg shadow-[#e93a3a]/20"

// Ghost
className="border border-white/[0.12] text-white/70 hover:text-white rounded-full"
```

---

## Theme System

```tsx
// Always use this pattern for theme-aware components
const { theme } = useTheme()
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
const isDark = mounted && (
  theme === "dark" ||
  (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
)
```

**Never render theme-dependent UI on the server** — always gate with `mounted` to avoid hydration mismatch.

---

## GlassSurface Component

The navbar glass pill uses `GlassSurface`. Canonical props for navbar:

```tsx
<GlassSurface
  width="100%"
  height={56}
  borderRadius={100}
  borderWidth={0.06}
  brightness={isDark ? 50 : 100}
  opacity={isDark ? 0.8 : 0.85}
  blur={14}
  backgroundOpacity={isDark ? 0.28 : 0.15}
  saturation={isDark ? 1.2 : 1.1}
  distortionScale={-18}
  redOffset={0}
  greenOffset={0}
  blueOffset={0}
/>
```

### Critical displacement map fix
The `generateDisplacementMap` background **must be `fill="#808080"`** (neutral gray = zero displacement).
`fill="black"` causes double-reflection crescent artifacts at pill corners. This is a known bug — do not change it back to black.

---

## Supabase

### Client creation (App Router)

```ts
// Server components / API routes / middleware — use @supabase/ssr
import { createClient } from "@supabase/ssr"
import { cookies } from "next/headers"
const cookieStore = cookies()
const supabase = createClient(url, anonKey, {
  cookies: { get: (name) => cookieStore.get(name)?.value }
})

// Client components — use the singleton from lib/
import { supabase } from "@/lib/supabase"
```

### Complete table reference

| Table | Key columns | RLS rule |
|---|---|---|
| `products` | id, name, price (INR), description, images (array), is_active | Anyone can SELECT active products |
| `product_inventory` | product_id, size, quantity | Anyone can SELECT (for stock display) |
| `orders` | user_id, status, subtotal_amount, discount_amount, shipping_amount, total_amount, razorpay_order_id, razorpay_payment_id | Auth users see own rows only |
| `order_items` | order_id, product_id, quantity, unit_price, size | Via order_id join — own orders only |
| `user_roles` | user_id, role ('admin') | Admin only via `is_admin()` |
| `user_addresses` | user_id, name, line1, line2, city, state, pincode, phone | Own rows only |
| `coupons` | code, discount_type (percentage/fixed), discount_value, usage_limit, usage_count, valid_from, valid_until, is_active | Admin write, auth read |
| `store_settings` | key, value | Admin only |
| `reviews` | id, product_id, user_id, rating (1–5), title, body, verified_purchase, created_at | Anyone reads, auth users insert own |
| `drops` | id, name, description, target_date, is_active, product_ids (uuid[]) | Anyone reads active drops |
| `email_subscribers` | id, email, subscribed_at, source ('popup'), discount_code | Insert only for anon |
| `contact_submissions` | id, name, email, order_number, message, created_at, status ('new') | Insert for anon, admin reads |

### RLS pattern
- Use `is_admin()` SECURITY DEFINER function for all admin checks — prevents infinite recursion
- Webhook routes use `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS — server-side only, never expose
- Test every table with an unauthenticated client before shipping: anon must NOT be able to read orders, user_addresses, profiles, or user_roles

### Key RPCs
```ts
// Atomic coupon increment — use instead of manual UPDATE
await supabase.rpc('increment_coupon_usage', { coupon_id: id })

// Atomic inventory decrement — throws if insufficient stock
await supabase.rpc('decrement_inventory', { p_product_id: id, p_quantity: qty })
```

### Query patterns
```ts
// CORRECT — use maybeSingle() for queries that may return null
const { data } = await supabase.from('products').select('*').eq('id', id).maybeSingle()

// WRONG — .single() throws if row not found
const { data } = await supabase.from('products').select('*').eq('id', id).single()
```

---

## TypeScript Types (types/index.ts)

All Supabase table responses must use these interfaces — never use `any`:

```ts
export interface Product {
  id: string
  name: string
  price: number          // INR — not paise
  description: string
  images: string[]
  is_active: boolean
  total_stock: number    // Added in v26 hardening
  average_rating: number // Added in v26 hardening
  category: string
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  subtotal_amount: number
  discount_amount: number
  shipping_amount: number
  total_amount: number
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  created_at: string
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: 1 | 2 | 3 | 4 | 5
  title: string
  body: string
  verified_purchase: boolean
  created_at: string
}

export interface Drop {
  id: string
  name: string
  description: string
  target_date: string    // ISO timestamp
  is_active: boolean
  product_ids: string[]
}
```

---

## Payment Flow (Razorpay)

### The flow
1. Client calls `POST /api/payment/create-order` with cart items
2. Server fetches prices from DB — **never trust client-side amounts**
3. Server validates stock, calculates total, creates Razorpay order
4. Server creates pending `orders` row in Supabase
5. Client opens Razorpay checkout modal
6. On success: client calls `POST /api/payment/verify` with signature
7. Server verifies HMAC-SHA256, marks order `confirmed`
8. Webhook at `/api/webhooks/razorpay` handles async events (backup)

### Amount handling — critical
```ts
// Razorpay API — amounts in PAISE
amount: Math.round(totalINR * 100)

// Supabase DB — amounts in INR
total_amount: totalINR

// Free shipping threshold
const FREE_SHIPPING_THRESHOLD_INR = 999
const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD_INR
```

### Required env vars
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

---

## Security Headers (next.config.mjs)

All routes must have these headers via the `headers()` async function:

```js
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://checkout.razorpay.com",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' blob: data: https://*.supabase.co https://vercel.com",
          "font-src 'self'",
          "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vercel.live https://api.razorpay.com",
          "frame-src https://api.razorpay.com",
          "frame-ancestors 'none'",
        ].join('; ')
      },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    ]
  }]
}
```

Target score on securityheaders.com: **A or A+**

---

## SEO — Next.js 15 App Router Patterns

### Root layout metadata (app/layout.tsx)
```ts
export const metadata: Metadata = {
  metadataBase: new URL('https://www.haxeus.in'),
  title: { default: 'HAXEUS', template: '%s | HAXEUS' },
  description: 'Premium artistic streetwear from India. Graphic tees, oversized fits, and limited drops.',
  openGraph: { type: 'website', siteName: 'HAXEUS', locale: 'en_IN' },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
}
```

### Product page dynamic metadata
```ts
// app/products/[id]/page.tsx
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient(...)
  const { data: product } = await supabase.from('products').select('*').eq('id', params.id).maybeSingle()
  if (!product) return { title: 'Product not found' }
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: { images: [{ url: product.images[0] }] },
  }
}
```

### Auth pages — always noindex
```ts
// app/auth/*/page.tsx
export const metadata: Metadata = {
  robots: { index: false, follow: false }
}
```

### JSON-LD for product pages
```tsx
// In the product page component
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  image: product.images,
  brand: { '@type': 'Brand', name: 'HAXEUS' },
  offers: {
    '@type': 'Offer',
    priceCurrency: 'INR',
    price: product.price,
    availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    url: `https://www.haxeus.in/products/${product.id}`,
  },
  // Only include if reviews exist:
  aggregateRating: reviews.length > 0 ? {
    '@type': 'AggregateRating',
    ratingValue: avgRating,
    reviewCount: reviews.length,
  } : undefined,
}
return (
  <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    {/* rest of page */}
  </>
)
```

### Sitemap (app/sitemap.ts)
```ts
import { MetadataRoute } from 'next'
export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(...)
  const { data: products } = await supabase.from('products').select('id, updated_at').eq('is_active', true)
  const productUrls = (products ?? []).map(p => ({
    url: `https://www.haxeus.in/products/${p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))
  return [
    { url: 'https://www.haxeus.in', changeFrequency: 'daily', priority: 1.0 },
    { url: 'https://www.haxeus.in/products', changeFrequency: 'daily', priority: 0.9 },
    ...productUrls,
    { url: 'https://www.haxeus.in/about', changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://www.haxeus.in/blog', changeFrequency: 'weekly', priority: 0.7 },
  ]
}
```

### robots.ts (app/robots.ts)
```ts
import { MetadataRoute } from 'next'
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/profile', '/cart', '/auth'] }
    ],
    sitemap: 'https://haxeus.in/sitemap.xml',
  }
}
```

---

## Analytics — GA4 Setup (lib/ga-events.ts)

GA4 is active globally in the `RootLayout`. Use the utility for custom events:

```ts
import { gaCommerceEvents } from "@/lib/ga-events"

// Product View
gaCommerceEvents.viewItem(id, name, price, category)

// Add to Bag
gaCommerceEvents.addToCart(id, name, qty, price, category)

// Conversion
gaCommerceEvents.purchase(orderId, total, items)
```

**Signature Standard:** Always use `gtag('event', 'eventName', { ...params })`. Avoid generic `'event', 'event'` patterns.

---

---

## Admin Dashboard

Route: `/admin/*` — protected by `middleware.ts` + client-side guard.

### Middleware pattern
Uses `@supabase/ssr` `createServerClient`. Checks `user_roles` table for `role = 'admin'`. Redirects non-admins to `/`.

### Admin sections
| Route | Purpose |
|---|---|
| `/admin` | Analytics dashboard — real Supabase data, 7d/30d/90d ranges |
| `/admin/coupons` | Full CRUD — create, toggle active, track usage |
| `/admin/settings` | `store_settings` key-value table |
| Cmd+K | Global search — debounced, searches orders + products + coupons |

---

## Redis (Enterprise Cloud)

```ts
import { redis, cached, rateLimit, invalidate } from "@/lib/redis"
// NOT @upstash/redis — uses ioredis with TLS
```

| Data | TTL |
|---|---|
| Analytics | 5 min |
| Coupons | 2 min |
| Store settings | 1 hr |

Rate limiting: coupon validation — 10 attempts / min / IP.

---

## Framer Motion Pattern

All animations must respect reduced motion:

```tsx
import { useReducedMotion } from 'framer-motion'

function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion()
  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
    >
      ...
    </motion.div>
  )
}
```

Non-critical animated components that appear below the fold should be lazy loaded:
```ts
const AnimatedSection = dynamic(() => import('@/components/AnimatedSection'), { ssr: false })
```

---

## Cart Context — Hydration Pattern

CartContext is client-side only. To prevent the cart count in the navbar from flashing 0 on initial render:

```tsx
// In navbar — show skeleton until cart is hydrated
const { items, isHydrated } = useCart()
return (
  <span>
    {isHydrated ? items.length : <span className="w-4 h-4 bg-white/20 rounded animate-pulse inline-block" />}
  </span>
)
```

CartContext must expose `isHydrated: boolean` — set to `true` inside a `useEffect`.

---

## Legal Pages

All live at `app/(legal)/`:

| Route | Content |
|---|---|
| `/size-guide` | Measurement tables (XS–XXL), how-to-measure guide |
| `/privacy-policy` | Data collection, sharing, user rights (DPDP Act compliant) |
| `/returns-refunds` | 7-day window, step-by-step process, eligible items list |
| `/terms-conditions` | 12 sections — standard Indian e-commerce terms |

All pages use `pt-[88px]` top padding and standard dark/light theme pattern.

---

## New Components — Usage Reference

### EmailCapturePopup
- Triggers after 8 seconds on first visit
- localStorage key: `haxeus_email_popup_dismissed`
- On submit: inserts to `email_subscribers` table, shows WELCOME10 code
- Do NOT show on: `/checkout`, `/auth/*`, `/admin/*`

### WhatsAppButton
- WhatsApp link: `https://wa.me/91XXXXXXXXXX?text=Hi%2C%20I%20have%20a%20question%20about%20HAXEUS`
- Fixed position: `bottom-6 right-6 z-40`
- Hide on: `/checkout`, `/admin/*`
- Entrance: `motion.div` slide up on mount (y: 20 → 0, opacity: 0 → 1)

### DropCountdown
- Reads from `drops` table where `is_active = true`
- Returns `null` if no active drop (renders nothing)
- Format: `DD : HH : MM : SS` with small labels below each unit
- "Drop is live!" state when target_date has passed and drop is still active

### TrustBadges
- 4 badges: Free shipping ₹999+ / 7-day returns / Made in India / Secure checkout
- Place: below Add to Cart button on product pages
- Place: above Checkout button in cart page

### SizeGuide
- Trigger: "Size Guide" text link near the size selector on product pages
- Uses shadcn/ui `Dialog` component
- Measurement table: XS / S / M / L / XL / XXL × chest / length / shoulder (cm)
- "How to measure" section: 3 steps with simple illustrations

---

## Blog — MDX Setup

Posts live in `content/blog/*.mdx`. Required frontmatter:

```yaml
---
title: "Post title here"
description: "160-char SEO description"
date: "2026-04-01"
author: "HAXEUS"
tags: ["streetwear", "india", "style"]
coverImage: "/blog/cover-image.jpg"
published: true
---
```

Only posts with `published: true` appear in the public listing.

---

## Environment Variables (complete list)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # Server only — NEVER NEXT_PUBLIC_

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Redis
REDIS_URL=                          # ioredis TLS connection string

# App
NEXT_PUBLIC_APP_URL=https://www.haxeus.in
```

---

## Common Mistakes — Never Do These

| Mistake | Correct pattern |
|---|---|
| `import { createClient } from "@supabase/auth-helpers-nextjs"` | Use `@supabase/ssr` only |
| Trust cart totals from the client | Always fetch prices from DB in API routes |
| `.single()` for optional queries | Use `.maybeSingle()` — `.single()` throws on null |
| `SUPABASE_SERVICE_ROLE_KEY` in `NEXT_PUBLIC_*` | Server-only env var, never expose |
| Skip `router.refresh()` after sign-in | Always call after auth state change to update server components |
| `GlassSurface` background `fill="black"` | Must be `fill="#808080"` — black causes displacement artifacts |
| Render theme-dependent UI without `mounted` guard | Always gate with `mounted` to prevent hydration mismatch |
| Razorpay amounts in INR | Must be paise — multiply INR × 100 for Razorpay API |
| DB amounts in paise | Must be INR — do not multiply when storing in Supabase |
| `// @ts-ignore` to suppress errors | Fix the root cause — zero TypeScript suppressions allowed |
| Any hardcoded `http://` URLs | Always `https://` in production |
| Re-enabling anything from `_disabled/` folder | Full review required — features were disabled for a reason |
| Writing to `netlify/` folder or `netlify.toml` | Vercel is canonical — netlify config is legacy dead code |
| `<img>` tags | Always use `next/image` with explicit width, height, and alt |
| Framer Motion without `useReducedMotion` | Wrap all animations with reduced-motion check |
| Empty or missing `alt` on product images | Format: `"{product.name} — HAXEUS streetwear"` |
