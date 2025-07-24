/**
 * 安全响应头中间件
 * 添加各种安全头部以防止常见攻击
 */

import type { NextResponse } from 'next/server';

/**
 * 内容安全策略配置
 */
function generateCSP(isDevelopment = false): string {
  const baseCSP = [
    'default-src \'self\'',
    'script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' *.vercel.app *.googleapis.com *.gstatic.com *.google.com *.stripe.com *.supabase.co *.posthog.com *.clarity.ms',
    'style-src \'self\' \'unsafe-inline\' *.googleapis.com *.gstatic.com',
    'img-src \'self\' data: blob: *.vercel.app *.supabase.co *.stripe.com *.google.com *.googleapis.com *.gstatic.com *.clarity.ms',
    'font-src \'self\' *.googleapis.com *.gstatic.com',
    'connect-src \'self\' *.vercel.app *.supabase.co *.stripe.com *.posthog.com *.clarity.ms wss:',
    'frame-src \'self\' *.stripe.com *.google.com',
    'object-src \'none\'',
    'base-uri \'self\'',
    'form-action \'self\'',
    'frame-ancestors \'none\'',
    'upgrade-insecure-requests',
  ];

  // 开发环境允许更宽松的策略
  if (isDevelopment) {
    baseCSP.push('script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' *');
    baseCSP.push('connect-src \'self\' *');
  }

  return baseCSP.join('; ');
}

/**
 * 权限策略配置
 */
function generatePermissionsPolicy(): string {
  return [
    'accelerometer=()',
    'camera=()',
    'geolocation=()',
    'gyroscope=()',
    'magnetometer=()',
    'microphone=()',
    'payment=(self)',
    'usb=()',
  ].join(', ');
}

/**
 * 添加安全头部到响应
 */
export function addSecurityHeaders(response: NextResponse, isDevelopment = false): NextResponse {
  // 防止 MIME 类型嗅探
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // 防止页面被嵌入到 iframe 中
  response.headers.set('X-Frame-Options', 'DENY');

  // XSS 防护（现代浏览器已内置，但保留兼容性）
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // HTTPS 强制（HSTS）
  if (!isDevelopment) {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload',
    );
  }

  // 内容安全策略
  response.headers.set('Content-Security-Policy', generateCSP(isDevelopment));

  // 引用策略
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 权限策略
  response.headers.set('Permissions-Policy', generatePermissionsPolicy());

  // 防止缓存敏感内容
  if (response.headers.get('content-type')?.includes('application/json')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  // 移除服务器信息泄露
  response.headers.delete('x-powered-by');
  response.headers.delete('server');

  // 添加自定义安全头部
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, nosnippet, noarchive');

  return response;
}

/**
 * API 特定的安全头部
 */
export function addApiSecurityHeaders(response: NextResponse): NextResponse {
  // API 响应不应被缓存
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  // CORS 安全配置
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || 'https://www.rolitt.com');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Requested-With');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24小时

  // API 版本信息（可选）
  response.headers.set('X-API-Version', '1.0');

  // 防止 DNS 预取
  response.headers.set('X-DNS-Prefetch-Control', 'off');

  return response;
}

/**
 * 管理员 API 的额外安全头部
 */
export function addAdminSecurityHeaders(response: NextResponse): NextResponse {
  // 更严格的缓存控制
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

  // 管理员操作审计头部
  response.headers.set('X-Admin-Action', 'true');
  response.headers.set('X-Audit-Required', 'true');

  // 更严格的 CSP
  response.headers.set(
    'Content-Security-Policy',
    'default-src \'self\'; script-src \'self\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data:; connect-src \'self\'',
  );

  return response;
}

/**
 * 支付 API 的安全头部
 */
export function addPaymentSecurityHeaders(response: NextResponse): NextResponse {
  // PCI DSS 合规要求
  response.headers.set('X-PCI-Compliant', 'true');

  // 严格的缓存控制
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private, max-age=0');
  response.headers.set('Pragma', 'no-cache');

  // 支付相关的 CSP
  response.headers.set(
    'Content-Security-Policy',
    'default-src \'self\'; script-src \'self\' *.stripe.com; frame-src \'self\' *.stripe.com; connect-src \'self\' *.stripe.com',
  );

  // 防止支付信息泄露
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, nosnippet, noarchive, noimageindex');

  return response;
}

/**
 * 根据环境变量检测是否为开发环境
 */
export function isDevelopmentEnvironment(): boolean {
  return (
    process.env.NODE_ENV === 'development'
    || process.env.VERCEL_ENV === 'development'
    || Boolean(process.env.NEXT_PUBLIC_APP_URL?.includes('localhost'))
  );
}
