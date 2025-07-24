/**
 * 支付系统集成服务
 * 连接 Rolitt 支付系统与 Shopify 的桥梁
 */

import type { ShopifyIntegration } from '../core/integration';
import type { OrderSyncResult } from '../types';
import { ShopifyErrorHandler } from '../core/error-handler';

export type RolittPaymentEvent = {
  eventType: 'payment.succeeded' | 'payment.failed' | 'payment.pending' | 'order.created' | 'order.fulfilled';
  eventId: string;
  timestamp: string;
  data: {
    orderId: string;
    customerId?: string;
    email: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
    items: Array<{
      productId: string;
      name: string;
      quantity: number;
      price: number;
      sku?: string;
      variant?: string;
    }>;
    customer: {
      email: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
    };
    shipping?: {
      firstName: string;
      lastName: string;
      company?: string;
      address1: string;
      address2?: string;
      city: string;
      province: string;
      country: string;
      zip: string;
      phone?: string;
    };
    billing?: {
      firstName: string;
      lastName: string;
      company?: string;
      address1: string;
      address2?: string;
      city: string;
      province: string;
      country: string;
      zip: string;
    };
    metadata?: Record<string, any>;
  };
};

export type PaymentIntegrationConfig = {
  enableAutoSync: boolean;
  syncOnPaymentSuccess: boolean;
  syncOnOrderCreation: boolean;
  retryFailedSyncs: boolean;
  maxRetries: number;
  webhookEndpoints: {
    stripe: string;
    shopify: string;
  };
};

export type SyncQueueItem = {
  id: string;
  eventId: string;
  eventType: string;
  orderData: any;
  attempts: number;
  lastAttempt?: string;
  nextRetry?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'abandoned';
  error?: string;
  createdAt: string;
  updatedAt: string;
};

export class PaymentIntegrationService {
  private shopifyIntegration: ShopifyIntegration;
  private config: PaymentIntegrationConfig;
  private syncQueue: Map<string, SyncQueueItem> = new Map();

  constructor(
    shopifyIntegration: ShopifyIntegration,
    config: Partial<PaymentIntegrationConfig> = {},
  ) {
    this.shopifyIntegration = shopifyIntegration;
    this.config = {
      enableAutoSync: true,
      syncOnPaymentSuccess: true,
      syncOnOrderCreation: false,
      retryFailedSyncs: true,
      maxRetries: 3,
      webhookEndpoints: {
        stripe: '/api/webhooks/stripe',
        shopify: '/api/webhooks/shopify',
      },
      ...config,
    };
  }

  /**
   * 处理 Rolitt 支付事件
   */
  async handlePaymentEvent(event: RolittPaymentEvent): Promise<OrderSyncResult> {
    try {
      ShopifyErrorHandler.logInfo(
        `Processing payment event: ${event.eventType}`,
        { eventId: event.eventId, orderId: event.data.orderId },
      );

      // 检查是否应该同步此事件
      if (!this.shouldSyncEvent(event)) {
        return {
          success: true,
          orderId: event.data.orderId,
          error: 'Event skipped per configuration',
        };
      }

      // 检查是否已处理过此事件（幂等性）
      const existingQueueItem = this.syncQueue.get(event.eventId);
      if (existingQueueItem && existingQueueItem.status === 'completed') {
        return {
          success: true,
          orderId: event.data.orderId,
          shopifyOrderId: existingQueueItem.orderData?.shopifyOrderId,
          error: 'Event already processed',
        };
      }

      // 转换支付事件为 Shopify 订单格式
      const shopifyOrderData = this.transformPaymentEventToOrder(event);

      // 添加到同步队列
      const queueItem: SyncQueueItem = {
        id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        eventId: event.eventId,
        eventType: event.eventType,
        orderData: shopifyOrderData,
        attempts: 0,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.syncQueue.set(event.eventId, queueItem);

      // 执行同步
      return await this.executeSyncWithRetry(queueItem);
    } catch (error) {
      ShopifyErrorHandler.logError(
        `Failed to handle payment event: ${event.eventType}`,
        error,
        { eventId: event.eventId, orderId: event.data.orderId },
      );

      return {
        success: false,
        orderId: event.data.orderId,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 批量处理支付事件
   */
  async handleBatchPaymentEvents(events: RolittPaymentEvent[]): Promise<OrderSyncResult[]> {
    ShopifyErrorHandler.logInfo(
      `Processing batch of ${events.length} payment events`,
    );

    const results: OrderSyncResult[] = [];

    // 按事件类型分组并排序（先处理订单创建，再处理支付成功）
    const sortedEvents = events.sort((a, b) => {
      const priority = {
        'order.created': 1,
        'payment.succeeded': 2,
        'payment.pending': 3,
        'order.fulfilled': 4,
        'payment.failed': 5,
      };
      return (priority[a.eventType] || 99) - (priority[b.eventType] || 99);
    });

    // 分批处理以避免 API 限流
    const batchSize = 5;
    for (let i = 0; i < sortedEvents.length; i += batchSize) {
      const batch = sortedEvents.slice(i, i + batchSize);

      const batchPromises = batch.map(event => this.handlePaymentEvent(event));
      const batchResults = await Promise.allSettled(batchPromises);

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            orderId: 'unknown',
            error: `Batch processing failed: ${result.reason.message}`,
          });
        }
      }

      // 批次间延迟，避免 API 限流
      if (i + batchSize < sortedEvents.length) {
        await this.delay(1000);
      }
    }

    return results;
  }

  /**
   * 处理 Stripe Webhook 事件
   */
  async handleStripeWebhook(stripeEvent: any): Promise<OrderSyncResult> {
    try {
      ShopifyErrorHandler.logInfo(
        `Processing Stripe webhook: ${stripeEvent.type}`,
        { eventId: stripeEvent.id },
      );

      // 转换 Stripe 事件为 Rolitt 支付事件格式
      const rolittEvent = this.transformStripeEventToPaymentEvent(stripeEvent);

      if (!rolittEvent) {
        return {
          success: false,
          orderId: 'unknown',
          error: 'Unsupported Stripe event type',
        };
      }

      return await this.handlePaymentEvent(rolittEvent);
    } catch (error) {
      ShopifyErrorHandler.logError(
        `Failed to process Stripe webhook: ${stripeEvent.type}`,
        error,
        { eventId: stripeEvent.id },
      );

      return {
        success: false,
        orderId: 'unknown',
        error: error instanceof Error ? error.message : 'Stripe webhook processing failed',
      };
    }
  }

  /**
   * 获取同步队列状态
   */
  getSyncQueueStatus(): {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    abandoned: number;
  } {
    const items = Array.from(this.syncQueue.values());

    return {
      total: items.length,
      pending: items.filter(i => i.status === 'pending').length,
      processing: items.filter(i => i.status === 'processing').length,
      completed: items.filter(i => i.status === 'completed').length,
      failed: items.filter(i => i.status === 'failed').length,
      abandoned: items.filter(i => i.status === 'abandoned').length,
    };
  }

  /**
   * 重试失败的同步任务
   */
  async retryFailedSyncs(): Promise<OrderSyncResult[]> {
    const failedItems = Array.from(this.syncQueue.values())
      .filter(item => item.status === 'failed' && item.attempts < this.config.maxRetries);

    ShopifyErrorHandler.logInfo(
      `Retrying ${failedItems.length} failed sync tasks`,
    );

    const results: OrderSyncResult[] = [];

    for (const item of failedItems) {
      const result = await this.executeSyncWithRetry(item);
      results.push(result);
    }

    return results;
  }

  /**
   * 清理旧的队列项目
   */
  cleanupSyncQueue(olderThanHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    let cleanedCount = 0;

    for (const [eventId, item] of this.syncQueue.entries()) {
      const itemTime = new Date(item.createdAt);
      if (itemTime < cutoffTime && (item.status === 'completed' || item.status === 'abandoned')) {
        this.syncQueue.delete(eventId);
        cleanedCount++;
      }
    }

    ShopifyErrorHandler.logInfo(
      `Cleaned up ${cleanedCount} old sync queue items`,
    );
  }

  /**
   * 判断是否应该同步事件
   */
  private shouldSyncEvent(event: RolittPaymentEvent): boolean {
    if (!this.config.enableAutoSync) {
      return false;
    }

    switch (event.eventType) {
      case 'payment.succeeded':
        return this.config.syncOnPaymentSuccess;
      case 'order.created':
        return this.config.syncOnOrderCreation;
      case 'order.fulfilled':
        return true; // 总是同步履行事件
      case 'payment.failed':
      case 'payment.pending':
        return false; // 不同步失败或待处理的支付
      default:
        return false;
    }
  }

  /**
   * 执行带重试的同步
   */
  private async executeSyncWithRetry(queueItem: SyncQueueItem): Promise<OrderSyncResult> {
    queueItem.status = 'processing';
    queueItem.attempts++;
    queueItem.lastAttempt = new Date().toISOString();
    queueItem.updatedAt = new Date().toISOString();

    try {
      const orderService = this.shopifyIntegration.getOrderService();
      const result = await orderService.syncOrder(queueItem.orderData);

      if (result.success) {
        queueItem.status = 'completed';
        queueItem.orderData.shopifyOrderId = result.shopifyOrderId;
        queueItem.orderData.shopifyOrderNumber = result.shopifyOrderNumber;
      } else {
        throw new Error(result.error || 'Sync failed');
      }

      queueItem.updatedAt = new Date().toISOString();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      queueItem.error = errorMessage;

      if (queueItem.attempts >= this.config.maxRetries) {
        queueItem.status = 'abandoned';
        ShopifyErrorHandler.logError(
          `Sync abandoned after ${queueItem.attempts} attempts`,
          error,
          { eventId: queueItem.eventId },
        );
      } else {
        queueItem.status = 'failed';
        // 设置下次重试时间（指数退避）
        const retryDelay = Math.min(1000 * 2 ** queueItem.attempts, 30000);
        queueItem.nextRetry = new Date(Date.now() + retryDelay).toISOString();
      }

      queueItem.updatedAt = new Date().toISOString();

      return {
        success: false,
        orderId: queueItem.orderData.id,
        error: errorMessage,
      };
    }
  }

  /**
   * 转换支付事件为 Shopify 订单格式
   */
  private transformPaymentEventToOrder(event: RolittPaymentEvent): any {
    const { data } = event;

    return {
      id: data.orderId,
      email: data.email,
      total: data.amount.toString(),
      currency: data.currency,
      status: this.mapPaymentStatusToOrderStatus(data.status),
      paymentMethod: data.paymentMethod,
      source: 'rolitt-payment',

      // 客户信息
      firstName: data.customer.firstName,
      lastName: data.customer.lastName,
      phone: data.customer.phone,
      customer: data.customer,

      // 商品信息
      items: data.items.map(item => ({
        name: item.name,
        quantity: item.quantity.toString(),
        price: item.price.toString(),
        sku: item.sku,
        variant: item.variant,
        productId: item.productId,
      })),

      // 地址信息
      shipping_address: data.shipping,
      billing_address: data.billing || data.shipping,

      // 元数据
      metadata: {
        ...data.metadata,
        rolittEventId: event.eventId,
        rolittEventType: event.eventType,
        rolittTimestamp: event.timestamp,
        paymentMethod: data.paymentMethod,
      },
    };
  }

  /**
   * 转换 Stripe 事件为支付事件格式
   */
  private transformStripeEventToPaymentEvent(stripeEvent: any): RolittPaymentEvent | null {
    const eventTypeMap: Record<string, RolittPaymentEvent['eventType']> = {
      'payment_intent.succeeded': 'payment.succeeded',
      'payment_intent.payment_failed': 'payment.failed',
      'payment_intent.processing': 'payment.pending',
      'checkout.session.completed': 'order.created',
    };

    const rolittEventType = eventTypeMap[stripeEvent.type];
    if (!rolittEventType) {
      return null;
    }

    const stripeData = stripeEvent.data.object;

    // 从 Stripe 元数据中提取订单信息
    const metadata = stripeData.metadata || {};

    return {
      eventType: rolittEventType,
      eventId: `stripe_${stripeEvent.id}`,
      timestamp: new Date(stripeEvent.created * 1000).toISOString(),
      data: {
        orderId: metadata.orderId || stripeData.id,
        customerId: stripeData.customer,
        email: metadata.customerEmail || stripeData.receipt_email,
        amount: stripeData.amount / 100, // Stripe uses cents
        currency: stripeData.currency.toUpperCase(),
        paymentMethod: 'stripe',
        status: this.mapStripeStatusToPaymentStatus(stripeData.status),
        items: this.extractItemsFromStripeMetadata(metadata),
        customer: {
          email: metadata.customerEmail || stripeData.receipt_email,
          firstName: metadata.customerFirstName,
          lastName: metadata.customerLastName,
          phone: metadata.customerPhone,
        },
        shipping: this.extractShippingFromStripeData(stripeData),
        billing: this.extractBillingFromStripeData(stripeData),
        metadata: {
          stripeEventId: stripeEvent.id,
          stripePaymentIntentId: stripeData.id,
          ...metadata,
        },
      },
    };
  }

  /**
   * 映射支付状态到订单状态
   */
  private mapPaymentStatusToOrderStatus(paymentStatus: string): string {
    const statusMap: Record<string, string> = {
      pending: 'pending',
      processing: 'processing',
      completed: 'completed',
      failed: 'cancelled',
      refunded: 'refunded',
    };

    return statusMap[paymentStatus] || 'pending';
  }

  /**
   * 映射 Stripe 状态到支付状态
   */
  private mapStripeStatusToPaymentStatus(stripeStatus: string): 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' {
    const statusMap: Record<string, any> = {
      requires_payment_method: 'pending',
      requires_confirmation: 'pending',
      requires_action: 'pending',
      processing: 'processing',
      succeeded: 'completed',
      canceled: 'failed',
      requires_capture: 'completed',
    };

    return statusMap[stripeStatus] || 'pending';
  }

  /**
   * 从 Stripe 元数据提取商品信息
   */
  private extractItemsFromStripeMetadata(metadata: any): any[] {
    try {
      if (metadata.items) {
        return JSON.parse(metadata.items);
      }

      // 如果没有商品信息，创建默认商品
      return [{
        productId: 'default',
        name: 'AI Companion Product',
        quantity: 1,
        price: Number.parseFloat(metadata.amount || '0') / 100,
        sku: metadata.productSku || 'AI-COMP-DEFAULT',
      }];
    } catch {
      return [{
        productId: 'default',
        name: 'AI Companion Product',
        quantity: 1,
        price: 0,
        sku: 'AI-COMP-DEFAULT',
      }];
    }
  }

  /**
   * 从 Stripe 数据提取运送地址
   */
  private extractShippingFromStripeData(stripeData: any): any | undefined {
    const shipping = stripeData.shipping;
    if (!shipping || !shipping.address) {
      return undefined;
    }

    return {
      firstName: shipping.name?.split(' ')[0] || '',
      lastName: shipping.name?.split(' ').slice(1).join(' ') || '',
      address1: shipping.address.line1,
      address2: shipping.address.line2,
      city: shipping.address.city,
      province: shipping.address.state,
      country: shipping.address.country,
      zip: shipping.address.postal_code,
      phone: shipping.phone,
    };
  }

  /**
   * 从 Stripe 数据提取账单地址
   */
  private extractBillingFromStripeData(stripeData: any): any | undefined {
    const billing = stripeData.billing_details;
    if (!billing || !billing.address) {
      return undefined;
    }

    return {
      firstName: billing.name?.split(' ')[0] || '',
      lastName: billing.name?.split(' ').slice(1).join(' ') || '',
      address1: billing.address.line1,
      address2: billing.address.line2,
      city: billing.address.city,
      province: billing.address.state,
      country: billing.address.country,
      zip: billing.address.postal_code,
    };
  }

  /**
   * 延迟执行
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
