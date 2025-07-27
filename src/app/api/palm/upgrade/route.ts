/**
 * Palm AI 升级支付 API
 * 处理从快速分析升级到完整分析的支付流程
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/libs/supabase/config';
import { getSafeDB } from '@/libs/DB';
import { palmAnalysisSessionsSchema } from '@/models/Schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

// 使用 Node.js runtime 以支持 Supabase
export const runtime = 'nodejs';

// Request validation schema
const UpgradeRequestSchema = z.object({
  sessionId: z.string(),
  upgradeType: z.enum(['complete_analysis']),
  currentAnalysisType: z.enum(['quick', 'complete']),
});

// 创建升级支付会话
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
    const validatedData = UpgradeRequestSchema.parse(body);

    // 3. 验证当前分析类型
    if (validatedData.currentAnalysisType !== 'quick') {
      return NextResponse.json(
        { error: 'Only quick analysis can be upgraded' },
        { status: 400 }
      );
    }

    // 4. 获取分析会话
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

    // 5. 验证会话归属
    if (analysisSession.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to analysis session' },
        { status: 403 }
      );
    }

    // 6. 检查分析状态
    if (analysisSession.status !== 'completed') {
      return NextResponse.json(
        { error: 'Analysis must be completed before upgrade' },
        { status: 400 }
      );
    }

    // 7. 检查是否已经是完整分析
    if (analysisSession.analysisType === 'complete') {
      return NextResponse.json(
        { error: 'Session is already a complete analysis' },
        { status: 400 }
      );
    }

    // 8. 创建支付会话
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-06-30.basil',
    });

    const stripeSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Palm Reading - Complete Analysis Upgrade',
            description: `Upgrade your palm reading from quick to complete analysis`,
          },
          unit_amount: 1990, // $19.90 in cents
        },
        quantity: 1,
      }],
      customer_email: user.email || '',
      metadata: {
        type: 'palm_upgrade',
        sessionId: validatedData.sessionId,
        userId: user.id,
        upgradeType: validatedData.upgradeType,
        originalAnalysisType: validatedData.currentAnalysisType,
      },
      success_url: `${request.nextUrl.origin}/palm/results/${validatedData.sessionId}?upgraded=true`,
      cancel_url: `${request.nextUrl.origin}/palm/results/${validatedData.sessionId}?upgrade_cancelled=true`,
    });

    if (!stripeSession.url) {
      throw new Error('Failed to create payment session');
    }

    // 9. 记录升级意图（可选 - 用于分析）
    await db
      .update(palmAnalysisSessionsSchema)
      .set({
        metadata: JSON.stringify({
          ...JSON.parse(analysisSession.metadata || '{}'),
          upgradeInitiated: new Date().toISOString(),
          stripeSessionId: stripeSession.id,
        }),
      })
      .where(eq(palmAnalysisSessionsSchema.id, parseInt(validatedData.sessionId)));

    return NextResponse.json({
      success: true,
      paymentUrl: stripeSession.url,
      sessionId: stripeSession.id,
      message: 'Payment session created successfully',
    });

  } catch (error) {
    console.error('Upgrade payment error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create upgrade payment session' },
      { status: 500 }
    );
  }
}

// 获取升级状态
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
      .select({
        id: palmAnalysisSessionsSchema.id,
        userId: palmAnalysisSessionsSchema.userId,
        analysisType: palmAnalysisSessionsSchema.analysisType,
        status: palmAnalysisSessionsSchema.status,
        metadata: palmAnalysisSessionsSchema.metadata,
      })
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

    // 5. 解析元数据
    let metadata = {};
    if (analysisSession.metadata) {
      try {
        metadata = JSON.parse(analysisSession.metadata);
      } catch (error) {
        console.warn('Failed to parse session metadata:', error);
      }
    }

    return NextResponse.json({
      success: true,
      session: {
        id: analysisSession.id,
        analysisType: analysisSession.analysisType,
        status: analysisSession.status,
        canUpgrade: analysisSession.analysisType === 'quick' && analysisSession.status === 'completed',
        isUpgraded: analysisSession.analysisType === 'complete',
        metadata,
      },
    });

  } catch (error) {
    console.error('Get upgrade status error:', error);
    return NextResponse.json(
      { error: 'Failed to get upgrade status' },
      { status: 500 }
    );
  }
}