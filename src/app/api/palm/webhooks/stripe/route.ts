/**
 * Palm AI Stripe Webhook Handler
 * 处理支付成功后的升级逻辑
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { getSafeDB } from '@/libs/DB';
import { palmAnalysisSessionsSchema } from '@/models/Schema';
import { eq } from 'drizzle-orm';
import { createPalmEngine } from '@rolitt/palm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // 处理支付成功事件
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // 检查是否是 Palm 升级支付
      if (session.metadata?.type === 'palm_upgrade') {
        await handleUpgradePayment(session);
      }
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleUpgradePayment(session: Stripe.Checkout.Session) {
  try {
    const { sessionId, userId, upgradeType } = session.metadata!;
    
    if (!sessionId || !userId || upgradeType !== 'complete_analysis') {
      throw new Error('Invalid upgrade metadata');
    }

    const db = await getSafeDB();

    // 1. 获取原始分析会话
    const [analysisSession] = await db
      .select()
      .from(palmAnalysisSessionsSchema)
      .where(eq(palmAnalysisSessionsSchema.id, parseInt(sessionId)))
      .limit(1);

    if (!analysisSession) {
      throw new Error(`Analysis session ${sessionId} not found`);
    }

    // 2. 验证会话状态
    if (analysisSession.status !== 'completed') {
      throw new Error(`Analysis session ${sessionId} is not completed`);
    }

    if (analysisSession.analysisType !== 'quick') {
      throw new Error(`Analysis session ${sessionId} is not a quick analysis`);
    }

    if (analysisSession.userId !== userId) {
      throw new Error(`User ${userId} does not own session ${sessionId}`);
    }

    // 3. 解析原始分析结果
    let quickAnalysisResult = null;
    if (analysisSession.analysisResult) {
      try {
        quickAnalysisResult = JSON.parse(analysisSession.analysisResult);
      } catch (error) {
        throw new Error('Failed to parse existing analysis result');
      }
    }

    if (!quickAnalysisResult) {
      throw new Error('No analysis result found to upgrade');
    }

    // 4. 生成完整分析
    const palmEngine = createPalmEngine({
      aiServices: {
        primaryProvider: process.env.PALM_AI_PRIMARY_PROVIDER as 'openai' | 'claude' | 'gemini' || 'openai',
      }
    });
    
    const userInfo = {
      birthDate: analysisSession.birthDate ? new Date(analysisSession.birthDate) : new Date(),
      birthTime: analysisSession.birthTime || undefined,
      birthLocation: analysisSession.birthLocation || undefined,
      gender: 'unknown' as const,
      language: 'en' as const,
    };

    // 使用真实的AI引擎生成完整报告
    const fullReport = await palmEngine.analyzeComplete(
      quickAnalysisResult.report || quickAnalysisResult,
      userInfo,
      userId
    );

    // 5. 更新数据库记录
    const updatedMetadata = {
      ...JSON.parse(analysisSession.metadata || '{}'),
      upgradedAt: new Date().toISOString(),
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent,
      originalAnalysisType: 'quick',
    };

    await db
      .update(palmAnalysisSessionsSchema)
      .set({
        analysisType: 'complete',
        analysisResult: JSON.stringify({
          success: true,
          report: fullReport,
          metadata: {
            upgradedFromQuick: true,
            upgradePaymentId: session.id,
            generatedAt: new Date().toISOString(),
          },
        }),
        metadata: JSON.stringify(updatedMetadata),
        completedAt: new Date(),
      })
      .where(eq(palmAnalysisSessionsSchema.id, parseInt(sessionId)));

    console.log(`Successfully upgraded Palm analysis session ${sessionId} to complete`);

  } catch (error) {
    console.error('Failed to handle upgrade payment:', error);
    
    // 这里可以添加失败通知逻辑
    // 例如发送邮件给用户或记录到错误日志系统
    throw error;
  }
}