/**
 * Shopify 配置管理
 */

import { z } from 'zod';

// 配置模式定义
export const ShopifyConfigSchema = z.object({
  // 基础配置
  storeDomain: z.string().min(1),
  adminAccessToken: z.string().min(1), // 放宽验证，不强制要求 shpat_ 前缀
  apiVersion: z.string().default('2025-01'),

  // 功能开关
  features: z.object({
    enabled: z.boolean().default(true),
    productSync: z.boolean().default(true),
    orderSync: z.boolean().default(true),
    inventorySync: z.boolean().default(true),
    customerSync: z.boolean().default(false),
    webhooks: z.boolean().default(true),
  }).default({}),

  // 高级配置
  rateLimitStrategy: z.enum(['conservative', 'balanced', 'aggressive']).default('balanced'),
  retryAttempts: z.number().int().min(0).max(10).default(3),
  timeoutMs: z.number().int().min(1000).default(10000),
  batchSize: z.number().int().min(1).max(250).default(50),
  syncInterval: z.number().int().min(60000).default(300000), // 最小1分钟

  // Webhook 配置
  webhook: z.object({
    secret: z.string().optional(),
    endpoint: z.string().default('/api/webhooks/shopify'),
  }).optional(),

  // 日志配置
  logging: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    enabled: z.boolean().default(true),
  }).default({}),
});

export type ShopifyConfig = z.infer<typeof ShopifyConfigSchema>;

/**
 * 验证配置
 */
export function validateConfig(config: unknown, options?: {
  strictTokenValidation?: boolean;
  strictDomainValidation?: boolean;
  strictWebhookValidation?: boolean;
}): ShopifyConfig {
  const opts = {
    strictTokenValidation: false,
    strictDomainValidation: false,
    strictWebhookValidation: false,
    ...options,
  };

  // 基础验证
  const result = ShopifyConfigSchema.parse(config);

  // 严格验证选项
  if (opts.strictTokenValidation && !result.adminAccessToken.startsWith('shpat_')) {
    throw new Error('Invalid admin access token format. Must start with "shpat_"');
  }

  if (opts.strictDomainValidation) {
    const domainRegex = /^[a-z0-9][a-z0-9\-_]*[a-z0-9]$/;
    if (!domainRegex.test(result.storeDomain)) {
      throw new Error('Invalid store domain format. Must contain only lowercase letters, numbers, hyphens, and underscores');
    }
  }

  if (opts.strictWebhookValidation && result.webhook?.endpoint) {
    const isValidEndpoint = result.webhook.endpoint.startsWith('/')
      || result.webhook.endpoint.startsWith('http://')
      || result.webhook.endpoint.startsWith('https://');
    if (!isValidEndpoint) {
      throw new Error('Invalid webhook endpoint. Must be a valid path or URL');
    }
  }

  return result;
}

/**
 * 从环境变量加载配置
 */
export function loadConfigFromEnv(): Partial<ShopifyConfig> {
  return {
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN,
    adminAccessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
    apiVersion: process.env.SHOPIFY_API_VERSION,
    features: {
      enabled: process.env.SHOPIFY_INTEGRATION_ENABLED === 'true',
      productSync: process.env.SHOPIFY_PRODUCT_SYNC !== 'false',
      orderSync: process.env.SHOPIFY_ORDER_SYNC !== 'false',
      inventorySync: process.env.SHOPIFY_INVENTORY_SYNC !== 'false',
      customerSync: process.env.SHOPIFY_CUSTOMER_SYNC === 'true',
      webhooks: process.env.SHOPIFY_WEBHOOKS !== 'false',
    },
    rateLimitStrategy: process.env.SHOPIFY_RATE_LIMIT_STRATEGY as any,
    retryAttempts: process.env.SHOPIFY_RETRY_ATTEMPTS ? Number.parseInt(process.env.SHOPIFY_RETRY_ATTEMPTS) : undefined,
    timeoutMs: process.env.SHOPIFY_TIMEOUT_MS ? Number.parseInt(process.env.SHOPIFY_TIMEOUT_MS) : undefined,
    batchSize: process.env.SHOPIFY_BATCH_SIZE ? Number.parseInt(process.env.SHOPIFY_BATCH_SIZE) : undefined,
    syncInterval: process.env.SHOPIFY_SYNC_INTERVAL ? Number.parseInt(process.env.SHOPIFY_SYNC_INTERVAL) : undefined,
    webhook: {
      secret: process.env.SHOPIFY_WEBHOOK_SECRET,
      endpoint: process.env.SHOPIFY_WEBHOOK_ENDPOINT || '/api/webhooks/shopify',
    },
    logging: {
      level: process.env.SHOPIFY_LOG_LEVEL as any,
      enabled: process.env.SHOPIFY_LOGGING !== 'false',
    },
  };
}

/**
 * 默认配置
 */
export const defaultConfig: ShopifyConfig = {
  storeDomain: '',
  adminAccessToken: '',
  apiVersion: '2025-01',
  features: {
    enabled: true,
    productSync: true,
    orderSync: true,
    inventorySync: true,
    customerSync: false,
    webhooks: true,
  },
  rateLimitStrategy: 'balanced',
  retryAttempts: 3,
  timeoutMs: 10000,
  batchSize: 50,
  syncInterval: 300000,
  webhook: {
    endpoint: '/api/webhooks/shopify',
  },
  logging: {
    level: 'info',
    enabled: true,
  },
};

/**
 * 创建测试配置
 */
export function createTestConfig(overrides: Partial<ShopifyConfig> = {}): ShopifyConfig {
  return {
    ...defaultConfig,
    storeDomain: 'test-store',
    adminAccessToken: 'test_token',
    ...overrides,
  };
}
