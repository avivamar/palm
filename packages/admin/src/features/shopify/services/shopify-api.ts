/**
 * Shopify API Service
 * API 调用服务层 - 请求封装和错误处理
 */

import type {
  HealthMetric,
  InventoryItem,
  ShopifyMetrics,
  ShopifyOrder,
  SyncLogEntry,
} from '../stores/shopify-store';

// Base API configuration
const API_BASE_URL = '/api/shopify';
const API_TIMEOUT = 30000; // 30 seconds

// API Error types
export class ShopifyApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any,
  ) {
    super(message);
    this.name = 'ShopifyApiError';
  }
}

// Request wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    signal: AbortSignal.timeout(API_TIMEOUT),
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        errorDetails = errorData.details;
      } catch {
        // If response is not JSON, use status text
      }

      throw new ShopifyApiError(
        errorMessage,
        response.status,
        response.headers.get('x-error-code') || undefined,
        errorDetails,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ShopifyApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ShopifyApiError('Request timeout', 408, 'TIMEOUT');
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ShopifyApiError('Network error', 0, 'NETWORK_ERROR');
    }

    throw new ShopifyApiError(
      error instanceof Error ? error.message : 'Unknown error',
      0,
      'UNKNOWN_ERROR',
    );
  }
}

// Orders API
const ordersApi = {
  async getAll(): Promise<ShopifyOrder[]> {
    return apiRequest<ShopifyOrder[]>('/orders');
  },

  async getById(orderId: string): Promise<ShopifyOrder> {
    return apiRequest<ShopifyOrder>(`/orders/${orderId}`);
  },

  async retrySync(orderId: string): Promise<{ success: boolean; shopifyOrderId?: string }> {
    return apiRequest<{ success: boolean; shopifyOrderId?: string }>(`/orders/${orderId}/retry`, {
      method: 'POST',
    });
  },

  async bulkSync(orderIds: string[]): Promise<{ processed: number; successful: number; failed: number }> {
    return apiRequest<{ processed: number; successful: number; failed: number }>('/orders/bulk-sync', {
      method: 'POST',
      body: JSON.stringify({ orderIds }),
    });
  },

  async syncAll(): Promise<{ processed: number; successful: number; failed: number }> {
    return apiRequest<{ processed: number; successful: number; failed: number }>('/orders/sync-all', {
      method: 'POST',
    });
  },
};

// Inventory API
const inventoryApi = {
  async getAll(): Promise<InventoryItem[]> {
    return apiRequest<InventoryItem[]>('/inventory');
  },

  async getById(itemId: string): Promise<InventoryItem> {
    return apiRequest<InventoryItem>(`/inventory/${itemId}`);
  },

  async updateStock(itemId: string, stock: number): Promise<InventoryItem> {
    return apiRequest<InventoryItem>(`/inventory/${itemId}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock }),
    });
  },

  async bulkUpdate(updates: Array<{ id: string; stock: number }>): Promise<{ updated: number; failed: number }> {
    return apiRequest<{ updated: number; failed: number }>('/inventory/bulk-update', {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
  },

  async syncWithShopify(): Promise<{ synced: number; errors: number }> {
    return apiRequest<{ synced: number; errors: number }>('/inventory/sync', {
      method: 'POST',
    });
  },

  async getLowStock(threshold?: number): Promise<InventoryItem[]> {
    const query = threshold ? `?threshold=${threshold}` : '';
    return apiRequest<InventoryItem[]>(`/inventory/low-stock${query}`);
  },
};

// Sync Logs API
const syncLogsApi = {
  async getAll(params?: {
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<SyncLogEntry[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString();
    return apiRequest<SyncLogEntry[]>(`/sync-logs${query ? `?${query}` : ''}`);
  },

  async getById(logId: string): Promise<SyncLogEntry> {
    return apiRequest<SyncLogEntry>(`/sync-logs/${logId}`);
  },

  async export(params?: {
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    format?: 'json' | 'csv';
  }): Promise<Blob> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    const query = searchParams.toString();
    const response = await fetch(`${API_BASE_URL}/sync-logs/export${query ? `?${query}` : ''}`, {
      headers: {
        Accept: params?.format === 'csv' ? 'text/csv' : 'application/json',
      },
    });

    if (!response.ok) {
      throw new ShopifyApiError(`Failed to export logs: ${response.statusText}`, response.status);
    }

    return response.blob();
  },
};

// Health Metrics API
const healthApi = {
  async getMetrics(): Promise<HealthMetric[]> {
    return apiRequest<HealthMetric[]>('/health/metrics');
  },

  async getStatus(): Promise<{ status: 'healthy' | 'warning' | 'critical'; services: any[] }> {
    return apiRequest<{ status: 'healthy' | 'warning' | 'critical'; services: any[] }>('/health/status');
  },

  async runHealthCheck(): Promise<{ success: boolean; results: HealthMetric[] }> {
    return apiRequest<{ success: boolean; results: HealthMetric[] }>('/health/check', {
      method: 'POST',
    });
  },

  async testConnection(service: string): Promise<{ success: boolean; responseTime: number; error?: string }> {
    return apiRequest<{ success: boolean; responseTime: number; error?: string }>(`/health/test/${service}`, {
      method: 'POST',
    });
  },
};

// Metrics API
const metricsApi = {
  async getOverview(): Promise<ShopifyMetrics> {
    return apiRequest<ShopifyMetrics>('/metrics/overview');
  },

  async getStats(period: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<{
    orders: { timestamp: string; count: number }[];
    sync: { timestamp: string; success: number; failed: number }[];
    inventory: { timestamp: string; total: number; lowStock: number }[];
  }> {
    return apiRequest(`/metrics/stats?period=${period}`);
  },

  async getPerformance(): Promise<{
    apiResponseTime: number[];
    syncDuration: number[];
    errorRate: number[];
    throughput: number[];
  }> {
    return apiRequest('/metrics/performance');
  },
};

// Configuration API
const configApi = {
  async getSettings(): Promise<{
    autoSync: boolean;
    syncInterval: number;
    lowStockThreshold: number;
    retryAttempts: number;
    webhookUrl: string;
  }> {
    return apiRequest('/config/settings');
  },

  async updateSettings(settings: {
    autoSync?: boolean;
    syncInterval?: number;
    lowStockThreshold?: number;
    retryAttempts?: number;
    webhookUrl?: string;
  }): Promise<{ success: boolean }> {
    return apiRequest('/config/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  },

  async testShopifyConnection(): Promise<{ success: boolean; shop: string; error?: string }> {
    return apiRequest('/config/test-connection', {
      method: 'POST',
    });
  },
};

// Main service object
export const shopifyApiService = {
  // Orders
  getOrders: ordersApi.getAll,
  getOrder: ordersApi.getById,
  retryOrderSync: ordersApi.retrySync,
  bulkSyncOrders: ordersApi.bulkSync,
  syncAllOrders: ordersApi.syncAll,

  // Inventory
  getInventory: inventoryApi.getAll,
  getInventoryItem: inventoryApi.getById,
  updateInventoryItem: inventoryApi.updateStock,
  bulkUpdateInventory: inventoryApi.bulkUpdate,
  syncInventory: inventoryApi.syncWithShopify,
  getLowStockItems: inventoryApi.getLowStock,

  // Sync Logs
  getSyncLogs: syncLogsApi.getAll,
  getSyncLog: syncLogsApi.getById,
  exportSyncLogs: syncLogsApi.export,

  // Health
  getHealthMetrics: healthApi.getMetrics,
  getHealthStatus: healthApi.getStatus,
  runHealthCheck: healthApi.runHealthCheck,
  testServiceConnection: healthApi.testConnection,

  // Metrics
  getMetrics: metricsApi.getOverview,
  getStats: metricsApi.getStats,
  getPerformanceMetrics: metricsApi.getPerformance,

  // Configuration
  getSettings: configApi.getSettings,
  updateSettings: configApi.updateSettings,
  testShopifyConnection: configApi.testShopifyConnection,
};

// Export individual APIs for specific use cases
export { configApi, healthApi, inventoryApi, metricsApi, ordersApi, syncLogsApi };

// Utility functions
export const createMockResponse = <T>(data: T, delay = 1000): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

export const createMockError = (message: string, status = 500, delay = 1000): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new ShopifyApiError(message, status)), delay);
  });
};

// Response interceptor for development
if (process.env.NODE_ENV === 'development') {
  // Add development-specific logging or mocking here
  console.log('Shopify API Service initialized in development mode');
}
