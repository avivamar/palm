// AI 模块类型定义
export type AIProvider = 'openai' | 'claude' | 'gemini' | 'azure';

export type AIModelType = 'chat' | 'completion' | 'image' | 'voice' | 'embedding';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  type: AIModelType;
  maxTokens: number;
  costPer1kTokens: number;
  supportedFeatures: string[];
  deprecated?: boolean;
}

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  organizationId?: string;
  enabled: boolean;
  models: AIModel[];
  rateLimitPerMinute?: number;
  monthlyQuota?: number;
}

export interface AIUsageStats {
  provider: AIProvider;
  model: string;
  date: string;
  requestCount: number;
  tokenCount: number;
  errorCount: number;
  avgResponseTime: number;
  totalCost: number;
}

export interface AIPromptTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  metadata: {
    title: string;
    description: string;
    version: string;
    tags: string[];
    temperature?: number;
    maxTokens?: number;
  };
  locale: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AILogEntry {
  id: string;
  timestamp: string;
  provider: AIProvider;
  model: string;
  requestId: string;
  userId?: string;
  prompt: string;
  response: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  responseTime: number;
  cost: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface AICacheConfig {
  enabled: boolean;
  ttl: number;
  maxSize: number;
  hitRate?: number;
  totalCached?: number;
  totalSize?: number;
}

export interface AIQuotaLimit {
  userId?: string;
  provider: AIProvider;
  type: 'monthly' | 'daily' | 'hourly';
  limit: number;
  used: number;
  resetAt: string;
}

export interface AITestResult {
  provider: AIProvider;
  model: string;
  prompt: string;
  response: string;
  responseTime: number;
  tokens: number;
  cost: number;
  timestamp: string;
}

export interface AIConfigForm {
  providers: Record<AIProvider, Partial<AIProviderConfig>>;
  defaultProvider: AIProvider;
  cache: AICacheConfig;
  rateLimiting: {
    enabled: boolean;
    globalLimitPerMinute: number;
    perUserLimitPerMinute: number;
  };
  monitoring: {
    logRequests: boolean;
    logResponses: boolean;
    retentionDays: number;
  };
}

// Chart 数据类型
export interface AIChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

// 过滤器类型
export interface AILogFilter {
  provider?: AIProvider;
  model?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  hasError?: boolean;
  minCost?: number;
  maxCost?: number;
}

export interface AIUsageFilter {
  provider?: AIProvider;
  dateFrom?: string;
  dateTo?: string;
  groupBy: 'day' | 'week' | 'month';
}