'use server';

import {
  AIManager,
  ChatService,
  ClaudeService,
  GeminiService,
  OpenAIEnhancedService,
  PromptLoader,
  createOpenAIConfigFromEnv,
  validateOpenAIConfig,
} from '@rolitt/ai-core';
import { z } from 'zod';

// Environment validation
const envSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),
  REDIS_URL: z.string().optional(),
  REDIS_TOKEN: z.string().optional(),
});

let aiManager: AIManager | null = null;
let chatService: ChatService | null = null;

// Initialize AI services
async function initializeAI() {
  if (aiManager) {
    return { aiManager, chatService };
  }

  try {
    const env = envSchema.parse(process.env);

    // Create AI manager with available providers
    const providers: Record<string, any> = {};

    // Try to create enhanced OpenAI config from environment
    const openaiEnhancedConfig = createOpenAIConfigFromEnv();
    if (openaiEnhancedConfig) {
      const validation = validateOpenAIConfig(openaiEnhancedConfig);
      if (validation.valid) {
        providers.openai = openaiEnhancedConfig;
        console.log(`OpenAI multi-endpoint config loaded with ${openaiEnhancedConfig.endpoints.length} endpoints`);
        
        if (validation.warnings.length > 0) {
          console.warn('OpenAI config warnings:', validation.warnings);
        }
      } else {
        console.error('OpenAI enhanced config validation failed:', validation.errors);
        // Fallback to legacy config
        if (env.OPENAI_API_KEY) {
          providers.openai = {
            apiKey: env.OPENAI_API_KEY,
            model: 'gpt-4-turbo-preview',
          };
          console.log('Using legacy OpenAI config as fallback');
        }
      }
    } else if (env.OPENAI_API_KEY) {
      // Use legacy single endpoint config
      providers.openai = {
        apiKey: env.OPENAI_API_KEY,
        model: 'gpt-4-turbo-preview',
      };
      console.log('Using legacy OpenAI config');
    }

    if (env.ANTHROPIC_API_KEY) {
      providers.claude = {
        apiKey: env.ANTHROPIC_API_KEY,
        model: 'claude-3-5-sonnet-20241022',
      };
    }

    if (env.GOOGLE_AI_API_KEY) {
      providers.gemini = {
        apiKey: env.GOOGLE_AI_API_KEY,
        model: 'gemini-1.5-pro-latest',
      };
    }

    if (Object.keys(providers).length === 0) {
      throw new Error('No AI providers configured. Please add API keys to environment variables.');
    }

    const config = {
      providers,
      defaultProvider: Object.keys(providers)[0] as any,
      cache: {
        enabled: !!env.REDIS_URL,
        ttl: 3600,
      },
      rateLimit: {
        enabled: true,
        maxRequests: 100,
        windowMs: 60000,
      },
    };

    aiManager = new AIManager(config);

    // Register available services
    if (providers.openai) {
      // Use enhanced service which supports both legacy and multi-endpoint configs
      await aiManager.registerService('openai', new OpenAIEnhancedService());
    }

    if (providers.claude) {
      await aiManager.registerService('claude', new ClaudeService());
    }

    if (providers.gemini) {
      await aiManager.registerService('gemini', new GeminiService());
    }

    // Initialize chat service
    chatService = new ChatService(aiManager);

    console.log('AI services initialized successfully', {
      providers: Object.keys(providers),
      defaultProvider: config.defaultProvider,
    });

    return { aiManager, chatService };
  } catch (error) {
    console.error('Failed to initialize AI services:', error);
    throw new Error('AI service initialization failed');
  }
}

// Input validation schemas
const chatInputSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1),
  })).min(1), // Ensure at least one message
  provider: z.enum(['openai', 'claude', 'gemini']).optional(),
  locale: z.enum(['en', 'es', 'ja', 'zh-HK']).default('en'),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().max(8000).optional(),
  userId: z.string().optional(),
});

const promptInputSchema = z.object({
  category: z.string().min(1),
  name: z.string().min(1),
  locale: z.enum(['en', 'es', 'ja', 'zh-HK']).default('en'),
  variables: z.record(z.string()).optional(),
  provider: z.enum(['openai', 'claude', 'gemini']).optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().max(8000).optional(),
  userId: z.string().optional(),
});

// Main AI chat action
export async function handleAIChat(formData: FormData) {
  try {
    const { aiManager } = await initializeAI();

    // Parse and validate input
    const input = chatInputSchema.parse({
      messages: JSON.parse(formData.get('messages') as string),
      provider: formData.get('provider') || undefined,
      locale: formData.get('locale') || 'en',
      temperature: formData.get('temperature') ? Number.parseFloat(formData.get('temperature') as string) : undefined,
      maxTokens: formData.get('maxTokens') ? Number.parseInt(formData.get('maxTokens') as string, 10) : undefined,
      userId: formData.get('userId') || undefined,
    });

    const startTime = Date.now();

    // Ensure we have messages and get the last one
    if (input.messages.length === 0) {
      throw new Error('No messages provided');
    }

    const lastMessage = input.messages[input.messages.length - 1];
    if (!lastMessage || !lastMessage.content) {
      throw new Error('Invalid last message');
    }

    // Generate response using AI manager - use simple text generation for now
    const response = await aiManager.generateResponse(
      lastMessage.content,
      input.provider,
      {
        temperature: input.temperature,
        maxTokens: input.maxTokens,
        locale: input.locale,
        userId: input.userId,
      },
    );

    const responseTime = Date.now() - startTime;

    return {
      success: true,
      data: {
        content: response.content,
        provider: response.provider,
        model: response.model,
        usage: response.usage,
        cached: response.cached,
        responseTime,
      },
    };
  } catch (error) {
    console.error('AI chat error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'AI service unavailable',
    };
  }
}

// Stream chat action
export async function handleStreamChat(formData: FormData) {
  try {
    const { chatService } = await initializeAI();

    if (!chatService) {
      throw new Error('Chat service not available');
    }

    // Parse and validate input
    const input = chatInputSchema.parse({
      messages: JSON.parse(formData.get('messages') as string),
      provider: formData.get('provider') || undefined,
      locale: formData.get('locale') || 'en',
      temperature: formData.get('temperature') ? Number.parseFloat(formData.get('temperature') as string) : undefined,
      maxTokens: formData.get('maxTokens') ? Number.parseInt(formData.get('maxTokens') as string, 10) : undefined,
      userId: formData.get('userId') || undefined,
    });

    // This would typically return a stream, but Server Actions don't support streaming responses
    // For now, we'll use the regular chat method
    const result = await chatService.chat({
      messages: input.messages,
      provider: input.provider,
      options: {
        temperature: input.temperature,
        maxTokens: input.maxTokens,
        locale: input.locale,
        userId: input.userId,
      },
    });

    return {
      success: true,
      data: {
        sessionId: result.sessionId,
        content: result.message.content,
        provider: result.provider,
        model: result.model,
        usage: result.usage,
        cached: result.cached,
      },
    };
  } catch (error) {
    console.error('Stream chat error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chat service unavailable',
    };
  }
}

// Prompt-based generation action
export async function generateFromPrompt(formData: FormData) {
  try {
    const { aiManager } = await initializeAI();

    // Parse and validate input
    const input = promptInputSchema.parse({
      category: formData.get('category') as string,
      name: formData.get('name') as string,
      locale: formData.get('locale') || 'en',
      variables: formData.get('variables')
        ? JSON.parse(formData.get('variables') as string)
        : undefined,
      provider: formData.get('provider') || undefined,
      temperature: formData.get('temperature') ? Number.parseFloat(formData.get('temperature') as string) : undefined,
      maxTokens: formData.get('maxTokens') ? Number.parseInt(formData.get('maxTokens') as string, 10) : undefined,
      userId: formData.get('userId') || undefined,
    });

    // Load prompt template
    const prompt = await PromptLoader.loadPrompt(
      input.category,
      input.name,
      input.locale,
      input.variables,
    );

    // Generate response
    const response = await aiManager.generateResponse(prompt, input.provider, {
      temperature: input.temperature,
      maxTokens: input.maxTokens,
      locale: input.locale,
      userId: input.userId,
    });

    return {
      success: true,
      data: {
        content: response.content,
        provider: response.provider,
        model: response.model,
        usage: response.usage,
        cached: response.cached,
        promptUsed: {
          category: input.category,
          name: input.name,
          locale: input.locale,
        },
      },
    };
  } catch (error) {
    console.error('Prompt generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Prompt generation failed',
    };
  }
}

// Product recommendation action
export async function generateProductRecommendation(formData: FormData) {
  const userId = formData.get('userId') as string;
  const locale = (formData.get('locale') as string) || 'en';
  const userPreferences = formData.get('userPreferences') as string;
  const budgetRange = formData.get('budgetRange') as string;

  try {
    const { aiManager } = await initializeAI();

    const prompt = await PromptLoader.loadPrompt(
      'ecommerce',
      'recommendation',
      locale as any,
      {
        userId,
        userPreferences: userPreferences || 'Not specified',
        budgetRange: budgetRange || 'Not specified',
        purchaseHistory: 'No previous purchases', // Would be fetched from database
        browsingHistory: 'No browsing history available', // Would be fetched from analytics
        previousInteractions: 'First time user', // Would be fetched from user data
      },
    );

    const recommendation = await aiManager.generateText(prompt, 'claude', {
      temperature: 0.7,
      maxTokens: 800,
      locale: locale as any,
      userId,
    });

    return {
      success: true,
      data: {
        recommendation,
        userId,
        locale,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Product recommendation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate recommendation',
    };
  }
}

// Customer support action
export async function handleCustomerSupport(formData: FormData) {
  const userType = formData.get('userType') as string;
  const issueCategory = formData.get('issueCategory') as string;
  const locale = (formData.get('locale') as string) || 'en';
  const urgencyLevel = formData.get('urgencyLevel') as string;
  const question = formData.get('question') as string;

  try {
    const { aiManager } = await initializeAI();

    const prompt = await PromptLoader.loadPrompt(
      'customer-service',
      'support',
      locale as any,
      {
        userType: userType || 'standard',
        issueCategory: issueCategory || 'general',
        previousContact: 'None',
        urgencyLevel: urgencyLevel || 'normal',
        productService: 'Rolitt AI Companion',
      },
    );

    // Create conversation with system prompt and user question
    // Create a full prompt by combining system and user messages
    const fullPrompt = `${prompt}\n\nUser: ${question}`;

    const response = await aiManager.generateResponse(
      fullPrompt,
      'claude',
      {
        temperature: 0.6,
        maxTokens: 1000,
        locale: locale as any,
      },
    );

    return {
      success: true,
      data: {
        response: response.content,
        supportType: 'ai-assisted',
        category: issueCategory,
        urgency: urgencyLevel,
        locale,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Customer support error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Support service unavailable',
    };
  }
}

// Health check action
export async function checkAIHealth() {
  try {
    const { aiManager } = await initializeAI();

    const health = await aiManager.getAllProvidersHealth();
    const availableProviders = aiManager.getAvailableProviders();

    return {
      success: true,
      data: {
        status: 'healthy',
        providers: health,
        availableProviders,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('AI health check failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Health check failed',
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      },
    };
  }
}
