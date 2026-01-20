/**
 * POS System Main Page
 * Point of Sale interface with product listing and checkout
 */

'use client';

import { useState, useEffect } from 'react';
import { getProducts, searchProducts } from '@/lib/actions/products';
import { createOrder } from '@/lib/actions/orders';
import { useUserProfile, useToast, useModal } from '@/lib/hooks';
import { CartItem, Product, Order as OrderType } from '@/lib/types';
import { calculateCartTotals, calculateLineTotal } from '@/lib/utils';
import { POSCart, Receipt } from '@/components/pos/cart';
import { Input, Button, Select, Modal, Spinner, Badge } from '@/components/ui';
import { ShoppingCart, Search, LogOut } from 'lucide-react';

export default function POSPage() {
  const { profile } = useUserProfile();
  const { success, error } = useToast();
  const { isOpen: isCheckoutOpen, open: openCheckout, close: closeCheckout } = useModal();
  const { isOpen: isReceiptOpen, open: openReceipt, close: closeReceipt } = useModal();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile'>('cash');
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [lastOrder, setLastOrder] = useState<OrderType | null>(null);

  // Calculations
  const orderItems = cart.map((item) => ({
    quantity: item.quantity,
    unit_price: item.product.price,
    tax_rate: item.product.tax_rate,
  }));

  const { subtotal, tax, total } = calculateCartTotals(orderItems);

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Filter products based on search and category
  useEffect(() => {
    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category_id === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const result = await getProducts();
      if (result.success && result.data) {
        setProducts(result.data);
      } else {
        error(result.error || 'Failed to load products');
      }
    } catch (err) {
      error('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product_id: product.id, quantity: 1, product }];
    });
    success(`${product.name} added to cart`);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      error('Cart is empty');
      return;
    }

    if (!profile) {
      error('User profile not loaded');
      return;
    }

    setIsCheckoutLoading(true);
    try {
      const result = await createOrder(
        profile.id,
        cart,
        paymentMethod
      );

      if (result.success && result.data) {
        success(`Order ${result.data.order_number} created successfully!`);
        setLastOrder(result.data);
        setCart([]);
        closeCheckout();
        openReceipt();
      } else {
        error(result.error || 'Failed to create order');
      }
    } catch (err) {
      error('Failed to process checkout');
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handlePrintReceipt = () => {
    const element = document.getElementById('receipt');
    if (element) {
      const printWindow = window.open('', '', 'height=400,width=600');
      if (printWindow) {
        printWindow.document.write(element.innerHTML);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const categories = [...new Set(products.map((p) => p.category_id))];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">POS System</h1>
            <p className="text-sm text-gray-600">Welcome, {profile?.full_name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="primary">{cart.length} items in cart</Badge>
            <Button variant="ghost" size="sm">
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-3 space-y-4">
            {/* Search & Filter */}
            <div className="bg-white rounded-lg shadow p-4 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search by name or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Product Grid */}
              {loadingProducts ? (
                <div className="flex justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No products found
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
                      onClick={() => handleAddToCart(product)}
                    >
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      )}
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">SKU: {product.sku}</p>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-lg font-bold text-blue-600">
                            ${product.price.toFixed(2)}
                          </p>
                          {product.quantity_on_hand <= product.reorder_level && (
                            <Badge variant="warning" className="text-xs mt-1">
                              Low Stock
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product);
                          }}
                        >
                          <ShoppingCart size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <POSCart
              items={cart}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveFromCart}
              subtotal={subtotal}
              tax={tax}
              total={total}
              onCheckout={openCheckout}
              isCheckoutLoading={isCheckoutLoading}
            />
          </div>
        </div>
      </main>

      {/* Checkout Modal */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={closeCheckout}
        title="Checkout"
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) =>
              setPaymentMethod(e.target.value as 'cash' | 'card' | 'mobile')
            }
            options={[
              { value: 'cash', label: 'Cash' },
              { value: 'card', label: 'Card' },
              { value: 'mobile', label: 'Mobile Payment' },
            ]}
          />

          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax:</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={closeCheckout}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              isLoading={isCheckoutLoading}
              onClick={handleCheckout}
            >
              Complete Order
            </Button>
          </div>
        </div>
      </Modal>

      {/* Receipt Modal */}
      <Modal
        isOpen={isReceiptOpen}
        onClose={closeReceipt}
        title="Order Receipt"
        size="sm"
      >
        {lastOrder && (
          <div className="space-y-4">
            <div id="receipt" className="hidden">
              {/* Receipt content will be printed */}
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-sm">
              <p className="font-bold mb-2">Order: {lastOrder.order_number}</p>
              <p className="text-gray-600 mb-3">
                Total: <span className="font-bold text-lg">${lastOrder.total.toFixed(2)}</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={closeReceipt}
              >
                Close
              </Button>
              <Button
                className="flex-1"
                onClick={handlePrintReceipt}
              >
                Print Receipt
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
