/**
 * Cache Manager Service
 * Following CLAUDE.md: 多层缓存策略，性能优化
 */

import { Redis } from 'ioredis';

/**
 * Cache configuration
 */
export type CacheConfig = {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix
  compression?: boolean; // Enable compression for large values
  fallback?: boolean; // Use memory fallback if Redis unavailable
};

/**
 * Cache entry with metadata
 */
export type CacheEntry<T = any> = {
  data: T;
  timestamp: number;
  ttl: number;
  compressed?: boolean;
};

/**
 * Cache statistics
 */
export type CacheStats = {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
};

/**
 * Multi-layer cache manager with Redis and memory fallback
 */
export class CacheManager {
  private redis: Redis | null = null;
  private memoryCache: Map<string, CacheEntry> = new Map();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
  };

  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Re-enable Redis now that deployment is stable
    this.initializeRedis();
    this.setupMemoryCleanup();
  }

  /**
   * Initialize Redis connection
   */
  private initializeRedis(): void {
    try {
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL, {
          enableOfflineQueue: false,
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });

        this.redis.on('error', (error) => {
          console.warn('Redis cache error, falling back to memory:', error);
          this.stats.errors++;
        });

        this.redis.on('connect', () => {
          console.log('✅ Redis cache connected');
        });
      }
    } catch (error) {
      console.warn('Failed to initialize Redis cache:', error);
      this.redis = null;
    }
  }

  /**
   * Setup memory cache cleanup
   */
  private setupMemoryCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.memoryCache.entries()) {
        if (now - entry.timestamp > entry.ttl * 1000) {
          this.memoryCache.delete(key);
        }
      }
    }, 60000); // Clean every minute
  }

  /**
   * Generate cache key with prefix
   */
  private generateKey(key: string, prefix?: string): string {
    const keyPrefix = prefix || 'cache';
    return `${keyPrefix}:${key}`;
  }

  /**
   * Compress data if needed
   */
  private compress(data: any): string {
    return JSON.stringify(data);
  }

  /**
   * Decompress data if needed
   */
  private decompress(data: string): any {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.warn('Failed to decompress cache data:', error);
      return null;
    }
  }

  /**
   * Get value from cache (Redis first, then memory)
   */
  async get<T>(key: string, config: CacheConfig = {}): Promise<T | null> {
    const cacheKey = this.generateKey(key, config.prefix);

    try {
      // Try Redis first
      if (this.redis) {
        const redisValue = await this.redis.get(cacheKey);
        if (redisValue) {
          this.stats.hits++;
          const entry: CacheEntry<T> = this.decompress(redisValue);
          return entry.data;
        }
      }

      // Fallback to memory cache
      if (config.fallback !== false) {
        const memoryEntry = this.memoryCache.get(cacheKey);
        if (memoryEntry) {
          const now = Date.now();
          if (now - memoryEntry.timestamp < memoryEntry.ttl * 1000) {
            this.stats.hits++;
            return memoryEntry.data;
          } else {
            this.memoryCache.delete(cacheKey);
          }
        }
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      console.warn('Cache get error:', error);
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Set value in cache (Redis and memory)
   */
  async set<T>(key: string, value: T, config: CacheConfig = {}): Promise<boolean> {
    const cacheKey = this.generateKey(key, config.prefix);
    const ttl = config.ttl || 3600; // Default 1 hour
    const now = Date.now();

    const entry: CacheEntry<T> = {
      data: value,
      timestamp: now,
      ttl,
      compressed: config.compression,
    };

    try {
      // Set in Redis
      if (this.redis) {
        const serialized = this.compress(entry);
        await this.redis.setex(cacheKey, ttl, serialized);
      }

      // Set in memory as fallback
      if (config.fallback !== false) {
        this.memoryCache.set(cacheKey, entry);
      }

      this.stats.sets++;
      return true;
    } catch (error) {
      console.warn('Cache set error:', error);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string, config: CacheConfig = {}): Promise<boolean> {
    const cacheKey = this.generateKey(key, config.prefix);

    try {
      // Delete from Redis
      if (this.redis) {
        await this.redis.del(cacheKey);
      }

      // Delete from memory
      this.memoryCache.delete(cacheKey);

      this.stats.deletes++;
      return true;
    } catch (error) {
      console.warn('Cache delete error:', error);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Clear cache by prefix
   */
  async clear(prefix?: string): Promise<boolean> {
    try {
      const pattern = prefix ? `${prefix}:*` : 'cache:*';

      // Clear Redis
      if (this.redis) {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }

      // Clear memory
      const prefixPattern = prefix || 'cache';
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(`${prefixPattern}:`)) {
          this.memoryCache.delete(key);
        }
      }

      return true;
    } catch (error) {
      console.warn('Cache clear error:', error);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Get or set pattern - get from cache, or execute function and cache result
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    config: CacheConfig = {},
  ): Promise<T> {
    const cached = await this.get<T>(key, config);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, config);
    return value;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
    };
  }

  /**
   * Get cache health info
   */
  async getHealthInfo(): Promise<{
    redis: boolean;
    memory: number;
    stats: CacheStats;
  }> {
    let redisHealth = false;

    try {
      if (this.redis) {
        await this.redis.ping();
        redisHealth = true;
      }
    } catch (error) {
      redisHealth = false;
    }

    return {
      redis: redisHealth,
      memory: this.memoryCache.size,
      stats: this.getStats(),
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    if (this.redis) {
      this.redis.disconnect();
    }

    this.memoryCache.clear();
  }
}

// Global cache manager instance
export const cacheManager = new CacheManager();

/**
 * Cache configurations for different use cases
 */
export const CACHE_CONFIGS = {
  // API响应缓存
  API_RESPONSE: {
    ttl: 300, // 5 minutes
    prefix: 'api',
    compression: true,
  },

  // 用户会话缓存
  USER_SESSION: {
    ttl: 1800, // 30 minutes
    prefix: 'session',
    compression: false,
  },

  // 数据库查询缓存
  DB_QUERY: {
    ttl: 600, // 10 minutes
    prefix: 'db',
    compression: true,
  },

  // 静态数据缓存
  STATIC_DATA: {
    ttl: 3600, // 1 hour
    prefix: 'static',
    compression: true,
  },

  // 短时间缓存
  SHORT_TERM: {
    ttl: 60, // 1 minute
    prefix: 'short',
    compression: false,
  },
} as const;

/**
 * Helper functions for common caching patterns
 */

/**
 * Cache API response
 */
export async function cacheApiResponse<T>(
  endpoint: string,
  handler: () => Promise<T>,
  ttl: number = CACHE_CONFIGS.API_RESPONSE.ttl,
): Promise<T> {
  const key = `api:${endpoint}`;
  return cacheManager.getOrSet(key, handler, {
    ...CACHE_CONFIGS.API_RESPONSE,
    ttl,
  });
}

/**
 * Cache user session
 */
export async function cacheUserSession(
  userId: string,
  sessionData: any,
  ttl: number = CACHE_CONFIGS.USER_SESSION.ttl,
): Promise<boolean> {
  const key = `user:${userId}`;
  return cacheManager.set(key, sessionData, {
    ...CACHE_CONFIGS.USER_SESSION,
    ttl,
  });
}

/**
 * Get cached user session
 */
export async function getCachedUserSession(userId: string): Promise<any | null> {
  const key = `user:${userId}`;
  return cacheManager.get(key, CACHE_CONFIGS.USER_SESSION);
}

/**
 * Cache database query result
 */
export async function cacheDbQuery<T>(
  queryKey: string,
  queryHandler: () => Promise<T>,
  ttl: number = CACHE_CONFIGS.DB_QUERY.ttl,
): Promise<T> {
  const key = `db:${queryKey}`;
  return cacheManager.getOrSet(key, queryHandler, {
    ...CACHE_CONFIGS.DB_QUERY,
    ttl,
  });
}

/**
 * Invalidate cache pattern
 */
export async function invalidateCache(pattern: string): Promise<boolean> {
  return cacheManager.clear(pattern);
}

/**
 * Cache middleware for API routes
 */
export function withCache(config: CacheConfig = CACHE_CONFIGS.API_RESPONSE) {
  return function <T>(
    handler: (key: string) => Promise<T>,
  ) {
    return async function (key: string): Promise<T> {
      return cacheManager.getOrSet(key, () => handler(key), config);
    };
  };
}
