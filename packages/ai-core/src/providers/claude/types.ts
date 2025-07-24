import type { AIMessage } from '../../core/types';

export type ClaudeConfig = {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  timeout?: number;
  retries?: number;
};

export type ClaudeMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ClaudeCompletionRequest = {
  model: string;
  max_tokens: number;
  messages: ClaudeMessage[];
  system?: string;
  temperature?: number;
  top_p?: number;
  stop_sequences?: string[];
  stream?: boolean;
};

export type ClaudeCompletionResponse = {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string | null;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
};

export type ClaudeStreamChunk = {
  type: string;
  index?: number;
  delta?: {
    type: string;
    text: string;
  };
  message?: {
    id: string;
    type: string;
    role: string;
    content: any[];
    model: string;
    stop_reason: string | null;
    stop_sequence: string | null;
    usage: {
      input_tokens: number;
      output_tokens: number;
    };
  };
};

export function toClaudeMessages(messages: AIMessage[]): { messages: ClaudeMessage[]; system?: string } {
  let system: string | undefined;
  const claudeMessages: ClaudeMessage[] = [];

  for (const message of messages) {
    if (message.role === 'system') {
      // Claude uses a separate system parameter
      system = message.content;
    } else if (message.role === 'user' || message.role === 'assistant') {
      claudeMessages.push({
        role: message.role,
        content: message.content,
      });
    }
  }

  return { messages: claudeMessages, system };
}
