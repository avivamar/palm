/**
 * Integration Tests
 * End-to-end testing of AI Core package functionality
 */

import type { AIConfig } from '../core/types';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { AIManager, ClaudeService, OpenAIService, PromptLoader } from '../index';

describe('AI Core Integration', () => {
  let aiManager: AIManager;

  beforeAll(async () => {
    const config: AIConfig = {
      providers: {
        openai: {
          apiKey: 'test-openai-key',
          model: 'gpt-4-turbo-preview',
        },
        claude: {
          apiKey: 'test-claude-key',
          model: 'claude-3-5-sonnet-20241022',
        },
      },
      defaultProvider: 'openai',
      cache: {
        enabled: false,
        ttl: 3600,
      },
      rateLimit: {
        enabled: false,
        maxRequests: 100,
        windowMs: 60000,
      },
    };

    aiManager = new AIManager(config);

    // Register services with mocked responses
    const openaiService = new OpenAIService();
    const claudeService = new ClaudeService();

    // Mock service responses
    vi.spyOn(openaiService, 'generateResponse').mockResolvedValue({
      content: 'Mocked OpenAI response',
      provider: 'openai',
      model: 'gpt-4-turbo-preview',
      usage: { totalTokens: 100, promptTokens: 50, completionTokens: 50 },
      cached: false,
    });

    vi.spyOn(claudeService, 'generateResponse').mockResolvedValue({
      content: 'Mocked Claude response',
      provider: 'claude',
      model: 'claude-3-5-sonnet-20241022',
      usage: { totalTokens: 120, promptTokens: 60, completionTokens: 60 },
      cached: false,
    });

    vi.spyOn(openaiService, 'isHealthy').mockResolvedValue(true);
    vi.spyOn(claudeService, 'isHealthy').mockResolvedValue(true);

    await aiManager.registerService('openai', openaiService);
    await aiManager.registerService('claude', claudeService);
  });

  describe('complete workflow', () => {
    it('should initialize AI manager and generate responses', async () => {
      // Test basic text generation
      const response = await aiManager.generateText('Test prompt');

      expect(response).toBe('Mocked OpenAI response');
    });

    it('should switch between providers', async () => {
      const openaiResponse = await aiManager.generateText('Test prompt', 'openai');
      const claudeResponse = await aiManager.generateText('Test prompt', 'claude');

      expect(openaiResponse).toBe('Mocked OpenAI response');
      expect(claudeResponse).toBe('Mocked Claude response');
    });

    it('should handle multi-language responses', async () => {
      const response = await aiManager.generateText('Test prompt', 'openai', {
        locale: 'es',
      });

      expect(response).toBe('Mocked OpenAI response');
    });

    it('should perform health checks on all providers', async () => {
      const health = await aiManager.getAllProvidersHealth();

      expect(health.openai).toBe(true);
      expect(health.claude).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle provider errors gracefully', async () => {
      const errorManager = new AIManager({
        providers: {
          openai: {
            apiKey: 'invalid-key',
            model: 'gpt-4-turbo-preview',
          },
        },
        defaultProvider: 'openai',
        cache: { enabled: false, ttl: 3600 },
        rateLimit: { enabled: false, maxRequests: 100, windowMs: 60000 },
      });

      const errorService = new OpenAIService();
      vi.spyOn(errorService, 'generateText').mockRejectedValue(
        new Error('API key invalid'),
      );

      await errorManager.registerService('openai', errorService);

      await expect(
        errorManager.generateText('Test prompt'),
      ).rejects.toThrow('API key invalid');
    });

    it('should throw error for unregistered provider', async () => {
      await expect(
        aiManager.generateText('Test prompt', 'unregistered' as any),
      ).rejects.toThrow();
    });
  });

  describe('export validation', () => {
    it('should export all required classes and types', () => {
      // Test that all main exports are available
      expect(AIManager).toBeDefined();
      expect(OpenAIService).toBeDefined();
      expect(ClaudeService).toBeDefined();
      expect(PromptLoader).toBeDefined();
    });

    it('should have correct provider names', () => {
      const providers = aiManager.getAvailableProviders();

      expect(providers).toContain('openai');
      expect(providers).toContain('claude');
    });
  });
});
