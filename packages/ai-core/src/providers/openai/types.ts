import type { AIMessage, EnhancedProviderConfig } from '../../core/types';

export type OpenAIConfig = {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  timeout?: number;
  retries?: number;
};

export type OpenAIEnhancedConfig = EnhancedProviderConfig & {
  type: 'openai';
};

export type OpenAIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type OpenAICompletionRequest = {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
  stream?: boolean;
  user?: string;
};

export type OpenAICompletionResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type OpenAIStreamChunk = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }>;
};

export function toOpenAIMessages(messages: AIMessage[]): OpenAIMessage[] {
  return messages.map(msg => ({
    role: msg.role as 'system' | 'user' | 'assistant',
    content: msg.content,
  }));
}
