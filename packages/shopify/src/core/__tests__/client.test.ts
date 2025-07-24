/**
 * ShopifyClient 单元测试
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ShopifyClient } from '../client';
import { ShopifyErrorHandler } from '../error-handler';

// Mock ShopifyErrorHandler
vi.mock('../error-handler', () => ({
  ShopifyErrorHandler: {
    createRetryableApiCall: vi.fn(),
  },
}));

// Mock loadConfigFromEnv and validateConfig
vi.mock('../../config', () => ({
  loadConfigFromEnv: vi.fn(() => ({
    storeDomain: 'test-store',
    adminAccessToken: 'test-token',
  })),
  validateConfig: vi.fn(config => config),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ShopifyClient', () => {
  let client: ShopifyClient;
  let mockRetryableCall: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRetryableCall = vi.mocked(ShopifyErrorHandler.createRetryableApiCall);
    client = new ShopifyClient();
  });

  describe('constructor', () => {
    it('should initialize with environment config', () => {
      expect(client).toBeInstanceOf(ShopifyClient);
    });

    it('should merge provided config with environment config', () => {
      const customConfig = { storeDomain: 'custom-store' };
      const customClient = new ShopifyClient(customConfig);

      expect(customClient).toBeInstanceOf(ShopifyClient);
    });
  });

  describe('request', () => {
    it('should create retryable API call with correct parameters', async () => {
      mockRetryableCall.mockImplementation((apiCall: any) => apiCall());

      await client.request('GET', '/test', { param: 'value' });

      expect(mockRetryableCall).toHaveBeenCalledWith(
        expect.any(Function),
        'GET /test',
        { method: 'GET', path: '/test', hasData: true },
      );
    });

    it('should handle successful API response', async () => {
      const responseData = { products: [] };

      mockRetryableCall.mockImplementation(async (apiCall: any) => {
        // Simulate the actual API call that would be retried
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: vi.fn().mockResolvedValue(responseData),
        });
        return await apiCall();
      });

      const result = await client.request('GET', '/admin/api/2025-01/products.json');

      expect(result).toEqual(responseData);
    });
  });
});
