/**
 * 产品同步服务
 * 提供完整的 Shopify 产品管理功能
 */

import type { ShopifyClient } from '../core/client';
import type { ProductSyncResult, ShopifyProduct, ShopifyProductVariant } from '../types';
import { ShopifyErrorHandler } from '../core/error-handler';

export type RolittProduct = {
  id: string;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  category?: string;
  images?: string[];
  variants?: Array<{
    id?: string;
    title: string;
    price: number;
    sku?: string;
    color?: string;
    size?: string;
    weight?: number;
    inventory?: number;
  }>;
  status: 'active' | 'draft' | 'archived';
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  requiresShipping?: boolean;
  trackInventory?: boolean;
};

export class ProductService {
  private client: ShopifyClient;

  constructor(client: ShopifyClient) {
    this.client = client;
  }

  /**
   * 同步单个产品到 Shopify
   */
  async syncProduct(productData: RolittProduct): Promise<ProductSyncResult> {
    return ShopifyErrorHandler.createRetryableApiCall(
      async () => {
        const shopifyProduct = this.transformToShopifyProduct(productData);

        // 检查产品是否已存在
        const existingProduct = await this.findProductBySku(productData.sku || productData.id);

        let response;
        if (existingProduct) {
          // 更新现有产品
          response = await this.client.request('PUT', `/admin/api/2025-01/products/${existingProduct.id}.json`, {
            product: { ...shopifyProduct, id: existingProduct.id },
          });
          ShopifyErrorHandler.logInfo(`Updated existing product: ${productData.name}`, { productId: existingProduct.id });
        } else {
          // 创建新产品
          response = await this.client.request('POST', '/admin/api/2025-01/products.json', {
            product: shopifyProduct,
          });
          ShopifyErrorHandler.logInfo(`Created new product: ${productData.name}`, { productId: response.product.id });
        }

        return {
          success: true,
          syncedCount: 1,
          failedCount: 0,
          errors: [],
          shopifyProductIds: [response.product.id],
        };
      },
      'ProductSync',
      { productId: productData.id, productName: productData.name },
    ).catch((error) => {
      return {
        success: false,
        syncedCount: 0,
        failedCount: 1,
        errors: [error.message || 'Product sync failed'],
        shopifyProductIds: [],
      };
    });
  }

  /**
   * 批量同步产品
   */
  async syncProducts(products: RolittProduct[]): Promise<ProductSyncResult> {
    const results: ProductSyncResult[] = [];

    // 分批处理，避免 API 速率限制
    const batchSize = 5;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      const batchPromises = batch.map(product => this.syncProduct(product));
      const batchResults = await Promise.allSettled(batchPromises);

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            syncedCount: 0,
            failedCount: 1,
            errors: [`Batch sync failed: ${result.reason.message}`],
            shopifyProductIds: [],
          });
        }
      }

      // 在批次之间添加延迟，避免速率限制
      if (i + batchSize < products.length) {
        await this.delay(1000);
      }
    }

    // 汇总结果
    return this.aggregateResults(results);
  }

  /**
   * 同步所有产品（从数据源获取）
   */
  async syncAllProducts(dataSource?: () => Promise<RolittProduct[]>): Promise<ProductSyncResult> {
    try {
      let products: RolittProduct[];

      if (dataSource) {
        products = await dataSource();
        ShopifyErrorHandler.logInfo(`Fetched ${products.length} products from data source`);
      } else {
        // 如果没有提供数据源，获取现有的 Shopify 产品进行处理
        const shopifyProducts = await this.listProducts();
        products = shopifyProducts.map(sp => this.transformFromShopifyProduct(sp));
        ShopifyErrorHandler.logInfo(`Fetched ${products.length} products from Shopify`);
      }

      return await this.syncProducts(products);
    } catch (error) {
      ShopifyErrorHandler.logError('Failed to sync all products', error);
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        errors: [error instanceof Error ? error.message : 'Failed to fetch products'],
        shopifyProductIds: [],
      };
    }
  }

  /**
   * 获取所有 Shopify 产品
   */
  async listProducts(limit = 250, pageInfo?: string): Promise<ShopifyProduct[]> {
    return ShopifyErrorHandler.createRetryableApiCall(
      async () => {
        let url = `/admin/api/2025-01/products.json?limit=${limit}`;
        if (pageInfo) {
          url += `&page_info=${pageInfo}`;
        }

        const response = await this.client.request('GET', url);
        return response.products || [];
      },
      'ListProducts',
      { limit, pageInfo },
    );
  }

  /**
   * 根据 SKU 查找产品
   */
  async findProductBySku(sku: string): Promise<ShopifyProduct | null> {
    try {
      const response = await this.client.request('GET', `/admin/api/2025-01/products.json?fields=id,title,variants&limit=250`);
      const products = response.products || [];

      for (const product of products) {
        if (product.variants && Array.isArray(product.variants)) {
          const variant = product.variants.find((v: any) => v.sku === sku);
          if (variant) {
            return product;
          }
        }
      }

      return null;
    } catch (error) {
      ShopifyErrorHandler.logWarning(`Failed to find product by SKU: ${sku}`, error);
      return null;
    }
  }

  /**
   * 删除产品
   */
  async deleteProduct(productId: string): Promise<boolean> {
    return ShopifyErrorHandler.createRetryableApiCall(
      async () => {
        await this.client.request('DELETE', `/admin/api/2025-01/products/${productId}.json`);
        ShopifyErrorHandler.logInfo(`Deleted product: ${productId}`);
        return true;
      },
      'DeleteProduct',
      { productId },
    ).catch((error) => {
      ShopifyErrorHandler.logError(`Failed to delete product: ${productId}`, error);
      return false;
    });
  }

  /**
   * 更新产品库存
   */
  async updateInventory(variantId: string, quantity: number, locationId?: string): Promise<boolean> {
    return ShopifyErrorHandler.createRetryableApiCall(
      async () => {
        const inventoryData: any = {
          inventory_item_id: variantId,
          available: quantity,
        };

        if (locationId) {
          inventoryData.location_id = locationId;
        }

        await this.client.request('POST', '/admin/api/2025-01/inventory_levels/set.json', inventoryData);
        ShopifyErrorHandler.logInfo(`Updated inventory for variant ${variantId}: ${quantity}`);
        return true;
      },
      'UpdateInventory',
      { variantId, quantity, locationId },
    ).catch((error) => {
      ShopifyErrorHandler.logError(`Failed to update inventory for variant: ${variantId}`, error);
      return false;
    });
  }

  /**
   * 将 Rolitt 产品转换为 Shopify 产品格式
   */
  private transformToShopifyProduct(product: RolittProduct): ShopifyProduct {
    const shopifyProduct: ShopifyProduct = {
      title: product.name,
      body_html: product.description || '',
      vendor: 'Rolitt',
      product_type: product.category || 'AI Companion',
      handle: this.generateHandle(product.name),
      status: product.status,
      tags: this.generateTags(product),
      variants: this.transformVariants(product),
    };

    // 添加 SEO 元数据
    if (product.seoTitle || product.seoDescription) {
      shopifyProduct.metafields = [
        ...(product.seoTitle
          ? [{
              namespace: 'seo',
              key: 'title',
              value: product.seoTitle,
              type: 'single_line_text_field',
            }]
          : []),
        ...(product.seoDescription
          ? [{
              namespace: 'seo',
              key: 'description',
              value: product.seoDescription,
              type: 'multi_line_text_field',
            }]
          : []),
      ];
    }

    // 添加图片
    if (product.images && product.images.length > 0) {
      shopifyProduct.images = product.images.map((imageUrl, index) => ({
        src: imageUrl,
        position: index + 1,
        alt: `${product.name} - Image ${index + 1}`,
      }));
    }

    return shopifyProduct;
  }

  /**
   * 将 Shopify 产品转换为 Rolitt 产品格式
   */
  private transformFromShopifyProduct(shopifyProduct: ShopifyProduct): RolittProduct {
    return {
      id: shopifyProduct.id || '',
      name: shopifyProduct.title,
      description: shopifyProduct.body_html,
      price: shopifyProduct.variants?.[0]?.price ? Number.parseFloat(shopifyProduct.variants[0].price) : 0,
      sku: shopifyProduct.variants?.[0]?.sku,
      category: shopifyProduct.product_type,
      images: shopifyProduct.images?.map(img => img.src || '') || [],
      variants: shopifyProduct.variants?.map(variant => ({
        id: variant.id,
        title: variant.title,
        price: Number.parseFloat(variant.price),
        sku: variant.sku,
        inventory: variant.inventory_quantity,
        weight: variant.grams,
      })) || [],
      status: shopifyProduct.status,
      tags: shopifyProduct.tags?.split(', ') || [],
      requiresShipping: shopifyProduct.variants?.[0]?.requires_shipping !== false,
      trackInventory: shopifyProduct.variants?.[0]?.inventory_management === 'shopify',
    };
  }

  /**
   * 转换产品变体
   */
  private transformVariants(product: RolittProduct): ShopifyProductVariant[] {
    if (product.variants && product.variants.length > 0) {
      return product.variants.map(variant => ({
        title: variant.title,
        price: variant.price.toFixed(2),
        sku: variant.sku || `${product.sku || product.id}-${variant.title.toLowerCase().replace(/\s+/g, '-')}`,
        inventory_policy: 'deny',
        fulfillment_service: 'manual',
        inventory_management: product.trackInventory ? 'shopify' : null,
        requires_shipping: product.requiresShipping !== false,
        taxable: true,
        weight: variant.weight,
        weight_unit: 'g',
        inventory_quantity: variant.inventory || 0,
      }));
    }

    // Create default variant if no variants exist
    return [{
      title: 'Default Title',
      price: product.price.toFixed(2),
      sku: product.sku || product.id,
      inventory_policy: 'deny',
      fulfillment_service: 'manual',
      inventory_management: product.trackInventory ? 'shopify' : null,
      requires_shipping: product.requiresShipping !== false,
      taxable: true,
      inventory_quantity: 0,
      weight_unit: 'kg',
    }];
  }

  /**
   * 生成产品 handle（URL 友好的标识符）
   */
  private generateHandle(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * 生成产品标签
   */
  private generateTags(product: RolittProduct): string {
    const tags = ['rolitt', 'ai-companion'];

    if (product.category) {
      tags.push(product.category.toLowerCase().replace(/\s+/g, '-'));
    }

    if (product.tags) {
      tags.push(...product.tags);
    }

    return tags.join(', ');
  }

  /**
   * 聚合多个同步结果
   */
  private aggregateResults(results: ProductSyncResult[]): ProductSyncResult {
    const totalSyncedCount = results.reduce((sum, result) => sum + result.syncedCount, 0);
    const totalFailedCount = results.reduce((sum, result) => sum + result.failedCount, 0);
    const allErrors = results.flatMap(result => result.errors);
    const allShopifyIds = results.flatMap(result => result.shopifyProductIds);

    return {
      success: totalFailedCount === 0,
      syncedCount: totalSyncedCount,
      failedCount: totalFailedCount,
      errors: allErrors,
      shopifyProductIds: allShopifyIds,
    };
  }

  /**
   * 延迟执行
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
