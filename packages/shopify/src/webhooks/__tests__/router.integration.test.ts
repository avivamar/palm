/**
 * Webhook Router 集成测试
 * 测试 Shopify Webhook 处理的完整流程
 */

import type { ShopifyConfig } from '../../config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestConfig } from '../../config';
import { ShopifyErrorHandler } from '../../core/error-handler';
import { WebhookRouter } from '../router';

// Mock crypto for HMAC verification
const mockCreateHmac = vi.fn();
vi.mock('crypto', () => ({
  createHmac: () => mockCreateHmac,
}));

// Mock ShopifyErrorHandler
vi.mock('../../core/error-handler', () => ({
  ShopifyErrorHandler: {
    logInfo: vi.fn(),
    logError: vi.fn(),
    logWarning: vi.fn(),
    createRetryableApiCall: vi.fn(),
  },
}));

describe('WebhookRouter Integration Tests', () => {
  let webhookRouter: WebhookRouter;
  let mockConfig: ShopifyConfig;

  beforeEach(() => {
    vi.clearAllMocks();

    mockConfig = createTestConfig({
      storeDomain: 'test-store',
      adminAccessToken: 'test-token',
      webhook: {
        secret: 'webhook-secret-key',
        endpoint: '/api/webhooks/shopify',
      },
    });

    webhookRouter = new WebhookRouter(mockConfig);

    // Setup HMAC mock
    mockCreateHmac.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn().mockReturnValue('valid-signature'),
    });
  });

  describe('Webhook Signature Verification', () => {
    const validPayload = JSON.stringify({
      id: 'order_123',
      email: 'customer@example.com',
      financial_status: 'paid',
    });

    it('should verify valid webhook signatures', async () => {
      const request = {
        headers: {
          'x-shopify-topic': 'orders/create',
          'x-shopify-hmac-sha256': 'valid-signature',
          'content-type': 'application/json',
        },
        body: validPayload,
        rawBody: validPayload,
      };

      const result = await webhookRouter.handleRequest(request);

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(ShopifyErrorHandler.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('Webhook processed successfully'),
        expect.any(Object),
      );
    });

    it('should reject invalid webhook signatures', async () => {
      mockCreateHmac.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        digest: vi.fn().mockReturnValue('different-signature'),
      });

      const request = {
        headers: {
          'x-shopify-topic': 'orders/create',
          'x-shopify-hmac-sha256': 'invalid-signature',
          'content-type': 'application/json',
        },
        body: validPayload,
        rawBody: validPayload,
      };

      const result = await webhookRouter.handleRequest(request);

      expect(result.success).toBe(false);
      expect(result.status).toBe(401);
      expect(result.error).toContain('Invalid webhook signature');
    });

    it('should handle missing signature headers', async () => {
      const request = {
        headers: {
          'x-shopify-topic': 'orders/create',
          'content-type': 'application/json',
        },
        body: validPayload,
        rawBody: validPayload,
      };

      const result = await webhookRouter.handleRequest(request);

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.error).toContain('Missing required headers');
    });
  });

  describe('Order Webhook Processing', () => {
    const orderPayload = {
      id: 'shopify_order_456',
      order_number: 'SP1001',
      email: 'webhook-customer@example.com',
      financial_status: 'paid',
      fulfillment_status: null,
      total_price: '299.99',
      currency: 'USD',
      line_items: [
        {
          id: 'line_item_789',
          title: 'AI Companion Pro',
          quantity: 1,
          price: '299.99',
          sku: 'AI-COMP-PRO-001',
          variant_title: 'Blue',
        },
      ],
      shipping_address: {
        first_name: 'Jane',
        last_name: 'Doe',
        address1: '456 Webhook St',
        city: 'San Francisco',
        province: 'CA',
        zip: '94105',
        country: 'US',
      },
      customer: {
        id: 'customer_123',
        email: 'webhook-customer@example.com',
        first_name: 'Jane',
        last_name: 'Doe',
      },
    };

    it('should process orders/create webhook', async () => {
      const request = {
        headers: {
          'x-shopify-topic': 'orders/create',
          'x-shopify-hmac-sha256': 'valid-signature',
        },
        body: JSON.stringify(orderPayload),
        rawBody: JSON.stringify(orderPayload),
      };

      const result = await webhookRouter.handleRequest(request);

      expect(result.success).toBe(true);
      expect(result.status).toBe(200);
      expect(ShopifyErrorHandler.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('orders/create'),
        expect.objectContaining({
          orderId: 'shopify_order_456',
          customerEmail: 'webhook-customer@example.com',
        }),
      );
    });

    it('should process orders/updated webhook', async () => {
      const updatedOrderPayload = {
        ...orderPayload,
        fulfillment_status: 'fulfilled',
        updated_at: new Date().toISOString(),
      };

      const request = {
        headers: {
          'x-shopify-topic': 'orders/updated',
          'x-shopify-hmac-sha256': 'valid-signature',
        },
        body: JSON.stringify(updatedOrderPayload),
        rawBody: JSON.stringify(updatedOrderPayload),
      };

      const result = await webhookRouter.handleRequest(request);

      expect(result.success).toBe(true);
      expect(ShopifyErrorHandler.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('orders/updated'),
        expect.any(Object),
      );
    });

    it('should process orders/paid webhook', async () => {
      const paidOrderPayload = {
        ...orderPayload,
        financial_status: 'paid',
        payment_details: {
          credit_card_number: '•••• •••• •••• 4242',
          credit_card_company: 'Visa',
        },
      };

      const request = {
        headers: {
          'x-shopify-topic': 'orders/paid',
          'x-shopify-hmac-sha256': 'valid-signature',
        },
        body: JSON.stringify(paidOrderPayload),
        rawBody: JSON.stringify(paidOrderPayload),
      };

      const result = await webhookRouter.handleRequest(request);

      expect(result.success).toBe(true);
      expect(ShopifyErrorHandler.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('orders/paid'),
        expect.objectContaining({
          orderId: 'shopify_order_456',
          financialStatus: 'paid',
        }),
      );
    });
  });

  describe('Product Webhook Processing', () => {
    const productPayload = {
      id: 'product_789',
      title: 'Webhook Test Product',
      handle: 'webhook-test-product',
      status: 'active',
      vendor: 'Rolitt',
      product_type: 'AI Technology',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      variants: [
        {
          id: 'variant_456',
          title: 'Default Title',
          price: '199.99',
          sku: 'WEBHOOK-TEST-001',
          inventory_quantity: 50,
        },
      ],
    };

    it('should process products/create webhook', async () => {
      const request = {
        headers: {
          'x-shopify-topic': 'products/create',
          'x-shopify-hmac-sha256': 'valid-signature',
        },
        body: JSON.stringify(productPayload),
        rawBody: JSON.stringify(productPayload),
      };

      const result = await webhookRouter.handleRequest(request);

      expect(result.success).toBe(true);
      expect(ShopifyErrorHandler.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('products/create'),
        expect.objectContaining({
          productId: 'product_789',
          productTitle: 'Webhook Test Product',
        }),
      );
    });

    it('should process products/update webhook', async () => {
      const updatedProductPayload = {
        ...productPayload,
        title: 'Updated Webhook Test Product',
        updated_at: new Date().toISOString(),
      };

      const request = {
        headers: {
          'x-shopify-topic': 'products/update',
          'x-shopify-hmac-sha256': 'valid-signature',
        },
        body: JSON.stringify(updatedProductPayload),
        rawBody: JSON.stringify(updatedProductPayload),
      };

      const result = await webhookRouter.handleRequest(request);

      expect(result.success).toBe(true);
      expect(ShopifyErrorHandler.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('products/update'),
        expect.any(Object),
      );
    });
  });

  describe('Customer Webhook Processing', () => {
    const customerPayload = {
      id: 'customer_789',
      email: 'webhook-new-customer@example.com',
      first_name: 'New',
      last_name: 'Customer',
      phone: '+1987654321',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      addresses: [
        {
          first_name: 'New',
          last_name: 'Customer',
          address1: '789 Customer Ave',
          city: 'Los Angeles',
          province: 'CA',
          zip: '90210',
          country: 'US',
        },
      ],
    };

    it('should process customers/create webhook', async () => {
      const request = {
        headers: {
          'x-shopify-topic': 'customers/create',
          'x-shopify-hmac-sha256': 'valid-signature',
        },
        body: JSON.stringify(customerPayload),
        rawBody: JSON.stringify(customerPayload),
      };

      const result = await webhookRouter.handleRequest(request);

      expect(result.success).toBe(true);
      expect(ShopifyErrorHandler.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('customers/create'),
        expect.objectContaining({
          customerId: 'customer_789',
          customerEmail: 'webhook-new-customer@example.com',
        }),
      );
    });
  });

  describe('Inventory Webhook Processing', () => {
    const inventoryPayload = {
      inventory_item_id: 'inventory_456',
      location_id: 'location_123',
      available: 25,
      updated_at: new Date().toISOString(),
    };

    it('should process inventory_levels/update webhook', async () => {
      const request = {
        headers: {
          'x-shopify-topic': 'inventory_levels/update',
          'x-shopify-hmac-sha256': 'valid-signature',
        },
        body: JSON.stringify(inventoryPayload),
        rawBody: JSON.stringify(inventoryPayload),
      };

      const result = await webhookRouter.handleRequest(request);

      expect(result.success).toBe(true);
      expect(ShopifyErrorHandler.logInfo).toHaveBeenCalledWith(
        expect.stringContaining('inventory_levels/update'),
        expect.objectContaining({
          inventoryItemId: 'inventory_456',
          locationId: 'location_123',
          available: 25,
        }),
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON payloads', async () => {
      const request = {
        headers: {
          'x-shopify-topic': 'orders/create',
          'x-shopify-hmac-sha256': 'valid-signature',
        },
        body: 'invalid-json-{',
        rawBody: 'invalid-json-{',
      };

      const result = await webhookRouter.handleRequest(request);

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.error).toContain('Invalid JSON payload');
    });

    it('should handle unsupported webhook topics', async () => {
      const request = {
        headers: {
          'x-shopify-topic': 'unsupported/topic',
          'x-shopify-hmac-sha256': 'valid-signature',
        },
        body: '{}',
        rawBody: '{}',
      };

      const result = await webhookRouter.handleRequest(request);

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.error).toContain('Unsupported webhook topic');
    });

    it('should handle processing errors gracefully', async () => {
      // Mock an error during webhook processing
      const originalLogInfo = ShopifyErrorHandler.logInfo;
      vi.mocked(ShopifyErrorHandler.logInfo).mockImplementation(() => {
        throw new Error('Processing failed');
      });

      const request = {
        headers: {
          'x-shopify-topic': 'orders/create',
          'x-shopify-hmac-sha256': 'valid-signature',
        },
        body: JSON.stringify({ id: 'test' }),
        rawBody: JSON.stringify({ id: 'test' }),
      };

      const result = await webhookRouter.handleRequest(request);

      expect(result.success).toBe(false);
      expect(result.status).toBe(500);
      expect(ShopifyErrorHandler.logError).toHaveBeenCalledWith(
        expect.stringContaining('Webhook processing failed'),
        expect.any(Error),
        expect.any(Object),
      );

      // Restore original mock
      vi.mocked(ShopifyErrorHandler.logInfo).mockImplementation(originalLogInfo);
    });
  });

  describe('Idempotency', () => {
    it('should handle duplicate webhook deliveries', async () => {
      const duplicatePayload = {
        id: 'duplicate_order_123',
        email: 'duplicate@example.com',
        financial_status: 'paid',
      };

      const request = {
        headers: {
          'x-shopify-topic': 'orders/create',
          'x-shopify-hmac-sha256': 'valid-signature',
          'x-shopify-webhook-id': 'webhook-delivery-123',
        },
        body: JSON.stringify(duplicatePayload),
        rawBody: JSON.stringify(duplicatePayload),
      };

      // First delivery
      const result1 = await webhookRouter.handleRequest(request);

      expect(result1.success).toBe(true);

      // Duplicate delivery (same webhook-id)
      const result2 = await webhookRouter.handleRequest(request);

      expect(result2.success).toBe(true);
      expect(result2.message).toContain('already processed');
    });
  });

  describe('Rate Limiting', () => {
    it('should handle high-frequency webhooks gracefully', async () => {
      const requests = Array.from({ length: 10 }, (_, i) => ({
        headers: {
          'x-shopify-topic': 'orders/create',
          'x-shopify-hmac-sha256': 'valid-signature',
          'x-shopify-webhook-id': `webhook-${i}`,
        },
        body: JSON.stringify({ id: `order_${i}` }),
        rawBody: JSON.stringify({ id: `order_${i}` }),
      }));

      const promises = requests.map(req => webhookRouter.handleRequest(req));
      const results = await Promise.all(promises);

      // All should succeed, but may be rate-limited internally
      expect(results.every(r => r.success)).toBe(true);
      expect(results).toHaveLength(10);
    });
  });

  describe('Configuration Edge Cases', () => {
    it('should handle missing webhook secret', () => {
      const configWithoutSecret = {
        storeDomain: 'test-store',
        adminAccessToken: 'test-token',
      };

      expect(() => new WebhookRouter(configWithoutSecret as any))
        .toThrow('Webhook configuration is required');
    });

    it('should handle empty webhook secret', () => {
      const configWithEmptySecret = {
        storeDomain: 'test-store',
        adminAccessToken: 'test-token',
        webhook: {
          secret: '',
          endpoint: '/webhooks',
        },
      };

      expect(() => new WebhookRouter(configWithEmptySecret as any))
        .toThrow('Webhook secret is required');
    });
  });
});
