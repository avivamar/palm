/**
 * 统一的 Shopify 客户端实现
 * 整合 ShopifyClient 和 ShopifyAdminClient 的功能
 */

import type { ShopifyConfig } from '../config';
import { loadConfigFromEnv, validateConfig } from '../config';
import { ShopifyErrorHandler } from './error-handler';
import { shopifyMetrics } from '../monitoring/metrics';

export type ShopifyApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  rateLimitInfo?: {
    remaining: number;
    resetTime: Date;
  };
};

export class UnifiedShopifyClient {
  private static instance: UnifiedShopifyClient;
  private config: ShopifyConfig;
  private isInitialized = false;

  private constructor(config?: Partial<ShopifyConfig>) {
    const envConfig = loadConfigFromEnv();
    this.config = validateConfig({ ...envConfig, ...config });
    this.initialize();
  }

  /**
   * 获取客户端实例（单例模式）
   */
  public static getInstance(config?: Partial<ShopifyConfig>): UnifiedShopifyClient {
    if (!UnifiedShopifyClient.instance) {
      UnifiedShopifyClient.instance = new UnifiedShopifyClient(config);
    }
    return UnifiedShopifyClient.instance;
  }

  /**
   * 初始化客户端
   */
  private initialize(): void {
    try {
      if (!this.config.features.enabled) {
        console.log('[ShopifyClient] ⚠️ Shopify 集成已禁用');
        return;
      }

      // 验证必要配置
      if (!this.config.storeDomain || !this.config.adminAccessToken) {
        throw new Error('Shopify 配置不完整：缺少 storeDomain 或 adminAccessToken');
      }

      this.isInitialized = true;
      console.log('[ShopifyClient] ✅ 统一 Shopify 客户端初始化成功');
    } catch (error) {
      console.error('[ShopifyClient] ❌ 客户端初始化失败:', error);
      this.isInitialized = false;
    }
  }

  /**
   * 通用 API 请求方法
   */
  public async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    data?: any,
  ): Promise<ShopifyApiResponse<T>> {
    const startTime = performance.now();
    let success = false;

    try {
      // 检查客户端状态
      if (!this.isInitialized) {
        throw new Error('Shopify 客户端未初始化');
      }

      if (!this.config.features.enabled) {
        throw new Error('Shopify 集成已禁用');
      }

      // 构建请求
      const url = `https://${this.config.storeDomain}.myshopify.com${path}`;
      const headers = {
        'X-Shopify-Access-Token': this.config.adminAccessToken,
        'Content-Type': 'application/json',
        'User-Agent': 'Rolitt-Shopify-Integration/1.0',
      };

      console.log(`[ShopifyClient] ${method} ${path}`);

      // 使用 AbortController 实现超时功能
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);
      
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId); // 清除超时计时器
      
      const responseTime = performance.now() - startTime;

      // 处理响应
      if (response.ok) {
        success = true;
        const result = await response.json();
        
        // 记录成功指标
        shopifyMetrics.recordApiCall(true, responseTime);
        
        console.log(`[ShopifyClient] ✅ ${method} ${path} - Success (${responseTime.toFixed(0)}ms)`);

        return {
          success: true,
          data: result,
          rateLimitInfo: this.extractRateLimitInfo(response),
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = this.formatErrorMessage(errorData, response);
        
        // 记录失败指标
        shopifyMetrics.recordApiCall(false, responseTime);
        
        console.error(`[ShopifyClient] ❌ ${method} ${path} - Error ${response.status}: ${errorMessage} (${responseTime.toFixed(0)}ms)`);

        return {
          success: false,
          error: errorMessage,
          rateLimitInfo: this.extractRateLimitInfo(response),
        };
      }
    } catch (error) {
      const responseTime = performance.now() - startTime;
      
      if (!success) {
        shopifyMetrics.recordApiCall(false, responseTime);
      }

      // 处理超时错误
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.error(`[ShopifyClient] ⏱️ Request timeout: ${method} ${path} (${this.config.timeoutMs}ms)`);
        return {
          success: false,
          error: `Request timeout after ${this.config.timeoutMs}ms`,
        };
      }

      console.error(`[ShopifyClient] 🛑 Request failed: ${method} ${path} (${responseTime.toFixed(0)}ms)`, error);

      return ShopifyErrorHandler.handleApiError(error, `${method} ${path}`);
    }
  }

  /**
   * 健康检查
   */
  public async healthCheck(): Promise<ShopifyApiResponse> {
    return this.request('GET', '/admin/api/2025-01/shop.json');
  }

  /**
   * 订单相关 API
   */
  public get orders() {
    return {
      list: (params?: any) => this.request('GET', '/admin/api/2025-01/orders.json', params),
      get: (id: string) => this.request('GET', `/admin/api/2025-01/orders/${id}.json`),
      create: (order: any) => this.request('POST', '/admin/api/2025-01/orders.json', { order }),
      update: (id: string, order: any) => this.request('PUT', `/admin/api/2025-01/orders/${id}.json`, { order }),
      cancel: (id: string) => this.request('POST', `/admin/api/2025-01/orders/${id}/cancel.json`),
    };
  }

  /**
   * 产品相关 API
   */
  public get products() {
    return {
      list: (params?: any) => this.request('GET', '/admin/api/2025-01/products.json', params),
      get: (id: string) => this.request('GET', `/admin/api/2025-01/products/${id}.json`),
      create: (product: any) => this.request('POST', '/admin/api/2025-01/products.json', { product }),
      update: (id: string, product: any) => this.request('PUT', `/admin/api/2025-01/products/${id}.json`, { product }),
      delete: (id: string) => this.request('DELETE', `/admin/api/2025-01/products/${id}.json`),
    };
  }

  /**
   * 库存相关 API
   */
  public get inventory() {
    return {
      levels: (params?: any) => this.request('GET', '/admin/api/2025-01/inventory_levels.json', params),
      set: (locationId: string, inventoryItemId: string, available: number) => 
        this.request('POST', '/admin/api/2025-01/inventory_levels/set.json', {
          location_id: locationId,
          inventory_item_id: inventoryItemId,
          available,
        }),
      adjust: (locationId: string, inventoryItemId: string, quantity: number) =>
        this.request('POST', '/admin/api/2025-01/inventory_levels/adjust.json', {
          location_id: locationId,
          inventory_item_id: inventoryItemId,
          available_adjustment: quantity,
        }),
    };
  }

  /**
   * 客户相关 API
   */
  public get customers() {
    return {
      list: (params?: any) => this.request('GET', '/admin/api/2025-01/customers.json', params),
      get: (id: string) => this.request('GET', `/admin/api/2025-01/customers/${id}.json`),
      create: (customer: any) => this.request('POST', '/admin/api/2025-01/customers.json', { customer }),
      update: (id: string, customer: any) => this.request('PUT', `/admin/api/2025-01/customers/${id}.json`, { customer }),
      search: (query: string) => this.request('GET', `/admin/api/2025-01/customers/search.json?query=${encodeURIComponent(query)}`),
    };
  }

  /**
   * Webhook 相关 API
   */
  public get webhooks() {
    return {
      list: () => this.request('GET', '/admin/api/2025-01/webhooks.json'),
      create: (webhook: any) => this.request('POST', '/admin/api/2025-01/webhooks.json', { webhook }),
      update: (id: string, webhook: any) => this.request('PUT', `/admin/api/2025-01/webhooks/${id}.json`, { webhook }),
      delete: (id: string) => this.request('DELETE', `/admin/api/2025-01/webhooks/${id}.json`),
    };
  }

  /**
   * 商店信息 API
   */
  public get shop() {
    return {
      get: () => this.request('GET', '/admin/api/2025-01/shop.json'),
    };
  }

  /**
   * 位置相关 API
   */
  public get locations() {
    return {
      list: () => this.request('GET', '/admin/api/2025-01/locations.json'),
      get: (id: string) => this.request('GET', `/admin/api/2025-01/locations/${id}.json`),
    };
  }

  /**
   * 获取配置信息
   */
  public getConfig(): ShopifyConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  public updateConfig(newConfig: Partial<ShopifyConfig>): void {
    this.config = validateConfig({ ...this.config, ...newConfig });
    this.initialize();
  }

  /**
   * 重新初始化
   */
  public reinitialize(): void {
    const envConfig = loadConfigFromEnv();
    this.config = validateConfig({ ...this.config, ...envConfig });
    this.initialize();
  }

  /**
   * 提取速率限制信息
   */
  private extractRateLimitInfo(response: Response): { remaining: number; resetTime: Date } | undefined {
    const remaining = response.headers.get('X-Shopify-Shop-Api-Call-Limit');
    const resetTime = response.headers.get('Retry-After');

    if (remaining) {
      const parts = remaining.split('/').map(Number);
      if (parts.length === 2) {
        const used = parts[0];
        const total = parts[1];
        // 确保 used 和 total 是有效的数字
        if (typeof used === 'number' && !Number.isNaN(used) && 
            typeof total === 'number' && !Number.isNaN(total)) {
          return {
            remaining: total - used,
            resetTime: resetTime ? new Date(Date.now() + Number(resetTime) * 1000) : new Date(),
          };
        }
      }
    }

    return undefined;
  }

  /**
   * 格式化错误消息
   */
  private formatErrorMessage(errorData: any, response: Response): string {
    if (errorData.errors) {
      if (typeof errorData.errors === 'string') {
        return errorData.errors;
      }
      if (Array.isArray(errorData.errors)) {
        return errorData.errors.join(', ');
      }
      if (typeof errorData.errors === 'object') {
        return Object.entries(errorData.errors)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
      }
    }

    return `HTTP ${response.status}: ${response.statusText}`;
  }
}

// 导出便捷方法
export const createShopifyClient = (config?: Partial<ShopifyConfig>) => {
  return UnifiedShopifyClient.getInstance(config);
};

// 向后兼容的别名
export const ShopifyClient = UnifiedShopifyClient;
export const ShopifyAdminClient = UnifiedShopifyClient;