/**
 * API 速率限制中间件
 * 使用内存存储的简单实现，生产环境建议使用 Redis
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

type RateLimitConfig = {
  windowMs: number; // 时间窗口（毫秒）
  maxRequests: number; // 最大请求数
  message?: string; // 超限提示信息
  skipSuccessfulRequests?: boolean; // 是否跳过成功请求
  skipFailedRequests?: boolean; // 是否跳过失败请求
};

// 存储请求记录
const requestStore = new Map<string, { count: number; resetTime: number }>();

// 清理过期记录
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestStore.entries()) {
    if (value.resetTime < now) {
      requestStore.delete(key);
    }
  }
}, 60000); // 每分钟清理一次

/**
 * 获取客户端标识符
 */
function getClientIdentifier(request: NextRequest): string {
  // 尝试获取真实IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  return cfConnectingIP
    || realIP
    || (forwarded ? forwarded.split(',')[0]?.trim() || 'unknown' : 'unknown')
    || 'unknown';
}

/**
 * 速率限制中间件工厂函数
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = config;

  return async function rateLimiter(
    request: NextRequest,
    handler: () => Promise<NextResponse>,
  ): Promise<NextResponse> {
    const identifier = getClientIdentifier(request);
    const now = Date.now();
    const resetTime = now + windowMs;

    // 获取或创建请求记录
    let record = requestStore.get(identifier);

    if (!record || record.resetTime < now) {
      // 创建新记录或重置过期记录
      record = { count: 1, resetTime };
      requestStore.set(identifier, record);
    } else {
      // 增加计数
      record.count++;
    }

    // 检查是否超限
    if (record.count > maxRequests) {
      // 记录超限事件
      console.warn(`Rate limit exceeded for ${identifier}`, {
        count: record.count,
        maxRequests,
        endpoint: request.url,
        method: request.method,
      });

      // 返回限流响应
      return new NextResponse(
        JSON.stringify({
          error: message,
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
            'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString(),
          },
        },
      );
    }

    // 执行原始处理器
    const response = await handler();

    // 根据配置决定是否计入限制
    if (
      (skipSuccessfulRequests && response.status < 400)
      || (skipFailedRequests && response.status >= 400)
    ) {
      // 回滚计数
      record.count--;
    }

    // 添加速率限制头部
    response.headers.set('X-RateLimit-Limit', maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count).toString());
    response.headers.set('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

    return response;
  };
}

// 预定义的速率限制配置
export const rateLimitConfigs = {
  // 严格限制（登录、注册等敏感操作）
  strict: {
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 5, // 5个请求
    message: 'Too many attempts, please try again later.',
  },

  // 中等限制（API调用）
  moderate: {
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 50, // 50个请求
    message: 'Rate limit exceeded, please slow down.',
  },

  // 宽松限制（公开API）
  lenient: {
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 200, // 200个请求
    message: 'Rate limit exceeded.',
  },
};

/**
 * IP 黑名单检查
 */
const blacklistedIPs = new Set<string>([
  // 在这里添加已知的恶意 IP
]);

export function isBlacklistedIP(ip: string): boolean {
  return blacklistedIPs.has(ip);
}

/**
 * 添加 IP 到黑名单
 */
export function addToBlacklist(ip: string, reason?: string): void {
  blacklistedIPs.add(ip);
  console.warn(`IP ${ip} added to blacklist${reason ? ` - Reason: ${reason}` : ''}`);
}

/**
 * 地理位置检查（使用 Vercel 提供的地理信息）
 */
export async function checkGeoLocation(request: NextRequest): Promise<{
  country?: string;
  city?: string;
  region?: string;
  blocked: boolean;
  reason?: string;
}> {
  const country = request.headers.get('x-vercel-ip-country') || undefined;
  const city = request.headers.get('x-vercel-ip-city') || undefined;
  const region = request.headers.get('x-vercel-ip-region') || undefined;

  // 检查是否为高风险国家
  const isHighRisk = country && isHighRiskCountry(country);

  return {
    country,
    city,
    region,
    blocked: Boolean(isHighRisk),
    reason: isHighRisk ? `High risk country: ${country}` : undefined,
  };
}

/**
 * 高风险国家检查
 */
const highRiskCountries = new Set(['XX', 'YY']); // 替换为实际的高风险国家代码

export function isHighRiskCountry(countryCode: string | undefined): boolean {
  return countryCode ? highRiskCountries.has(countryCode) : false;
}
