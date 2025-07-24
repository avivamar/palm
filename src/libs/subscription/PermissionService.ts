/**
 * Subscription Permission Service - 订阅权限检查服务
 * 负责AI功能权限控制和使用量限制
 * Following CLAUDE.md: "商业价值优先，技术服务业务" - 核心业务逻辑
 */

import { and, eq, gte, lte } from 'drizzle-orm';
import { getDB } from '@/libs/DB';
import { subscriptionUsageSchema, usersSchema } from '@/models/Schema';

export type FeatureId
  = | 'ai_chat_basic'
    | 'ai_chat_advanced'
    | 'ai_image_generation'
    | 'ai_voice_synthesis'
    | 'premium_models'
    | 'priority_support';

export type ResourceType = 'chat_messages' | 'ai_calls' | 'api_requests' | 'storage_mb';

export type UsageCheckResult = {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: Date | null;
  planName: string;
};

export class SubscriptionPermissionService {
  /**
   * 检查用户是否有权限访问特定功能
   */
  async checkFeatureAccess(userId: string, featureId: FeatureId): Promise<boolean> {
    try {
      const db = await getDB();
      const user = await db
        .select({
          subscriptionPlan: usersSchema.subscriptionPlan,
          subscriptionStatus: usersSchema.subscriptionStatus,
          subscriptionPeriodEnd: usersSchema.subscriptionPeriodEnd,
        })
        .from(usersSchema)
        .where(eq(usersSchema.id, userId))
        .limit(1);

      if (user.length === 0) {
        return false; // 用户不存在
      }

      const userPlan = user[0];

      // 检查订阅是否有效
      if (userPlan.subscriptionStatus !== 'active' && userPlan.subscriptionStatus !== 'trialing') {
        return false;
      }

      // 检查订阅是否过期
      if (userPlan.subscriptionPeriodEnd && userPlan.subscriptionPeriodEnd < new Date()) {
        return false;
      }

      // 根据计划检查功能权限
      return this.hasFeatureAccess(userPlan.subscriptionPlan, featureId);
    } catch (error) {
      console.error('Failed to check feature access:', error);
      return false; // 出错时拒绝访问
    }
  }

  /**
   * 检查使用量限制
   */
  async checkUsageLimit(userId: string, resourceType: ResourceType): Promise<UsageCheckResult> {
    try {
      const db = await getDB();
      const user = await db
        .select({
          subscriptionPlan: usersSchema.subscriptionPlan,
          subscriptionStatus: usersSchema.subscriptionStatus,
        })
        .from(usersSchema)
        .where(eq(usersSchema.id, userId))
        .limit(1);

      if (user.length === 0) {
        return {
          allowed: false,
          remaining: 0,
          limit: 0,
          resetAt: null,
          planName: 'unknown',
        };
      }

      const userPlan = user[0];
      const now = new Date();

      // 获取当前周期的使用量记录
      const usage = await db
        .select()
        .from(subscriptionUsageSchema)
        .where(
          and(
            eq(subscriptionUsageSchema.userId, userId),
            eq(subscriptionUsageSchema.resourceType, resourceType),
            lte(subscriptionUsageSchema.periodStart, now),
            gte(subscriptionUsageSchema.periodEnd, now),
          ),
        )
        .limit(1);

      if (usage.length === 0) {
        // 没有使用量记录，初始化一个
        await this.initializeUsageRecord(userId, resourceType, userPlan.subscriptionPlan);

        const planLimits = this.getPlanLimits(userPlan.subscriptionPlan);
        const limit = planLimits[resourceType] || 0;

        return {
          allowed: limit > 0 || limit === -1, // -1 表示无限制
          remaining: limit === -1 ? -1 : limit,
          limit,
          resetAt: this.getNextResetDate(),
          planName: userPlan.subscriptionPlan,
        };
      }

      const currentUsage = usage[0];
      const limit = currentUsage.limitCount;
      const used = currentUsage.usageCount;
      const remaining = limit === -1 ? -1 : Math.max(0, limit - used);

      return {
        allowed: limit === -1 || used < limit,
        remaining,
        limit,
        resetAt: currentUsage.resetAt,
        planName: userPlan.subscriptionPlan,
      };
    } catch (error) {
      console.error('Failed to check usage limit:', error);
      return {
        allowed: false,
        remaining: 0,
        limit: 0,
        resetAt: null,
        planName: 'error',
      };
    }
  }

  /**
   * 增加使用量
   */
  async incrementUsage(userId: string, resourceType: ResourceType, amount: number = 1): Promise<boolean> {
    try {
      const usageCheck = await this.checkUsageLimit(userId, resourceType);

      if (!usageCheck.allowed) {
        return false; // 已达到限制
      }

      const now = new Date();

      // 更新使用量
      const db = await getDB();
      await db
        .update(subscriptionUsageSchema)
        .set({
          usageCount: usageCheck.limit === -1
            ? amount
            : Math.min(usageCheck.limit, (usageCheck.limit - usageCheck.remaining) + amount),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(subscriptionUsageSchema.userId, userId),
            eq(subscriptionUsageSchema.resourceType, resourceType),
            lte(subscriptionUsageSchema.periodStart, now),
            gte(subscriptionUsageSchema.periodEnd, now),
          ),
        );

      return true;
    } catch (error) {
      console.error('Failed to increment usage:', error);
      return false;
    }
  }

  /**
   * 获取用户使用量统计
   */
  async getUserUsageStats(userId: string): Promise<Record<ResourceType, UsageCheckResult>> {
    const resourceTypes: ResourceType[] = ['chat_messages', 'ai_calls', 'api_requests', 'storage_mb'];
    const stats: Record<string, UsageCheckResult> = {};

    for (const resourceType of resourceTypes) {
      stats[resourceType] = await this.checkUsageLimit(userId, resourceType);
    }

    return stats as Record<ResourceType, UsageCheckResult>;
  }

  /**
   * 重置月度使用量（定时任务调用）
   */
  async resetMonthlyUsage(userId: string): Promise<void> {
    try {
      const db = await getDB();
      const user = await db
        .select({
          subscriptionPlan: usersSchema.subscriptionPlan,
        })
        .from(usersSchema)
        .where(eq(usersSchema.id, userId))
        .limit(1);

      if (user.length === 0) {
        return;
      }

      const planLimits = this.getPlanLimits(user[0].subscriptionPlan);
      const now = new Date();
      const nextMonth = this.getNextResetDate();

      // 重置所有资源的使用量
      for (const [resourceType, limitCount] of Object.entries(planLimits)) {
        await db
          .update(subscriptionUsageSchema)
          .set({
            usageCount: 0,
            limitCount,
            periodStart: now,
            periodEnd: nextMonth,
            resetAt: nextMonth,
            updatedAt: now,
          })
          .where(
            and(
              eq(subscriptionUsageSchema.userId, userId),
              eq(subscriptionUsageSchema.resourceType, resourceType as ResourceType),
            ),
          );
      }
    } catch (error) {
      console.error('Failed to reset monthly usage:', error);
      throw error;
    }
  }

  /**
   * 检查计划是否有特定功能权限
   */
  private hasFeatureAccess(plan: string, featureId: FeatureId): boolean {
    const featureMatrix = {
      free: ['ai_chat_basic'],
      basic: ['ai_chat_basic', 'ai_chat_advanced'],
      pro: ['ai_chat_basic', 'ai_chat_advanced', 'ai_image_generation', 'ai_voice_synthesis'],
      premium: ['ai_chat_basic', 'ai_chat_advanced', 'ai_image_generation', 'ai_voice_synthesis', 'premium_models', 'priority_support'],
    };

    const planFeatures = featureMatrix[plan as keyof typeof featureMatrix] || [];
    return planFeatures.includes(featureId);
  }

  /**
   * 获取计划使用限制
   */
  private getPlanLimits(plan: string): Record<ResourceType, number> {
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

    return limits[plan as keyof typeof limits] || limits.free;
  }

  /**
   * 初始化使用量记录
   */
  private async initializeUsageRecord(userId: string, resourceType: ResourceType, plan: string): Promise<void> {
    const limits = this.getPlanLimits(plan);
    const now = new Date();
    const nextMonth = this.getNextResetDate();

    const db = await getDB();
    await db.insert(subscriptionUsageSchema).values({
      userId,
      subscriptionId: null, // 可以为空
      resourceType,
      usageCount: 0,
      limitCount: limits[resourceType],
      periodStart: now,
      periodEnd: nextMonth,
      resetAt: nextMonth,
    }).onConflictDoNothing();
  }

  /**
   * 获取下次重置日期（下个月第一天）
   */
  private getNextResetDate(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }
}
