/**
 * 🛒 Shopify API 类型定义
 * 基于Shopify 2025-01 API版本
 */

// ===== 基础类型 =====

export type ShopifyApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  rateLimitInfo?: {
    remaining: number;
    resetTime: Date;
  };
};

export type ShopifyError = {
  message: string;
  code?: string;
  status?: number;
  details?: any;
};

// ===== 产品相关类型 =====

export type ShopifyProduct = {
  id?: string;
  title: string;
  body_html?: string;
  vendor: string;
  product_type: string;
  handle: string;
  status: 'active' | 'draft' | 'archived';
  published_at?: string;
  template_suffix?: string;
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
  image_id?: string;
  weight?: number;
  weight_unit: 'kg' | 'g' | 'lb' | 'oz';
  inventory_item_id?: string;
  inventory_quantity?: number;
  old_inventory_quantity?: number;
  created_at?: string;
  updated_at?: string;
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

// ===== 订单相关类型 =====

export type ShopifyOrder = {
  id?: string;
  admin_graphql_api_id?: string;
  app_id?: string;
  browser_ip?: string;
  buyer_accepts_marketing?: boolean;
  cancel_reason?: string;
  cancelled_at?: string;
  cart_token?: string;
  checkout_id?: string;
  checkout_token?: string;
  client_details?: any;
  closed_at?: string;
  confirmed?: boolean;
  contact_email?: string;
  created_at?: string;
  currency: string;
  current_subtotal_price?: string;
  current_subtotal_price_set?: any;
  current_total_discounts?: string;
  current_total_discounts_set?: any;
  current_total_duties_set?: any;
  current_total_price?: string;
  current_total_price_set?: any;
  current_total_tax?: string;
  current_total_tax_set?: any;
  customer_locale?: string;
  device_id?: string;
  discount_codes?: any[];
  email: string;
  estimated_taxes?: boolean;
  financial_status: 'pending' | 'authorized' | 'partially_paid' | 'paid' | 'partially_refunded' | 'refunded' | 'voided';
  fulfillment_status?: 'fulfilled' | 'null' | 'partial' | 'restocked';
  gateway?: string;
  landing_site?: string;
  landing_site_ref?: string;
  location_id?: string;
  name?: string;
  note?: string;
  note_attributes?: any[];
  number?: number;
  order_number?: number;
  order_status_url?: string;
  original_total_duties_set?: any;
  payment_gateway_names?: string[];
  phone?: string;
  presentment_currency?: string;
  processed_at?: string;
  processing_method: 'checkout' | 'direct' | 'manual' | 'offsite' | 'express';
  reference?: string;
  referring_site?: string;
  source_identifier?: string;
  source_name?: string;
  source_url?: string;
  subtotal_price?: string;
  subtotal_price_set?: any;
  tags?: string;
  tax_lines?: any[];
  taxes_included?: boolean;
  test?: boolean;
  token?: string;
  total_discounts?: string;
  total_discounts_set?: any;
  total_line_items_price?: string;
  total_line_items_price_set?: any;
  total_outstanding?: string;
  total_price: string;
  total_price_set?: any;
  total_price_usd?: string;
  total_shipping_price_set?: any;
  total_tax?: string;
  total_tax_set?: any;
  total_tip_received?: string;
  total_weight?: number;
  updated_at?: string;
  user_id?: string;

  // 关联对象
  billing_address?: ShopifyAddress;
  customer?: ShopifyCustomer;
  discount_applications?: any[];
  fulfillments?: ShopifyFulfillment[];
  line_items: ShopifyLineItem[];
  payment_details?: any;
  refunds?: any[];
  shipping_address?: ShopifyAddress;
  shipping_lines?: any[];
};

export type ShopifyLineItem = {
  id?: string;
  admin_graphql_api_id?: string;
  fulfillable_quantity?: number;
  fulfillment_service?: string;
  fulfillment_status?: string;
  gift_card?: boolean;
  grams?: number;
  name?: string;
  origin_location?: any;
  price: string;
  price_set?: any;
  product_exists?: boolean;
  product_id?: string;
  properties?: any[];
  quantity: number;
  requires_shipping?: boolean;
  sku?: string;
  taxable?: boolean;
  title: string;
  total_discount?: string;
  total_discount_set?: any;
  variant_id?: string;
  variant_inventory_management?: string;
  variant_title?: string;
  vendor?: string;
  tax_lines?: any[];
  duties?: any[];
  discount_allocations?: any[];
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
  accepts_marketing_updated_at?: string;
  marketing_opt_in_level?: string;
  tax_exemptions?: any[];
  sms_marketing_consent?: any;
  admin_graphql_api_id?: string;
  default_address?: ShopifyAddress;
};

export type ShopifyFulfillment = {
  id?: string;
  order_id?: string;
  status?: string;
  created_at?: string;
  service?: string;
  updated_at?: string;
  tracking_company?: string;
  shipment_status?: string;
  location_id?: string;
  line_items?: ShopifyLineItem[];
  tracking_number?: string;
  tracking_numbers?: string[];
  tracking_url?: string;
  tracking_urls?: string[];
  receipt?: any;
  name?: string;
  admin_graphql_api_id?: string;
};

// ===== 库存相关类型 =====

export type ShopifyInventoryLevel = {
  inventory_item_id: string;
  location_id: string;
  available: number;
  updated_at: string;
  admin_graphql_api_id?: string;
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
  country_harmonized_system_codes?: any[];
  admin_graphql_api_id?: string;
};

export type ShopifyLocation = {
  id: string;
  name: string;
  address1?: string;
  address2?: string;
  city?: string;
  zip?: string;
  province?: string;
  country?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  country_code?: string;
  country_name?: string;
  province_code?: string;
  legacy?: boolean;
  active?: boolean;
  admin_graphql_api_id?: string;
  localized_country_name?: string;
  localized_province_name?: string;
};

// ===== Webhook相关类型 =====

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
  verified?: boolean;
  admin_graphql_api_id?: string;
};

export type ShopifyWebhookPayload = {
  topic: string;
  shop_domain: string;
  webhook_id: string;
  event_time: string;
  payload: any;
};

// ===== 元字段相关类型 =====

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
  admin_graphql_api_id?: string;
};

// ===== 商店相关类型 =====

export type ShopifyShop = {
  id: string;
  name: string;
  email: string;
  domain: string;
  province?: string;
  country: string;
  address1?: string;
  zip?: string;
  city?: string;
  source?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  primary_locale: string;
  address2?: string;
  created_at: string;
  updated_at: string;
  country_code: string;
  country_name: string;
  currency: string;
  customer_email?: string;
  timezone: string;
  iana_timezone: string;
  shop_owner: string;
  money_format: string;
  money_with_currency_format: string;
  weight_unit: string;
  province_code?: string;
  taxes_included?: boolean;
  auto_configure_tax_inclusivity?: boolean;
  tax_shipping?: boolean;
  county_taxes?: boolean;
  plan_display_name: string;
  plan_name: string;
  has_discounts: boolean;
  has_gift_cards: boolean;
  myshopify_domain: string;
  google_apps_domain?: string;
  google_apps_login_enabled?: boolean;
  money_in_emails_format: string;
  money_with_currency_in_emails_format: string;
  eligible_for_payments: boolean;
  requires_extra_payments_agreement: boolean;
  password_enabled: boolean;
  has_storefront: boolean;
  eligible_for_card_reader_giveaway?: boolean;
  finances: boolean;
  primary_location_id: string;
  cookie_consent_level: string;
  visitor_tracking_consent_preference: string;
  checkout_api_supported: boolean;
  multi_location_enabled: boolean;
  setup_required: boolean;
  pre_launch_enabled: boolean;
  enabled_presentment_currencies: string[];
  transactional_sms_disabled?: boolean;
  marketing_sms_consent_enabled_at_checkout: boolean;
};

// ===== API请求选项 =====

export type ShopifyApiOptions = {
  retries?: number;
  timeout?: number;
  skipRateLimit?: boolean;
};

export type ShopifyListOptions = {
  limit?: number;
  page_info?: string;
  since_id?: string;
  created_at_min?: string;
  created_at_max?: string;
  updated_at_min?: string;
  updated_at_max?: string;
  published_at_min?: string;
  published_at_max?: string;
  fields?: string;
  handle?: string;
  product_type?: string;
  vendor?: string;
  status?: string;
};

// ===== 错误类型 =====

export type ShopifyValidationError = {
  field: string;
  message: string;
  code?: string;
};

export type ShopifyApiError = {
  errors: string | string[] | Record<string, string[]> | ShopifyValidationError[];
  message?: string;
  status?: number;
};

// ===== 批量操作类型 =====

export type ShopifyBulkOperation = {
  id: string;
  status: 'CREATED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELED';
  error_code?: string;
  created_at: string;
  completed_at?: string;
  object_count?: number;
  file_size?: number;
  url?: string;
  partial_data_url?: string;
};

export type ShopifyBulkQuery = {
  query: string;
  variables?: Record<string, any>;
};

// ===== 分页信息类型 =====

export type ShopifyPageInfo = {
  has_next_page: boolean;
  has_previous_page: boolean;
  start_cursor?: string;
  end_cursor?: string;
};

// ===== GraphQL相关类型 =====

export type ShopifyGraphQLResponse<T = any> = {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
    extensions?: any;
  }>;
  extensions?: any;
};

export type ShopifyGraphQLVariables = {
  [key: string]: any;
};
