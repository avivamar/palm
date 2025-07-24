// Configuration exports
export {
  defaultConfig,
  defaultProviderModels,
  validateChatOptions,
  validateConfig,
  validateGenerateOptions,
} from './config';
export {
  AIServiceError,
  CacheError,
  ConfigurationError,
  PromptNotFoundError,
  ProviderNotFoundError,
  ProviderTimeoutError,
  RateLimitExceededError,
} from './core/errors';

export type {
  AIService,
  CacheManager,
  Logger,
  PromptManager,
  RateLimiter,
} from './core/interfaces';

// Core exports
export { AIManager } from './core/manager';

export type {
  AIConfig,
  AIMessage,
  AIProvider,
  AIResponse,
  CacheConfig,
  ChatOptions,
  GenerateOptions,
  ProviderConfig,
  ProviderEndpoint,
  EnhancedProviderConfig,
  RateLimitConfig,
  StreamChunk,
  SupportedLocale,
} from './core/types';
// Chat feature exports
export { ChatService } from './features/chat';
export type {
  ChatConfig,
  ChatRequest,
  ChatResponse,
  ChatSession,
  StreamChatRequest,
  StreamChatResponse,
} from './features/chat';

// Prompt management exports
export { PromptLoader } from './prompts/loader';
export type {
  LoadedPrompt,
  PromptMetadata,
  PromptStats,
  PromptVariables,
} from './prompts/types';
export { ClaudeClient, ClaudeService } from './providers/claude';

export type { ClaudeConfig } from './providers/claude';

export { GeminiClient, GeminiService } from './providers/gemini';

export type { GeminiConfig } from './providers/gemini';
// Provider exports
export { 
  OpenAIClient, 
  OpenAIService, 
  OpenAIEnhancedService, 
  OpenAIMultiEndpointClient,
  createOpenAIConfigFromEnv,
  createDevelopmentConfig,
  validateOpenAIConfig,
  createOpenAIMultiConfig,
  createOpenAIWithProxy
} from './providers/openai';

export type { OpenAIConfig, OpenAIEnhancedConfig } from './providers/openai';
// Utility exports
export {
  AILogger,
  MemoryCacheManager,
  MemoryRateLimiter,
  RedisCacheManager,
  RedisRateLimiter,
} from './utils';
