export type AIProvider = 'openai' | 'claude' | 'gemini' | 'azure';

export type MessageRole = 'system' | 'user' | 'assistant';

export type AIMessage = {
  role: MessageRole;
  content: string;
  metadata?: Record<string, unknown>;
};

export type GenerateOptions = {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  userId?: string;
  locale?: string;
  stream?: boolean;
};

export type ChatOptions = {
  messages?: AIMessage[];
  systemPrompt?: string;
} & GenerateOptions;

export type AIConfig = {
  providers: Record<string, ProviderConfig>;
  defaultProvider: AIProvider;
  responseLanguage?: string;
  cache?: CacheConfig;
  rateLimit?: RateLimitConfig;
};

export type ProviderConfig = {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  timeout?: number;
  retries?: number;
};

export type ProviderEndpoint = {
  url: string;
  apiKey: string;
  priority: number;      // Priority 1-10 (1 = highest)
  maxRPS?: number;       // Max requests per second
  timeout?: number;      // Request timeout
  weight?: number;       // Load balancing weight
  enabled: boolean;      // Is endpoint enabled
  healthCheck?: string;  // Health check endpoint
};

export type EnhancedProviderConfig = {
  name: string;
  type: AIProvider;
  model?: string;
  endpoints: ProviderEndpoint[];
  fallback: {
    enabled: boolean;
    maxRetries: number;
    backoffMs: number;
    circuitBreaker: boolean;
  };
};

export type CacheConfig = {
  enabled: boolean;
  ttl: number;
  keyPrefix?: string;
};

export type RateLimitConfig = {
  enabled: boolean;
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (userId?: string) => string;
};

export type AIResponse = {
  content: string;
  provider: AIProvider;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cached?: boolean;
  metadata?: Record<string, unknown>;
};

export type StreamChunk = {
  content: string;
  delta: string;
  done: boolean;
  provider: AIProvider;
  metadata?: Record<string, unknown>;
};

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogEntry = {
  level: LogLevel;
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
};

export type SupportedLocale = 'en' | 'es' | 'ja' | 'zh-HK';
