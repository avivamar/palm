import type { AIConfig } from '../core/types';

export const defaultConfig: Partial<AIConfig> = {
  cache: {
    enabled: true,
    ttl: 3600, // 1 hour
    keyPrefix: 'ai:cache:',
  },
  rateLimit: {
    enabled: true,
    maxRequests: 100,
    windowMs: 60000, // 1 minute
  },
  responseLanguage: 'en',
};

export const defaultProviderModels = {
  openai: 'gpt-4-turbo-preview',
  claude: 'claude-3-5-sonnet-20241022',
  gemini: 'gemini-1.5-pro-latest',
  azure: 'gpt-4-turbo-preview',
} as const;

export const defaultTimeouts = {
  openai: 30000,
  claude: 30000,
  gemini: 30000,
  azure: 30000,
} as const;

export const defaultRetries = {
  openai: 3,
  claude: 3,
  gemini: 3,
  azure: 3,
} as const;
