/**
 * Webhook 路由器
 * 处理 Shopify webhook 的路由和分发
 */

import type { ShopifyConfig } from '../config';
import { WebhookHandler } from './handler';

export class WebhookRouter {
  private handler: WebhookHandler;

  constructor(config: ShopifyConfig) {
    this.handler = new WebhookHandler(config);
  }

  /**
   * 处理 webhook 请求
   */
  async handleRequest(req: {
    headers: Record<string, string>;
    body: string;
    rawBody?: string;
  }): Promise<{
    success: boolean;
    status: number;
    message?: string;
    error?: string;
  }> {
    try {
      // 获取 webhook topic
      const topic = req.headers['x-shopify-topic'];
      if (!topic) {
        return {
          success: false,
          status: 400,
          error: 'Missing X-Shopify-Topic header',
        };
      }

      // 验证签名
      const signature = req.headers['x-shopify-hmac-sha256'];
      if (signature) {
        const rawBody = req.rawBody || req.body;
        const isValid = this.handler.verifyWebhookSignature(rawBody, signature);
        if (!isValid) {
          return {
            success: false,
            status: 401,
            error: 'Invalid webhook signature',
          };
        }
      }

      // 解析 body
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

      // 处理 webhook
      await this.handler.handleWebhook(topic, body);

      return {
        success: true,
        status: 200,
        message: 'Webhook processed successfully',
      };
    } catch (error) {
      console.error('[WebhookRouter] Error processing webhook:', error);
      return {
        success: false,
        status: 500,
        error: error instanceof Error ? error.message : 'Internal server error',
      };
    }
  }

  /**
   * 注册 webhook 到 Shopify
   */
  async registerWebhooks(webhooks: Array<{
    topic: string;
    address: string;
  }>): Promise<{
    success: boolean;
    registered: string[];
    failed: string[];
  }> {
    const registered: string[] = [];
    const failed: string[] = [];

    for (const webhook of webhooks) {
      try {
        // TODO: 实现 webhook 注册逻辑
        console.log(`[WebhookRouter] Registering webhook: ${webhook.topic}`);
        registered.push(webhook.topic);
      } catch (error) {
        console.error(`[WebhookRouter] Failed to register webhook: ${webhook.topic}`, error);
        failed.push(webhook.topic);
      }
    }

    return {
      success: failed.length === 0,
      registered,
      failed,
    };
  }
}
