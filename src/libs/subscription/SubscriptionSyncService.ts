/**
 * Subscription Sync Service - 订阅状态同步服务
 * 负责Stripe订阅数据与本地数据库的同步
 * Following CLAUDE.md: "商业价值优先，技术服务业务"
 */

import type Stripe from 'stripe';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { getDB } from '@/libs/DB';
import { subscriptionsSchema, subscriptionUsageSchema, usersSchema } from '@/models/Schema';

export class SubscriptionSyncService {
  /**
   * 从Stripe同步订阅数据到本地数据库
   */
  async syncFromStripe(stripeSubscriptionId: string): Promise<void> {
    try {
      // 这里应该调用Stripe API获取订阅详情
      // 由于我们已有SubscriptionService，这里只处理数据库同步逻辑
      console.warn(`Syncing subscription ${stripeSubscriptionId} from Stripe`);

      // 实际实现中会调用Stripe API
      // const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      // await this.syncSubscriptionToDatabase(subscription);
    } catch (error) {
      console.error('Failed to sync from Stripe:', error);
      throw error;
    }
  }

  /**
   * 同步Stripe订阅对象到本地数据库
   */
  async syncSubscriptionToDatabase(stripeSubscription: Stripe.Subscription): Promise<string> {
    try {
      const subscriptionId = nanoid();
      const customerId = typeof stripeSubscription.customer === 'string'
        ? stripeSubscription.customer
        : stripeSubscription.customer.id;

      // 查找或创建用户
      const user = await this.findOrCreateUserByStripeCustomerId(customerId);

      // 解析计划ID
      const planId = this.mapStripePriceToPlan(stripeSubscription.items.data[0]?.price.id || '');

      // 插入或更新订阅记录
      const db = await getDB();
      await db.insert(subscriptionsSchema).values({
        id: subscriptionId,
        userId: user.id,
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: customerId,
        stripePriceId: stripeSubscription.items.data[0]?.price.id || '',
        planId: planId as any,
        status: stripeSubscription.status as any,
        currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
        cancelAtPeriodEnd: (stripeSubscription as any).cancel_at_period_end || false,
        canceledAt: (stripeSubscription as any).canceled_at ? new Date((stripeSubscription as any).canceled_at * 1000) : null,
        trialStart: (stripeSubscription as any).trial_start ? new Date((stripeSubscription as any).trial_start * 1000) : null,
        trialEnd: (stripeSubscription as any).trial_end ? new Date((stripeSubscription as any).trial_end * 1000) : null,
        metadata: stripeSubscription.metadata || {},
      }).onConflictDoUpdate({
        target: subscriptionsSchema.stripeSubscriptionId,
        set: {
          status: stripeSubscription.status as any,
          currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
          currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
          cancelAtPeriodEnd: (stripeSubscription as any).cancel_at_period_end || false,
          canceledAt: (stripeSubscription as any).canceled_at ? new Date((stripeSubscription as any).canceled_at * 1000) : null,
          stripePriceId: stripeSubscription.items.data[0]?.price.id || '',
          planId: this.mapStripePriceToPlan(stripeSubscription.items.data[0]?.price.id || '') as any,
          updatedAt: new Date(),
        },
      });

      // 更新用户订阅状态
      await this.updateUserSubscriptionStatus(user.id);

      // 初始化使用量记录
      await this.initializeUsageLimits(user.id, subscriptionId, planId as any);

      return subscriptionId;
    } catch (error) {
      console.error('Failed to sync subscription to database:', error);
      throw error;
    }
  }

  /**
   * 更新用户订阅状态（用于快速权限检查）
   */
  async updateUserSubscriptionStatus(userId: string): Promise<void> {
    try {
      const db = await getDB();
      // 获取用户的活跃订阅
      const activeSubscription = await db
        .select()
        .from(subscriptionsSchema)
        .where(
          and(
            eq(subscriptionsSchema.userId, userId),
            eq(subscriptionsSchema.status, 'active'),
          ),
        )
        .limit(1);

      if (activeSubscription.length > 0) {
        const sub = activeSubscription[0];
        await db
          .update(usersSchema)
          .set({
            subscriptionStatus: sub.status as any,
            subscriptionPlan: sub.planId,
            subscriptionPeriodEnd: sub.currentPeriodEnd,
            updatedAt: new Date(),
          })
          .where(eq(usersSchema.id, userId));
      } else {
        // 没有活跃订阅，重置为免费计划
        await db
          .update(usersSchema)
          .set({
            subscriptionStatus: 'active' as any,
            subscriptionPlan: 'free',
            subscriptionPeriodEnd: null,
            updatedAt: new Date(),
          })
          .where(eq(usersSchema.id, userId));
      }
    } catch (error) {
      console.error('Failed to update user subscription status:', error);
      throw error;
    }
  }

  /**
   * 处理订阅事件（Webhook调用）
   */
  async handleSubscriptionEvent(event: Stripe.Event): Promise<void> {
    try {
      const subscription = event.data.object as Stripe.Subscription;

      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.syncSubscriptionToDatabase(subscription);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(subscription);
          break;

        case 'customer.subscription.trial_will_end':
          await this.handleTrialWillEnd(subscription);
          break;

        default:
          console.warn(`Unhandled subscription event: ${event.type}`);
      }
    } catch (error) {
      console.error(`Failed to handle subscription event ${event.type}:`, error);
      throw error;
    }
  }

  /**
   * 查找或创建用户（基于Stripe Customer ID）
   */
  private async findOrCreateUserByStripeCustomerId(stripeCustomerId: string): Promise<typeof usersSchema.$inferSelect> {
    const db = await getDB();
    // 首先尝试通过Stripe Customer ID查找
    const existingUser = await db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.stripeCustomerId, stripeCustomerId))
      .limit(1);

    if (existingUser.length > 0) {
      return existingUser[0];
    }

    // 如果没找到，需要从Stripe获取客户信息并创建用户
    // 这里暂时返回一个占位符，实际实现需要调用Stripe API
    throw new Error(`User not found for Stripe customer ${stripeCustomerId}. Please ensure user exists.`);
  }

  /**
   * 映射Stripe Price ID到本地计划ID
   */
  private mapStripePriceToPlan(stripePriceId: string): 'free' | 'basic' | 'pro' | 'premium' {
    // 根据环境变量映射价格ID到计划
    if (stripePriceId === process.env.STRIPE_PRICE_ID_BASIC_MONTHLY
      || stripePriceId === process.env.STRIPE_PRICE_ID_BASIC_YEARLY) {
      return 'basic';
    }
    if (stripePriceId === process.env.STRIPE_PRICE_ID_PRO_MONTHLY
      || stripePriceId === process.env.STRIPE_PRICE_ID_PRO_YEARLY) {
      return 'pro';
    }
    if (stripePriceId === process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY
      || stripePriceId === process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY) {
      return 'premium';
    }
    return 'free';
  }

  /**
   * 初始化使用量限制
   */
  private async initializeUsageLimits(
    userId: string,
    subscriptionId: string,
    planId: 'free' | 'basic' | 'pro' | 'premium',
  ): Promise<void> {
    const db = await getDB();
    const limits = this.getPlanLimits(planId);
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    for (const [resourceType, limitCount] of Object.entries(limits)) {
      await db.insert(subscriptionUsageSchema).values({
        userId,
        subscriptionId,
        resourceType: resourceType as any,
        usageCount: 0,
        limitCount,
        periodStart: now,
        periodEnd: nextMonth,
        resetAt: nextMonth,
      }).onConflictDoNothing();
    }
  }

  /**
   * 获取计划使用限制
   */
  private getPlanLimits(planId: 'free' | 'basic' | 'pro' | 'premium'): Record<string, number> {
    const limits = {
      free: {
        chat_messages: 10,
        ai_calls: 5,
        api_requests: 100,
        storage_mb: 100,
      },
      basic: {
        chat_messages: 100,
        ai_calls: 50,
        api_requests: 1000,
        storage_mb: 1000,
      },
      pro: {
        chat_messages: 1000,
        ai_calls: 500,
        api_requests: 10000,
        storage_mb: 5000,
      },
      premium: {
        chat_messages: -1, // Unlimited
        ai_calls: -1,
        api_requests: -1,
        storage_mb: 10000,
      },
    };

    return limits[planId];
  }

  /**
   * 处理订阅删除事件
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const db = await getDB();
    const customerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

    const user = await db
      .select()
      .from(usersSchema)
      .where(eq(usersSchema.stripeCustomerId, customerId))
      .limit(1);

    if (user.length > 0) {
      await this.updateUserSubscriptionStatus(user[0].id);
    }
  }

  /**
   * 处理试用期即将结束事件
   */
  private async handleTrialWillEnd(subscription: Stripe.Subscription): Promise<void> {
    // 可以在这里发送提醒邮件或执行其他业务逻辑
    console.warn(`Trial will end for subscription: ${subscription.id}`);
  }
}
