import type { ClaudeConfig } from './types';
import Anthropic from '@anthropic-ai/sdk';
import { AIServiceError } from '../../core/errors';

export class ClaudeClient {
  private client: Anthropic | null = null;
  private config: ClaudeConfig | null = null;

  async initialize(config: ClaudeConfig): Promise<void> {
    try {
      this.config = config;
      this.client = new Anthropic({
        apiKey: config.apiKey,
        baseURL: config.baseUrl,
        timeout: config.timeout || 30000,
        maxRetries: config.retries || 3,
      });

      // Test the connection with a minimal request
      await this.client.messages.create({
        model: this.getDefaultModel(),
        max_tokens: 1,
        messages: [{ role: 'user', content: 'test' }],
      });
    } catch (error) {
      throw new AIServiceError(
        'Failed to initialize Claude client',
        'INITIALIZATION_FAILED',
        'claude',
        error,
      );
    }
  }

  getClient(): Anthropic {
    if (!this.client) {
      throw new AIServiceError(
        'Claude client not initialized',
        'CLIENT_NOT_INITIALIZED',
        'claude',
      );
    }
    return this.client;
  }

  getConfig(): ClaudeConfig {
    if (!this.config) {
      throw new AIServiceError(
        'Claude client not configured',
        'CLIENT_NOT_CONFIGURED',
        'claude',
      );
    }
    return this.config;
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.client) {
        return false;
      }

      // Simple health check with minimal token usage
      await this.client.messages.create({
        model: this.getDefaultModel(),
        max_tokens: 1,
        messages: [{ role: 'user', content: 'hi' }],
      });

      return true;
    } catch {
      return false;
    }
  }

  getDefaultModel(): string {
    return this.config?.model || 'claude-3-5-sonnet-20241022';
  }
}
