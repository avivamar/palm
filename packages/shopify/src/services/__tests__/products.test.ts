/**
 * ProductService 单元测试
 */

import type { ShopifyClient } from '../../core/client';
import type { RolittProduct } from '../../types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ShopifyErrorHandler } from '../../core/error-handler';
import { ProductService } from '../products';

// Mock dependencies
vi.mock('../../core/client');
vi.mock('../../core/error-handler', () => ({
  ShopifyErrorHandler: {
    createRetryableApiCall: vi.fn(),
    logInfo: vi.fn(),
    logError: vi.fn(),
    logWarning: vi.fn(),
  },
}));

describe('ProductService', () => {
  let productService: ProductService;
  let mockClient: any;
  let mockRetryableCall: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockClient = {
      request: vi.fn(),
    };

    mockRetryableCall = vi.mocked(ShopifyErrorHandler.createRetryableApiCall);

    productService = new ProductService(mockClient as ShopifyClient);
  });

  describe('syncProduct', () => {
    const mockRolittProduct: RolittProduct = {
      id: 'rolitt-123',
      name: 'AI Companion Pro',
      description: 'Advanced AI companion product',
      price: 299.99,
      sku: 'AI-COMP-PRO-001',
      category: 'AI Technology',
      status: 'active',
      images: ['https://example.com/image1.jpg'],
      variants: [
        {
          title: 'Standard',
          price: 299.99,
          sku: 'AI-COMP-PRO-001-STD',
          color: 'Blue',
          inventory: 10,
        },
      ],
      tags: ['premium', 'ai'],
      requiresShipping: true,
      trackInventory: true,
    };

    it('should create new product when not found', async () => {
      const expectedResponse = {
        product: {
          id: 'shopify-456',
          title: 'AI Companion Pro',
        },
      };

      mockRetryableCall.mockImplementation(async (operation: () => Promise<any>) => {
        // Mock findProductBySku to return null (not found)
        mockClient.request
          .mockResolvedValueOnce({ products: [] }) // findProductBySku call
          .mockResolvedValueOnce(expectedResponse); // create product call

        return await operation();
      });

      const result = await productService.syncProduct(mockRolittProduct);

      expect(result.success).toBe(true);
      expect(result.syncedCount).toBe(1);
      expect(result.failedCount).toBe(0);
      expect(result.shopifyProductIds).toEqual(['shopify-456']);
    });

    it('should update existing product when found', async () => {
      const existingProduct = {
        id: 'existing-123',
        title: 'AI Companion Pro',
        variants: [{ sku: 'AI-COMP-PRO-001' }],
      };

      const expectedResponse = {
        product: {
          id: 'existing-123',
          title: 'AI Companion Pro Updated',
        },
      };

      mockRetryableCall.mockImplementation(async (operation: () => Promise<any>) => {
        // Mock findProductBySku to return existing product
        mockClient.request
          .mockResolvedValueOnce({ products: [existingProduct] }) // findProductBySku call
          .mockResolvedValueOnce(expectedResponse); // update product call

        return await operation();
      });

      const result = await productService.syncProduct(mockRolittProduct);

      expect(result.success).toBe(true);
      expect(result.shopifyProductIds).toEqual(['existing-123']);
    });

    it('should handle sync errors', async () => {
      const error = new Error('Product sync failed');

      mockRetryableCall.mockRejectedValue(error);

      const result = await productService.syncProduct(mockRolittProduct);

      expect(result.success).toBe(false);
      expect(result.syncedCount).toBe(0);
      expect(result.failedCount).toBe(1);
      expect(result.errors).toContain('Product sync failed');
    });
  });

  describe('syncProducts', () => {
    const mockProducts: RolittProduct[] = [
      {
        id: 'prod1',
        name: 'Product 1',
        price: 99.99,
        status: 'active',
      },
      {
        id: 'prod2',
        name: 'Product 2',
        price: 149.99,
        status: 'active',
      },
    ];

    it('should sync multiple products successfully', async () => {
      // Mock individual product sync calls
      vi.spyOn(productService, 'syncProduct')
        .mockResolvedValueOnce({
          success: true,
          syncedCount: 1,
          failedCount: 0,
          errors: [],
          shopifyProductIds: ['shopify-1'],
        })
        .mockResolvedValueOnce({
          success: true,
          syncedCount: 1,
          failedCount: 0,
          errors: [],
          shopifyProductIds: ['shopify-2'],
        });

      const result = await productService.syncProducts(mockProducts);

      expect(result.success).toBe(true);
      expect(result.syncedCount).toBe(2);
      expect(result.failedCount).toBe(0);
      expect(result.shopifyProductIds).toEqual(['shopify-1', 'shopify-2']);
    });

    it('should handle partial failures', async () => {
      vi.spyOn(productService, 'syncProduct')
        .mockResolvedValueOnce({
          success: true,
          syncedCount: 1,
          failedCount: 0,
          errors: [],
          shopifyProductIds: ['shopify-1'],
        })
        .mockResolvedValueOnce({
          success: false,
          syncedCount: 0,
          failedCount: 1,
          errors: ['Product 2 sync failed'],
          shopifyProductIds: [],
        });

      const result = await productService.syncProducts(mockProducts);

      expect(result.success).toBe(false);
      expect(result.syncedCount).toBe(1);
      expect(result.failedCount).toBe(1);
      expect(result.errors).toContain('Product 2 sync failed');
    });
  });

  describe('listProducts', () => {
    it('should list products successfully', async () => {
      const mockProductsResponse = {
        products: [
          { id: '1', title: 'Product 1' },
          { id: '2', title: 'Product 2' },
        ],
      };

      mockRetryableCall.mockResolvedValue(mockProductsResponse.products);

      const result = await productService.listProducts();

      expect(result).toEqual(mockProductsResponse.products);
      expect(mockRetryableCall).toHaveBeenCalledWith(
        expect.any(Function),
        'ListProducts',
        { limit: 250, pageInfo: undefined },
      );
    });

    it('should handle pagination', async () => {
      mockRetryableCall.mockResolvedValue([]);

      await productService.listProducts(50, 'next_page_token');

      expect(mockRetryableCall).toHaveBeenCalledWith(
        expect.any(Function),
        'ListProducts',
        { limit: 50, pageInfo: 'next_page_token' },
      );
    });
  });
});
