'use server';

// 使用 Palm 包的专用 AI 服务替代 ai-core 包
import { PalmAIService, loadPalmPrompt } from '@rolitt/palm';
import { AIManager } from '@rolitt/ai-core';
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
let aiManager: import('@rolitt/ai-core').AIManager | null = null;

// Initialize Palm AI services
async function initializePalmAI() {
  if (palmAIService && aiManager) {
    return { palmAIService, aiManager };
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

    // Create AIManager configuration
    const aiManagerConfig = {
      providers: cleanConfig,
      defaultProvider: Object.keys(cleanConfig)[0] as 'openai' | 'claude' | 'gemini' | 'azure',
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

    aiManager = new AIManager(aiManagerConfig);
    palmAIService = new PalmAIService({ aiManager });

    console.log('Palm AI services initialized successfully', {
      providers: Object.keys(cleanConfig),
    });

    return { palmAIService, aiManager };
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
    const { aiManager } = await initializePalmAI();

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

    // Generate response using AI Manager
    const provider = input.provider || 'openai';
    const content = input.messages.map(m => `${m.role}: ${m.content}`).join('\n');
    
    const response = await aiManager.generateResponse(content, provider as any, {
      temperature: input.temperature,
      maxTokens: input.maxTokens,
    });

    const responseTime = Date.now() - startTime;

    return {
      success: true,
      data: {
        content: response.content || response,
        provider: provider,
        model: 'unknown',
        usage: {},
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

// Stream chat action using AI Manager
export async function handleStreamChat(formData: FormData) {
  try {
    const { aiManager } = await initializePalmAI();

    // Parse and validate input
    const input = chatInputSchema.parse({
      messages: JSON.parse(formData.get('messages') as string),
      provider: formData.get('provider') || undefined,
      locale: formData.get('locale') || 'en',
      temperature: formData.get('temperature') ? Number.parseFloat(formData.get('temperature') as string) : undefined,
      maxTokens: formData.get('maxTokens') ? Number.parseInt(formData.get('maxTokens') as string, 10) : undefined,
      userId: formData.get('userId') || undefined,
    });

    // Use AI Manager for streaming chat
    const provider = input.provider || 'openai';
    const content = input.messages.map(m => `${m.role}: ${m.content}`).join('\n');
    
    const result = await aiManager.generateResponse(content, provider as any, {
      temperature: input.temperature,
      maxTokens: input.maxTokens,
    });

    return {
      success: true,
      data: {
        content: result.content || result,
        provider: provider,
        model: 'unknown',
        usage: {},
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

// Prompt-based generation action using AI Manager
export async function generateFromPrompt(formData: FormData) {
  try {
    const { aiManager } = await initializePalmAI();

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

    // Load prompt template using Palm prompt functions
    const prompt = await loadPalmPrompt();
    const fullPrompt = `${prompt}\n\nCategory: ${input.category}\nName: ${input.name}\nVariables: ${JSON.stringify(input.variables)}`;

    // Generate response using AI Manager
    const provider = input.provider || 'openai';
    const response = await aiManager.generateResponse(fullPrompt, provider as any, {
      temperature: input.temperature,
      maxTokens: input.maxTokens,
    });

    return {
      success: true,
      data: {
        content: response.content || response,
        provider: provider,
        model: 'unknown',
        usage: {},
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
    const { aiManager } = await initializePalmAI();

    const basePrompt = await loadPalmPrompt();
    const prompt = `${basePrompt}\n\nGenerate product recommendations for:
User ID: ${userId}
Preferences: ${userPreferences || 'Not specified'}
Budget Range: ${budgetRange || 'Not specified'}
Purchase History: No previous purchases
Browsing History: No browsing history available
Previous Interactions: First time user`;

    const response = await aiManager.generateResponse(prompt, 'openai', {
      temperature: 0.7,
      maxTokens: 800,
    });

    return {
      success: true,
      data: {
        recommendation: response.content || response,
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
    const { aiManager } = await initializePalmAI();

    const basePrompt = await loadPalmPrompt();
    const systemPrompt = `${basePrompt}\n\nCustomer Support Context:
User Type: ${userType || 'standard'}
Issue Category: ${issueCategory || 'general'}
Previous Contact: None
Urgency Level: ${urgencyLevel || 'normal'}
Product/Service: Rolitt AI Companion`;

    // Create a full prompt by combining system and user messages
    const fullPrompt = `${systemPrompt}\n\nUser: ${question}`;

    const response = await aiManager.generateResponse(fullPrompt, 'openai', {
      temperature: 0.6,
      maxTokens: 1000,
    });

    return {
      success: true,
      data: {
        response: response.content || response,
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

// Health check action using AI Manager
export async function checkAIHealth() {
  try {
    const { aiManager } = await initializePalmAI();

    // Simple health check by trying to initialize the services
    const testResponse = await aiManager.generateResponse('Health check test', 'openai', {
      temperature: 0.1,
      maxTokens: 10,
    });

    return {
      success: true,
      data: {
        status: 'healthy',
        services: ['aiManager', 'palmAIService'],
        testResponse: testResponse ? 'OK' : 'Failed',
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
