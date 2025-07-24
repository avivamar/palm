import { NextResponse } from 'next/server';
import { createServerClient } from '@/libs/supabase/config';

export async function POST() {
  try {
    // 使用 Supabase 进行登出
    const supabase = await createServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Supabase logout failed:', {
        error: error.message,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        { error: 'Failed to logout', details: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 },
    );
  }
}
