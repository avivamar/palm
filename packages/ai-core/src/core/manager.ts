import type { AIService, CacheManager, RateLimiter as IRateLimiter, Logger } from './interfaces';
import type {
  AIConfig,
  AIMessage,
  AIProvider,
  AIResponse,
  ChatOptions,
  GenerateOptions,
  StreamChunk,
  SupportedLocale,
} from './types';
import { Redis } from '@upstash/redis';
import { z } from 'zod';
import {
  AIServiceError,
  ConfigurationError,
  ProviderNotFoundError,
} from './errors';

// Configuration validation schema
const aiConfigSchema = z.object({
  providers: z.record(z.object({
    apiKey: z.string().min(1),
    baseUrl: z.string().url().optional(),
    model: z.string().optional(),
    timeout: z.number().positive().optional(),
    retries: z.number().int().min(0).optional(),
  })),
  defaultProvider: z.enum(['openai', 'claude', 'gemini', 'azure']),
  responseLanguage: z.enum(['en', 'es', 'ja', 'zh-HK']).optional(),
  cache: z.object({
    enabled: z.boolean().default(true),
    ttl: z.number().positive().default(3600),
    keyPrefix: z.string().optional(),
  }).optional(),
  rateLimit: z.object({
    enabled: z.boolean().default(true),
    maxRequests: z.number().positive().default(100),
    windowMs: z.number().positive().default(60000),
  }).optional(),
});

export class AIManager {
  private services: Map<string, AIService> = new Map();
  private readonly config: AIConfig;
  private cache: CacheManager | null = null;
  private rateLimiter: IRateLimiter | null = null;
  private logger: Logger | null = null;
  private redis: Redis | null = null;

  constructor(config: unknown, logger?: Logger) {
    try {
      this.config = aiConfigSchema.parse(config);
      this.logger = logger || null;
      this.initializeRedis();
      this.initializeRateLimiter();
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ConfigurationError(`Invalid configuration: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw error;
    }
  }

  private initializeRedis(): void {
    if (this.config.cache?.enabled) {
      try {
        // Try to get Redis connection from environment
        const redisUrl = process.env.REDIS_URL;
        const redisToken = process.env.REDIS_TOKEN;

        if (redisUrl) {
          this.redis = new Redis({
            url: redisUrl,
            token: redisToken,
          });

          // Create cache manager wrapper
          const redis = this.redis!;
          const config = this.config;
          this.cache = {
            redis,
            config,
            async get<T>(key: string): Promise<T | null> {
              try {
                return await redis.get<T>(key);
              } catch {
                return null;
              }
            },

            async set<T>(key: string, value: T, ttl?: number): Promise<void> {
              const actualTtl = ttl || config.cache?.ttl || 3600;
              await redis.set(key, value, { ex: actualTtl });
            },

            async delete(key: string): Promise<void> {
              await redis.del(key);
            },

            async clear(): Promise<void> {
              // Clear all keys with the prefix
              const prefix = config.cache?.keyPrefix || 'ai:';
              const keys = await redis.keys(`${prefix}*`);
              if (keys.length > 0) {
                await redis.del(...keys);
              }
            },

            async exists(key: string): Promise<boolean> {
              const result = await redis.exists(key);
              return result === 1;
            },
          } as CacheManager;
        }
      } catch (error) {
        this.logger?.warn('Failed to initialize Redis cache', { error });
      }
    }
  }

  private initializeRateLimiter(): void {
    if (this.config.rateLimit?.enabled && this.redis) {
      const redis = this.redis;
      const config = this.config;
      this.rateLimiter = {
        redis,
        config,
        async checkLimit(identifier: string): Promise<void> {
          const key = `rate_limit:${identifier}`;
          const window = config.rateLimit!.windowMs;
          const maxRequests = config.rateLimit!.maxRequests;
          const now = Date.now();
          const windowStart = now - window;

          // Remove old entries and count current requests
          await redis.zremrangebyscore(key, 0, windowStart);
          const currentCount = await redis.zcard(key);

          if (currentCount >= maxRequests) {
            const { RateLimitExceededError } = await import('./errors');
            const resetTime = new Date(now + window);
            throw new RateLimitExceededError(identifier, resetTime);
          }

          // Add current request
          await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });
          await redis.expire(key, Math.ceil(window / 1000));
        },

        async getRemainingRequests(identifier: string): Promise<number> {
          const key = `rate_limit:${identifier}`;
          const window = config.rateLimit!.windowMs;
          const maxRequests = config.rateLimit!.maxRequests;
          const now = Date.now();
          const windowStart = now - window;

          await redis.zremrangebyscore(key, 0, windowStart);
          const currentCount = await redis.zcard(key);
          return Math.max(0, maxRequests - currentCount);
        },

        async resetLimit(identifier: string): Promise<void> {
          const key = `rate_limit:${identifier}`;
          await redis.del(key);
        },
      } as IRateLimiter;
    }
  }

  public async registerService(provider: AIProvider, service: AIService): Promise<void> {
    const providerConfig = this.config.providers[provider];
    if (!providerConfig) {
      throw new ProviderNotFoundError(provider);
    }

    try {
      await service.initialize(providerConfig);
      this.services.set(provider, service);
      this.logger?.info(`AI service registered: ${provider}`);
    } catch (error) {
      throw new AIServiceError(
        `Failed to register service for provider: ${provider}`,
        'SERVICE_REGISTRATION_FAILED',
        provider,
        error,
      );
    }
  }

  public async generateText(
    prompt: string,
    provider?: AIProvider,
    options?: GenerateOptions,
  ): Promise<string> {
    // Check rate limit
    if (this.rateLimiter && options?.userId) {
      await this.rateLimiter.checkLimit(options.userId);
    }

    // Generate cache key
    const cacheKey = this.generateCacheKey('text', prompt, provider, options);

    // Try cache first
    if (this.cache) {
      try {
        const cached = await this.cache.get<string>(cacheKey);
        if (cached) {
          this.logger?.debug('Cache hit for text generation', { cacheKey });
          return cached;
        }
      } catch (error) {
        this.logger?.warn('Cache read failed', { error, cacheKey });
      }
    }

    const service = this.getService(provider);

    // Enhance prompt with language instruction
    const enhancedPrompt = this.enhancePromptWithLanguage(prompt, options?.locale);

    try {
      const result = await service.generateText(enhancedPrompt, options);

      // Cache the result
      if (this.cache) {
        try {
          await this.cache.set(cacheKey, result, this.config.cache?.ttl);
          this.logger?.debug('Cached text generation result', { cacheKey });
        } catch (error) {
          this.logger?.warn('Cache write failed', { error, cacheKey });
        }
      }

      return result;
    } catch (error) {
      this.logger?.error('Text generation failed', {
        provider: provider || this.config.defaultProvider,
        error,
      });
      throw error;
    }
  }

  public async generateResponse(
    prompt: string,
    provider?: AIProvider,
    options?: GenerateOptions,
  ): Promise<AIResponse> {
    const service = this.getService(provider);
    const enhancedPrompt = this.enhancePromptWithLanguage(prompt, options?.locale);

    return service.generateResponse(enhancedPrompt, options);
  }

  public async* streamChat(
    messages: AIMessage[],
    provider?: AIProvider,
    options?: ChatOptions,
  ): AsyncGenerator<StreamChunk, void, unknown> {
    // Check rate limit
    if (this.rateLimiter && options?.userId) {
      await this.rateLimiter.checkLimit(options.userId);
    }

    const service = this.getService(provider);

    // Enhance messages with language instruction
    const enhancedMessages = this.enhanceMessagesWithLanguage(messages, options?.locale);

    try {
      const stream = service.streamChat(enhancedMessages, options);

      for await (const chunk of stream) {
        yield chunk;
      }
    } catch (error) {
      this.logger?.error('Stream chat failed', {
        provider: provider || this.config.defaultProvider,
        error,
      });
      throw error;
    }
  }

  private enhancePromptWithLanguage(prompt: string, locale?: string): string {
    if (!locale || locale === 'en') {
      return prompt;
    }

    const languageMap: Record<SupportedLocale, string> = {
      'en': '',
      'es': 'Please respond in Spanish',
      'ja': 'Please respond in Japanese',
      'zh-HK': 'Please respond in Traditional Chinese',
    };

    const languageInstruction = languageMap[locale as SupportedLocale];
    return languageInstruction ? `${prompt}\n\n${languageInstruction}` : prompt;
  }

  private enhanceMessagesWithLanguage(messages: AIMessage[], locale?: string): AIMessage[] {
    if (!locale || locale === 'en') {
      return messages;
    }

    const languageMap: Record<SupportedLocale, string> = {
      'en': '',
      'es': 'Spanish',
      'ja': 'Japanese',
      'zh-HK': 'Traditional Chinese',
    };

    const language = languageMap[locale as SupportedLocale];
    if (!language) {
      return messages;
    }

    const enhancedMessages = [...messages];

    // Find system message or create one
    const systemMessageIndex = enhancedMessages.findIndex(m => m.role === 'system');

    if (systemMessageIndex !== -1) {
      const existingMessage = enhancedMessages[systemMessageIndex];
      if (existingMessage) {
        enhancedMessages[systemMessageIndex] = {
          ...existingMessage,
          content: `${existingMessage.content}\n\nIMPORTANT: All responses must be in ${language}.`,
          role: existingMessage.role, // Ensure role is preserved
        };
      }
    } else {
      enhancedMessages.unshift({
        role: 'system' as const,
        content: `You are a helpful AI assistant. All responses must be in ${language}.`,
      });
    }

    return enhancedMessages;
  }

  private generateCacheKey(
    type: string,
    content: string,
    provider?: AIProvider,
    options?: GenerateOptions,
  ): string {
    const actualProvider = provider || this.config.defaultProvider;
    const locale = options?.locale || 'en';
    const hash = this.simpleHash(content);
    const prefix = this.config.cache?.keyPrefix || 'ai';

    return `${prefix}:${type}:${actualProvider}:${locale}:${hash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private getService(provider?: AIProvider): AIService {
    const providerName = provider ?? this.config.defaultProvider;
    const service = this.services.get(providerName);

    if (!service) {
      throw new ProviderNotFoundError(providerName);
    }

    return service;
  }

  public getAvailableProviders(): AIProvider[] {
    return Array.from(this.services.keys()) as AIProvider[];
  }

  public async getProviderHealth(provider?: AIProvider): Promise<boolean> {
    try {
      const service = this.getService(provider);
      return await service.isHealthy();
    } catch {
      return false;
    }
  }

  public async getAllProvidersHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};

    for (const [provider, service] of this.services) {
      try {
        health[provider] = await service.isHealthy();
      } catch {
        health[provider] = false;
      }
    }

    return health;
  }

  public getConfig(): Readonly<AIConfig> {
    return Object.freeze({ ...this.config });
  }

  public async clearCache(): Promise<void> {
    if (this.cache) {
      await this.cache.clear();
      this.logger?.info('AI cache cleared');
    }
  }
}
