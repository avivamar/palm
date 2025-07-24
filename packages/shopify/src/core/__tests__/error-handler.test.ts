/**
 * ShopifyErrorHandler 单元测试
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ShopifyErrorHandler } from '../error-handler';

// Mock console 方法
const consoleSpy = {
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
};

describe('ShopifyErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('classifyError', () => {
    it('should classify 401 as AUTHENTICATION error', () => {
      const error = { status: 401 };
      const classification = ShopifyErrorHandler.classifyError(error);

      expect(classification.type).toBe('AUTHENTICATION');
      expect(classification.severity).toBe('HIGH');
      expect(classification.retryable).toBe(false);
      expect(classification.statusCode).toBe(401);
    });

    it('should classify 403 as AUTHORIZATION error', () => {
      const error = { statusCode: 403 };
      const classification = ShopifyErrorHandler.classifyError(error);

      expect(classification.type).toBe('AUTHORIZATION');
      expect(classification.severity).toBe('HIGH');
      expect(classification.retryable).toBe(false);
      expect(classification.statusCode).toBe(403);
    });

    it('should classify 422 as VALIDATION error', () => {
      const error = { status: 422 };
      const classification = ShopifyErrorHandler.classifyError(error);

      expect(classification.type).toBe('VALIDATION');
      expect(classification.severity).toBe('MEDIUM');
      expect(classification.retryable).toBe(false);
    });

    it('should classify 429 as RATE_LIMIT error', () => {
      const error = { status: 429 };
      const classification = ShopifyErrorHandler.classifyError(error);

      expect(classification.type).toBe('RATE_LIMIT');
      expect(classification.severity).toBe('MEDIUM');
      expect(classification.retryable).toBe(true);
    });

    it('should classify 500 as SERVER_ERROR', () => {
      const error = { status: 500 };
      const classification = ShopifyErrorHandler.classifyError(error);

      expect(classification.type).toBe('SERVER_ERROR');
      expect(classification.severity).toBe('HIGH');
      expect(classification.retryable).toBe(true);
    });

    it('should classify network errors as NETWORK type', () => {
      const error = { code: 'ECONNREFUSED' };
      const classification = ShopifyErrorHandler.classifyError(error);

      expect(classification.type).toBe('NETWORK');
      expect(classification.severity).toBe('HIGH');
      expect(classification.retryable).toBe(true);
    });

    it('should classify unknown errors as UNKNOWN type', () => {
      const error = new Error('Unknown error');
      const classification = ShopifyErrorHandler.classifyError(error);

      expect(classification.type).toBe('UNKNOWN');
      expect(classification.severity).toBe('MEDIUM');
      expect(classification.retryable).toBe(false);
    });
  });

  describe('withRetry', () => {
    it('should succeed on first attempt', async () => {
      const operation = vi.fn().mockResolvedValue('success');
      const context = { operation: 'testOp', timestamp: new Date().toISOString() };

      const result = await ShopifyErrorHandler.withRetry(operation, context);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry retryable errors', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce({ status: 500 })
        .mockResolvedValue('success');

      const context = { operation: 'testOp', timestamp: new Date().toISOString() };

      const result = await ShopifyErrorHandler.withRetry(operation, context, { maxRetries: 1, baseDelay: 10 });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry non-retryable errors', async () => {
      const operation = vi.fn().mockRejectedValue({ status: 401 });
      const context = { operation: 'testOp', timestamp: new Date().toISOString() };

      await expect(ShopifyErrorHandler.withRetry(operation, context))
        .rejects
        .toEqual({ status: 401 });

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should respect maxRetries limit', async () => {
      const operation = vi.fn().mockRejectedValue({ status: 500 });
      const context = { operation: 'testOp', timestamp: new Date().toISOString() };

      await expect(ShopifyErrorHandler.withRetry(operation, context, { maxRetries: 2, baseDelay: 1 }))
        .rejects
        .toEqual({ status: 500 });

      expect(operation).toHaveBeenCalledTimes(3); // initial + 2 retries
    });
  });

  describe('handleApiError', () => {
    it('should handle Error instances', () => {
      const error = new Error('API failed');
      const result = ShopifyErrorHandler.handleApiError(error, 'testContext');

      expect(result.success).toBe(false);
      expect(result.error).toBe('API failed');
      expect(result.context).toBe('testContext');
      expect(result.classification).toBeDefined();
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('should handle non-Error objects', () => {
      const error = 'String error';
      const result = ShopifyErrorHandler.handleApiError(error, 'testContext');

      expect(result.success).toBe(false);
      expect(result.error).toBe('未知错误');
      expect(result.context).toBe('testContext');
    });
  });

  describe('handleSyncError', () => {
    it('should handle sync errors with itemId', () => {
      const error = new Error('Sync failed');
      const result = ShopifyErrorHandler.handleSyncError(error, 'ProductSync', 'item123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sync failed');
      expect(result.syncType).toBe('ProductSync');
      expect(result.itemId).toBe('item123');
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('logging methods', () => {
    it('should log errors with structured data', () => {
      const error = new Error('Test error');
      const context = { test: 'data' };

      ShopifyErrorHandler.logError('Test message', error, context);

      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[Shopify] ERROR: Test message',
        expect.objectContaining({
          message: 'Test message',
          error: expect.objectContaining({
            name: 'Error',
            message: 'Test error',
            stack: expect.any(String),
          }),
          context,
          timestamp: expect.any(String),
        }),
      );
    });

    it('should log warnings with timestamp', () => {
      const context = { test: 'data' };

      ShopifyErrorHandler.logWarning('Test warning', context);

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        '[Shopify] WARNING: Test warning',
        expect.objectContaining({
          message: 'Test warning',
          context,
          timestamp: expect.any(String),
        }),
      );
    });

    it('should log info with timestamp', () => {
      const context = { test: 'data' };

      ShopifyErrorHandler.logInfo('Test info', context);

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '[Shopify] INFO: Test info',
        expect.objectContaining({
          message: 'Test info',
          context,
          timestamp: expect.any(String),
        }),
      );
    });
  });

  describe('createRetryableApiCall', () => {
    it('should create retryable API call with context', async () => {
      const apiCall = vi.fn().mockResolvedValue('api success');

      const result = await ShopifyErrorHandler.createRetryableApiCall(
        apiCall,
        'testOperation',
        { meta: 'data' },
      );

      expect(result).toBe('api success');
      expect(apiCall).toHaveBeenCalledTimes(1);
    });
  });
});
