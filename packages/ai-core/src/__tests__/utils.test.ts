/**
 * Utility Functions Tests
 * Testing cache, rate limiting, and logging utilities
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AILogger, MemoryCacheManager, MemoryRateLimiter } from '../utils';

describe('MemoryCacheManager', () => {
  let cacheManager: MemoryCacheManager;

  beforeEach(() => {
    cacheManager = new MemoryCacheManager();
  });

  describe('basic operations', () => {
    it('should set and get values', async () => {
      await cacheManager.set('test-key', 'test-value', 60);
      const value = await cacheManager.get('test-key');

      expect(value).toBe('test-value');
    });

    it('should return null for non-existent keys', async () => {
      const value = await cacheManager.get('non-existent');

      expect(value).toBeNull();
    });

    it('should delete values', async () => {
      await cacheManager.set('test-key', 'test-value', 60);
      await cacheManager.delete('test-key');
      const value = await cacheManager.get('test-key');

      expect(value).toBeNull();
    });

    it('should clear all values', async () => {
      await cacheManager.set('key1', 'value1', 60);
      await cacheManager.set('key2', 'value2', 60);
      await cacheManager.clear();

      const value1 = await cacheManager.get('key1');
      const value2 = await cacheManager.get('key2');

      expect(value1).toBeNull();
      expect(value2).toBeNull();
    });
  });

  describe('expiration', () => {
    it('should expire values after TTL', async () => {
      await cacheManager.set('expire-key', 'expire-value', 0.001); // 1ms TTL

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 10));

      const value = await cacheManager.get('expire-key');

      expect(value).toBeNull();
    });

    it('should return valid values before expiration', async () => {
      await cacheManager.set('valid-key', 'valid-value', 60);
      const value = await cacheManager.get('valid-key');

      expect(value).toBe('valid-value');
    });
  });

  describe('statistics', () => {
    it('should track cache hits and misses', async () => {
      await cacheManager.set('stats-key', 'stats-value', 60);

      // Hit
      await cacheManager.get('stats-key');

      // Miss
      await cacheManager.get('non-existent');

      const stats = cacheManager.getStats();

      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(0.5);
    });
  });
});

describe('MemoryRateLimiter', () => {
  let rateLimiter: MemoryRateLimiter;

  beforeEach(() => {
    rateLimiter = new MemoryRateLimiter({
      maxRequests: 3,
      windowMs: 1000,
    });
  });

  describe('rate limiting', () => {
    it('should allow requests within limit', async () => {
      const result1 = await rateLimiter.checkLimit('user1');
      const result2 = await rateLimiter.checkLimit('user1');
      const result3 = await rateLimiter.checkLimit('user1');

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
      expect(result3.allowed).toBe(true);
    });

    it('should deny requests exceeding limit', async () => {
      // Make 3 requests (at limit)
      await rateLimiter.checkLimit('user2');
      await rateLimiter.checkLimit('user2');
      await rateLimiter.checkLimit('user2');

      // 4th request should be denied
      const result = await rateLimiter.checkLimit('user2');

      expect(result.allowed).toBe(false);
    });

    it('should track remaining requests', async () => {
      const result1 = await rateLimiter.checkLimit('user3');

      expect(result1.remaining).toBe(2);

      const result2 = await rateLimiter.checkLimit('user3');

      expect(result2.remaining).toBe(1);

      const result3 = await rateLimiter.checkLimit('user3');

      expect(result3.remaining).toBe(0);
    });

    it('should reset after window expires', async () => {
      // Fill up the limit
      await rateLimiter.checkLimit('user4');
      await rateLimiter.checkLimit('user4');
      await rateLimiter.checkLimit('user4');

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 1100));

      // Should be allowed again
      const result = await rateLimiter.checkLimit('user4');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it('should handle different users independently', async () => {
      // Fill limit for user5
      await rateLimiter.checkLimit('user5');
      await rateLimiter.checkLimit('user5');
      await rateLimiter.checkLimit('user5');

      // user6 should still be allowed
      const result = await rateLimiter.checkLimit('user6');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });
  });
});

describe('AILogger', () => {
  let logger: AILogger;
  let mockConsole: any;

  beforeEach(() => {
    logger = new AILogger();
    mockConsole = {
      log: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
    };

    // Mock console methods
    vi.stubGlobal('console', mockConsole);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('logging levels', () => {
    it('should log info messages', () => {
      logger.info('Test info message', { extra: 'data' });

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[AI-CORE] Test info message'),
        { extra: 'data' },
      );
    });

    it('should log error messages', () => {
      const error = new Error('Test error');
      logger.error('Test error message', error);

      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('[AI-CORE] Test error message'),
        error,
      );
    });

    it('should log warning messages', () => {
      logger.warn('Test warning message');

      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('[AI-CORE] Test warning message'),
      );
    });

    it('should log debug messages', () => {
      logger.debug('Test debug message', { debug: 'info' });

      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('[AI-CORE] Test debug message'),
        { debug: 'info' },
      );
    });
  });

  describe('context', () => {
    it('should include context in log messages', () => {
      const loggerWithContext = new AILogger({ provider: 'openai', userId: 'test-user' });
      loggerWithContext.info('Test message');

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('provider=openai userId=test-user'),
        undefined,
      );
    });

    it('should handle empty context', () => {
      logger.info('Test message without context');

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[AI-CORE] Test message without context'),
        undefined,
      );
    });
  });

  describe('timestamp', () => {
    it('should include timestamp in log messages', () => {
      logger.info('Test timestamp');

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/),
        undefined,
      );
    });
  });
});
