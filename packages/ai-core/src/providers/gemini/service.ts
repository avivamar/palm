import type { AIService } from '../../core/interfaces';
import type {
  AIMessage,
  AIResponse,
  ChatOptions,
  GenerateOptions,
  ProviderConfig,
  StreamChunk,
} from '../../core/types';
import type { GeminiConfig } from './types';
import { AIServiceError } from '../../core/errors';
import { GeminiClient } from './client';

export class GeminiService implements AIService {
  private client: GeminiClient;

  constructor() {
    this.client = new GeminiClient();
  }

  async initialize(config: ProviderConfig): Promise<void> {
    const geminiConfig: GeminiConfig = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
      timeout: config.timeout,
      retries: config.retries,
    };

    await this.client.initialize(geminiConfig);
  }

  async generateText(prompt: string, options?: GenerateOptions): Promise<string> {
    try {
      const genAI = this.client.getClient();
      const model = genAI.getGenerativeModel({
        model: this.client.getDefaultModel(),
        generationConfig: {
          temperature: options?.temperature,
          topP: options?.topP,
          maxOutputTokens: options?.maxTokens,
          stopSequences: options?.stop,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new AIServiceError(
          'Empty response from Gemini',
          'EMPTY_RESPONSE',
          'gemini',
        );
      }

      return text;
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(
        'Gemini text generation failed',
        'GENERATION_FAILED',
        'gemini',
        error,
      );
    }
  }

  async generateResponse(prompt: string, options?: GenerateOptions): Promise<AIResponse> {
    try {
      const genAI = this.client.getClient();
      const model = genAI.getGenerativeModel({
        model: this.client.getDefaultModel(),
        generationConfig: {
          temperature: options?.temperature,
          topP: options?.topP,
          maxOutputTokens: options?.maxTokens,
          stopSequences: options?.stop,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new AIServiceError(
          'Empty response from Gemini',
          'EMPTY_RESPONSE',
          'gemini',
        );
      }

      // Access usage metadata safely - it may not be available in all responses
      const usage = (response as any).usageMetadata;

      return {
        content: text,
        provider: 'gemini',
        model: this.client.getDefaultModel(),
        usage: usage
          ? {
              promptTokens: usage.promptTokenCount || 0,
              completionTokens: usage.candidatesTokenCount || 0,
              totalTokens: usage.totalTokenCount || 0,
            }
          : undefined,
      };
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(
        'Gemini response generation failed',
        'GENERATION_FAILED',
        'gemini',
        error,
      );
    }
  }

  async* streamChat(messages: AIMessage[], options?: ChatOptions): AsyncGenerator<StreamChunk> {
    try {
      const genAI = this.client.getClient();
      const model = genAI.getGenerativeModel({
        model: this.client.getDefaultModel(),
        generationConfig: {
          temperature: options?.temperature,
          topP: options?.topP,
          maxOutputTokens: options?.maxTokens,
          stopSequences: options?.stop,
        },
      });

      // Import the helper functions
      const { toGeminiMessages, getSystemPrompt } = await import('./types');
      const geminiMessages = toGeminiMessages(messages);
      const systemPrompt = getSystemPrompt(messages);

      // If there's a system prompt, prepend it to the first user message
      if (systemPrompt && geminiMessages.length > 0 && geminiMessages[0]?.role === 'user') {
        const firstMessage = geminiMessages[0];
        if (firstMessage.parts?.[0]?.text) {
          firstMessage.parts[0].text = `${systemPrompt}\n\n${firstMessage.parts[0].text}`;
        }
      }

      const chat = model.startChat({
        history: geminiMessages.slice(0, -1), // All messages except the last one
      });

      const lastMessage = geminiMessages[geminiMessages.length - 1];
      if (!lastMessage || lastMessage.role !== 'user') {
        throw new AIServiceError(
          'Last message must be from user',
          'INVALID_MESSAGE_SEQUENCE',
          'gemini',
        );
      }

      const result = await chat.sendMessageStream(lastMessage.parts?.[0]?.text || '');
      let fullContent = '';

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          fullContent += chunkText;

          yield {
            content: fullContent,
            delta: chunkText,
            done: false,
            provider: 'gemini',
            metadata: {
              model: this.client.getDefaultModel(),
            },
          };
        }
      }

      yield {
        content: fullContent,
        delta: '',
        done: true,
        provider: 'gemini',
        metadata: {
          model: this.client.getDefaultModel(),
        },
      };
    } catch (error) {
      throw new AIServiceError(
        'Gemini stream chat failed',
        'STREAM_FAILED',
        'gemini',
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
      provider: 'gemini',
      capabilities: ['text-generation', 'chat', 'streaming'],
    };
  }
}
