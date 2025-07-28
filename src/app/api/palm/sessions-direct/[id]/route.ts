/**
 * Direct session API without Supabase dependency
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getSafeDB } from '@/libs/DB';
import { palmAnalysisSessionsSchema } from '@/models/Schema';
import { eq } from 'drizzle-orm';

// 使用 Node.js runtime
export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id);

    if (isNaN(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 400 }
      );
    }

    // 获取分析会话
    const db = await getSafeDB();
    const [analysisSession] = await db
      .select()
      .from(palmAnalysisSessionsSchema)
      .where(eq(palmAnalysisSessionsSchema.id, sessionId))
      .limit(1);

    if (!analysisSession) {
      return NextResponse.json(
        { error: 'Analysis session not found' },
        { status: 404 }
      );
    }

    // 返回分析结果
    return NextResponse.json({
      success: true,
      session: {
        id: analysisSession.id,
        status: analysisSession.status,
        analysisType: analysisSession.analysisType,
        processingTime: analysisSession.processingTime,
        createdAt: analysisSession.createdAt,
        completedAt: analysisSession.completedAt,
        result: analysisSession.analysisResult ? 
          JSON.parse(analysisSession.analysisResult) : null,
        error: analysisSession.errorMessage,
        // 双手支持信息
        leftHandImageUrl: analysisSession.leftHandImageUrl,
        rightHandImageUrl: analysisSession.rightHandImageUrl,
        hasLeftHand: !!analysisSession.leftHandImageUrl,
        hasRightHand: !!analysisSession.rightHandImageUrl,
      },
    });

  } catch (error) {
    console.error('Get analysis result error:', error);
    return NextResponse.json(
      { error: 'Failed to get analysis result' },
      { status: 500 }
    );
  }
}