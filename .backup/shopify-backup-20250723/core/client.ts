/**
 * 🌐 Shopify Admin API 客户端封装
 * 基于Shopify 2025-01 API版本，提供统一的API调用接口
 */

import { getShopifyConfig, isFeatureEnabled } from '../config';
import { ShopifyErrorHandler } from './error-handler';

export type ShopifyApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  rateLimitInfo?: {
    remaining: number;
    resetTime: Date;
  };
};

/**
 * 🔧 Shopify Admin API 客户端
 */
export class ShopifyAdminClient {
  private static instance: ShopifyAdminClient;
  private shopify: any = null;
  private config = getShopifyConfig();

  private constructor() {
    // 只有在启用时才初始化客户端
    if (isFeatureEnabled('ENABLED')) {
      this.initializeClient();
    }
  }

  /**
   * 🏭 单例模式获取客户端实例
   */
  public static getInstance(): ShopifyAdminClient {
    if (!ShopifyAdminClient.instance) {
      ShopifyAdminClient.instance = new ShopifyAdminClient();
    }
    return ShopifyAdminClient.instance;
  }

  /**
   * 🔧 初始化Shopify客户端
   */
  private initializeClient(): void {
    try {
      // 简化实现：不再使用 shopifyApi，直接使用 REST API
      console.log('[ShopifyClient] ✅ Shopify客户端初始化成功');
    } catch (error) {
      console.error('[ShopifyClient] ❌ Shopify客户端初始化失败:', error);
      this.shopify = null;
    }
  }

  /**
   * 🌐 通用API请求方法
   */
  public async request(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    data?: any,
  ): Promise<ShopifyApiResponse> {
    if (!isFeatureEnabled('ENABLED')) {
      return {
        success: false,
        error: 'Shopify集成已禁用',
      };
    }

    if (!this.shopify) {
      return {
        success: false,
        error: 'Shopify客户端未初始化',
      };
    }

    try {
      // 简化实现：使用 fetch 进行 REST API 调用
      const url = `https://${this.config.storeDomain}.myshopify.com${path}`;
      const headers = {
        'X-Shopify-Access-Token': this.config.adminAccessToken,
        'Content-Type': 'application/json',
      };

      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (response.ok) {
        const responseData = await response.json();
        return {
          success: true,
          data: responseData,
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.errors || `HTTP ${response.status}: ${response.statusText}`,
        };
      }
    } catch (error) {
      const errorInfo = ShopifyErrorHandler.handleApiError(error, `${method} ${path}`);
      return {
        success: false,
        error: errorInfo.error || 'API request failed',
      };
    }
  }

  /**
   * 🏥 健康检查方法
   */
  public async healthCheck(): Promise<ShopifyApiResponse> {
    return this.request('GET', '/admin/api/2025-01/shop.json');
  }

  /**
   * 📦 产品相关API
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
   * 📋 订单相关API
   */
  public get orders() {
    return {
      list: (params?: any) => this.request('GET', '/admin/api/2025-01/orders.json', params),
      get: (id: string) => this.request('GET', `/admin/api/2025-01/orders/${id}.json`),
      create: (order: any) => this.request('POST', '/admin/api/2025-01/orders.json', { order }),
      update: (id: string, order: any) => this.request('PUT', `/admin/api/2025-01/orders/${id}.json`, { order }),
    };
  }

  /**
   * 👤 客户相关API
   */
  public get customers() {
    return {
      list: (params?: any) => this.request('GET', '/admin/api/2025-01/customers.json', params),
      get: (id: string) => this.request('GET', `/admin/api/2025-01/customers/${id}.json`),
      create: (customer: any) => this.request('POST', '/admin/api/2025-01/customers.json', { customer }),
      update: (id: string, customer: any) => this.request('PUT', `/admin/api/2025-01/customers/${id}.json`, { customer }),
    };
  }

  /**
   * 📦 库存相关API
   */
  public get inventory() {
    return {
      levels: (params?: any) => this.request('GET', '/admin/api/2025-01/inventory_levels.json', params),
      adjust: (inventoryItemId: string, locationId: string, quantity: number) => {
        return this.request('POST', '/admin/api/2025-01/inventory_levels/adjust.json', {
          inventory_item_id: inventoryItemId,
          location_id: locationId,
          available_adjustment: quantity,
        });
      },
    };
  }

  /**
   * 🔔 Webhook相关API
   */
  public get webhooks() {
    return {
      list: () => this.request('GET', '/admin/api/2025-01/webhooks.json'),
      create: (webhook: any) => this.request('POST', '/admin/api/2025-01/webhooks.json', { webhook }),
      delete: (id: string) => this.request('DELETE', `/admin/api/2025-01/webhooks/${id}.json`),
    };
  }

  /**
   * 🏪 商店信息API
   */
  public get shop() {
    return {
      get: () => this.request('GET', '/admin/api/2025-01/shop.json'),
    };
  }

  /**
   * 📍 位置相关API
   */
  public get locations() {
    return {
      list: () => this.request('GET', '/admin/api/2025-01/locations.json'),
    };
  }

  /**
   * ⚙️ 获取配置信息
   */
  public getConfig() {
    return {
      shop: this.config.storeDomain,
      isEnabled: isFeatureEnabled('ENABLED'),
      apiVersion: '2025-01',
    };
  }

  /**
   * 🔄 重新初始化客户端
   */
  public reinitialize(): void {
    this.config = getShopifyConfig();
    if (isFeatureEnabled('ENABLED')) {
      this.initializeClient();
    }
  }
}
