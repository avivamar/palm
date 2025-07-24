/**
 * Shopify API 客户端 - 完整独立实例化
 */

import type { ShopifyConfig } from '../config';
import { loadConfigFromEnv, validateConfig } from '../config';
import { shopifyMetrics } from '../monitoring/metrics';
import { ShopifyErrorHandler } from './error-handler';

export class ShopifyClient {
  private config: ShopifyConfig;

  constructor(config?: Partial<ShopifyConfig>) {
    const envConfig = loadConfigFromEnv();
    this.config = validateConfig({ ...envConfig, ...config });
    this.initializeClient();
  }

  private initializeClient(): void {
    try {
      console.log('[ShopifyClient] ✅ Shopify 客户端初始化成功');
    } catch (error) {
      console.error('[ShopifyClient] ❌ Shopify 客户端初始化失败:', error);
    }
  }

  public async request(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, data?: any) {
    const startTime = performance.now();
    let success = false;

    try {
      const url = `https://${this.config.storeDomain}.myshopify.com${path}`;
      const headers = {
        'X-Shopify-Access-Token': this.config.adminAccessToken,
        'Content-Type': 'application/json',
      };

      console.log(`[ShopifyClient] ${method} ${url}`);

      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      const responseTime = performance.now() - startTime;

      if (response.ok) {
        success = true;
        const result = await response.json();
        console.log(`[ShopifyClient] ✅ ${method} ${path} - Success (${responseTime.toFixed(0)}ms)`);

        // 记录成功的 API 调用
        shopifyMetrics.recordApiCall(true, responseTime);

        return result;
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.errors ? JSON.stringify(errorData.errors) : response.statusText;
        console.error(`[ShopifyClient] ❌ ${method} ${path} - Error ${response.status}: ${errorMessage} (${responseTime.toFixed(0)}ms)`);

        // 记录失败的 API 调用
        shopifyMetrics.recordApiCall(false, responseTime);

        throw new Error(`HTTP ${response.status}: ${errorMessage}`);
      }
    } catch (error) {
      const responseTime = performance.now() - startTime;
      console.error(`[ShopifyClient] 🛑 Request failed: ${method} ${path} (${responseTime.toFixed(0)}ms)`, error);

      // 记录失败的 API 调用（如果还没记录）
      if (!success) {
        shopifyMetrics.recordApiCall(false, responseTime);
      }

      return ShopifyErrorHandler.handleApiError(error, `${method} ${path}`);
    }
  }

  // 订单管理 API
  public async createOrder(orderData: any) {
    return this.request('POST', '/admin/api/2025-01/orders.json', { order: orderData });
  }

  public async getOrder(orderId: string) {
    return this.request('GET', `/admin/api/2025-01/orders/${orderId}.json`);
  }

  public async updateOrder(orderId: string, orderData: any) {
    return this.request('PUT', `/admin/api/2025-01/orders/${orderId}.json`, { order: orderData });
  }

  // 产品管理 API
  public async createProduct(productData: any) {
    return this.request('POST', '/admin/api/2025-01/products.json', { product: productData });
  }

  public async getProduct(productId: string) {
    return this.request('GET', `/admin/api/2025-01/products/${productId}.json`);
  }

  public async updateProduct(productId: string, productData: any) {
    return this.request('PUT', `/admin/api/2025-01/products/${productId}.json`, { product: productData });
  }

  public async getProducts(params?: { limit?: number; since_id?: string }) {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request('GET', `/admin/api/2025-01/products.json${queryParams}`);
  }

  // 库存管理 API
  public async getInventoryLevels(inventoryItemIds: string[], locationIds?: string[]) {
    const params = new URLSearchParams();
    inventoryItemIds.forEach(id => params.append('inventory_item_ids[]', id));
    if (locationIds) {
      locationIds.forEach(id => params.append('location_ids[]', id));
    }
    return this.request('GET', `/admin/api/2025-01/inventory_levels.json?${params.toString()}`);
  }

  public async updateInventoryLevel(locationId: string, inventoryItemId: string, available: number) {
    return this.request('POST', '/admin/api/2025-01/inventory_levels/set.json', {
      location_id: locationId,
      inventory_item_id: inventoryItemId,
      available,
    });
  }

  // 健康检查 API
  public async healthCheck() {
    try {
      await this.request('GET', '/admin/api/2025-01/shop.json');
      return { status: 'healthy', apiConnection: true };
    } catch (error) {
      return { status: 'unhealthy', apiConnection: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}
