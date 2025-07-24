import { NextResponse } from 'next/server';
import { createServerClient } from '@/libs/supabase/config';

export async function GET() {
  console.log('Session API called at:', new Date().toISOString());

  try {
    // 检查 Supabase 配置
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration missing:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
      });
      return NextResponse.json({
        isAuthenticated: false,
        error: 'Authentication service not configured',
      }, { status: 503 });
    }

    console.log('Creating Supabase client...');
    // 使用 Supabase 验证用户会话
    const supabase = await createServerClient();

    console.log('Getting session...');
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Supabase session error:', error);
      return NextResponse.json({
        isAuthenticated: false,
        error: error.message,
      }, { status: 401 });
    }

    if (!session) {
      console.log('No active session found');
      return NextResponse.json({
        isAuthenticated: false,
        error: 'No valid session',
      }, { status: 401 });
    }

    console.log('Session found for user:', session.user.id);
    // Supabase 用户默认已验证邮箱（通过邮箱确认流程）
    const isVerified = session.user.email_confirmed_at !== null;

    return NextResponse.json({
      isAuthenticated: true,
      isVerified,
      uid: session.user.id,
      email: session.user.email,
      authSource: 'supabase',
    });
  } catch (error) {
    console.error('Session verification failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      isAuthenticated: false,
      error: 'Session verification failed',
    }, { status: 500 });
  }
}
