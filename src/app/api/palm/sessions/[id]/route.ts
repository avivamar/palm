/**
 * Palm AI 分析会话详情 API
 * 获取特定会话的详细信息和结果
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createServerClient } from '@/libs/supabase/config';
import { getSafeDB } from '@/libs/DB';
import { palmAnalysisSessionsSchema, userImagesSchema } from '@/models/Schema';
import { eq } from 'drizzle-orm';

// 使用 Node.js runtime 以支持 Supabase
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 验证用户认证
    const supabase = await createServerClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = session.user;
    const sessionId = params.id;

    // 2. 获取分析会话详情
    const db = await getSafeDB();
    const [analysisSession] = await db
      .select({
        // 分析会话信息
        id: palmAnalysisSessionsSchema.id,
        userId: palmAnalysisSessionsSchema.userId,
        status: palmAnalysisSessionsSchema.status,
        handType: palmAnalysisSessionsSchema.handType,
        analysisType: palmAnalysisSessionsSchema.analysisType,
        birthDate: palmAnalysisSessionsSchema.birthDate,
        birthTime: palmAnalysisSessionsSchema.birthTime,
        birthLocation: palmAnalysisSessionsSchema.birthLocation,
        analysisResult: palmAnalysisSessionsSchema.analysisResult,
        processingTime: palmAnalysisSessionsSchema.processingTime,
        errorMessage: palmAnalysisSessionsSchema.errorMessage,
        createdAt: palmAnalysisSessionsSchema.createdAt,
        completedAt: palmAnalysisSessionsSchema.completedAt,
        updatedAt: palmAnalysisSessionsSchema.updatedAt,
        
        // 图像信息
        imageUrl: userImagesSchema.url,
        imageFilename: userImagesSchema.filename,
        imageSize: userImagesSchema.fileSize,
        imageMimeType: userImagesSchema.mimeType,
        imageUploadedAt: userImagesSchema.uploadedAt,
      })
      .from(palmAnalysisSessionsSchema)
      .leftJoin(
        userImagesSchema,
        eq(palmAnalysisSessionsSchema.imageId, userImagesSchema.id)
      )
      .where(eq(palmAnalysisSessionsSchema.id, parseInt(sessionId)))
      .limit(1);

    if (!analysisSession) {
      return NextResponse.json(
        { error: 'Analysis session not found' },
        { status: 404 }
      );
    }

    // 3. 验证会话归属
    if (analysisSession.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to analysis session' },
        { status: 403 }
      );
    }

    // 4. 解析分析结果
    let parsedResult = null;
    if (analysisSession.analysisResult) {
      try {
        parsedResult = JSON.parse(analysisSession.analysisResult);
      } catch (parseError) {
        console.error('Failed to parse analysis result:', parseError);
      }
    }

    // 5. 构建响应数据
    const response = {
      success: true,
      session: {
        id: analysisSession.id,
        status: analysisSession.status,
        handType: analysisSession.handType,
        analysisType: analysisSession.analysisType,
        
        // 用户输入信息
        userInfo: {
          birthDate: analysisSession.birthDate,
          birthTime: analysisSession.birthTime,
          birthLocation: analysisSession.birthLocation,
        },
        
        // 图像信息
        image: analysisSession.imageUrl ? {
          url: analysisSession.imageUrl,
          filename: analysisSession.imageFilename,
          size: analysisSession.imageSize,
          mimeType: analysisSession.imageMimeType,
          uploadedAt: analysisSession.imageUploadedAt,
        } : null,
        
        // 分析结果
        result: parsedResult,
        
        // 处理信息
        processingTime: analysisSession.processingTime,
        errorMessage: analysisSession.errorMessage,
        
        // 时间戳
        createdAt: analysisSession.createdAt,
        completedAt: analysisSession.completedAt,
        updatedAt: analysisSession.updatedAt,
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Get session details error:', error);
    return NextResponse.json(
      { error: 'Failed to get session details' },
      { status: 500 }
    );
  }
}

// 更新分析会话
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 验证用户认证
    const supabase = await createServerClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = session.user;
    const sessionId = params.id;

    // 2. 解析请求数据
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    // 3. 获取分析会话
    const db = await getSafeDB();
    const [analysisSession] = await db
      .select()
      .from(palmAnalysisSessionsSchema)
      .where(eq(palmAnalysisSessionsSchema.id, parseInt(sessionId)))
      .limit(1);

    if (!analysisSession) {
      return NextResponse.json(
        { error: 'Analysis session not found' },
        { status: 404 }
      );
    }

    // 4. 验证会话归属
    if (analysisSession.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to analysis session' },
        { status: 403 }
      );
    }

    // 5. 处理不同的操作
    switch (action) {
      case 'cancel':
        // 取消分析
        if (analysisSession.status !== 'pending' && analysisSession.status !== 'processing') {
          return NextResponse.json(
            { error: 'Cannot cancel analysis in current status' },
            { status: 400 }
          );
        }

        await db
          .update(palmAnalysisSessionsSchema)
          .set({
            status: 'cancelled',
            errorMessage: 'Cancelled by user',
            updatedAt: new Date(),
          })
          .where(eq(palmAnalysisSessionsSchema.id, parseInt(sessionId)));

        return NextResponse.json({
          success: true,
          message: 'Analysis cancelled successfully',
        });

      case 'retry':
        // 重试分析
        if (analysisSession.status !== 'failed') {
          return NextResponse.json(
            { error: 'Can only retry failed analyses' },
            { status: 400 }
          );
        }

        await db
          .update(palmAnalysisSessionsSchema)
          .set({
            status: 'pending',
            errorMessage: null,
            analysisResult: null,
            processingTime: null,
            completedAt: null,
            updatedAt: new Date(),
          })
          .where(eq(palmAnalysisSessionsSchema.id, parseInt(sessionId)));

        return NextResponse.json({
          success: true,
          message: 'Analysis reset for retry',
        });

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Update session error:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

// 删除分析会话
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. 验证用户认证
    const supabase = await createServerClient();
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = session.user;
    const sessionId = params.id;

    // 2. 获取分析会话
    const db = await getSafeDB();
    const [analysisSession] = await db
      .select()
      .from(palmAnalysisSessionsSchema)
      .where(eq(palmAnalysisSessionsSchema.id, parseInt(sessionId)))
      .limit(1);

    if (!analysisSession) {
      return NextResponse.json(
        { error: 'Analysis session not found' },
        { status: 404 }
      );
    }

    // 3. 验证会话归属
    if (analysisSession.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to analysis session' },
        { status: 403 }
      );
    }

    // 4. 删除会话（软删除，只更新状态）
    await db
      .update(palmAnalysisSessionsSchema)
      .set({
        status: 'deleted',
        updatedAt: new Date(),
      })
      .where(eq(palmAnalysisSessionsSchema.id, parseInt(sessionId)));

    return NextResponse.json({
      success: true,
      message: 'Analysis session deleted successfully',
    });

  } catch (error) {
    console.error('Delete session error:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}