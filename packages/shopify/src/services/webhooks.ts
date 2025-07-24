/**
 * Shopify Webhook 处理服务
 */

import type { ShopifyClient } from '../core/client';
import { shopifyMetrics } from '../monitoring/metrics';
import { OrderService } from './orders';

type WebhookProcessingResult = {
  success: boolean;
  shopifyOrderId?: string;
  shopifyOrderNumber?: string;
  error?: string;
  retryable?: boolean;
};

export class WebhookService {
  private client: ShopifyClient;
  private orderService: OrderService;

  constructor(client: ShopifyClient) {
    this.client = client;
    this.orderService = new OrderService(client);
  }

  /**
   * 处理来自 Stripe Webhook 的订单同步
   */
  async processStripeOrder(sessionData: any, metadata: { preorderId: string; email: string }): Promise<WebhookProcessingResult> {
    console.log(`[WebhookService] 🚀 Starting Shopify order sync for preorder: ${metadata.preorderId}`);

    try {
      // 构建订单数据
      const orderData = this.buildOrderFromStripeSession(sessionData, metadata);

      // 同步到 Shopify
      const syncResult = await this.orderService.syncOrder(orderData);

      if (syncResult.success) {
        console.log(`[WebhookService] ✅ Shopify order created: ${syncResult.shopifyOrderId}`);

        // 记录订单同步成功
        shopifyMetrics.recordOrderSync(true);

        return {
          success: true,
          shopifyOrderId: syncResult.shopifyOrderId,
          shopifyOrderNumber: syncResult.shopifyOrderNumber,
        };
      } else {
        console.error(`[WebhookService] ❌ Shopify sync failed: ${syncResult.error}`);

        // 记录订单同步失败
        shopifyMetrics.recordOrderSync(false);

        return {
          success: false,
          error: syncResult.error,
          retryable: true,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[WebhookService] 🛑 Error processing Stripe order:`, error);

      // 记录订单同步失败
      shopifyMetrics.recordOrderSync(false);

      return {
        success: false,
        error: errorMessage,
        retryable: !errorMessage.includes('validation') && !errorMessage.includes('invalid'),
      };
    }
  }

  /**
   * 从 Stripe Session 构建 Shopify 订单数据
   */
  private buildOrderFromStripeSession(session: any, metadata: { preorderId: string; email: string }) {
    const lineItems = [];

    // 从 Stripe session 提取商品信息
    if (session.line_items?.data) {
      session.line_items.data.forEach((item: any) => {
        lineItems.push({
          name: item.description || 'AI Companion Product',
          title: item.description || 'AI Companion Product',
          quantity: item.quantity || 1,
          price: (item.amount_total / 100).toFixed(2),
          sku: item.price?.metadata?.sku || undefined,
          variant: item.price?.metadata?.color || session.metadata?.color,
          requiresShipping: true,
          taxable: true,
        });
      });
    }

    // 如果没有商品信息，使用默认商品
    if (lineItems.length === 0) {
      lineItems.push({
        name: 'AI Companion Product',
        title: 'AI Companion Product',
        quantity: 1,
        price: session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00',
        variant: session.metadata?.color || 'Standard',
        requiresShipping: true,
        taxable: true,
      });
    }

    return {
      id: metadata.preorderId,
      email: metadata.email,
      total: session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00',
      amount: session.amount_total ? (session.amount_total / 100).toFixed(2) : '0.00',
      currency: session.currency?.toUpperCase() || 'USD',
      items: lineItems,
      status: 'completed',
      paymentMethod: 'stripe',
      source: 'rolitt-website',
      sessionId: session.id,

      // 客户信息
      firstName: session.customer_details?.name?.split(' ')[0] || '',
      lastName: session.customer_details?.name?.split(' ').slice(1).join(' ') || '',
      phone: session.customer_details?.phone || null,

      // 地址信息
      shipping_address: this.formatAddress(session.shipping_details?.address, session.customer_details?.name),
      billing_address: this.formatAddress(session.customer_details?.address || session.shipping_details?.address, session.customer_details?.name),

      // 元数据
      note: `Order synced from Rolitt website. Stripe Session: ${session.id}`,
      metadata: {
        ...session.metadata,
        stripe_session_id: session.id,
        rolitt_preorder_id: metadata.preorderId,
        payment_intent_id: session.payment_intent,
      },
    };
  }

  /**
   * 格式化地址信息
   */
  private formatAddress(address: any, customerName?: string) {
    if (!address) {
      return null;
    }

    const nameParts = customerName?.split(' ') || [];

    return {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      first_name: nameParts[0] || '',
      last_name: nameParts.slice(1).join(' ') || '',
      address1: address.line1 || '',
      street: address.line1 || '',
      address2: address.line2 || '',
      city: address.city || '',
      province: address.state || '',
      state: address.state || '',
      country: address.country || '',
      zip: address.postal_code || '',
      postal_code: address.postal_code || '',
    };
  }

  /**
   * 批量处理订单同步
   */
  async processBatchOrders(orders: any[]): Promise<{ success: number; failed: number; results: WebhookProcessingResult[] }> {
    const results: WebhookProcessingResult[] = [];
    let successCount = 0;
    let failedCount = 0;

    for (const order of orders) {
      try {
        const result = await this.processStripeOrder(order.sessionData, order.metadata);
        results.push(result);

        if (result.success) {
          successCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        console.error(`[WebhookService] Error processing batch order:`, error);
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          retryable: true,
        });
        failedCount++;
      }
    }

    return {
      success: successCount,
      failed: failedCount,
      results,
    };
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    try {
      const clientHealth = await this.client.healthCheck();
      return {
        status: clientHealth.status,
        shopifyConnection: clientHealth.apiConnection,
        webhookService: 'active',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        shopifyConnection: false,
        webhookService: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
