/**
 * Performance and Load Testing
 * 测试系统在高负载和并发场景下的表现
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestConfig } from '../config';
import { ShopifyIntegration } from '../core/integration';

// Mock fetch for performance tests
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock console to reduce noise in performance tests
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('Performance and Load Tests', () => {
  let integration: ShopifyIntegration;
  const mockConfig = createTestConfig({
    storeDomain: 'performance-test',
    adminAccessToken: 'perf_token_123',
    webhook: {
      secret: 'perf_webhook_secret',
      endpoint: '/api/webhooks/shopify',
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    integration = new ShopifyIntegration(mockConfig);

    // Setup default successful mock responses
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        order: { id: 'test_order', order_number: 'TEST001' },
        product: { id: 'test_product', title: 'Test Product' },
      }),
    });
  });

  describe('Concurrent Order Processing', () => {
    const generateMockOrder = (id: number) => ({
      id: `order_${id}`,
      email: `customer${id}@example.com`,
      total: (Math.random() * 1000 + 50).toFixed(2),
      currency: 'USD',
      items: [
        {
          name: `Product ${id}`,
          quantity: '1',
          price: (Math.random() * 500 + 25).toFixed(2),
          sku: `PROD-${id}`,
        },
      ],
      firstName: `Customer${id}`,
      lastName: 'Test',
    });

    it('should handle 10 concurrent order syncs', async () => {
      const orders = Array.from({ length: 10 }, (_, i) => generateMockOrder(i));
      const orderService = integration.getOrderService();

      const startTime = performance.now();
      const promises = orders.map(order => orderService.syncOrder(order));
      const results = await Promise.all(promises);
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(results).toHaveLength(10);
      expect(results.every(r => r.success)).toBe(true);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(mockFetch).toHaveBeenCalledTimes(10);
    });

    it('should handle 50 concurrent order syncs with rate limiting', async () => {
      const orders = Array.from({ length: 50 }, (_, i) => generateMockOrder(i));
      const orderService = integration.getOrderService();

      const startTime = performance.now();
      const promises = orders.map(order => orderService.syncOrder(order));
      const results = await Promise.all(promises);
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(results).toHaveLength(50);
      expect(results.every(r => r.success)).toBe(true);
      expect(duration).toBeLessThan(15000); // Should complete within 15 seconds
      expect(mockFetch).toHaveBeenCalledTimes(60); // 10 from previous test + 50 from this test
    });

    it('should handle memory efficiently with large batch processing', async () => {
      const batchSize = 100;
      const orders = Array.from({ length: batchSize }, (_, i) => generateMockOrder(i));
      const orderService = integration.getOrderService();

      const initialMemory = process.memoryUsage().heapUsed;

      // Process in smaller chunks to simulate real-world batching
      const chunkSize = 10;
      const chunks = [];
      for (let i = 0; i < orders.length; i += chunkSize) {
        chunks.push(orders.slice(i, i + chunkSize));
      }

      const startTime = performance.now();
      for (const chunk of chunks) {
        const promises = chunk.map(order => orderService.syncOrder(order));
        await Promise.all(promises);
      }
      const endTime = performance.now();

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      const duration = endTime - startTime;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
    });
  });

  describe('API Rate Limiting and Resilience', () => {
    it('should handle API rate limiting gracefully', async () => {
      // Mock rate limit response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Map([['Retry-After', '2']]),
        json: () => Promise.resolve({ error: 'Rate limit exceeded' }),
      }).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ order: { id: 'test_order' } }),
      });

      const orderService = integration.getOrderService();
      const order = {
        id: 'rate_limit_test',
        email: 'test@example.com',
        total: '100.00',
        currency: 'USD',
        items: [],
        firstName: 'Test',
        lastName: 'User',
      };

      const startTime = performance.now();
      const result = await orderService.syncOrder(order);
      const endTime = performance.now();

      expect(result.success).toBe(true);
      expect(endTime - startTime).toBeGreaterThan(2000); // Should wait for retry
      expect(mockFetch).toHaveBeenCalledTimes(2); // Initial call + retry
    });

    it('should timeout appropriately for slow API responses', async () => {
      // Mock slow response
      mockFetch.mockImplementationOnce(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ order: { id: 'slow_order' } }),
          }), 10000), // 10 second delay
        ),
      );

      const orderService = integration.getOrderService();
      const order = {
        id: 'timeout_test',
        email: 'test@example.com',
        total: '100.00',
        currency: 'USD',
        items: [],
        firstName: 'Test',
        lastName: 'User',
      };

      const startTime = performance.now();
      const result = await orderService.syncOrder(order);
      const endTime = performance.now();

      // Should timeout before 10 seconds
      expect(endTime - startTime).toBeLessThan(8000);
      expect(result.success).toBe(false);
    });
  });
});
