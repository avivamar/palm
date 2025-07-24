import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { createServerClient } from '@/libs/supabase/config';
import { securityMiddleware } from '@/middleware/security/unified-security';

// 超时配置
const TIMEOUT_CONFIG = {
  adminInit: 8000, // 8秒
  stripeCustomer: 5000, // 5秒
  stripePayment: 8000, // 8秒
  stripeRetrieve: 5000, // 5秒
};

// 超时包装器
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

// 检查是否在构建时
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'
  || (typeof window === 'undefined' && !process.env.RAILWAY_ENVIRONMENT && !process.env.VERCEL && !process.env.STRIPE_SECRET_KEY);

// 只在运行时创建 Stripe 实例
const stripe = !isBuildTime && process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil' as any,
  timeout: 8000, // 8秒超时
}) : null;

type CustomerInfo = {
  email: string;
  name: string;
  phone?: string;
  isAuthenticated: boolean;
  userId?: string;
};

type CreatePaymentIntentRequest = {
  productId: string;
  amount: number;
  currency: string;
  customerInfo: CustomerInfo;
  metadata?: Record<string, string>;
};

/**
 * 创建支付意图 - 支持匿名和已认证用户
 * POST /api/payments/create-intent
 */
export async function POST(request: NextRequest) {
  return securityMiddleware(request, async () => {
    let productId: string | undefined;
    let amount: number | undefined;
    let currency: string | undefined;

    try {
    // 检查 Stripe 是否可用
      if (!stripe) {
        return NextResponse.json(
          { error: 'Payment service not available' },
          { status: 503 },
        );
      }

      const body: CreatePaymentIntentRequest = await request.json();
      ({ productId, amount, currency } = body);
      const { customerInfo, metadata = {} } = body;

      // 验证必需字段
      if (!productId || !amount || !currency || !customerInfo.email || !customerInfo.name) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 },
        );
      }

      // 验证金额
      if (amount < 50) { // Stripe最小金额（50分）
        return NextResponse.json(
          { error: 'Amount must be at least $0.50' },
          { status: 400 },
        );
      }

      let stripeCustomerId: string | undefined;
      let userVerificationStatus = 'anonymous';

      // 如果用户已认证，验证会话并获取用户信息
      if (customerInfo.isAuthenticated && customerInfo.userId) {
        try {
          const supabase = await createServerClient();
          const { data: { user }, error } = await supabase.auth.getUser();

          if (user && !error) {
          // 验证用户是否存在且邮箱已验证
            userVerificationStatus = user.email_confirmed_at ? 'verified' : 'unverified';

            // 查找或创建Stripe客户
            const customers = await withTimeout(
              stripe.customers.list({
                email: customerInfo.email,
                limit: 1,
              }),
              TIMEOUT_CONFIG.stripeCustomer,
            );
            if (customers.data.length > 0 && customers.data[0]) {
              stripeCustomerId = customers.data[0].id;
            }
          } else {
            console.warn(`[CreateIntent] ⚠️ Firebase Admin not available: ${error}`);
          }
        } catch (error) {
          console.warn('Failed to verify authenticated user, proceeding as anonymous:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            userId: customerInfo.userId,
            timestamp: new Date().toISOString(),
          });
        // 继续作为匿名用户处理，不阻断支付流程
        }
      }

      // 如果没有找到现有客户，创建新的Stripe客户
      if (!stripeCustomerId) {
        const customer = await withTimeout(
          stripe.customers.create({
            email: customerInfo.email,
            name: customerInfo.name,
            phone: customerInfo.phone,
            metadata: {
              userId: customerInfo.userId || 'anonymous',
              userStatus: userVerificationStatus,
              source: 'anonymous_payment_form',
            },
          }),
          TIMEOUT_CONFIG.stripeCustomer,
        );
        stripeCustomerId = customer.id;
      }

      // 创建支付意图
      const paymentIntent = await withTimeout(
        stripe.paymentIntents.create({
          amount,
          currency: currency.toLowerCase(),
          customer: stripeCustomerId,
          metadata: {
            productId,
            userId: customerInfo.userId || 'anonymous',
            userStatus: userVerificationStatus,
            customerEmail: customerInfo.email,
            customerName: customerInfo.name,
            ...metadata,
          },
          automatic_payment_methods: {
            enabled: true,
          },
          // 设置收据邮箱
          receipt_email: customerInfo.email,
        }),
        TIMEOUT_CONFIG.stripePayment,
      );

      // 记录支付意图创建日志
      console.warn('Payment intent created:', {
        paymentIntentId: paymentIntent.id,
        amount,
        currency,
        customerId: stripeCustomerId,
        userStatus: userVerificationStatus,
        productId,
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        customerId: stripeCustomerId,
        userStatus: userVerificationStatus,
      });
    } catch (error) {
      console.error('Error creating payment intent:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        productId,
        amount,
        currency,
        timestamp: new Date().toISOString(),
      });

      // 根据错误类型返回不同的响应
      if (error instanceof Error && error.message.includes('timed out')) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable' },
          { status: 503 },
        );
      }

      if (error instanceof Stripe.errors.StripeError) {
        return NextResponse.json(
          {
            error: 'Payment service error',
            details: error.message,
            type: error.type,
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 },
      );
    }
  });
}

/**
 * 获取支付意图状态
 * GET /api/payments/create-intent?payment_intent_id=pi_xxx
 */
export async function GET(request: NextRequest) {
  return securityMiddleware(request, async () => {
    let paymentIntentId: string | null = null;

    try {
    // 检查 Stripe 是否可用
      if (!stripe) {
        return NextResponse.json(
          { error: 'Payment service not available' },
          { status: 503 },
        );
      }

      const { searchParams } = new URL(request.url);
      paymentIntentId = searchParams.get('payment_intent_id');

      if (!paymentIntentId) {
        return NextResponse.json(
          { error: 'Payment intent ID is required' },
          { status: 400 },
        );
      }

      const paymentIntent = await withTimeout(
        stripe.paymentIntents.retrieve(paymentIntentId),
        TIMEOUT_CONFIG.stripeRetrieve,
      );

      return NextResponse.json({
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        customer: paymentIntent.customer,
        metadata: paymentIntent.metadata,
      });
    } catch (error) {
      console.error('Error retrieving payment intent:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        paymentIntentId,
        timestamp: new Date().toISOString(),
      });

      if (error instanceof Error && error.message.includes('timed out')) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable' },
          { status: 503 },
        );
      }

      if (error instanceof Stripe.errors.StripeError) {
        return NextResponse.json(
          {
            error: 'Payment service error',
            details: error.message,
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 },
      );
    }
  });
}
