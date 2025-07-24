/**
 * Shopify Overview Component
 * Shopify 概览仪表板 - 显示关键指标和状态概览
 */

'use client';

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  Eye,
  Package,
  RefreshCw,
  ShoppingCart,
  RefreshCw as Sync,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import React, { useState } from 'react';

// Temporary simplified components
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }: any) => (
  <button className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${className}`} {...props}>
    {children}
  </button>
);

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Types
type ShopifyMetrics = {
  totalOrders: number;
  syncedToday: number;
  pendingSync: number;
  inventoryItems: number;
  lastSyncTime: string;
  syncStatus: 'success' | 'warning' | 'error' | 'syncing';
  trends: {
    orders: { value: number; type: 'increase' | 'decrease' };
    sync: { value: number; type: 'increase' | 'decrease' };
    inventory: { value: number; type: 'increase' | 'decrease' };
  };
};

type ShopifyOverviewProps = {
  className?: string;
};

export function ShopifyOverview({ className }: ShopifyOverviewProps) {
  const [metrics, setMetrics] = useState<ShopifyMetrics>({
    totalOrders: 1247,
    syncedToday: 89,
    pendingSync: 3,
    inventoryItems: 245,
    lastSyncTime: '2 minutes ago',
    syncStatus: 'success',
    trends: {
      orders: { value: 12, type: 'increase' },
      sync: { value: 8, type: 'increase' },
      inventory: { value: 2, type: 'decrease' },
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setMetrics(prev => ({
      ...prev,
      lastSyncTime: 'Just now',
      syncedToday: prev.syncedToday + Math.floor(Math.random() * 5),
    }));
    setIsLoading(false);
  };

  const getStatusIcon = (status: ShopifyMetrics['syncStatus']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: ShopifyMetrics['syncStatus']) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 dark:bg-green-950/20';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20';
      case 'error':
        return 'text-red-600 bg-red-50 dark:bg-red-950/20';
      case 'syncing':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-950/20';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const statsCards = [
    {
      title: 'Total Orders',
      value: metrics.totalOrders.toLocaleString(),
      change: metrics.trends.orders,
      icon: <ShoppingCart className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      title: 'Synced Today',
      value: metrics.syncedToday.toString(),
      change: metrics.trends.sync,
      icon: <Sync className="h-5 w-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
    },
    {
      title: 'Pending Sync',
      value: metrics.pendingSync.toString(),
      change: null, // No trend for pending items
      icon: <Clock className="h-5 w-5" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    },
    {
      title: 'Inventory Items',
      value: metrics.inventoryItems.toString(),
      change: metrics.trends.inventory,
      icon: <Package className="h-5 w-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    },
  ];

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Shopify Overview
          </h2>
          <p className="text-sm text-muted-foreground">
            Key metrics and synchronization status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', isLoading ? 'animate-spin' : '')} />
            Refresh
          </Button>

          <Button variant="ghost" size="sm" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Shopify Admin
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={cn(
        'flex items-center justify-between p-4 rounded-lg border',
        getStatusColor(metrics.syncStatus),
      )}
      >
        <div className="flex items-center gap-3">
          {getStatusIcon(metrics.syncStatus)}
          <div>
            <p className="font-medium">
              {metrics.syncStatus === 'success' && 'Sync Healthy'}
              {metrics.syncStatus === 'warning' && 'Sync Warning'}
              {metrics.syncStatus === 'error' && 'Sync Error'}
              {metrics.syncStatus === 'syncing' && 'Syncing...'}
            </p>
            <p className="text-sm opacity-80">
              Last sync:
              {' '}
              {metrics.lastSyncTime}
            </p>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          View Details
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div
            key={index}
            className="bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className={cn('p-2 rounded-lg', stat.bgColor)}>
                <div className={stat.color}>
                  {stat.icon}
                </div>
              </div>

              {stat.change && (
                <div className="flex items-center gap-1">
                  {stat.change.type === 'increase'
                    ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      )
                    : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                  <span className={cn(
                    'text-xs font-medium',
                    stat.change.type === 'increase' ? 'text-green-600' : 'text-red-600',
                  )}
                  >
                    {stat.change.value}
                    %
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3">
              <p className="text-2xl font-bold text-foreground">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">
                {stat.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-medium text-foreground mb-3">
          Quick Actions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button variant="outline" size="sm" className="justify-start gap-2">
            <Sync className="h-4 w-4" />
            Force Sync
          </Button>

          <Button variant="outline" size="sm" className="justify-start gap-2">
            <Package className="h-4 w-4" />
            Update Inventory
          </Button>

          <Button variant="outline" size="sm" className="justify-start gap-2">
            <ShoppingCart className="h-4 w-4" />
            View Orders
          </Button>

          <Button variant="outline" size="sm" className="justify-start gap-2">
            <ExternalLink className="h-4 w-4" />
            Open Shopify
          </Button>
        </div>
      </div>

      {/* Recent Activity Preview */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-foreground">
            Recent Activity
          </h3>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </div>

        <div className="space-y-3">
          {[
            { action: 'Order #1023 synced', time: '2 minutes ago', status: 'success' },
            { action: 'Inventory updated for SKU-001', time: '5 minutes ago', status: 'success' },
            { action: 'Order #1022 sync failed', time: '8 minutes ago', status: 'error' },
            { action: 'Product "AI Companion" updated', time: '12 minutes ago', status: 'success' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  activity.status === 'success' ? 'bg-green-600' : 'bg-red-600',
                )}
                />
                <span className="text-sm text-foreground">
                  {activity.action}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
