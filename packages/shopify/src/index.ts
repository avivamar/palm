/**
 * @rolitt/shopify - Shopify Integration Package
 *
 * 完全解耦的 Shopify 集成包，提供产品同步、订单管理、库存控制等功能
 * 以及与主应用支付系统的完整集成
 */

// Admin UI 组件导出
export { ShopifyAdmin } from './admin/ShopifyAdmin';
export { loadConfigFromEnv, validateConfig } from './config';
export type { ShopifyConfig } from './config';
export { ShopifyClient } from './core/client';
export { ShopifyErrorHandler } from './core/error-handler';

// 错误处理类型导出 (新增)
export type {
  ErrorClassification,
  ErrorContext,
  RetryConfig,
} from './core/error-handler';
// 核心导出
export { ShopifyIntegration } from './core/integration';
// 主应用集成导出 (新增)
export {
  createMainAppIntegration,
  DatabaseIntegrationService,
  PaymentIntegrationService,
} from './integration';
// 集成相关类型导出 (新增)
export type {
  ApiIntegrationConfig,
  DatabaseSyncRecord,
  PaymentIntegrationConfig,
  RolittAddress,
  RolittOrder,
  RolittOrderItem,
  RolittPaymentEvent,
  RolittProduct,
  RolittProductVariant,
  SyncQueueItem,
} from './integration';
// 监控相关导出
export { HealthCheck } from './monitoring/health-check';

export { Metrics } from './monitoring/metrics';

// Next.js 集成导出
export { createShopifyApiRoute, createShopifyHandler } from './next/handler';

export { CustomerService } from './services/customers';

export { InventoryService } from './services/inventory';

export { OrderService } from './services/orders';

// 服务导出
export { ProductService } from './services/products';

export { WebhookService } from './services/webhooks';
// 类型导出
export * from './types';

// 工具函数导出
export * from './utils';
// Webhook 相关导出
export { WebhookHandler } from './webhooks/handler';

export { WebhookRouter } from './webhooks/router';

// 版本信息
export const VERSION = '1.1.0'; // 升级版本号以反映新功能
export const API_VERSION = '2025-01';

// 集成状态常量 (新增)
export const INTEGRATION_STATUS = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  ERROR: 'error',
} as const;

// 同步状态常量 (新增)
export const SYNC_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  ABANDONED: 'abandoned',
} as const;
