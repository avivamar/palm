你说得对！我没有严格按照你的开发规范来要求。让我重新整理，严格遵循根目录claude.md的开发规范：

# @rolitt/ai-core - AI 核心能力包需求文档

## 项目定位
作为 Rolitt 第9个独立功能包，提供统一的 AI 能力底座，支持多模型集成和智能化功能扩展。

## 核心需求

### 1. AI 核心包架构 (packages/ai-core) - 遵循 @rolitt 命名规范
```
packages/ai-core/
├── src/
│   ├── providers/         # AI 提供商实现
│   │   ├── openai/       # OpenAI GPT-4, DALL-E, Whisper
│   │   │   ├── client.ts             # 客户端配置
│   │   │   ├── service.ts            # 服务实现
│   │   │   ├── types.ts              # 类型定义
│   │   │   └── index.ts
│   │   ├── claude/       # Claude 3.5, Vision
│   │   │   ├── client.ts
│   │   │   ├── service.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── gemini/       # Gemini Pro, Vision
│   │   └── azure/        # Azure Speech, OpenAI
│   ├── core/             # 核心抽象层
│   │   ├── manager.ts    # AI管理器
│   │   ├── interfaces.ts # 接口定义
│   │   ├── errors.ts     # 错误处理
│   │   └── types.ts      # 核心类型
│   ├── features/         # 功能模块
│   │   ├── chat/
│   │   │   ├── service.ts            # 聊天服务
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── voice/
│   │   │   ├── service.ts            # 语音服务
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   ├── image/
│   │   │   ├── service.ts            # 图像服务
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   └── multimodal/
│   │       ├── service.ts            # 多模态服务
│   │       ├── types.ts
│   │       └── index.ts
│   ├── prompts/          # Markdown 提示词管理
│   │   ├── system/
│   │   │   ├── base.md
│   │   │   ├── safety.md
│   │   │   └── brand.md
│   │   ├── ecommerce/
│   │   │   ├── product-description.md
│   │   │   ├── recommendation.md
│   │   │   └── pricing-strategy.md
│   │   ├── customer-service/
│   │   │   ├── support.md
│   │   │   ├── faq-handler.md
│   │   │   └── escalation.md
│   │   ├── content/
│   │   │   ├── marketing-copy.md
│   │   │   ├── email-template.md
│   │   │   └── social-media.md
│   │   ├── locales/      # 多语言提示词
│   │   │   ├── en/
│   │   │   ├── es/
│   │   │   ├── ja/
│   │   │   └── zh-HK/    # 注意：大写 HK
│   │   └── loader.ts                 # 提示词加载器
│   ├── utils/
│   │   ├── cache.ts                  # 缓存管理
│   │   ├── logger.ts                 # 日志工具
│   │   ├── rate-limiter.ts           # 速率限制
│   │   └── index.ts
│   └── config/
│       ├── default.ts                # 默认配置
│       ├── validators.ts             # 配置验证
│       └── index.ts
├── package.json          # 包名: @rolitt/ai-core
└── tsconfig.json         # TypeScript 5.0 Strict Mode
```

### 2. 核心 AI 管理器实现

```typescript
// packages/ai-core/src/core/manager.ts
import type { AIConfig, AIMessage, AIProvider, AIResponse } from './types';
import { Redis } from '@upstash/redis';
import { z } from 'zod';
import { env } from '@/libs/Env';
import { RateLimiter } from '../utils/rate-limiter';
import { AIServiceError } from './errors';

// 使用 Zod 验证配置
const aiConfigSchema = z.object({
  providers: z.record(z.object({
    apiKey: z.string(),
    baseUrl: z.string().url().optional(),
    model: z.string().optional(),
  })),
  defaultProvider: z.enum(['openai', 'claude', 'gemini', 'azure']),
  responseLanguage: z.enum(['en', 'es', 'ja', 'zh-HK']).optional(),
  cache: z.object({
    enabled: z.boolean().default(true),
    ttl: z.number().default(3600),
  }).optional(),
  rateLimit: z.object({
    enabled: z.boolean().default(true),
    maxRequests: z.number().default(100),
    windowMs: z.number().default(60000),
  }).optional(),
});

export class AIManager {
  private services: Map<string, AIService> = new Map();
  private readonly config: AIConfig;
  private redis: Redis | null = null;
  private rateLimiter: RateLimiter;

  constructor(config: unknown) {
    this.config = aiConfigSchema.parse(config);
    this.initializeServices();
    this.initializeRedis();
    this.rateLimiter = new RateLimiter(this.config.rateLimit);
  }

  private initializeRedis(): void {
    if (this.config.cache?.enabled && env.REDIS_URL) {
      this.redis = new Redis({
        url: env.REDIS_URL,
        token: env.REDIS_TOKEN,
      });
    }
  }

  async generateText(
    prompt: string,
    provider?: string,
    options?: GenerateOptions
  ): Promise<string> {
    // 检查速率限制
    await this.rateLimiter.checkLimit(options?.userId);

    // 生成缓存键
    const cacheKey = this.generateCacheKey('text', prompt, provider, options);

    // 尝试从缓存获取
    if (this.redis && this.config.cache?.enabled) {
      const cached = await this.redis.get<string>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const service = this.getService(provider);

    // 添加响应语言指令
    const enhancedPrompt = this.enhancePromptWithLanguage(prompt, options?.locale);

    const result = await service.generateText(enhancedPrompt, options);

    // 缓存结果
    if (this.redis && this.config.cache?.enabled) {
      await this.redis.set(cacheKey, result, {
        ex: this.config.cache.ttl,
      });
    }

    return result;
  }

  // 流式响应实现
  async* streamChat(
    messages: AIMessage[],
    provider?: string,
    options?: ChatOptions
  ): AsyncGenerator<string, void, unknown> {
    // 检查速率限制
    await this.rateLimiter.checkLimit(options?.userId);

    const service = this.getService(provider);

    // 增强最后一条消息，添加语言指令
    const enhancedMessages = this.enhanceMessagesWithLanguage(messages, options?.locale);

    // 使用并发控制
    const stream = await service.streamChat(enhancedMessages, options);

    for await (const chunk of stream) {
      yield chunk;
    }
  }

  private enhancePromptWithLanguage(prompt: string, locale?: string): string {
    if (!locale || locale === 'en') {
      return prompt;
    }

    const languageMap = {
      'es': 'Please respond in Spanish',
      'ja': 'Please respond in Japanese',
      'zh-HK': 'Please respond in Traditional Chinese',
    };

    const languageInstruction = languageMap[locale as keyof typeof languageMap];
    return languageInstruction ? `${prompt}\n\n${languageInstruction}` : prompt;
  }

  private enhanceMessagesWithLanguage(messages: AIMessage[], locale?: string): AIMessage[] {
    if (!locale || locale === 'en') {
      return messages;
    }

    const languageMap = {
      'es': 'Spanish',
      'ja': 'Japanese',
      'zh-HK': 'Traditional Chinese',
    };

    const language = languageMap[locale as keyof typeof languageMap];
    if (!language) {
      return messages;
    }

    // 在系统消息中添加语言指令
    const systemMessage = messages.find(m => m.role === 'system');
    if (systemMessage) {
      systemMessage.content += `\n\nIMPORTANT: All responses must be in ${language}.`;
    } else {
      // 如果没有系统消息，添加一个
      messages.unshift({
        role: 'system',
        content: `You are a helpful AI assistant. All responses must be in ${language}.`,
      });
    }

    return messages;
  }

  private generateCacheKey(
    type: string,
    content: string,
    provider?: string,
    options?: any
  ): string {
    const provider_ = provider || this.config.defaultProvider;
    const locale = options?.locale || 'en';
    const hash = this.simpleHash(content);
    return `ai:${type}:${provider_}:${locale}:${hash}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private getService(provider?: string): AIService {
    const providerName = provider ?? this.config.defaultProvider;
    const service = this.services.get(providerName);

    if (!service) {
      throw new AIServiceError(
        `AI provider '${providerName}' not available`,
        'PROVIDER_NOT_FOUND'
      );
    }

    return service;
  }

  private initializeServices(): void {
    Object.entries(this.config.providers).forEach(([name, config]) => {
      const Service = this.getServiceClass(name);
      this.services.set(name, new Service(config));
    });
  }
}
```

### 3. 包依赖管理 - 遵循 Monorepo 规范 ✨

```json
// packages/ai-core/package.json
{
  "name": "@rolitt/ai-core",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "openai": "^4.0.0",
    "@anthropic-ai/sdk": "^0.24.0",
    "@google/generative-ai": "^0.2.0",
    "@upstash/redis": "^1.31.0",
    "zod": "^3.22.0",
    "gray-matter": "^4.0.3"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "vitest": "^1.0.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0"
  },
  "peerDependencies": {
    "@rolitt/shared": "workspace:*"
  }
}
```

### 4. 错误处理和日志系统

```typescript
// packages/ai-core/src/core/errors.ts
export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider?: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export class PromptNotFoundError extends Error {
  constructor(category: string, name: string) {
    super(`Prompt not found: ${category}/${name}`);
    this.name = 'PromptNotFoundError';
  }
}

// packages/ai-core/src/utils/logger.ts
export class AILogger {
  private static instance: AILogger;

  static getInstance(): AILogger {
    if (!this.instance) {
      this.instance = new AILogger();
    }
    return this.instance;
  }

  log(level: 'info' | 'warn' | 'error', message: string, meta?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta,
    };

    if (process.env.NODE_ENV === 'development') {
      console.log(JSON.stringify(logEntry, null, 2));
    }

    // 生产环境可以集成 Sentry
    if (level === 'error' && process.env.NODE_ENV === 'production') {
      // Sentry.captureMessage(message, level);
    }
  }
}
```

### 5. 提示词加载器系统

```typescript
import type { PromptMetadata, PromptVariables } from './types';
import fs from 'node:fs/promises';
import path from 'node:path';
// packages/ai-core/src/prompts/loader.ts
import matter from 'gray-matter';
import { z } from 'zod';
import { PromptNotFoundError } from '../core/errors';

// 提示词元数据验证
const promptMetadataSchema = z.object({
  title: z.string(),
  description: z.string(),
  version: z.string(),
  tags: z.array(z.string()).optional(),
  maxTokens: z.number().optional(),
  temperature: z.number().optional(),
});

export class PromptLoader {
  private static promptsDir = path.join(process.cwd(), 'packages/ai-core/src/prompts');
  private static cache = new Map<string, string>();

  static async loadPrompt(
    category: string,
    name: string,
    locale: string = 'en',
    variables?: PromptVariables
  ): Promise<string> {
    const cacheKey = `${category}/${name}/${locale}`;

    // 检查缓存
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      return variables ? this.interpolateVariables(cached, variables) : cached;
    }

    try {
      // 尝试加载本地化版本
      let content = await this.tryLoadPromptFile(category, name, locale);

      // 如果找不到，尝试加载默认英文版本
      if (!content && locale !== 'en') {
        content = await this.tryLoadPromptFile(category, name, 'en');
      }

      if (!content) {
        throw new PromptNotFoundError(category, name);
      }

      const { data, content: markdown } = matter(content);
      const metadata = promptMetadataSchema.parse(data);

      // 缓存解析后的内容
      this.cache.set(cacheKey, markdown);

      if (variables) {
        return this.interpolateVariables(markdown, variables);
      }

      return markdown;
    } catch (error) {
      if (error instanceof PromptNotFoundError) {
        throw error;
      }
      throw new Error(`Failed to load prompt: ${category}/${name}`, { cause: error });
    }
  }

  private static async tryLoadPromptFile(
    category: string,
    name: string,
    locale: string
  ): Promise<string | null> {
    try {
      // 先尝试本地化路径
      const localePath = path.join(this.promptsDir, 'locales', locale, category, `${name}.md`);
      return await fs.readFile(localePath, 'utf-8');
    } catch {
      // 再尝试默认路径
      try {
        const defaultPath = path.join(this.promptsDir, category, `${name}.md`);
        return await fs.readFile(defaultPath, 'utf-8');
      } catch {
        return null;
      }
    }
  }

  private static interpolateVariables(
    template: string,
    variables: PromptVariables
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return String(variables[key] ?? match);
    });
  }

  // 清除缓存
  static clearCache(): void {
    this.cache.clear();
  }
}
```

### 6. 集成到主应用 - 遵循 Server Actions 规范

```typescript
// src/app/actions/aiActions.ts - 遵循项目 Server Actions 模式
'use server';

import type { AIMessage } from '@rolitt/ai-core';
import { AIManager, PromptLoader } from '@rolitt/ai-core';
import { z } from 'zod';
import { env } from '@/libs/Env';

// 创建单例 AI Manager
const aiManager = new AIManager({
  providers: {
    openai: {
      apiKey: env.OPENAI_API_KEY,
      model: 'gpt-4-turbo-preview',
    },
    claude: {
      apiKey: env.ANTHROPIC_API_KEY,
      model: 'claude-3-opus-20240229',
    },
  },
  defaultProvider: 'claude',
  cache: {
    enabled: true,
    ttl: 3600,
  },
});

// 输入验证 schema
const chatInputSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  category: z.string(),
  promptName: z.string(),
  locale: z.enum(['en', 'es', 'ja', 'zh-HK']).default('en'),
  variables: z.record(z.string()).optional(),
});

export async function handleAIChat(formData: FormData) {
  try {
    // 解析和验证输入
    const input = chatInputSchema.parse({
      messages: JSON.parse(formData.get('messages') as string),
      category: formData.get('category'),
      promptName: formData.get('promptName'),
      locale: formData.get('locale') || 'en',
      variables: formData.get('variables')
        ? JSON.parse(formData.get('variables') as string)
        : undefined,
    });

    // 加载提示词
    const systemPrompt = await PromptLoader.loadPrompt(
      input.category,
      input.promptName,
      input.locale,
      input.variables
    );

    // 构建消息
    const chatMessages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...input.messages
    ];

    // 调用 AI 服务
    const response = await aiManager.generateText(
      chatMessages[chatMessages.length - 1].content,
      'claude',
      {
        messages: chatMessages,
        temperature: 0.7,
        maxTokens: 1000,
      }
    );

    return { success: true, data: response };
  } catch (error) {
    console.error('AI chat error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'AI service unavailable'
    };
  }
}

// 产品推荐 Server Action
export async function generateProductRecommendation(formData: FormData) {
  const userId = formData.get('userId') as string;
  const locale = formData.get('locale') as string || 'en';

  try {
    // 获取用户购买历史
    // const userHistory = await getUserPurchaseHistory(userId);

    const prompt = await PromptLoader.loadPrompt(
      'ecommerce',
      'recommendation',
      locale,
      {
        userId,
        // history: JSON.stringify(userHistory),
      }
    );

    const recommendation = await aiManager.generateText(prompt, 'openai');

    return { success: true, data: recommendation };
  } catch (error) {
    console.error('Product recommendation error:', error);
    return { success: false, error: 'Failed to generate recommendation' };
  }
}
```

### 7. 使用示例和最佳实践

```typescript
// 在 React 组件中使用
import { useTransition } from 'react';
import { handleAIChat } from '@/app/actions/aiActions';

export function ChatComponent() {
  const [isPending, startTransition] = useTransition();
  const [messages, setMessages] = useState<AIMessage[]>([]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await handleAIChat(formData);
      if (result.success) {
        setMessages([...messages, {
          role: 'assistant',
          content: result.data
        }]);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 表单内容 */}
    </form>
  );
}

// 提示词模板示例
// packages/ai-core/src/prompts/ecommerce/product-description.md
/*
---
title: Product Description Generator
description: Generate compelling product descriptions
version: 1.0.0
tags: [ecommerce, marketing]
maxTokens: 500
temperature: 0.8
---

You are a professional e-commerce copywriter for Rolitt AI Companion products.

Generate a compelling product description for {{productName}} with the following features:
- {{features}}

Target audience: {{targetAudience}}
Tone: {{tone}}

Requirements:
1. Highlight unique selling points
2. Use emotional language that connects with the audience
3. Include a clear call-to-action
4. Keep within 150-200 words
*/
```

### 8. 开发标准和规范

**遵循 Rolitt 开发规范 v4.0**:
- ✅ **文件命名**: TypeScript 使用简洁的名词 (如 `service.ts`, `types.ts`)
- ✅ **Markdown 文件**: 使用 kebab-case (如 `product-description.md`)
- ✅ **包命名**: `@rolitt/ai-core` 遵循项目命名空间
- ✅ **TypeScript**: 5.0 Strict Mode + Zod 验证
- ✅ **代码风格**: ESLint + Prettier 统一格式
- ✅ **测试覆盖**: Vitest 单元测试 ≥ 80%
- ✅ **错误处理**: 统一的错误类型和日志系统
- ✅ **性能优化**: 缓存机制 + 速率限制

### 9. 包开发脚本集成

```json
// 根目录 package.json 添加
{
  "scripts": {
    "ai:dev": "npm run dev --workspace=@rolitt/ai-core",
    "ai:build": "npm run build --workspace=@rolitt/ai-core",
    "ai:test": "npm run test --workspace=@rolitt/ai-core",
    "ai:validate": "npm run type-check --workspace=@rolitt/ai-core && npm run lint --workspace=@rolitt/ai-core"
  }
}
```

### 10. 集成计划

1. **第一阶段**: 基础架构搭建
   - 创建包结构和配置文件
   - 实现核心 AIManager 和接口定义
   - 集成 OpenAI 和 Claude 提供商

2. **第二阶段**: 功能实现
   - 实现聊天、语音、图像服务
   - 构建提示词管理系统
   - 添加缓存和速率限制

3. **第三阶段**: 业务集成
   - 创建电商相关的 Server Actions
   - 实现产品推荐、客服对话等功能
   - 添加管理后台的 AI 配置界面

## 预期成果

通过严格遵循 Rolitt 开发规范，`@rolitt/ai-core` 将成为第9个独立功能包，为整个系统提供：
- 🤖 统一的 AI 能力调用接口
- 🔄 多模型切换和容错机制
- 📝 结构化的提示词管理
- 🚀 高性能的缓存和优化
- 🔒 安全的错误处理和日志

实现"即插即用"的 AI 能力集成，支持业务快速创新。
