/**
 * Main App Shopify Integration Unified Export File
 * Provides complete integration solutions
 */

export { loadConfigFromEnv, validateConfig } from '../config';
// Import ShopifyConfig from config instead
export type { ShopifyConfig } from '../config';
export { ShopifyClient } from '../core/client';

export { ShopifyErrorHandler } from '../core/error-handler';

// Re-export core modules
export { ShopifyIntegration } from '../core/integration';

export { createShopifyApiRoute, createShopifyHandler } from '../next/handler';

export { OrderService } from '../services/orders';
export { ProductService } from '../services/products';
export type {
  HealthCheckResult,
  MetricsSummary,
  OrderSyncResult,
  ProductSyncResult,
  ShopifyOrder,
  ShopifyProduct,
} from '../types';
export { WebhookRouter } from '../webhooks/router';
export { createMainAppIntegration } from './api-integration';
export type {
  ApiIntegrationConfig,
} from './api-integration';
export { DatabaseIntegrationService } from './database-integration';
export type {
  DatabaseSyncRecord,
  RolittAddress,
  RolittOrder,
  RolittOrderItem,
  RolittProduct,
  RolittProductVariant,
} from './database-integration';

export { PaymentIntegrationService } from './payment-integration';

export type {
  PaymentIntegrationConfig,
  RolittPaymentEvent,
  SyncQueueItem,
} from './payment-integration';
