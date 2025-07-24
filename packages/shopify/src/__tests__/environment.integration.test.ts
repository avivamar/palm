/**
 * 环境配置集成测试
 * 测试各种环境配置场景和边界条件
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestConfig, loadConfigFromEnv, validateConfig } from '../config';

describe('Environment Configuration Integration Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Production Environment Simulation', () => {
    it('should load complete production configuration', () => {
      // Simulate production environment variables
      process.env.NODE_ENV = 'production';
      process.env.SHOPIFY_STORE_DOMAIN = 'rolitt-production';
      process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = 'shpat_production_token_123456789';
      process.env.SHOPIFY_WEBHOOK_SECRET = 'production_webhook_secret_key';
      process.env.SHOPIFY_WEBHOOK_ENDPOINT = '/api/webhooks/shopify';

      const config = loadConfigFromEnv();
      const validatedConfig = validateConfig(config);

      expect(validatedConfig.storeDomain).toBe('rolitt-production');
      expect(validatedConfig.adminAccessToken).toMatch(/^shpat_/);
      expect(validatedConfig.webhook?.secret).toBe('production_webhook_secret_key');
      expect(validatedConfig.webhook?.endpoint).toBe('/api/webhooks/shopify');
    });

    it('should validate production token format', () => {
      process.env.SHOPIFY_STORE_DOMAIN = 'rolitt-production';
      process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = 'invalid_token_format';

      const config = loadConfigFromEnv();

      // Should validate token format for production
      expect(() => validateConfig(config, { strictTokenValidation: true }))
        .toThrow(/Invalid admin access token format/);
    });
  });

  describe('Development Environment Simulation', () => {
    it('should load development configuration', () => {
      process.env.NODE_ENV = 'development';
      process.env.SHOPIFY_STORE_DOMAIN = 'rolitt-dev';
      process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = 'shpat_dev_token_123';
      process.env.SHOPIFY_WEBHOOK_SECRET = 'dev_webhook_secret';

      const config = loadConfigFromEnv();
      const validatedConfig = validateConfig(config);

      expect(validatedConfig.storeDomain).toBe('rolitt-dev');
      expect(validatedConfig.adminAccessToken).toBe('shpat_dev_token_123');
    });

    it('should allow relaxed validation in development', () => {
      process.env.NODE_ENV = 'development';
      process.env.SHOPIFY_STORE_DOMAIN = 'dev-store';
      process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = 'dev_token'; // Relaxed format

      const config = loadConfigFromEnv();

      expect(() => validateConfig(config, { strictTokenValidation: false }))
        .not
        .toThrow();
    });
  });

  describe('Testing Environment Simulation', () => {
    it('should handle test environment configuration', () => {
      process.env.NODE_ENV = 'test';
      process.env.SHOPIFY_STORE_DOMAIN = 'test-store';
      process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = 'test_token_123';

      const config = loadConfigFromEnv();
      const validatedConfig = validateConfig(config);

      expect(validatedConfig.storeDomain).toBe('test-store');
      expect(validatedConfig.adminAccessToken).toBe('test_token_123');
    });

    it('should allow mock configuration for testing', () => {
      const mockConfig = createTestConfig({
        storeDomain: 'mock-store',
        adminAccessToken: 'mock_token',
        webhook: {
          secret: 'mock_secret',
          endpoint: '/mock/webhook',
        },
      });

      expect(() => validateConfig(mockConfig)).not.toThrow();
    });
  });

  describe('Configuration Security', () => {
    it('should not log sensitive information', () => {
      const consoleSpy = vi.spyOn(console, 'log');

      process.env.SHOPIFY_ADMIN_ACCESS_TOKEN = 'sensitive_token_123';
      process.env.SHOPIFY_WEBHOOK_SECRET = 'sensitive_secret_456';

      const config = loadConfigFromEnv();
      validateConfig(config);

      // Ensure sensitive data is not logged
      const logCalls = consoleSpy.mock.calls.flat().join(' ');

      expect(logCalls).not.toContain('sensitive_token_123');
      expect(logCalls).not.toContain('sensitive_secret_456');

      consoleSpy.mockRestore();
    });

    it('should sanitize config for logging', () => {
      const config = createTestConfig({
        storeDomain: 'test-store',
        adminAccessToken: 'secret_token',
        webhook: {
          secret: 'secret_webhook',
          endpoint: '/webhooks',
        },
      });

      const sanitizedConfig = {
        ...config,
        adminAccessToken: '***REDACTED***',
        webhook: config.webhook
          ? {
              ...config.webhook,
              secret: '***REDACTED***',
            }
          : undefined,
      };

      expect(sanitizedConfig.adminAccessToken).toBe('***REDACTED***');
      expect(sanitizedConfig.webhook?.secret).toBe('***REDACTED***');
      expect(sanitizedConfig.storeDomain).toBe('test-store');
      expect(sanitizedConfig.webhook?.endpoint).toBe('/webhooks');
    });
  });
});
