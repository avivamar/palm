import type { AIService } from '../../core/interfaces';
import type {
  AIMessage,
  AIResponse,
  ChatOptions,
  GenerateOptions,
  ProviderConfig,
  StreamChunk,
} from '../../core/types';
import type { OpenAIConfig } from './types';
import { AIServiceError } from '../../core/errors';
import { OpenAIClient } from './client';

export class OpenAIService implements AIService {
  private client: OpenAIClient;

  constructor() {
    this.client = new OpenAIClient();
  }

  async initialize(config: ProviderConfig): Promise<void> {
    const openaiConfig: OpenAIConfig = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
      timeout: config.timeout,
      retries: config.retries,
    };

    await this.client.initialize(openaiConfig);
  }

  async generateText(prompt: string, options?: GenerateOptions): Promise<string> {
    try {
      const openai = this.client.getClient();
      const model = this.client.getDefaultModel();

      const response = await openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature,
        max_tokens: options?.maxTokens,
        top_p: options?.topP,
        frequency_penalty: options?.frequencyPenalty ?? null,
        presence_penalty: options?.presencePenalty ?? null,
        stop: options?.stop ?? null,
        user: options?.userId,
      });

      const choice = response.choices[0];
      if (!choice?.message?.content) {
        throw new AIServiceError(
          'Empty response from OpenAI',
          'EMPTY_RESPONSE',
          'openai',
        );
      }

      return choice.message.content;
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(
        'OpenAI text generation failed',
        'GENERATION_FAILED',
        'openai',
        error,
      );
    }
  }

  async generateResponse(prompt: string, options?: GenerateOptions): Promise<AIResponse> {
    try {
      const openai = this.client.getClient();
      const model = this.client.getDefaultModel();

      const response = await openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature,
        max_tokens: options?.maxTokens,
        top_p: options?.topP,
        frequency_penalty: options?.frequencyPenalty ?? null,
        presence_penalty: options?.presencePenalty ?? null,
        stop: options?.stop ?? null,
        user: options?.userId,
      });

      const choice = response.choices[0];
      if (!choice?.message?.content) {
        throw new AIServiceError(
          'Empty response from OpenAI',
          'EMPTY_RESPONSE',
          'openai',
        );
      }

      return {
        content: choice.message.content,
        provider: 'openai',
        model: response.model,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
      };
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(
        'OpenAI response generation failed',
        'GENERATION_FAILED',
        'openai',
        error,
      );
    }
  }

  async* streamChat(messages: AIMessage[], options?: ChatOptions): AsyncGenerator<StreamChunk> {
    try {
      const openai = this.client.getClient();
      const model = this.client.getDefaultModel();

      // Import the type converter function
      const { toOpenAIMessages } = await import('./types');
      const openaiMessages = toOpenAIMessages(messages);

      const stream = await openai.chat.completions.create({
        model,
        messages: openaiMessages,
        temperature: options?.temperature,
        max_tokens: options?.maxTokens,
        top_p: options?.topP,
        frequency_penalty: options?.frequencyPenalty ?? null,
        presence_penalty: options?.presencePenalty ?? null,
        stop: options?.stop ?? null,
        stream: true,
        user: options?.userId,
      });

      let fullContent = '';

      for await (const chunk of stream) {
        const choice = chunk.choices?.[0];
        const delta = choice?.delta?.content || '';

        if (delta) {
          fullContent += delta;

          yield {
            content: fullContent,
            delta,
            done: false,
            provider: 'openai',
            metadata: {
              model: chunk.model,
              finishReason: choice?.finish_reason || null,
            },
          };
        }

        if (choice?.finish_reason) {
          yield {
            content: fullContent,
            delta: '',
            done: true,
            provider: 'openai',
            metadata: {
              model: chunk.model,
              finishReason: choice?.finish_reason || null,
            },
          };
          break;
        }
      }
    } catch (error) {
      throw new AIServiceError(
        'OpenAI stream chat failed',
        'STREAM_FAILED',
        'openai',
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
      provider: 'openai',
      capabilities: ['text-generation', 'chat', 'streaming'],
    };
  }
}
