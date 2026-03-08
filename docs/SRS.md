# HAXEUS — Software Requirements Specification (SRS)

**Version:** 1.0  
**Date:** March 2026  
**Project:** HAXEUS E-Commerce Platform  
**Author:** HAXEUS Development Team

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for HAXEUS, a premium streetwear e-commerce platform. It describes the functional, non-functional, and interface requirements needed for development, testing, and deployment.

### 1.2 Scope
HAXEUS is a full-stack web application enabling:
- Customers to browse, search, and purchase premium streetwear products.
- Administrators to manage products, orders, customers, coupons, and reviews.
- Secure payment processing via Razorpay.
- User authentication with email/password and OTP.

### 1.3 Definitions
| Term | Definition |
|------|-----------|
| RLS | Row Level Security — Postgres-level access control |
| SSR | Server-Side Rendering |
| OTP | One-Time Password |
| DPDP | Digital Personal Data Protection Act 2023 (India) |

---

## 2. Overall Description

### 2.1 Product Perspective
HAXEUS is a standalone e-commerce web application deployed on Vercel, using Supabase for backend services (database, authentication, storage) and Razorpay for payment processing.

### 2.2 User Classes

| User Class | Description | Access Level |
|------------|-------------|-------------|
| Guest | Unauthenticated visitor | Browse products, view pages |
| Customer | Registered/authenticated user | Full shopping, orders, reviews |
| Admin | User with `role = 'admin'` | Full management dashboard |

### 2.3 Operating Environment
- **Client:** Modern web browsers (Chrome, Firefox, Safari, Edge)
- **Server:** Vercel serverless functions (Node.js)
- **Database:** PostgreSQL 15+ (Supabase hosted)
- **CDN:** Vercel Edge Network

---

## 3. Functional Requirements

### 3.1 Product Browsing (FR-01)
- **FR-01.1**: Display product catalog with images, name, price, category.
- **FR-01.2**: Product detail page shows multiple images, size selection, stock status.
- **FR-01.3**: Out-of-stock sizes are visually disabled (greyed out, no interaction).
- **FR-01.4**: Featured products displayed on homepage.

### 3.2 Shopping Cart (FR-02)
- **FR-02.1**: Add/remove items with size and quantity selection.
- **FR-02.2**: Cart persists across page navigation.
- **FR-02.3**: Real-time stock validation before checkout.

### 3.3 Checkout & Payment (FR-03)
- **FR-03.1**: "Buy Now" adds item to cart and navigates directly to checkout.
- **FR-03.2**: Checkout displays order summary with shipping and discount calculations.
- **FR-03.3**: Razorpay payment modal for online payment.
- **FR-03.4**: COD (Cash on Delivery) option available.
- **FR-03.5**: Coupon code application at checkout.
- **FR-03.6**: Server-side price calculation — client amounts are never trusted.

### 3.4 User Authentication (FR-04)
- **FR-04.1**: Email/password registration and login.
- **FR-04.2**: OTP-based email verification.
- **FR-04.3**: Secure session management via Supabase Auth.
- **FR-04.4**: Password reset functionality.

### 3.5 Order Management — Customer (FR-05)
- **FR-05.1**: View order history with status tracking.
- **FR-05.2**: Order detail page with items, shipping, and payment info.

### 3.6 Admin — Product Management (FR-06)
- **FR-06.1**: Create, edit, deactivate products.
- **FR-06.2**: Upload product images (JPG/PNG/WEBP, max 5MB).
- **FR-06.3**: Manage per-size inventory.
- **FR-06.4**: Search and filter products.

### 3.7 Admin — Order Management (FR-07)
- **FR-07.1**: View all orders with search, filter by status.
- **FR-07.2**: Update order status (pending → paid → shipped → delivered).
- **FR-07.3**: Add tracking number to orders.
- **FR-07.4**: Export orders as CSV.

### 3.8 Admin — Customer Management (FR-08)
- **FR-08.1**: View registered users with name, email, role, join date.
- **FR-08.2**: Search customers by name or email.

### 3.9 Admin — Coupon Management (FR-09)
- **FR-09.1**: Create, edit, delete discount coupons.
- **FR-09.2**: Support percentage and fixed-amount discounts.
- **FR-09.3**: Set validity dates, usage limits, minimum purchase.
- **FR-09.4**: Activate/deactivate coupons.

### 3.10 Admin — Review Management (FR-10)
- **FR-10.1**: View all product reviews with rating and text.
- **FR-10.2**: Approve or reject reviews.
- **FR-10.3**: Delete inappropriate reviews.

### 3.11 Newsletter (FR-11)
- **FR-11.1**: Email subscription form on homepage.
- **FR-11.2**: Duplicate email handling (graceful message).
- **FR-11.3**: Welcome email queued on subscription.

---

## 4. Non-Functional Requirements

### 4.1 Performance (NFR-01)
- Page load time < 3 seconds on 4G connection.
- Static pages generated at build time (SSG) where possible.
- Images optimized via Next.js `<Image>` component with lazy loading.

### 4.2 Security (NFR-02)
- HTTPS enforced on all routes.
- XSS sanitization on all user inputs via DOMPurify.
- CSRF origin validation on API routes.
- Rate limiting via Upstash Redis (IP and user-based).
- Row Level Security (RLS) on all database tables.
- `SUPABASE_SERVICE_ROLE_KEY` used only server-side.
- Razorpay payment verification via HMAC-SHA256 signature.

### 4.3 Legal Compliance (NFR-03)
- Privacy Policy with DPDP Act 2023 rights.
- Terms & Conditions (Indian law, Consumer Protection Act 2019, IT Act 2000).
- Returns & Refunds policy (10-day replacement).
- Shipping Policy with clear charges and timelines.
- All legal pages accessible from footer and individually linkable.

### 4.4 Scalability (NFR-04)
- Serverless deployment on Vercel (auto-scaling).
- Supabase managed PostgreSQL with connection pooling.

### 4.5 Availability (NFR-05)
- Target 99.9% uptime via Vercel and Supabase SLAs.

### 4.6 Accessibility (NFR-06)
- Semantic HTML5 elements throughout.
- ARIA labels on interactive components.
- Keyboard navigation support.
- Dark/light mode toggle.

### 4.7 Responsive Design (NFR-07)
- Mobile-first approach with breakpoints at sm (640px), md (768px), lg (1024px).
- Touch-friendly UI elements.
- Responsive image heights and padding.

---

## 5. Interface Requirements

### 5.1 External Interfaces

| System | Protocol | Purpose |
|--------|----------|---------|
| Supabase | REST/WebSocket | Database, Auth, Storage |
| Razorpay | REST | Payment processing |
| Upstash Redis | REST | Rate limiting |
| Vercel | HTTPS | Hosting, CDN, Serverless |

### 5.2 User Interface
- Custom design system with CSS variables for theming.
- Accent red (#e93a3a), dark bg (#0a0a0a), light bg (#f5f4f0).
- Consistent admin UI via shared AdminUI components.
- Framer Motion animations for page transitions and interactions.

---

## 6. Constraints

- Indian domestic shipping only (no international).
- Single currency (INR) for all transactions.
- Razorpay KYC required for live payments.
- Supabase free/pro tier limits on database size and API calls.
