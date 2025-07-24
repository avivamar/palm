import type { AIMessage, AIProvider, ChatOptions, StreamChunk } from '../../core/types';

export type ChatSession = {
  id: string;
  userId?: string;
  provider: AIProvider;
  model: string;
  messages: AIMessage[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
};

export type ChatRequest = {
  sessionId?: string;
  messages: AIMessage[];
  provider?: AIProvider;
  options?: ChatOptions;
};

export type ChatResponse = {
  sessionId: string;
  message: AIMessage;
  provider: AIProvider;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cached?: boolean;
};

export type StreamChatRequest = {
  stream: true;
} & ChatRequest;

export type StreamChatResponse = {
  sessionId: string;
  chunks: AsyncGenerator<StreamChunk>;
};

export type ChatConfig = {
  defaultProvider: AIProvider;
  maxMessages: number;
  autoSummarize: boolean;
  summarizeThreshold: number;
  enableCache: boolean;
  cacheTTL: number;
};

export type ChatSessionManager = {
  createSession: (userId?: string, provider?: AIProvider) => Promise<ChatSession>;
  getSession: (sessionId: string) => Promise<ChatSession | null>;
  updateSession: (sessionId: string, messages: AIMessage[]) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  listSessions: (userId?: string) => Promise<ChatSession[]>;
  cleanupExpiredSessions: () => Promise<number>;
};
