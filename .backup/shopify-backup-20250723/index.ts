/**
 * 🛒 Shopify集成包统一导出
 * 以用户系统为核心，Shopify作为可解耦插件组件
 *
 * 设计原则：
 * - 完全解耦：可一键禁用，不影响核心业务
 * - 单向推送：数据只从用户系统流向Shopify
 * - 容错设计：Shopify故障不影响主业务
 * - 模块化：每个功能可独立开关
 */

// 配置管理
export { SHOPIFY_FEATURES, validateShopifyConfig } from './config';
export type { ShopifyConfig } from './config';

// 核心客户端
export { ShopifyAdminClient } from './core/client';
// 工具函数
export { sanitizeDataForShopify } from './core/data-sanitizer';

export { ShopifyErrorHandler } from './core/error-handler';
// 监控工具
export { ShopifyHealthCheck } from './monitoring/health-check';
export { ShopifyMetrics } from './monitoring/metrics';

export { InventorySyncService } from './sync/inventory';
export { OrderSyncService } from './sync/orders';

// 同步功能
export { ProductSyncService } from './sync/products';

// 测试工具
export { ShopifyIntegrationTests } from './tests/integration';

export type * from './types/channel-interface';
// 类型定义
export type * from './types/shopify-api';
export type * from './types/sync-models';

// 版本信息
export const SHOPIFY_INTEGRATION_VERSION = '1.0.0';
export const SHOPIFY_API_VERSION = '2025-01'; // 🎯 使用最新2025-01版本
