// src/middleware/security/unified-security.ts

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  addToBlacklist,
  checkGeoLocation,
  isBlacklistedIP,
  isHighRiskCountry,
} from './rate-limiter';
import {
  addAdminSecurityHeaders,
  addApiSecurityHeaders,
  addSecurityHeaders,
} from './security-headers';

// 统一安全配置接口
type UnifiedSecurityConfig = {
  enableRateLimit: boolean;
  enableGeoBlocking: boolean;
  enableSecurityHeaders: boolean;
  enableBlacklist: boolean;
  customRules?: Array<(request: NextRequest) => boolean>;
};

// 默认安全配置
const DEFAULT_CONFIG: UnifiedSecurityConfig = {
  enableRateLimit: true,
  enableGeoBlocking: true,
  enableSecurityHeaders: true,
  enableBlacklist: true,
};

// 安全事件记录
function logSecurityEvent(event: string, details: Record<string, any>): void {
  console.warn(`Security Event: ${event}`, details);
}

// 获取客户端真实 IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  return (
    cfConnectingIP
    || realIP
    || (forwarded ? forwarded.split(',')[0]?.trim() || 'unknown' : null)
    || 'unknown'
  );
}

// 检查请求是否为机器人
function isBotRequest(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  const botPatterns = [
    'bot',
    'crawler',
    'spider',
    'scraper',
    'curl',
    'wget',
    'python',
    'java',
    'go-http-client',
  ];

  return botPatterns.some(pattern => userAgent.includes(pattern));
}

// 检查可疑请求模式
function isSuspiciousRequest(request: NextRequest): boolean {
  const url = request.url;
  const userAgent = request.headers.get('user-agent') || '';

  // 检查常见攻击路径
  const suspiciousPatterns = [
    '/wp-admin',
    '/admin',
    '/.env',
    '/config',
    '/backup',
    '/phpmyadmin',
    '/.git',
    '/api/v1/admin',
    '/api/admin',
  ];

  // 检查 SQL 注入模式
  const sqlInjectionPatterns = [
    'union select',
    'drop table',
    'insert into',
    'delete from',
    'update set',
    'exec(',
    'script>',
  ];

  // 检查 XSS 模式
  const xssPatterns = ['<script', 'javascript:', 'onload=', 'onerror='];

  const hasSuspiciousPath = suspiciousPatterns.some(pattern =>
    url.toLowerCase().includes(pattern),
  );
  const hasSqlInjection = sqlInjectionPatterns.some(pattern =>
    url.toLowerCase().includes(pattern),
  );
  const hasXss = xssPatterns.some(pattern =>
    url.toLowerCase().includes(pattern),
  );
  const hasEmptyUserAgent = !userAgent || userAgent.length < 10;

  return hasSuspiciousPath || hasSqlInjection || hasXss || hasEmptyUserAgent;
}

// 检查请求频率是否异常
function isHighFrequencyRequest(request: NextRequest): boolean {
  // 这里可以实现更复杂的频率检测逻辑
  // 目前简单检查是否有过多的并发请求头
  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',');
    // 如果转发链过长，可能是代理攻击
    return ips.length > 5;
  }
  return false;
}

// 主要的统一安全中间件
export async function unifiedSecurityMiddleware(
  request: NextRequest,
  config: Partial<UnifiedSecurityConfig> = {},
): Promise<NextResponse | null> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || '';
  const url = request.url;

  try {
    // 1. 黑名单检查
    if (finalConfig.enableBlacklist && isBlacklistedIP(clientIP)) {
      logSecurityEvent('IP_BLACKLISTED', {
        ip: clientIP,
        userAgent,
        url,
      });

      return new NextResponse('Access Denied', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain',
          'X-Security-Block': 'IP_BLACKLISTED',
        },
      });
    }

    // 2. 地理位置检查
    if (finalConfig.enableGeoBlocking) {
      const geoResult = await checkGeoLocation(request);
      if (geoResult.blocked) {
        logSecurityEvent('GEO_BLOCKED', {
          ip: clientIP,
          country: geoResult.country,
          reason: geoResult.reason,
          url,
        });

        // 将高风险国家 IP 加入黑名单
        if (isHighRiskCountry(geoResult.country || '')) {
          addToBlacklist(clientIP, 'High risk country');
        }

        return new NextResponse('Access Denied - Geographic Restriction', {
          status: 403,
          headers: {
            'Content-Type': 'text/plain',
            'X-Security-Block': 'GEO_BLOCKED',
            'X-Block-Reason': geoResult.reason || 'Geographic restriction',
          },
        });
      }
    }

    // 3. 机器人检测
    if (isBotRequest(request)) {
      logSecurityEvent('BOT_DETECTED', {
        ip: clientIP,
        userAgent,
        url,
      });

      // 对机器人应用更严格的限制
      return new NextResponse('Bot Access Restricted', {
        status: 429,
        headers: {
          'Content-Type': 'text/plain',
          'X-Security-Block': 'BOT_DETECTED',
          'Retry-After': '3600',
        },
      });
    }

    // 4. 可疑请求检测
    if (isSuspiciousRequest(request)) {
      logSecurityEvent('SUSPICIOUS_REQUEST', {
        ip: clientIP,
        userAgent,
        url,
      });

      // 将发起可疑请求的 IP 加入黑名单
      addToBlacklist(clientIP, 'Suspicious request pattern');

      return new NextResponse('Suspicious Activity Detected', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain',
          'X-Security-Block': 'SUSPICIOUS_REQUEST',
        },
      });
    }

    // 5. 高频请求检测
    if (isHighFrequencyRequest(request)) {
      logSecurityEvent('HIGH_FREQUENCY_REQUEST', {
        ip: clientIP,
        userAgent,
        url,
      });

      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Content-Type': 'text/plain',
          'X-Security-Block': 'HIGH_FREQUENCY',
          'Retry-After': '60',
        },
      });
    }

    // 6. 速率限制检查
    if (finalConfig.enableRateLimit) {
      // 这里应该实现实际的速率限制逻辑
      // 目前作为示例，我们跳过实际的限制检查
      // 可以根据路径选择不同的限制配置：rateLimitConfigs.admin, rateLimitConfigs.auth 等
    }

    // 7. 自定义规则检查
    if (finalConfig.customRules) {
      for (const rule of finalConfig.customRules) {
        if (!rule(request)) {
          logSecurityEvent('CUSTOM_RULE_VIOLATION', {
            ip: clientIP,
            userAgent,
            url,
          });

          return new NextResponse('Access Denied - Custom Rule', {
            status: 403,
            headers: {
              'Content-Type': 'text/plain',
              'X-Security-Block': 'CUSTOM_RULE',
            },
          });
        }
      }
    }

    // 8. 记录正常访问
    logSecurityEvent('ACCESS_ALLOWED', {
      ip: clientIP,
      userAgent,
      url,
    });

    // 如果所有检查都通过，返回 null 表示继续处理请求
    return null;
  } catch (error) {
    // 安全检查出错时，记录错误但不阻止请求
    console.error('Security middleware error:', error);

    logSecurityEvent('SECURITY_CHECK_ERROR', {
      ip: clientIP,
      userAgent,
      url,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    // 出错时不阻止请求，但记录事件
    return null;
  }
}

// 为不同类型的路由应用安全头
export function applySecurityHeaders(
  response: NextResponse,
  routeType: 'api' | 'admin' | 'payment' | 'default' = 'default',
): NextResponse {
  switch (routeType) {
    case 'api':
      return addApiSecurityHeaders(response);
    case 'admin':
      return addAdminSecurityHeaders(response);
    case 'payment':
      // 支付页面需要特殊的安全头
      response.headers.set('X-Payment-Security', 'enabled');
      return addSecurityHeaders(response);
    default:
      return addSecurityHeaders(response);
  }
}

// 创建安全响应的辅助函数
export function createSecurityResponse(
  message: string,
  status: number = 403,
  blockType: string = 'SECURITY_BLOCK',
): NextResponse {
  const response = new NextResponse(message, {
    status,
    headers: {
      'Content-Type': 'text/plain',
      'X-Security-Block': blockType,
    },
  });

  return addSecurityHeaders(response);
}

// 导出配置和工具函数
export { DEFAULT_CONFIG, type UnifiedSecurityConfig };
export { getClientIP, isBotRequest, isSuspiciousRequest };

// 为向后兼容性导出 securityMiddleware 别名
export const securityMiddleware = async (
  request: NextRequest,
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> => {
  const securityResult = await unifiedSecurityMiddleware(request);
  if (securityResult) {
    return securityResult;
  }
  return handler();
};
