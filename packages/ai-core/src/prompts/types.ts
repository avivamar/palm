import type { SupportedLocale } from '../core/types';

export { SupportedLocale };

export type PromptMetadata = {
  title: string;
  description: string;
  version: string;
  tags?: string[];
  maxTokens?: number;
  temperature?: number;
  category?: string;
  locale?: SupportedLocale;
  lastModified?: string;
};

export type PromptVariables = {
  [key: string]: string | number | boolean;
};

export type LoadedPrompt = {
  content: string;
  metadata: PromptMetadata;
  variables?: string[];
};

export type PromptCacheEntry = {
  content: string;
  metadata: PromptMetadata;
  loadedAt: number;
  accessCount: number;
};

export type PromptCategory
  = | 'system'
    | 'ecommerce'
    | 'customer-service'
    | 'content'
    | 'marketing'
    | 'support';

export type PromptStats = {
  totalPrompts: number;
  categoryCounts: Record<PromptCategory, number>;
  cacheHitRate: number;
  mostUsedPrompts: Array<{
    category: string;
    name: string;
    accessCount: number;
  }>;
};
