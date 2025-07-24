/**
 * Shopify 类型定义
 */

// Rolitt 产品类型（内部产品数据结构）
export type RolittProduct = {
  id: string;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  category?: string;
  status: 'active' | 'draft' | 'archived';
  images?: string[];
  variants?: RolittProductVariant[];
  tags?: string[];
  requiresShipping?: boolean;
  trackInventory?: boolean;
  weight?: number;
  weightUnit?: 'kg' | 'g' | 'lb' | 'oz';
};

export type RolittProductVariant = {
  title: string;
  price: number;
  sku?: string;
  color?: string;
  size?: string;
  inventory?: number;
  weight?: number;
  barcode?: string;
};

// 基础类型
export type ShopifyApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  rateLimitInfo?: {
    remaining: number;
    resetTime: Date;
  };
};

// 产品相关类型
export type ShopifyProduct = {
  id?: string;
  title: string;
  body_html?: string;
  vendor: string;
  product_type: string;
  handle: string;
  status: 'active' | 'draft' | 'archived';
  published_at?: string;
  tags?: string;
  options?: ShopifyProductOption[];
  variants: ShopifyProductVariant[];
  images?: ShopifyProductImage[];
  metafields?: ShopifyMetafield[];
  created_at?: string;
  updated_at?: string;
};

export type ShopifyProductOption = {
  id?: string;
  product_id?: string;
  name: string;
  position?: number;
  values: string[];
};

export type ShopifyProductVariant = {
  id?: string;
  product_id?: string;
  title: string;
  price: string;
  sku?: string;
  position?: number;
  inventory_policy: 'deny' | 'continue';
  compare_at_price?: string;
  fulfillment_service: 'manual' | string;
  inventory_management?: 'shopify' | null;
  option1?: string;
  option2?: string;
  option3?: string;
  requires_shipping: boolean;
  taxable: boolean;
  barcode?: string;
  grams?: number;
  weight?: number;
  weight_unit: 'kg' | 'g' | 'lb' | 'oz';
  inventory_item_id?: string;
  inventory_quantity?: number;
};

export type ShopifyProductImage = {
  id?: string;
  product_id?: string;
  position?: number;
  created_at?: string;
  updated_at?: string;
  alt?: string;
  width?: number;
  height?: number;
  src: string;
  variant_ids?: string[];
};

// 订单相关类型
export type ShopifyOrder = {
  id?: string;
  email: string;
  financial_status: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'partially_refunded' | 'refunded' | 'voided';
  fulfillment_status?: 'fulfilled' | 'null' | 'partial' | 'restocked';
  name?: string;
  note?: string;
  tags?: string;
  currency: string;
  total_price: string;
  subtotal_price?: string;
  total_tax?: string;
  taxes_included?: boolean;
  total_discounts?: string;
  total_line_items_price?: string;
  billing_address?: ShopifyAddress;
  shipping_address?: ShopifyAddress;
  customer?: ShopifyCustomer;
  line_items: ShopifyLineItem[];
  shipping_lines?: ShopifyShippingLine[];
};

export type ShopifyLineItem = {
  id?: string;
  variant_id?: string;
  title: string;
  quantity: number;
  price: string;
  sku?: string;
  variant_title?: string;
  vendor?: string;
  fulfillment_service?: string;
  product_id?: string;
  requires_shipping?: boolean;
  taxable?: boolean;
  gift_card?: boolean;
  name?: string;
  properties?: any[];
  fulfillable_quantity?: number;
  grams?: number;
  total_discount?: string;
};

export type ShopifyAddress = {
  id?: string;
  customer_id?: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  phone?: string;
  name?: string;
  province_code?: string;
  country_code?: string;
  country_name?: string;
  default?: boolean;
};

export type ShopifyCustomer = {
  id?: string;
  email: string;
  accepts_marketing?: boolean;
  created_at?: string;
  updated_at?: string;
  first_name?: string;
  last_name?: string;
  orders_count?: number;
  state?: string;
  total_spent?: string;
  last_order_id?: string;
  note?: string;
  verified_email?: boolean;
  multipass_identifier?: string;
  tax_exempt?: boolean;
  phone?: string;
  tags?: string;
  last_order_name?: string;
  currency?: string;
  addresses?: ShopifyAddress[];
};

export type ShopifyShippingLine = {
  id?: string;
  title: string;
  price: string;
  code?: string;
  source?: string;
  phone?: string;
  requested_fulfillment_service_id?: string;
  delivery_category?: string;
  carrier_identifier?: string;
  discounted_price?: string;
  discounted_price_set?: any;
  discount_allocations?: any[];
  tax_lines?: any[];
};

// 库存相关类型
export type ShopifyInventoryLevel = {
  inventory_item_id: string;
  location_id: string;
  available: number;
  updated_at: string;
};

export type ShopifyInventoryItem = {
  id: string;
  sku?: string;
  created_at: string;
  updated_at: string;
  requires_shipping: boolean;
  cost?: string;
  country_code_of_origin?: string;
  province_code_of_origin?: string;
  harmonized_system_code?: string;
  tracked: boolean;
};

// 元字段类型
export type ShopifyMetafield = {
  id?: string;
  namespace: string;
  key: string;
  value: string;
  type: string;
  description?: string;
  owner_id?: string;
  owner_resource?: string;
  created_at?: string;
  updated_at?: string;
};

// Webhook 类型
export type ShopifyWebhook = {
  id?: string;
  address: string;
  topic: string;
  created_at?: string;
  updated_at?: string;
  format: 'json' | 'xml';
  fields?: string[];
  metafield_namespaces?: string[];
  private_metafield_namespaces?: string[];
};

// 同步结果类型
export type SyncResult = {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: string[];
  details?: any[];
};

export type ProductSyncResult = {
  shopifyProductIds: string[];
} & SyncResult;

export type OrderSyncResult = {
  success: boolean;
  shopifyOrderId?: string;
  shopifyOrderNumber?: string;
  error?: string;
  orderId: string;
};

export type BatchSyncResult = {
  successCount: number;
  failedCount: number;
  results: any[];
};

// 健康检查类型
export type HealthCheckResult = {
  status: 'healthy' | 'unhealthy';
  shopEnabled: boolean;
  apiConnection: boolean;
  webhookActive: boolean;
  lastSyncTime?: Date;
  errors: string[];
};

// 指标类型
export type MetricsSummary = {
  apiCalls: number;
  syncedProducts: number;
  syncedOrders: number;
  errors: number;
  lastSync: string;
};
