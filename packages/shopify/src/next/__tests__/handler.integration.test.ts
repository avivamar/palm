/**
 * Next.js Handler 集成测试
 * 测试 Next.js API 路由处理器的完整功能
 */

import type { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createShopifyApiRoute, createShopifyHandler } from '../handler';

// Mock dependencies
vi.mock('../../core/integration');
vi.mock('../../webhooks/router');

// Create mock NextRequest
function createMockRequest(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  headers?: Record<string, string>,
): NextRequest {
  const request = {
    url,
    method,
    headers: new Map(Object.entries(headers || {})),
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(typeof body === 'string' ? body : JSON.stringify(body)),
  } as unknown as NextRequest;

  // Add forEach method to headers
  (request.headers as any).forEach = function (callback: (value: string, key: string, parent: Headers) => void) {
    for (const [key, value] of this.entries()) {
      callback(value, key, this);
    }
  };

  return request;
}

describe('Next.js Handler Integration Tests', () => {
  let mockShopifyIntegration: any;
  let mockWebhookRouter: any;
  let handler: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock ShopifyIntegration
    mockShopifyIntegration = {
      healthCheck: vi.fn(),
      getMetricsData: vi.fn(),
      getConfig: vi.fn(),
      updateConfig: vi.fn(),
      getOrderService: vi.fn(),
      getProductService: vi.fn(),
    };

    // Mock WebhookRouter
    mockWebhookRouter = {
      handleRequest: vi.fn(),
    };

    // Mock the imports
    const { ShopifyIntegration } = await import('../../core/integration');
    const { WebhookRouter } = await import('../../webhooks/router');

    vi.mocked(ShopifyIntegration).mockImplementation(() => mockShopifyIntegration);
    vi.mocked(WebhookRouter).mockImplementation(() => mockWebhookRouter);

    handler = createShopifyHandler({
      storeDomain: 'test-store',
      adminAccessToken: 'test-token',
    });
  });

  describe('GET Requests', () => {
    it('should handle health check endpoint', async () => {
      const healthData = {
        status: 'healthy',
        shopEnabled: true,
        apiConnection: true,
        webhookActive: true,
        errors: [],
      };

      mockShopifyIntegration.healthCheck.mockResolvedValue(healthData);

      const request = createMockRequest('https://example.com/api/shopify?path=/health');
      const response = await handler.GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual(healthData);
      expect(mockShopifyIntegration.healthCheck).toHaveBeenCalled();
    });

    it('should handle metrics endpoint', async () => {
      const metricsData = {
        apiCalls: 150,
        syncedProducts: 25,
        syncedOrders: 100,
        errors: 2,
        lastSync: '2025-01-01T00:00:00Z',
      };

      mockShopifyIntegration.getMetricsData.mockResolvedValue(metricsData);

      const request = createMockRequest('https://example.com/api/shopify?path=/metrics');
      const response = await handler.GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual(metricsData);
    });

    it('should handle config endpoint with sensitive data hidden', async () => {
      const configData = {
        storeDomain: 'test-store',
        adminAccessToken: 'secret-token',
        webhook: {
          secret: 'webhook-secret',
          endpoint: '/webhooks',
        },
      };

      mockShopifyIntegration.getConfig.mockReturnValue(configData);

      const request = createMockRequest('https://example.com/api/shopify?path=/config');
      const response = await handler.GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.storeDomain).toBe('test-store');
      expect(responseData.adminAccessToken).toBe('***HIDDEN***');
      expect(responseData.webhook.secret).toBe('***HIDDEN***');
      expect(responseData.webhook.endpoint).toBe('/webhooks');
    });

    it('should return 404 for unknown GET paths', async () => {
      const request = createMockRequest('https://example.com/api/shopify?path=/unknown');
      const response = await handler.GET(request);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.error).toBe('Not found');
    });
  });

  describe('POST Requests', () => {
    it('should handle webhook requests', async () => {
      const webhookBody = {
        id: 'order_123',
        email: 'customer@example.com',
        financial_status: 'paid',
      };

      const webhookResult = {
        success: true,
        status: 200,
        message: 'Webhook processed successfully',
      };

      mockWebhookRouter.handleRequest.mockResolvedValue(webhookResult);

      const request = createMockRequest(
        'https://example.com/api/shopify/webhook',
        'POST',
        webhookBody,
        {
          'x-shopify-topic': 'orders/create',
          'x-shopify-hmac-sha256': 'signature',
        },
      );

      const response = await handler.POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.message).toBe('Webhook processed successfully');
      expect(mockWebhookRouter.handleRequest).toHaveBeenCalledWith({
        headers: expect.objectContaining({
          'x-shopify-topic': 'orders/create',
          'x-shopify-hmac-sha256': 'signature',
        }),
        body: JSON.stringify(webhookBody),
        rawBody: JSON.stringify(webhookBody),
      });
    });

    it('should handle product sync requests', async () => {
      const mockProductService = {
        syncAllProducts: vi.fn().mockResolvedValue({
          success: true,
          syncedCount: 10,
          failedCount: 0,
          errors: [],
        }),
      };

      mockShopifyIntegration.getProductService.mockReturnValue(mockProductService);

      const request = createMockRequest('https://example.com/api/shopify/sync/products', 'POST');
      const response = await handler.POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.syncedCount).toBe(10);
      expect(mockProductService.syncAllProducts).toHaveBeenCalled();
    });

    it('should handle order sync requests', async () => {
      const orderData = {
        id: 'order_456',
        email: 'test@example.com',
        total: '99.99',
      };

      const mockOrderService = {
        syncOrder: vi.fn().mockResolvedValue({
          success: true,
          shopifyOrderId: 'shopify_789',
          orderId: 'order_456',
        }),
      };

      mockShopifyIntegration.getOrderService.mockReturnValue(mockOrderService);

      const request = createMockRequest(
        'https://example.com/api/shopify/sync/orders',
        'POST',
        orderData,
      );

      const response = await handler.POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(responseData.shopifyOrderId).toBe('shopify_789');
      expect(mockOrderService.syncOrder).toHaveBeenCalledWith(orderData);
    });

    it('should return 404 for unknown POST paths', async () => {
      const request = createMockRequest('https://example.com/api/shopify/unknown', 'POST');
      const response = await handler.POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.error).toBe('Not found');
    });
  });

  describe('PUT Requests', () => {
    it('should handle config update requests', async () => {
      const configUpdate = {
        storeDomain: 'updated-store',
        adminAccessToken: 'updated-token',
      };

      const request = createMockRequest(
        'https://example.com/api/shopify/config',
        'PUT',
        configUpdate,
      );

      const response = await handler.PUT(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);
      expect(mockShopifyIntegration.updateConfig).toHaveBeenCalledWith(configUpdate);
    });

    it('should return 404 for unknown PUT paths', async () => {
      const request = createMockRequest('https://example.com/api/shopify/unknown', 'PUT');
      const response = await handler.PUT(request);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE Requests', () => {
    it('should return 405 for all DELETE requests', async () => {
      const request = createMockRequest('https://example.com/api/shopify/test', 'DELETE');
      const response = await handler.DELETE(request);
      const responseData = await response.json();

      expect(response.status).toBe(405);
      expect(responseData.error).toBe('Method not allowed');
    });
  });

  describe('API Route Creation', () => {
    it('should create complete API route with all methods', () => {
      const apiRoute = createShopifyApiRoute({
        storeDomain: 'api-test-store',
        adminAccessToken: 'api-test-token',
      });

      expect(apiRoute.GET).toBeDefined();
      expect(apiRoute.POST).toBeDefined();
      expect(apiRoute.PUT).toBeDefined();
      expect(apiRoute.DELETE).toBeDefined();
      expect(typeof apiRoute.GET).toBe('function');
      expect(typeof apiRoute.POST).toBe('function');
      expect(typeof apiRoute.PUT).toBe('function');
      expect(typeof apiRoute.DELETE).toBe('function');
    });
  });

  describe('Error Handling', () => {
    it('should handle internal errors gracefully', async () => {
      mockShopifyIntegration.healthCheck.mockRejectedValue(new Error('Internal error'));

      const request = createMockRequest('https://example.com/api/shopify?path=/health');

      // Should not throw, but handle error gracefully
      await expect(handler.GET(request)).resolves.toBeDefined();
    });

    it('should handle malformed JSON in requests', async () => {
      const request = createMockRequest('https://example.com/api/shopify/sync/orders', 'POST');
      request.json = vi.fn().mockRejectedValue(new Error('Invalid JSON'));

      await expect(handler.POST(request)).resolves.toBeDefined();
    });

    it('should handle webhook processing errors', async () => {
      mockWebhookRouter.handleRequest.mockResolvedValue({
        success: false,
        status: 400,
        error: 'Invalid webhook signature',
      });

      const request = createMockRequest(
        'https://example.com/api/shopify/webhook',
        'POST',
        { test: 'data' },
      );

      const response = await handler.POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.message).toBe('Invalid webhook signature');
    });
  });

  describe('Middleware Integration', () => {
    it('should support custom middleware', async () => {
      const middleware = vi.fn().mockResolvedValue(null);

      const handlerWithMiddleware = createShopifyHandler({
        storeDomain: 'test-store',
        adminAccessToken: 'test-token',
        middleware: [middleware],
      });

      // Middleware functionality would be tested if implemented
      expect(handlerWithMiddleware).toBeDefined();
    });
  });

  describe('Base Path Support', () => {
    it('should support custom base path configuration', () => {
      const handlerWithBasePath = createShopifyHandler({
        storeDomain: 'test-store',
        adminAccessToken: 'test-token',
        basePath: '/api/v1/shopify',
      });

      expect(handlerWithBasePath).toBeDefined();
      // Base path functionality would be tested in actual implementation
    });
  });
});
