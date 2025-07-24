import type {
  LoadedPrompt,
  PromptCacheEntry,
  PromptMetadata,
  PromptStats,
  PromptVariables,
  SupportedLocale,
} from './types';
// import type { PromptManager } from '../core/interfaces';
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { z } from 'zod';
import { PromptNotFoundError } from '../core/errors';
import { AILogger } from '../utils/logger';

// Prompt metadata validation schema
const promptMetadataSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  version: z.string().min(1),
  tags: z.array(z.string()).optional(),
  maxTokens: z.number().positive().optional(),
  temperature: z.number().min(0).max(2).optional(),
  category: z.string().optional(),
  locale: z.enum(['en', 'es', 'ja', 'zh-HK']).optional(),
  lastModified: z.string().optional(),
});

export class PromptLoader {
  private static promptsDir = path.join(process.cwd(), 'packages/ai-core/src/prompts');
  private static cache = new Map<string, PromptCacheEntry>();
  private static logger = AILogger.getInstance();
  private static stats = {
    cacheHits: 0,
    cacheMisses: 0,
    totalLoads: 0,
  };

  static async loadPrompt(
    category: string,
    name: string,
    locale: SupportedLocale = 'en',
    variables?: PromptVariables,
  ): Promise<string> {
    const cacheKey = `${category}/${name}/${locale}`;
    this.stats.totalLoads++;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.stats.cacheHits++;
      cached.accessCount++;
      this.logger.debug('Prompt cache hit', { category, name, locale });

      return variables ? this.interpolateVariables(cached.content, variables) : cached.content;
    }

    this.stats.cacheMisses++;
    this.logger.debug('Prompt cache miss', { category, name, locale });

    try {
      // Try to load the prompt file
      const loadedPrompt = await this.tryLoadPromptFile(category, name, locale);

      if (!loadedPrompt) {
        throw new PromptNotFoundError(category, name, locale);
      }

      const { content, metadata } = loadedPrompt;

      // Cache the loaded prompt
      this.cache.set(cacheKey, {
        content,
        metadata,
        loadedAt: Date.now(),
        accessCount: 1,
      });

      this.logger.info('Prompt loaded and cached', {
        category,
        name,
        locale,
        title: metadata.title,
      });

      return variables ? this.interpolateVariables(content, variables) : content;
    } catch (error) {
      if (error instanceof PromptNotFoundError) {
        throw error;
      }

      this.logger.error('Failed to load prompt', { category, name, locale, error });
      throw new Error(`Failed to load prompt: ${category}/${name}`, { cause: error });
    }
  }

  private static async tryLoadPromptFile(
    category: string,
    name: string,
    locale: SupportedLocale,
  ): Promise<LoadedPrompt | null> {
    const possiblePaths = [
      // Try locale-specific path first
      path.join(this.promptsDir, 'locales', locale, category, `${name}.md`),
      // Fall back to default category path
      path.join(this.promptsDir, category, `${name}.md`),
      // Try root level as last resort
      path.join(this.promptsDir, `${name}.md`),
    ];

    for (const filePath of possiblePaths) {
      try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const parsed = matter(fileContent);

        // Validate metadata
        const metadata = promptMetadataSchema.parse(parsed.data);

        return {
          content: parsed.content.trim(),
          metadata: {
            ...metadata,
            category,
            locale,
            lastModified: new Date().toISOString(),
          },
          variables: this.extractVariables(parsed.content),
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          this.logger.warn('Invalid prompt metadata', {
            filePath,
            errors: error.errors,
          });
        }
        // Continue to next path
        continue;
      }
    }

    return null;
  }

  private static extractVariables(content: string): string[] {
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variableRegex.exec(content)) !== null) {
      const varName = match[1];
      if (varName && !variables.includes(varName)) {
        variables.push(varName);
      }
    }

    return variables;
  }

  private static interpolateVariables(
    template: string,
    variables: PromptVariables,
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = variables[key];
      if (value === undefined || value === null) {
        this.logger.warn('Missing variable in prompt template', {
          variable: key,
          template: `${template.substring(0, 100)}...`,
        });
        return match; // Keep the placeholder if variable is missing
      }
      return String(value);
    });
  }

  // List all available prompts in a category
  static async listPrompts(category?: string): Promise<string[]> {
    try {
      const searchDir = category
        ? path.join(this.promptsDir, category)
        : this.promptsDir;

      const entries = await fs.readdir(searchDir, { withFileTypes: true });
      const prompts: string[] = [];

      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.md')) {
          const promptName = entry.name.replace('.md', '');
          prompts.push(category ? `${category}/${promptName}` : promptName);
        } else if (entry.isDirectory() && !category) {
          // Recursively list prompts in subdirectories
          const subPrompts = await this.listPrompts(entry.name);
          prompts.push(...subPrompts);
        }
      }

      return prompts.sort();
    } catch (error) {
      this.logger.error('Failed to list prompts', { category, error });
      return [];
    }
  }

  // Validate a prompt template
  static validatePrompt(content: string): boolean {
    try {
      // Check for basic structure
      if (!content || content.trim().length === 0) {
        return false;
      }

      // Check for balanced variable placeholders
      const openBraces = (content.match(/\{\{/g) || []).length;
      const closeBraces = (content.match(/\}\}/g) || []).length;

      if (openBraces !== closeBraces) {
        this.logger.warn('Unbalanced variable placeholders in prompt', {
          openBraces,
          closeBraces,
        });
        return false;
      }

      // Check for valid variable names
      const variables = this.extractVariables(content);
      const invalidVariables = variables.filter(v => !/^[a-z_]\w*$/i.test(v));

      if (invalidVariables.length > 0) {
        this.logger.warn('Invalid variable names in prompt', { invalidVariables });
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Prompt validation failed', { error });
      return false;
    }
  }

  // Clear the prompt cache
  static clearCache(): void {
    const cacheSize = this.cache.size;
    this.cache.clear();
    this.stats.cacheHits = 0;
    this.stats.cacheMisses = 0;
    this.stats.totalLoads = 0;

    this.logger.info('Prompt cache cleared', { previousSize: cacheSize });
  }

  // Get cache and usage statistics
  static getStats(): PromptStats {
    const cacheHitRate = this.stats.totalLoads > 0
      ? (this.stats.cacheHits / this.stats.totalLoads) * 100
      : 0;

    const mostUsedPrompts = Array.from(this.cache.entries())
      .map(([key, entry]) => {
        const parts = key.split('/');
        const category = parts[0] || 'uncategorized';
        const name = parts[1] || 'unnamed';
        return {
          category,
          name,
          accessCount: entry.accessCount,
        };
      })
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10);

    // Count prompts by category
    const categoryCounts = Array.from(this.cache.values()).reduce((acc, entry) => {
      const category = entry.metadata.category || 'uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalPrompts: this.cache.size,
      categoryCounts: categoryCounts as any, // Type assertion for simplicity
      cacheHitRate,
      mostUsedPrompts,
    };
  }

  // Preload commonly used prompts
  static async preloadPrompts(prompts: Array<{ category: string; name: string; locale?: SupportedLocale }>): Promise<void> {
    this.logger.info('Preloading prompts', { count: prompts.length });

    const loadPromises = prompts.map(async ({ category, name, locale = 'en' }) => {
      try {
        await this.loadPrompt(category, name, locale);
      } catch (error) {
        this.logger.warn('Failed to preload prompt', { category, name, locale, error });
      }
    });

    await Promise.all(loadPromises);
    this.logger.info('Prompt preloading completed');
  }

  // Get prompt metadata without loading content
  static async getPromptMetadata(category: string, name: string, locale: SupportedLocale = 'en'): Promise<PromptMetadata | null> {
    const cacheKey = `${category}/${name}/${locale}`;
    const cached = this.cache.get(cacheKey);

    if (cached) {
      return cached.metadata;
    }

    try {
      const loadedPrompt = await this.tryLoadPromptFile(category, name, locale);
      return loadedPrompt?.metadata || null;
    } catch {
      return null;
    }
  }
}
