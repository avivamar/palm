/**
 * Palm AI 实际分析执行 API
 * 处理图像分析并生成报告
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/libs/supabase/config';
import { getSafeDB } from '@/libs/DB';
import { palmAnalysisSessionsSchema } from '@/models/Schema';
import { eq } from 'drizzle-orm';

// 使用 Node.js runtime 以支持 Supabase
export const runtime = 'nodejs';

// 临时移除 palm 包导入，直接定义类型
interface UserInfo {
  birthDate?: Date;
  birthTime?: string;
  location?: string;
  gender?: string;
  language?: string;
}

// 模拟 createPalmEngine 函数
function createPalmEngine() {
  return {
    async analyzeQuick(_imageData: any, _userInfo: any, _userId: any) {
      // 模拟分析结果
      return {
        report: {
          personality: { summary: "Mock personality analysis", traits: [], strengths: [], challenges: [] },
          health: { summary: "Mock health analysis", vitality: 0.8 },
          career: { summary: "Mock career analysis", potential: [] },
          relationship: { summary: "Mock relationship analysis", compatibility: [] },
          fortune: { summary: "Mock fortune analysis", trends: [] }
        },
        conversionHints: [],
        processingTime: 1000
      };
    },
    async analyzeComplete(imageData: any, userInfo: any, userId: any) {
      return this.analyzeQuick(imageData, userInfo, userId);
    }
  };
}

interface ImageData {
  buffer: Buffer;
  mimeType: string;
  size: number;
  width: number;
  height: number;
}

// Request validation schema
const AnalysisRequestSchema = z.object({
  sessionId: z.string(),
  analysisType: z.enum(['quick', 'complete']).default('quick'),
});

export async function POST(request: NextRequest) {
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

    // 2. 解析请求数据
    const body = await request.json();
    const validatedData = AnalysisRequestSchema.parse(body);

    // 3. 获取分析会话
    const db = await getSafeDB();
    const [analysisSession] = await db
      .select()
      .from(palmAnalysisSessionsSchema)
      .where(eq(palmAnalysisSessionsSchema.id, parseInt(validatedData.sessionId)))
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

    // 5. 检查会话状态
    if (analysisSession.status === 'completed') {
      return NextResponse.json(
        { error: 'Analysis already completed' },
        { status: 400 }
      );
    }

    if (analysisSession.status === 'processing') {
      return NextResponse.json(
        { error: 'Analysis already in progress' },
        { status: 400 }
      );
    }

    // 6. 更新状态为处理中
    await db
      .update(palmAnalysisSessionsSchema)
      .set({
        status: 'processing',
        updatedAt: new Date(),
      })
      .where(eq(palmAnalysisSessionsSchema.id, parseInt(validatedData.sessionId)));

    // 7. 准备分析数据
    const userInfo: UserInfo = {
      birthDate: analysisSession.birthDate || new Date(),
      birthTime: analysisSession.birthTime || undefined,
      gender: 'other', // 默认值，实际项目中从用户资料获取
      location: analysisSession.birthLocation || undefined,
      language: 'en', // 默认值，实际项目中从用户偏好获取
    };

    // 8. 获取图像数据（模拟，实际项目中从图像存储获取）
    const imageData: ImageData = {
      buffer: Buffer.alloc(1000), // 模拟图像数据
      mimeType: 'image/jpeg',
      size: 1000,
      width: 300,
      height: 300,
    };

    // 9. 创建 Palm 引擎并执行分析
    const palmEngine = createPalmEngine();
    
    let analysisResult;
    const startTime = Date.now();

    try {
      if (validatedData.analysisType === 'quick') {
        // 快速分析
        analysisResult = await palmEngine.analyzeQuick(
          imageData,
          userInfo,
          user.id
        );
      } else {
        // 完整分析 - 需要先进行快速分析
        const quickResult = await palmEngine.analyzeQuick(
          imageData,
          userInfo,
          user.id
        );
        
        const fullReport = await palmEngine.analyzeComplete(
          quickResult.report,
          userInfo,
          user.id
        );
        
        analysisResult = {
          report: fullReport,
          conversionHints: quickResult.conversionHints
        };
      }

      const processingTime = Date.now() - startTime;

      // 10. 保存分析结果到数据库
      await db
        .update(palmAnalysisSessionsSchema)
        .set({
          status: 'completed',
          analysisResult: JSON.stringify(analysisResult),
          processingTime,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(palmAnalysisSessionsSchema.id, parseInt(validatedData.sessionId)));

      // 11. 返回分析结果
      return NextResponse.json({
        success: true,
        sessionId: validatedData.sessionId,
        analysisType: validatedData.analysisType,
        processingTime,
        result: analysisResult,
        message: 'Analysis completed successfully',
      });

    } catch (analysisError) {
      // 分析失败，更新状态
      await db
        .update(palmAnalysisSessionsSchema)
        .set({
          status: 'failed',
          errorMessage: analysisError instanceof Error ? analysisError.message : 'Unknown analysis error',
          updatedAt: new Date(),
        })
        .where(eq(palmAnalysisSessionsSchema.id, parseInt(validatedData.sessionId)));

      throw analysisError;
    }

  } catch (error) {
    console.error('Palm analysis error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Analysis failed', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// 获取分析结果
export async function GET(request: NextRequest) {
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

    // 2. 获取查询参数
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
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

    // 5. 返回分析结果
    return NextResponse.json({
      success: true,
      session: {
        id: analysisSession.id,
        status: analysisSession.status,
        analysisType: analysisSession.analysisType,
        handType: analysisSession.handType,
        processingTime: analysisSession.processingTime,
        createdAt: analysisSession.createdAt,
        completedAt: analysisSession.completedAt,
        result: analysisSession.analysisResult ? 
          JSON.parse(analysisSession.analysisResult) : null,
        error: analysisSession.errorMessage,
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