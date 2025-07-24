/**
 * 📋 订单同步服务
 * 将用户系统的订单推送到Shopify进行履约管理
 */

import type { SanitizedOrderData } from '../core/data-sanitizer';
import { eq } from 'drizzle-orm';
import { getDB } from '@/libs/DB';
import { preordersSchema } from '@/models/Schema';
import { isFeatureEnabled } from '../config';
import { ShopifyAdminClient } from '../core/client';
import { sanitizeDataForShopify } from '../core/data-sanitizer';

export type OrderSyncResult = {
  success: boolean;
  shopifyOrderId?: string;
  shopifyOrderNumber?: string;
  error?: string;
  preorderId: string;
};

export type ShopifyOrder = {
  email: string;
  financial_status: 'paid' | 'pending' | 'refunded';
  fulfillment_status?: 'fulfilled' | 'unfulfilled' | 'partial';
  line_items: ShopifyLineItem[];
  shipping_address?: ShopifyAddress;
  billing_address?: ShopifyAddress;
  customer?: ShopifyCustomer;
  note?: string;
  tags?: string;
  source_name: string;
  processing_method: 'direct';
  total_price: string;
  currency: string;
  order_status_url?: string;
  send_receipt?: boolean;
  send_fulfillment_receipt?: boolean;
};

export type ShopifyLineItem = {
  title: string;
  quantity: number;
  price: string;
  sku?: string;
  variant_title?: string;
  vendor?: string;
  product_exists?: boolean;
  requires_shipping?: boolean;
  taxable?: boolean;
  fulfillment_service?: 'manual';
};

export type ShopifyAddress = {
  first_name?: string;
  last_name?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
  phone?: string;
};

export type ShopifyCustomer = {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  accepts_marketing?: boolean;
};

/**
 * 📋 订单同步服务类
 */
export class OrderSyncService {
  private client: ShopifyAdminClient;

  constructor() {
    this.client = ShopifyAdminClient.getInstance();
  }

  /**
   * 🚀 同步单个订单到Shopify
   */
  public async syncOrderToShopify(preorderId: string): Promise<OrderSyncResult> {
    if (!isFeatureEnabled('ORDER_SYNC')) {
      return {
        success: false,
        error: '订单同步功能已禁用',
        preorderId,
      };
    }

    console.log(`[OrderSync] 🚀 开始同步订单到Shopify: ${preorderId}`);

    try {
      // 🔍 获取订单数据
      const orderData = await this.getOrderData(preorderId);
      if (!orderData) {
        return {
          success: false,
          error: '订单数据不存在',
          preorderId,
        };
      }

      // 🧹 数据脱敏处理
      const sanitizedData = sanitizeDataForShopify(orderData);

      // 🔄 转换为Shopify订单格式
      const shopifyOrder = this.transformToShopifyOrder(sanitizedData, orderData);

      // 🚀 推送到Shopify
      const response = await this.client.orders.create(shopifyOrder);

      if (response.success && response.data?.order) {
        const shopifyOrderId = response.data.order.id;
        const shopifyOrderNumber = response.data.order.order_number;

        // 📝 更新本地记录
        await this.updatePreorderWithShopifyInfo(preorderId, shopifyOrderId, shopifyOrderNumber);

        console.log(`[OrderSync] ✅ 订单同步成功: ${preorderId} -> Shopify #${shopifyOrderNumber}`);

        return {
          success: true,
          shopifyOrderId,
          shopifyOrderNumber,
          preorderId,
        };
      } else {
        return {
          success: false,
          error: response.error || '订单创建失败',
          preorderId,
        };
      }
    } catch (error) {
      // 🛡️ 错误处理：确保主系统不受影响
      const errorMessage = `订单同步失败: ${error instanceof Error ? error.message : '未知错误'}`;
      console.error(`[OrderSync] ❌ ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
        preorderId,
      };
    }
  }

  /**
   * 🔄 批量同步订单
   */
  public async batchSyncOrders(preorderIds: string[]): Promise<{
    successCount: number;
    failedCount: number;
    results: OrderSyncResult[];
  }> {
    console.log(`[OrderSync] 🔄 开始批量同步 ${preorderIds.length} 个订单`);

    const results: OrderSyncResult[] = [];
    let successCount = 0;
    let failedCount = 0;

    for (const preorderId of preorderIds) {
      try {
        const result = await this.syncOrderToShopify(preorderId);
        results.push(result);

        if (result.success) {
          successCount++;
        } else {
          failedCount++;
        }

        // 🕐 避免API限流
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        const errorResult: OrderSyncResult = {
          success: false,
          error: error instanceof Error ? error.message : '批量同步错误',
          preorderId,
        };
        results.push(errorResult);
        failedCount++;
      }
    }

    console.log(`[OrderSync] 📊 批量同步完成: ${successCount} 成功, ${failedCount} 失败`);

    return {
      successCount,
      failedCount,
      results,
    };
  }

  /**
   * 🔍 获取订单数据
   */
  private async getOrderData(preorderId: string): Promise<any | null> {
    try {
      const db = await getDB();
      const preorder = await db.query.preordersSchema.findFirst({
        where: eq(preordersSchema.id, preorderId),
      });

      if (!preorder) {
        console.warn(`[OrderSync] ⚠️  订单不存在: ${preorderId}`);
        return null;
      }

      // 🔍 只同步已完成支付的订单
      if (preorder.status !== 'completed') {
        console.warn(`[OrderSync] ⚠️  订单状态不是completed: ${preorder.status}`);
        return null;
      }

      return preorder;
    } catch (error) {
      console.error(`[OrderSync] ❌ 获取订单数据失败: ${preorderId}`, error);
      return null;
    }
  }

  /**
   * 🔄 转换为Shopify订单格式
   */
  private transformToShopifyOrder(sanitizedData: SanitizedOrderData, originalData: any): ShopifyOrder {
    // 🎯 构建基础订单信息
    const shopifyOrder: ShopifyOrder = {
      email: sanitizedData.email,
      financial_status: 'paid', // 已完成支付
      fulfillment_status: 'unfulfilled', // 待履约
      source_name: 'Rolitt Web App',
      processing_method: 'direct',
      total_price: sanitizedData.total_price,
      currency: sanitizedData.currency,

      // 📦 产品信息
      line_items: sanitizedData.line_items.map(item => ({
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        sku: item.sku,
        variant_title: item.variant_title,
        vendor: 'Rolitt Inc.',
        product_exists: false, // 手动创建的订单项
        requires_shipping: true,
        taxable: true,
        fulfillment_service: 'manual',
      })),

      // 🏠 地址信息
      shipping_address: sanitizedData.shipping_address,
      billing_address: sanitizedData.billing_address,

      // 👤 客户信息（最小化）
      customer: {
        email: sanitizedData.email,
        first_name: sanitizedData.name?.split(' ')[0],
        last_name: sanitizedData.name?.split(' ').slice(1).join(' '),
        phone: sanitizedData.phone,
        accepts_marketing: false, // 🎯 营销仍在用户系统管理
      },

      // 📝 订单备注
      note: this.buildOrderNote(sanitizedData, originalData),

      // 🏷️ 标签
      tags: this.buildOrderTags(sanitizedData, originalData),

      // 📧 通知设置
      send_receipt: false, // 🎯 邮件通知由用户系统管理
      send_fulfillment_receipt: true, // 履约通知由Shopify发送
    };

    return shopifyOrder;
  }

  /**
   * 📝 构建订单备注
   */
  private buildOrderNote(sanitizedData: SanitizedOrderData, originalData: any): string {
    const notes = [];

    // 📋 订单来源信息
    notes.push(`📱 来源: Rolitt官方网站`);
    notes.push(`🔗 原始订单号: ${sanitizedData.order_number}`);

    // 🕐 时间信息
    if (originalData.createdAt) {
      notes.push(`📅 下单时间: ${new Date(originalData.createdAt).toLocaleString('zh-CN')}`);
    }

    // 📍 地区信息
    if (originalData.locale) {
      notes.push(`🌍 语言偏好: ${originalData.locale}`);
    }

    // 📝 用户备注
    if (sanitizedData.note) {
      notes.push(`💬 客户备注: ${sanitizedData.note}`);
    }

    // ⚠️  重要提醒
    notes.push(`⚠️  重要: 此订单来自Rolitt系统，客户沟通请使用Rolitt平台`);

    return notes.join('\n');
  }

  /**
   * 🏷️ 构建订单标签
   */
  private buildOrderTags(sanitizedData: SanitizedOrderData, originalData: any): string {
    const tags = [];

    // 🎯 来源标签
    tags.push('Rolitt-System');
    tags.push('Web-Order');

    // 💰 支付标签
    tags.push('Pre-Paid');

    // 🎨 产品标签
    if (sanitizedData.line_items.length > 0) {
      const firstItem = sanitizedData.line_items[0];
      if (firstItem && firstItem.variant_title) {
        tags.push(`Color-${firstItem.variant_title.replace(/\s+/g, '-')}`);
      }
    }

    // 📍 地区标签
    if (originalData.locale) {
      tags.push(`Locale-${originalData.locale}`);
    }

    // 📱 设备标签
    tags.push('Mobile-Friendly');

    // 🎯 业务标签
    if (originalData.amount && Number.parseFloat(originalData.amount) >= 299) {
      tags.push('Premium-Order');
    }

    return tags.join(', ');
  }

  /**
   * 📝 更新本地订单的Shopify信息
   */
  private async updatePreorderWithShopifyInfo(
    preorderId: string,
    shopifyOrderId: string,
    shopifyOrderNumber: string,
  ): Promise<void> {
    try {
      const db = await getDB();
      await db.update(preordersSchema)
        .set({
          // 🔗 存储Shopify关联信息
          shopifyOrderId,
          shopifyOrderNumber,
          shopifySyncedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(preordersSchema.id, preorderId));

      console.log(`[OrderSync] 📝 已更新本地订单的Shopify信息: ${preorderId}`);
    } catch (error) {
      console.error(`[OrderSync] ❌ 更新本地订单信息失败: ${preorderId}`, error);
      // 非关键错误，不影响主流程
    }
  }

  /**
   * 🔍 检查订单是否已同步
   */
  public async isOrderSynced(preorderId: string): Promise<{
    synced: boolean;
    shopifyOrderId?: string;
    shopifyOrderNumber?: string;
  }> {
    try {
      const db = await getDB();
      const preorder = await db.query.preordersSchema.findFirst({
        where: eq(preordersSchema.id, preorderId),
      });

      if (preorder?.shopifyOrderId) {
        return {
          synced: true,
          shopifyOrderId: preorder.shopifyOrderId,
          shopifyOrderNumber: preorder.shopifyOrderNumber || undefined,
        };
      }

      return { synced: false };
    } catch (error) {
      console.error(`[OrderSync] 检查订单同步状态失败: ${preorderId}`, error);
      return { synced: false };
    }
  }

  /**
   * 🔄 同步订单状态更新
   */
  public async syncOrderStatusUpdate(preorderId: string, status: {
    fulfillmentStatus?: string;
    trackingNumber?: string;
    trackingUrl?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // 🔍 获取Shopify订单信息
      const syncStatus = await this.isOrderSynced(preorderId);
      if (!syncStatus.synced || !syncStatus.shopifyOrderId) {
        return {
          success: false,
          error: '订单尚未同步到Shopify',
        };
      }

      // 🔄 更新Shopify订单状态
      const updateData: any = {};
      if (status.fulfillmentStatus) {
        updateData.fulfillment_status = status.fulfillmentStatus;
      }

      if (Object.keys(updateData).length > 0) {
        const response = await this.client.orders.update(syncStatus.shopifyOrderId, updateData);

        if (response.success) {
          console.log(`[OrderSync] ✅ 订单状态更新成功: ${preorderId}`);
          return { success: true };
        } else {
          return {
            success: false,
            error: response.error || '状态更新失败',
          };
        }
      }

      return { success: true };
    } catch (error) {
      const errorMessage = `订单状态同步失败: ${error instanceof Error ? error.message : '未知错误'}`;
      console.error(`[OrderSync] ❌ ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * 📊 获取同步统计信息
   */
  public async getSyncStats(): Promise<{
    totalOrders: number;
    syncedOrders: number;
    pendingSync: number;
    syncRate: number;
  }> {
    try {
      const db = await getDB();

      // 📊 统计总订单数
      const totalOrders = await db.select().from(preordersSchema).where(eq(preordersSchema.status, 'completed'));

      // 📊 统计已同步订单数
      const syncedOrders = totalOrders.filter((order: any) => order.shopifyOrderId);

      const syncRate = totalOrders.length > 0
        ? (syncedOrders.length / totalOrders.length * 100)
        : 0;

      return {
        totalOrders: totalOrders.length,
        syncedOrders: syncedOrders.length,
        pendingSync: totalOrders.length - syncedOrders.length,
        syncRate: Math.round(syncRate * 100) / 100,
      };
    } catch (error) {
      console.error('[OrderSync] 获取同步统计失败:', error);
      return {
        totalOrders: 0,
        syncedOrders: 0,
        pendingSync: 0,
        syncRate: 0,
      };
    }
  }
}
