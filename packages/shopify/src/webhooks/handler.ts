/**
 * Webhook 处理器
 */

import type { ShopifyConfig } from '../config';
import crypto from 'node:crypto';

export class WebhookHandler {
  private config: ShopifyConfig;

  constructor(config: ShopifyConfig) {
    this.config = config;
  }

  /**
   * 验证 Webhook 签名
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!this.config.webhook?.secret) {
      console.warn('Webhook secret 未配置');
      return false;
    }

    const hash = crypto
      .createHmac('sha256', this.config.webhook.secret)
      .update(rawBody, 'utf8')
      .digest('base64');

    return hash === signature;
  }

  /**
   * 处理 Webhook
   */
  async handleWebhook(topic: string, body: any): Promise<any> {
    console.log(`[Webhook] 收到 ${topic} webhook`);

    switch (topic) {
      case 'orders/create':
        return this.handleOrderCreate(body);
      case 'orders/updated':
        return this.handleOrderUpdate(body);
      case 'products/create':
        return this.handleProductCreate(body);
      case 'products/update':
        return this.handleProductUpdate(body);
      case 'inventory_levels/update':
        return this.handleInventoryUpdate();
      default:
        console.log(`[Webhook] 未处理的 topic: ${topic}`);
        return { success: true, message: 'Webhook received' };
    }
  }

  private async handleOrderCreate(order: any) {
    console.log('[Webhook] 处理订单创建:', order.id);
    // 实现订单创建逻辑
    return { success: true };
  }

  private async handleOrderUpdate(order: any) {
    console.log('[Webhook] 处理订单更新:', order.id);
    // 实现订单更新逻辑
    return { success: true };
  }

  private async handleProductCreate(product: any) {
    console.log('[Webhook] 处理产品创建:', product.id);
    // 实现产品创建逻辑
    return { success: true };
  }

  private async handleProductUpdate(product: any) {
    console.log('[Webhook] 处理产品更新:', product.id);
    // 实现产品更新逻辑
    return { success: true };
  }

  private async handleInventoryUpdate() {
    console.log('[Webhook] 处理库存更新');
    // 实现库存更新逻辑
    return { success: true };
  }
}
