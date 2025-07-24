/**
 * AI Manager Core Tests
 * Testing the core functionality of the AI manager
 */

import type { AIConfig } from '../core/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AIManager } from '../core/manager';
import { ClaudeService } from '../providers/claude';
import { OpenAIService } from '../providers/openai';

// Mock the providers
vi.mock('../providers/openai');
vi.mock('../providers/claude');
vi.mock('../providers/gemini');

describe('AIManager', () => {
  let aiManager: AIManager;
  let mockConfig: AIConfig;

  beforeEach(() => {
    mockConfig = {
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

    aiManager = new AIManager(mockConfig);
  });

  describe('initialization', () => {
    it('should create AIManager with valid config', () => {
      expect(aiManager).toBeInstanceOf(AIManager);
    });

    it('should throw error with invalid config', () => {
      expect(() => new AIManager({} as AIConfig)).toThrow();
    });
  });

  describe('service registration', () => {
    it('should register AI services', async () => {
      const openaiService = new OpenAIService();
      await aiManager.registerService('openai', openaiService);

      const providers = aiManager.getAvailableProviders();

      expect(providers).toContain('openai');
    });

    it('should throw error when registering duplicate service', async () => {
      const openaiService = new OpenAIService();
      await aiManager.registerService('openai', openaiService);

      await expect(
        aiManager.registerService('openai', openaiService),
      ).rejects.toThrow();
    });
  });

  describe('text generation', () => {
    beforeEach(async () => {
      const openaiService = new OpenAIService();
      const claudeService = new ClaudeService();

      // Mock the generateText method
      vi.mocked(openaiService.generateText).mockResolvedValue('Test response from OpenAI');
      vi.mocked(claudeService.generateText).mockResolvedValue('Test response from Claude');

      await aiManager.registerService('openai', openaiService);
      await aiManager.registerService('claude', claudeService);
    });

    it('should generate text using default provider', async () => {
      const response = await aiManager.generateText('Test prompt');

      expect(response).toBe('Test response from OpenAI');
    });

    it('should generate text using specific provider', async () => {
      const response = await aiManager.generateText('Test prompt', 'claude');

      expect(response).toBe('Test response from Claude');
    });

    it('should throw error for unknown provider', async () => {
      await expect(
        aiManager.generateText('Test prompt', 'unknown' as any),
      ).rejects.toThrow();
    });
  });

  describe('language enhancement', () => {
    beforeEach(async () => {
      const openaiService = new OpenAIService();
      vi.mocked(openaiService.generateText).mockResolvedValue('Enhanced response');

      await aiManager.registerService('openai', openaiService);
    });

    it('should enhance prompt with language instruction for Spanish', async () => {
      await aiManager.generateText('Test prompt', 'openai', { locale: 'es' });

      const mockService = vi.mocked(OpenAIService).mock.instances[0];
      const generateCall = vi.mocked(mockService.generateText).mock.calls[0];

      expect(generateCall[0]).toContain('Please respond in Spanish');
    });

    it('should not enhance prompt for English locale', async () => {
      await aiManager.generateText('Test prompt', 'openai', { locale: 'en' });

      const mockService = vi.mocked(OpenAIService).mock.instances[0];
      const generateCall = vi.mocked(mockService.generateText).mock.calls[0];

      expect(generateCall[0]).toBe('Test prompt');
    });
  });

  describe('health checks', () => {
    beforeEach(async () => {
      const openaiService = new OpenAIService();
      const claudeService = new ClaudeService();

      vi.mocked(openaiService.isHealthy).mockResolvedValue(true);
      vi.mocked(claudeService.isHealthy).mockResolvedValue(true);

      await aiManager.registerService('openai', openaiService);
      await aiManager.registerService('claude', claudeService);
    });

    it('should get health status for all providers', async () => {
      const health = await aiManager.getAllProvidersHealth();

      expect(health).toHaveProperty('openai');
      expect(health).toHaveProperty('claude');
      expect(health.openai).toBe(true);
      expect(health.claude).toBe(true);
    });

    it('should get health status for specific provider', async () => {
      const health = await aiManager.getProviderHealth('openai');

      expect(health).toBe(true);
    });
  });
});
