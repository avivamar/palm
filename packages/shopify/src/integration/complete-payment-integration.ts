/**
 * 完整的支付集成服务实现
 * 连接 Stripe 支付系统与 Shopify 订单同步
 */

import type { NextRequest } from 'next/server';
import type { ShopifyIntegration } from '../core/integration';
import type { OrderSyncResult } from '../types';
import { ShopifyErrorHandler } from '../core/error-handler';
import { WebhookLogger } from '../../../../src/libs/webhook-logger';

export type StripeWebhookEvent = {
  id: string;
  type: string;
  created: number;
  data: {
    object: any;
  };
  request?: {
    id: string;
    idempotency_key?: string;
  };
};

export type RolittOrderData = {
  id: string;
  email: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    sku?: string;
    variant?: string;
    color?: string;
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
  createdAt: string;
  updatedAt: string;
};

export class CompletePaymentIntegrationService {
  private shopifyIntegration: ShopifyIntegration;
  private syncQueue: Map<string, any> = new Map();

  constructor(shopifyIntegration: ShopifyIntegration) {
    this.shopifyIntegration = shopifyIntegration;
  }

  /**
   * 处理 Stripe Webhook 事件
   */
  async handleStripeWebhook(request: NextRequest): Promise<{
    success: boolean;
    message: string;
    orderId?: string;
    shopifyOrderId?: string;
  }> {
    const webhookId = `stripe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let logId: number = -1;
    
    try {
      // 1. 解析 Webhook 数据
      const body = await request.text();
      const signature = request.headers.get('stripe-signature');
      
      if (!signature) {
        throw new Error('Missing Stripe signature');
      }

      // 2. 验证 Webhook 签名（这里需要实际的 Stripe 验证）
      const event = JSON.parse(body) as StripeWebhookEvent;
      
      // 3. 记录 Webhook 开始
      logId = await WebhookLogger.logWebhookEventStart(
        webhookId,
        'stripe',
        event.type,
        event.id
      );

      // 4. 处理不同类型的事件
      let result: OrderSyncResult;
      
      switch (event.type) {
        case 'checkout.session.completed':
          result = await this.handleCheckoutCompleted(event);
          break;
        case 'payment_intent.succeeded':
          result = await this.handlePaymentSucceeded(event);
          break;
        case 'invoice.payment_succeeded':
          result = await this.handleInvoicePaymentSucceeded(event);
          break;
        default:
          result = {
            success: true,
            orderId: 'unknown',
            error: `Unhandled event type: ${event.type}`,
          };
      }

      // 5. 记录结果
      if (result.success) {
        await WebhookLogger.logWebhookEventSuccess(logId, {
          orderId: result.orderId,
          shopifyOrderId: result.shopifyOrderId,
        });
      } else {
        await WebhookLogger.logWebhookEventFailure(logId, new Error(result.error || 'Unknown error'));
      }

      return {
        success: result.success,
        message: result.success ? 'Order synced successfully' : result.error || 'Sync failed',
        orderId: result.orderId,
        shopifyOrderId: result.shopifyOrderId,
      };

    } catch (error) {
      if (logId > 0) {
        await WebhookLogger.logWebhookEventFailure(logId, error instanceof Error ? error : new Error(String(error)));
      }
      
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * 处理 Checkout Session 完成事件
   */
  private async handleCheckoutCompleted(event: StripeWebhookEvent): Promise<OrderSyncResult> {
    const session = event.data.object;
    
    try {
      // 从 Stripe Session 提取订单数据
      const orderData = this.extractOrderDataFromStripeSession(session);
      
      // 同步到 Shopify
      const orderService = this.shopifyIntegration.getOrderService();
      const syncResult = await orderService.syncOrder(orderData);

      // 记录 Shopify 同步日志
      await WebhookLogger.logShopifySync({
        orderId: orderData.id,
        email: orderData.email,
        shopifyOrderId: syncResult.shopifyOrderId,
        status: syncResult.success ? 'success' : 'failed',
        error: syncResult.error,
        timestamp: new Date(),
      });

      return syncResult;
    } catch (error) {
      ShopifyErrorHandler.logError('Failed to handle checkout completed', error, {
        eventId: event.id,
        sessionId: session.id,
      });

      return {
        success: false,
        orderId: session.metadata?.orderId || session.id,
        error: error instanceof Error ? error.message : 'Checkout processing failed',
      };
    }
  }

  /**
   * 处理支付成功事件
   */
  private async handlePaymentSucceeded(event: StripeWebhookEvent): Promise<OrderSyncResult> {
    const paymentIntent = event.data.object;
    
    try {
      // 检查是否已经处理过此订单
      const existingSync = this.syncQueue.get(paymentIntent.id);
      if (existingSync && existingSync.status === 'completed') {
        return {
          success: true,
          orderId: existingSync.orderId,
          shopifyOrderId: existingSync.shopifyOrderId,
          error: 'Already processed',
        };
      }

      // 从 Payment Intent 提取订单数据
      const orderData = this.extractOrderDataFromPaymentIntent(paymentIntent);
      
      // 同步到 Shopify
      const orderService = this.shopifyIntegration.getOrderService();
      const syncResult = await orderService.syncOrder(orderData);

      // 更新同步队列
      this.syncQueue.set(paymentIntent.id, {
        orderId: orderData.id,
        shopifyOrderId: syncResult.shopifyOrderId,
        status: syncResult.success ? 'completed' : 'failed',
        timestamp: new Date().toISOString(),
      });

      return syncResult;
    } catch (error) {
      ShopifyErrorHandler.logError('Failed to handle payment succeeded', error, {
        eventId: event.id,
        paymentIntentId: paymentIntent.id,
      });

      return {
        success: false,
        orderId: paymentIntent.metadata?.orderId || paymentIntent.id,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  /**
   * 处理发票支付成功事件（订阅）
   */
  private async handleInvoicePaymentSucceeded(event: StripeWebhookEvent): Promise<OrderSyncResult> {
    const invoice = event.data.object;
    
    try {
      // 订阅支付的处理逻辑
      const orderData = this.extractOrderDataFromInvoice(invoice);
      
      // 同步到 Shopify（订阅订单）
      const orderService = this.shopifyIntegration.getOrderService();
      const syncResult = await orderService.syncOrder(orderData);

      return syncResult;
    } catch (error) {
      ShopifyErrorHandler.logError('Failed to handle invoice payment succeeded', error, {
        eventId: event.id,
        invoiceId: invoice.id,
      });

      return {
        success: false,
        orderId: invoice.metadata?.orderId || invoice.id,
        error: error instanceof Error ? error.message : 'Invoice processing failed',
      };
    }
  }

  /**
   * 从 Stripe Session 提取订单数据
   */
  private extractOrderDataFromStripeSession(session: any): RolittOrderData {
    const metadata = session.metadata || {};
    
    return {
      id: metadata.orderId || session.id,
      email: session.customer_details?.email || metadata.customerEmail,
      amount: session.amount_total / 100, // Stripe uses cents
      currency: session.currency.toUpperCase(),
      status: 'completed',
      items: this.extractLineItemsFromSession(session),
      customer: {
        email: session.customer_details?.email || metadata.customerEmail,
        firstName: metadata.customerFirstName || session.customer_details?.name?.split(' ')[0],
        lastName: metadata.customerLastName || session.customer_details?.name?.split(' ').slice(1).join(' '),
        phone: session.customer_details?.phone || metadata.customerPhone,
      },
      shipping: this.extractShippingFromSession(session),
      billing: this.extractBillingFromSession(session),
      metadata: {
        stripeSessionId: session.id,
        stripeCustomerId: session.customer,
        paymentStatus: session.payment_status,
        ...metadata,
      },
      createdAt: new Date(session.created * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * 从 Payment Intent 提取订单数据
   */
  private extractOrderDataFromPaymentIntent(paymentIntent: any): RolittOrderData {
    const metadata = paymentIntent.metadata || {};
    
    return {
      id: metadata.orderId || paymentIntent.id,
      email: paymentIntent.receipt_email || metadata.customerEmail,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      status: 'completed',
      items: this.extractLineItemsFromMetadata(metadata),
      customer: {
        email: paymentIntent.receipt_email || metadata.customerEmail,
        firstName: metadata.customerFirstName,
        lastName: metadata.customerLastName,
        phone: metadata.customerPhone,
      },
      shipping: this.extractShippingFromPaymentIntent(paymentIntent),
      billing: this.extractBillingFromPaymentIntent(paymentIntent),
      metadata: {
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: paymentIntent.customer,
        paymentMethod: paymentIntent.payment_method_types?.[0],
        ...metadata,
      },
      createdAt: new Date(paymentIntent.created * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * 从 Invoice 提取订单数据
   */
  private extractOrderDataFromInvoice(invoice: any): RolittOrderData {
    const metadata = invoice.metadata || {};
    
    return {
      id: metadata.orderId || `inv_${invoice.id}`,
      email: invoice.customer_email || metadata.customerEmail,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency.toUpperCase(),
      status: 'completed',
      items: this.extractLineItemsFromInvoice(invoice),
      customer: {
        email: invoice.customer_email || metadata.customerEmail,
        firstName: metadata.customerFirstName,
        lastName: metadata.customerLastName,
        phone: metadata.customerPhone,
      },
      metadata: {
        stripeInvoiceId: invoice.id,
        stripeSubscriptionId: invoice.subscription,
        stripeCustomerId: invoice.customer,
        billingReason: invoice.billing_reason,
        ...metadata,
      },
      createdAt: new Date(invoice.created * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * 从 Session 提取商品行项目
   */
  private extractLineItemsFromSession(session: any): RolittOrderData['items'] {
    // 这里需要调用 Stripe API 获取 line items
    // 简化实现，从 metadata 获取
    const metadata = session.metadata || {};
    
    if (metadata.items) {
      try {
        return JSON.parse(metadata.items);
      } catch {
        // 解析失败，返回默认项目
      }
    }

    // 默认商品项目
    return [{
      productId: metadata.productId || 'ai-companion-default',
      name: metadata.productName || 'AI Companion Product',
      quantity: 1,
      price: session.amount_total / 100,
      sku: metadata.productSku || 'AI-COMP-001',
      variant: metadata.productVariant,
      color: metadata.productColor,
    }];
  }

  /**
   * 从 Metadata 提取商品行项目
   */
  private extractLineItemsFromMetadata(metadata: any): RolittOrderData['items'] {
    if (metadata.items) {
      try {
        return JSON.parse(metadata.items);
      } catch {
        // 解析失败，返回默认项目
      }
    }

    return [{
      productId: metadata.productId || 'ai-companion-default',
      name: metadata.productName || 'AI Companion Product',
      quantity: Number(metadata.quantity) || 1,
      price: Number(metadata.price) || 0,
      sku: metadata.productSku || 'AI-COMP-001',
      variant: metadata.productVariant,
      color: metadata.productColor,
    }];
  }

  /**
   * 从 Invoice 提取商品行项目
   */
  private extractLineItemsFromInvoice(invoice: any): RolittOrderData['items'] {
    const items: RolittOrderData['items'] = [];
    
    if (invoice.lines && invoice.lines.data) {
      for (const line of invoice.lines.data) {
        items.push({
          productId: line.price?.product || 'subscription-product',
          name: line.description || 'Subscription',
          quantity: line.quantity || 1,
          price: line.amount / 100,
          sku: line.price?.lookup_key || 'SUB-001',
        });
      }
    }

    return items.length > 0 ? items : [{
      productId: 'subscription-default',
      name: 'Subscription Service',
      quantity: 1,
      price: invoice.amount_paid / 100,
      sku: 'SUB-DEFAULT',
    }];
  }

  /**
   * 从 Session 提取运送地址
   */
  private extractShippingFromSession(session: any): RolittOrderData['shipping'] | undefined {
    const shipping = session.shipping_details || session.shipping;
    if (!shipping || !shipping.address) return undefined;

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
   * 从 Session 提取账单地址
   */
  private extractBillingFromSession(session: any): RolittOrderData['billing'] | undefined {
    const billing = session.customer_details;
    if (!billing || !billing.address) return undefined;

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
   * 从 Payment Intent 提取运送地址
   */
  private extractShippingFromPaymentIntent(paymentIntent: any): RolittOrderData['shipping'] | undefined {
    const shipping = paymentIntent.shipping;
    if (!shipping || !shipping.address) return undefined;

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
   * 从 Payment Intent 提取账单地址
   */
  private extractBillingFromPaymentIntent(paymentIntent: any): RolittOrderData['billing'] | undefined {
    const billing = paymentIntent.billing_details;
    if (!billing || !billing.address) return undefined;

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
   * 获取同步队列状态
   */
  public getSyncQueueStatus() {
    const items = Array.from(this.syncQueue.values());
    
    return {
      total: items.length,
      completed: items.filter(i => i.status === 'completed').length,
      failed: items.filter(i => i.status === 'failed').length,
      lastSync: items.length > 0 ? Math.max(...items.map(i => new Date(i.timestamp).getTime())) : null,
    };
  }

  /**
   * 清理旧的同步记录
   */
  public cleanupSyncQueue(olderThanHours: number = 24): void {
    const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
    
    for (const [key, item] of this.syncQueue.entries()) {
      const itemTime = new Date(item.timestamp).getTime();
      if (itemTime < cutoffTime) {
        this.syncQueue.delete(key);
      }
    }
  }
}