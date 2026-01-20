/**
 * Type Definitions for POS System
 * Centralized TypeScript interfaces and types
 */

export type UserRole = 'admin' | 'cashier';

export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export type PaymentMethod = 'cash' | 'card' | 'mobile';

export type TransactionType = 'sale' | 'stock_in' | 'adjustment' | 'return';

// ============================================================================
// USER & AUTH TYPES
// ============================================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  store_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile;
}

// ============================================================================
// PRODUCT & INVENTORY TYPES
// ============================================================================

export interface Category {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  cost: number;
  tax_rate: number;
  quantity_on_hand: number;
  reorder_level: number;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface InventoryLog {
  id: string;
  product_id: string;
  transaction_type: TransactionType;
  quantity_change: number;
  reference_id: string | null;
  reference_type: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  product?: Product;
}

// ============================================================================
// ORDER & TRANSACTION TYPES
// ============================================================================

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  line_total: number;
  created_at: string;
  product?: Product;
}

export interface Order {
  id: string;
  cashier_id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  tax_total: number;
  total: number;
  payment_method: PaymentMethod;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  cashier?: Profile;
}

// ============================================================================
// POS CART TYPES
// ============================================================================

export interface CartItem {
  product_id: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax_total: number;
  total: number;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface DailySales {
  id: string;
  sale_date: string;
  total_sales: number;
  total_transactions: number;
  total_items_sold: number;
  avg_transaction: number;
  created_at: string;
  updated_at: string;
}

export interface SalesMetrics {
  daily_total: number;
  weekly_total: number;
  monthly_total: number;
  transaction_count: number;
  avg_transaction_value: number;
  best_selling_products: ProductSalesData[];
  low_stock_products: Product[];
  inventory_value: number;
}

export interface ProductSalesData {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
  product?: Product;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignUpFormData extends LoginFormData {
  full_name: string;
  confirm_password: string;
}

export interface CreateProductFormData {
  category_id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  tax_rate: number;
  reorder_level: number;
  image_url?: string;
}

export interface CreateOrderFormData {
  items: CartItem[];
  payment_method: PaymentMethod;
  notes?: string;
}
