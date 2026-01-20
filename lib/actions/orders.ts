'use server';

/**
 * Server Actions for Orders & Checkout
 * Secure server-side order processing
 */

import { createServerSupabaseClient } from '@/lib/supabase';
import { ApiResponse, Order, OrderItem, CartItem, Product } from '@/lib/types';
import { generateOrderNumber, calculateCartTotals, formatDecimal } from '@/lib/utils';

// ============================================================================
// ORDER ACTIONS
// ============================================================================

/**
 * Create new order from cart
 * Handles inventory update, order creation, and order items
 */
export async function createOrder(
  cashierId: string,
  items: CartItem[],
  paymentMethod: 'cash' | 'card' | 'mobile',
  notes?: string
): Promise<ApiResponse<Order>> {
  try {
    // Validate cart
    if (!items || items.length === 0) {
      return {
        success: false,
        error: 'Cart is empty',
      };
    }

    const supabase = createServerSupabaseClient();

    // Validate product availability
    for (const cartItem of items) {
      const { data: product, error } = await supabase
        .from('products')
        .select('quantity_on_hand')
        .eq('id', cartItem.product_id)
        .single();

      if (error || !product) {
        return {
          success: false,
          error: `Product not found: ${cartItem.product_id}`,
        };
      }

      if (product.quantity_on_hand < cartItem.quantity) {
        return {
          success: false,
          error: `Insufficient stock for product: ${cartItem.product.name}`,
        };
      }
    }

    // Calculate totals
    const orderItems = items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.product.price,
      tax_rate: item.product.tax_rate,
    }));

    const totals = calculateCartTotals(orderItems);
    const orderNumber = generateOrderNumber();

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        cashier_id: cashierId,
        order_number: orderNumber,
        status: 'completed',
        subtotal: totals.subtotal,
        tax_total: totals.tax,
        total: totals.total,
        payment_method: paymentMethod,
        notes,
      })
      .select()
      .single();

    if (orderError || !order) {
      return {
        success: false,
        error: orderError?.message || 'Failed to create order',
      };
    }

    // Create order items
    const lineItems = items.map((item) => {
      const { subtotal, tax, total } = calculateCartTotals([
        {
          quantity: item.quantity,
          unit_price: item.product.price,
          tax_rate: item.product.tax_rate,
        },
      ]);

      return {
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.product.price,
        tax_rate: item.product.tax_rate,
        line_total: total,
      };
    });

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(lineItems);

    if (itemsError) {
      // Soft delete order if items creation fails
      await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', order.id);

      return {
        success: false,
        error: 'Failed to create order items',
      };
    }

    // Update inventory (trigger will handle this via database function)
    // The update_inventory_on_order trigger will automatically:
    // 1. Reduce quantity_on_hand for each product
    // 2. Create inventory_logs entries

    return {
      success: true,
      data: order,
      message: `Order ${orderNumber} created successfully`,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Get order by ID with items
 */
export async function getOrderById(orderId: string): Promise<ApiResponse<Order>> {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        cashier:cashier_id (
          id,
          email,
          full_name,
          role
        ),
        items:order_items (
          *,
          product:product_id (*)
        )
        `
      )
      .eq('id', orderId)
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Get orders by cashier
 */
export async function getOrdersByCashier(
  cashierId: string,
  limit = 50
): Promise<ApiResponse<Order[]>> {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        items:order_items (*)
        `
      )
      .eq('cashier_id', cashierId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Get all orders (Admin only)
 */
export async function getAllOrders(
  limit = 100
): Promise<ApiResponse<Order[]>> {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('orders')
      .select(
        `
        *,
        cashier:cashier_id (
          id,
          email,
          full_name
        ),
        items:order_items (
          *,
          product:product_id (name, sku)
        )
        `
      )
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Get orders by date range (Admin only)
 */
export async function getOrdersByDateRange(
  startDate: string,
  endDate: string
): Promise<ApiResponse<Order[]>> {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Get order items for an order
 */
export async function getOrderItems(orderId: string): Promise<ApiResponse<OrderItem[]>> {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('order_items')
      .select(
        `
        *,
        product:product_id (
          id,
          name,
          sku,
          category_id
        )
        `
      )
      .eq('order_id', orderId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Cancel order (Admin only)
 * Also restores inventory
 */
export async function cancelOrder(orderId: string, userId: string): Promise<ApiResponse<Order>> {
  try {
    const supabase = createServerSupabaseClient();

    // Get order items first
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsError || !orderItems) {
      return {
        success: false,
        error: 'Failed to fetch order items',
      };
    }

    // Restore inventory
    for (const item of orderItems) {
      // Update product quantity (add back)
      await supabase.rpc('increment', {
        row_id: item.product_id,
        amount: item.quantity,
      });

      // Log reverse transaction
      await supabase.from('inventory_logs').insert({
        product_id: item.product_id,
        transaction_type: 'return',
        quantity_change: item.quantity,
        reference_id: orderId,
        reference_type: 'order',
        notes: `Order ${orderId} cancelled - inventory restored`,
        created_by: userId,
      });
    }

    // Cancel order
    const { data: order, error: cancelError } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .select()
      .single();

    if (cancelError) {
      return {
        success: false,
        error: cancelError.message,
      };
    }

    return {
      success: true,
      data: order,
      message: 'Order cancelled and inventory restored',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}

// ============================================================================
// ANALYTICS & REPORTING
// ============================================================================

/**
 * Get daily sales
 */
export async function getDailySales(date: string): Promise<ApiResponse<number>> {
  try {
    const supabase = createServerSupabaseClient();

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('orders')
      .select('total')
      .eq('status', 'completed')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    const totalSales = (data || []).reduce((sum, order) => sum + (order.total || 0), 0);

    return {
      success: true,
      data: formatDecimal(totalSales),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Get best selling products
 */
export async function getBestSellingProducts(
  limit = 10,
  startDate?: string,
  endDate?: string
): Promise<
  ApiResponse<
    Array<{
      product_id: string;
      product_name: string;
      quantity_sold: number;
      revenue: number;
    }>
  >
> {
  try {
    const supabase = createServerSupabaseClient();

    let query = supabase
      .from('order_items')
      .select(
        `
        product_id,
        quantity,
        line_total,
        products:product_id (name)
        `
      );

    if (startDate && endDate) {
      query = query
        .gte('created_at', startDate)
        .lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Group and aggregate
    const grouped = (data || []).reduce(
      (acc, item) => {
        const productId = item.product_id;
        if (!acc[productId]) {
          acc[productId] = {
            product_id: productId,
            product_name: item.products?.name || 'Unknown',
            quantity_sold: 0,
            revenue: 0,
          };
        }
        acc[productId].quantity_sold += item.quantity;
        acc[productId].revenue += item.line_total;
        return acc;
      },
      {} as Record<
        string,
        {
          product_id: string;
          product_name: string;
          quantity_sold: number;
          revenue: number;
        }
      >
    );

    const results = Object.values(grouped)
      .sort((a, b) => b.quantity_sold - a.quantity_sold)
      .slice(0, limit);

    return {
      success: true,
      data: results,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}
