import type { NextRequest } from 'next/server';
import { generateUploadUrl, validateFileName } from '@rolitt/image-upload';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDB } from '@/libs/DB';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';
import { usersSchema } from '@/models/Schema';

export const dynamic = 'force-dynamic';

// POST: 生成图片上传的预签名URL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, contentType } = body;

    // 验证必需字段
    if (!fileName || !contentType) {
      return NextResponse.json(
        { success: false, message: 'fileName and contentType are required' },
        { status: 400 },
      );
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        {
          success: false,
          message: `Unsupported file type: ${contentType}. Only JPEG, PNG, WebP, and GIF images are allowed.`,
        },
        { status: 400 },
      );
    }

    // 验证文件名安全性
    if (!validateFileName(fileName)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file name. Please use a different name.' },
        { status: 400 },
      );
    }

    // 验证用户认证
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, message: 'Authentication not configured' },
        { status: 500 },
      );
    }

    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const db = await getDB();

    // 获取用户ID
    const userResult = await db
      .select({ id: usersSchema.id })
      .from(usersSchema)
      .where(
        sql`${usersSchema.email} = ${session.user.email} OR ${usersSchema.supabaseId} = ${session.user.id}`,
      )
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 },
      );
    }

    const userId = userResult[0].id.toString();

    // 生成预签名URL
    const presignedData = await generateUploadUrl(fileName, contentType, userId);

    return NextResponse.json({
      success: true,
      data: presignedData,
    });
  } catch (error) {
    console.error('Failed to generate upload URL:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate upload URL',
      },
      { status: 500 },
    );
  }
}
