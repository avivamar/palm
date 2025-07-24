import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { buildUrl, debugOAuthRedirect } from '@/libs/env-utils';
import { createServerClient } from '@/libs/supabase/config';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  // 🔧 调试OAuth重定向
  const { baseUrl, callbackUrl, dashboardUrl } = debugOAuthRedirect(request);
  console.log('🔗 OAuth回调处理:', { baseUrl, callbackUrl, dashboardUrl });

  // 从 referrer 或 accept-language 头获取 locale
  const referrer = request.headers.get('referer') || '';
  let locale = 'en'; // 默认 locale

  // 尝试从 referrer URL 中提取 locale
  const localeMatch = referrer.match(/\/(zh-HK|en|es|ja)\//);
  if (localeMatch && localeMatch[1]) {
    locale = localeMatch[1];
  } else {
    // 回退到 accept-language 检测
    const acceptLanguage = request.headers.get('accept-language') || '';
    if (acceptLanguage.includes('zh')) {
      locale = 'zh-HK';
    } else if (acceptLanguage.includes('es')) {
      locale = 'es';
    } else if (acceptLanguage.includes('ja')) {
      locale = 'ja';
    }
  }

  if (code) {
    const supabase = await createServerClient();

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data.user) {
        // 🎯 认证成功，异步同步用户到PostgreSQL数据库（不阻塞登录流程）
        const userData = {
          id: data.user.id,
          email: data.user.email!,
          displayName: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0],
          photoURL: data.user.user_metadata?.avatar_url,
          supabaseId: data.user.id,
          authSource: 'supabase',
        };

        // 🚀 使用 Promise.resolve 异步处理用户同步，不阻塞响应
        Promise.resolve().then(async () => {
          try {
            const { syncUserToDatabase } = await import('@/app/actions/userActions');
            const syncResult = await syncUserToDatabase(userData);
            if (syncResult.success) {
              console.log(`Google OAuth user ${data.user.email} synced to PostgreSQL`);
            } else {
              console.error(`Failed to sync Google OAuth user ${data.user.email}:`, syncResult.error);
            }
          } catch (syncError) {
            console.error('Error syncing user after Google OAuth:', syncError);
          }
        });

        // 🚀 立即重定向到 dashboard 页面，不等待数据库同步
        const dashboardUrl = buildUrl(`/${locale}/dashboard`, request);
        console.log('✅ OAuth成功，重定向到:', dashboardUrl);
        return NextResponse.redirect(dashboardUrl);
      }
    } catch (error) {
      console.error('Error exchanging code for session:', error);
    }
  }

  // 认证失败，重定向到登录页面
  const signInUrl = buildUrl(`/${locale}/sign-in?error=auth_callback_error`, request);
  console.log('❌ OAuth失败，重定向到:', signInUrl);
  return NextResponse.redirect(signInUrl);
}
