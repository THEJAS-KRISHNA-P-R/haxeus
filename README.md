# HAXEUZ - Premium T-Shirt E-Commerce Platform

A fully-featured, professional e-commerce website for premium artistic T-shirts built with Next.js 15, MongoDB, and modern web technologies.

## 🚀 Features

### 🛍️ E-Commerce Functionality
- **Product Catalog**: Browse premium T-shirt collection with detailed product pages
- **Shopping Cart**: Add/remove items, quantity management, real-time totals
- **Checkout System**: Secure checkout with shipping and payment forms
- **User Authentication**: Login/register with secure password handling
- **Order Management**: Track orders and purchase history
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### 🎨 Design & User Experience
- **Custom Design System**: Universal smoothness with pill-shaped buttons and soft shadows
- **Premium Aesthetics**: White + Deep Red + Muted Gray color scheme
- **Smooth Animations**: Framer Motion integration for elegant transitions
- **Glass Morphism**: Modern glassy navbar and UI elements
- **Typography**: Inter font for clean, professional readability

### 🔧 Admin Panel
- **Dashboard**: Overview of sales, orders, and customer metrics
- **Product Management**: Full CRUD operations for products
- **Order Management**: View and update order statuses
- **Customer Management**: View customer data and order history
- **Analytics**: Sales reports and performance metrics

### 🌱 Additional Features
- **SEO Optimized**: Meta tags, structured data, and search engine friendly
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Performance**: Image optimization, code splitting, and caching
- **Security**: Input validation, CSRF protection, secure authentication

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui component library
- **Icons**: Lucide React
- **Fonts**: Inter (Google Fonts)
- **Animations**: CSS transitions and keyframes

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes and Server Actions
- **Database**: MongoDB Atlas (free tier)
- **ODM**: Native MongoDB driver
- **Authentication**: Custom JWT implementation

### Development Tools
- **Language**: TypeScript
- **Linting**: ESLint with Next.js config
- **Code Formatting**: Prettier (recommended)
- **Version Control**: Git

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: For version control
- **MongoDB Atlas Account**: Free tier available

## 🚀 Installation & Setup

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/yourusername/haxeuz-ecommerce.git
cd haxeuz-ecommerce
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# MongoDB Configuration
MONGODB_URI=

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Optional: Additional Configuration
NODE_ENV=development
\`\`\`

### 4. MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account
   - Create a new cluster (free tier M0)

2. **Database Configuration**:
   - Create a database named `haxeuz`
   - Create collections: `products`, `orders`, `customers`, `admins`
   - Set up database user with read/write permissions

3. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

### 5. Seed the Database

Run the database seeding script to populate initial data:

\`\`\`bash
# This will create sample products and admin user
npm run seed
\`\`\`

### 6. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📦 Dependencies

### Production Dependencies

\`\`\`json
{
  "next": "15.0.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "mongodb": "^6.3.0",
  "bcryptjs": "^2.4.3",
  "lucide-react": "^0.344.0",
  "tailwindcss": "^3.4.1",
  "tailwindcss-animate": "^1.0.7"
}
\`\`\`

### Development Dependencies

\`\`\`json
{
  "typescript": "^5",
  "@types/node": "^20",
  "@types/react": "^18",
  "@types/react-dom": "^18",
  "@types/bcryptjs": "^2.4.6",
  "postcss": "^8",
  "eslint": "^8",
  "eslint-config-next": "15.0.0",
  "@tailwindcss/typography": "^0.5.10"
}
\`\`\`

## 🗂️ Project Structure

\`\`\`
haxeuz-ecommerce/
├── app/                          # Next.js App Router
│   ├── components/              # Reusable components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   └── ...
│   ├── products/               # Product pages
│   │   ├── page.tsx           # Products listing
│   │   └── [id]/              # Dynamic product pages
│   ├── cart/                  # Shopping cart
│   ├── checkout/              # Checkout process
│   ├── admin/                 # Admin panel
│   ├── api/                   # API routes
│   │   ├── products/
│   │   ├── orders/
│   │   └── auth/
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── lib/                       # Utility functions
│   ├── mongodb.ts             # Database connection
│   ├── types.ts               # TypeScript types
│   └── utils.ts               # Helper functions
├── public/                    # Static assets
│   ├── images/
│   │   └── products/          # Product images
│   └── favicon.ico
├── scripts/                   # Database scripts
│   └── seed-database.sql
├── tailwind.config.ts         # Tailwind configuration
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
\`\`\`

## 🎨 Design System

### Color Palette
- **Primary Red**: `#dc2626` (red-600)
- **Secondary Red**: `#b91c1c` (red-700)
- **Background**: `#ffffff` (white)
- **Text Primary**: `#111827` (gray-900)
- **Text Secondary**: `#6b7280` (gray-500)
- **Muted Gray**: `#f3f4f6` (gray-100)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold weights (600-700)
- **Body Text**: Regular weight (400)
- **UI Elements**: Medium weight (500)

### Components
- **Buttons**: Pill-shaped with smooth hover effects
- **Cards**: Rounded corners with soft shadows
- **Inputs**: Rounded with focus states
- **Navigation**: Glass morphism effect

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**:
   \`\`\`bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   \`\`\`

2. **Deploy to Vercel**:
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy automatically

### Environment Variables for Production
\`\`\`env
MONGODB_URI=your-production-mongodb-uri
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret
NODE_ENV=production
\`\`\`

## 📱 API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product (admin)
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product (admin)
- `DELETE /api/products/[id]` - Delete product (admin)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get single order
- `PUT /api/orders/[id]` - Update order status (admin)

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

## 🧪 Testing

### Running Tests
\`\`\`bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
\`\`\`

## 🔧 Development Scripts

\`\`\`bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Database
npm run seed         # Seed database with sample data
npm run db:reset     # Reset database (development only)
\`\`\`

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**:
   - Verify MONGODB_URI in `.env.local`
   - Check MongoDB Atlas network access settings
   - Ensure database user has proper permissions

2. **Build Errors**:
   - Clear Next.js cache: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run type-check`

3. **Styling Issues**:
   - Verify Tailwind CSS configuration
   - Check for conflicting CSS classes
   - Ensure custom CSS is properly imported

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **MongoDB** - For the flexible NoSQL database
- **Vercel** - For seamless deployment platform
- **shadcn/ui** - For beautiful UI components

## 📞 Support

For support and questions:
- **Email**: support@haxeuz.com
- **Documentation**: [docs.haxeuz.com](https://docs.haxeuz.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/haxeuz-ecommerce/issues)

---

**Built with ❤️ by the HAXEUZ Team**

*Premium comfort meets contemporary style.*
