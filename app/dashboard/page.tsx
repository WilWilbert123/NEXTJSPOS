/**
 * Admin Dashboard
 * Sales metrics, analytics, and business intelligence
 */

'use client';

import { useState, useEffect } from 'react';
import { getAllOrders, getDailySales, getBestSellingProducts } from '@/lib/actions/orders';
import { getInventoryValue } from '@/lib/actions/products';
import { useToast } from '@/lib/hooks';
import { Order } from '@/lib/types';
import { formatCurrency, formatDate, getDateRange } from '@/lib/utils';
import { Card, Spinner, Badge } from '@/components/ui';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingCart, DollarSign, Package } from 'lucide-react';

export default function DashboardPage() {
  const { error } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [dailySales, setDailySales] = useState(0);
  const [inventoryValue, setInventoryValue] = useState(0);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Dashboard mounted, loading data...');
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setLoadError(null);
    console.log('Starting dashboard data load...');
    
    try {
      // Load orders
      console.log('Loading orders...');
      const ordersResult = await getAllOrders(100);
      console.log('Orders result:', ordersResult);
      if (ordersResult.success && ordersResult.data) {
        setOrders(ordersResult.data);
      } else {
        console.warn('Orders load failed:', ordersResult.error);
      }

      // Load daily sales
      const today = new Date().toISOString().split('T')[0];
      console.log('Loading sales for:', today);
      const salesResult = await getDailySales(today);
      console.log('Sales result:', salesResult);
      if (salesResult.success) {
        setDailySales(salesResult.data || 0);
      } else {
        console.warn('Daily sales load failed:', salesResult.error);
      }

      // Load inventory value
      console.log('Loading inventory value...');
      const inventoryResult = await getInventoryValue();
      console.log('Inventory result:', inventoryResult);
      if (inventoryResult.success) {
        setInventoryValue(inventoryResult.data || 0);
      } else {
        console.warn('Inventory load failed:', inventoryResult.error);
      }

      // Load best selling products
      const { startDate, endDate } = getDateRange('month');
      console.log('Loading best products...');
      const bestResult = await getBestSellingProducts(
        5,
        startDate.toISOString(),
        endDate.toISOString()
      );
      console.log('Best products result:', bestResult);
      if (bestResult.success) {
        setBestSellingProducts(bestResult.data || []);
      } else {
        console.warn('Best products load failed:', bestResult.error);
      }
      
      console.log('Dashboard data load completed');
    } catch (err) {
      console.error('Dashboard data load error:', err);
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      setLoadError(errMsg);
      error('Failed to load dashboard data: ' + errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Sales by date (last 7 days)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const daySales = orders
      .filter((o) => o.created_at.startsWith(dateStr))
      .reduce((sum, o) => sum + o.total, 0);
    last7Days.push({
      date: formatDate(dateStr),
      sales: parseFloat(daySales.toFixed(2)),
    });
  }

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Business metrics and analytics</p>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-12">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        ) : loadError ? (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
            <p className="text-red-800 font-semibold">Error loading dashboard</p>
            <p className="text-red-600">{loadError}</p>
            <button 
              onClick={loadDashboardData}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Today's Sales */}
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Today's Sales</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {formatCurrency(dailySales)}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <DollarSign className="text-blue-600" size={24} />
                  </div>
                </div>
              </Card>

              {/* Total Revenue */}
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {formatCurrency(totalRevenue)}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <TrendingUp className="text-green-600" size={24} />
                  </div>
                </div>
              </Card>

              {/* Orders Count */}
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {totalOrders}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Avg: {formatCurrency(avgOrderValue)}
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <ShoppingCart className="text-purple-600" size={24} />
                  </div>
                </div>
              </Card>

              {/* Inventory Value */}
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Inventory Value</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {formatCurrency(inventoryValue)}
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Package className="text-orange-600" size={24} />
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Sales Trend */}
              <Card className="lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Sales Trend (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={last7Days}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Best Selling Products */}
              <Card>
                <h3 className="text-lg font-semibold mb-4">Top 5 Products</h3>
                {bestSellingProducts.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={bestSellingProducts}
                        dataKey="quantity_sold"
                        nameKey="product_name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {bestSellingProducts.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-gray-500">No data available</div>
                )}
              </Card>
            </div>

            {/* Product Performance Table */}
            <Card>
              <h3 className="text-lg font-semibold mb-4">Product Performance</h3>
              {bestSellingProducts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Product
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">
                          Qty Sold
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">
                          Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bestSellingProducts.map((product: any, index: number) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                            <Badge variant="primary">#{index + 1}</Badge>
                            <span className="ml-2">{product.product_name}</span>
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium">
                            {product.quantity_sold}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium">
                            {formatCurrency(product.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No product data available
                </div>
              )}
            </Card>

            {/* Recent Orders */}
            <Card className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
              {orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Order #
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Cashier
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Date
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">
                          Total
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                          Method
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 10).map((order) => (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium">
                            {order.order_number}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {order.cashier?.full_name || 'Unknown'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {formatDate(order.created_at)}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-right">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant="secondary">
                              {order.payment_method}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  No orders yet
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
