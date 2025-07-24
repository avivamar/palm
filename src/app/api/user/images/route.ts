import type { NextRequest } from 'next/server';
import { desc, eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDB } from '@/libs/DB';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';
import { userImagesSchema, usersSchema } from '@/models/Schema';

export const dynamic = 'force-dynamic';

// GET: 获取用户图片列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
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

    // 获取用户ID (支持email或supabase ID查找)
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

    const dbUserId = userResult[0].id;

    // 获取用户图片列表
    const images = await db
      .select()
      .from(userImagesSchema)
      .where(eq(userImagesSchema.userId, dbUserId))
      .orderBy(desc(userImagesSchema.createdAt));

    return NextResponse.json({
      success: true,
      images: images.map((img: any) => ({
        id: img.id.toString(),
        url: img.url,
        key: img.r2Key,
        fileName: img.fileName,
        fileSize: img.fileSize,
        mimeType: img.mimeType,
        uploadedAt: img.createdAt,
        userId: img.userId.toString(),
        description: img.description,
        tags: img.tags || [],
        aiAnalyzed: img.aiAnalyzed,
        aiDescription: img.aiDescription,
      })),
    });
  } catch (error) {
    console.error('Failed to fetch user images:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch images' },
      { status: 500 },
    );
  }
}

// POST: 保存图片记录到数据库
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, fileSize, mimeType, key, userId } = body;

    // 验证必需字段
    if (!fileName || !fileSize || !mimeType || !key || !userId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
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

    const dbUserId = userResult[0].id;

    // 构建公共URL (基于环境变量)
    const r2Endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    const publicUrl = `${r2Endpoint}/${bucketName}/${key}`;

    // 保存图片记录
    const result = await db
      .insert(userImagesSchema)
      .values({
        userId: dbUserId,
        fileName,
        fileSize,
        mimeType: mimeType as any, // TypeScript enum casting
        url: publicUrl,
        r2Key: key,
      })
      .returning({ id: userImagesSchema.id });

    return NextResponse.json({
      success: true,
      id: result[0].id.toString(),
    });
  } catch (error) {
    console.error('Failed to save image record:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save image record' },
      { status: 500 },
    );
  }
}

// DELETE: 删除图片（软删除或硬删除）
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('imageId');

    if (!imageId) {
      return NextResponse.json(
        { success: false, message: 'Image ID is required' },
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

    const dbUserId = userResult[0].id;

    // 删除图片记录（只能删除自己的图片）
    const deleteResult = await db
      .delete(userImagesSchema)
      .where(
        sql`${userImagesSchema.id} = ${Number.parseInt(imageId)} AND ${userImagesSchema.userId} = ${dbUserId}`,
      )
      .returning({ r2Key: userImagesSchema.r2Key });

    if (deleteResult.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Image not found or access denied' },
        { status: 404 },
      );
    }

    // TODO: 可选择性地从R2删除实际文件
    // 目前只删除数据库记录，保留R2文件以防误删

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete image:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete image' },
      { status: 500 },
    );
  }
}
