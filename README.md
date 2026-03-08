# HAXEUS - Premium T-Shirt E-Commerce Platform

A modern, high-performance e-commerce platform for premium artistic T-shirts built with **Next.js 15**, **Supabase**, **TypeScript**, and **Framer Motion**.

---

## 📚 Documentation

**For complete documentation, see [DOCUMENTATION.md](DOCUMENTATION.md)**

This includes:
- Full installation guide
- Database setup instructions
- Admin panel configuration
- Email system setup
- Deployment guide
- Troubleshooting tips
- Feature documentation

---

## ✨ Quick Start

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

# Setup environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Setup database
# 1. Open Supabase SQL Editor
# 2. Run supabase/COMPLETE_DATABASE_SETUP.sql
# 3. Make yourself admin (instructions in the SQL file)

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router) with React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Database**: Supabase (PostgreSQL 15)
- **Authentication**: Supabase Auth (email/password, OAuth)
- **Storage**: Supabase Storage for product images
- **Security**: Row Level Security (RLS) policies

---

## 📋 Environment Variables

Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Get these from your Supabase project dashboard at [supabase.com](https://supabase.com)

---

## 🗂️ Project Structure

```
haxeus-v26/
├── app/                      # Next.js App Router pages
├── components/               # React components
├── contexts/                 # React Context providers
├── hooks/                    # Custom React hooks
├── lib/                      # Utilities & configs
├── supabase/                 # Database setup
│   └── COMPLETE_DATABASE_SETUP.sql  # Single file for complete DB setup
├── public/                   # Static assets
├── DOCUMENTATION.md          # Complete documentation
└── README.md                 # This file
```

---

## 🚀 Development Commands

```bash
npm run dev          # Start dev server on localhost:3000
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repository on [vercel.com](https://vercel.com)
3. Add environment variables
4. Deploy!

See [DOCUMENTATION.md](DOCUMENTATION.md) for detailed deployment instructions.

---

## 🎯 Key Features

- **Product Catalog**: Browse, search, and filter products
- **Shopping Cart**: Persistent cart with real-time sync
- **User Authentication**: Email/password + OAuth
- **Order Tracking**: Real-time order status updates
- **Admin Dashboard**: Manage products, orders, and users
- **Email System**: Automated welcome and order emails
- **Loyalty Program**: Earn and redeem points
- **Coupons**: Discount codes and promotions
- **Reviews**: Customer ratings and reviews
- **Wishlist**: Save favorite products

---

## 📞 Support

For detailed documentation, troubleshooting, and setup guides, see:
- **[DOCUMENTATION.md](DOCUMENTATION.md)** - Complete guide
- **[supabase/COMPLETE_DATABASE_SETUP.sql](supabase/COMPLETE_DATABASE_SETUP.sql)** - Database setup

---

**Built with ❤️ by the HAXEUS Team**  
Powered by Next.js 15, Supabase, and Framer Motion
- **Authentication**: Supabase Auth (email/password, OAuth)
- **Storage**: Supabase Storage for product images
- **Real-time**: Supabase Realtime subscriptions
- **Security**: Row Level Security (RLS) policies

### Development Tools
- **Package Manager**: npm/pnpm
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript strict mode
- **Version Control**: Git

---

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **npm**: v8 or higher
- **Git**
- **Supabase Account**: [https://supabase.com](https://supabase.com)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/haxeus-ecommerce.git
cd haxeus-ecommerce
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Get these values from your Supabase project dashboard at [supabase.com](https://supabase.com)

### 4. Database Setup

1. **Create a Supabase Project** at [supabase.com](https://supabase.com)

2. **Run Database Migrations**:
   - Open Supabase SQL Editor
   - Run `database/schema.sql` to create all tables
   - Run `database/rls_policies.sql` to enable security policies
   - (Optional) Run `database/supabase_setup.sql` for initial data

3. **Verify Setup**:
   - Check that all tables are created (`products`, `orders`, `order_items`, `product_inventory`, `user_addresses`, `coupons`)
   - Verify RLS is enabled on all tables
   - Test authentication in Supabase dashboard

📚 **See `supabase/COMPLETE_DATABASE_SETUP.sql` for detailed database setup**

### 5. Run Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

---

## 📦 Key Dependencies

```json
{
  "next": "^15.0.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "@supabase/supabase-js": "^2.47.10",
  "framer-motion": "^11.0.0",
  "lucide-react": "^0.460.0",
  "@radix-ui/*": "various",
  "tailwindcss": "^3.4.1",
  "typescript": "^5.0.0"
}
```

Run `npm install` to install all dependencies.

---

## 🗂️ Project Structure

```
haxeus-v26/
├── app/                      # Next.js App Router pages
│   ├── about/               # About page
│   ├── auth/                # Authentication pages
│   ├── cart/                # Shopping cart
│   ├── contact/             # Contact page
│   ├── privacy-policy/      # Legal pages
│   ├── products/            # Product listing & details
│   │   └── [id]/           # Dynamic product pages
│   ├── profile/             # User profile
│   ├── returns-refunds/     # Returns policy
│   ├── terms-conditions/    # Terms of service
│   ├── globals.css          # Global styles + utilities
│   ├── layout.tsx           # Root layout with theme
│   └── page.tsx             # Landing page
│
├── components/              # Reusable components
│   ├── ui/                 # shadcn/ui components
│   ├── navbar.tsx          # Navigation with search
│   ├── footer.tsx          # Footer component
│   ├── ProductDetails.tsx  # Product detail view
│   └── theme-provider.tsx  # Dark mode provider
│
├── contexts/               # React Context providers
│   └── CartContext.tsx    # Global cart state
│
├── hooks/                  # Custom React hooks
│   ├── use-mobile.tsx     # Mobile detection
│   └── use-toast.ts       # Toast notifications
│
├── lib/                    # Utilities & configs
│   ├── supabase.ts        # Supabase client setup
│   └── utils.ts           # Helper functions
│
├── database/               # Database files
│   ├── schema.sql         # Complete DB schema
│   ├── rls_policies.sql   # Security policies
│   ├── supabase_setup.sql # Initial setup
│   └── README.md          # Database docs
│
├── public/                 # Static assets
│   ├── images/            # Product images
│   ├── *.png              # Favicon & icons
│   └── placeholder.*      # Placeholder images
│
├── styles/                 # Additional styles
│   └── globals.css        # Legacy styles
│
├── next.config.mjs         # Next.js config (optimized)
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript config
├── package.json            # Dependencies & scripts
└── README.md               # This file
```

---

## 🚀 Development Commands

```bash
# Development server
npm run dev          # Start dev server on localhost:3000

# Production build
npm run build        # Build for production
npm start            # Start production server

# Code quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking (if configured)
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - Deploy!

### Environment Variables

Make sure to add these to your deployment platform:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## 🐛 Troubleshooting

### Common Issues

**Supabase Connection Error**
```bash
# Verify your .env.local has the correct values
# Check Supabase project is active
# Ensure anon key has correct permissions
```

**RLS Permission Denied**
```bash
# Run database/rls_policies.sql in Supabase SQL Editor
# Verify user is authenticated for protected routes
# Check RLS policies match your use case
```

**Build Errors**
```bash
# Clear Next.js cache
Remove-Item -Recurse -Force .next

# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
npm install
```

**TypeScript Errors**
```bash
# Check tsconfig.json is properly configured
# Run type checking: npm run lint
# Update @types packages if needed
```

**Framer Motion Animation Issues**
```bash
# Ensure framer-motion is installed
npm install framer-motion

# Check for conflicting CSS transitions
# Verify motion components are properly imported
```

---

## 🎯 Performance Optimizations

This project includes several performance enhancements:

- **Code Splitting**: Webpack configured for optimal chunking
- **Image Optimization**: Next.js Image with AVIF/WebP formats
- **Lazy Loading**: Images load lazily after the 4th item
- **GPU Acceleration**: Hardware-accelerated animations
- **Snap Scroll**: Smooth, performant scrolling
- **Tree Shaking**: Unused code eliminated from bundles
- **Font Optimization**: next/font for optimal font loading

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Authentication**: Secure Supabase Auth
- **Environment Variables**: Sensitive data in `.env.local`
- **HTTPS Only**: Production uses secure connections
- **SQL Injection Prevention**: Parameterized queries via Supabase

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📞 Support

For questions or issues:
- Check `database/README.md` for database help
- Review Supabase logs in your dashboard
- Open an issue on GitHub

---

**Built with ❤️ by the HAXEUS Team**  
Powered by Next.js 15, Supabase, and Framer Motion