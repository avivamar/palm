import { Logger } from '@rolitt/shared';
import { PalmConfig } from '../config';
import { CacheKey, CacheEntry } from '../types';
import crypto from 'crypto';
import Redis from 'ioredis';

/**
 * 缓存管理器 - 多层缓存策略
 * 
 * 功能特性：
 * - L1: 内存缓存（热数据）
 * - L2: Redis 缓存（温数据）
 * - L3: 持久化存储（冷数据）
 * - 智能缓存失效和刷新
 * - 压缩支持
 */
export class CacheManager {
  private logger: Logger;
  private memoryCache: Map<string, CacheEntry<any>>;
  private redis: Redis | null = null;
  private cacheStats: {
    hits: number;
    misses: number;
    sets: number;
    evictions: number;
  };

  constructor(private config: PalmConfig, logger?: Logger) {
    this.logger = logger || new Logger('CacheManager');
    this.memoryCache = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0
    };

    // 初始化 Redis 连接
    this.initializeRedis();

    // 定期清理过期缓存
    if (this.config.cache.enabled) {
      this.startCacheCleanup();
    }
  }

  /**
   * 初始化 Redis 连接
   */
  private initializeRedis(): void {
    if (this.config.cache.provider !== 'redis') {
      return;
    }

    try {
      const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
      
      if (!redisUrl) {
        this.logger.warn('未配置Redis URL，仅使用内存缓存');
        return;
      }

      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        connectTimeout: 10000,
        commandTimeout: 5000,
        lazyConnect: true,
        keyPrefix: 'palm:',
      });

      this.redis.on('connect', () => {
        this.logger.info('Redis连接成功');
      });

      this.redis.on('error', (error) => {
        this.logger.error('Redis连接错误:', error);
        // 不设置为null，允许自动重连
      });

      this.redis.on('close', () => {
        this.logger.warn('Redis连接已关闭');
      });

      this.redis.on('reconnecting', () => {
        this.logger.info('Redis正在重连...');
      });

    } catch (error) {
      this.logger.error('Redis初始化失败:', error);
      this.redis = null;
    }
  }

  /**
   * 获取缓存数据
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.config.cache.enabled) {
        return null;
      }

      // 1. 尝试内存缓存 (L1)
      const memoryResult = await this.getFromMemory<T>(key);
      if (memoryResult) {
        this.cacheStats.hits++;
        this.logger.debug('Cache hit from memory', { key });
        return memoryResult;
      }

      // 2. 尝试 Redis 缓存 (L2) - 如果配置了 Redis
      if (this.config.cache.provider === 'redis') {
        const redisResult = await this.getFromRedis<T>(key);
        if (redisResult) {
          // 回写到内存缓存
          await this.setToMemory(key, redisResult, this.getDefaultTTL(key));
          this.cacheStats.hits++;
          this.logger.debug('Cache hit from Redis', { key });
          return redisResult;
        }
      }

      this.cacheStats.misses++;
      this.logger.debug('Cache miss', { key });
      return null;

    } catch (error) {
      this.logger.error('Cache get error', { 
        key, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * 设置缓存数据
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      if (!this.config.cache.enabled) {
        return;
      }

      const finalTTL = ttl || this.getDefaultTTL(key);

      // 1. 设置到内存缓存 (L1)
      await this.setToMemory(key, value, finalTTL);

      // 2. 设置到 Redis 缓存 (L2) - 如果配置了 Redis
      if (this.config.cache.provider === 'redis') {
        await this.setToRedis(key, value, finalTTL);
      }

      this.cacheStats.sets++;
      this.logger.debug('Cache set', { key, ttl: finalTTL });

    } catch (error) {
      this.logger.error('Cache set error', { 
        key, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<void> {
    try {
      // 从内存删除
      this.memoryCache.delete(key);

      // 从 Redis 删除
      if (this.config.cache.provider === 'redis') {
        await this.deleteFromRedis(key);
      }

      this.logger.debug('Cache deleted', { key });

    } catch (error) {
      this.logger.error('Cache delete error', { 
        key, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    try {
      // 清空内存缓存
      this.memoryCache.clear();

      // 清空 Redis 缓存
      if (this.config.cache.provider === 'redis') {
        await this.clearRedis();
      }

      this.logger.info('All cache cleared');

    } catch (error) {
      this.logger.error('Cache clear error', { error });
    }
  }

  /**
   * 生成缓存键
   */
  generateKey(
    type: 'image_features' | 'quick_report' | 'full_report' | 'ai_response',
    params: Record<string, any>
  ): string {
    // 创建参数的确定性哈希
    const paramStr = JSON.stringify(params, Object.keys(params).sort());
    const hash = crypto.createHash('sha256').update(paramStr).digest('hex').substring(0, 16);
    
    return `palm:${type}:${hash}`;
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    const totalRequests = this.cacheStats.hits + this.cacheStats.misses;
    const hitRate = totalRequests > 0 ? this.cacheStats.hits / totalRequests : 0;

    return {
      ...this.cacheStats,
      hitRate,
      memorySize: this.memoryCache.size,
      enabled: this.config.cache.enabled,
      provider: this.config.cache.provider,
    };
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.config.cache.enabled) {
        return true; // 禁用缓存时认为是健康的
      }

      // 测试内存缓存
      const testKey = 'health_check_test';
      const testValue = { test: true, timestamp: Date.now() };
      
      await this.setToMemory(testKey, testValue, 10);
      const retrieved = await this.getFromMemory(testKey);
      
      if (!retrieved || retrieved.test !== true) {
        return false;
      }

      // 清理测试数据
      this.memoryCache.delete(testKey);

      // 如果使用 Redis，也测试 Redis 连接
      if (this.config.cache.provider === 'redis') {
        return await this.checkRedisHealth();
      }

      return true;

    } catch (error) {
      this.logger.error('Cache health check failed', { error });
      return false;
    }
  }

  /**
   * 释放资源
   */
  async dispose(): Promise<void> {
    try {
      // 清空内存缓存
      this.memoryCache.clear();

      // 停止清理定时器
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
      }

      // 关闭 Redis 连接
      if (this.redis) {
        await this.redis.quit();
        this.redis = null;
      }

      this.logger.info('Cache manager disposed');

    } catch (error) {
      this.logger.error('Cache dispose error', { error });
    }
  }

  // 私有方法

  private cleanupInterval?: NodeJS.Timeout;

  /**
   * 从内存缓存获取
   */
  private async getFromMemory<T>(key: string): Promise<T | null> {
    const entry = this.memoryCache.get(key);
    
    if (!entry) {
      return null;
    }

    // 检查是否过期
    if (entry.expiresAt < new Date()) {
      this.memoryCache.delete(key);
      this.cacheStats.evictions++;
      return null;
    }

    // 更新命中次数
    entry.hits++;
    
    return entry.data;
  }

  /**
   * 设置到内存缓存
   */
  private async setToMemory<T>(key: string, value: T, ttl: number): Promise<void> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttl * 1000);

    const entry: CacheEntry<T> = {
      data: value,
      createdAt: now,
      expiresAt,
      hits: 0
    };

    // 检查缓存大小限制
    await this.evictIfNeeded();

    this.memoryCache.set(key, entry);
  }

  /**
   * 从 Redis 获取
   */
  private async getFromRedis<T>(key: string): Promise<T | null> {
    if (!this.redis) {
      return null;
    }

    try {
      const result = await this.redis.get(key);
      
      if (!result) {
        return null;
      }

      // 解析 JSON 数据
      const parsed = JSON.parse(result);
      
      // 检查过期时间
      if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
        // 数据已过期，删除并返回 null
        await this.redis.del(key);
        return null;
      }

      return parsed.data;

    } catch (error) {
      this.logger.error('Redis get error', { key, error });
      return null;
    }
  }

  /**
   * 设置到 Redis
   */
  private async setToRedis<T>(key: string, value: T, ttl: number): Promise<void> {
    if (!this.redis) {
      return;
    }

    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + ttl * 1000);

      const cacheData = {
        data: value,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      // 使用 JSON 序列化存储
      const serialized = JSON.stringify(cacheData);
      
      // 设置到 Redis，使用 TTL 自动过期
      await this.redis.setex(key, ttl, serialized);

    } catch (error) {
      this.logger.error('Redis set error', { key, ttl, error });
    }
  }

  /**
   * 从 Redis 删除
   */
  private async deleteFromRedis(key: string): Promise<void> {
    if (!this.redis) {
      return;
    }

    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error('Redis delete error', { key, error });
    }
  }

  /**
   * 清空 Redis（仅清空 palm: 前缀的键）
   */
  private async clearRedis(): Promise<void> {
    if (!this.redis) {
      return;
    }

    try {
      // 获取所有 palm: 前缀的键
      const keys = await this.redis.keys('palm:*');
      
      if (keys.length > 0) {
        // 批量删除
        await this.redis.del(...keys);
        this.logger.info('Redis palm keys cleared', { count: keys.length });
      }

    } catch (error) {
      this.logger.error('Redis clear error', { error });
    }
  }

  /**
   * 检查 Redis 健康状态
   */
  private async checkRedisHealth(): Promise<boolean> {
    if (!this.redis) {
      return false;
    }

    try {
      // 执行 PING 命令检查连接
      const pong = await this.redis.ping();
      
      if (pong === 'PONG') {
        // 测试读写操作
        const testKey = 'health_check_redis';
        const testValue = { test: true, timestamp: Date.now() };
        
        await this.redis.setex(testKey, 10, JSON.stringify(testValue));
        const retrieved = await this.redis.get(testKey);
        
        // 清理测试数据
        await this.redis.del(testKey);
        
        return retrieved !== null;
      }

      return false;

    } catch (error) {
      this.logger.error('Redis health check error', { error });
      return false;
    }
  }

  /**
   * 获取默认 TTL
   */
  private getDefaultTTL(key: string): number {
    if (key.includes('image_features')) {
      return this.config.cache.ttl.imageFeatures;
    }
    if (key.includes('quick_report')) {
      return this.config.cache.ttl.quickReport;
    }
    if (key.includes('full_report')) {
      return this.config.cache.ttl.fullReport;
    }
    if (key.includes('ai_response')) {
      return this.config.cache.ttl.aiResponse;
    }
    
    return 3600; // 默认 1 小时
  }

  /**
   * 需要时清理缓存
   */
  private async evictIfNeeded(): Promise<void> {
    const currentSize = this.calculateMemorySize();
    
    if (currentSize > this.config.cache.maxSize) {
      // LRU 清理策略 - 清理最少使用的条目
      const entries = Array.from(this.memoryCache.entries())
        .map(([key, entry]) => ({ key, entry }))
        .sort((a, b) => a.entry.hits - b.entry.hits);

      // 清理 25% 的缓存
      const toRemove = Math.ceil(entries.length * 0.25);
      for (let i = 0; i < toRemove; i++) {
        this.memoryCache.delete(entries[i].key);
        this.cacheStats.evictions++;
      }

      this.logger.info('Cache eviction completed', { 
        removed: toRemove, 
        remaining: this.memoryCache.size 
      });
    }
  }

  /**
   * 计算内存使用量（估算）
   */
  private calculateMemorySize(): number {
    let size = 0;
    
    for (const [key, entry] of this.memoryCache.entries()) {
      // 简单估算：键长度 + JSON 字符串长度
      size += key.length * 2; // UTF-16
      size += JSON.stringify(entry.data).length * 2;
      size += 64; // 元数据开销估算
    }
    
    return size;
  }

  /**
   * 启动缓存清理
   */
  private startCacheCleanup(): void {
    // 每 5 分钟清理一次过期缓存
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, 5 * 60 * 1000);
  }

  /**
   * 清理过期条目
   */
  private cleanupExpiredEntries(): void {
    const now = new Date();
    let removedCount = 0;

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.expiresAt < now) {
        this.memoryCache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.logger.debug('Expired cache entries cleaned', { 
        removed: removedCount,
        remaining: this.memoryCache.size
      });
      this.cacheStats.evictions += removedCount;
    }
  }
}