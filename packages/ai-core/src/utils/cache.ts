import type { Redis } from '@upstash/redis';
import type { CacheManager } from '../core/interfaces';
import { CacheError } from '../core/errors';
import { AILogger } from './logger';

export class RedisCacheManager implements CacheManager {
  public redis: Redis;
  public config: any;
  private logger: AILogger;
  private keyPrefix: string;

  constructor(redis: Redis, keyPrefix = 'ai:cache:') {
    this.redis = redis;
    this.config = { keyPrefix };
    this.logger = AILogger.getInstance();
    this.keyPrefix = keyPrefix;
  }

  private getFullKey(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.getFullKey(key);
      const result = await this.redis.get<T>(fullKey);

      this.logger.logCacheOperation('get', key, result !== null);

      return result;
    } catch (error) {
      this.logger.error('Cache get operation failed', { key, error });
      throw new CacheError('get', error);
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      const options = ttl ? { ex: ttl } : undefined;

      await this.redis.set(fullKey, value, options);

      this.logger.logCacheOperation('set', key);
    } catch (error) {
      this.logger.error('Cache set operation failed', { key, ttl, error });
      throw new CacheError('set', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const fullKey = this.getFullKey(key);
      await this.redis.del(fullKey);

      this.logger.logCacheOperation('delete', key);
    } catch (error) {
      this.logger.error('Cache delete operation failed', { key, error });
      throw new CacheError('delete', error);
    }
  }

  async clear(): Promise<void> {
    try {
      const pattern = `${this.keyPrefix}*`;
      const keys = await this.redis.keys(pattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.info('Cache cleared', { keysDeleted: keys.length });
      }
    } catch (error) {
      this.logger.error('Cache clear operation failed', { error });
      throw new CacheError('clear', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const fullKey = this.getFullKey(key);
      const result = await this.redis.exists(fullKey);

      this.logger.logCacheOperation('exists', key, result === 1);

      return result === 1;
    } catch (error) {
      this.logger.error('Cache exists operation failed', { key, error });
      throw new CacheError('exists', error);
    }
  }

  // Additional utility methods for AI cache management
  async getMultiple<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const fullKeys = keys.map(key => this.getFullKey(key));
      const results = await this.redis.mget(...fullKeys) as (T | null)[];

      this.logger.debug('Cache multi-get operation', {
        keysRequested: keys.length,
        keysFound: results.filter((r: T | null) => r !== null).length,
      });

      return results;
    } catch (error) {
      this.logger.error('Cache multi-get operation failed', { keys, error });
      throw new CacheError('multi-get', error);
    }
  }

  async setMultiple<T>(entries: Array<{ key: string; value: T; ttl?: number }>): Promise<void> {
    try {
      const pipeline = this.redis.pipeline();

      for (const entry of entries) {
        const fullKey = this.getFullKey(entry.key);
        const options = entry.ttl ? { ex: entry.ttl } : undefined;
        pipeline.set(fullKey, entry.value, options);
      }

      await pipeline.exec();

      this.logger.debug('Cache multi-set operation', { entriesSet: entries.length });
    } catch (error) {
      this.logger.error('Cache multi-set operation failed', { entries, error });
      throw new CacheError('multi-set', error);
    }
  }

  async getStats(): Promise<{
    totalKeys: number;
    memory: string;
    hits: number;
    misses: number;
  }> {
    try {
      const keys = await this.redis.keys(`${this.keyPrefix}*`);

      // Upstash Redis doesn't support the INFO command, so we'll provide basic stats
      let memory = 'unknown';

      // Try to get memory info if available (this might not work with Upstash)
      try {
        const info = await (this.redis as any).info?.('memory');
        if (info) {
          const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
          memory = memoryMatch ? memoryMatch[1].trim() : 'unknown';
        }
      } catch {
        // Ignore error if info command is not available
        memory = 'unavailable';
      }

      return {
        totalKeys: keys.length,
        memory,
        hits: 0, // Would need to track these separately
        misses: 0, // Would need to track these separately
      };
    } catch (error) {
      this.logger.error('Failed to get cache stats', { error });
      return {
        totalKeys: 0,
        memory: 'unknown',
        hits: 0,
        misses: 0,
      };
    }
  }
}

// In-memory cache fallback for development or when Redis is not available
export class MemoryCacheManager implements CacheManager {
  private cache: Map<string, { value: any; expiry?: number }> = new Map();
  private logger: AILogger;

  constructor() {
    this.logger = AILogger.getInstance();

    // Clean up expired entries periodically
    setInterval(() => {
      this.cleanupExpired();
    }, 60000); // Every minute
  }

  private cleanupExpired(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry && entry.expiry < now) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug('Memory cache cleanup', { expiredKeysRemoved: cleanedCount });
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.logger.logCacheOperation('get', key, false);
      return null;
    }

    if (entry.expiry && entry.expiry < Date.now()) {
      this.cache.delete(key);
      this.logger.logCacheOperation('get', key, false);
      return null;
    }

    this.logger.logCacheOperation('get', key, true);
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expiry = ttl ? Date.now() + (ttl * 1000) : undefined;
    this.cache.set(key, { value, expiry: expiry || undefined });
    this.logger.logCacheOperation('set', key);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    this.logger.logCacheOperation('delete', key);
  }

  async clear(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();
    this.logger.info('Memory cache cleared', { keysDeleted: size });
  }

  async exists(key: string): Promise<boolean> {
    const exists = this.cache.has(key);
    this.logger.logCacheOperation('exists', key, exists);
    return exists;
  }
}
