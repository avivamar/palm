/**
 * 标准OAuth回调路由 - 兼容Supabase默认路径
 * 重定向到我们的API处理器
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  // 获取所有查询参数
  const searchParams = url.searchParams;

  // 构建API回调URL，保持所有参数
  const apiCallbackUrl = new URL('/api/auth/callback', url.origin);

  // 转发所有查询参数
  searchParams.forEach((value, key) => {
    apiCallbackUrl.searchParams.set(key, value);
  });

  console.log('🔄 标准OAuth回调重定向:', {
    from: url.pathname + url.search,
    to: apiCallbackUrl.pathname + apiCallbackUrl.search,
  });

  // 重定向到我们的API处理器
  return NextResponse.redirect(apiCallbackUrl);
}
