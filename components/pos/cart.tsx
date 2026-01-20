/**
 * POS Cart Component
 * Shopping cart with product management and checkout
 */

'use client';

import { CartItem, Product } from '@/lib/types';
import { Button } from '@/components/ui';
import { formatCurrency, calculateLineTotal } from '@/lib/utils';
import { Trash2, Plus, Minus } from 'lucide-react';

interface POSCartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  subtotal: number;
  tax: number;
  total: number;
  onCheckout: () => void;
  isCheckoutLoading?: boolean;
}

export const POSCart: React.FC<POSCartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  subtotal,
  tax,
  total,
  onCheckout,
  isCheckoutLoading = false,
}) => {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-full flex flex-col items-center justify-center">
        <p className="text-gray-400 text-center">Cart is empty</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden flex flex-col h-full">
      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.map((item) => {
          const lineTotal = item.product.price * item.quantity;
          
          return (
            <div
              key={item.product_id}
              className="bg-gray-50 rounded-lg p-3 border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-gray-500">SKU: {item.product.sku}</p>
                </div>
                <button
                  onClick={() => onRemoveItem(item.product_id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() =>
                    onUpdateQuantity(item.product_id, Math.max(1, item.quantity - 1))
                  }
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    onUpdateQuantity(item.product_id, parseInt(e.target.value) || 1)
                  }
                  className="w-12 text-center border border-gray-300 rounded px-2 py-1"
                />
                <button
                  onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Plus size={14} />
                </button>
                <span className="text-xs text-gray-600 ml-auto">
                  {formatCurrency(item.product.price)}
                </span>
              </div>

              <div className="text-right text-sm font-semibold text-gray-900">
                {formatCurrency(lineTotal)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="border-t border-gray-200 p-4 space-y-2 bg-gray-50">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax:</span>
          <span className="font-medium">{formatCurrency(tax)}</span>
        </div>
        <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between text-lg">
          <span className="font-bold text-gray-900">Total:</span>
          <span className="font-bold text-blue-600">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="p-4 bg-white border-t border-gray-200">
        <Button
          onClick={onCheckout}
          isLoading={isCheckoutLoading}
          className="w-full"
          size="lg"
        >
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// RECEIPT PREVIEW COMPONENT
// ============================================================================

interface ReceiptProps {
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  timestamp: Date;
  cashierName?: string;
}

export const Receipt: React.FC<ReceiptProps> = ({
  orderNumber,
  items,
  subtotal,
  tax,
  total,
  paymentMethod,
  timestamp,
  cashierName,
}) => {
  return (
    <div className="bg-white p-6 max-w-sm mx-auto font-mono text-sm" id="receipt">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-400 pb-4 mb-4">
        <h1 className="text-2xl font-bold">RECEIPT</h1>
        <p className="text-gray-600">{orderNumber}</p>
        <p className="text-gray-600 text-xs">
          {timestamp.toLocaleDateString()} {timestamp.toLocaleTimeString()}
        </p>
      </div>

      {/* Items */}
      <div className="border-b border-gray-400 pb-4 mb-4">
        <div className="flex justify-between mb-2 text-xs font-bold">
          <span>ITEM</span>
          <span>QTY</span>
          <span className="text-right">TOTAL</span>
        </div>
        {items.map((item) => (
          <div key={item.product_id} className="flex justify-between text-xs mb-1">
            <span>{item.product.name}</span>
            <span>{item.quantity}x</span>
            <span className="text-right">
              {formatCurrency(item.product.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-1 mb-4">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax:</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between text-base font-bold border-t border-gray-400 pt-2">
          <span>TOTAL:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Payment */}
      <div className="text-center border-t border-gray-400 pt-4 text-xs">
        <p>Payment Method: {paymentMethod.toUpperCase()}</p>
        {cashierName && <p>Cashier: {cashierName}</p>}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-600 mt-4 pt-4 border-t border-gray-400">
        <p>Thank you for your purchase!</p>
        <p>Please keep your receipt</p>
      </div>
    </div>
  );
};
