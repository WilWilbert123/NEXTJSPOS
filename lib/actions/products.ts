'use server';

/**
 * Server Actions for Products & Inventory
 * Secure server-side product and inventory operations
 */

import { createServerSupabaseClient } from '@/lib/supabase';
import {
  ApiResponse,
  Product,
  Category,
  CreateProductFormData,
  InventoryLog,
} from '@/lib/types';
import { isValidPrice, isValidSKU } from '@/lib/utils';

// ============================================================================
// CATEGORY ACTIONS
// ============================================================================

/**
 * Get all active categories
 */
export async function getCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

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
 * Create new category (Admin only)
 */
export async function createCategory(
  name: string,
  description?: string,
  icon?: string
): Promise<ApiResponse<Category>> {
  try {
    if (!name || name.trim().length === 0) {
      return {
        success: false,
        error: 'Category name is required',
      };
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: name.trim(),
        description,
        icon,
      })
      .select()
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
      message: 'Category created successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Update category (Admin only)
 */
export async function updateCategory(
  categoryId: string,
  updates: Partial<Category>
): Promise<ApiResponse<Category>> {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
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
      message: 'Category updated successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}

// ============================================================================
// PRODUCT ACTIONS
// ============================================================================

/**
 * Get all active products with categories
 */
export async function getProducts(): Promise<ApiResponse<Product[]>> {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('products')
      .select(
        `
        *,
        categories:category_id (*)
        `
      )
      .eq('is_active', true)
      .order('name', { ascending: true });

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
 * Get product by ID
 */
export async function getProductById(productId: string): Promise<ApiResponse<Product>> {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('products')
      .select(
        `
        *,
        categories:category_id (*)
        `
      )
      .eq('id', productId)
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
 * Get products by category
 */
export async function getProductsByCategory(
  categoryId: string
): Promise<ApiResponse<Product[]>> {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('name', { ascending: true });

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
 * Create new product (Admin only)
 */
export async function createProduct(
  data: CreateProductFormData
): Promise<ApiResponse<Product>> {
  try {
    // Validate input
    if (!isValidSKU(data.sku)) {
      return {
        success: false,
        error: 'Invalid SKU format',
      };
    }

    if (!isValidPrice(data.price) || !isValidPrice(data.cost)) {
      return {
        success: false,
        error: 'Price and cost must be non-negative numbers',
      };
    }

    if (!data.name || data.name.trim().length === 0) {
      return {
        success: false,
        error: 'Product name is required',
      };
    }

    const supabase = createServerSupabaseClient();

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        category_id: data.category_id,
        sku: data.sku.toUpperCase(),
        name: data.name.trim(),
        description: data.description,
        price: data.price,
        cost: data.cost,
        tax_rate: data.tax_rate,
        reorder_level: data.reorder_level,
        image_url: data.image_url,
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: product,
      message: 'Product created successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Update product (Admin only)
 */
export async function updateProduct(
  productId: string,
  updates: Partial<Product>
): Promise<ApiResponse<Product>> {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
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
      message: 'Product updated successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Delete product (Admin only)
 */
export async function deleteProduct(productId: string): Promise<ApiResponse<null>> {
  try {
    const supabase = createServerSupabaseClient();

    // Soft delete - set is_active to false
    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', productId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Search products by name or SKU
 */
export async function searchProducts(query: string): Promise<ApiResponse<Product[]>> {
  try {
    if (!query || query.trim().length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    const supabase = createServerSupabaseClient();
    const searchTerm = `%${query.trim()}%`;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.${searchTerm},sku.ilike.${searchTerm}`)
      .limit(20);

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

// ============================================================================
// INVENTORY ACTIONS
// ============================================================================

/**
 * Get low stock products (quantity <= reorder_level)
 */
export async function getLowStockProducts(): Promise<ApiResponse<Product[]>> {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .filter('quantity_on_hand', 'lte', 'reorder_level')
      .order('quantity_on_hand', { ascending: true });

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
 * Update stock (Stock in / Adjustment)
 */
export async function updateStock(
  productId: string,
  quantityChange: number,
  transactionType: 'stock_in' | 'adjustment' | 'return',
  userId: string,
  notes?: string
): Promise<ApiResponse<{ product: Product; log: InventoryLog }>> {
  try {
    const supabase = createServerSupabaseClient();

    // Update product quantity
    const { data: product, error: updateError } = await supabase
      .from('products')
      .update({
        quantity_on_hand: supabase.from('products').select('quantity_on_hand').eq('id', productId),
      })
      .eq('id', productId)
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        error: updateError.message,
      };
    }

    // Log transaction
    const { data: log, error: logError } = await supabase
      .from('inventory_logs')
      .insert({
        product_id: productId,
        transaction_type: transactionType,
        quantity_change: quantityChange,
        notes,
        created_by: userId,
      })
      .select()
      .single();

    if (logError) {
      return {
        success: false,
        error: logError.message,
      };
    }

    return {
      success: true,
      data: { product, log },
      message: 'Stock updated successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Get inventory logs for product
 */
export async function getInventoryLogs(
  productId: string
): Promise<ApiResponse<InventoryLog[]>> {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('inventory_logs')
      .select(
        `
        *,
        products:product_id (*)
        `
      )
      .eq('product_id', productId)
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
 * Calculate total inventory value
 */
export async function getInventoryValue(): Promise<ApiResponse<number>> {
  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('products')
      .select('quantity_on_hand, cost')
      .eq('is_active', true);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    const totalValue = (data || []).reduce((sum, product) => {
      return sum + product.quantity_on_hand * product.cost;
    }, 0);

    return {
      success: true,
      data: totalValue,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}
