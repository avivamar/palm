import type { OpenAIConfig } from './types';
import OpenAI from 'openai';
import { AIServiceError } from '../../core/errors';

export class OpenAIClient {
  private client: OpenAI | null = null;
  private config: OpenAIConfig | null = null;

  async initialize(config: OpenAIConfig): Promise<void> {
    try {
      this.config = config;
      this.client = new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseUrl,
        timeout: config.timeout || 30000,
        maxRetries: config.retries || 3,
      });

      // Test the connection
      await this.client.models.list();
    } catch (error) {
      throw new AIServiceError(
        'Failed to initialize OpenAI client',
        'INITIALIZATION_FAILED',
        'openai',
        error,
      );
    }
  }

  getClient(): OpenAI {
    if (!this.client) {
      throw new AIServiceError(
        'OpenAI client not initialized',
        'CLIENT_NOT_INITIALIZED',
        'openai',
      );
    }
    return this.client;
  }

  getConfig(): OpenAIConfig {
    if (!this.config) {
      throw new AIServiceError(
        'OpenAI client not configured',
        'CLIENT_NOT_CONFIGURED',
        'openai',
      );
    }
    return this.config;
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.client) {
        return false;
      }
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }

  getDefaultModel(): string {
    return this.config?.model || 'gpt-4-turbo-preview';
  }
}
