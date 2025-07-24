import { z } from 'zod';

export const providerConfigSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  baseUrl: z.string().url().optional(),
  model: z.string().optional(),
  timeout: z.number().positive().optional(),
  retries: z.number().int().min(0).max(10).optional(),
});

export const cacheConfigSchema = z.object({
  enabled: z.boolean().default(true),
  ttl: z.number().positive().default(3600),
  keyPrefix: z.string().default('ai:cache:'),
});

export const rateLimitConfigSchema = z.object({
  enabled: z.boolean().default(true),
  maxRequests: z.number().positive().default(100),
  windowMs: z.number().positive().default(60000),
  keyGenerator: z.function().optional(),
});

export const aiConfigSchema = z.object({
  providers: z.record(
    z.enum(['openai', 'claude', 'gemini', 'azure']),
    providerConfigSchema,
  ).refine(
    providers => Object.keys(providers).length > 0,
    'At least one provider must be configured',
  ),
  defaultProvider: z.enum(['openai', 'claude', 'gemini', 'azure']),
  responseLanguage: z.enum(['en', 'es', 'ja', 'zh-HK']).optional(),
  cache: cacheConfigSchema.optional(),
  rateLimit: rateLimitConfigSchema.optional(),
}).refine(
  config => config.defaultProvider in config.providers,
  'Default provider must be included in providers list',
);

export const generateOptionsSchema = z.object({
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().max(32000).optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  stop: z.array(z.string()).max(4).optional(),
  userId: z.string().optional(),
  locale: z.enum(['en', 'es', 'ja', 'zh-HK']).optional(),
  stream: z.boolean().optional(),
});

export const chatOptionsSchema = generateOptionsSchema.extend({
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string().min(1),
    metadata: z.record(z.unknown()).optional(),
  })).optional(),
  systemPrompt: z.string().optional(),
});

export function validateConfig(config: unknown) {
  return aiConfigSchema.parse(config);
}

export function validateGenerateOptions(options: unknown) {
  return generateOptionsSchema.parse(options);
}

export function validateChatOptions(options: unknown) {
  return chatOptionsSchema.parse(options);
}
