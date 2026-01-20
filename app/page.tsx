/**
 * Home / Landing Page
 * Entry point for the application
 */

'use client';

import { useRouter } from 'next/navigation';
import { useUserProfile, useUserRole } from '@/lib/hooks';
import { Button, Spinner } from '@/components/ui';
import { ShoppingCart, BarChart3, Box, Zap } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { profile, loading } = useUserProfile();
  const { isAdmin } = useUserRole();

  // Redirect based on auth status and role
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Spinner size="lg" />
      </div>
    );
  }

  // If user is authenticated, redirect them
  if (profile) {
    if (isAdmin) {
      router.push('/dashboard');
    } else {
      router.push('/pos');
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">POS System</h1>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => router.push('/auth/login')}>
              Login
            </Button>
            <Button onClick={() => router.push('/auth/signup')}>
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center text-white mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Modern Point of Sale System
          </h2>
          <p className="text-xl md:text-2xl text-gray-900 font-semibold mb-8">
            Cloud-based POS for small businesses. Real-time inventory, analytics, and secure transactions.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push('/auth/signup')}
              className="text-gray-900 font-semibold text-sm"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => router.push('/auth/login')}
            >
              Login
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {/* Feature 1 */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 border border-white border-opacity-20 text-white">
            <ShoppingCart className="text-gray-900 font-semibold text-sm" />
            <h3 className="text-gray-900 font-semibold text-sm">Fast Checkout</h3>
            <p className="text-gray-900 font-semibold text-sm">
              Lightning-fast POS interface optimized for quick transactions
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 border border-white border-opacity-20 text-white">
            <BarChart3 className="w-12 h-12 mb-4" />
            <h3 className="text-gray-900 font-semibold text-sm">Real-Time Analytics</h3>
            <p className="text-gray-900 font-semibold text-sm">
              Track sales, revenue, and inventory in real-time
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 border border-white border-opacity-20 text-white">
            <Box className="w-12 h-12 mb-4" />
            <h3 className="text-gray-900 font-semibold text-sm">Inventory Sync</h3>
            <p className="text-gray-900 font-semibold text-sm">
              Live inventory updates across multiple cashiers
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-6 border border-white border-opacity-20 text-white">
            <Zap className="w-12 h-12 mb-4" />
            <h3 className="text-gray-900 font-semibold text-sm">Cloud-Based</h3>
            <p className="text-gray-900 font-semibold text-sm">
              No installation required. Access from anywhere
            </p>
          </div>
        </div>

        {/* Feature Details */}
        <div className="mt-20 grid md:grid-cols-2 gap-12">
          {/* Left Column */}
          <div className="text-gray-900">
            <h3 className="text-3xl font-bold mb-6 text-gray-900">Built for Businesses</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-gray-900 font-bold">✓</span>
                <span className="text-gray-900 font-semibold">Multi-user support with role-based access</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-900 font-bold">✓</span>
                <span className="text-gray-900 font-semibold">Comprehensive product and category management</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-900 font-bold">✓</span>
                <span className="text-gray-900 font-semibold">Detailed sales analytics and reporting</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-900 font-bold">✓</span>
                <span className="text-gray-900 font-semibold">Secure authentication and data encryption</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-900 font-bold">✓</span>
                <span className="text-gray-900 font-semibold">Inventory audit trails and history</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-gray-900 font-bold">✓</span>
                <span className="text-gray-900 font-semibold">Print-ready receipts and reports</span>
              </li>
            </ul>
          </div>

          {/* Right Column */}
          <div className="text-gray-900">
            <h3 className="text-3xl font-bold mb-6 text-gray-900">Perfect For</h3>
            <div className="space-y-3">
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <p className="font-semibold text-gray-900">☕ Cafés & Coffee Shops</p>
                <p className="text-gray-900 font-semibold text-sm">Fast-paced beverage sales</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <p className="font-semibold text-gray-900">🛍️ Retail Stores</p>
                <p className="text-gray-900 font-semibold text-sm">Multi-category inventory</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <p className="font-semibold text-gray-900">🏬 Minimarts</p>
                <p className="text-gray-900 font-semibold text-sm">High-volume transactions</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <p className="font-semibold text-gray-900">🏪 Small Businesses</p>
                <p className="text-gray-900 font-semibold text-sm">All types of retail</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-12 border border-white border-opacity-20 text-center text-gray-900">
          <h3 className="text-3xl font-bold mb-4 text-gray-900">Ready to Get Started?</h3>
          <p className="text-gray-900 font-semibold mb-8 text-lg">
            Join businesses using POS System to streamline their sales and inventory
          </p>
          <Button
            size="lg"
            onClick={() => router.push('/auth/signup')}
            className="text-gray-900 font-semibold text-sm"
          >
            Create Free Account
          </Button>
        </div>

        {/* Demo Credentials */}
        <div className="mt-12 bg-blue-900 rounded-lg p-6 text-gray-900 font-semibold text-center">
          <p className="mb-4 text-gray-900">Try the demo with these credentials:</p>
          <p className="font-mono font-bold text-gray-900">
            Email: admin@example.com | Password: Test@1234
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-500 border-opacity-30 mt-20 py-8 text-center text-gray-900 font-semibold">
        <p>&copy; 2024 POS System. Production-ready point of sale software.</p>
      </footer>
    </div>
  );
}
