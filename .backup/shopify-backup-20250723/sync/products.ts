/**
 * 📦 产品信息同步服务
 * 从PostgreSQL推送产品信息到Shopify，支持批量和增量同步
 */

import { isFeatureEnabled } from '../config';
import { ShopifyAdminClient } from '../core/client';

export type ProductSyncResult = {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: string[];
  shopifyProductIds: string[];
};

export type ShopifyProduct = {
  title: string;
  body_html?: string;
  vendor: string;
  product_type: string;
  handle: string;
  status: 'active' | 'draft' | 'archived';
  tags?: string;
  variants: ShopifyVariant[];
  images?: ShopifyImage[];
  options?: ShopifyOption[];
  metafields?: ShopifyMetafield[];
};

export type ShopifyVariant = {
  title: string;
  sku?: string;
  price: string;
  compare_at_price?: string;
  inventory_quantity?: number;
  inventory_management?: 'shopify' | null;
  inventory_policy?: 'deny' | 'continue';
  fulfillment_service?: 'manual';
  requires_shipping?: boolean;
  taxable?: boolean;
  weight?: number;
  weight_unit?: 'kg' | 'g' | 'lb' | 'oz';
  option1?: string;
  option2?: string;
  option3?: string;
};

export type ShopifyImage = {
  src: string;
  alt?: string;
  position?: number;
};

export type ShopifyOption = {
  name: string;
  values: string[];
};

export type ShopifyMetafield = {
  namespace: string;
  key: string;
  value: string;
  type: string;
};

/**
 * 🔄 产品同步服务类
 */
export class ProductSyncService {
  private client: ShopifyAdminClient;

  constructor() {
    this.client = ShopifyAdminClient.getInstance();
  }

  /**
   * 🚀 同步所有产品到Shopify
   */
  public async syncAllProducts(): Promise<ProductSyncResult> {
    if (!isFeatureEnabled('PRODUCT_SYNC')) {
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        errors: ['产品同步功能已禁用'],
        shopifyProductIds: [],
      };
    }

    console.log('[ProductSync] 🚀 开始同步所有产品到Shopify...');

    try {
      // 🔍 获取本地产品数据
      const localProducts = await this.getLocalProducts();

      if (localProducts.length === 0) {
        console.log('[ProductSync] ℹ️  没有找到本地产品数据');
        return {
          success: true,
          syncedCount: 0,
          failedCount: 0,
          errors: [],
          shopifyProductIds: [],
        };
      }

      // 🔄 批量同步产品
      const result = await this.batchSyncProducts(localProducts);

      console.log(`[ProductSync] ✅ 产品同步完成: ${result.syncedCount}/${localProducts.length} 成功`);
      return result;
    } catch (error) {
      const errorMessage = `产品同步失败: ${error instanceof Error ? error.message : '未知错误'}`;
      console.error(`[ProductSync] ❌ ${errorMessage}`);

      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        errors: [errorMessage],
        shopifyProductIds: [],
      };
    }
  }

  /**
   * 📦 同步单个产品
   */
  public async syncSingleProduct(productData: any): Promise<{
    success: boolean;
    shopifyProductId?: string;
    error?: string;
  }> {
    if (!isFeatureEnabled('PRODUCT_SYNC')) {
      return {
        success: false,
        error: '产品同步功能已禁用',
      };
    }

    try {
      // 🧹 转换为Shopify产品格式
      const shopifyProduct = this.transformToShopifyProduct(productData);

      // 🚀 推送到Shopify
      const response = await this.client.products.create(shopifyProduct);

      if (response.success && response.data?.product) {
        console.log(`[ProductSync] ✅ 产品同步成功: ${shopifyProduct.title} -> ${response.data.product.id}`);
        return {
          success: true,
          shopifyProductId: response.data.product.id,
        };
      } else {
        return {
          success: false,
          error: response.error || '产品创建失败',
        };
      }
    } catch (error) {
      const errorMessage = `单个产品同步失败: ${error instanceof Error ? error.message : '未知错误'}`;
      console.error(`[ProductSync] ❌ ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * 🔍 获取本地产品数据
   */
  private async getLocalProducts(): Promise<any[]> {
    try {
      // 🎯 基于Rolitt的产品结构，构建Shopify产品
      const rolittProducts = this.buildRolittProducts();
      console.log(`[ProductSync] 📦 构建了 ${rolittProducts.length} 个Rolitt产品`);
      return rolittProducts;
    } catch (error) {
      console.error('[ProductSync] ❌ 获取本地产品失败:', error);
      return [];
    }
  }

  /**
   * 🎨 构建Rolitt产品数据
   */
  private buildRolittProducts(): any[] {
    // 🎯 基于COLOR_PRICE_MAP_JSON构建产品
    const colorPriceMapJson = process.env.COLOR_PRICE_MAP_JSON;

    if (!colorPriceMapJson) {
      console.warn('[ProductSync] ⚠️  COLOR_PRICE_MAP_JSON 未配置');
      return [];
    }

    try {
      const colorPriceMap = JSON.parse(colorPriceMapJson);

      // 🧸 Rolitt AI毛绒玩具 - 主产品
      const mainProduct = {
        id: 'rolitt-ai-plush-main',
        title: 'Rolitt AI毛绒玩具',
        description: 'AI驱动的智能毛绒伴侣，重新定义陪伴体验',
        vendor: 'Rolitt Inc.',
        productType: 'Smart Plush Toy',
        handle: 'rolitt-ai-plush',
        status: 'active',
        tags: ['AI', 'Smart Toy', 'Companion', 'Plush', 'Interactive'],
        variants: Object.entries(colorPriceMap).map(([color, priceId], index) => ({
          title: color,
          sku: `ROLITT-${color.toUpperCase().replace(/\s+/g, '-')}`,
          price: '299.00', // 基础价格
          compareAtPrice: '399.00', // 原价
          color,
          priceId,
          position: index + 1,
          inventoryQuantity: 100, // 预设库存
          requiresShipping: true,
          taxable: true,
          weight: 0.5, // 500g
          weightUnit: 'kg',
        })),
        images: [
          {
            src: 'https://cdn.rolitt.com/products/rolitt-ai-plush-main.jpg',
            alt: 'Rolitt AI毛绒玩具主图',
            position: 1,
          },
          {
            src: 'https://cdn.rolitt.com/products/rolitt-ai-plush-colors.jpg',
            alt: 'Rolitt AI毛绒玩具颜色选择',
            position: 2,
          },
        ],
        options: [
          {
            name: 'Color',
            values: Object.keys(colorPriceMap),
          },
        ],
        metafields: [
          {
            namespace: 'rolitt',
            key: 'product_type',
            value: 'ai_plush_toy',
            type: 'single_line_text_field',
          },
          {
            namespace: 'rolitt',
            key: 'ai_features',
            value: 'voice_interaction,emotion_recognition,learning_capability',
            type: 'single_line_text_field',
          },
        ],
      };

      return [mainProduct];
    } catch (error) {
      console.error('[ProductSync] ❌ 解析COLOR_PRICE_MAP_JSON失败:', error);
      return [];
    }
  }

  /**
   * 🔄 批量同步产品
   */
  private async batchSyncProducts(products: any[]): Promise<ProductSyncResult> {
    const result: ProductSyncResult = {
      success: true,
      syncedCount: 0,
      failedCount: 0,
      errors: [],
      shopifyProductIds: [],
    };

    // 🔄 逐个同步产品（避免并发限流问题）
    for (const product of products) {
      try {
        const syncResult = await this.syncSingleProduct(product);

        if (syncResult.success) {
          result.syncedCount++;
          if (syncResult.shopifyProductId) {
            result.shopifyProductIds.push(syncResult.shopifyProductId);
          }
        } else {
          result.failedCount++;
          if (syncResult.error) {
            result.errors.push(`${product.title}: ${syncResult.error}`);
          }
        }

        // 🕐 避免API限流的延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        result.failedCount++;
        result.errors.push(`${product.title}: ${error instanceof Error ? error.message : '未知错误'}`);
      }
    }

    // 📊 设置整体结果状态
    result.success = result.failedCount === 0;

    return result;
  }

  /**
   * 🔄 转换为Shopify产品格式
   */
  private transformToShopifyProduct(productData: any): ShopifyProduct {
    return {
      title: productData.title,
      body_html: this.generateProductDescription(productData),
      vendor: productData.vendor || 'Rolitt Inc.',
      product_type: productData.productType || 'Smart Toy',
      handle: productData.handle || this.generateHandle(productData.title),
      status: productData.status || 'active',
      tags: Array.isArray(productData.tags) ? productData.tags.join(', ') : productData.tags,

      // 🎨 变体信息
      variants: productData.variants.map((variant: any) => ({
        title: variant.title,
        sku: variant.sku,
        price: variant.price,
        compare_at_price: variant.compareAtPrice,
        inventory_quantity: variant.inventoryQuantity || 0,
        inventory_management: 'shopify',
        inventory_policy: 'deny',
        fulfillment_service: 'manual',
        requires_shipping: variant.requiresShipping !== false,
        taxable: variant.taxable !== false,
        weight: variant.weight,
        weight_unit: variant.weightUnit || 'kg',
        option1: variant.color || variant.title,
      })),

      // 🖼️ 图片信息
      images: productData.images || [],

      // ⚙️ 选项信息
      options: productData.options || [
        {
          name: 'Color',
          values: productData.variants.map((v: any) => v.color || v.title),
        },
      ],

      // 📝 元字段
      metafields: productData.metafields || [],
    };
  }

  /**
   * 📝 生成产品描述
   */
  private generateProductDescription(productData: any): string {
    const baseDescription = productData.description || '高品质智能产品';

    // 🎯 添加Rolitt特色描述
    const features = [
      '🤖 AI驱动的智能交互',
      '💝 情感陪伴体验',
      '🔊 语音识别与响应',
      '📱 移动App连接',
      '🎨 多种颜色选择',
      '✨ 持续学习与成长',
    ];

    return `
      <div>
        <p>${baseDescription}</p>
        <h3>产品特色：</h3>
        <ul>
          ${features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
        <p><strong>重新定义陪伴体验，开启AI时代的情感连接。</strong></p>
      </div>
    `.trim();
  }

  /**
   * 🔗 生成产品句柄
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
   * 🔍 检查产品是否已存在
   */
  public async checkProductExists(handle: string): Promise<{
    exists: boolean;
    shopifyProductId?: string;
  }> {
    try {
      const response = await this.client.products.list({ handle });

      if (response.success && response.data?.products?.length > 0) {
        return {
          exists: true,
          shopifyProductId: response.data.products[0].id,
        };
      }

      return { exists: false };
    } catch (error) {
      console.error('[ProductSync] 检查产品存在性失败:', error);
      return { exists: false };
    }
  }

  /**
   * 📊 获取同步状态
   */
  public async getSyncStatus(): Promise<{
    localProductsCount: number;
    shopifyProductsCount: number;
    lastSyncTime?: Date;
    syncHealth: 'healthy' | 'warning' | 'error';
  }> {
    try {
      // 🔍 获取本地产品数量
      const localProducts = await this.getLocalProducts();

      // 🔍 获取Shopify产品数量
      const shopifyResponse = await this.client.products.list({ limit: 1 });
      const shopifyCount = shopifyResponse.success
        ? (shopifyResponse.data?.products?.length || 0)
        : 0;

      // 📊 评估同步健康状态
      let syncHealth: 'healthy' | 'warning' | 'error' = 'healthy';
      if (localProducts.length > 0 && shopifyCount === 0) {
        syncHealth = 'warning'; // 有本地产品但Shopify没有
      } else if (!shopifyResponse.success) {
        syncHealth = 'error'; // API调用失败
      }

      return {
        localProductsCount: localProducts.length,
        shopifyProductsCount: shopifyCount,
        syncHealth,
      };
    } catch (error) {
      console.error('[ProductSync] 获取同步状态失败:', error);
      return {
        localProductsCount: 0,
        shopifyProductsCount: 0,
        syncHealth: 'error',
      };
    }
  }
}
