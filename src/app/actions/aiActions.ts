'use server';

// 使用 Palm 包的专用 AI 服务替代 ai-core 包
import { PalmAIService, PalmPromptManager } from '@rolitt/palm';
import { z } from 'zod';

// Environment validation
const envSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),
  REDIS_URL: z.string().optional(),
  REDIS_TOKEN: z.string().optional(),
});

let palmAIService: PalmAIService | null = null;
let palmPromptManager: PalmPromptManager | null = null;

// Initialize Palm AI services
async function initializePalmAI() {
  if (palmAIService) {
    return { palmAIService, palmPromptManager };
  }

  try {
    const env = envSchema.parse(process.env);

    // Initialize Palm AI Service with available providers
    const config = {
      openai: {
        apiKey: env.OPENAI_API_KEY,
        model: 'gpt-4o-mini',
      },
      anthropic: env.ANTHROPIC_API_KEY ? {
        apiKey: env.ANTHROPIC_API_KEY,
        model: 'claude-3-5-sonnet-20241022',
      } : undefined,
      google: env.GOOGLE_AI_API_KEY ? {
        apiKey: env.GOOGLE_AI_API_KEY,
        model: 'gemini-1.5-pro-latest',
      } : undefined,
    };

    // Remove undefined providers
    const cleanConfig = Object.fromEntries(
      Object.entries(config).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanConfig).length === 0) {
      throw new Error('No AI providers configured. Please add API keys to environment variables.');
    }

    palmAIService = new PalmAIService(cleanConfig);
    palmPromptManager = new PalmPromptManager();

    console.log('Palm AI services initialized successfully', {
      providers: Object.keys(cleanConfig),
    });

    return { palmAIService, palmPromptManager };
  } catch (error) {
    console.error('Failed to initialize Palm AI services:', error);
    throw new Error('Palm AI service initialization failed');
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

// Main AI chat action using Palm AI Service
export async function handleAIChat(formData: FormData) {
  try {
    const { palmAIService } = await initializePalmAI();

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

    // Generate response using Palm AI Service
    const response = await palmAIService.generateChatResponse({
      messages: input.messages,
      provider: input.provider as any,
      options: {
        temperature: input.temperature,
        maxTokens: input.maxTokens,
        locale: input.locale as any,
        userId: input.userId,
      },
    });

    const responseTime = Date.now() - startTime;

    return {
      success: true,
      data: {
        content: response.content,
        provider: response.provider,
        model: response.model,
        usage: response.usage,
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

// Stream chat action using Palm AI Service
export async function handleStreamChat(formData: FormData) {
  try {
    const { palmAIService } = await initializePalmAI();

    // Parse and validate input
    const input = chatInputSchema.parse({
      messages: JSON.parse(formData.get('messages') as string),
      provider: formData.get('provider') || undefined,
      locale: formData.get('locale') || 'en',
      temperature: formData.get('temperature') ? Number.parseFloat(formData.get('temperature') as string) : undefined,
      maxTokens: formData.get('maxTokens') ? Number.parseInt(formData.get('maxTokens') as string, 10) : undefined,
      userId: formData.get('userId') || undefined,
    });

    // Use Palm AI Service for streaming chat
    const result = await palmAIService.generateChatResponse({
      messages: input.messages,
      provider: input.provider as any,
      options: {
        temperature: input.temperature,
        maxTokens: input.maxTokens,
        locale: input.locale as any,
        userId: input.userId,
        streaming: true, // Enable streaming if supported
      },
    });

    return {
      success: true,
      data: {
        content: result.content,
        provider: result.provider,
        model: result.model,
        usage: result.usage,
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

// Prompt-based generation action using Palm AI Service
export async function generateFromPrompt(formData: FormData) {
  try {
    const { palmAIService, palmPromptManager } = await initializePalmAI();

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

    // Load prompt template using Palm Prompt Manager
    const prompt = await palmPromptManager!.loadPrompt(
      input.category,
      input.name,
      input.locale as any,
      input.variables,
    );

    // Generate response using Palm AI Service
    const response = await palmAIService.generateTextResponse({
      prompt,
      provider: input.provider as any,
      options: {
        temperature: input.temperature,
        maxTokens: input.maxTokens,
        locale: input.locale as any,
        userId: input.userId,
      },
    });

    return {
      success: true,
      data: {
        content: response.content,
        provider: response.provider,
        model: response.model,
        usage: response.usage,
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

// Product recommendation action using Palm AI Service
export async function generateProductRecommendation(formData: FormData) {
  const userId = formData.get('userId') as string;
  const locale = (formData.get('locale') as string) || 'en';
  const userPreferences = formData.get('userPreferences') as string;
  const budgetRange = formData.get('budgetRange') as string;

  try {
    const { palmAIService, palmPromptManager } = await initializePalmAI();

    const prompt = await palmPromptManager!.loadPrompt(
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

    const response = await palmAIService.generateTextResponse({
      prompt,
      provider: 'openai',
      options: {
        temperature: 0.7,
        maxTokens: 800,
        locale: locale as any,
        userId,
      },
    });

    return {
      success: true,
      data: {
        recommendation: response.content,
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

// Customer support action using Palm AI Service
export async function handleCustomerSupport(formData: FormData) {
  const userType = formData.get('userType') as string;
  const issueCategory = formData.get('issueCategory') as string;
  const locale = (formData.get('locale') as string) || 'en';
  const urgencyLevel = formData.get('urgencyLevel') as string;
  const question = formData.get('question') as string;

  try {
    const { palmAIService, palmPromptManager } = await initializePalmAI();

    const prompt = await palmPromptManager!.loadPrompt(
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

    // Create a full prompt by combining system and user messages
    const fullPrompt = `${prompt}\n\nUser: ${question}`;

    const response = await palmAIService.generateTextResponse({
      prompt: fullPrompt,
      provider: 'openai',
      options: {
        temperature: 0.6,
        maxTokens: 1000,
        locale: locale as any,
      },
    });

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

// Health check action using Palm AI Service
export async function checkAIHealth() {
  try {
    const { palmAIService } = await initializePalmAI();

    const health = await palmAIService.checkHealth();

    return {
      success: true,
      data: {
        status: 'healthy',
        providers: health.providers,
        availableProviders: health.availableProviders,
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
