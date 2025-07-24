'use client';

/**
 * Shopify Admin Dashboard Component
 * Complete Shopify integration management interface
 */

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  RefreshCw,
  ShoppingCart,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { ConfigurationPanel } from './components/ConfigurationPanel';
import { HealthCheckPanel } from './components/HealthCheckPanel';
import { MetricsOverview } from './components/MetricsOverview';
import { OrderSyncPanel } from './components/OrderSyncPanel';
import { ProductSyncPanel } from './components/ProductSyncPanel';
import { SyncHistoryTable } from './components/SyncHistoryTable';
import { SyncStatusCard } from './components/SyncStatusCard';
import { WebhookMonitor } from './components/WebhookMonitor';

type ShopifyAdminProps = {
  className?: string;
};

type ShopifyStatus = {
  isConnected: boolean;
  lastSync: string | null;
  syncQueue: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    abandoned: number;
  };
  health: {
    status: 'healthy' | 'warning' | 'error';
    apiConnection: boolean;
    webhookActive: boolean;
    lastHealthCheck: string;
    errors: string[];
  };
  metrics: {
    totalOrders: number;
    syncedOrders: number;
    failedOrders: number;
    totalProducts: number;
    syncedProducts: number;
    apiCalls: number;
    lastDay: {
      orders: number;
      products: number;
      apiCalls: number;
    };
  };
};

export function ShopifyAdmin({ className }: ShopifyAdminProps) {
  const [status, setStatus] = useState<ShopifyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch Shopify status
  const fetchShopifyStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/shopify/status');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch Shopify status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh status
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchShopifyStatus();
  };

  // Fetch status on component mount
  useEffect(() => {
    fetchShopifyStatus();

    // Set up periodic refresh every 30 seconds
    const interval = setInterval(fetchShopifyStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      case 'error': return <AlertCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  if (loading && !status) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading Shopify status...</span>
        </div>
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className={className}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
            <h3 className="text-red-800 font-medium">Connection Error</h3>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
          <button
            className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded border border-red-300 hover:bg-red-200"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Page title and actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shopify Integration</h1>
          <p className="text-gray-600">
            Monitor and manage your Shopify store integration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing
              ? <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </button>
        </div>
      </div>

      {/* Status Overview */}
      {status && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connection Status</p>
                <p className={`text-lg font-semibold ${getStatusColor(status.health.status)}`}>
                  {status.isConnected ? 'Connected' : 'Disconnected'}
                </p>
              </div>
              {getStatusIcon(status.health.status)}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-lg font-semibold">{status.metrics.totalOrders}</p>
              </div>
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-lg font-semibold">{status.metrics.totalProducts}</p>
              </div>
              <Package className="h-5 w-5 text-green-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">API Calls</p>
                <p className="text-lg font-semibold">{status.metrics.apiCalls}</p>
              </div>
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'sync', label: 'Sync Management' },
              { id: 'webhooks', label: 'Webhooks' },
              { id: 'config', label: 'Configuration' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <SyncStatusCard />
              <MetricsOverview />
              <HealthCheckPanel />
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-6">
              <ProductSyncPanel />
              <OrderSyncPanel />
              <SyncHistoryTable />
            </div>
          )}

          {activeTab === 'webhooks' && (
            <div className="space-y-6">
              <WebhookMonitor />
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-6">
              <ConfigurationPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
