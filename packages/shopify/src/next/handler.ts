/**
 * Next.js 集成处理器
 * 提供与 Next.js App Router 的无缝集成
 */

import type { NextRequest } from 'next/server';
import type { ShopifyConfig } from '../config';
import { NextResponse } from 'next/server';
import { ShopifyIntegration } from '../core/integration';
import { WebhookRouter } from '../webhooks/router';

export type ShopifyHandlerConfig = {
  // Next.js 特定配置
  basePath?: string;
  middleware?: Array<(req: NextRequest) => Promise<NextResponse | null>>;
} & Partial<ShopifyConfig>;

/**
 * 创建 Next.js 路由处理器
 */
export function createShopifyHandler(config?: ShopifyHandlerConfig) {
  const shopify = new ShopifyIntegration(config);
  const webhookRouter = new WebhookRouter(shopify.getConfig());

  return {
    /**
     * 处理 GET 请求
     */
    async GET(request: NextRequest) {
      const { searchParams } = new URL(request.url);
      const path = searchParams.get('path');

      // Health check endpoint
      if (path === '/health') {
        const healthCheck = shopify.getHealthCheck();
        const health = await healthCheck.check();
        return NextResponse.json(health);
      }

      // 指标端点
      if (path === '/metrics') {
        const metrics = await shopify.getMetricsData();
        return NextResponse.json(metrics);
      }

      // 配置信息端点
      if (path === '/config') {
        const config = shopify.getConfig();
        // 移除敏感信息
        const safeConfig = {
          ...config,
          adminAccessToken: '***HIDDEN***',
          webhook: config.webhook
            ? {
                ...config.webhook,
                secret: config.webhook.secret ? '***HIDDEN***' : undefined,
              }
            : undefined,
        };
        return NextResponse.json(safeConfig);
      }

      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 },
      );
    },

    /**
     * 处理 POST 请求（主要用于 Webhook）
     */
    async POST(request: NextRequest) {
      const { pathname } = new URL(request.url);

      // Webhook 端点
      if (pathname.endsWith('/webhook') || pathname.endsWith('/webhooks')) {
        const body = await request.text();
        const headers: Record<string, string> = {};

        request.headers.forEach((value, key) => {
          headers[key.toLowerCase()] = value;
        });

        const result = await webhookRouter.handleRequest({
          headers,
          body,
          rawBody: body,
        });

        return NextResponse.json(
          { success: result.success, message: result.message || result.error },
          { status: result.status },
        );
      }

      // 同步端点
      if (pathname.endsWith('/sync/products')) {
        const productService = shopify.getProductService();
        const result = await productService.syncAllProducts();
        return NextResponse.json(result);
      }

      if (pathname.endsWith('/sync/orders')) {
        const orderService = shopify.getOrderService();
        const body = await request.json();
        const result = await orderService.syncOrder(body);
        return NextResponse.json(result);
      }

      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 },
      );
    },

    /**
     * 处理 PUT 请求
     */
    async PUT(request: NextRequest) {
      const { pathname } = new URL(request.url);

      // 配置更新端点
      if (pathname.endsWith('/config')) {
        const body = await request.json();
        shopify.updateConfig(body);
        return NextResponse.json({ success: true });
      }

      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 },
      );
    },

    /**
     * 处理 DELETE 请求
     */
    async DELETE() {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 },
      );
    },
  };
}

/**
 * 创建 API 路由
 */
export function createShopifyApiRoute(config?: ShopifyHandlerConfig) {
  const handler = createShopifyHandler(config);

  return {
    GET: handler.GET,
    POST: handler.POST,
    PUT: handler.PUT,
    DELETE: handler.DELETE,
  };
}
