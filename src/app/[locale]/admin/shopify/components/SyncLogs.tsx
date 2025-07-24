/**
 * Sync Logs Component
 * 同步日志组件 - 详细同步历史记录、日志筛选和错误分析
 */

'use client';

import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  Info,
  MoreHorizontal,
  RefreshCw,
  Search,
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
type SyncLogEntry = {
  id: string;
  timestamp: string;
  type: 'order_sync' | 'inventory_sync' | 'product_sync' | 'webhook' | 'manual_sync';
  status: 'success' | 'warning' | 'error' | 'in_progress';
  source: string;
  target: string;
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  duration: number; // in seconds
  message: string;
  details?: string;
  errorCode?: string;
  retryCount?: number;
  metadata?: {
    orderId?: string;
    productSku?: string;
    webhookEventId?: string;
    userId?: string;
  };
};

type SyncLogsProps = {
  className?: string;
};

export function SyncLogs({ className }: SyncLogsProps) {
  const [logs, setLogs] = useState<SyncLogEntry[]>([
    {
      id: '1',
      timestamp: '2024-07-15T14:30:25Z',
      type: 'order_sync',
      status: 'success',
      source: 'Stripe Webhook',
      target: 'Shopify Orders',
      recordsProcessed: 1,
      recordsSuccessful: 1,
      recordsFailed: 0,
      duration: 2.3,
      message: 'Order ORD-1023 successfully synced to Shopify',
      metadata: { orderId: 'ORD-1023', webhookEventId: 'evt_1234' },
    },
    {
      id: '2',
      timestamp: '2024-07-15T14:25:18Z',
      type: 'inventory_sync',
      status: 'warning',
      source: 'Admin Panel',
      target: 'Shopify Inventory',
      recordsProcessed: 5,
      recordsSuccessful: 4,
      recordsFailed: 1,
      duration: 8.7,
      message: 'Bulk inventory update completed with warnings',
      details: 'SKU AI-COMP-003 not found in Shopify catalog',
      metadata: { userId: 'admin-001' },
    },
    {
      id: '3',
      timestamp: '2024-07-15T14:20:42Z',
      type: 'order_sync',
      status: 'error',
      source: 'Stripe Webhook',
      target: 'Shopify Orders',
      recordsProcessed: 1,
      recordsSuccessful: 0,
      recordsFailed: 1,
      duration: 5.1,
      message: 'Failed to sync order ORD-1022',
      details: 'Product variant not found in Shopify. SKU: AI-COMP-PRO-V2',
      errorCode: 'PRODUCT_NOT_FOUND',
      retryCount: 3,
      metadata: { orderId: 'ORD-1022', webhookEventId: 'evt_1235' },
    },
    {
      id: '4',
      timestamp: '2024-07-15T14:15:10Z',
      type: 'webhook',
      status: 'success',
      source: 'Shopify',
      target: 'Internal Database',
      recordsProcessed: 1,
      recordsSuccessful: 1,
      recordsFailed: 0,
      duration: 1.2,
      message: 'Product update webhook processed successfully',
      metadata: { productSku: 'AI-COMP-001' },
    },
    {
      id: '5',
      timestamp: '2024-07-15T14:10:33Z',
      type: 'manual_sync',
      status: 'success',
      source: 'Admin Panel',
      target: 'Shopify Full Sync',
      recordsProcessed: 125,
      recordsSuccessful: 125,
      recordsFailed: 0,
      duration: 45.8,
      message: 'Manual full synchronization completed successfully',
      metadata: { userId: 'admin-001' },
    },
    {
      id: '6',
      timestamp: '2024-07-15T14:05:15Z',
      type: 'product_sync',
      status: 'in_progress',
      source: 'Product Catalog',
      target: 'Shopify Products',
      recordsProcessed: 15,
      recordsSuccessful: 12,
      recordsFailed: 0,
      duration: 0,
      message: 'Product synchronization in progress...',
      metadata: { userId: 'system' },
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'success' | 'warning' | 'error' | 'in_progress'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | SyncLogEntry['type']>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('today');

  const getStatusIcon = (status: SyncLogEntry['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: SyncLogEntry['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'warning':
        return 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'error':
        return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'in_progress':
        return 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      default:
        return 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getTypeLabel = (type: SyncLogEntry['type']) => {
    switch (type) {
      case 'order_sync':
        return 'Order Sync';
      case 'inventory_sync':
        return 'Inventory Sync';
      case 'product_sync':
        return 'Product Sync';
      case 'webhook':
        return 'Webhook';
      case 'manual_sync':
        return 'Manual Sync';
      default:
        return type;
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const filteredLogs = logs.filter((log) => {
    const matchesStatus = filter === 'all' || log.status === filter;
    const matchesType = typeFilter === 'all' || log.type === typeFilter;
    const matchesSearch = searchTerm === ''
      || log.message.toLowerCase().includes(searchTerm.toLowerCase())
      || log.source.toLowerCase().includes(searchTerm.toLowerCase())
      || log.target.toLowerCase().includes(searchTerm.toLowerCase())
      || (log.metadata?.orderId && log.metadata.orderId.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesType && matchesSearch;
  });

  const statusCounts = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    warning: logs.filter(l => l.status === 'warning').length,
    error: logs.filter(l => l.status === 'error').length,
    in_progress: logs.filter(l => l.status === 'in_progress').length,
  };

  const handleExportLogs = () => {
    // Simulate export functionality
    console.log('Exporting logs...');
  };

  const handleRefresh = () => {
    // Simulate refresh
    setLogs(prev => [...prev]);
  };

  return (
    <div className={cn('bg-card border border-border rounded-lg', className)}>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Sync Logs
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Detailed synchronization history and error tracking
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportLogs}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          {[
            { label: 'Total', count: statusCounts.total, color: 'text-foreground' },
            { label: 'Success', count: statusCounts.success, color: 'text-green-600' },
            { label: 'Warning', count: statusCounts.warning, color: 'text-yellow-600' },
            { label: 'Error', count: statusCounts.error, color: 'text-red-600' },
            { label: 'In Progress', count: statusCounts.in_progress, color: 'text-blue-600' },
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

      {/* Filters */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as any)}
              className="text-sm border border-input rounded-md px-2 py-1 bg-background"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="in_progress">In Progress</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Type:</span>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="text-sm border border-input rounded-md px-2 py-1 bg-background"
            >
              <option value="all">All Types</option>
              <option value="order_sync">Order Sync</option>
              <option value="inventory_sync">Inventory Sync</option>
              <option value="product_sync">Product Sync</option>
              <option value="webhook">Webhook</option>
              <option value="manual_sync">Manual Sync</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value as any)}
              className="text-sm border border-input rounded-md px-2 py-1 bg-background"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs by message, source, or order ID..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="divide-y divide-border">
        {filteredLogs.map(log => (
          <div key={log.id} className="p-4 hover:bg-muted/30">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">
                  {getStatusIcon(log.status)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      getStatusColor(log.status),
                    )}
                    >
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>

                    <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                      {getTypeLabel(log.type)}
                    </span>

                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-foreground">
                    {log.message}
                  </p>

                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>
                      {log.source}
                      {' '}
                      →
                      {' '}
                      {log.target}
                    </span>
                    <span>
                      {log.recordsSuccessful}
                      /
                      {log.recordsProcessed}
                      {' '}
                      records
                    </span>
                    {log.duration > 0 && (
                      <span>
                        Duration:
                        {formatDuration(log.duration)}
                      </span>
                    )}
                    {log.retryCount && log.retryCount > 0 && (
                      <span className="text-yellow-600">
                        Retries:
                        {' '}
                        {log.retryCount}
                      </span>
                    )}
                  </div>

                  {(log.details || log.errorCode) && (
                    <div className="mt-2">
                      <button
                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                      >
                        {expandedLog === log.id
                          ? (
                              <ChevronDown className="h-3 w-3" />
                            )
                          : (
                              <ChevronRight className="h-3 w-3" />
                            )}
                        {log.status === 'error' ? 'View Error Details' : 'View Details'}
                      </button>
                    </div>
                  )}

                  {expandedLog === log.id && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-md">
                      {log.details && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-foreground mb-1">Details:</p>
                          <p className="text-xs text-muted-foreground">{log.details}</p>
                        </div>
                      )}

                      {log.errorCode && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-foreground mb-1">Error Code:</p>
                          <code className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                            {log.errorCode}
                          </code>
                        </div>
                      )}

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-foreground mb-1">Metadata:</p>
                          <div className="space-y-1">
                            {Object.entries(log.metadata).map(([key, value]) => (
                              <div key={key} className="flex gap-2 text-xs">
                                <span className="text-muted-foreground capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                  :
                                </span>
                                <span className="text-foreground font-mono">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  title="More Actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || filter !== 'all' || typeFilter !== 'all'
                ? 'No logs match your criteria'
                : 'No sync logs available'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredLogs.length > 0 && (
        <div className="p-4 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing
              {' '}
              {filteredLogs.length}
              {' '}
              of
              {' '}
              {logs.length}
              {' '}
              logs
            </span>
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>Logs are retained for 30 days</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
