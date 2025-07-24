/**
 * Shopify Integration Types
 * Shopify 集成相关的 TypeScript 类型定义
 */

// Order related types
export type ShopifyOrder = {
  id: string;
  orderNumber: string;
  customerEmail: string;
  totalPrice: number;
  currency: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  lineItems: ShopifyLineItem[];
  createdAt: string;
  updatedAt: string;
  shopifyId: string;
  syncStatus: 'synced' | 'pending' | 'failed';
  lastSyncAt?: string;
};

export type ShopifyLineItem = {
  id: string;
  productId: string;
  variantId?: string;
  title: string;
  quantity: number;
  price: number;
  sku?: string;
};

// Inventory types
export type InventoryItem = {
  id: string;
  sku: string;
  title: string;
  quantity: number;
  reserved: number;
  available: number;
  location: string;
  productId: string;
  variantId?: string;
  lastUpdated: string;
  needsSync: boolean;
};

// Sync logging types
export type SyncLogEntry = {
  id: string;
  type: 'order' | 'inventory' | 'product' | 'customer';
  operation: 'create' | 'update' | 'delete' | 'sync';
  entityId: string;
  status: 'success' | 'failed' | 'pending';
  message: string;
  errorDetails?: string;
  createdAt: string;
  duration?: number;
  retryCount?: number;
};

// Health monitoring types
export type HealthMetric = {
  id: string;
  name: string;
  category: 'api' | 'sync' | 'webhook' | 'database';
  status: 'healthy' | 'warning' | 'critical';
  value: number;
  unit: string;
  threshold: {
    warning: number;
    critical: number;
  };
  lastChecked: string;
  description: string;
};

// Shopify metrics overview
export type ShopifyMetrics = {
  totalOrders: number;
  syncedToday: number;
  pendingSync: number;
  failedSync: number;
  inventoryItems: number;
  lastSyncTime: string;
  syncStatus: 'healthy' | 'warning' | 'error' | 'syncing';
  apiQuotaUsed: number;
  apiQuotaLimit: number;
  trends: {
    orders: { value: number; type: 'increase' | 'decrease' };
    sync: { value: number; type: 'increase' | 'decrease' };
    inventory: { value: number; type: 'increase' | 'decrease' };
  };
  recentActivity: ActivityItem[];
};

export type ActivityItem = {
  id: string;
  type: 'order' | 'inventory' | 'sync' | 'error';
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
  entityId?: string;
};

// Webhook types
export type ShopifyWebhook = {
  id: string;
  topic: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  apiVersion: string;
  format: 'json' | 'xml';
};

export type WebhookEvent = {
  id: string;
  topic: string;
  shopDomain: string;
  payload: Record<string, any>;
  receivedAt: string;
  processedAt?: string;
  status: 'pending' | 'processed' | 'failed';
  errorMessage?: string;
  retryCount: number;
};

// Product types
export type ShopifyProduct = {
  id: string;
  title: string;
  description: string;
  vendor: string;
  productType: string;
  status: 'active' | 'archived' | 'draft';
  variants: ShopifyVariant[];
  images: ShopifyImage[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  shopifyId: string;
};

export type ShopifyVariant = {
  id: string;
  productId: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  inventoryQuantity: number;
  inventoryManagement: string;
  inventoryPolicy: string;
  weight?: number;
  weightUnit?: string;
  requiresShipping: boolean;
  shopifyId: string;
};

export type ShopifyImage = {
  id: string;
  productId: string;
  src: string;
  alt?: string;
  position: number;
  width: number;
  height: number;
  shopifyId: string;
};

// Customer types
export type ShopifyCustomer = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  addresses: ShopifyAddress[];
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
  shopifyId: string;
};

export type ShopifyAddress = {
  id: string;
  customerId: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  country: string;
  zip: string;
  phone?: string;
  isDefault: boolean;
};

// API response types
export type ShopifyApiResponse<T> = {
  data: T;
  success: boolean;
  error?: string;
  metadata?: {
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
};

export type ShopifyError = {
  message: string;
  field?: string;
  code?: string;
  documentation_url?: string;
};

// Configuration types
export type ShopifyConfig = {
  shopDomain: string;
  accessToken: string;
  apiVersion: string;
  webhookSecret?: string;
  enableLogging: boolean;
  syncInterval: number;
  retryAttempts: number;
  timeout: number;
};

// Store state types
export type ShopifyStoreState = {
  isConnected: boolean;
  config: ShopifyConfig | null;
  lastSync: string | null;
  syncInProgress: boolean;
  errors: string[];
  metrics: ShopifyMetrics | null;
};

// Action types for store
export type ShopifyAction
  = | { type: 'SET_CONFIG'; payload: ShopifyConfig }
    | { type: 'SET_CONNECTED'; payload: boolean }
    | { type: 'SET_SYNC_PROGRESS'; payload: boolean }
    | { type: 'SET_METRICS'; payload: ShopifyMetrics }
    | { type: 'ADD_ERROR'; payload: string }
    | { type: 'CLEAR_ERRORS' }
    | { type: 'UPDATE_LAST_SYNC'; payload: string };

// Hook types
export type UseShopifyReturn = {
  // State
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  metrics: ShopifyMetrics | null;

  // Actions
  connect: (config: ShopifyConfig) => Promise<void>;
  disconnect: () => void;
  syncAll: () => Promise<void>;
  syncOrders: (orderIds: string[]) => Promise<void>;
  syncInventory: () => Promise<void>;

  // Data fetching
  refetch: () => Promise<void>;
};
