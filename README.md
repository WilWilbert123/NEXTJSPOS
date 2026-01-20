# POS (Point of Sale) System

A production-ready, cloud-based Point of Sale system built with **Next.js 14+**, **Supabase**, and **PostgreSQL**. Designed for small businesses like cafés, retail stores, and minimarts.

## 🎯 Project Highlights

- **Full-Stack Architecture**: Next.js App Router with Server Actions for secure backend operations
- **Real-time Inventory**: Supabase Realtime subscriptions for live stock synchronization across multiple cashiers
- **Role-Based Access Control**: Admin and Cashier roles with middleware-protected routes
- **Production-Ready**: Environment configuration, Netlify deployment, RLS security policies, and comprehensive error handling
- **Tablet-Friendly**: Responsive UI optimized for fast POS interactions
- **Analytics**: Daily/weekly/monthly sales metrics and inventory tracking

## 🧱 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 14+** | Frontend & Backend (App Router) |
| **React 19** | UI Components |
| **Supabase** | Authentication, Database, Realtime |
| **PostgreSQL** | Relational Database |
| **Tailwind CSS** | Styling |
| **TypeScript** | Type Safety |
| **Recharts** | Analytics Visualizations |
| **Lucide React** | Icons |

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NODE_ENV=development
```

### 3. Setup Database

1. Create Supabase project
2. Copy `database_schema.sql` contents
3. Execute in Supabase SQL Editor
4. Add demo user (see README.md for SQL)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📚 Full Documentation

See [FULL_README.md](./FULL_README.md) for comprehensive documentation including:
- Complete folder structure
- Database schema details
- All Server Actions reference
- Real-time features
- Security best practices
- Deployment guide
- Code examples
- Troubleshooting

## 🔐 Key Features

### Authentication
- ✅ Email/password registration & login
- ✅ Supabase Auth integration
- ✅ Role-based access control (Admin/Cashier)
- ✅ Protected routes with middleware

### POS System
- ✅ Product search & browsing
- ✅ Real-time cart management
- ✅ Multi-payment methods (Cash, Card, Mobile)
- ✅ Receipt printing
- ✅ Inventory updates on checkout

### Inventory Management
- ✅ Product CRUD operations
- ✅ Category management
- ✅ Stock tracking & alerts
- ✅ Audit logs
- ✅ Real-time sync across sessions

### Analytics Dashboard
- ✅ Daily/weekly/monthly sales
- ✅ Revenue metrics
- ✅ Top-selling products
- ✅ Inventory value tracking

## 📂 Project Structure

```
nextjs/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── pos/               # Point of Sale interface
│   ├── dashboard/         # Admin dashboard
│   ├── inventory/         # Inventory management
│   ├── analytics/         # Analytics & reports
│   └── api/               # API routes
├── components/            # React Components
│   ├── ui/               # Base UI components
│   ├── pos/              # POS components
│   └── ...
├── lib/                  # Utilities & Helpers
│   ├── actions/          # Server Actions
│   ├── hooks/            # Custom React Hooks
│   ├── types/            # TypeScript definitions
│   ├── utils/            # Utility functions
│   └── supabase.ts       # Supabase config
├── middleware.ts         # Route protection
├── database_schema.sql   # PostgreSQL schema
└── README.md            # This file
```

## 🔒 Security

- **RLS Enabled**: All tables have Row-Level Security policies
- **Service Role Key**: Kept server-side only in `.env.local`
- **Input Validation**: All mutations validated before database writes
- **Middleware Protection**: Routes protected by auth middleware
- **JWT Tokens**: Secure session management via Supabase

## 🚀 Deployment

### Netlify

```bash
npm run build
netlify deploy
```

Add environment variables in Netlify dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Demo Credentials

```
Email: admin@example.com
Password: Test@1234
Role: Admin
```

## 📞 Demo Features

### POS System
- Browse products by category
- Add items to cart
- Auto-calculate taxes & totals
- Multiple payment methods
- Print receipts

### Admin Dashboard
- View all orders
- Manage inventory
- Create/update products
- View sales analytics
- Manage user roles

## 🛠️ Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint
```

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript](https://www.typescriptlang.org/docs/)

## 💡 Key Server Actions

### Auth
```typescript
await signUp(formData)
await signIn(credentials)
await updateUserRole(userId, role)
```

### Products
```typescript
await getProducts()
await createProduct(data)
await searchProducts(query)
await getLowStockProducts()
```

### Orders
```typescript
await createOrder(cashierId, items, paymentMethod)
await getOrdersByDateRange(startDate, endDate)
await getBestSellingProducts(limit)
```

## 🎯 Perfect For

- 📌 Portfolio projects
- 📌 Resume demonstration
- 📌 Learning full-stack development
- 📌 Real business use
- 📌 Starting your SaaS

## 📄 License

MIT License - See LICENSE file for details

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: January 2024

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
