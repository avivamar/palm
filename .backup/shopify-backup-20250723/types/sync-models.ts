/**
 * 🔄 同步模型类型定义
 * 定义系统与Shopify之间的数据同步模型
 */

// ===== 内部系统到Shopify的同步模型 =====

/**
 * 🎨 Rolitt产品同步模型
 */
export type RolittProductSync = {
  // Rolitt系统内部字段
  color: 'Honey Khaki' | 'Sakura Pink' | 'Healing Green' | 'Moonlight Grey' | 'Red';
  priceId: string;
  amount: number;
  currency: string;

  // 同步到Shopify的产品信息
  shopifyData: {
    title: string;
    description: string;
    vendor: string;
    productType: string;
    tags: string[];
    variants: RolittVariantSync[];
    images?: RolittImageSync[];
  };

  // 同步状态
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  shopifyProductId?: string;
  lastSyncAt?: Date;
  syncError?: string;
};

/**
 * 🔧 Rolitt变体同步模型
 */
export type RolittVariantSync = {
  color: string;
  price: string;
  sku: string;
  inventoryQuantity: number;
  weight?: number;
  requiresShipping: boolean;
  taxable: boolean;
};

/**
 * 🖼️ Rolitt图片同步模型
 */
export type RolittImageSync = {
  src: string;
  alt: string;
  position: number;
};

/**
 * 📦 Rolitt订单同步模型
 */
export type RolittOrderSync = {
  // Rolitt系统内部字段
  preorderId: string;
  preorderNumber: string;
  userId?: string;
  email: string;
  color: string;
  amount: number;
  currency: string;
  status: 'initiated' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';

  // 客户信息
  customer: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };

  // 地址信息
  shippingAddress?: RolittAddressSync;
  billingAddress?: RolittAddressSync;

  // 订单项目
  lineItems: RolittLineItemSync[];

  // 同步到Shopify的订单信息
  shopifyData: {
    financialStatus: 'pending' | 'authorized' | 'partially_paid' | 'paid';
    fulfillmentStatus?: 'fulfilled' | 'partial' | 'restocked';
    tags: string[];
    note?: string;
  };

  // 同步状态
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  shopifyOrderId?: string;
  shopifyOrderNumber?: string;
  lastSyncAt?: Date;
  syncError?: string;
};

/**
 * 📍 Rolitt地址同步模型
 */
export type RolittAddressSync = {
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
};

/**
 * 📋 Rolitt订单项同步模型
 */
export type RolittLineItemSync = {
  title: string;
  price: string;
  quantity: number;
  sku: string;
  variantTitle?: string;
  productId?: string;
  variantId?: string;
};

/**
 * 👤 Rolitt客户同步模型
 */
export type RolittCustomerSync = {
  // Rolitt系统内部字段
  userId: string;
  email: string;
  displayName?: string;
  phone?: string;
  country?: string;
  marketingConsent: boolean;

  // 同步到Shopify的客户信息
  shopifyData: {
    firstName?: string;
    lastName?: string;
    acceptsMarketing: boolean;
    tags: string[];
    note?: string;
    addresses?: RolittAddressSync[];
  };

  // 同步状态
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  shopifyCustomerId?: string;
  lastSyncAt?: Date;
  syncError?: string;
};

// ===== Shopify到内部系统的同步模型 =====

/**
 * 📦 Shopify库存同步模型
 */
export type ShopifyInventorySync = {
  inventoryItemId: string;
  sku: string;
  available: number;
  locationId: string;

  // 映射到Rolitt系统
  rolittData: {
    color?: string;
    totalQuantity: number;
    reservedQuantity: number;
  };

  // 同步状态
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  lastSyncAt?: Date;
  syncError?: string;
};

/**
 * 🔄 Shopify履约同步模型
 */
export type ShopifyFulfillmentSync = {
  shopifyOrderId: string;
  fulfillmentId: string;
  status: string;
  trackingNumber?: string;
  trackingCompany?: string;
  trackingUrl?: string;

  // 映射到Rolitt系统
  rolittData: {
    preorderId?: string;
    shippedAt?: Date;
    trackingNumber?: string;
    deliveryStatus: 'pending' | 'shipped' | 'in_transit' | 'delivered';
  };

  // 同步状态
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  lastSyncAt?: Date;
  syncError?: string;
};

// ===== 同步批处理模型 =====

/**
 * 📊 批量同步请求
 */
export type BatchSyncRequest<T> = {
  type: 'products' | 'orders' | 'customers' | 'inventory';
  items: T[];
  options: {
    skipValidation?: boolean;
    failFast?: boolean;
    maxRetries?: number;
    batchSize?: number;
  };
};

/**
 * 📈 批量同步结果
 */
export type BatchSyncResult<T> = {
  type: 'products' | 'orders' | 'customers' | 'inventory';
  total: number;
  successful: number;
  failed: number;
  results: Array<{
    item: T;
    success: boolean;
    shopifyId?: string;
    error?: string;
  }>;
  duration: number;
  startedAt: Date;
  completedAt: Date;
};

// ===== 同步队列模型 =====

/**
 * 🗂️ 同步队列项
 */
export type SyncQueueItem = {
  id: string;
  type: 'product' | 'order' | 'customer' | 'inventory';
  action: 'create' | 'update' | 'delete';
  data: any;
  priority: 'low' | 'medium' | 'high';
  retryCount: number;
  maxRetries: number;
  scheduledAt: Date;
  createdAt: Date;
  error?: string;
};

/**
 * 📋 同步队列状态
 */
export type SyncQueueStatus = {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  retrying: number;
};

// ===== 同步配置模型 =====

/**
 * ⚙️ 同步配置
 */
export type SyncConfiguration = {
  // 产品同步配置
  products: {
    enabled: boolean;
    autoSync: boolean;
    syncInterval: number; // 分钟
    batchSize: number;
    retryAttempts: number;
  };

  // 订单同步配置
  orders: {
    enabled: boolean;
    autoSync: boolean;
    syncOnStatusChange: boolean;
    batchSize: number;
    retryAttempts: number;
  };

  // 客户同步配置
  customers: {
    enabled: boolean;
    autoSync: boolean;
    syncMarketingConsent: boolean;
    batchSize: number;
    retryAttempts: number;
  };

  // 库存同步配置
  inventory: {
    enabled: boolean;
    autoSync: boolean;
    syncInterval: number; // 分钟
    lowStockThreshold: number;
    retryAttempts: number;
  };
};

// ===== 同步事件模型 =====

/**
 * 📡 同步事件
 */
export type SyncEvent = {
  id: string;
  type: 'sync.started' | 'sync.completed' | 'sync.failed' | 'sync.retrying';
  entity: 'product' | 'order' | 'customer' | 'inventory';
  entityId: string;
  shopifyId?: string;
  data: any;
  error?: string;
  timestamp: Date;
};

/**
 * 👂 同步事件监听器
 */
export type SyncEventListener = {
  (event: SyncEvent): void | Promise<void>;
};

// ===== 数据映射模型 =====

/**
 * 🗺️ 数据字段映射
 */
export type FieldMapping = {
  source: string;
  target: string;
  transform?: (value: any) => any;
  required?: boolean;
  defaultValue?: any;
};

/**
 * 🔄 实体映射配置
 */
export type EntityMapping = {
  entity: 'product' | 'order' | 'customer';
  direction: 'to_shopify' | 'from_shopify' | 'bidirectional';
  fields: FieldMapping[];
  validation?: {
    required: string[];
    format: Record<string, RegExp>;
  };
};
