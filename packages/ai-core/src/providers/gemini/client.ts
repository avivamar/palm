import type { GeminiConfig } from './types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIServiceError } from '../../core/errors';

export class GeminiClient {
  private client: GoogleGenerativeAI | null = null;
  private config: GeminiConfig | null = null;

  async initialize(config: GeminiConfig): Promise<void> {
    try {
      this.config = config;
      this.client = new GoogleGenerativeAI(config.apiKey);

      // Test the connection
      const model = this.client.getGenerativeModel({ model: this.getDefaultModel() });
      await model.generateContent('test');
    } catch (error) {
      throw new AIServiceError(
        'Failed to initialize Gemini client',
        'INITIALIZATION_FAILED',
        'gemini',
        error,
      );
    }
  }

  getClient(): GoogleGenerativeAI {
    if (!this.client) {
      throw new AIServiceError(
        'Gemini client not initialized',
        'CLIENT_NOT_INITIALIZED',
        'gemini',
      );
    }
    return this.client;
  }

  getConfig(): GeminiConfig {
    if (!this.config) {
      throw new AIServiceError(
        'Gemini client not configured',
        'CLIENT_NOT_CONFIGURED',
        'gemini',
      );
    }
    return this.config;
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.client) {
        return false;
      }

      const model = this.client.getGenerativeModel({ model: this.getDefaultModel() });
      await model.generateContent('test');

      return true;
    } catch {
      return false;
    }
  }

  getDefaultModel(): string {
    return this.config?.model || 'gemini-1.5-pro-latest';
  }
}
