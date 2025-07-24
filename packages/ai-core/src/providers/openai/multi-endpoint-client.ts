import type { OpenAIEnhancedConfig, OpenAIConfig } from './types';
import type { ProviderEndpoint } from '../../core/types';
import OpenAI from 'openai';
import { AIServiceError } from '../../core/errors';
import { OpenAIEndpointManager } from './endpoint-manager';

export class OpenAIMultiEndpointClient {
  private endpointManager: OpenAIEndpointManager;
  private clients: Map<string, OpenAI> = new Map();
  private config: OpenAIEnhancedConfig;
  private fallbackConfig: OpenAIEnhancedConfig['fallback'];

  constructor(config: OpenAIEnhancedConfig) {
    this.config = config;
    this.fallbackConfig = config.fallback;
    this.endpointManager = new OpenAIEndpointManager(config.endpoints);
    
    // Initialize all clients
    this.initializeClients();
  }

  private initializeClients(): void {
    this.config.endpoints
      .filter(ep => ep.enabled)
      .forEach(endpoint => {
        try {
          const client = new OpenAI({
            apiKey: endpoint.apiKey,
            baseURL: endpoint.url,
            timeout: endpoint.timeout || 30000,
            maxRetries: 0, // We handle retries ourselves
          });
          
          this.clients.set(endpoint.url, client);
        } catch (error) {
          console.error(`Failed to initialize OpenAI client for endpoint ${endpoint.url}:`, error);
          this.endpointManager.recordFailure(endpoint.url, error as Error);
        }
      });
  }

  /**
   * Make a request with automatic endpoint selection and fallback
   */
  async makeRequest<T>(
    requestFn: (client: OpenAI, endpoint: ProviderEndpoint) => Promise<T>,
    operation: string = 'request'
  ): Promise<T> {
    let lastError: Error | null = null;
    let attempts = 0;
    const maxAttempts = this.fallbackConfig.enabled ? 
      Math.min(this.fallbackConfig.maxRetries + 1, this.config.endpoints.length) : 1;

    while (attempts < maxAttempts) {
      const endpoint = this.endpointManager.getBestEndpoint();
      
      if (!endpoint) {
        throw new AIServiceError(
          'No healthy endpoints available',
          'NO_ENDPOINTS_AVAILABLE',
          'openai',
          lastError
        );
      }

      const client = this.clients.get(endpoint.url);
      if (!client) {
        console.error(`No client found for endpoint ${endpoint.url}`);
        this.endpointManager.recordFailure(endpoint.url, new Error('Client not found'));
        attempts++;
        continue;
      }

      try {
        const startTime = Date.now();
        const result = await requestFn(client, endpoint);
        const responseTime = Date.now() - startTime;
        
        this.endpointManager.recordSuccess(endpoint.url, responseTime);
        
        console.log(`OpenAI ${operation} successful via ${endpoint.url} (${responseTime}ms)`);
        return result;
        
      } catch (error) {
        lastError = error as Error;
        attempts++;
        
        this.endpointManager.recordFailure(endpoint.url, lastError);
        
        console.warn(`OpenAI ${operation} failed via ${endpoint.url} (attempt ${attempts}/${maxAttempts}):`, lastError.message);
        
        // If we have more attempts, wait before retrying
        if (attempts < maxAttempts && this.fallbackConfig.backoffMs > 0) {
          const backoffTime = this.fallbackConfig.backoffMs * Math.pow(2, attempts - 1); // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, backoffTime));
        }
      }
    }

    throw new AIServiceError(
      `OpenAI ${operation} failed after ${attempts} attempts`,
      'MAX_RETRIES_EXCEEDED',
      'openai',
      lastError
    );
  }

  /**
   * Create a chat completion with automatic endpoint selection
   */
  async createChatCompletion(
    params: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    return this.makeRequest(
      async (client, _endpoint) => {
        // Use the model from endpoint config if not specified
        const finalParams = {
          ...params,
          model: params.model || this.config.model || 'gpt-4-turbo-preview'
        };
        
        return await client.chat.completions.create(finalParams);
      },
      'chat-completion'
    );
  }

  /**
   * Create a streaming chat completion with automatic endpoint selection
   */
  async createChatCompletionStream(
    params: OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming
  ): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>> {
    return this.makeRequest(
      async (client, _endpoint) => {
        // Use the model from endpoint config if not specified
        const finalParams = {
          ...params,
          model: params.model || this.config.model || 'gpt-4-turbo-preview',
          stream: true as const
        };
        
        return await client.chat.completions.create(finalParams);
      },
      'stream-completion'
    );
  }

  /**
   * List available models from the best endpoint
   */
  async listModels(): Promise<OpenAI.Models.ModelsPage> {
    return this.makeRequest(
      async (client) => await client.models.list(),
      'list-models'
    );
  }

  /**
   * Health check all endpoints
   */
  async checkHealth(): Promise<{
    healthy: number;
    total: number;
    endpoints: Array<{
      url: string;
      priority: number;
      healthy: boolean;
      responseTime?: number;
      error?: string;
    }>;
  }> {
    const results = await Promise.allSettled(
      this.config.endpoints.map(async (endpoint) => {
        const client = this.clients.get(endpoint.url);
        if (!client) {
          return {
            url: endpoint.url,
            priority: endpoint.priority,
            healthy: false,
            error: 'Client not initialized'
          };
        }

        try {
          const startTime = Date.now();
          await client.models.list();
          const responseTime = Date.now() - startTime;
          
          return {
            url: endpoint.url,
            priority: endpoint.priority,
            healthy: true,
            responseTime
          };
        } catch (error) {
          return {
            url: endpoint.url,
            priority: endpoint.priority,
            healthy: false,
            error: (error as Error).message
          };
        }
      })
    );

    const endpoints = results.map((result) => 
      result.status === 'fulfilled' ? result.value : {
        url: 'unknown',
        priority: 999,
        healthy: false,
        error: 'Promise rejected'
      }
    );

    const healthyCount = endpoints.filter(ep => ep.healthy).length;

    return {
      healthy: healthyCount,
      total: endpoints.length,
      endpoints
    };
  }

  /**
   * Get endpoint statistics
   */
  getStatistics() {
    return this.endpointManager.getStatistics();
  }

  /**
   * Get fallback to legacy single-endpoint client
   */
  getLegacyClient(): OpenAI | null {
    const endpoint = this.endpointManager.getBestEndpoint();
    return endpoint ? this.clients.get(endpoint.url) || null : null;
  }

  /**
   * Get default model
   */
  getDefaultModel(): string {
    return this.config.model || 'gpt-4-turbo-preview';
  }

  /**
   * Create a legacy config for backward compatibility
   */
  toLegacyConfig(): OpenAIConfig | null {
    const endpoint = this.endpointManager.getBestEndpoint();
    if (!endpoint) return null;

    return {
      apiKey: endpoint.apiKey,
      baseUrl: endpoint.url,
      model: this.config.model,
      timeout: endpoint.timeout,
      retries: this.fallbackConfig.maxRetries,
    };
  }
}

// Import Stream type from OpenAI for streaming responses
type Stream<T> = AsyncIterable<T> & {
  controller: AbortController;
};