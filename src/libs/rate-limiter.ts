import type Redis from 'ioredis';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// 内存存储作为 Redis 的回退
const memoryStore = new Map<string, { count: number; resetTime: number }>();

// 速率限制配置接口
type RateLimitConfig = {
  window: number; // Time window in seconds
  max: number; // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean; // Include rate limit info in response headers
  headers?: boolean;
};

// 速率限制结果接口
type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
};

/**
 * 高性能速率限制器
 * 支持 Redis 和内存存储双重回退机制
 */
export class RateLimiter {
  private redis: Redis | null = null;
  private config: RateLimitConfig;
  private isRedisAvailable = false;

  constructor(config: RateLimitConfig) {
    this.config = {
      headers: true,
      ...config,
    };

    this.initializeRedis();
  }

  private async initializeRedis(): Promise<void> {
    // 临时禁用Redis连接以确保项目稳定运行
    console.warn('[RateLimiter] Redis temporarily disabled for stability');
    this.redis = null;
    this.isRedisAvailable = false;
  }

  /**
   * 检查速率限制
   */
  async checkLimit(request: NextRequest): Promise<RateLimitResult> {
    const key = this.config.keyGenerator
      ? this.config.keyGenerator(request)
      : this.getDefaultKey(request);

    const now = Date.now();
    const windowStart = Math.floor(now / (this.config.window * 1000)) * this.config.window * 1000;
    const resetTime = windowStart + this.config.window * 1000;

    try {
      if (this.redis && this.isRedisAvailable) {
        return await this.checkRedisLimit(key, windowStart, resetTime);
      }
    } catch (error) {
      console.error('[RateLimiter] Redis check failed, falling back to memory:', error);
      this.isRedisAvailable = false;
    }

    // 回退到内存存储
    return this.checkMemoryLimit(key, windowStart, resetTime);
  }

  /**
   * Redis 速率限制检查
   */
  private async checkRedisLimit(
    key: string,
    windowStart: number,
    resetTime: number,
  ): Promise<RateLimitResult> {
    const redisKey = `rate_limit:${key}:${windowStart}`;

    // 使用 Redis 管道优化性能
    const pipeline = this.redis!.pipeline();
    pipeline.incr(redisKey);
    pipeline.expire(redisKey, this.config.window + 1); // 稍微延长过期时间

    const results = await pipeline.exec();
    const count = results?.[0]?.[1] as number;

    const remaining = Math.max(0, this.config.max - count);
    const success = count <= this.config.max;

    return {
      success,
      limit: this.config.max,
      remaining,
      resetTime,
      retryAfter: success ? undefined : Math.ceil((resetTime - Date.now()) / 1000),
    };
  }

  /**
   * 内存速率限制检查
   */
  private checkMemoryLimit(
    key: string,
    windowStart: number,
    resetTime: number,
  ): RateLimitResult {
    const memoryKey = `${key}:${windowStart}`;
    const existing = memoryStore.get(memoryKey);

    let count = 1;
    if (existing && existing.resetTime === resetTime) {
      count = existing.count + 1;
    }

    memoryStore.set(memoryKey, { count, resetTime });

    // 清理过期的内存条目
    this.cleanupMemoryStore();

    const remaining = Math.max(0, this.config.max - count);
    const success = count <= this.config.max;

    return {
      success,
      limit: this.config.max,
      remaining,
      resetTime,
      retryAfter: success ? undefined : Math.ceil((resetTime - Date.now()) / 1000),
    };
  }

  /**
   * 清理过期的内存存储条目
   */
  private cleanupMemoryStore(): void {
    const now = Date.now();
    for (const [key, value] of memoryStore.entries()) {
      if (value.resetTime < now) {
        memoryStore.delete(key);
      }
    }
  }

  /**
   * 生成默认的限制键
   */
  private getDefaultKey(request: NextRequest): string {
    // 优先使用真实 IP，回退到转发的 IP
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = realIp
      || (forwarded ? forwarded.split(',')[0]?.trim() : null)
      || 'unknown';

    return `ip:${ip}`;
  }

  /**
   * 重置特定键的限制
   */
  async resetLimit(key: string): Promise<void> {
    try {
      if (this.redis && this.isRedisAvailable) {
        const pattern = `rate_limit:${key}:*`;
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      }
    } catch (error) {
      console.error('[RateLimiter] Failed to reset Redis limit:', error);
    }

    // 同时清理内存存储
    for (const memKey of memoryStore.keys()) {
      if (memKey.startsWith(`${key}:`)) {
        memoryStore.delete(memKey);
      }
    }
  }

  /**
   * 获取当前限制状态
   */
  async getStatus(key: string): Promise<{ redis: boolean; memory: number }> {
    const memoryCount = Array.from(memoryStore.keys()).filter(k => k.startsWith(`${key}:`)).length;

    return {
      redis: this.isRedisAvailable,
      memory: memoryCount,
    };
  }

  /**
   * 关闭连接
   */
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
    memoryStore.clear();
  }
}

// 速率限制配置
export const RATE_LIMIT_CONFIGS = {
  API_GENERAL: {
    window: 60, // 1分钟
    max: 100, // 100次请求
  },
  AUTH_API: {
    window: 60, // 1分钟
    max: 20, // 20次请求
  },
  ADMIN_API: {
    window: 60, // 1分钟
    max: 10, // 10次请求
  },
};

// 创建速率限制中间件
function createRateLimitMiddleware(config: RateLimitConfig) {
  const limiter = new RateLimiter(config);

  return async (request: NextRequest) => {
    const result = await limiter.checkLimit(request);

    if (!result.success) {
      const response = new Response(
        JSON.stringify({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded',
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
            ...(result.retryAfter && {
              'Retry-After': result.retryAfter.toString(),
            }),
          },
        },
      );
      return new NextResponse(response.body, response);
    }

    return null; // 继续处理请求
  };
}

// 导出速率限制器对象
export const rateLimiter = {
  middleware: createRateLimitMiddleware,
};

// 导出默认实例
export const defaultRateLimiter = new RateLimiter({
  window: 60, // 1分钟
  max: 100, // 100次请求
});

// 导出严格限制实例
export const strictRateLimiter = new RateLimiter({
  window: 60, // 1分钟
  max: 20, // 20次请求
});
