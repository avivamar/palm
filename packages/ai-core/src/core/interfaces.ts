import type {
  AIMessage,
  AIResponse,
  ChatOptions,
  GenerateOptions,
  ProviderConfig,
  StreamChunk,
} from './types';

export type AIService = {
  initialize: (config: ProviderConfig) => Promise<void>;
  generateText: (prompt: string, options?: GenerateOptions) => Promise<string>;
  generateResponse: (prompt: string, options?: GenerateOptions) => Promise<AIResponse>;
  streamChat: (messages: AIMessage[], options?: ChatOptions) => AsyncGenerator<StreamChunk>;
  isHealthy: () => Promise<boolean>;
  getModelInfo: () => {
    name: string;
    provider: string;
    capabilities: string[];
  };
};

export type CacheManager = {
  get: <T>(key: string) => Promise<T | null>;
  set: <T>(key: string, value: T, ttl?: number) => Promise<void>;
  delete: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  exists: (key: string) => Promise<boolean>;
  // Optional properties for implementation details
  redis?: any;
  config?: any;
};

export type RateLimiter = {
  checkLimit: (identifier: string) => Promise<void>;
  getRemainingRequests: (identifier: string) => Promise<number>;
  resetLimit: (identifier: string) => Promise<void>;
  // Optional properties for implementation details
  redis?: any;
  config?: any;
};

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogEntry = {
  level: LogLevel;
  message: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
};

export type Logger = {
  debug: (message: string, metadata?: Record<string, unknown>) => void;
  info: (message: string, metadata?: Record<string, unknown>) => void;
  warn: (message: string, metadata?: Record<string, unknown>) => void;
  error: (message: string, metadata?: Record<string, unknown>) => void;
};

export type PromptManager = {
  loadPrompt: (category: string, name: string, locale?: string, variables?: Record<string, string>) => Promise<string>;
  listPrompts: (category?: string) => Promise<string[]>;
  validatePrompt: (content: string) => boolean;
  clearCache: () => void;
};
