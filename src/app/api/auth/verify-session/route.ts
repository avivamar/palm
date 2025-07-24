import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getUserRole, getUserRoleByEmail } from '@/app/actions/userActions';
import { createServerClient } from '@/libs/supabase/config';
import { securityMiddleware } from '@/middleware/security/unified-security';

export async function POST(request: NextRequest) {
  return securityMiddleware(request, async () => {
    try {
      // 从请求中获取认证信息
      const body = await request.json().catch(() => ({}));

      // 优先使用 Supabase 服务端客户端进行验证
      const supabase = await createServerClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
      // 如果 Supabase 验证失败，尝试使用传入的用户信息
        if (body.userId && body.email) {
        // 基于传入的用户信息获取角色
          const roleResult = await getUserRole(body.userId);

          return NextResponse.json({
            isAuthenticated: true,
            uid: body.userId,
            email: body.email,
            role: roleResult.success ? roleResult.role : 'customer',
            isAdmin: roleResult.success ? roleResult.role === 'admin' : false,
          }, { status: 200 });
        }

        return NextResponse.json({
          isAuthenticated: false,
          error: 'No valid session found',
        }, { status: 401 });
      }

      // Session is valid, get user role
      const userId = session.user.id;
      const email = session.user.email;

      // 首先尝试根据用户ID获取角色
      let roleResult = await getUserRole(userId);

      // 如果根据用户ID找不到，尝试根据邮箱查找
      if (!roleResult.success && email) {
        console.log(`Fallback to email lookup for user: ${email}`);
        roleResult = await getUserRoleByEmail(email);
      }

      return NextResponse.json({
        isAuthenticated: true,
        uid: userId,
        email,
        role: roleResult.success ? roleResult.role : 'customer',
        isAdmin: roleResult.success ? roleResult.role === 'admin' : false,
        authSource: 'supabase',
      }, { status: 200 });
    } catch (error) {
      console.error('Session verification failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json({
        isAuthenticated: false,
        error: 'Session verification failed',
      }, { status: 401 });
    }
  });
}
