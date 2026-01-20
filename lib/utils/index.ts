/**
 * Utility Functions for POS System
 * Formatting, calculations, and data manipulation
 */

// ============================================================================
// CURRENCY & FORMATTING
// ============================================================================

/**
 * Format number as currency (USD)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

/**
 * Format number with 2 decimal places
 */
export const formatDecimal = (num: number, decimals = 2): number => {
  return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format datetime with time
 */
export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format time only
 */
export const formatTime = (date: string | Date): string => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ============================================================================
// CALCULATIONS
// ============================================================================

/**
 * Calculate tax amount
 */
export const calculateTax = (amount: number, taxRate: number): number => {
  return formatDecimal(amount * (taxRate / 100));
};

/**
 * Calculate line total (unit_price * quantity)
 */
export const calculateLineTotal = (
  unitPrice: number,
  quantity: number,
  taxRate: number
): { subtotal: number; tax: number; total: number } => {
  const subtotal = formatDecimal(unitPrice * quantity);
  const tax = calculateTax(subtotal, taxRate);
  const total = formatDecimal(subtotal + tax);

  return { subtotal, tax, total };
};

/**
 * Calculate cart totals
 */
export const calculateCartTotals = (
  items: Array<{ quantity: number; unit_price: number; tax_rate: number }>
): { subtotal: number; tax: number; total: number } => {
  let subtotal = 0;
  let tax = 0;

  items.forEach((item) => {
    const itemSubtotal = item.quantity * item.unit_price;
    const itemTax = calculateTax(itemSubtotal, item.tax_rate);

    subtotal += itemSubtotal;
    tax += itemTax;
  });

  return {
    subtotal: formatDecimal(subtotal),
    tax: formatDecimal(tax),
    total: formatDecimal(subtotal + tax),
  };
};

/**
 * Calculate inventory value
 */
export const calculateInventoryValue = (
  products: Array<{ quantity_on_hand: number; cost: number }>
): number => {
  return formatDecimal(
    products.reduce((sum, product) => sum + product.quantity_on_hand * product.cost, 0)
  );
};

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Requires: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
export const isStrongPassword = (password: string): boolean => {
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongRegex.test(password);
};

/**
 * Validate SKU format
 */
export const isValidSKU = (sku: string): boolean => {
  return sku.length > 0 && sku.length <= 50;
};

/**
 * Validate price
 */
export const isValidPrice = (price: number): boolean => {
  return price >= 0 && !isNaN(price);
};

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Generate unique order number
 * Format: ORD-YYYYMMDD-HHmmss-XXXX
 */
export const generateOrderNumber = (): string => {
  const now = new Date();
  const date = now
    .toISOString()
    .split('T')[0]
    .replace(/-/g, '');
  const time = now
    .toTimeString()
    .split(' ')[0]
    .replace(/:/g, '');
  const random = Math.random()
    .toString()
    .substring(2, 6)
    .padEnd(4, '0');

  return `ORD-${date}-${time}-${random}`;
};

/**
 * Truncate string to max length with ellipsis
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
};

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Group array by key
 */
export const groupBy = <T,>(
  array: T[],
  key: keyof T
): Record<string, T[]> => {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key]);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
};

/**
 * Sort array by key
 */
export const sortBy = <T,>(
  array: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Remove duplicates from array
 */
export const uniqueBy = <T,>(
  array: T[],
  key: keyof T
): T[] => {
  return array.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t[key] === item[key])
  );
};

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Get start of day
 */
export const getStartOfDay = (date: Date = new Date()): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

/**
 * Get end of day
 */
export const getEndOfDay = (date: Date = new Date()): Date => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

/**
 * Get date range for period
 */
export const getDateRange = (period: 'day' | 'week' | 'month') => {
  const end = new Date();
  const start = new Date();

  switch (period) {
    case 'day':
      return { start: getStartOfDay(start), end: getEndOfDay(end) };
    case 'week':
      start.setDate(start.getDate() - start.getDay());
      return { start: getStartOfDay(start), end: getEndOfDay(end) };
    case 'month':
      start.setDate(1);
      return { start: getStartOfDay(start), end: getEndOfDay(end) };
  }
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Format error message for display
 */
export const formatErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

/**
 * Log error for debugging (can be extended for monitoring services)
 */
export const logError = (error: unknown, context?: string): void => {
  console.error(
    `[${context || 'Error'}] ${formatErrorMessage(error)}`,
    error
  );
};
