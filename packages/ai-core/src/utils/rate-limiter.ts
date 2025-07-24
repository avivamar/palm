import type { Redis } from '@upstash/redis';
import type { RateLimiter } from '../core/interfaces';
import { RateLimitExceededError } from '../core/errors';
import { AILogger } from './logger';

export class RedisRateLimiter implements RateLimiter {
  public redis: Redis;
  public config: any;
  private logger: AILogger;
  private maxRequests: number;
  private windowMs: number;
  private keyPrefix: string;

  constructor(
    redis: Redis,
    maxRequests: number = 100,
    windowMs: number = 60000, // 1 minute
    keyPrefix: string = 'ai:rate_limit:',
  ) {
    this.redis = redis;
    this.config = { maxRequests, windowMs, keyPrefix };
    this.logger = AILogger.getInstance();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.keyPrefix = keyPrefix;
  }

  private getKey(identifier: string): string {
    return `${this.keyPrefix}${identifier}`;
  }

  async checkLimit(identifier: string): Promise<void> {
    try {
      const key = this.getKey(identifier);
      const now = Date.now();
      const windowStart = now - this.windowMs;

      // Use a Redis script for atomic operations
      const script = `
        local key = KEYS[1]
        local now = tonumber(ARGV[1])
        local window_start = tonumber(ARGV[2])
        local max_requests = tonumber(ARGV[3])
        local window_ms = tonumber(ARGV[4])

        -- Remove expired entries
        redis.call('ZREMRANGEBYSCORE', key, 0, window_start)

        -- Count current requests in window
        local current_count = redis.call('ZCARD', key)

        if current_count >= max_requests then
          return {0, current_count, max_requests}
        end

        -- Add current request
        local member = now .. '-' .. math.random()
        redis.call('ZADD', key, now, member)
        
        -- Set expiration for the key
        redis.call('EXPIRE', key, math.ceil(window_ms / 1000))

        return {1, current_count + 1, max_requests}
      `;

      const result = await this.redis.eval(
        script,
        [key],
        [now.toString(), windowStart.toString(), this.maxRequests.toString(), this.windowMs.toString()],
      ) as [number, number, number];

      const [allowed, currentCount, maxRequests] = result;
      const remaining = maxRequests - currentCount;

      this.logger.logRateLimit(identifier, remaining, new Date(now + this.windowMs));

      if (!allowed) {
        const resetTime = new Date(now + this.windowMs);
        throw new RateLimitExceededError(identifier, resetTime);
      }
    } catch (error) {
      if (error instanceof RateLimitExceededError) {
        throw error;
      }

      this.logger.error('Rate limit check failed', { identifier, error });
      // In case of Redis failure, allow the request but log the error
      // This prevents Redis issues from completely blocking the application
    }
  }

  async getRemainingRequests(identifier: string): Promise<number> {
    try {
      const key = this.getKey(identifier);
      const now = Date.now();
      const windowStart = now - this.windowMs;

      // Clean up expired entries and count current requests
      await this.redis.zremrangebyscore(key, 0, windowStart);
      const currentCount = await this.redis.zcard(key);

      return Math.max(0, this.maxRequests - currentCount);
    } catch (error) {
      this.logger.error('Failed to get remaining requests', { identifier, error });
      return this.maxRequests; // Return max requests if there's an error
    }
  }

  async resetLimit(identifier: string): Promise<void> {
    try {
      const key = this.getKey(identifier);
      await this.redis.del(key);
      this.logger.info('Rate limit reset', { identifier });
    } catch (error) {
      this.logger.error('Failed to reset rate limit', { identifier, error });
    }
  }

  // Additional utility methods
  async getLimitInfo(identifier: string): Promise<{
    maxRequests: number;
    windowMs: number;
    currentCount: number;
    remaining: number;
    resetTime: Date;
  }> {
    try {
      const key = this.getKey(identifier);
      const now = Date.now();
      const windowStart = now - this.windowMs;

      await this.redis.zremrangebyscore(key, 0, windowStart);
      const currentCount = await this.redis.zcard(key);
      const remaining = Math.max(0, this.maxRequests - currentCount);
      const resetTime = new Date(now + this.windowMs);

      return {
        maxRequests: this.maxRequests,
        windowMs: this.windowMs,
        currentCount,
        remaining,
        resetTime,
      };
    } catch (error) {
      this.logger.error('Failed to get limit info', { identifier, error });
      const now = Date.now();
      return {
        maxRequests: this.maxRequests,
        windowMs: this.windowMs,
        currentCount: 0,
        remaining: this.maxRequests,
        resetTime: new Date(now + this.windowMs),
      };
    }
  }
}

// In-memory rate limiter fallback
export class MemoryRateLimiter implements RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private logger: AILogger;
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.logger = AILogger.getInstance();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Clean up old entries periodically
    setInterval(() => {
      this.cleanup();
    }, this.windowMs / 2); // Cleanup twice per window
  }

  private cleanup(): void {
    const now = Date.now();
    const cutoff = now - this.windowMs;
    let cleanedCount = 0;

    for (const [identifier, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter(ts => ts > cutoff);

      if (validTimestamps.length === 0) {
        this.requests.delete(identifier);
        cleanedCount++;
      } else if (validTimestamps.length < timestamps.length) {
        this.requests.set(identifier, validTimestamps);
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug('Memory rate limiter cleanup', { identifiersRemoved: cleanedCount });
    }
  }

  async checkLimit(identifier: string): Promise<void> {
    const now = Date.now();
    const cutoff = now - this.windowMs;

    // Get or create request history for this identifier
    let timestamps = this.requests.get(identifier) || [];

    // Remove old timestamps
    timestamps = timestamps.filter(ts => ts > cutoff);

    // Check if limit is exceeded
    if (timestamps.length >= this.maxRequests) {
      const oldestRequest = Math.min(...timestamps);
      const resetTime = new Date(oldestRequest + this.windowMs);
      throw new RateLimitExceededError(identifier, resetTime);
    }

    // Add current request
    timestamps.push(now);
    this.requests.set(identifier, timestamps);

    const remaining = this.maxRequests - timestamps.length;
    this.logger.logRateLimit(identifier, remaining, new Date(now + this.windowMs));
  }

  async getRemainingRequests(identifier: string): Promise<number> {
    const now = Date.now();
    const cutoff = now - this.windowMs;

    const timestamps = this.requests.get(identifier) || [];
    const validTimestamps = timestamps.filter(ts => ts > cutoff);

    return Math.max(0, this.maxRequests - validTimestamps.length);
  }

  async resetLimit(identifier: string): Promise<void> {
    this.requests.delete(identifier);
    this.logger.info('Memory rate limit reset', { identifier });
  }
}
