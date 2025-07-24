/**
 * OrderService 单元测试
 */

import type { ShopifyClient } from '../../core/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ShopifyErrorHandler } from '../../core/error-handler';
import { OrderService } from '../orders';

// Mock dependencies
vi.mock('../../core/client');
vi.mock('../../core/error-handler', () => ({
  ShopifyErrorHandler: {
    createRetryableApiCall: vi.fn(),
    handleSyncError: vi.fn(),
  },
}));

describe('OrderService', () => {
  let orderService: OrderService;
  let mockClient: any;
  let mockRetryableCall: any;
  let mockHandleSyncError: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      request: vi.fn(),
    };

    mockRetryableCall = vi.mocked(ShopifyErrorHandler.createRetryableApiCall);
    mockHandleSyncError = vi.mocked(ShopifyErrorHandler.handleSyncError);

    orderService = new OrderService(mockClient as ShopifyClient);
  });

  describe('syncOrder', () => {
    const mockOrderData = {
      id: 'order123',
      email: 'test@example.com',
      total: '99.99',
      items: [
        {
          name: 'AI Companion',
          quantity: '1',
          price: '99.99',
          sku: 'AI-COMP-001',
        },
      ],
      firstName: 'John',
      lastName: 'Doe',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'CA',
        zip: '12345',
        country: 'US',
      },
    };

    it('should successfully sync order', async () => {
      const expectedResponse = {
        order: {
          id: 'shopify123',
          order_number: 'SP001',
        },
      };

      mockRetryableCall.mockImplementation(async (operation: () => Promise<any>) => {
        mockClient.request.mockResolvedValue(expectedResponse);
        return await operation();
      });

      const result = await orderService.syncOrder(mockOrderData);

      expect(result.success).toBe(true);
      expect(result.shopifyOrderId).toBe('shopify123');
      expect(result.shopifyOrderNumber).toBe('SP001');
      expect(result.orderId).toBe('order123');
    });

    it('should handle sync errors', async () => {
      const error = new Error('Sync failed');
      const errorResult = {
        success: false,
        error: 'Sync failed',
        syncType: 'OrderSync',
        itemId: 'order123',
      };

      mockRetryableCall.mockRejectedValue(error);
      mockHandleSyncError.mockReturnValue(errorResult);

      const result = await orderService.syncOrder(mockOrderData);

      expect(result).toEqual(errorResult);
      expect(mockHandleSyncError).toHaveBeenCalledWith(error, 'OrderSync', 'order123');
    });

    it('should call createRetryableApiCall with correct parameters', async () => {
      mockRetryableCall.mockResolvedValue({
        success: true,
        shopifyOrderId: 'test',
        shopifyOrderNumber: 'test',
        orderId: 'order123',
      });

      await orderService.syncOrder(mockOrderData);

      expect(mockRetryableCall).toHaveBeenCalledWith(
        expect.any(Function),
        'OrderSync',
        { orderId: 'order123', email: 'test@example.com' },
      );
    });
  });
});
