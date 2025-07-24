/**
 * 🔌 渠道接口类型定义
 * 定义Rolitt系统与各电商渠道的统一接口规范
 */

import type {
  BatchSyncResult,
  RolittCustomerSync,
  RolittOrderSync,
  RolittProductSync,
  SyncEvent,
} from './sync-models';

// ===== 基础渠道接口 =====

/**
 * 🏪 电商渠道基础接口
 */
export type EcommerceChannel = {
  readonly channelId: string;
  readonly channelName: string;
  readonly version: string;
  readonly capabilities: ChannelCapabilities;

  // 生命周期方法
  initialize: () => Promise<ChannelInitResult>;
  healthCheck: () => Promise<ChannelHealthResult>;
  disconnect: () => Promise<void>;
};

/**
 * ⚡ 渠道能力定义
 */
export type ChannelCapabilities = {
  products: {
    create: boolean;
    update: boolean;
    delete: boolean;
    batchSync: boolean;
    realTimeSync: boolean;
  };
  orders: {
    create: boolean;
    update: boolean;
    statusTracking: boolean;
    fulfillment: boolean;
    refunds: boolean;
  };
  customers: {
    create: boolean;
    update: boolean;
    segmentation: boolean;
    marketingConsent: boolean;
  };
  inventory: {
    read: boolean;
    update: boolean;
    realTimeUpdates: boolean;
    multiLocation: boolean;
  };
  webhooks: {
    supported: boolean;
    events: string[];
    verification: boolean;
  };
};

/**
 * 🏁 渠道初始化结果
 */
export type ChannelInitResult = {
  success: boolean;
  channelInfo?: {
    name: string;
    domain: string;
    currency: string;
    timezone: string;
    plan: string;
  };
  capabilities?: ChannelCapabilities;
  error?: string;
  warnings?: string[];
};

/**
 * 🏥 渠道健康检查结果
 */
export type ChannelHealthResult = {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: Date;
  latency: number;
  checks: {
    connectivity: HealthCheckStatus;
    authentication: HealthCheckStatus;
    rateLimit: HealthCheckStatus;
    features: HealthCheckStatus;
  };
  message: string;
  canContinue: boolean;
};

export type HealthCheckStatus = {
  status: 'pass' | 'warn' | 'fail';
  message: string;
  details?: any;
};

// ===== 产品渠道接口 =====

/**
 * 🎨 产品管理渠道接口
 */
export type ProductChannel = {
  // 产品同步
  syncProduct: (product: RolittProductSync) => Promise<ProductSyncResult>;
  syncProducts: (products: RolittProductSync[]) => Promise<BatchSyncResult<RolittProductSync>>;

  // 产品查询
  getProduct: (channelProductId: string) => Promise<ChannelProductResult>;
  searchProducts: (filters: ProductSearchFilters) => Promise<ChannelProductListResult>;

  // 产品状态管理
  publishProduct: (channelProductId: string) => Promise<ProductActionResult>;
  unpublishProduct: (channelProductId: string) => Promise<ProductActionResult>;
  deleteProduct: (channelProductId: string) => Promise<ProductActionResult>;
} & EcommerceChannel;

/**
 * 📦 产品同步结果
 */
export type ProductSyncResult = {
  success: boolean;
  channelProductId?: string;
  channelVariantIds?: string[];
  warnings?: string[];
  error?: string;
  syncedAt: Date;
};

/**
 * 🎯 产品查询结果
 */
export type ChannelProductResult = {
  success: boolean;
  product?: {
    channelProductId: string;
    title: string;
    status: string;
    variants: Array<{
      channelVariantId: string;
      sku: string;
      price: string;
      inventory: number;
    }>;
    createdAt: Date;
    updatedAt: Date;
  };
  error?: string;
};

/**
 * 📋 产品列表查询结果
 */
export type ChannelProductListResult = {
  success: boolean;
  products: ChannelProductResult['product'][];
  pagination?: {
    hasNext: boolean;
    hasPrevious: boolean;
    total?: number;
    pageSize: number;
  };
  error?: string;
};

/**
 * 🔍 产品搜索过滤器
 */
export type ProductSearchFilters = {
  title?: string;
  sku?: string;
  status?: 'active' | 'draft' | 'archived';
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
  limit?: number;
  offset?: number;
};

/**
 * ⚡ 产品操作结果
 */
export type ProductActionResult = {
  success: boolean;
  channelProductId: string;
  action: 'publish' | 'unpublish' | 'delete';
  message: string;
  error?: string;
};

// ===== 订单渠道接口 =====

/**
 * 📦 订单管理渠道接口
 */
export type OrderChannel = {
  // 订单同步
  syncOrder: (order: RolittOrderSync) => Promise<OrderSyncResult>;
  syncOrders: (orders: RolittOrderSync[]) => Promise<BatchSyncResult<RolittOrderSync>>;

  // 订单查询
  getOrder: (channelOrderId: string) => Promise<ChannelOrderResult>;
  searchOrders: (filters: OrderSearchFilters) => Promise<ChannelOrderListResult>;

  // 订单状态管理
  updateOrderStatus: (channelOrderId: string, status: OrderStatus) => Promise<OrderActionResult>;
  fulfillOrder: (channelOrderId: string, fulfillment: OrderFulfillment) => Promise<OrderActionResult>;
  refundOrder: (channelOrderId: string, refund: OrderRefund) => Promise<OrderActionResult>;
} & EcommerceChannel;

/**
 * 📦 订单同步结果
 */
export type OrderSyncResult = {
  success: boolean;
  channelOrderId?: string;
  channelOrderNumber?: string;
  warnings?: string[];
  error?: string;
  syncedAt: Date;
};

/**
 * 🎯 订单查询结果
 */
export type ChannelOrderResult = {
  success: boolean;
  order?: {
    channelOrderId: string;
    channelOrderNumber: string;
    status: OrderStatus;
    financialStatus: string;
    fulfillmentStatus?: string;
    totalPrice: string;
    currency: string;
    customer: {
      email: string;
      firstName?: string;
      lastName?: string;
    };
    lineItems: Array<{
      title: string;
      quantity: number;
      price: string;
      sku?: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
  };
  error?: string;
};

/**
 * 📋 订单列表查询结果
 */
export type ChannelOrderListResult = {
  success: boolean;
  orders: ChannelOrderResult['order'][];
  pagination?: {
    hasNext: boolean;
    hasPrevious: boolean;
    total?: number;
    pageSize: number;
  };
  error?: string;
};

/**
 * 🔍 订单搜索过滤器
 */
export type OrderSearchFilters = {
  email?: string;
  status?: OrderStatus;
  financialStatus?: string;
  fulfillmentStatus?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
  limit?: number;
  offset?: number;
};

/**
 * 📊 订单状态枚举
 */
export type OrderStatus
  = | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';

/**
 * 🚚 订单履约信息
 */
export type OrderFulfillment = {
  trackingNumber?: string;
  trackingCompany?: string;
  trackingUrl?: string;
  lineItems?: Array<{
    lineItemId: string;
    quantity: number;
  }>;
  notifyCustomer?: boolean;
};

/**
 * 💰 订单退款信息
 */
export type OrderRefund = {
  amount: number;
  reason?: string;
  lineItems?: Array<{
    lineItemId: string;
    quantity: number;
    amount: number;
  }>;
  notifyCustomer?: boolean;
};

/**
 * ⚡ 订单操作结果
 */
export type OrderActionResult = {
  success: boolean;
  channelOrderId: string;
  action: 'status_update' | 'fulfill' | 'refund';
  message: string;
  error?: string;
  details?: any;
};

// ===== 客户渠道接口 =====

/**
 * 👤 客户管理渠道接口
 */
export type CustomerChannel = {
  // 客户同步
  syncCustomer: (customer: RolittCustomerSync) => Promise<CustomerSyncResult>;
  syncCustomers: (customers: RolittCustomerSync[]) => Promise<BatchSyncResult<RolittCustomerSync>>;

  // 客户查询
  getCustomer: (channelCustomerId: string) => Promise<ChannelCustomerResult>;
  searchCustomers: (filters: CustomerSearchFilters) => Promise<ChannelCustomerListResult>;

  // 客户管理
  updateCustomerConsent: (channelCustomerId: string, consent: boolean) => Promise<CustomerActionResult>;
} & EcommerceChannel;

/**
 * 👤 客户同步结果
 */
export type CustomerSyncResult = {
  success: boolean;
  channelCustomerId?: string;
  warnings?: string[];
  error?: string;
  syncedAt: Date;
};

/**
 * 🎯 客户查询结果
 */
export type ChannelCustomerResult = {
  success: boolean;
  customer?: {
    channelCustomerId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    acceptsMarketing: boolean;
    ordersCount: number;
    totalSpent: string;
    createdAt: Date;
    updatedAt: Date;
  };
  error?: string;
};

/**
 * 📋 客户列表查询结果
 */
export type ChannelCustomerListResult = {
  success: boolean;
  customers: ChannelCustomerResult['customer'][];
  pagination?: {
    hasNext: boolean;
    hasPrevious: boolean;
    total?: number;
    pageSize: number;
  };
  error?: string;
};

/**
 * 🔍 客户搜索过滤器
 */
export type CustomerSearchFilters = {
  email?: string;
  firstName?: string;
  lastName?: string;
  acceptsMarketing?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  limit?: number;
  offset?: number;
};

/**
 * ⚡ 客户操作结果
 */
export type CustomerActionResult = {
  success: boolean;
  channelCustomerId: string;
  action: 'consent_update';
  message: string;
  error?: string;
};

// ===== 库存渠道接口 =====

/**
 * 📦 库存管理渠道接口
 */
export type InventoryChannel = {
  // 库存查询
  getInventoryLevels: () => Promise<InventoryLevelsResult>;
  getInventoryLevel: (sku: string) => Promise<InventoryLevelResult>;

  // 库存更新
  updateInventoryLevel: (sku: string, quantity: number, locationId?: string) => Promise<InventoryUpdateResult>;
  adjustInventoryLevel: (sku: string, adjustment: number, locationId?: string) => Promise<InventoryUpdateResult>;
} & EcommerceChannel;

/**
 * 📊 库存水平结果
 */
export type InventoryLevelsResult = {
  success: boolean;
  levels: Array<{
    sku: string;
    available: number;
    locationId: string;
    locationName?: string;
    updatedAt: Date;
  }>;
  error?: string;
};

/**
 * 📦 单个库存水平结果
 */
export type InventoryLevelResult = {
  success: boolean;
  level?: {
    sku: string;
    available: number;
    locationId: string;
    locationName?: string;
    updatedAt: Date;
  };
  error?: string;
};

/**
 * ⚡ 库存更新结果
 */
export type InventoryUpdateResult = {
  success: boolean;
  sku: string;
  previousQuantity: number;
  newQuantity: number;
  adjustment: number;
  locationId: string;
  message: string;
  error?: string;
};

// ===== Webhook渠道接口 =====

/**
 * 🔔 Webhook管理渠道接口
 */
export type WebhookChannel = {
  // Webhook管理
  registerWebhook: (webhook: WebhookRegistration) => Promise<WebhookRegistrationResult>;
  unregisterWebhook: (webhookId: string) => Promise<WebhookActionResult>;
  listWebhooks: () => Promise<WebhookListResult>;

  // Webhook验证
  verifyWebhookSignature: (payload: string, signature: string, secret: string) => boolean;
  processWebhookEvent: (event: WebhookEvent) => Promise<WebhookProcessResult>;
} & EcommerceChannel;

/**
 * 🔔 Webhook注册信息
 */
export type WebhookRegistration = {
  topic: string;
  address: string;
  format: 'json' | 'xml';
  fields?: string[];
};

/**
 * ✅ Webhook注册结果
 */
export type WebhookRegistrationResult = {
  success: boolean;
  webhookId?: string;
  webhook?: {
    id: string;
    topic: string;
    address: string;
    createdAt: Date;
  };
  error?: string;
};

/**
 * ⚡ Webhook操作结果
 */
export type WebhookActionResult = {
  success: boolean;
  webhookId: string;
  action: 'unregister';
  message: string;
  error?: string;
};

/**
 * 📋 Webhook列表结果
 */
export type WebhookListResult = {
  success: boolean;
  webhooks: Array<{
    id: string;
    topic: string;
    address: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  error?: string;
};

/**
 * 📡 Webhook事件
 */
export type WebhookEvent = {
  topic: string;
  shopDomain: string;
  webhookId: string;
  eventTime: Date;
  payload: any;
};

/**
 * ⚡ Webhook处理结果
 */
export type WebhookProcessResult = {
  success: boolean;
  topic: string;
  action: 'processed' | 'ignored' | 'retry';
  message: string;
  syncEvents?: SyncEvent[];
  error?: string;
};

// ===== 渠道工厂接口 =====

/**
 * 🏭 渠道工厂接口
 */
export type ChannelFactory = {
  createChannel: (type: ChannelType, config: ChannelConfig) => Promise<EcommerceChannel>;
  getSupportedChannels: () => ChannelType[];
  getChannelCapabilities: (type: ChannelType) => ChannelCapabilities;
};

/**
 * 🏪 渠道类型
 */
export type ChannelType = 'shopify' | 'amazon' | 'ebay' | 'etsy' | 'custom';

/**
 * ⚙️ 渠道配置
 */
export type ChannelConfig = {
  type: ChannelType;
  credentials: Record<string, string>;
  settings: Record<string, any>;
  features: Partial<ChannelCapabilities>;
};

// ===== 渠道管理器接口 =====

/**
 * 🎯 渠道管理器接口
 */
export type ChannelManager = {
  // 渠道生命周期
  addChannel: (config: ChannelConfig) => Promise<string>;
  removeChannel: (channelId: string) => Promise<void>;
  getChannel: (channelId: string) => EcommerceChannel | null;
  listChannels: () => EcommerceChannel[];

  // 批量操作
  syncToAllChannels: <T>(data: T, syncType: 'product' | 'order' | 'customer') => Promise<Record<string, any>>;
  healthCheckAllChannels: () => Promise<Record<string, ChannelHealthResult>>;
};
