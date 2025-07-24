'use server';

import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { z } from 'zod';

import { getDB } from '@/libs/DB';
import { RolittKlaviyoEvents } from '@/libs/klaviyo-utils';
import { preordersSchema, usersSchema } from '@/models/Schema';

// Preorder initialization form validation schema
const preorderInitSchema = z.object({
  email: z.string().email(),
  color: z.enum(['Honey Khaki', 'Sakura Pink', 'Healing Green', 'Moonlight Grey', 'Red']),
  priceId: z.string(),
  locale: z.string().default('en'),
});

type PreorderInitResult = | { success: true; preorderId: string; preorderNumber: string } | { success: false; error: string };

/**
 * 🎯 混合营销模式 - 预订初始化（营销优化版）
 * 🚀 核心设计原则：先预订，后用户，精准营销
 *
 * 营销流程：
 * 1. 用户填写表单 → 立即创建preorder记录(userId=null) → 立即跳转支付
 * 2. 支付成功 → Stripe Webhook创建用户 → 更新preorder关联用户
 * 3. 支付失败/放弃 → 触发放弃购物车营销 → 重定向广告 → 挽回邮件
 *
 * 优势：
 * - 🎯 精准用户画像：只有真实购买意向的用户才会创建账户
 * - 📊 清晰转化漏斗：表单提交 → 支付意向 → 支付成功 → 用户创建
 * - 📧 精准营销：放弃购物车营销，重定向广告
 * - 💰 高ROI：营销投入只针对高价值用户
 */
export async function initiatePreorder(formData: FormData): Promise<PreorderInitResult> {
  try {
    const data = Object.fromEntries(formData);
    const validatedData = preorderInitSchema.parse(data);

    const { email, color, priceId, locale } = validatedData;

    // PRODUCTION LOG: Using console.error for production visibility
    console.error(`[HybridPreorder] 🎯 Starting hybrid marketing preorder: ${email}`);

    // 🚀 Vercel 优化：极速数据库操作 (目标 < 2秒)
    const dbTimeout = 3000; // 缩短到3秒，适应Vercel限制
    const db = await Promise.race([
      getDB(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database connection timeout')), dbTimeout),
      ),
    ]);

    // 🎯 HYBRID STEP 1: Create preorder record WITHOUT user (userId=null)
    // 营销优化：先记录购买意向，支付成功后再创建用户
    const preorderId = nanoid();
    const preorderNumber = `ROL-${preorderId.substring(0, 8).toUpperCase()}`;

    // 🚀 极速创建预订记录 - 只存储核心字段
    await Promise.race([
      db.insert(preordersSchema).values({
        id: preorderId,
        userId: null, // 🎯 关键：不预先创建用户，支付成功后再关联
        email,
        color,
        priceId,
        status: 'initiated',
        amount: '0.00', // Will be updated during payment
        currency: 'USD',
        preorderNumber,
        locale,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database insert timeout')), 2000), // 缩短到2秒
      ),
    ]);

    console.error(`[HybridPreorder] ✅ Preorder created without user, payment redirect ready: ${preorderId}`);

    // 🚀 转化优先：极速响应，所有营销任务全部异步化
    // 使用简化异步任务系统，确保支付流程绝对不被阻塞
    try {
      const { scheduleAsyncTask } = await import('@/libs/simple-async-tasks');
      await scheduleAsyncTask('marketing_event', {
        preorderId,
        email: validatedData.email,
        color: validatedData.color,
        locale: validatedData.locale,
        priceId: validatedData.priceId,
        timestamp: Date.now(),
      });

      console.error(`[HybridPreorder] 🚀 Marketing task queued for ${preorderId}`);
    } catch (asyncError) {
      // 最终回退方案
      console.error(`[HybridPreorder] ⚠️ Async task failed, using final fallback: ${asyncError}`);
      setImmediate(() => {
        processPreorderMarketingAsync(preorderId, {
          email: validatedData.email,
          color: validatedData.color,
          locale: validatedData.locale,
          priceId: validatedData.priceId,
        })
          .catch((error) => {
            console.error(`[MarketingAsync] Final fallback error: ${preorderId}`, error);
          });
      });
    }

    // Immediately return response to the client
    return {
      success: true,
      preorderId,
      preorderNumber,
    };
  } catch (error) {
    console.error('[HybridPreorder] ❌ Critical error during initiation.', {
      error: error instanceof Error ? { message: error.message, stack: error.stack, name: error.name } : error,
      formData: Object.fromEntries(formData),
    });
    return {
      success: false,
      error: `Failed to initialize preorder. Please try again.`,
    };
  }
}

/**
 * 🔄 混合营销模式 - 异步营销事件处理
 * 处理：Klaviyo事件、营销标签、用户行为追踪
 */
export async function processPreorderMarketingAsync(
  preorderId: string,
  data: { email: string; color: string; priceId: string; locale: string },
): Promise<void> {
  const { email, color, locale } = data;

  console.error(`[MarketingAsync] 🎯 Starting marketing event processing: ${preorderId}`);

  try {
    // 设置营销处理超时
    const marketingTimeout = 5000; // 5秒超时

    // 1. Send Klaviyo preorder intention event (critical for marketing)
    try {
      console.error(`[MarketingAsync] 📧 Sending Klaviyo preorder intention event: ${preorderId}`);

      await Promise.race([
        RolittKlaviyoEvents.preorderStarted(email, {
          color,
          preorder_id: preorderId,
          preorder_number: `ROL-${preorderId.substring(0, 8).toUpperCase()}`,
          locale,
          source: 'hybrid_web_form',
          user_created: false, // 🎯 关键：标记用户尚未创建
          marketing_stage: 'preorder_intention', // 营销阶段标记
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Klaviyo event timeout')), marketingTimeout),
        ),
      ]);

      // Mark Klaviyo intention event as sent
      const db = await getDB();
      await Promise.race([
        db.update(preordersSchema)
          .set({
            klaviyoEventSentAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(preordersSchema.id, preorderId)),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database update timeout')), 3000),
        ),
      ]);

      console.error(`[MarketingAsync] ✅ Klaviyo preorder intention event sent: ${preorderId}`);
    } catch (error) {
      console.error(`[MarketingAsync] ❌ Klaviyo event failed: ${preorderId}`, error);
    }

    // 2. Update status to processing (ready for payment)
    try {
      const db = await getDB();
      await Promise.race([
        db.update(preordersSchema)
          .set({
            status: 'processing',
            updatedAt: new Date(),
          })
          .where(eq(preordersSchema.id, preorderId)),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Status update timeout')), 3000),
        ),
      ]);

      console.error(`[MarketingAsync] ✅ Status updated to processing: ${preorderId}`);
    } catch (error) {
      console.error(`[MarketingAsync] ❌ Status update failed: ${preorderId}`, error);
    }

    console.error(`[MarketingAsync] 🎉 Marketing event processing completed: ${preorderId}`);
  } catch (error) {
    console.error(`[MarketingAsync] ❌ Marketing processing severe error: ${preorderId}`, error);
  }
}

/**
 * 🎯 混合营销模式 - 支付成功后创建用户并关联
 * 这个函数将在Stripe Webhook中调用，当支付成功时创建用户账户
 */
export async function createUserAndLinkPreorder(
  preorderId: string,
  paymentData: {
    email: string;
    sessionId: string;
    paymentIntentId: string;
    amount: string;
    currency: string;
    shippingAddress?: any;
    billingAddress?: any;
    phone?: string | null;
  },
): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    console.error(`[HybridUserCreation] 🎯 Creating user after successful payment: ${preorderId}`);

    const db = await getDB();
    const { email, sessionId, paymentIntentId, amount, currency, shippingAddress, billingAddress, phone } = paymentData;

    // 1. Check if user already exists
    let userId: string;
    const existingUser = await db.query.usersSchema.findFirst({
      where: eq(usersSchema.email, email),
    });

    if (existingUser) {
      userId = existingUser.id;
      console.error(`[HybridUserCreation] 📋 Found existing user: ${userId}`);
    } else {
      // 2. Create new user (high-value user: has completed payment)
      userId = nanoid();
      await db.insert(usersSchema).values({
        id: userId,
        email,
        displayName: email.split('@')[0],
        phone: phone || null, // 🎯 保存手机号
        marketingConsent: true, // 🎯 已支付用户，可以进行营销
        emailVerified: true, // 🎯 已支付用户，邮箱已验证
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.error(`[HybridUserCreation] ✅ High-value user created: ${userId}`);
    }

    // 3. Extract billing address fields for better readability
    const billingData: any = {};
    if (billingAddress) {
      billingData.billingName = billingAddress.name || null;
      billingData.billingEmail = billingAddress.email || null;
      // 🎯 优先使用从 Stripe checkout session 直接获取的手机号
      billingData.billingPhone = phone || billingAddress.phone || null;
      if (billingAddress.address) {
        billingData.billingAddressLine1 = billingAddress.address.line1 || null;
        billingData.billingAddressLine2 = billingAddress.address.line2 || null;
        billingData.billingCity = billingAddress.address.city || null;
        billingData.billingState = billingAddress.address.state || null;
        billingData.billingCountry = billingAddress.address.country || null;
        billingData.billingPostalCode = billingAddress.address.postal_code || null;
      }
    } else if (phone) {
      // 🎯 即使没有 billingAddress，也要保存手机号
      billingData.billingPhone = phone;
    }

    // 4. Update preorder with user association and payment info
    await db.update(preordersSchema)
      .set({
        userId, // 🎯 关键：关联用户
        status: 'completed',
        sessionId,
        paymentIntentId,
        amount,
        currency,
        shippingAddress,
        billingAddress,
        // Add flattened billing address fields
        ...billingData,
        updatedAt: new Date(),
      })
      .where(eq(preordersSchema.id, preorderId));

    console.error(`[HybridUserCreation] ✅ Preorder linked to user: ${preorderId} → ${userId}`);

    // 4. 🎯 创建 Supabase 用户（主认证系统）
    try {
      console.error(`[HybridUserCreation] 🔄 Creating Supabase user for ${email}`);

      // 创建临时密码用于 Supabase 用户创建
      const tempPassword = nanoid(16); // 生成安全的临时密码

      // 导入 Supabase Auth 服务
      const { supabaseAuth } = await import('@/libs/supabase/auth');

      // 创建 Supabase 用户账户
      const supabaseResult = await supabaseAuth.signUp(email, tempPassword, {
        name: email.split('@')[0],
      });

      if (supabaseResult.user) {
        // 更新数据库中的 Supabase ID
        await db.update(usersSchema)
          .set({
            supabaseId: supabaseResult.user.id,
            authSource: 'supabase',
            updatedAt: new Date(),
          })
          .where(eq(usersSchema.id, userId));

        console.error(`[HybridUserCreation] ✅ Supabase user created: ${supabaseResult.user.id}`);
      } else if (supabaseResult.error) {
        // 如果用户已存在，尝试获取现有用户信息
        if (supabaseResult.error.includes('already registered')) {
          console.error(`[HybridUserCreation] 📋 Supabase user already exists for ${email}`);
        } else {
          console.error(`[HybridUserCreation] ❌ Supabase user creation failed: ${supabaseResult.error}`);
        }
      }
    } catch (error) {
      console.error(`[HybridUserCreation] ❌ Supabase user creation error for ${email}:`, error);
      // 非关键错误，支付已经处理成功
    }

    // 5. 🔄 Firebase 同步（容灾备份 + Flutter）
    try {
      const { syncUserToFirebase } = await import('./firebaseSync');

      // 非阻塞的 Firebase 同步，用于移动端兼容性和容灾备份
      setImmediate(() => {
        syncUserToFirebase(email)
          .then((result) => {
            if (result.success) {
              console.error(`[HybridUserCreation] ✅ Firebase backup sync completed for ${email}: ${result.firebase_uid}`);

              // 更新数据库中的 Firebase UID
              db.update(usersSchema)
                .set({
                  firebaseUid: result.firebase_uid,
                  updatedAt: new Date(),
                })
                .where(eq(usersSchema.id, userId))
                .catch((dbError: Error) => {
                  console.error(`[HybridUserCreation] ❌ Failed to update Firebase UID in database:`, dbError);
                });
            } else {
              console.error(`[HybridUserCreation] ❌ Firebase backup sync failed for ${email}: ${result.error}`);
            }
          })
          .catch((error) => {
            console.error(`[HybridUserCreation] ❌ Firebase backup sync error for ${email}:`, error);
          });
      });

      console.error(`[HybridUserCreation] ✅ Firebase backup sync initiated for ${email}`);
    } catch (error) {
      console.error(`[HybridUserCreation] ❌ Firebase backup sync initialization failed for ${email}:`, error);
      // 非关键错误，不影响主流程
    }

    // 6. Send marketing event for successful conversion
    try {
      const preorderData = await db.query.preordersSchema.findFirst({
        where: eq(preordersSchema.id, preorderId),
      });

      if (preorderData) {
        await RolittKlaviyoEvents.preorderCompleted(email, {
          color: preorderData.color,
          preorder_id: preorderId,
          preorder_number: preorderData.preorderNumber || `ROL-${preorderId.substring(0, 8).toUpperCase()}`,
          amount,
          currency,
          locale: preorderData.locale || 'en',
          user_created: !existingUser, // 🎯 标记是否为新用户
          marketing_stage: 'payment_completed', // 营销阶段标记
        });
        console.error(`[HybridUserCreation] ✅ Conversion event sent to Klaviyo: ${preorderId}`);
      }
    } catch (error) {
      console.error(`[HybridUserCreation] ❌ Conversion event failed: ${preorderId}`, error);
    }

    return { success: true, userId };
  } catch (error) {
    console.error('[HybridUserCreation] ❌ Critical error during user creation/linking.', {
      error: error instanceof Error ? { message: error.message, stack: error.stack, name: error.name } : error,
      preorderId,
      paymentData,
    });
    return {
      success: false,
      error: 'Failed to create user and link preorder. Please check logs.',
    };
  }
}

/**
 * 🎯 混合营销模式 - 触发放弃购物车营销
 * 当用户创建preorder但未完成支付时，触发营销活动
 */
export async function triggerAbandonedCartMarketing(preorderId: string): Promise<void> {
  try {
    console.error(`[AbandonedCart] 🎯 Triggering abandoned cart marketing: ${preorderId}`);

    const db = await getDB();
    const preorder = await db.query.preordersSchema.findFirst({
      where: eq(preordersSchema.id, preorderId),
    });

    if (!preorder) {
      console.error(`[AbandonedCart] ❌ Preorder not found: ${preorderId}`);
      return;
    }

    // 1. Send abandoned cart event to Klaviyo
    try {
      await RolittKlaviyoEvents.abandonedCart(preorder.email, {
        color: preorder.color,
        preorder_id: preorderId,
        preorder_number: preorder.preorderNumber || `ROL-${preorderId.substring(0, 8).toUpperCase()}`,
        locale: preorder.locale || 'en',
        cart_value: preorder.amount || '0.00',
        currency: preorder.currency || 'USD',
        marketing_stage: 'abandoned_cart', // 营销阶段标记
        abandoned_at: new Date().toISOString(),
      });
      console.error(`[AbandonedCart] ✅ Abandoned cart event sent to Klaviyo: ${preorderId}`);
    } catch (error) {
      console.error(`[AbandonedCart] ❌ Klaviyo abandoned cart event failed: ${preorderId}`, error);
    }

    // 2. Update preorder status to indicate abandonment
    await db.update(preordersSchema)
      .set({
        status: 'cancelled',
        cancellationReason: 'payment_abandoned',
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(preordersSchema.id, preorderId));

    console.error(`[AbandonedCart] ✅ Preorder marked as abandoned: ${preorderId}`);
  } catch (error) {
    console.error(`[AbandonedCart] ❌ Abandoned cart marketing failed: ${preorderId}`, error);
  }
}

/**
 * Get preorder information by preorder ID
 */
export async function getPreorderById(preorderId: string) {
  try {
    const db = await getDB();
    const preorder = await db.query.preordersSchema.findFirst({
      where: eq(preordersSchema.id, preorderId),
    });

    return { success: true, preorder };
  } catch (error) {
    console.error('[PreorderQuery] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve preorder information',
    };
  }
}

/**
 * Update preorder status
 */
export async function updatePreorderStatus(
  preorderId: string,
  status: 'initiated' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled',
  additionalData?: Partial<{
    sessionId: string;
    paymentIntentId: string;
    amount: string;
    currency: string;
    shippingAddress: any;
  }>,
) {
  try {
    const db = await getDB();
    await db.update(preordersSchema)
      .set({
        status,
        ...additionalData,
        updatedAt: new Date(),
      })
      .where(eq(preordersSchema.id, preorderId));

    console.error(`[PreorderUpdate] Status updated to ${status} for ${preorderId}`);
    return { success: true };
  } catch (error) {
    console.error('[PreorderUpdate] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update preorder status',
    };
  }
}
