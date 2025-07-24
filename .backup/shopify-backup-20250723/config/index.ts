/**
 * 🎛️ Shopify集成配置管理
 * 基于环境变量的动态配置系统
 */

// 🔧 功能开关配置
export const SHOPIFY_FEATURES = {
  // 主开关：一键禁用整个Shopify集成
  ENABLED: process.env.SHOPIFY_INTEGRATION_ENABLED === 'true',

  // 功能模块开关
  PRODUCT_SYNC: process.env.SHOPIFY_PRODUCT_SYNC !== 'false', // 默认开启
  ORDER_SYNC: process.env.SHOPIFY_ORDER_SYNC !== 'false', // 默认开启
  INVENTORY_SYNC: process.env.SHOPIFY_INVENTORY_SYNC !== 'false', // 默认开启
  WEBHOOK_PROCESSING: process.env.SHOPIFY_WEBHOOKS !== 'false', // 默认开启

  // 高级功能开关
  CUSTOMER_SYNC: process.env.SHOPIFY_CUSTOMER_SYNC === 'true', // 默认关闭（敏感数据）
  BULK_OPERATIONS: process.env.SHOPIFY_BULK_OPERATIONS === 'true', // 默认关闭
  REAL_TIME_SYNC: process.env.SHOPIFY_REAL_TIME_SYNC !== 'false', // 默认开启

  // 调试和监控
  DEBUG_MODE: process.env.SHOPIFY_DEBUG === 'true',
  METRICS_ENABLED: process.env.SHOPIFY_METRICS !== 'false', // 默认开启
} as const;

// 🔑 Shopify API 配置
export type ShopifyConfig = {
  // 基础配置
  storeDomain: string;
  adminAccessToken: string;
  apiVersion: string;

  // Webhook配置
  webhookSecret?: string;
  webhookEndpoint?: string;

  // 高级配置
  rateLimitStrategy: 'conservative' | 'balanced' | 'aggressive';
  retryAttempts: number;
  timeoutMs: number;

  // 数据同步配置
  batchSize: number;
  syncInterval: number; // 毫秒
  maxRetries: number;
};

/**
 * 🔍 获取Shopify配置
 */
export function getShopifyConfig(): ShopifyConfig {
  // 基础配置验证
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const adminAccessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const apiVersion = process.env.SHOPIFY_API_VERSION || '2025-01';

  if (!storeDomain || !adminAccessToken) {
    throw new Error('Shopify基础配置缺失: SHOPIFY_STORE_DOMAIN 和 SHOPIFY_ADMIN_ACCESS_TOKEN 是必需的');
  }

  // 🎯 强制使用2025-01 API版本
  if (apiVersion !== '2025-01') {
    console.warn(`⚠️  建议使用Shopify API 2025-01版本，当前版本: ${apiVersion}`);
  }

  return {
    storeDomain,
    adminAccessToken,
    apiVersion,

    // Webhook配置
    webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET,
    webhookEndpoint: process.env.SHOPIFY_WEBHOOK_ENDPOINT || '/api/webhooks/shopify',

    // 性能配置
    rateLimitStrategy: (process.env.SHOPIFY_RATE_LIMIT_STRATEGY as any) || 'balanced',
    retryAttempts: Number.parseInt(process.env.SHOPIFY_RETRY_ATTEMPTS || '3'),
    timeoutMs: Number.parseInt(process.env.SHOPIFY_TIMEOUT_MS || '10000'),

    // 同步配置
    batchSize: Number.parseInt(process.env.SHOPIFY_BATCH_SIZE || '50'),
    syncInterval: Number.parseInt(process.env.SHOPIFY_SYNC_INTERVAL || '300000'), // 5分钟
    maxRetries: Number.parseInt(process.env.SHOPIFY_MAX_RETRIES || '5'),
  };
}

/**
 * ✅ 验证Shopify配置完整性
 */
export function validateShopifyConfig(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 🔧 检查是否启用
  if (!SHOPIFY_FEATURES.ENABLED) {
    return {
      valid: true,
      errors: [],
      warnings: ['Shopify集成已禁用'],
    };
  }

  try {
    const config = getShopifyConfig();

    // 基础配置检查
    if (!config.storeDomain.includes('.myshopify.com')) {
      errors.push('SHOPIFY_STORE_DOMAIN 格式不正确，应为 xxx.myshopify.com');
    }

    if (!config.adminAccessToken.startsWith('shpat_')) {
      errors.push('SHOPIFY_ADMIN_ACCESS_TOKEN 格式不正确，应以 shpat_ 开头');
    }

    // API版本检查
    if (config.apiVersion !== '2025-01') {
      warnings.push(`API版本 ${config.apiVersion} 不是推荐的 2025-01 版本`);
    }

    // Webhook配置检查
    if (SHOPIFY_FEATURES.WEBHOOK_PROCESSING && !config.webhookSecret) {
      warnings.push('建议配置 SHOPIFY_WEBHOOK_SECRET 以确保webhook安全');
    }

    // 性能配置检查
    if (config.batchSize > 250) {
      warnings.push('批处理大小超过建议值250，可能影响性能');
    }

    if (config.timeoutMs < 5000) {
      warnings.push('超时时间过短，可能导致API调用失败');
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : '配置验证失败');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * 🎯 检查特定功能是否启用
 */
export function isFeatureEnabled(feature: keyof typeof SHOPIFY_FEATURES): boolean {
  return SHOPIFY_FEATURES.ENABLED && SHOPIFY_FEATURES[feature];
}

/**
 * 📊 获取配置概览（用于调试）
 */
export function getConfigSummary() {
  const config = SHOPIFY_FEATURES.ENABLED ? getShopifyConfig() : null;

  return {
    enabled: SHOPIFY_FEATURES.ENABLED,
    features: Object.entries(SHOPIFY_FEATURES)
      .filter(([key]) => key !== 'ENABLED')
      .reduce((acc, [key, value]) => ({
        ...acc,
        [key]: SHOPIFY_FEATURES.ENABLED ? value : false,
      }), {}),
    storeDomain: config?.storeDomain ? `${config.storeDomain.split('.')[0]}.myshopify.com` : 'N/A',
    apiVersion: config?.apiVersion || 'N/A',
    webhooksEnabled: !!config?.webhookSecret,
  };
}
