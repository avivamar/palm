import type { AIService } from '../../core/interfaces';
import type {
  AIMessage,
  AIResponse,
  ChatOptions,
  GenerateOptions,
  ProviderConfig,
  StreamChunk,
  EnhancedProviderConfig,
} from '../../core/types';
import type { OpenAIConfig, OpenAIEnhancedConfig } from './types';
import { AIServiceError } from '../../core/errors';
import { OpenAIClient } from './client';
import { OpenAIMultiEndpointClient } from './multi-endpoint-client';
import { toOpenAIMessages } from './types';

export class OpenAIEnhancedService implements AIService {
  private multiClient: OpenAIMultiEndpointClient | null = null;
  private legacyClient: OpenAIClient | null = null;
  private isEnhancedMode = false;

  constructor() {
    // Initialize based on config type later
  }

  /**
   * Initialize with either enhanced or legacy config
   */
  async initialize(config: ProviderConfig | EnhancedProviderConfig): Promise<void> {
    try {
      // Check if this is an enhanced config
      if (this.isEnhancedProviderConfig(config)) {
        await this.initializeEnhanced(config as OpenAIEnhancedConfig);
      } else {
        await this.initializeLegacy(config as ProviderConfig);
      }
    } catch (error) {
      throw new AIServiceError(
        'Failed to initialize OpenAI service',
        'INITIALIZATION_FAILED',
        'openai',
        error,
      );
    }
  }

  /**
   * Initialize with enhanced multi-endpoint config
   */
  private async initializeEnhanced(config: OpenAIEnhancedConfig): Promise<void> {
    this.multiClient = new OpenAIMultiEndpointClient(config);
    this.isEnhancedMode = true;
    
    console.log(`OpenAI Enhanced Service initialized with ${config.endpoints.length} endpoints`);
  }

  /**
   * Initialize with legacy single-endpoint config
   */
  private async initializeLegacy(config: ProviderConfig): Promise<void> {
    this.legacyClient = new OpenAIClient();
    
    const openaiConfig: OpenAIConfig = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
      timeout: config.timeout,
      retries: config.retries,
    };

    await this.legacyClient.initialize(openaiConfig);
    this.isEnhancedMode = false;
    
    console.log('OpenAI Legacy Service initialized with single endpoint');
  }

  /**
   * Type guard to check if config is enhanced
   */
  private isEnhancedProviderConfig(config: any): boolean {
    return config && 
           typeof config === 'object' &&
           Array.isArray(config.endpoints) &&
           config.endpoints.length > 0;
  }

  async generateText(prompt: string, options?: GenerateOptions): Promise<string> {
    try {
      if (this.isEnhancedMode && this.multiClient) {
        const response = await this.multiClient.createChatCompletion({
          model: this.multiClient.getDefaultModel(),
          messages: [{ role: 'user', content: prompt }],
          temperature: options?.temperature,
          max_tokens: options?.maxTokens,
          top_p: options?.topP,
          frequency_penalty: options?.frequencyPenalty ?? undefined,
          presence_penalty: options?.presencePenalty ?? undefined,
          stop: options?.stop ?? undefined,
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
      }

      // Fallback to legacy client
      if (!this.legacyClient) {
        throw new AIServiceError(
          'No OpenAI client available',
          'CLIENT_NOT_INITIALIZED',
          'openai',
        );
      }

      return await this.legacyClient.getClient().chat.completions.create({
        model: this.legacyClient.getDefaultModel(),
        messages: [{ role: 'user', content: prompt }],
        temperature: options?.temperature,
        max_tokens: options?.maxTokens,
        top_p: options?.topP,
        frequency_penalty: options?.frequencyPenalty ?? null,
        presence_penalty: options?.presencePenalty ?? null,
        stop: options?.stop ?? null,
        user: options?.userId,
      }).then(response => {
        const choice = response.choices[0];
        if (!choice?.message?.content) {
          throw new AIServiceError(
            'Empty response from OpenAI',
            'EMPTY_RESPONSE',
            'openai',
          );
        }
        return choice.message.content;
      });
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
      if (this.isEnhancedMode && this.multiClient) {
        const response = await this.multiClient.createChatCompletion({
          model: this.multiClient.getDefaultModel(),
          messages: [{ role: 'user', content: prompt }],
          temperature: options?.temperature,
          max_tokens: options?.maxTokens,
          top_p: options?.topP,
          frequency_penalty: options?.frequencyPenalty ?? undefined,
          presence_penalty: options?.presencePenalty ?? undefined,
          stop: options?.stop ?? undefined,
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
          metadata: {
            endpointUsed: 'multi-endpoint',
            statistics: this.multiClient.getStatistics(),
          },
        };
      }

      // Fallback to legacy client
      if (!this.legacyClient) {
        throw new AIServiceError(
          'No OpenAI client available',
          'CLIENT_NOT_INITIALIZED',
          'openai',
        );
      }

      const openai = this.legacyClient.getClient();
      const model = this.legacyClient.getDefaultModel();

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
        metadata: {
          endpointUsed: 'legacy-single',
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
      if (this.isEnhancedMode && this.multiClient) {
        const openaiMessages = toOpenAIMessages(messages);
        
        const stream = await this.multiClient.createChatCompletionStream({
          model: this.multiClient.getDefaultModel(),
          messages: openaiMessages,
          temperature: options?.temperature,
          max_tokens: options?.maxTokens,
          top_p: options?.topP,
          frequency_penalty: options?.frequencyPenalty ?? undefined,
          presence_penalty: options?.presencePenalty ?? undefined,
          stop: options?.stop ?? undefined,
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
                endpointMode: 'multi-endpoint',
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
                endpointMode: 'multi-endpoint',
                statistics: this.multiClient.getStatistics(),
              },
            };
            break;
          }
        }
        return;
      }

      // Fallback to legacy client
      if (!this.legacyClient) {
        throw new AIServiceError(
          'No OpenAI client available',
          'CLIENT_NOT_INITIALIZED',
          'openai',
        );
      }

      const openai = this.legacyClient.getClient();
      const model = this.legacyClient.getDefaultModel();
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
              endpointMode: 'legacy-single',
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
              endpointMode: 'legacy-single',
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
    try {
      if (this.isEnhancedMode && this.multiClient) {
        const health = await this.multiClient.checkHealth();
        return health.healthy > 0;
      }

      if (this.legacyClient) {
        return await this.legacyClient.isHealthy();
      }

      return false;
    } catch {
      return false;
    }
  }

  getModelInfo() {
    if (this.isEnhancedMode && this.multiClient) {
      return {
        name: this.multiClient.getDefaultModel(),
        provider: 'openai',
        capabilities: ['text-generation', 'chat', 'streaming'],
        mode: 'multi-endpoint',
        statistics: this.multiClient.getStatistics(),
      };
    }

    if (this.legacyClient) {
      return {
        name: this.legacyClient.getDefaultModel(),
        provider: 'openai',
        capabilities: ['text-generation', 'chat', 'streaming'],
        mode: 'single-endpoint',
      };
    }

    return {
      name: 'unknown',
      provider: 'openai',
      capabilities: [],
      mode: 'not-initialized',
    };
  }

  /**
   * Get detailed health information for all endpoints (enhanced mode only)
   */
  async getDetailedHealth() {
    if (this.isEnhancedMode && this.multiClient) {
      return await this.multiClient.checkHealth();
    }

    if (this.legacyClient) {
      const healthy = await this.legacyClient.isHealthy();
      return {
        healthy: healthy ? 1 : 0,
        total: 1,
        endpoints: [{
          url: 'legacy-endpoint',
          priority: 1,
          healthy,
          responseTime: undefined,
        }],
      };
    }

    return {
      healthy: 0,
      total: 0,
      endpoints: [],
    };
  }
}