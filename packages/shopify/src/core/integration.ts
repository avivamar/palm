/**
 * Shopify 集成核心类
 * 提供所有 Shopify 功能的统一入口
 */

import type { ShopifyConfig } from '../config';
import type { HealthCheckResult } from '../types';
import { loadConfigFromEnv, validateConfig } from '../config';
import { HealthCheck } from '../monitoring/health-check';
import { Metrics } from '../monitoring/metrics';
import { CustomerService } from '../services/customers';
import { InventoryService } from '../services/inventory';
import { OrderService } from '../services/orders';
import { ProductService } from '../services/products';
import { ShopifyClient } from './client';

export class ShopifyIntegration {
  private config: ShopifyConfig;
  private client: ShopifyClient;
  private productService?: ProductService;
  private orderService?: OrderService;
  private inventoryService?: InventoryService;
  private customerService?: CustomerService;
  private healthCheck?: HealthCheck;
  private metrics?: Metrics;

  constructor(config?: Partial<ShopifyConfig>) {
    // 合并环境变量配置和传入的配置
    const envConfig = loadConfigFromEnv();
    this.config = validateConfig({ ...envConfig, ...config });

    // 初始化客户端
    this.client = new ShopifyClient(this.config);
  }

  /**
   * 获取产品服务
   */
  getProductService(): ProductService {
    if (!this.productService) {
      this.productService = new ProductService(this.client);
    }
    return this.productService;
  }

  /**
   * 获取订单服务
   */
  getOrderService(): OrderService {
    if (!this.orderService) {
      this.orderService = new OrderService(this.client);
    }
    return this.orderService;
  }

  /**
   * 获取库存服务
   */
  getInventoryService(): InventoryService {
    if (!this.inventoryService) {
      this.inventoryService = new InventoryService(this.client, this.config);
    }
    return this.inventoryService;
  }

  /**
   * 获取客户服务
   */
  getCustomerService(): CustomerService {
    if (!this.customerService) {
      this.customerService = new CustomerService(this.client, this.config);
    }
    return this.customerService;
  }

  /**
   * 获取健康检查
   */
  getHealthCheck(): HealthCheck {
    if (!this.healthCheck) {
      this.healthCheck = new HealthCheck(this.client);
    }
    return this.healthCheck;
  }

  /**
   * 获取指标
   */
  getMetrics(): Metrics {
    if (!this.metrics) {
      this.metrics = new Metrics();
    }
    return this.metrics;
  }

  /**
   * 获取原始客户端（高级用法）
   */
  getClient(): ShopifyClient {
    return this.client;
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ShopifyConfig>): void {
    this.config = validateConfig({ ...this.config, ...config });

    // 重新初始化客户端
    this.client = new ShopifyClient(this.config);

    // 清空缓存的服务实例
    this.productService = undefined;
    this.orderService = undefined;
    this.inventoryService = undefined;
    this.customerService = undefined;
    this.healthCheck = undefined;
    this.metrics = undefined;
  }

  /**
   * 获取当前配置
   */
  getConfig(): ShopifyConfig {
    return { ...this.config };
  }

  /**
   * 执行健康检查
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const healthChecker = this.getHealthCheck();
    return await healthChecker.check();
  }

  /**
   * 获取指标数据
   */
  async getMetricsData(): Promise<{
    apiCalls: number;
    syncedProducts: number;
    syncedOrders: number;
    errors: number;
    lastSync: string;
  }> {
    const metricsService = this.getMetrics();
    return await metricsService.getSummary();
  }
}
