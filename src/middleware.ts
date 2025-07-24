import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { checkAdminAccess, createAdminAccessDeniedResponse } from '@/libs/admin-access-control';
import { RATE_LIMIT_CONFIGS, rateLimiter } from '@/libs/rate-limiter';
import { createServerClient } from '@/libs/supabase/config';
import { routing } from './libs/i18nRouting';

const intlMiddleware = createMiddleware(routing);

const protectedRoutes = ['/dashboard', '/admin'];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for static files to prevent i18n routing from breaking them.
  const staticFileRegex = /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|webmanifest|xml|txt|json)$/i;
  if (staticFileRegex.test(pathname)) {
    return NextResponse.next();
  }

  // 🔒 Admin访问控制 - 最高优先级检查
  // 排除调试 API，允许其始终可访问以进行故障排除
  if (pathname.includes('/admin') && !pathname.includes('/api/debug/')) {
    const accessCheck = checkAdminAccess(req);
    if (!accessCheck.allowed) {
      console.warn(`🚫 Admin access blocked: ${accessCheck.reason} - IP: ${req.headers.get('x-forwarded-for') || 'unknown'}`);
      return createAdminAccessDeniedResponse(accessCheck.reason, accessCheck.config);
    }
    console.log(`✅ Admin access granted - IP: ${req.headers.get('x-forwarded-for') || 'unknown'}`);
  }

  // Apply rate limiting based on path
  let rateLimitResponse: NextResponse | null = null;
  if (pathname.startsWith('/api/admin')) {
    // Strict rate limiting for admin APIs
    rateLimitResponse = await rateLimiter.middleware(RATE_LIMIT_CONFIGS.ADMIN_API)(req);
  } else if (pathname.startsWith('/api/auth')) {
    // Strict rate limiting for auth APIs
    rateLimitResponse = await rateLimiter.middleware(RATE_LIMIT_CONFIGS.AUTH_API)(req);
  } else if (pathname.startsWith('/api/')) {
    // General rate limiting for other APIs
    rateLimitResponse = await rateLimiter.middleware(RATE_LIMIT_CONFIGS.API_GENERAL)(req);
  }
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Extract locale from the path
  const segments = pathname.split('/').filter(Boolean);
  let locale = routing.defaultLocale;
  let actualPath = pathname;

  // Check if first segment is a valid locale
  if (segments.length > 0 && segments[0] && routing.locales.includes(segments[0] as any)) {
    locale = segments[0];
    actualPath = `/${segments.slice(1).join('/')}`;
  } else {
    // If no locale in path, detect preferred locale from headers
    const acceptLanguage = req.headers.get('accept-language') || '';
    if (acceptLanguage.includes('zh')) {
      locale = 'zh-HK';
    } else if (acceptLanguage.includes('es')) {
      locale = 'es';
    } else if (acceptLanguage.includes('ja')) {
      locale = 'ja';
    }

    // If accessing dashboard without locale, redirect to localized version
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
      const redirectUrl = new URL(`/${locale}${pathname}`, req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Optional: Handle referral tracking
  const response = intlMiddleware(req as any);

  // Check for referral parameter and set cookie
  const url = new URL(req.url);
  const ref = url.searchParams.get('ref');
  if (ref) {
    try {
      // Dynamic import to handle optional referral package
      const { ReferralTracker } = await import('@rolitt/referral/tracking');

      if (ReferralTracker.shouldTrack(req)) {
        const cookieHeader = await ReferralTracker.trackClick(ref, {
          ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown',
          referer: req.headers.get('referer') || '',
          timestamp: new Date(),
        });

        if (cookieHeader && response) {
          response.headers.set('Set-Cookie', cookieHeader);
        }
      }
    } catch (error) {
      // Gracefully handle if referral package is not available
      console.log('Referral tracking not available in middleware:', error);
    }
  }

  // Check if the path is protected
  const isProtectedRoute = protectedRoutes.some(route =>
    actualPath.startsWith(route),
  );

  if (isProtectedRoute) {
    // 使用 Supabase 验证用户会话
    try {
      const supabase = await createServerClient();

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        const absoluteUrl = new URL(`/${locale}/sign-in`, req.url);
        absoluteUrl.searchParams.set('redirect_url', pathname);
        return NextResponse.redirect(absoluteUrl);
      }

      // Admin权限检查在layout中处理，middleware只检查认证状态

      return response;
    } catch (error) {
      console.error('Middleware authentication error:', error);
      // 如果验证过程出错，重定向到登录页面
      const absoluteUrl = new URL(`/${locale}/sign-in`, req.url);
      absoluteUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(absoluteUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except for:
    // - api routes
    // - _next (Next.js internals)
    // - static files (favicon, robots.txt, sitemap.xml, etc.)
    '/((?!api|_next/static|_next/image|assets|favicon.ico|robots.txt|sitemap.xml|sw.js).*)',
    // Specifically include the root path
    '/',
  ],
  runtime: 'experimental-edge',
};
