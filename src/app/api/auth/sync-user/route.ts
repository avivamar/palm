import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { syncUserToDatabase } from '@/app/actions/userActions';
import { createServerClient } from '@/libs/supabase/config';
import { securityMiddleware } from '@/middleware/security/unified-security';

/**
 * 专用于用户同步的 API 端点
 * 这个端点可以被前端异步调用，避免阻塞登录流程
 */
export async function POST(request: NextRequest) {
  return securityMiddleware(request, async () => {
    try {
      const supabase = await createServerClient();

      // 验证用户身份
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 },
        );
      }

      // 同步用户数据
      const userData = {
        id: user.id,
        email: user.email!,
        displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
        photoURL: user.user_metadata?.avatar_url,
        supabaseId: user.id,
        authSource: 'supabase',
      };

      const syncResult = await syncUserToDatabase(userData);

      if (syncResult.success) {
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json(
          { success: false, error: syncResult.error },
          { status: 500 },
        );
      }
    } catch (error) {
      console.error('User sync API error:', error);
      return NextResponse.json(
        { success: false, error: 'Internal server error' },
        { status: 500 },
      );
    }
  });
}
