/**
 * Server Actions Integration Tests
 * Testing the integration between AI Core package and Next.js Server Actions
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkAIHealth, generateFromPrompt, handleAIChat } from '../../../../src/app/actions/aiActions';

// Mock the AI Core package
vi.mock('@rolitt/ai-core', () => ({
  AIManager: vi.fn().mockImplementation(() => ({
    generateResponse: vi.fn().mockResolvedValue({
      content: 'Mocked AI response',
      provider: 'openai',
      model: 'gpt-4-turbo-preview',
      usage: { totalTokens: 100, promptTokens: 50, completionTokens: 50 },
      cached: false,
    }),
    getAllProvidersHealth: vi.fn().mockResolvedValue({
      openai: { status: 'healthy', latency: 150, provider: 'openai' },
      claude: { status: 'healthy', latency: 200, provider: 'claude' },
    }),
    getAvailableProviders: vi.fn().mockReturnValue(['openai', 'claude']),
    registerService: vi.fn().mockResolvedValue(undefined),
  })),
  PromptLoader: {
    loadPrompt: vi.fn().mockResolvedValue('Loaded prompt content with variables'),
  },
  OpenAIService: vi.fn(),
  OpenAIEnhancedService: vi.fn(),
  ClaudeService: vi.fn(),
  GeminiService: vi.fn(),
  ChatService: vi.fn().mockImplementation(() => ({
    chat: vi.fn().mockResolvedValue({
      sessionId: 'test-session',
      message: { content: 'Chat response' },
      provider: 'openai',
      model: 'gpt-4-turbo-preview',
      usage: { totalTokens: 100, promptTokens: 50, completionTokens: 50 },
      cached: false,
    }),
  })),
  // OpenAI configuration helpers
  createOpenAIConfigFromEnv: vi.fn().mockReturnValue({
    name: 'openai-test',
    type: 'openai',
    model: 'gpt-4-turbo-preview',
    endpoints: [
      {
        url: 'https://api.openai.com/v1',
        apiKey: 'test-key',
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
    },
    circuitBreaker: {
      enabled: true,
      failureThreshold: 5,
      resetTimeoutMs: 60000,
    },
  }),
  validateOpenAIConfig: vi.fn().mockReturnValue({
    valid: true,
    errors: [],
    warnings: [],
  }),
  createDevelopmentConfig: vi.fn().mockReturnValue({
    name: 'openai-dev',
    type: 'openai',
    model: 'gpt-4-turbo-preview',
    endpoints: [
      {
        url: 'https://api.openai.com/v1',
        apiKey: 'test-dev-key',
        priority: 1,
        maxRPS: 50,
        timeout: 30000,
        weight: 100,
        enabled: true,
      },
    ],
  }),
  createOpenAIMultiConfig: vi.fn(),
  createOpenAIWithProxy: vi.fn(),
}));

describe('AI Server Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock environment variables
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
    process.env.GOOGLE_AI_API_KEY = 'test-google-key';
  });

  describe('handleAIChat', () => {
    it('should handle basic chat request', async () => {
      const formData = new FormData();
      formData.append('messages', JSON.stringify([
        { role: 'user', content: 'Hello, how are you?' },
      ]));
      formData.append('locale', 'en');

      const result = await handleAIChat(formData);

      expect(result.success).toBe(true);
      expect(result.data?.content).toBe('Mocked AI response');
      expect(result.data?.provider).toBe('openai');
    });

    it('should handle chat with specific provider', async () => {
      const formData = new FormData();
      formData.append('messages', JSON.stringify([
        { role: 'user', content: 'Hello from Claude!' },
      ]));
      formData.append('provider', 'claude');
      formData.append('locale', 'es');

      const result = await handleAIChat(formData);

      expect(result.success).toBe(true);
      expect(result.data?.content).toBe('Mocked AI response');
    });

    it('should handle chat with additional options', async () => {
      const formData = new FormData();
      formData.append('messages', JSON.stringify([
        { role: 'user', content: 'Test with options' },
      ]));
      formData.append('temperature', '0.8');
      formData.append('maxTokens', '1000');
      formData.append('userId', 'test-user-123');

      const result = await handleAIChat(formData);

      expect(result.success).toBe(true);
      expect(result.data?.responseTime).toBeDefined();
    });

    it('should handle invalid input', async () => {
      const formData = new FormData();
      formData.append('messages', 'invalid-json');

      const result = await handleAIChat(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('generateFromPrompt', () => {
    it('should generate response from prompt template', async () => {
      const formData = new FormData();
      formData.append('category', 'ecommerce');
      formData.append('name', 'recommendation');
      formData.append('locale', 'en');
      formData.append('variables', JSON.stringify({
        userId: 'test-user',
        userPreferences: 'electronics',
      }));

      const result = await generateFromPrompt(formData);

      expect(result.success).toBe(true);
      expect(result.data?.content).toBe('Mocked AI response');
      expect(result.data?.promptUsed).toEqual({
        category: 'ecommerce',
        name: 'recommendation',
        locale: 'en',
      });
    });

    it('should handle prompt generation with different locales', async () => {
      const formData = new FormData();
      formData.append('category', 'customer-service');
      formData.append('name', 'support');
      formData.append('locale', 'ja');

      const result = await generateFromPrompt(formData);

      expect(result.success).toBe(true);
      expect(result.data?.promptUsed.locale).toBe('ja');
    });

    it('should handle missing prompt template gracefully', async () => {
      const { PromptLoader } = await import('@rolitt/ai-core');
      vi.mocked(PromptLoader.loadPrompt).mockRejectedValueOnce(
        new Error('Prompt not found'),
      );

      const formData = new FormData();
      formData.append('category', 'nonexistent');
      formData.append('name', 'missing');
      formData.append('locale', 'en');

      const result = await generateFromPrompt(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Prompt generation failed');
    });
  });

  describe('checkAIHealth', () => {
    it('should return health status for all providers', async () => {
      const result = await checkAIHealth();

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('healthy');
      expect(result.data?.providers).toHaveProperty('openai');
      expect(result.data?.providers).toHaveProperty('claude');
      expect(result.data?.availableProviders).toContain('openai');
      expect(result.data?.availableProviders).toContain('claude');
    });

    it('should handle health check failures', async () => {
      const { AIManager } = await import('@rolitt/ai-core');
      const mockManager = vi.mocked(AIManager).mock.instances[0];
      vi.mocked(mockManager!.getAllProvidersHealth).mockRejectedValueOnce(
        new Error('Health check failed'),
      );

      const result = await checkAIHealth();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Health check failed');
      expect(result.data?.status).toBe('unhealthy');
    });
  });

  describe('environment validation', () => {
    it('should handle missing API keys', async () => {
      // Clear environment variables
      delete process.env.OPENAI_API_KEY;
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.GOOGLE_AI_API_KEY;

      const formData = new FormData();
      formData.append('messages', JSON.stringify([
        { role: 'user', content: 'Test without API keys' },
      ]));

      const result = await handleAIChat(formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No AI providers configured');
    });

    it('should work with partial API key configuration', async () => {
      // Only set OpenAI key
      process.env.OPENAI_API_KEY = 'test-openai-key';
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.GOOGLE_AI_API_KEY;

      const formData = new FormData();
      formData.append('messages', JSON.stringify([
        { role: 'user', content: 'Test with only OpenAI' },
      ]));

      const result = await handleAIChat(formData);

      expect(result.success).toBe(true);
      expect(result.data?.provider).toBe('openai');
    });
  });

  describe('input validation', () => {
    it('should validate message format', async () => {
      const formData = new FormData();
      formData.append('messages', JSON.stringify([
        { role: 'invalid-role', content: 'Test message' },
      ]));

      const result = await handleAIChat(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate locale values', async () => {
      const formData = new FormData();
      formData.append('messages', JSON.stringify([
        { role: 'user', content: 'Test message' },
      ]));
      formData.append('locale', 'invalid-locale');

      const result = await handleAIChat(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate temperature range', async () => {
      const formData = new FormData();
      formData.append('messages', JSON.stringify([
        { role: 'user', content: 'Test message' },
      ]));
      formData.append('temperature', '3.0'); // Invalid: > 2.0

      const result = await handleAIChat(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate maxTokens range', async () => {
      const formData = new FormData();
      formData.append('messages', JSON.stringify([
        { role: 'user', content: 'Test message' },
      ]));
      formData.append('maxTokens', '10000'); // Invalid: > 8000

      const result = await handleAIChat(formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
