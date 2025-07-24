/**
 * 🧹 数据脱敏处理器
 * 确保敏感数据不推送到Shopify
 */

import { isFeatureEnabled } from '../config';

export type SanitizedOrderData = {
  // 基础订单信息
  email: string;
  name?: string;
  phone?: string;

  // 产品信息
  line_items: Array<{
    title: string;
    variant_title?: string;
    quantity: number;
    price: string;
    sku?: string;
    product_id?: string;
    variant_id?: string;
  }>;

  // 地址信息
  shipping_address?: ShopifyAddress;
  billing_address?: ShopifyAddress;

  // 订单元数据
  total_price: string;
  currency: string;
  order_number?: string;
  note?: string;
  tags?: string[];

  // 履约状态
  fulfillment_status?: string;
  financial_status?: string;
};

type ShopifyAddress = {
  first_name?: string;
  last_name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  phone?: string;
};

type SensitiveDataPolicy = {
  // 🚫 明确禁止推送的数据
  forbidden: string[];
  // ⚠️  需要脱敏的数据
  requiresSanitization: string[];
  // ✅ 允许推送的数据
  allowed: string[];
};

/**
 * 🛡️ 数据脱敏策略配置
 */
const DATA_POLICY: SensitiveDataPolicy = {
  forbidden: [
    // 🚫 支付相关敏感信息
    'payment_method',
    'payment_details',
    'stripe_payment_intent_id',
    'stripe_session_id',
    'credit_card_info',
    'bank_details',

    // 🚫 认证相关信息
    'password',
    'auth_tokens',
    'session_tokens',
    'api_keys',
    'user_id', // 内部用户ID
    'supabase_id',
    'firebase_uid',

    // 🚫 营销相关敏感数据
    'marketing_consent_details',
    'email_tracking_data',
    'user_behavior_analytics',
    'conversion_tracking',
    'utm_detailed_analytics',

    // 🚫 商业机密
    'internal_cost',
    'profit_margin',
    'supplier_info',
    'internal_notes',
    'admin_comments',
  ],

  requiresSanitization: [
    // ⚠️  个人信息需要最小化
    'phone',
    'date_of_birth',
    'notes',
    'customer_note',
  ],

  allowed: [
    // ✅ 履约必需信息
    'email',
    'name',
    'shipping_address',
    'billing_address',
    'product_info',
    'quantity',
    'price',
    'currency',
    'order_status',
    'fulfillment_status',
    'tracking_info',

    // ✅ 基础商业信息
    'order_number',
    'sku',
    'variant_info',
    'shipping_method',
    'order_total',
  ],
};

/**
 * 🧹 核心数据脱敏函数
 */
export function sanitizeDataForShopify(orderData: any): SanitizedOrderData {
  if (!isFeatureEnabled('ENABLED')) {
    throw new Error('Shopify集成已禁用，无法处理数据');
  }

  // 🔍 验证输入数据
  if (!orderData || typeof orderData !== 'object') {
    throw new Error('Invalid order data provided for sanitization');
  }

  try {
    // 🧹 开始数据脱敏
    const sanitized: SanitizedOrderData = {
      // 基础客户信息（履约必需）
      email: sanitizeEmail(orderData.email),
      name: sanitizeName(orderData.name || orderData.billing_name || orderData.customer_name),
      phone: sanitizePhone(orderData.phone || orderData.billing_phone),

      // 产品信息
      line_items: sanitizeLineItems(orderData.line_items || orderData.products || []),

      // 地址信息
      shipping_address: sanitizeAddress(orderData.shipping_address),
      billing_address: sanitizeAddress(orderData.billing_address),

      // 订单基础信息
      total_price: sanitizePrice(orderData.amount || orderData.total_price || '0.00'),
      currency: orderData.currency || 'USD',
      order_number: sanitizeOrderNumber(orderData.preorder_number || orderData.order_number),

      // 可选信息
      note: sanitizeNote(orderData.customer_notes || orderData.note),
      tags: sanitizeTags(orderData.tags || []),

      // 履约状态
      fulfillment_status: orderData.status === 'completed' ? 'unfulfilled' : undefined,
      financial_status: orderData.status === 'completed' ? 'paid' : 'pending',
    };

    // 🔍 最后验证脱敏结果
    validateSanitizedData(sanitized);

    console.log(`[DataSanitizer] ✅ 数据脱敏完成，订单号: ${sanitized.order_number}`);
    return sanitized;
  } catch (error) {
    console.error('[DataSanitizer] ❌ 数据脱敏失败:', error);
    throw new Error(`数据脱敏失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }
}

/**
 * 📧 邮箱脱敏（保留履约功能）
 */
function sanitizeEmail(email: any): string {
  if (!email || typeof email !== 'string') {
    throw new Error('邮箱地址是必需的');
  }

  // 基本邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('邮箱格式无效');
  }

  return email.toLowerCase().trim();
}

/**
 * 👤 姓名脱敏
 */
function sanitizeName(name: any): string | undefined {
  if (!name) {
    return undefined;
  }

  if (typeof name !== 'string') {
    name = String(name);
  }

  // 移除特殊字符，保留履约必需信息
  return name.trim().replace(/[<>"']/g, '').substring(0, 50);
}

/**
 * 📱 手机号脱敏
 */
function sanitizePhone(phone: any): string | undefined {
  if (!phone) {
    return undefined;
  }

  if (typeof phone !== 'string') {
    phone = String(phone);
  }

  // 移除敏感字符，保留数字和基本格式
  return phone.replace(/[^0-9+\-\s()]/g, '').trim().substring(0, 20);
}

/**
 * 📦 产品信息脱敏
 */
function sanitizeLineItems(items: any[]): SanitizedOrderData['line_items'] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map(item => ({
    title: sanitizeName(item.title || item.name || item.product_name) || 'Unknown Product',
    variant_title: sanitizeName(item.variant_title || item.color),
    quantity: Math.max(1, Number.parseInt(item.quantity) || 1),
    price: sanitizePrice(item.price || item.amount || '0.00'),
    sku: sanitizeSKU(item.sku),
    // 不包含内部产品ID
  }));
}

/**
 * 🏠 地址信息脱敏
 */
function sanitizeAddress(address: any): ShopifyAddress | undefined {
  if (!address || typeof address !== 'object') {
    return undefined;
  }

  return {
    first_name: sanitizeName(address.first_name || address.name)?.split(' ')[0],
    last_name: sanitizeName(address.last_name || address.name)?.split(' ').slice(1).join(' '),
    address1: sanitizeName(address.address1 || address.line1)?.substring(0, 100),
    address2: sanitizeName(address.address2 || address.line2)?.substring(0, 100),
    city: sanitizeName(address.city)?.substring(0, 50),
    province: sanitizeName(address.province || address.state)?.substring(0, 50),
    country: sanitizeName(address.country)?.substring(0, 2).toUpperCase(),
    zip: sanitizeName(address.zip || address.postal_code)?.substring(0, 20),
    phone: sanitizePhone(address.phone),
  };
}

/**
 * 💰 价格脱敏
 */
function sanitizePrice(price: any): string {
  if (typeof price === 'number') {
    return price.toFixed(2);
  }

  if (typeof price === 'string') {
    const cleaned = price.replace(/[^0-9.]/g, '');
    const parsed = Number.parseFloat(cleaned);
    return isNaN(parsed) ? '0.00' : parsed.toFixed(2);
  }

  return '0.00';
}

/**
 * 🏷️ SKU脱敏
 */
function sanitizeSKU(sku: any): string | undefined {
  if (!sku) {
    return undefined;
  }

  return String(sku).replace(/[^\w\-]/g, '').substring(0, 50);
}

/**
 * 📝 备注脱敏
 */
function sanitizeNote(note: any): string | undefined {
  if (!note) {
    return undefined;
  }

  // 移除敏感信息，保留基本备注
  const sanitized = String(note)
    .replace(/[<>"']/g, '')
    .replace(/\b(?:password|token|key|secret|auth)\b/gi, '[REDACTED]')
    .substring(0, 200);

  return sanitized.trim() || undefined;
}

/**
 * 📋 订单号脱敏
 */
function sanitizeOrderNumber(orderNumber: any): string | undefined {
  if (!orderNumber) {
    return undefined;
  }

  return String(orderNumber).replace(/[^A-Z0-9\-]/gi, '').substring(0, 50);
}

/**
 * 🏷️ 标签脱敏
 */
function sanitizeTags(tags: any[]): string[] | undefined {
  if (!Array.isArray(tags) || tags.length === 0) {
    return undefined;
  }

  const sanitizedTags = tags
    .map(tag => String(tag).replace(/[^\w\-\s]/g, '').trim())
    .filter(tag => tag.length > 0 && tag.length <= 30)
    .slice(0, 10); // 最多10个标签

  return sanitizedTags.length > 0 ? sanitizedTags : undefined;
}

/**
 * ✅ 验证脱敏数据完整性
 */
function validateSanitizedData(data: SanitizedOrderData): void {
  // 验证必需字段
  if (!data.email) {
    throw new Error('脱敏后邮箱地址缺失');
  }

  if (!data.line_items || data.line_items.length === 0) {
    throw new Error('脱敏后产品信息缺失');
  }

  if (!data.total_price || Number.parseFloat(data.total_price) < 0) {
    throw new Error('脱敏后价格信息无效');
  }

  // 验证没有敏感数据泄露
  const dataString = JSON.stringify(data).toLowerCase();
  DATA_POLICY.forbidden.forEach((forbiddenField) => {
    if (dataString.includes(forbiddenField.toLowerCase())) {
      throw new Error(`检测到敏感数据泄露: ${forbiddenField}`);
    }
  });
}

/**
 * 🔍 检查数据是否包含敏感信息
 */
export function containsSensitiveData(data: any): {
  hasSensitiveData: boolean;
  sensitiveFields: string[];
} {
  const sensitiveFields: string[] = [];
  const dataString = JSON.stringify(data).toLowerCase();

  DATA_POLICY.forbidden.forEach((field) => {
    if (dataString.includes(field.toLowerCase())) {
      sensitiveFields.push(field);
    }
  });

  return {
    hasSensitiveData: sensitiveFields.length > 0,
    sensitiveFields,
  };
}

/**
 * 📊 获取数据脱敏报告
 */
export function getDataSanitizationReport(originalData: any, sanitizedData: SanitizedOrderData): {
  originalFields: number;
  sanitizedFields: number;
  removedFields: string[];
  processedFields: string[];
} {
  const originalFields = Object.keys(originalData).length;
  const sanitizedFields = Object.keys(sanitizedData).filter(key => sanitizedData[key as keyof SanitizedOrderData] !== undefined).length;

  const originalKeys = new Set(Object.keys(originalData));
  const sanitizedKeys = new Set(Object.keys(sanitizedData));

  const removedFields = Array.from(originalKeys).filter(key => !sanitizedKeys.has(key));
  const processedFields = Array.from(sanitizedKeys);

  return {
    originalFields,
    sanitizedFields,
    removedFields,
    processedFields,
  };
}
