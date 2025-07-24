/**
 * Shopify Configuration 单元测试
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadConfigFromEnv, validateConfig } from '../index';

describe('Shopify Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateConfig', () => {
    it('should validate valid configuration', () => {
      const validConfig = {
        storeDomain: 'test-store',
        adminAccessToken: 'test_token_123',
        webhook: {
          secret: 'webhook_secret',
          endpoint: '/api/webhooks/shopify',
        },
      };

      expect(() => validateConfig(validConfig)).not.toThrow();

      const result = validateConfig(validConfig);

      expect(result.storeDomain).toBe('test-store');
      expect(result.adminAccessToken).toBe('test_token_123');
    });

    it('should throw error for missing storeDomain', () => {
      const invalidConfig = {
        adminAccessToken: 'test_token_123',
      };

      expect(() => validateConfig(invalidConfig as any))
        .toThrow(/storeDomain/);
    });

    it('should throw error for missing adminAccessToken', () => {
      const invalidConfig = {
        storeDomain: 'test-store',
      };

      expect(() => validateConfig(invalidConfig as any))
        .toThrow(/adminAccessToken/);
    });

    it('should validate optional webhook configuration', () => {
      const configWithWebhook = {
        storeDomain: 'test-store',
        adminAccessToken: 'test_token_123',
        webhook: {
          secret: 'webhook_secret',
          endpoint: '/api/webhooks/shopify',
        },
      };

      const result = validateConfig(configWithWebhook);

      expect(result.webhook?.secret).toBe('webhook_secret');
      expect(result.webhook?.endpoint).toBe('/api/webhooks/shopify');
    });

    it('should handle configuration without webhook', () => {
      const configWithoutWebhook = {
        storeDomain: 'test-store',
        adminAccessToken: 'test_token_123',
      };

      const result = validateConfig(configWithoutWebhook);

      expect(result.webhook).toBeUndefined();
    });
  });

  describe('loadConfigFromEnv', () => {
    it('should load configuration from environment variables', () => {
      process.env.SHOPIFY_STORE_DOMAIN = 'env-store';
      process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = 'env_token_456';
      process.env.SHOPIFY_WEBHOOK_SECRET = 'env_webhook_secret';
      process.env.SHOPIFY_WEBHOOK_ENDPOINT = '/api/webhooks/shopify';

      const config = loadConfigFromEnv();

      expect(config.storeDomain).toBe('env-store');
      expect(config.adminAccessToken).toBe('env_token_456');
      expect(config.webhook?.secret).toBe('env_webhook_secret');
      expect(config.webhook?.endpoint).toBe('/api/webhooks/shopify');
    });

    it('should return empty object when no environment variables set', () => {
      // Clear relevant environment variables
      delete process.env.SHOPIFY_STORE_DOMAIN;
      delete process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
      delete process.env.SHOPIFY_WEBHOOK_SECRET;
      delete process.env.SHOPIFY_WEBHOOK_ENDPOINT;

      const config = loadConfigFromEnv();

      expect(config).toEqual({});
    });

    it('should handle partial environment configuration', () => {
      process.env.SHOPIFY_STORE_DOMAIN = 'partial-store';
      // Missing SHOPIFY_ADMIN_ACCESS_TOKEN
      process.env.SHOPIFY_WEBHOOK_SECRET = 'partial_webhook_secret';

      const config = loadConfigFromEnv();

      expect(config.storeDomain).toBe('partial-store');
      expect(config.adminAccessToken).toBeUndefined();
      expect(config.webhook?.secret).toBe('partial_webhook_secret');
    });

    it('should not include webhook if only one webhook env var is set', () => {
      process.env.SHOPIFY_STORE_DOMAIN = 'test-store';
      process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = 'test_token';
      process.env.SHOPIFY_WEBHOOK_SECRET = 'webhook_secret';
      // Missing SHOPIFY_WEBHOOK_ENDPOINT

      const config = loadConfigFromEnv();

      expect(config.storeDomain).toBe('test-store');
      expect(config.adminAccessToken).toBe('test_token');
      // Should not include webhook config if incomplete
      expect(config.webhook).toBeUndefined();
    });
  });

  describe('integration tests', () => {
    it('should load and validate environment configuration', () => {
      process.env.SHOPIFY_STORE_DOMAIN = 'integration-store';
      process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = 'integration_token_789';
      process.env.SHOPIFY_WEBHOOK_SECRET = 'integration_webhook_secret';
      process.env.SHOPIFY_WEBHOOK_ENDPOINT = '/api/webhooks/shopify';

      const envConfig = loadConfigFromEnv();

      expect(() => validateConfig(envConfig)).not.toThrow();

      const validatedConfig = validateConfig(envConfig);

      expect(validatedConfig.storeDomain).toBe('integration-store');
      expect(validatedConfig.adminAccessToken).toBe('integration_token_789');
      expect(validatedConfig.webhook?.secret).toBe('integration_webhook_secret');
    });

    it('should fail validation with incomplete environment config', () => {
      process.env.SHOPIFY_STORE_DOMAIN = 'incomplete-store';
      // Missing required SHOPIFY_ADMIN_ACCESS_TOKEN

      const envConfig = loadConfigFromEnv();

      expect(() => validateConfig(envConfig))
        .toThrow(/adminAccessToken/);
    });
  });
});
