export { OpenAIClient } from './client';
export { OpenAIService } from './service';
export { OpenAIEnhancedService } from './enhanced-service';
export { OpenAIMultiEndpointClient } from './multi-endpoint-client';
export { OpenAIEndpointManager } from './endpoint-manager';
export type { 
  OpenAICompletionRequest, 
  OpenAICompletionResponse, 
  OpenAIConfig, 
  OpenAIMessage,
  OpenAIEnhancedConfig 
} from './types';

// Configuration helpers
export {
  createOpenAIConfigFromEnv,
  createOpenAIMultiConfig,
  createOpenAIWithProxy,
  legacyToEnhanced,
  createDevelopmentConfig,
  validateOpenAIConfig,
  exampleConfigs,
} from './config-helper';
