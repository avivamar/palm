import type { AIService } from '../../core/interfaces';
import type {
  AIMessage,
  AIResponse,
  ChatOptions,
  GenerateOptions,
  ProviderConfig,
  StreamChunk,
} from '../../core/types';
import type { ClaudeConfig } from './types';
import { AIServiceError } from '../../core/errors';
import { ClaudeClient } from './client';

export class ClaudeService implements AIService {
  private client: ClaudeClient;

  constructor() {
    this.client = new ClaudeClient();
  }

  async initialize(config: ProviderConfig): Promise<void> {
    const claudeConfig: ClaudeConfig = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
      timeout: config.timeout,
      retries: config.retries,
    };

    await this.client.initialize(claudeConfig);
  }

  async generateText(prompt: string, options?: GenerateOptions): Promise<string> {
    try {
      const anthropic = this.client.getClient();
      const model = this.client.getDefaultModel();

      const response = await anthropic.messages.create({
        model,
        max_tokens: options?.maxTokens || 1000,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature,
        top_p: options?.topP,
        stop_sequences: options?.stop,
      });

      const content = response.content[0];
      if (!content || content.type !== 'text') {
        throw new AIServiceError(
          'Invalid response format from Claude',
          'INVALID_RESPONSE',
          'claude',
        );
      }

      return content.text;
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(
        'Claude text generation failed',
        'GENERATION_FAILED',
        'claude',
        error,
      );
    }
  }

  async generateResponse(prompt: string, options?: GenerateOptions): Promise<AIResponse> {
    try {
      const anthropic = this.client.getClient();
      const model = this.client.getDefaultModel();

      const response = await anthropic.messages.create({
        model,
        max_tokens: options?.maxTokens || 1000,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature,
        top_p: options?.topP,
        stop_sequences: options?.stop,
      });

      const content = response.content[0];
      if (!content || content.type !== 'text') {
        throw new AIServiceError(
          'Invalid response format from Claude',
          'INVALID_RESPONSE',
          'claude',
        );
      }

      return {
        content: content.text,
        provider: 'claude',
        model: response.model,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
      };
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(
        'Claude response generation failed',
        'GENERATION_FAILED',
        'claude',
        error,
      );
    }
  }

  async* streamChat(messages: AIMessage[], options?: ChatOptions): AsyncGenerator<StreamChunk> {
    try {
      const anthropic = this.client.getClient();
      const model = this.client.getDefaultModel();

      // Import the type converter function
      const { toClaudeMessages } = await import('./types');
      const { messages: claudeMessages, system } = toClaudeMessages(messages);

      const stream = await anthropic.messages.create({
        model,
        max_tokens: options?.maxTokens || 1000,
        messages: claudeMessages,
        system,
        temperature: options?.temperature,
        top_p: options?.topP,
        stop_sequences: options?.stop,
        stream: true,
      });

      let fullContent = '';

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          const delta = event.delta.text;
          fullContent += delta;

          yield {
            content: fullContent,
            delta,
            done: false,
            provider: 'claude',
            metadata: {
              model,
              eventType: event.type,
            },
          };
        }

        if (event.type === 'message_stop') {
          yield {
            content: fullContent,
            delta: '',
            done: true,
            provider: 'claude',
            metadata: {
              model,
              eventType: event.type,
            },
          };
          break;
        }
      }
    } catch (error) {
      throw new AIServiceError(
        'Claude stream chat failed',
        'STREAM_FAILED',
        'claude',
        error,
      );
    }
  }

  async isHealthy(): Promise<boolean> {
    return this.client.isHealthy();
  }

  getModelInfo() {
    return {
      name: this.client.getDefaultModel(),
      provider: 'claude',
      capabilities: ['text-generation', 'chat', 'streaming'],
    };
  }
}
