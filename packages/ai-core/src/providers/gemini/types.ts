import type { AIMessage } from '../../core/types';

export type GeminiConfig = {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  timeout?: number;
  retries?: number;
};

export type GeminiMessage = {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
};

export type GeminiRequest = {
  contents: GeminiMessage[];
  generationConfig?: {
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
  };
  safetySettings?: Array<{
    category: string;
    threshold: string;
  }>;
};

export type GeminiResponse = {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
      role: string;
    };
    finishReason: string;
    index: number;
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
};

export function toGeminiMessages(messages: AIMessage[]): GeminiMessage[] {
  return messages
    .filter(msg => msg.role !== 'system') // Gemini doesn't have explicit system messages
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));
}

export function getSystemPrompt(messages: AIMessage[]): string | undefined {
  const systemMessage = messages.find(msg => msg.role === 'system');
  return systemMessage?.content;
}
