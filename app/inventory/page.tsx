/**
 * Inventory Management Page
 * Admin interface for product and inventory management
 */

'use client';

import { useState, useEffect } from 'react';
import { getProducts, getLowStockProducts, updateProduct } from '@/lib/actions/products';
import { useToast, useModal } from '@/lib/hooks';
import { Product } from '@/lib/types';
import { Button, Card, Input, Select, Modal, Table, Spinner, Alert, Badge } from '@/components/ui';
import { AlertTriangle, Edit, Trash2, Plus } from 'lucide-react';

export default function InventoryPage() {
  const { success, error } = useToast();
  const { isOpen: isEditOpen, open: openEdit, close: closeEdit } = useModal();

  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editData, setEditData] = useState({
    price: 0,
    cost: 0,
    quantity_on_hand: 0,
    reorder_level: 0,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      let result;
      if (lowStockOnly) {
        result = await getLowStockProducts();
      } else {
        result = await getProducts();
      }

      if (result.success && result.data) {
        setProducts(result.data);
      } else {
        error(result.error || 'Failed to load products');
      }
    } catch (err) {
      error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditData({
      price: product.price,
      cost: product.cost,
      quantity_on_hand: product.quantity_on_hand,
      reorder_level: product.reorder_level,
    });
    openEdit();
  };

  const handleSaveProduct = async () => {
    if (!selectedProduct) return;

    try {
      const result = await updateProduct(selectedProduct.id, editData);
      if (result.success) {
        success('Product updated successfully');
        loadProducts();
        closeEdit();
      } else {
        error(result.error || 'Failed to update product');
      }
    } catch (err) {
      error('Failed to update product');
    }
  };

  const filteredProducts = products.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query)
    );
  });

  const columns = [
    {
      key: 'sku' as const,
      label: 'SKU',
    },
    {
      key: 'name' as const,
      label: 'Product Name',
    },
    {
      key: 'price' as const,
      label: 'Price',
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: 'quantity_on_hand' as const,
      label: 'Stock',
      render: (value: number, row: Product) => (
        <div className="flex items-center gap-2">
          <span>{value}</span>
          {value <= row.reorder_level && (
            <Badge variant="warning">Low</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'reorder_level' as const,
      label: 'Reorder Level',
    },
    {
      key: 'id' as const,
      label: 'Actions',
      render: (_: string, row: Product) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleEditProduct(row)}
          >
            <Edit size={14} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
          <p className="text-gray-600">Manage products, stock levels, and pricing</p>
        </div>

        {/* Low Stock Alert */}
        {products.some((p) => p.quantity_on_hand <= p.reorder_level) && (
          <Alert
            type="warning"
            title="Low Stock Alert"
            message={`${products.filter((p) => p.quantity_on_hand <= p.reorder_level).length} product(s) below reorder level`}
            className="mb-6"
          />
        )}

        {/* Controls */}
        <Card className="mb-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                type="text"
                placeholder="Search by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="lowStockOnly"
                  checked={lowStockOnly}
                  onChange={(e) => {
                    setLowStockOnly(e.target.checked);
                  }}
                  className="rounded"
                />
                <label htmlFor="lowStockOnly" className="text-sm font-medium">
                  Low Stock Only
                </label>
              </div>

              <Button
                onClick={loadProducts}
                variant="secondary"
              >
                Refresh
              </Button>
            </div>
          </div>
        </Card>

        {/* Products Table */}
        <Card>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No products found
            </div>
          ) : (
            <Table columns={columns} data={filteredProducts} />
          )}
        </Card>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={closeEdit}
        title={`Edit Product: ${selectedProduct?.name}`}
        size="sm"
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p className="font-semibold">SKU: {selectedProduct.sku}</p>
              <p className="text-gray-600">Category: {selectedProduct.category_id}</p>
            </div>

            <Input
              type="number"
              label="Price"
              step="0.01"
              value={editData.price}
              onChange={(e) =>
                setEditData({ ...editData, price: parseFloat(e.target.value) })
              }
            />

            <Input
              type="number"
              label="Cost"
              step="0.01"
              value={editData.cost}
              onChange={(e) =>
                setEditData({ ...editData, cost: parseFloat(e.target.value) })
              }
            />

            <Input
              type="number"
              label="Stock Quantity"
              value={editData.quantity_on_hand}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  quantity_on_hand: parseInt(e.target.value),
                })
              }
            />

            <Input
              type="number"
              label="Reorder Level"
              value={editData.reorder_level}
              onChange={(e) =>
                setEditData({
                  ...editData,
                  reorder_level: parseInt(e.target.value),
                })
              }
            />

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={closeEdit}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSaveProduct}>
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
