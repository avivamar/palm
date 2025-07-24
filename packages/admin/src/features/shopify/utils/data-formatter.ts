/**
 * Data Formatter Utilities
 * 数据格式化工具 - 货币、日期格式化和状态转换函数
 */

import type {
  HealthMetric,
  InventoryItem,
  ShopifyOrder,
  SyncLogEntry,
} from '../stores/shopify-store';

// Currency formatting
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US',
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.warn('Currency formatting failed:', error);
    return `${currency} ${amount.toFixed(2)}`;
  }
};

// Number formatting
export const formatNumber = (
  value: number,
  locale: string = 'en-US',
  options?: Intl.NumberFormatOptions,
): string => {
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch (error) {
    console.warn('Number formatting failed:', error);
    return value.toString();
  }
};

// Percentage formatting
export const formatPercentage = (
  value: number,
  decimals: number = 1,
  locale: string = 'en-US',
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value / 100);
  } catch (error) {
    console.warn('Percentage formatting failed:', error);
    return `${value.toFixed(decimals)}%`;
  }
};

// Date formatting
export const formatDate = (
  date: string | Date,
  locale: string = 'en-US',
  options?: Intl.DateTimeFormatOptions,
): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    }).format(dateObj);
  } catch (error) {
    console.warn('Date formatting failed:', error);
    return date.toString();
  }
};

// Relative time formatting
export const formatRelativeTime = (
  date: string | Date,
  locale: string = 'en-US',
): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    }

    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    }

    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }

    const days = Math.floor(diffInSeconds / 86400);
    if (days < 7) {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }

    return formatDate(dateObj, locale);
  } catch (error) {
    console.warn('Relative time formatting failed:', error);
    return date.toString();
  }
};

// Duration formatting
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

// Status formatting and colors
export const getStatusDisplay = (
  status: ShopifyOrder['status'] | InventoryItem['status'] | SyncLogEntry['status'] | HealthMetric['status'],
): {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
} => {
  const statusMap = {
    // Order statuses
    pending: {
      label: 'Pending',
      color: 'text-yellow-700 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      icon: 'clock',
    },
    syncing: {
      label: 'Syncing',
      color: 'text-blue-700 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      icon: 'refresh',
    },
    completed: {
      label: 'Completed',
      color: 'text-green-700 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      icon: 'check',
    },
    failed: {
      label: 'Failed',
      color: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      icon: 'x',
    },

    // Inventory statuses
    in_stock: {
      label: 'In Stock',
      color: 'text-green-700 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      icon: 'package',
    },
    low_stock: {
      label: 'Low Stock',
      color: 'text-yellow-700 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      icon: 'alert-triangle',
    },
    out_of_stock: {
      label: 'Out of Stock',
      color: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      icon: 'x-circle',
    },
    discontinued: {
      label: 'Discontinued',
      color: 'text-gray-700 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-900/20',
      icon: 'minus',
    },

    // Health statuses
    healthy: {
      label: 'Healthy',
      color: 'text-green-700 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      icon: 'check-circle',
    },
    warning: {
      label: 'Warning',
      color: 'text-yellow-700 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      icon: 'alert-triangle',
    },
    critical: {
      label: 'Critical',
      color: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      icon: 'x-circle',
    },
    unknown: {
      label: 'Unknown',
      color: 'text-gray-700 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-900/20',
      icon: 'help-circle',
    },

    // Sync log statuses
    success: {
      label: 'Success',
      color: 'text-green-700 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      icon: 'check-circle',
    },
    error: {
      label: 'Error',
      color: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      icon: 'x-circle',
    },
    in_progress: {
      label: 'In Progress',
      color: 'text-blue-700 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      icon: 'refresh',
    },
  };

  return statusMap[status as keyof typeof statusMap] || statusMap.unknown;
};

// Sync type display
export const getSyncTypeDisplay = (type: SyncLogEntry['type']): {
  label: string;
  icon: string;
  color: string;
} => {
  const typeMap = {
    order_sync: {
      label: 'Order Sync',
      icon: 'shopping-cart',
      color: 'text-blue-600',
    },
    inventory_sync: {
      label: 'Inventory Sync',
      icon: 'package',
      color: 'text-green-600',
    },
    product_sync: {
      label: 'Product Sync',
      icon: 'box',
      color: 'text-purple-600',
    },
    webhook: {
      label: 'Webhook',
      icon: 'zap',
      color: 'text-orange-600',
    },
    manual_sync: {
      label: 'Manual Sync',
      icon: 'user',
      color: 'text-gray-600',
    },
  };

  return typeMap[type] || {
    label: type,
    icon: 'help-circle',
    color: 'text-gray-600',
  };
};

// Trend formatting
export const formatTrend = (
  trend: { value: number; type: 'increase' | 'decrease' | 'stable' },
): {
  display: string;
  color: string;
  icon: string;
} => {
  switch (trend.type) {
    case 'increase':
      return {
        display: `+${trend.value}%`,
        color: 'text-green-600',
        icon: 'trending-up',
      };
    case 'decrease':
      return {
        display: `-${trend.value}%`,
        color: 'text-red-600',
        icon: 'trending-down',
      };
    case 'stable':
    default:
      return {
        display: '0%',
        color: 'text-gray-600',
        icon: 'minus',
      };
  }
};

// Priority formatting
export const getPriorityDisplay = (
  level: 'low' | 'medium' | 'high' | 'critical',
): {
  label: string;
  color: string;
  bgColor: string;
} => {
  const priorityMap = {
    low: {
      label: 'Low',
      color: 'text-gray-700 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-900/20',
    },
    medium: {
      label: 'Medium',
      color: 'text-blue-700 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    high: {
      label: 'High',
      color: 'text-yellow-700 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
    },
    critical: {
      label: 'Critical',
      color: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
    },
  };

  return priorityMap[level];
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateSku = (sku: string): boolean => {
  // SKU should be alphanumeric with hyphens and underscores
  const skuRegex = /^[\w-]+$/;
  return skuRegex.test(sku);
};

// Data transformation utilities
export const transformOrderForDisplay = (order: ShopifyOrder) => {
  return {
    ...order,
    formattedAmount: formatCurrency(order.amount, order.currency),
    statusDisplay: getStatusDisplay(order.status),
    formattedLastAttempt: formatRelativeTime(order.lastAttempt),
  };
};

export const transformInventoryForDisplay = (item: InventoryItem) => {
  return {
    ...item,
    formattedPrice: formatCurrency(item.price, item.currency),
    formattedTotalValue: formatCurrency(item.currentStock * item.price, item.currency),
    statusDisplay: getStatusDisplay(item.status),
    trendDisplay: formatTrend(item.trend),
    formattedLastUpdated: formatRelativeTime(item.lastUpdated),
    stockPercentage: item.lowStockThreshold > 0
      ? Math.round((item.currentStock / item.lowStockThreshold) * 100)
      : 100,
  };
};

export const transformSyncLogForDisplay = (log: SyncLogEntry) => {
  return {
    ...log,
    statusDisplay: getStatusDisplay(log.status),
    typeDisplay: getSyncTypeDisplay(log.type),
    formattedTimestamp: formatDate(log.timestamp),
    relativeTimestamp: formatRelativeTime(log.timestamp),
    formattedDuration: formatDuration(log.duration),
    successRate: log.recordsProcessed > 0
      ? Math.round((log.recordsSuccessful / log.recordsProcessed) * 100)
      : 0,
  };
};

export const transformHealthMetricForDisplay = (metric: HealthMetric) => {
  return {
    ...metric,
    statusDisplay: getStatusDisplay(metric.status),
    formattedLastCheck: formatRelativeTime(metric.lastCheck),
    formattedResponseTime: metric.responseTime ? `${metric.responseTime}ms` : undefined,
    formattedUptime: metric.uptime ? formatPercentage(metric.uptime) : undefined,
    formattedErrorRate: metric.errorRate ? formatPercentage(metric.errorRate) : undefined,
    trendDisplay: metric.trend ? formatTrend(metric.trend) : undefined,
  };
};

// Export utilities object
export const dataFormatters = {
  currency: formatCurrency,
  number: formatNumber,
  percentage: formatPercentage,
  date: formatDate,
  relativeTime: formatRelativeTime,
  duration: formatDuration,
  fileSize: formatFileSize,
  status: getStatusDisplay,
  syncType: getSyncTypeDisplay,
  trend: formatTrend,
  priority: getPriorityDisplay,
};

export const validators = {
  email: validateEmail,
  sku: validateSku,
};

export const transformers = {
  order: transformOrderForDisplay,
  inventory: transformInventoryForDisplay,
  syncLog: transformSyncLogForDisplay,
  healthMetric: transformHealthMetricForDisplay,
};
