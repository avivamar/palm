import { NextResponse } from 'next/server';

// 这个API路由之前用于创建Firebase会话，现在已经迁移到Supabase
// 保留以保持向后兼容性，但返回不支持的错误

export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint is no longer supported. Please use Supabase authentication.' },
    { status: 410 }, // 410 Gone - 资源已经被永久移除
  );
}
