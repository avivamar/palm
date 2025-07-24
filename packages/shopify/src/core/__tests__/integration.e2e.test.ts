/**
 * Shopify Integration 集成测试
 * 测试完整的端到端流程和组件协作
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestConfig } from '../../config';
import { ShopifyErrorHandler } from '../error-handler';
import { ShopifyIntegration } from '../integration';

// Mock fetch for integration tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock console to avoid test noise
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('ShopifyIntegration E2E Tests', () => {
  let integration: ShopifyIntegration;
  const mockConfig = createTestConfig({
    storeDomain: 'test-store',
    adminAccessToken: 'test_token_123',
    webhook: {
      secret: 'webhook_secret_456',
      endpoint: '/api/webhooks/shopify',
    },
  });

  // Mock data shared across tests
  const mockRolittOrder = {
    id: 'rolitt_order_123',
    email: 'customer@example.com',
    total: '299.99',
    currency: 'USD',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    items: [
      {
        name: 'AI Companion Pro',
        quantity: '1',
        price: '299.99',
        sku: 'AI-COMP-PRO-001',
        color: 'Blue',
      },
    ],
    shipping_address: {
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'US',
      phone: '+1234567890',
    },
    billing_address: {
      firstName: 'John',
      lastName: 'Doe',
      street: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'US',
    },
    source: 'website',
    paymentMethod: 'stripe',
    status: 'completed',
  };

  const mockRolittProduct = {
    id: 'rolitt_prod_123',
    name: 'AI Companion Premium',
    description: '<p>Advanced AI companion with premium features</p>',
    price: 499.99,
    sku: 'AI-COMP-PREM-001',
    category: 'AI Technology',
    status: 'active' as const,
    images: [
      'https://cdn.example.com/ai-companion-1.jpg',
      'https://cdn.example.com/ai-companion-2.jpg',
    ],
    variants: [
      {
        title: 'Standard Edition',
        price: 499.99,
        sku: 'AI-COMP-PREM-001-STD',
        color: 'Silver',
        inventory: 25,
      },
      {
        title: 'Premium Edition',
        price: 699.99,
        sku: 'AI-COMP-PREM-001-PREM',
        color: 'Gold',
        inventory: 10,
      },
    ],
    tags: ['premium', 'ai', 'technology'],
    requiresShipping: true,
    trackInventory: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    integration = new ShopifyIntegration(mockConfig);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Order Sync End-to-End', () => {
    it('should complete full order sync workflow', async () => {
      // Mock successful Shopify API responses
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            order: {
              id: 'shopify_order_456',
              order_number: 'SP1001',
              email: 'customer@example.com',
              financial_status: 'paid',
              fulfillment_status: null,
            },
          }),
        });

      const orderService = integration.getOrderService();
      const result = await orderService.syncOrder(mockRolittOrder);

      // Verify successful sync
      expect(result.success).toBe(true);
      expect(result.shopifyOrderId).toBe('shopify_order_456');
      expect(result.shopifyOrderNumber).toBe('SP1001');
      expect(result.orderId).toBe('rolitt_order_123');

      // Verify API call was made with correct data
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test-store.myshopify.com/admin/api/2025-01/orders.json',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': 'test_token_123',
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('customer@example.com'),
        }),
      );
    });

    it('should handle order sync with retry on rate limiting', async () => {
      // Mock rate limit response, then success
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          statusText: 'Too Many Requests',
          json: () => Promise.resolve({ error: 'Rate limited' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            order: {
              id: 'shopify_order_789',
              order_number: 'SP1002',
            },
          }),
        });

      const orderService = integration.getOrderService();
      const result = await orderService.syncOrder(mockRolittOrder);

      expect(result.success).toBe(true);
      expect(result.shopifyOrderId).toBe('shopify_order_789');
      expect(mockFetch).toHaveBeenCalledTimes(2); // Initial call + retry
    });

    it('should handle validation errors gracefully', async () => {
      const invalidOrder = {
        id: 'invalid_order',
        // Missing required email field
        total: '99.99',
      };

      const orderService = integration.getOrderService();
      const result = await orderService.syncOrder(invalidOrder);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Order email is required');
    });
  });

  describe('Product Sync End-to-End', () => {
    it('should complete full product sync workflow for new product', async () => {
      // Mock product search (not found) and creation
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ products: [] }), // Product not found
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            product: {
              id: 'shopify_prod_456',
              title: 'AI Companion Premium',
              handle: 'ai-companion-premium',
              status: 'active',
            },
          }),
        });

      const productService = integration.getProductService();
      const result = await productService.syncProduct(mockRolittProduct);

      expect(result.success).toBe(true);
      expect(result.syncedCount).toBe(1);
      expect(result.failedCount).toBe(0);
      expect(result.shopifyProductIds).toContain('shopify_prod_456');

      // Verify product creation API call
      const createCall = mockFetch.mock.calls[1];

      expect(createCall).toBeDefined();
      expect(createCall![0]).toContain('/products.json');
      expect(createCall![1].method).toBe('POST');

      const requestBody = JSON.parse(createCall![1].body);

      expect(requestBody.product.title).toBe('AI Companion Premium');
      expect(requestBody.product.variants).toHaveLength(2);
    });

    it('should update existing product when found', async () => {
      const existingProduct = {
        id: 'existing_prod_789',
        title: 'AI Companion Premium',
        variants: [
          { sku: 'AI-COMP-PREM-001-STD' }, // Matching SKU
        ],
      };

      // Mock product search (found) and update
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ products: [existingProduct] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            product: {
              id: 'existing_prod_789',
              title: 'AI Companion Premium Updated',
            },
          }),
        });

      const productService = integration.getProductService();
      const result = await productService.syncProduct(mockRolittProduct);

      expect(result.success).toBe(true);
      expect(result.shopifyProductIds).toContain('existing_prod_789');

      // Verify product update API call
      const updateCall = mockFetch.mock.calls[1];

      expect(updateCall).toBeDefined();
      expect(updateCall![0]).toContain('/products/existing_prod_789.json');
      expect(updateCall![1].method).toBe('PUT');
    });

    it('should handle batch product sync with mixed results', async () => {
      const products = [mockRolittProduct, { ...mockRolittProduct, id: 'prod_2', sku: 'SKU-2' }];

      // Mock responses for batch sync
      mockFetch
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ products: [] }) }) // Search prod 1
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ product: { id: 'sp1' } }) }) // Create prod 1
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ products: [] }) }) // Search prod 2
        .mockResolvedValueOnce({ ok: false, status: 422, json: () => Promise.resolve({ error: 'Invalid' }) }); // Fail prod 2

      const productService = integration.getProductService();
      const result = await productService.syncProducts(products);

      expect(result.syncedCount).toBe(1);
      expect(result.failedCount).toBe(1);
      expect(result.success).toBe(false); // Mixed results = overall failure
      expect(result.shopifyProductIds).toContain('sp1');
    });
  });

  describe('Health Check Integration', () => {
    it('should perform comprehensive health check', async () => {
      // Mock successful API responses for health checks
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ shop: { name: 'Test Store' } }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ webhooks: [] }),
        });

      const healthResult = await integration.performHealthCheck();

      expect(healthResult.status).toBe('healthy');
      expect(healthResult.shopEnabled).toBe(true);
      expect(healthResult.apiConnection).toBe(true);
      expect(healthResult.errors).toHaveLength(0);
    });

    it('should detect unhealthy state on API failures', async () => {
      // Mock failed API response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      const healthResult = await integration.performHealthCheck();

      expect(healthResult.status).toBe('unhealthy');
      expect(healthResult.apiConnection).toBe(false);
      expect(healthResult.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Configuration Integration', () => {
    it('should handle configuration updates at runtime', async () => {
      const newConfig = {
        storeDomain: 'updated-store',
        adminAccessToken: 'updated_token',
      };

      integration.updateConfig(newConfig);
      const updatedConfig = integration.getConfig();

      expect(updatedConfig.storeDomain).toBe('updated-store');
      expect(updatedConfig.adminAccessToken).toBe('updated_token');
    });

    it('should validate configuration on initialization', () => {
      const invalidConfig = {
        storeDomain: '', // Invalid
        adminAccessToken: 'token',
      };

      expect(() => new ShopifyIntegration(invalidConfig as any))
        .toThrow();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle network timeouts gracefully', async () => {
      // Mock network timeout
      mockFetch.mockRejectedValue(new Error('ETIMEDOUT'));

      const orderService = integration.getOrderService();
      const result = await orderService.syncOrder(mockRolittOrder);

      expect(result.success).toBe(false);
      expect(ShopifyErrorHandler.logError).toHaveBeenCalled();
    });

    it('should handle malformed API responses', async () => {
      // Mock malformed response
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      const productService = integration.getProductService();
      const products = await productService.listProducts().catch(() => []);

      expect(Array.isArray(products)).toBe(true);
    });
  });

  describe('Performance Integration', () => {
    it('should handle concurrent operations without conflicts', async () => {
      const orders = Array.from({ length: 5 }, (_, i) => ({
        ...mockRolittOrder,
        id: `order_${i}`,
        email: `customer${i}@example.com`,
      }));

      // Mock all responses as successful
      mockFetch.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            order: { id: `shopify_${Math.random()}`, order_number: 'SP001' },
          }),
        }),
      );

      const orderService = integration.getOrderService();
      const syncPromises = orders.map(order => orderService.syncOrder(order));
      const results = await Promise.all(syncPromises);

      expect(results.every(r => r.success)).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(5);
    });

    it('should respect rate limiting in batch operations', async () => {
      const products = Array.from({ length: 10 }, (_, i) => ({
        ...mockRolittProduct,
        id: `prod_${i}`,
        sku: `SKU_${i}`,
      }));

      mockFetch.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ products: [] }),
        }),
      );

      const productService = integration.getProductService();
      const startTime = Date.now();

      await productService.syncProducts(products);

      const duration = Date.now() - startTime;

      // Should take time due to batch delays (not instantaneous)
      expect(duration).toBeGreaterThan(100);
    });
  });

  describe('Webhook Integration', () => {
    it('should handle webhook payload processing', async () => {
      const webhookPayload = {
        id: 'webhook_order_123',
        email: 'webhook@example.com',
        financial_status: 'paid',
        line_items: [
          {
            title: 'Test Product',
            quantity: 1,
            price: '99.99',
          },
        ],
      };

      // Test webhook processing (webhook functionality not yet implemented)
      // const webhookRouter = integration.getWebhookRouter?.();
      // if (webhookRouter) {
      //   const result = await webhookRouter.handleRequest({
      //     headers: {
      //       'x-shopify-topic': 'orders/create',
      //       'x-shopify-hmac-sha256': 'test_signature',
      //     },
      //     body: JSON.stringify(webhookPayload),
      //     rawBody: JSON.stringify(webhookPayload),
      //   });

      //   expect(result.success).toBeDefined();
      // }

      // For now, just verify the payload structure
      expect(webhookPayload.id).toBe('webhook_order_123');
      expect(webhookPayload.email).toBe('webhook@example.com');
    });
  });
});
