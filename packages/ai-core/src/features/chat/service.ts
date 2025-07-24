import type { AIManager } from '../../core/manager';
import type { AIMessage, AIProvider } from '../../core/types';
import type {
  ChatConfig,
  ChatRequest,
  ChatResponse,
  ChatSession,
  ChatSessionManager,
  StreamChatRequest,
  StreamChatResponse,
} from './types';
import { v4 as uuidv4 } from 'uuid';
import { AILogger } from '../../utils/logger';

export class ChatService {
  private aiManager: AIManager;
  private sessionManager: ChatSessionManager | null = null;
  private logger: AILogger;
  private config: ChatConfig;

  constructor(aiManager: AIManager, sessionManager?: ChatSessionManager, config?: Partial<ChatConfig>) {
    this.aiManager = aiManager;
    this.sessionManager = sessionManager || null;
    this.logger = AILogger.getInstance();

    this.config = {
      defaultProvider: 'claude',
      maxMessages: 50,
      autoSummarize: false,
      summarizeThreshold: 40,
      enableCache: true,
      cacheTTL: 3600,
      ...config,
    };
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now();

    try {
      // Get or create session
      let session: ChatSession;
      if (request.sessionId && this.sessionManager) {
        session = await this.sessionManager.getSession(request.sessionId)
          || await this.createNewSession(request.options?.userId, request.provider);
      } else {
        session = await this.createNewSession(request.options?.userId, request.provider);
      }

      // Prepare messages for AI
      const allMessages = [...session.messages, ...request.messages];
      const processedMessages = await this.prepareMessages(allMessages);

      // Generate response
      const lastMessage = processedMessages[processedMessages.length - 1];
      const response = await this.aiManager.generateResponse(
        lastMessage?.content || '',
        request.provider || session.provider,
        {
          ...request.options,
        },
      );

      // Create assistant message
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: response.content,
        metadata: {
          provider: response.provider,
          model: response.model,
          usage: response.usage,
          cached: response.cached,
          timestamp: new Date().toISOString(),
        },
      };

      // Update session with new messages
      if (this.sessionManager) {
        const updatedMessages = [...allMessages, assistantMessage];
        await this.sessionManager.updateSession(session.id, updatedMessages);
      }

      // Log chat interaction
      const responseTime = Date.now() - startTime;
      this.logger.logAIResponse(
        response.provider,
        response.model,
        responseTime,
        response.cached || false,
        request.options?.userId,
      );

      return {
        sessionId: session.id,
        message: assistantMessage,
        provider: response.provider,
        model: response.model,
        usage: response.usage || undefined,
        cached: response.cached || undefined,
      };
    } catch (error) {
      this.logger.error('Chat request failed', {
        sessionId: request.sessionId,
        provider: request.provider,
        error,
      });
      throw error;
    }
  }

  async streamChat(request: StreamChatRequest): Promise<StreamChatResponse> {
    try {
      // Get or create session
      let session: ChatSession;
      if (request.sessionId && this.sessionManager) {
        session = await this.sessionManager.getSession(request.sessionId)
          || await this.createNewSession(request.options?.userId, request.provider);
      } else {
        session = await this.createNewSession(request.options?.userId, request.provider);
      }

      // Prepare messages for AI
      const allMessages = [...session.messages, ...request.messages];
      const processedMessages = await this.prepareMessages(allMessages);

      // Create stream generator
      const streamGenerator = this.createStreamGenerator(
        session,
        processedMessages,
        request.provider || session.provider,
        request.options,
      );

      return {
        sessionId: session.id,
        chunks: streamGenerator,
      };
    } catch (error) {
      this.logger.error('Stream chat request failed', {
        sessionId: request.sessionId,
        provider: request.provider,
        error,
      });
      throw error;
    }
  }

  private async* createStreamGenerator(
    session: ChatSession,
    messages: AIMessage[],
    provider: AIProvider,
    options?: any,
  ): AsyncGenerator<any> {
    try {
      const stream = this.aiManager.streamChat(messages, provider, options);
      let fullContent = '';

      for await (const chunk of stream) {
        fullContent = chunk.content;
        yield chunk;

        // On completion, update session
        if (chunk.done && this.sessionManager) {
          const assistantMessage: AIMessage = {
            role: 'assistant',
            content: fullContent,
            metadata: {
              provider: chunk.provider,
              model: chunk.metadata?.model,
              timestamp: new Date().toISOString(),
            },
          };

          const updatedMessages = [...messages, assistantMessage];
          await this.sessionManager.updateSession(session.id, updatedMessages);
        }
      }
    } catch (error) {
      this.logger.error('Stream generation failed', {
        sessionId: session.id,
        provider,
        error,
      });
      throw error;
    }
  }

  private async createNewSession(userId?: string, provider?: AIProvider): Promise<ChatSession> {
    const session: ChatSession = {
      id: uuidv4(),
      userId,
      provider: provider || this.config.defaultProvider,
      model: this.getModelForProvider(provider || this.config.defaultProvider),
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (this.sessionManager) {
      // This would typically save to database
      // For now, we'll just return the session
    }

    return session;
  }

  private async prepareMessages(messages: AIMessage[]): Promise<AIMessage[]> {
    // Check if we need to summarize old messages
    if (this.config.autoSummarize && messages.length > this.config.summarizeThreshold) {
      return this.summarizeMessages(messages);
    }

    // Limit messages to max count
    if (messages.length > this.config.maxMessages) {
      const recentMessages = messages.slice(-this.config.maxMessages);
      this.logger.debug('Truncated message history', {
        original: messages.length,
        truncated: recentMessages.length,
      });
      return recentMessages;
    }

    return messages;
  }

  private async summarizeMessages(messages: AIMessage[]): Promise<AIMessage[]> {
    // Keep recent messages and summarize older ones
    const recentCount = Math.floor(this.config.maxMessages * 0.3);
    const recentMessages = messages.slice(-recentCount);
    const oldMessages = messages.slice(0, -recentCount);

    if (oldMessages.length === 0) {
      return recentMessages;
    }

    try {
      // Create summary of old messages
      const conversationText = oldMessages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const summaryPrompt = `Please provide a concise summary of this conversation that captures the key points, decisions, and context that would be important for continuing the discussion:\n\n${conversationText}`;

      const summary = await this.aiManager.generateText(summaryPrompt, this.config.defaultProvider, {
        maxTokens: 500,
        temperature: 0.3,
      });

      // Create summary message
      const summaryMessage: AIMessage = {
        role: 'system',
        content: `Previous conversation summary: ${summary}`,
        metadata: {
          type: 'summary',
          originalMessageCount: oldMessages.length,
          timestamp: new Date().toISOString(),
        },
      };

      this.logger.info('Conversation summarized', {
        originalMessages: oldMessages.length,
        recentMessages: recentMessages.length,
        summaryLength: summary.length,
      });

      return [summaryMessage, ...recentMessages];
    } catch (error) {
      this.logger.error('Failed to summarize conversation, using truncation', { error });
      return recentMessages;
    }
  }

  private getModelForProvider(provider: AIProvider): string {
    const models = {
      openai: 'gpt-4-turbo-preview',
      claude: 'claude-3-5-sonnet-20241022',
      gemini: 'gemini-1.5-pro-latest',
      azure: 'gpt-4-turbo-preview',
    };
    return models[provider];
  }

  // Utility methods
  async getSessionHistory(sessionId: string): Promise<AIMessage[]> {
    if (!this.sessionManager) {
      return [];
    }

    const session = await this.sessionManager.getSession(sessionId);
    return session?.messages || [];
  }

  async clearSession(sessionId: string): Promise<void> {
    if (this.sessionManager) {
      await this.sessionManager.deleteSession(sessionId);
    }
  }

  async exportSession(sessionId: string): Promise<any> {
    if (!this.sessionManager) {
      return null;
    }

    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      return null;
    }

    return {
      id: session.id,
      provider: session.provider,
      model: session.model,
      messageCount: session.messages.length,
      createdAt: session.createdAt,
      messages: session.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.metadata?.timestamp,
      })),
    };
  }
}
