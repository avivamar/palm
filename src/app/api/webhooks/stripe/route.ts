import type { NextRequest } from 'next/server';
import type Stripe from 'stripe';

// Shopify 集成导入
import { ShopifyClient, WebhookService } from '@rolitt/shopify';

import { eq } from 'drizzle-orm';

import { NextResponse } from 'next/server';
import { createUserAndLinkPreorder } from '@/app/actions/preorderActions';
import { getDB } from '@/libs/DB';
import { RolittKlaviyoEvents } from '@/libs/klaviyo-utils';
// Subscription services import
import { SubscriptionSyncService } from '@/libs/subscription';
import { WebhookLogger } from '@/libs/webhook-logger';
import {
  checkEventDuplication,
  enhancedWebhookSignatureVerification,
  executeWithRetry,
  markEventAsProcessed,
  WebhookMonitor,
} from '@/libs/webhook-reliability';
// import { // invalidateCache } from '@/libs/cache-manager';

import { securityMiddleware } from '@/middleware/security/unified-security';
import { preordersSchema, webhookLogsSchema } from '@/models/Schema';

// Add runtime declaration for Node.js compatibility
export const runtime = 'nodejs';

// 超时配置
const TIMEOUT_CONFIG = {
  webhookProcessing: 25000, // 25秒 - Vercel函数超时前的安全边界
  dbOperation: 8000, // 8秒 - 数据库操作
  klaviyoEvent: 5000, // 5秒 - Klaviyo API调用
  userCreation: 10000, // 10秒 - 用户创建和预订链接
  shopifySync: 8000, // 8秒 - Shopify 订单同步
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

// CRITICAL FIX: Disable Next.js body parsing to preserve the raw body for Stripe signature verification.
export const config = {
  api: {
    bodyParser: false,
  },
};

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // 30 seconds

// 初始化 Webhook 监控器和订阅同步服务
const webhookMonitor = new WebhookMonitor();
const subscriptionSync = new SubscriptionSyncService();

export async function GET() {
  return new NextResponse(
    JSON.stringify({
      message: 'Stripe webhook endpoint - Hybrid Marketing Mode',
      status: 'active',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );
}

async function processWebhookEvent(event: Stripe.Event) {
  console.error(`[Webhook] 🚀 Starting processing for event: ${event.id}, type: ${event.type}`);
  let logId: number | null = null;

  try {
    const db = await withTimeout(getDB(), TIMEOUT_CONFIG.dbOperation);
    const existingLog = await withTimeout(
      db.select().from(webhookLogsSchema).where(eq(webhookLogsSchema.stripeEventId, event.id)).limit(1),
      TIMEOUT_CONFIG.dbOperation,
    ) as Array<typeof webhookLogsSchema.$inferSelect>;

    if (existingLog.length > 0) {
      console.error(`[Webhook] 🔵 Event ${event.id} already processed. Skipping.`);
      return;
    }

    logId = await withTimeout(
      WebhookLogger.logStripeEventStart(event.type, event.id, (event.data.object as any).customer_details?.email),
      TIMEOUT_CONFIG.dbOperation,
    );
    console.error(`[Webhook] ✍️ Initial log record created with ID: ${logId}`);

    // Handle different object types based on event
    let session: Stripe.Checkout.Session | undefined;
    let subscription: Stripe.Subscription | undefined;
    let preorderId: string | undefined;

    if (event.type.startsWith('checkout.session.')) {
      session = event.data.object as Stripe.Checkout.Session;
      preorderId = session.metadata?.preorderId;
    } else if (event.type.startsWith('customer.subscription.')) {
      subscription = event.data.object as Stripe.Subscription;
    }

    switch (event.type) {
      case 'checkout.session.completed':
        if (session) {
          // Check if this is a subscription checkout
          if (session.mode === 'subscription') {
            await withTimeout(
              handleSubscriptionCheckoutCompleted(session, logId),
              TIMEOUT_CONFIG.userCreation,
            );
          } else {
            // Regular preorder checkout
            await withTimeout(
              handleCheckoutSessionCompleted(session, logId),
              TIMEOUT_CONFIG.userCreation,
            );
          }
        }
        break;

      case 'checkout.session.expired':
        if (logId) {
          await withTimeout(
            WebhookLogger.logStripeEvent(logId, 'expired', { preorder_id: preorderId, message: 'Checkout session expired.' }),
            TIMEOUT_CONFIG.dbOperation,
          );
        }
        if (session && session.customer_details?.email && preorderId) {
          try {
            await withTimeout(
              RolittKlaviyoEvents.abandonedCart(session.customer_details.email, {
                preorder_id: preorderId,
                locale: session.locale || 'en',
                color: session.metadata?.color || 'unknown',
              }),
              TIMEOUT_CONFIG.klaviyoEvent,
            );
          } catch (klaviyoError) {
            console.error('[Webhook] ❌ Klaviyo abandoned cart event failed:', klaviyoError);
          }
        }
        break;

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        if (logId) {
          await withTimeout(
            WebhookLogger.logStripeEvent(logId, 'failed', { preorder_id: preorderId, payment_intent_id: paymentIntent.id, error_message: paymentIntent.last_payment_error?.message }),
            TIMEOUT_CONFIG.dbOperation,
          );
        }
        break;
      }

      // Subscription events
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.trial_will_end':
        if (subscription) {
          await withTimeout(
            handleSubscriptionEvent(event, subscription, logId),
            TIMEOUT_CONFIG.dbOperation,
          );
        }
        break;

      default:
        if (logId) {
          await withTimeout(
            WebhookLogger.logStripeEventSuccess(logId, true, { message: `Unhandled event type: ${event.type}` }),
            TIMEOUT_CONFIG.dbOperation,
          );
        }
        break;
    }
  } catch (error) {
    console.error(`[Webhook] 🛑 CRITICAL ERROR in processWebhookEvent:`, error);
    if (logId) {
      try {
        await withTimeout(
          WebhookLogger.logStripeEventFailure(logId, error instanceof Error ? error.message : 'Unknown error', { stripe_event_id: event.id }),
          TIMEOUT_CONFIG.dbOperation,
        );
      } catch (logError) {
        console.error('[Webhook] 🛑 Failed to log error:', logError);
      }
    }
  }
}

export async function POST(req: NextRequest) {
  return securityMiddleware(req, async () => {
    const startTime = Date.now();
    console.error('[Webhook-POST] 📥 Received POST request.');

    // Runtime check for STRIPE_SECRET_KEY
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('[Webhook-POST] 🛑 STRIPE_SECRET_KEY is not configured');
      webhookMonitor.recordFailure('missing_stripe_secret_key');
      return new NextResponse('STRIPE_SECRET_KEY is not configured', { status: 500 });
    }

    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
      console.error('[Webhook-POST] 🛑 Missing Stripe signature');
      webhookMonitor.recordFailure('missing_signature');
      return new NextResponse('Missing Stripe signature', { status: 400 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('[Webhook-POST] 🛑 Webhook secret not configured.');
      webhookMonitor.recordFailure('missing_webhook_secret');
      return new NextResponse('Webhook secret not configured', { status: 500 });
    }

    let event: Stripe.Event;
    try {
      console.error('[Webhook-POST] 🔐 Verifying Stripe signature...');
      // 使用增强的签名验证
      event = await enhancedWebhookSignatureVerification(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
      console.error(`[Webhook-POST] ✅ Signature verified. Event ID: ${event.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[Webhook-POST] 🛑 Signature verification failed: ${errorMessage}`);
      webhookMonitor.recordFailure('signature_verification');
      return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
    }

    // 检查事件去重
    const isDuplicate = await checkEventDuplication(event.id);
    if (isDuplicate) {
      console.error(`[Webhook-POST] ⚠️ Duplicate event detected, skipping: ${event.id}`);
      webhookMonitor.recordDuplicate(event.type);
      return NextResponse.json({ received: true, duplicate: true });
    }

    try {
    // 🎯 **DEFINITIVE FIX**: Await the processing to guarantee execution before responding.
      console.error(`[Webhook-POST] 🚀 Executing event processing for ${event.id}.`);

      // 使用重试机制处理 Webhook 事件
      await executeWithRetry(
        () => processWebhookEvent(event),
        {
          maxRetries: 3,
          baseDelayMs: 1000,
          maxDelayMs: 10000,
          backoffMultiplier: 2,
        },
      );

      // 标记事件为已处理
      markEventAsProcessed(event.id, { processed: true, timestamp: Date.now() });

      // 记录成功指标
      const processingTime = Date.now() - startTime;
      webhookMonitor.recordSuccess(event.type, processingTime);

      console.error(`[Webhook-POST] ✅ Event processing finished for ${event.id}. Responding to Stripe.`);
      return NextResponse.json({ received: true });
    } catch (error) {
      console.error(`[Webhook-POST] 🛑 Error processing webhook event:`, error);
      webhookMonitor.recordFailure('processing_error');

      // 记录处理失败的事件
      try {
        await WebhookLogger.logStripeEventFailure(
          0, // 使用 0 作为默认 logId
          error instanceof Error ? error.message : 'Unknown error',
          { eventType: event.type, eventId: event.id, retryAttempts: 3 },
        );
      } catch (logError) {
        console.error('[Webhook-POST] 🛑 Failed to log error:', logError);
      }

      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 },
      );
    }
  });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session & { shipping_details?: any }, logId: number | null) {
  console.error(`[Webhook] 🚀 Starting handleCheckoutSessionCompleted for session: ${session.id}`);

  const email = session.customer_details?.email;
  if (!email) {
    console.error(`[Webhook] 🛑 Email not found in session: ${session.id}`);
    if (logId) {
      await WebhookLogger.logStripeEventFailure(logId, 'Email not found in session', { session_id: session.id });
    }
    return;
  }

  const { preorderId } = session.metadata || {};
  if (!preorderId) {
    console.error(`[Webhook] 🛑 Critical: PreorderId not found in session metadata for session ${session.id}`);
    if (logId) {
      await WebhookLogger.logStripeEventFailure(logId, 'PreorderId not found in session metadata', { session_id: session.id });
    }
    return;
  }

  const db = await getDB();

  try {
    let preorder = await db.query.preordersSchema.findFirst({ where: eq(preordersSchema.id, preorderId) });

    if (!preorder) {
      console.error(`[Webhook] 🛑 Critical: Preorder with ID ${preorderId} not found.`);
      if (logId) {
        await WebhookLogger.logStripeEventFailure(logId, `Preorder not found for ID: ${preorderId}`, { session_id: session.id });
      }
      return;
    }

    if (preorder.status === 'completed') {
      console.error(`[Webhook] 🔵 Preorder ${preorderId} is already completed. Skipping.`);
      if (logId) {
        await WebhookLogger.logStripeEventSuccess(logId, true, { message: 'Already completed' });
      }
      return;
    }

    const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id;

    console.error(`[Webhook] 👤 Calling createUserAndLinkPreorder for preorder: ${preorderId}`);
    const userResult = await createUserAndLinkPreorder(preorderId, {
      email,
      sessionId: session.id,
      paymentIntentId: paymentIntentId || 'unknown',
      amount: session.amount_total ? (session.amount_total / 100).toString() : '0.00',
      currency: session.currency || 'USD',
      shippingAddress: session.shipping_details,
      billingAddress: session.customer_details,
      // 提取手机号信息
      phone: session.customer_details?.phone || null,
    });

    if (!userResult.success) {
      console.error(`[Webhook] 🛑 Failed to create user and link preorder: ${userResult.error}`);
      if (logId) {
        await WebhookLogger.logStripeEventFailure(logId, `Hybrid user creation failed: ${userResult.error}`, { preorder_id: preorderId, session_id: session.id });
      }
    }

    // Refetch preorder to get the latest data
    preorder = await db.query.preordersSchema.findFirst({ where: eq(preordersSchema.id, preorderId) });
    if (!preorder) {
      console.error(`[Webhook] 🛑 Critical: Preorder ${preorderId} disappeared after update.`);
      return;
    }

    let klaviyoSuccess = false;
    // Optional: Process referral rewards
    let referralProcessed = false;
    try {
      const { ReferralMVP } = await import('@rolitt/referral');

      // Check if this purchase came from a referral
      const referralCode = preorder.referrerCode;
      if (referralCode && session.amount_total) {
        console.log(`[Webhook] 🎁 Processing referral reward for code: ${referralCode}`);

        // Get referral configuration from database
        // For now, use default config - this will be configurable via admin panel later
        const referralConfig = {
          enabled: true,
          rewardType: 'percentage' as const,
          rewardValue: 20, // 20% discount for referee, 10% reward for referrer
          cookieDays: 30,
        };

        const rewardInfo = await ReferralMVP.calculateReward(
          referralCode,
          session.amount_total, // Amount in cents
          referralConfig,
        );

        if (rewardInfo) {
          console.log(`[Webhook] 💰 Referral reward calculated:`, rewardInfo);
          // TODO: In a complete implementation, you would:
          // 1. Update referrals table with conversion data
          // 2. Credit the referrer's account
          // 3. Send notification to referrer
          // 4. Track metrics
          referralProcessed = true;
        }
      }
    } catch (referralError) {
      console.log('[Webhook] ⚠️ Referral processing not available or failed:', referralError);
      // Gracefully continue without referral processing
    }

    if (!preorder.klaviyoEventSentAt) {
      try {
        await RolittKlaviyoEvents.preorderCompleted(email, {
          color: preorder.color || 'unknown',
          preorder_id: preorder.id,
          preorder_number: preorder.preorderNumber || `ROL-${preorder.id.substring(0, 8).toUpperCase()}`,
          locale: preorder.locale || 'en',
          amount: preorder.amount || '0.00',
          currency: preorder.currency || 'USD',
          user_created: userResult.success,
          marketing_stage: 'payment_completed',
          // 🎯 传递手机号给 Klaviyo 用于 SMS 营销
          phone: session.customer_details?.phone || preorder.billingPhone || null,
        });
        klaviyoSuccess = true;
        await db.update(preordersSchema).set({ klaviyoEventSentAt: new Date() }).where(eq(preordersSchema.id, preorder.id));
      } catch (klaviyoError) {
        console.error(`[Webhook] ❌ Klaviyo event failed`, klaviyoError);
      }
    } else {
      klaviyoSuccess = true;
    }

    // 🛒 Shopify 订单同步
    let shopifySuccess = false;
    let shopifyOrderId: string | undefined;
    let shopifyOrderNumber: string | undefined;

    try {
      console.log(`[Webhook] 🛒 Starting Shopify order sync for preorder: ${preorderId}`);

      // 初始化 Shopify 客户端和服务
      const shopifyClient = new ShopifyClient();
      const webhookService = new WebhookService(shopifyClient);

      // 同步订单到 Shopify
      const shopifyResult = await withTimeout(
        webhookService.processStripeOrder(session, { preorderId, email }),
        TIMEOUT_CONFIG.shopifySync,
      );

      if (shopifyResult.success) {
        shopifySuccess = true;
        shopifyOrderId = shopifyResult.shopifyOrderId;
        shopifyOrderNumber = shopifyResult.shopifyOrderNumber;
        console.log(`[Webhook] ✅ Shopify order created: ${shopifyOrderId} (${shopifyOrderNumber})`);

        // 更新预订记录，添加 Shopify 信息
        await db.update(preordersSchema).set({
          shopifyOrderId,
          shopifyOrderNumber,
          shopifySyncedAt: new Date(),
        }).where(eq(preordersSchema.id, preorder.id));
      } else {
        console.error(`[Webhook] ❌ Shopify sync failed: ${shopifyResult.error}`);

        // 记录 Shopify 同步失败
        await db.update(preordersSchema).set({
          shopifyError: shopifyResult.error,
          shopifyLastAttemptAt: new Date(),
        }).where(eq(preordersSchema.id, preorder.id));
      }
    } catch (shopifyError) {
      console.error(`[Webhook] 🛑 Shopify sync error:`, shopifyError);

      // 记录同步错误
      try {
        await db.update(preordersSchema).set({
          shopifyError: shopifyError instanceof Error ? shopifyError.message : 'Unknown Shopify error',
          shopifyLastAttemptAt: new Date(),
        }).where(eq(preordersSchema.id, preorder.id));
      } catch (dbError) {
        console.error('[Webhook] 🛑 Failed to record Shopify error:', dbError);
      }
    }

    // Cache Invalidation: Clear stats caches when orders are processed
    console.error(`[Webhook] 🔄 Invalidating cache for user: ${email}`);
    try {
      // Invalidate user-specific stats cache
      // await invalidateCache(`user_stats:${email}`);

      // Invalidate admin dashboard stats cache (all admin users)
      // await invalidateCache('dashboard_stats');

      console.error(`[Webhook] ✅ Cache invalidated successfully for user: ${email}`);
    } catch (cacheError) {
      console.error(`[Webhook] ⚠️ Cache invalidation failed:`, cacheError);
      // Don't fail the webhook if cache invalidation fails
    }

    if (logId) {
      await WebhookLogger.logStripeEventSuccess(logId, true, {
        preorder_id: preorderId,
        user_created: userResult.success,
        klaviyo_success: klaviyoSuccess,
        shopify_success: shopifySuccess,
        shopify_order_id: shopifyOrderId,
        shopify_order_number: shopifyOrderNumber,
        referral_processed: referralProcessed,
        message: 'Checkout session completed successfully',
      });
    }
  } catch (error) {
    console.error(`[Webhook] 🛑 Error in handleCheckoutSessionCompleted:`, error);
    if (logId) {
      await WebhookLogger.logStripeEventFailure(logId, error instanceof Error ? error.message : 'Unknown error', { preorder_id: preorderId, session_id: session.id });
    }
  }
}

/**
 * 处理订阅checkout完成事件
 */
async function handleSubscriptionCheckoutCompleted(
  session: Stripe.Checkout.Session,
  logId: number | null,
): Promise<void> {
  try {
    console.log(`[Webhook] 🔔 Processing subscription checkout completed: ${session.id}`);

    const email = session.customer_details?.email;
    if (!email) {
      console.error(`[Webhook] 🛑 Email not found in subscription session: ${session.id}`);
      if (logId) {
        await WebhookLogger.logStripeEventFailure(
          logId,
          'Email not found in subscription session',
          { session_id: session.id },
        );
      }
      return;
    }

    // 订阅checkout完成时，实际的订阅对象会通过subscription.created事件处理
    // 这里主要记录checkout成功
    if (logId) {
      await WebhookLogger.logStripeEventSuccess(logId, true, {
        session_id: session.id,
        email,
        mode: 'subscription',
        message: 'Subscription checkout completed, waiting for subscription.created event',
      });
    }

    console.log(`[Webhook] ✅ Subscription checkout completed for: ${email}`);
  } catch (error) {
    console.error(`[Webhook] 🛑 Error in handleSubscriptionCheckoutCompleted:`, error);
    if (logId) {
      await WebhookLogger.logStripeEventFailure(
        logId,
        error instanceof Error ? error.message : 'Unknown error',
        { session_id: session.id },
      );
    }
  }
}

/**
 * 处理订阅相关事件
 */
async function handleSubscriptionEvent(
  event: Stripe.Event,
  subscription: Stripe.Subscription,
  logId: number | null,
): Promise<void> {
  try {
    console.log(`[Webhook] 🔔 Processing subscription event: ${event.type} for subscription: ${subscription.id}`);

    // 使用订阅同步服务处理事件
    await subscriptionSync.handleSubscriptionEvent(event);

    if (logId) {
      await WebhookLogger.logStripeEventSuccess(logId, true, {
        subscription_id: subscription.id,
        customer_id: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
        status: subscription.status,
        event_type: event.type,
        message: `Subscription event ${event.type} processed successfully`,
      });
    }

    console.log(`[Webhook] ✅ Subscription event ${event.type} processed for: ${subscription.id}`);
  } catch (error) {
    console.error(`[Webhook] 🛑 Error in handleSubscriptionEvent:`, error);
    if (logId) {
      await WebhookLogger.logStripeEventFailure(
        logId,
        error instanceof Error ? error.message : 'Unknown error',
        {
          subscription_id: subscription.id,
          event_type: event.type,
          error_details: error instanceof Error ? error.stack : undefined,
        },
      );
    }
    throw error; // Re-throw to trigger retry mechanism
  }
}
