/**
 * Shopify API 路由示例
 * 展示如何使用新的 @rolitt/shopify 包
 */

import { createShopifyApiRoute } from '@rolitt/shopify';

// 创建 Shopify API 路由处理器
const handlers = createShopifyApiRoute({
  // 可选：覆盖环境变量配置
  // storeDomain: 'your-store.myshopify.com',
  // adminAccessToken: 'shpat_xxxxx',
});

// 导出 HTTP 方法处理器
export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const DELETE = handlers.DELETE;
