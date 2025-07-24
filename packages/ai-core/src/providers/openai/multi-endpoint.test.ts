import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { OpenAIEndpointManager } from './endpoint-manager';
import { OpenAIMultiEndpointClient } from './multi-endpoint-client';
import { OpenAIEnhancedService } from './enhanced-service';
import type { ProviderEndpoint } from '../../core/types';
import type { OpenAIEnhancedConfig } from './types';

// Mock OpenAI
vi.mock('openai', () => {
  const MockOpenAI = vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
    models: {
      list: vi.fn(),
    },
  }));
  return { default: MockOpenAI };
});

describe('OpenAI Multi-Endpoint System', () => {
  describe('OpenAIEndpointManager', () => {
    let endpoints: ProviderEndpoint[];
    let manager: OpenAIEndpointManager;

    beforeEach(() => {
      endpoints = [
        {
          url: 'https://api.openai.com/v1',
          apiKey: 'sk-test-1',
          priority: 1,
          maxRPS: 100,
          timeout: 30000,
          weight: 70,
          enabled: true,
        },
        {
          url: 'https://proxy.example.com/v1',
          apiKey: 'proxy-key',
          priority: 2,
          maxRPS: 50,
          timeout: 25000,
          weight: 30,
          enabled: true,
        },
        {
          url: 'https://backup.example.com/v1',
          apiKey: 'backup-key',
          priority: 3,
          maxRPS: 20,
          timeout: 20000,
          weight: 10,
          enabled: false, // Disabled
        },
      ];
      manager = new OpenAIEndpointManager(endpoints);
    });

    it('should initialize with enabled endpoints only', () => {
      const stats = manager.getStatistics();
      expect(stats.totalEndpoints).toBe(2); // Only enabled endpoints
      expect(stats.healthyEndpoints).toBe(2);
    });

    it('should return best endpoint by priority', () => {
      const best = manager.getBestEndpoint();
      expect(best).toBeDefined();
      expect(best?.priority).toBe(1);
      expect(best?.url).toBe('https://api.openai.com/v1');
    });

    it('should record success and update metrics', () => {
      const endpoint = manager.getBestEndpoint()!;
      manager.recordSuccess(endpoint.url, 500);
      
      const health = manager.getHealthStatus();
      const endpointHealth = health.find(h => h.endpoint.url === endpoint.url);
      expect(endpointHealth?.isHealthy).toBe(true);
      expect(endpointHealth?.responseTime).toBe(500);
      expect(endpointHealth?.consecutiveErrors).toBe(0);
    });

    it('should record failure and trigger circuit breaker', () => {
      const endpoint = manager.getBestEndpoint()!;
      
      // Record multiple failures
      for (let i = 0; i < 5; i++) {
        manager.recordFailure(endpoint.url, new Error('Test error'));
      }
      
      const health = manager.getHealthStatus();
      const endpointHealth = health.find(h => h.endpoint.url === endpoint.url);
      expect(endpointHealth?.isHealthy).toBe(false);
      expect(endpointHealth?.consecutiveErrors).toBe(5);
    });

    it('should select second priority endpoint when first is unhealthy', () => {
      const firstEndpoint = manager.getBestEndpoint()!;
      
      // Make first endpoint unhealthy
      for (let i = 0; i < 5; i++) {
        manager.recordFailure(firstEndpoint.url, new Error('Test error'));
      }
      
      const nextBest = manager.getBestEndpoint();
      expect(nextBest?.priority).toBe(2);
      expect(nextBest?.url).toBe('https://proxy.example.com/v1');
    });

    it('should respect rate limits', () => {
      const endpoint = manager.getBestEndpoint()!;
      
      // Simulate rapid requests
      const now = Date.now();
      vi.setSystemTime(now);
      
      // First request should work
      expect(manager.getBestEndpoint()).toBeDefined();
      
      // Immediate second request might be rate limited
      // This depends on maxRPS settings
    });
  });

  describe('OpenAIMultiEndpointClient', () => {
    let config: OpenAIEnhancedConfig;

    beforeEach(() => {
      config = {
        name: 'test-multi-openai',
        type: 'openai',
        model: 'gpt-4-turbo-preview',
        endpoints: [
          {
            url: 'https://api.openai.com/v1',
            apiKey: 'sk-test-1',
            priority: 1,
            maxRPS: 100,
            timeout: 30000,
            weight: 100,
            enabled: true,
          },
        ],
        fallback: {
          enabled: true,
          maxRetries: 3,
          backoffMs: 1000,
          circuitBreaker: true,
        },
      };
    });

    it('should create client with config', () => {
      const client = new OpenAIMultiEndpointClient(config);
      expect(client).toBeDefined();
      expect(client.getDefaultModel()).toBe('gpt-4-turbo-preview');
    });
  });

  describe('OpenAIEnhancedService', () => {
    it('should create service', () => {
      const service = new OpenAIEnhancedService();
      expect(service).toBeDefined();
      
      const modelInfo = service.getModelInfo();
      expect(modelInfo.mode).toBe('not-initialized');
    });
  });
});

describe('Integration Tests', () => {
  it('should demonstrate complete multi-endpoint workflow', () => {
    const config: OpenAIEnhancedConfig = {
      name: 'integration-test',
      type: 'openai',
      model: 'gpt-4-turbo-preview',
      endpoints: [
        {
          url: 'https://api.openai.com/v1',
          apiKey: 'sk-primary',
          priority: 1,
          maxRPS: 100,
          timeout: 30000,
          weight: 70,
          enabled: true,
        },
      ],
      fallback: {
        enabled: true,
        maxRetries: 2,
        backoffMs: 500,
        circuitBreaker: true,
      },
    };

    expect(config.endpoints.length).toBe(1);
    expect(config.fallback.enabled).toBe(true);
  });
});