# HAXEUZ - Premium T-Shirt E-Commerce Platform

A professional e-commerce website for premium artistic T-shirts built with **Next.js**, **Supabase (PostgreSQL)**, and modern web technologies.

---

## 🚀 Features

- **Product Catalog**: Browse premium T-shirt collection with detailed product pages
- **Shopping Cart**: Add/remove items, quantity management, real-time totals (Supabase backend)
- **Checkout System**: Secure checkout with shipping and payment forms
- **User Authentication**: Sign up, login, and session management via Supabase Auth
- **Order Management**: Track orders and purchase history
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Fonts**: Inter (Google Fonts)
- **Animations**: CSS transitions, keyframes

### Backend
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (email/password, OAuth)
- **API**: Next.js API Routes, Supabase client

### Development Tools
- **Language**: TypeScript
- **Linting**: ESLint
- **Formatting**: Prettier
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
git clone https://github.com/yourusername/haxeuz-ecommerce.git
cd haxeuz-ecommerce
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Supabase Setup

1. **Create a Supabase Project**:  
   - Go to [Supabase](https://supabase.com)
   - Create a new project

2. **Database Configuration**:  
   - Use the provided SQL schema to create tables for products, cart, orders, users, etc.
   - Enable Row Level Security (RLS) and add policies for tables (see `/docs/supabase-policies.sql`)

3. **Get API Keys**:  
   - Copy your Supabase project URL and anon key
   - Add them to `.env.local`

---

## 📦 Dependencies

```json
{
  "next": "15.0.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "@supabase/supabase-js": "^2.0.0",
  "lucide-react": "^0.344.0",
  "tailwindcss": "^3.4.1",
  "shadcn/ui": "^0.1.0"
}
```

---

## 🗂️ Project Structure

```
haxeuz-ecommerce/
├── app/                  # Next.js App Router
│   ├── components/      # Reusable components
│   ├── products/        # Product pages
│   ├── cart/            # Shopping cart
│   ├── checkout/        # Checkout process
│   ├── profile/         # User profile
│   ├── api/             # API routes
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── lib/                 # Utility functions
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # Helper functions
├── public/              # Static assets
├── tailwind.config.ts   # Tailwind configuration
├── next.config.js       # Next.js configuration
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file
```

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```


## 🧪 Testing

```bash
npm run test         # Unit tests
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

---

## 🐛 Troubleshooting

- **Supabase API Key Error**:  
  Ensure your `.env.local` contains the correct Supabase URL and anon key.

- **RLS Permission Error**:  
  Make sure RLS is enabled and policies are set for all tables.

- **Build Errors**:  
  Clear Next.js cache: `rm -rf .next`  
  Reinstall dependencies: `rm -rf node_modules && npm install`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

---

---

**Built with ❤️ by the HAXEUZ Team**