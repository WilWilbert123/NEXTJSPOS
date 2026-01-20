# POS System - Quick Reference Guide

Quick lookup guide for developers.

## 🚀 Quick Start

```bash
npm install              # Install dependencies
npm run dev             # Start dev server (http://localhost:3000)
npm run build           # Build for production
npm start               # Run production build
npm run lint            # Check code quality
```

## 📁 Key Files & Directories

| Path | Purpose |
|------|---------|
| `database_schema.sql` | PostgreSQL database schema |
| `.env.local` | Environment configuration |
| `middleware.ts` | Route protection & auth |
| `lib/actions/` | Server Actions (auth, products, orders) |
| `lib/hooks/` | Custom React hooks |
| `lib/types/` | TypeScript interfaces |
| `lib/utils/` | Utility functions |
| `components/ui/` | Base UI components |
| `app/pos/` | POS interface |
| `app/dashboard/` | Admin dashboard |
| `app/inventory/` | Inventory management |

## 🔑 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔐 Routes & Access

| Route | Access | Purpose |
|-------|--------|---------|
| `/` | Public | Home page |
| `/auth/login` | Public | Login |
| `/auth/signup` | Public | Sign up |
| `/pos` | Cashier+ | POS interface |
| `/dashboard` | Admin | Analytics dashboard |
| `/inventory` | Admin | Inventory management |

## 📦 Common Server Actions

### Auth
```typescript
await signUp({ email, password, full_name, confirm_password })
await signIn({ email, password })
await updateUserRole(userId, 'admin' | 'cashier')
```

### Products
```typescript
await getProducts()
await getProductById(productId)
await searchProducts(query)
await createProduct({ sku, name, price, cost, ... })
await updateProduct(productId, { price, quantity_on_hand, ... })
await getLowStockProducts()
```

### Orders
```typescript
await createOrder(cashierId, items, paymentMethod, notes)
await getOrderById(orderId)
await getAllOrders(limit)
await getOrdersByDateRange(startDate, endDate)
await cancelOrder(orderId, userId)
```

### Inventory
```typescript
await updateStock(productId, quantityChange, 'stock_in', userId, notes)
await getInventoryLogs(productId)
await getInventoryValue()
```

### Analytics
```typescript
await getDailySales(date)
await getBestSellingProducts(limit, startDate, endDate)
```

## 🪝 Custom Hooks

```typescript
// Auth & User
const { user, loading, error, signOut } = useAuth()
const { profile, loading, error } = useUserProfile()
const { role, isAdmin, isCashier } = useUserRole()
const { isAuthorized } = useProtectedRoute('admin')

// UI & State
const { toasts, success, error, warning, info } = useToast()
const { isOpen, open, close, toggle } = useModal()
const { data, loading, error, refetch } = useFetch(url)
const { values, errors, handleChange, resetForm } = useFormState(initial)

// Realtime
const { data, loading } = useSupabaseSubscription(table, 'UPDATE')

// Utils
const debouncedValue = useDebounce(value, 500)
const { currentPage, goToPage, nextPage, prevPage } = usePagination(total, 10)
```

## 🎨 UI Components

```typescript
// Import
import { 
  Button, Card, Input, Select, TextArea, Modal, Alert,
  Badge, Spinner, Table
} from '@/components/ui'

// Button
<Button variant="primary" size="md" isLoading={loading} onClick={...}>
  Click me
</Button>

// Input
<Input type="email" label="Email" error={error} placeholder="..." />

// Modal
<Modal isOpen={open} onClose={close} title="Dialog" size="md">
  {/* content */}
</Modal>

// Table
<Table columns={columns} data={data} isLoading={loading} />

// Alert
<Alert type="success" title="Done" message="Order created!" />
```

## 📊 Utility Functions

```typescript
// Formatting
formatCurrency(99.99)           // "$99.99"
formatDate(new Date())           // "Jan 20, 2024"
formatDateTime(new Date())       // "Jan 20, 2024, 02:30 PM"
formatTime(new Date())           // "02:30 PM"
truncateString(str, 50)          // "Long text..."

// Calculations
calculateTax(100, 10)            // 10
calculateLineTotal(10, 5, 10)    // { subtotal: 50, tax: 5, total: 55 }
calculateCartTotals(items)       // { subtotal, tax, total }
calculateInventoryValue(products) // 5000

// Validation
isValidEmail(email)              // true|false
isValidPrice(29.99)              // true|false
isValidSKU('PROD001')            // true|false
isStrongPassword(pwd)            // true|false

// Generation
generateOrderNumber()            // "ORD-20240120-143022-5631"

// Date
getStartOfDay(date)
getEndOfDay(date)
getDateRange('day' | 'week' | 'month')

// Array
groupBy(array, 'key')
sortBy(array, 'key', 'asc' | 'desc')
uniqueBy(array, 'key')
```

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles & roles |
| `categories` | Product categories |
| `products` | Products with pricing |
| `orders` | Order headers |
| `order_items` | Items in orders |
| `inventory_logs` | Stock transaction history |
| `daily_sales` | Sales aggregates |

## 🔒 Security Checklist

- [ ] Service Role Key in `.env.local` only (not exposed)
- [ ] All DB writes through Server Actions
- [ ] Input validation on every mutation
- [ ] RLS enabled on all tables
- [ ] Middleware protects admin routes
- [ ] No sensitive data in localStorage
- [ ] HTTPS in production
- [ ] Rate limiting implemented

## 📋 Common Patterns

### Protected Route
```typescript
'use client';
import { useProtectedRoute } from '@/lib/hooks';

export default function AdminPage() {
  const { isAuthorized } = useProtectedRoute('admin');
  if (!isAuthorized) return <div>Access Denied</div>;
  return <div>Admin Content</div>;
}
```

### Server Action with Error Handling
```typescript
const result = await someAction();
if (!result.success) {
  error(result.error);
  return;
}
success(result.message);
// Use result.data
```

### Real-time Subscription
```typescript
const { data: products } = useSupabaseSubscription(
  'products',
  'UPDATE'
);
```

### Form with Validation
```typescript
const { values, errors, handleChange, resetForm } = useFormState({
  email: '',
  password: ''
});

return (
  <Input
    name="email"
    value={values.email}
    onChange={handleChange}
    error={errors.email}
  />
);
```

## 🐛 Debugging Tips

1. **Check console** for error messages: `npm run dev`
2. **Verify .env.local** has correct values
3. **Check Supabase dashboard** for data
4. **Use React DevTools** to inspect components
5. **Check RLS policies** if getting permission errors
6. **Look at middleware logs** for route issues
7. **Verify JWT token** in network tab
8. **Check SQL logs** in Supabase

## 🚀 Deployment

### Netlify
1. Push to GitHub
2. Connect repo on Netlify
3. Add environment variables
4. Deploy

### Vercel
1. Import repository
2. Add environment variables
3. Deploy

### Custom Server
```bash
npm run build
npm start
# Or with PM2:
pm2 start "npm start"
```

## 📚 Documentation

- `README.md` - Project overview
- `SETUP_GUIDE.md` - Installation & deployment
- `API_DOCUMENTATION.md` - Complete API reference
- `database_schema.sql` - Database structure
- Code comments - Implementation details

## 💡 Pro Tips

1. **Reuse hooks** instead of duplicating logic
2. **Use Server Actions** for all DB operations
3. **Type everything** with TypeScript
4. **Validate inputs** before DB writes
5. **Handle errors gracefully** with try-catch
6. **Subscribe to real-time** only when needed
7. **Unsubscribe** when component unmounts
8. **Use const assertions** for immutable data

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Create pull request
5. Code review & merge

## 📞 Support

- Check documentation files
- Review code comments
- Check Supabase docs
- Check Next.js docs
- Review GitHub issues

---

**Quick Start**: 
```bash
npm install && npm run dev
# Go to http://localhost:3000
```

**Demo Login**: 
- Email: admin@example.com
- Password: Test@1234

---

**Version**: 1.0.0  
**Last Updated**: January 2024
