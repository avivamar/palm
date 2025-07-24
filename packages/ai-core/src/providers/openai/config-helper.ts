import type { OpenAIEnhancedConfig, OpenAIConfig } from './types';
import type { ProviderEndpoint } from '../../core/types';

/**
 * Helper functions to create OpenAI multi-endpoint configurations
 */

/**
 * Create OpenAI enhanced config from environment variables
 * 
 * Example environment variables:
 * OPENAI_API_KEY_1=sk-xxx
 * OPENAI_BASE_URL_1=https://api.openai.com/v1
 * OPENAI_PRIORITY_1=1
 * 
 * OPENAI_API_KEY_2=proxy-key-xxx
 * OPENAI_BASE_URL_2=https://proxy-api.com/v1
 * OPENAI_PRIORITY_2=2
 */
export function createOpenAIConfigFromEnv(): OpenAIEnhancedConfig | null {
  const endpoints: ProviderEndpoint[] = [];
  
  // Try to find all numbered endpoint configurations
  for (let i = 1; i <= 10; i++) {
    const apiKey = process.env[`OPENAI_API_KEY_${i}`];
    const baseUrl = process.env[`OPENAI_BASE_URL_${i}`] || 'https://api.openai.com/v1';
    
    if (!apiKey) {
      if (i === 1) {
        // If no numbered keys, try the standard key
        const standardKey = process.env.OPENAI_API_KEY;
        if (standardKey) {
          endpoints.push({
            url: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
            apiKey: standardKey,
            priority: 1,
            maxRPS: 100,
            timeout: 30000,
            weight: 100,
            enabled: true,
          });
        }
      }
      continue;
    }
    
    const priority = parseInt(process.env[`OPENAI_PRIORITY_${i}`] || i.toString(), 10);
    const maxRPS = parseInt(process.env[`OPENAI_MAX_RPS_${i}`] || '100', 10);
    const timeout = parseInt(process.env[`OPENAI_TIMEOUT_${i}`] || '30000', 10);
    const weight = parseInt(process.env[`OPENAI_WEIGHT_${i}`] || '100', 10);
    const enabled = process.env[`OPENAI_ENABLED_${i}`] !== 'false';
    
    endpoints.push({
      url: baseUrl,
      apiKey,
      priority,
      maxRPS,
      timeout,
      weight,
      enabled,
      healthCheck: process.env[`OPENAI_HEALTH_CHECK_${i}`],
    });
  }
  
  if (endpoints.length === 0) {
    return null;
  }
  
  // Sort by priority
  endpoints.sort((a, b) => a.priority - b.priority);
  
  return {
    name: 'openai-multi',
    type: 'openai',
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    endpoints,
    fallback: {
      enabled: process.env.OPENAI_FALLBACK_ENABLED !== 'false',
      maxRetries: parseInt(process.env.OPENAI_MAX_RETRIES || '3', 10),
      backoffMs: parseInt(process.env.OPENAI_BACKOFF_MS || '1000', 10),
      circuitBreaker: process.env.OPENAI_CIRCUIT_BREAKER !== 'false',
    },
  };
}

/**
 * Create a pre-configured OpenAI setup for common use cases
 */
export function createOpenAIMultiConfig(
  name: string,
  endpoints: Array<{
    apiKey: string;
    baseUrl?: string;
    priority?: number;
    maxRPS?: number;
  }>,
  options?: {
    model?: string;
    maxRetries?: number;
    backoffMs?: number;
    circuitBreaker?: boolean;
  }
): OpenAIEnhancedConfig {
  const processedEndpoints: ProviderEndpoint[] = endpoints.map((ep, index) => ({
    url: ep.baseUrl || 'https://api.openai.com/v1',
    apiKey: ep.apiKey,
    priority: ep.priority || (index + 1),
    maxRPS: ep.maxRPS || 100,
    timeout: 30000,
    weight: 100,
    enabled: true,
  }));
  
  return {
    name,
    type: 'openai',
    model: options?.model || 'gpt-4-turbo-preview',
    endpoints: processedEndpoints,
    fallback: {
      enabled: true,
      maxRetries: options?.maxRetries || 3,
      backoffMs: options?.backoffMs || 1000,
      circuitBreaker: options?.circuitBreaker !== false,
    },
  };
}

/**
 * Create OpenAI config with official + proxy endpoints
 */
export function createOpenAIWithProxy(
  officialKey: string,
  proxyKey: string,
  proxyUrl: string,
  options?: {
    model?: string;
    proxyPriority?: number;
  }
): OpenAIEnhancedConfig {
  return createOpenAIMultiConfig(
    'openai-with-proxy',
    [
      {
        apiKey: officialKey,
        baseUrl: 'https://api.openai.com/v1',
        priority: 1,
        maxRPS: 100,
      },
      {
        apiKey: proxyKey,
        baseUrl: proxyUrl,
        priority: options?.proxyPriority || 2,
        maxRPS: 50,
      },
    ],
    {
      model: options?.model,
    }
  );
}

/**
 * Convert legacy single endpoint config to enhanced multi-endpoint config
 */
export function legacyToEnhanced(
  legacyConfig: OpenAIConfig,
  name: string = 'openai-converted'
): OpenAIEnhancedConfig {
  return {
    name,
    type: 'openai',
    model: legacyConfig.model,
    endpoints: [
      {
        url: legacyConfig.baseUrl || 'https://api.openai.com/v1',
        apiKey: legacyConfig.apiKey,
        priority: 1,
        maxRPS: 100,
        timeout: legacyConfig.timeout || 30000,
        weight: 100,
        enabled: true,
      },
    ],
    fallback: {
      enabled: true,
      maxRetries: legacyConfig.retries || 3,
      backoffMs: 1000,
      circuitBreaker: true,
    },
  };
}

/**
 * Create a default OpenAI config for development
 */
export function createDevelopmentConfig(): OpenAIEnhancedConfig | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  
  return {
    name: 'openai-dev',
    type: 'openai',
    model: 'gpt-4-turbo-preview',
    endpoints: [
      {
        url: 'https://api.openai.com/v1',
        apiKey,
        priority: 1,
        maxRPS: 50, // Lower for development
        timeout: 30000,
        weight: 100,
        enabled: true,
      },
    ],
    fallback: {
      enabled: false, // Disabled for development
      maxRetries: 1,
      backoffMs: 500,
      circuitBreaker: false,
    },
  };
}

/**
 * Validate OpenAI enhanced config
 */
export function validateOpenAIConfig(config: OpenAIEnhancedConfig): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check basic structure
  if (!config.name) errors.push('Config name is required');
  if (config.type !== 'openai') errors.push('Config type must be "openai"');
  
  // Check endpoints
  if (!Array.isArray(config.endpoints) || config.endpoints.length === 0) {
    errors.push('At least one endpoint is required');
  } else {
    config.endpoints.forEach((endpoint, index) => {
      if (!endpoint.url) errors.push(`Endpoint ${index + 1}: URL is required`);
      if (!endpoint.apiKey) errors.push(`Endpoint ${index + 1}: API key is required`);
      if (endpoint.priority < 1 || endpoint.priority > 10) {
        warnings.push(`Endpoint ${index + 1}: Priority should be between 1-10`);
      }
      if (!endpoint.url.startsWith('https://')) {
        warnings.push(`Endpoint ${index + 1}: URL should use HTTPS`);
      }
    });
    
    // Check for duplicate priorities
    const priorities = config.endpoints.map(ep => ep.priority);
    const duplicatePriorities = priorities.filter((p, i) => priorities.indexOf(p) !== i);
    if (duplicatePriorities.length > 0) {
      warnings.push(`Duplicate priorities found: ${duplicatePriorities.join(', ')}`);
    }
  }
  
  // Check fallback config
  if (config.fallback.maxRetries < 0 || config.fallback.maxRetries > 10) {
    warnings.push('maxRetries should be between 0-10');
  }
  if (config.fallback.backoffMs < 0) {
    warnings.push('backoffMs should be positive');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Example configurations for common scenarios
 */
export const exampleConfigs = {
  /**
   * Official API + Backup proxy
   */
  officialWithBackup: (officialKey: string, backupKey: string, backupUrl: string): OpenAIEnhancedConfig => ({
    name: 'openai-with-backup',
    type: 'openai',
    model: 'gpt-4-turbo-preview',
    endpoints: [
      {
        url: 'https://api.openai.com/v1',
        apiKey: officialKey,
        priority: 1,
        maxRPS: 100,
        timeout: 30000,
        weight: 70,
        enabled: true,
      },
      {
        url: backupUrl,
        apiKey: backupKey,
        priority: 2,
        maxRPS: 50,
        timeout: 25000,
        weight: 30,
        enabled: true,
      },
    ],
    fallback: {
      enabled: true,
      maxRetries: 3,
      backoffMs: 1000,
      circuitBreaker: true,
    },
  }),

  /**
   * Load balanced setup
   */
  loadBalanced: (endpoints: Array<{key: string, url: string}>): OpenAIEnhancedConfig => ({
    name: 'openai-load-balanced',
    type: 'openai',
    model: 'gpt-4-turbo-preview',
    endpoints: endpoints.map((ep, _index) => ({
      url: ep.url,
      apiKey: ep.key,
      priority: 1, // Same priority for load balancing
      maxRPS: 100,
      timeout: 30000,
      weight: Math.floor(100 / endpoints.length),
      enabled: true,
    })),
    fallback: {
      enabled: true,
      maxRetries: endpoints.length - 1,
      backoffMs: 500,
      circuitBreaker: true,
    },
  }),
};