/**
 * Order Sync Panel Component
 * 订单同步面板 - 管理和监控订单同步状态
 */

'use client';

import {
  CheckCircle,
  Clock,
  Download,
  Filter,
  MoreHorizontal,
  Pause,
  Play,
  RefreshCw,
  Search,
  ShoppingCart,
  RefreshCw as Sync,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';

// Temporary simplified components
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }: any) => (
  <button className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${className}`} {...props}>
    {children}
  </button>
);

const Input = ({ className = '', ...props }: any) => (
  <input className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`} {...props} />
);

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Types
type OrderSyncItem = {
  id: string;
  orderId: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  attempts: number;
  lastAttempt: string;
  errorMessage?: string;
  shopifyOrderId?: string;
};

type OrderSyncPanelProps = {
  className?: string;
};

export function OrderSyncPanel({ className }: OrderSyncPanelProps) {
  const [orders, setOrders] = useState<OrderSyncItem[]>([
    {
      id: '1',
      orderId: 'ORD-1023',
      customerEmail: 'customer1@example.com',
      amount: 299.99,
      currency: 'USD',
      status: 'completed',
      attempts: 1,
      lastAttempt: '2 minutes ago',
      shopifyOrderId: 'SH-5001',
    },
    {
      id: '2',
      orderId: 'ORD-1022',
      customerEmail: 'customer2@example.com',
      amount: 199.99,
      currency: 'USD',
      status: 'failed',
      attempts: 3,
      lastAttempt: '8 minutes ago',
      errorMessage: 'Product not found in Shopify catalog',
    },
    {
      id: '3',
      orderId: 'ORD-1021',
      customerEmail: 'customer3@example.com',
      amount: 149.99,
      currency: 'USD',
      status: 'syncing',
      attempts: 1,
      lastAttempt: '1 minute ago',
    },
    {
      id: '4',
      orderId: 'ORD-1020',
      customerEmail: 'customer4@example.com',
      amount: 399.99,
      currency: 'USD',
      status: 'pending',
      attempts: 0,
      lastAttempt: 'Not attempted',
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'pending' | 'syncing' | 'completed' | 'failed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAutoSyncEnabled, setIsAutoSyncEnabled] = useState(true);

  const getStatusIcon = (status: OrderSyncItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: OrderSyncItem['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'failed':
        return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'syncing':
        return 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      default:
        return 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filter === 'all' || order.status === filter;
    const matchesSearch = searchTerm === ''
      || order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
      || order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleRetrySync = (orderId: string) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId
        ? { ...order, status: 'syncing', attempts: order.attempts + 1, lastAttempt: 'Just now' }
        : order,
    ));

    // Simulate sync process
    setTimeout(() => {
      setOrders(prev => prev.map(order =>
        order.id === orderId
          ? { ...order, status: Math.random() > 0.3 ? 'completed' : 'failed', shopifyOrderId: Math.random() > 0.3 ? `SH-${Math.floor(Math.random() * 9999)}` : undefined }
          : order,
      ));
    }, 2000);
  };

  const handleBulkSync = () => {
    const pendingOrders = orders.filter(order => order.status === 'pending' || order.status === 'failed');
    pendingOrders.forEach((order) => {
      handleRetrySync(order.id);
    });
  };

  const statusCounts = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    syncing: orders.filter(o => o.status === 'syncing').length,
    completed: orders.filter(o => o.status === 'completed').length,
    failed: orders.filter(o => o.status === 'failed').length,
  };

  return (
    <div className={cn('bg-card border border-border rounded-lg', className)}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Order Synchronization
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor and manage order sync status with Shopify
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoSyncEnabled(!isAutoSyncEnabled)}
              className={cn(
                'gap-2',
                isAutoSyncEnabled ? 'text-green-600 border-green-200' : '',
              )}
            >
              {isAutoSyncEnabled ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              Auto Sync:
              {' '}
              {isAutoSyncEnabled ? 'On' : 'Off'}
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleBulkSync}
              className="gap-2"
            >
              <Sync className="h-4 w-4" />
              Sync All
            </Button>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          {[
            { label: 'Total', count: statusCounts.total, color: 'text-foreground' },
            { label: 'Pending', count: statusCounts.pending, color: 'text-yellow-600' },
            { label: 'Syncing', count: statusCounts.syncing, color: 'text-blue-600' },
            { label: 'Completed', count: statusCounts.completed, color: 'text-green-600' },
            { label: 'Failed', count: statusCounts.failed, color: 'text-red-600' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className={cn('text-2xl font-bold', stat.color)}>
                {stat.count}
              </div>
              <div className="text-xs text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
              className="text-sm border border-input rounded-md px-2 py-1 bg-background"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="syncing">Syncing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID or customer email..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Orders List */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">Order</th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">Customer</th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">Amount</th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">Status</th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">Attempts</th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">Last Attempt</th>
              <th className="text-right p-4 font-medium text-sm text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id} className="border-b border-border hover:bg-muted/30">
                <td className="p-4">
                  <div>
                    <div className="font-medium text-sm">
                      {order.orderId}
                    </div>
                    {order.shopifyOrderId && (
                      <div className="text-xs text-muted-foreground">
                        Shopify:
                        {' '}
                        {order.shopifyOrderId}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm">
                    {order.customerEmail}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-medium">
                    {order.currency}
                    {' '}
                    {order.amount.toFixed(2)}
                  </div>
                </td>
                <td className="p-4">
                  <div className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                    getStatusColor(order.status),
                  )}
                  >
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                  {order.errorMessage && (
                    <div className="text-xs text-red-600 mt-1 max-w-xs truncate" title={order.errorMessage}>
                      {order.errorMessage}
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <div className="text-sm">
                    {order.attempts}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-muted-foreground">
                    {order.lastAttempt}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="View Details"
                    >
                      <Search className="h-4 w-4" />
                    </Button>

                    {(order.status === 'failed' || order.status === 'pending') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleRetrySync(order.id)}
                        title="Retry Sync"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      title="More Actions"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || filter !== 'all' ? 'No orders match your criteria' : 'No orders to sync'}
            </p>
          </div>
        )}
      </div>

      {/* Footer with Pagination */}
      {filteredOrders.length > 0 && (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing
              {' '}
              {filteredOrders.length}
              {' '}
              of
              {' '}
              {orders.length}
              {' '}
              orders
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <span className="px-2">1</span>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
