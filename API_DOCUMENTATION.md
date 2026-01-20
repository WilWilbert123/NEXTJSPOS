# POS System API Documentation

Complete API reference for Server Actions and endpoints.

## Table of Contents

- [Authentication](#authentication)
- [Products](#products)
- [Orders](#orders)
- [Inventory](#inventory)
- [Analytics](#analytics)
- [Error Handling](#error-handling)

---

## Authentication

All authentication is handled via Supabase Auth. Server Actions use the user's JWT token for authorization.

### Sign Up

**Server Action**: `signUp`  
**Location**: `lib/actions/auth.ts`

```typescript
await signUp({
  email: string,
  password: string,
  full_name: string,
  confirm_password: string
})
```

**Response**:
```typescript
{
  success: boolean,
  data?: {
    user: AuthUser,
    profile: Profile
  },
  error?: string,
  message?: string
}
```

**Requirements**:
- Email: Valid email format
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- Passwords must match

**Example**:
```typescript
const result = await signUp({
  email: 'cashier@store.com',
  password: 'SecurePass123!',
  full_name: 'John Smith',
  confirm_password: 'SecurePass123!'
});

if (result.success) {
  console.log('User created:', result.data?.user.id);
}
```

---

### Sign In

**Server Action**: `signIn`  
**Location**: `lib/actions/auth.ts`

```typescript
await signIn({
  email: string,
  password: string
})
```

**Response**:
```typescript
{
  success: boolean,
  data?: {
    user: AuthUser,
    profile: Profile
  },
  error?: string
}
```

**Example**:
```typescript
const result = await signIn({
  email: 'admin@example.com',
  password: 'Test@1234'
});

if (result.success) {
  const role = result.data?.profile.role;
  // Redirect based on role
}
```

---

### Update User Profile

**Server Action**: `updateProfile`  
**Location**: `lib/actions/auth.ts`  
**Auth Required**: Yes (own profile)

```typescript
await updateProfile(userId: string, updates: Partial<Profile>)
```

**Example**:
```typescript
const result = await updateProfile(userId, {
  full_name: 'Updated Name',
  is_active: true
});
```

---

### Update User Role (Admin Only)

**Server Action**: `updateUserRole`  
**Location**: `lib/actions/auth.ts`  
**Auth Required**: Yes (Admin only)

```typescript
await updateUserRole(userId: string, role: 'admin' | 'cashier')
```

---

## Products

### Get All Products

**Server Action**: `getProducts`  
**Location**: `lib/actions/products.ts`

```typescript
await getProducts()
```

**Response**:
```typescript
{
  success: boolean,
  data?: Product[],
  error?: string
}
```

**Returns**: Array of all active products with categories

**Example**:
```typescript
const { data: products, success } = await getProducts();
if (success) {
  products.forEach(p => {
    console.log(p.name, p.price);
  });
}
```

---

### Get Product by ID

**Server Action**: `getProductById`  
**Location**: `lib/actions/products.ts`

```typescript
await getProductById(productId: string)
```

**Response**:
```typescript
{
  success: boolean,
  data?: Product,
  error?: string
}
```

**Example**:
```typescript
const { data: product } = await getProductById('uuid-here');
```

---

### Search Products

**Server Action**: `searchProducts`  
**Location**: `lib/actions/products.ts`

```typescript
await searchProducts(query: string)
```

**Searches by**: Name or SKU (case-insensitive)

**Response**:
```typescript
{
  success: boolean,
  data?: Product[],
  error?: string
}
```

**Example**:
```typescript
const { data: results } = await searchProducts('coffee');
```

---

### Create Product (Admin Only)

**Server Action**: `createProduct`  
**Location**: `lib/actions/products.ts`  
**Auth Required**: Yes (Admin only)

```typescript
await createProduct(data: CreateProductFormData)
```

**Parameters**:
```typescript
{
  category_id: string,
  sku: string,
  name: string,
  description?: string,
  price: number,
  cost: number,
  tax_rate: number,
  reorder_level: number,
  image_url?: string
}
```

**Response**:
```typescript
{
  success: boolean,
  data?: Product,
  error?: string,
  message?: string
}
```

**Validation**:
- SKU: 1-50 characters, must be unique
- Name: Required
- Price/Cost: Must be non-negative
- Tax Rate: Must be non-negative

**Example**:
```typescript
const result = await createProduct({
  category_id: 'uuid-of-category',
  sku: 'COFFEE-001',
  name: 'Premium Arabica Coffee',
  price: 12.99,
  cost: 5.00,
  tax_rate: 10,
  reorder_level: 20
});
```

---

### Update Product (Admin Only)

**Server Action**: `updateProduct`  
**Location**: `lib/actions/products.ts`  
**Auth Required**: Yes (Admin only)

```typescript
await updateProduct(productId: string, updates: Partial<Product>)
```

**Example**:
```typescript
const result = await updateProduct(productId, {
  price: 14.99,
  quantity_on_hand: 50,
  reorder_level: 15
});
```

---

### Get Low Stock Products

**Server Action**: `getLowStockProducts`  
**Location**: `lib/actions/products.ts`  
**Auth Required**: Yes (Admin only)

```typescript
await getLowStockProducts()
```

**Returns**: Products where `quantity_on_hand <= reorder_level`

---

### Get Product Categories

**Server Action**: `getCategories`  
**Location**: `lib/actions/products.ts`

```typescript
await getCategories()
```

**Response**:
```typescript
{
  success: boolean,
  data?: Category[],
  error?: string
}
```

---

## Orders

### Create Order

**Server Action**: `createOrder`  
**Location**: `lib/actions/orders.ts`  
**Auth Required**: Yes

```typescript
await createOrder(
  cashierId: string,
  items: CartItem[],
  paymentMethod: 'cash' | 'card' | 'mobile',
  notes?: string
)
```

**Parameters**:
```typescript
CartItem {
  product_id: string,
  quantity: number,
  product: Product
}
```

**Response**:
```typescript
{
  success: boolean,
  data?: Order,
  error?: string,
  message?: string
}
```

**Validation**:
- Cart cannot be empty
- All products must exist
- Sufficient inventory for all items
- Payment method must be valid

**Triggers**:
- Order created in `orders` table
- Order items created in `order_items` table
- Inventory updated (quantity reduced)
- Inventory logs created

**Example**:
```typescript
const result = await createOrder(
  userId,
  [
    {
      product_id: 'uuid1',
      quantity: 2,
      product: { /* product data */ }
    }
  ],
  'cash',
  'Regular customer'
);

if (result.success) {
  console.log(`Order created: ${result.data?.order_number}`);
}
```

---

### Get Order by ID

**Server Action**: `getOrderById`  
**Location**: `lib/actions/orders.ts`  
**Auth Required**: Yes

```typescript
await getOrderById(orderId: string)
```

**Response**:
```typescript
{
  success: boolean,
  data?: Order,
  error?: string
}
```

**Returns**: Order with all items and cashier info

---

### Get Orders by Cashier

**Server Action**: `getOrdersByCashier`  
**Location**: `lib/actions/orders.ts`  
**Auth Required**: Yes

```typescript
await getOrdersByCashier(cashierId: string, limit?: number)
```

**Returns**: All completed orders for cashier (max 50 by default)

---

### Get All Orders (Admin Only)

**Server Action**: `getAllOrders`  
**Location**: `lib/actions/orders.ts`  
**Auth Required**: Yes (Admin only)

```typescript
await getAllOrders(limit?: number)
```

**Returns**: All orders with cashier info (max 100 by default)

---

### Get Orders by Date Range (Admin Only)

**Server Action**: `getOrdersByDateRange`  
**Location**: `lib/actions/orders.ts`  
**Auth Required**: Yes (Admin only)

```typescript
await getOrdersByDateRange(
  startDate: string,
  endDate: string
)
```

**Format**: ISO 8601 strings (`'2024-01-01'`)

**Example**:
```typescript
const { data: orders } = await getOrdersByDateRange(
  '2024-01-01',
  '2024-01-31'
);
```

---

### Cancel Order (Admin Only)

**Server Action**: `cancelOrder`  
**Location**: `lib/actions/orders.ts`  
**Auth Required**: Yes (Admin only)

```typescript
await cancelOrder(orderId: string, userId: string)
```

**Effects**:
- Order status set to 'cancelled'
- Inventory restored for all items
- Reverse transaction logs created

---

## Inventory

### Update Stock (Stock In/Adjustment)

**Server Action**: `updateStock`  
**Location**: `lib/actions/products.ts`  
**Auth Required**: Yes (Admin only)

```typescript
await updateStock(
  productId: string,
  quantityChange: number,
  transactionType: 'stock_in' | 'adjustment' | 'return',
  userId: string,
  notes?: string
)
```

**Response**:
```typescript
{
  success: boolean,
  data?: {
    product: Product,
    log: InventoryLog
  },
  error?: string
}
```

**Example**:
```typescript
// Add 50 units of coffee
const result = await updateStock(
  productId,
  50,
  'stock_in',
  userId,
  'Weekly delivery'
);
```

---

### Get Inventory Logs

**Server Action**: `getInventoryLogs`  
**Location**: `lib/actions/products.ts`  
**Auth Required**: Yes (Admin only)

```typescript
await getInventoryLogs(productId: string)
```

**Returns**: All transactions for product (newest first)

**Types**: 'sale' | 'stock_in' | 'adjustment' | 'return'

---

### Get Inventory Value

**Server Action**: `getInventoryValue`  
**Location**: `lib/actions/products.ts`  
**Auth Required**: Yes (Admin only)

```typescript
await getInventoryValue()
```

**Returns**: Total inventory value (sum of quantity × cost)

**Example**:
```typescript
const { data: totalValue } = await getInventoryValue();
console.log(`Inventory worth: $${totalValue}`);
```

---

## Analytics

### Get Daily Sales

**Server Action**: `getDailySales`  
**Location**: `lib/actions/orders.ts`  
**Auth Required**: Yes (Admin only)

```typescript
await getDailySales(date: string)
```

**Format**: ISO date string (`'2024-01-20'`)

**Returns**: Total sales for that day

**Example**:
```typescript
const { data: sales } = await getDailySales('2024-01-20');
console.log(`Today's sales: $${sales}`);
```

---

### Get Best Selling Products

**Server Action**: `getBestSellingProducts`  
**Location**: `lib/actions/orders.ts`  
**Auth Required**: Yes (Admin only)

```typescript
await getBestSellingProducts(
  limit?: number,
  startDate?: string,
  endDate?: string
)
```

**Response**:
```typescript
{
  product_id: string,
  product_name: string,
  quantity_sold: number,
  revenue: number
}[]
```

**Example**:
```typescript
// Top 10 products for January
const { data: topProducts } = await getBestSellingProducts(
  10,
  '2024-01-01',
  '2024-01-31'
);

topProducts.forEach(p => {
  console.log(`${p.product_name}: ${p.quantity_sold} sold, $${p.revenue}`);
});
```

---

## Error Handling

### Response Format

All Server Actions return `ApiResponse<T>`:

```typescript
{
  success: boolean,      // true if operation succeeded
  data?: T,             // Result data if successful
  error?: string,       // Error message if failed
  message?: string      // Success message
}
```

### Error Types

**Common Errors**:
```
"Invalid email format"
"Password must be at least 8 characters..."
"Product not found"
"Insufficient stock for product"
"RLS policy denies access"
"User not authenticated"
```

### Error Handling Pattern

```typescript
try {
  const result = await someAction();
  
  if (!result.success) {
    console.error(result.error);
    // Show error toast
    return;
  }
  
  // Use result.data
  console.log(result.data);
  
} catch (error) {
  console.error('Unexpected error:', error);
}
```

---

## Type Definitions

All types are defined in `lib/types/index.ts`:

```typescript
// User
interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'cashier';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Product
interface Product {
  id: string;
  category_id: string;
  sku: string;
  name: string;
  price: number;
  cost: number;
  tax_rate: number;
  quantity_on_hand: number;
  reorder_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Order
interface Order {
  id: string;
  cashier_id: string;
  order_number: string;
  status: 'pending' | 'completed' | 'cancelled';
  subtotal: number;
  tax_total: number;
  total: number;
  payment_method: 'cash' | 'card' | 'mobile';
  created_at: string;
  updated_at: string;
}

// Cart Item
interface CartItem {
  product_id: string;
  quantity: number;
  product: Product;
}
```

---

## Usage Examples

### Complete Checkout Flow

```typescript
import { getProducts, createOrder } from '@/lib/actions/orders';
import { useUserProfile, useToast } from '@/lib/hooks';

export function CheckoutFlow() {
  const { profile } = useUserProfile();
  const { success, error } = useToast();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');

  const handleCheckout = async () => {
    if (!profile) return;
    
    const result = await createOrder(
      profile.id,
      cart,
      paymentMethod
    );

    if (result.success) {
      success(`Order ${result.data?.order_number} created!`);
      setCart([]);
    } else {
      error(result.error || 'Checkout failed');
    }
  };

  return null;
}
```

### Admin Analytics

```typescript
import { getAllOrders, getBestSellingProducts } from '@/lib/actions/orders';

export function AnalyticsDashboard() {
  const [orders, setOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    async function loadData() {
      const ordersRes = await getAllOrders();
      const productsRes = await getBestSellingProducts(10);
      
      if (ordersRes.success) setOrders(ordersRes.data || []);
      if (productsRes.success) setTopProducts(productsRes.data || []);
    }
    
    loadData();
  }, []);

  return null;
}
```

---

**Last Updated**: January 2024  
**Version**: 1.0.0
