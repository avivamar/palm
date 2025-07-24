/**
 * Usage Tracking Service - 使用量追踪服务
 * 负责AI伴侣使用量的精确追踪和分析
 * Following CLAUDE.md: "商业价值优先，技术服务业务"
 */

import type { ResourceType } from './PermissionService';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { getDB } from '@/libs/DB';
import { subscriptionUsageSchema, usersSchema } from '@/models/Schema';

export type UsageAnalytics = {
  userId: string;
  totalUsage: Record<ResourceType, number>;
  monthlyTrend: Array<{
    month: string;
    usage: Record<ResourceType, number>;
  }>;
  planEfficiency: {
    utilizationRate: number; // 使用率百分比
    recommendedPlan?: 'basic' | 'pro' | 'premium';
  };
};

export type DailyUsage = {
  date: string;
  resourceType: ResourceType;
  count: number;
};

export class UsageTrackingService {
  /**
   * 获取用户当前使用量
   */
  async getCurrentUsage(userId: string, resourceType: ResourceType): Promise<{
    current: number;
    limit: number;
    percentage: number;
    resetAt: Date | null;
  }> {
    try {
      const now = new Date();
      const db = await getDB();

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
        return {
          current: 0,
          limit: 0,
          percentage: 0,
          resetAt: null,
        };
      }

      const record = usage[0];
      const percentage = record.limitCount === -1
        ? 0
        : Math.round((record.usageCount / record.limitCount) * 100);

      return {
        current: record.usageCount,
        limit: record.limitCount,
        percentage,
        resetAt: record.resetAt,
      };
    } catch (error) {
      console.error('Failed to get current usage:', error);
      return {
        current: 0,
        limit: 0,
        percentage: 0,
        resetAt: null,
      };
    }
  }

  /**
   * 批量记录使用量（用于批处理场景）
   */
  async batchIncrementUsage(entries: Array<{
    userId: string;
    resourceType: ResourceType;
    amount: number;
    timestamp?: Date;
  }>): Promise<void> {
    try {
      const now = new Date();

      const db = await getDB();
      for (const entry of entries) {
        await db
          .update(subscriptionUsageSchema)
          .set({
            usageCount: sql`${subscriptionUsageSchema.usageCount} + ${entry.amount}`,
            updatedAt: entry.timestamp || now,
          })
          .where(
            and(
              eq(subscriptionUsageSchema.userId, entry.userId),
              eq(subscriptionUsageSchema.resourceType, entry.resourceType),
              lte(subscriptionUsageSchema.periodStart, now),
              gte(subscriptionUsageSchema.periodEnd, now),
            ),
          );
      }
    } catch (error) {
      console.error('Failed to batch increment usage:', error);
      throw error;
    }
  }

  /**
   * 获取用户使用量分析
   */
  async getUsageAnalytics(userId: string, monthsBack: number = 6): Promise<UsageAnalytics> {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - monthsBack);

      // 获取用户信息
      const db = await getDB();
      const user = await db
        .select({
          subscriptionPlan: usersSchema.subscriptionPlan,
        })
        .from(usersSchema)
        .where(eq(usersSchema.id, userId))
        .limit(1);

      if (user.length === 0) {
        throw new Error('User not found');
      }

      // 获取历史使用数据
      const usageHistory = await db
        .select()
        .from(subscriptionUsageSchema)
        .where(
          and(
            eq(subscriptionUsageSchema.userId, userId),
            gte(subscriptionUsageSchema.periodStart, startDate),
          ),
        )
        .orderBy(desc(subscriptionUsageSchema.periodStart));

      // 计算总使用量
      const totalUsage: Record<string, number> = {};
      const monthlyData: Record<string, Record<string, number>> = {};

      usageHistory.forEach((record: any) => {
        const resourceType = record.resourceType;
        const monthKey = record.periodStart.toISOString().slice(0, 7); // YYYY-MM

        // 累计总使用量
        totalUsage[resourceType] = (totalUsage[resourceType] || 0) + record.usageCount;

        // 按月统计
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {};
        }
        monthlyData[monthKey][resourceType] = record.usageCount;
      });

      // 构建月度趋势
      const monthlyTrend = Object.entries(monthlyData)
        .map(([month, usage]) => ({ month, usage: usage as Record<ResourceType, number> }))
        .sort((a, b) => a.month.localeCompare(b.month));

      // 计算计划效率
      const planEfficiency = this.calculatePlanEfficiency(
        user[0].subscriptionPlan,
        totalUsage as Record<ResourceType, number>,
      );

      return {
        userId,
        totalUsage: totalUsage as Record<ResourceType, number>,
        monthlyTrend,
        planEfficiency,
      };
    } catch (error) {
      console.error('Failed to get usage analytics:', error);
      throw error;
    }
  }

  /**
   * 获取每日使用量（用于图表展示）
   */
  async getDailyUsage(userId: string, days: number = 30): Promise<DailyUsage[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // 由于我们的数据是按月周期存储的，这里需要一些额外的逻辑
      // 实际实现中可能需要一个更细粒度的日志表
      const db = await getDB();
      const usage = await db
        .select()
        .from(subscriptionUsageSchema)
        .where(
          and(
            eq(subscriptionUsageSchema.userId, userId),
            gte(subscriptionUsageSchema.periodStart, startDate),
          ),
        );

      // 简化实现：将月度数据平均分配到每天
      const dailyUsage: DailyUsage[] = [];

      usage.forEach((record: any) => {
        const daysInPeriod = Math.ceil(
          (record.periodEnd.getTime() - record.periodStart.getTime()) / (1000 * 60 * 60 * 24),
        );
        const dailyAverage = Math.floor(record.usageCount / daysInPeriod);

        for (let i = 0; i < Math.min(daysInPeriod, days); i++) {
          const date = new Date(record.periodStart);
          date.setDate(date.getDate() + i);

          if (date >= startDate && date <= endDate) {
            dailyUsage.push({
              date: date.toISOString().slice(0, 10), // YYYY-MM-DD
              resourceType: record.resourceType,
              count: dailyAverage,
            });
          }
        }
      });

      return dailyUsage.sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Failed to get daily usage:', error);
      return [];
    }
  }

  /**
   * 重置指定用户的月度使用量
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
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

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

      console.log(`Reset monthly usage for user ${userId}`);
    } catch (error) {
      console.error('Failed to reset monthly usage:', error);
      throw error;
    }
  }

  /**
   * 获取系统级使用量统计（管理员功能）
   */
  async getSystemUsageStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    usageByPlan: Record<string, Record<ResourceType, number>>;
    topUsers: Array<{
      userId: string;
      plan: string;
      totalChatMessages: number;
    }>;
  }> {
    try {
      const db = await getDB();
      // 获取总用户数和活跃用户数
      const userStats = await db
        .select({
          total: sql<number>`count(*)`,
          active: sql<number>`count(*) filter (where ${usersSchema.subscriptionStatus} = 'active')`,
        })
        .from(usersSchema);

      // 按计划统计使用量
      const usageByPlan = await db
        .select({
          plan: usersSchema.subscriptionPlan,
          resourceType: subscriptionUsageSchema.resourceType,
          totalUsage: sql<number>`sum(${subscriptionUsageSchema.usageCount})`,
        })
        .from(subscriptionUsageSchema)
        .leftJoin(usersSchema, eq(subscriptionUsageSchema.userId, usersSchema.id))
        .groupBy(usersSchema.subscriptionPlan, subscriptionUsageSchema.resourceType);

      // 获取使用量最高的用户
      const topUsers = await db
        .select({
          userId: subscriptionUsageSchema.userId,
          plan: usersSchema.subscriptionPlan,
          totalChatMessages: sql<number>`sum(case when ${subscriptionUsageSchema.resourceType} = 'chat_messages' then ${subscriptionUsageSchema.usageCount} else 0 end)`,
        })
        .from(subscriptionUsageSchema)
        .leftJoin(usersSchema, eq(subscriptionUsageSchema.userId, usersSchema.id))
        .groupBy(subscriptionUsageSchema.userId, usersSchema.subscriptionPlan)
        .orderBy(sql`sum(case when ${subscriptionUsageSchema.resourceType} = 'chat_messages' then ${subscriptionUsageSchema.usageCount} else 0 end) desc`)
        .limit(10);

      // 组织数据
      const planUsage: Record<string, Record<ResourceType, number>> = {};
      usageByPlan.forEach((row: any) => {
        const planKey = row.plan;
        if (!planUsage[planKey]) {
          planUsage[planKey] = { chat_messages: 0, ai_calls: 0, api_requests: 0, storage_mb: 0 };
        }
        planUsage[planKey]![row.resourceType as ResourceType] = row.totalUsage;
      });

      return {
        totalUsers: userStats[0]?.total || 0,
        activeUsers: userStats[0]?.active || 0,
        usageByPlan: planUsage,
        topUsers: topUsers.map((user: any) => ({
          userId: user.userId,
          plan: user.plan,
          totalChatMessages: user.totalChatMessages,
        })),
      };
    } catch (error) {
      console.error('Failed to get system usage stats:', error);
      throw error;
    }
  }

  /**
   * 计算计划效率
   */
  private calculatePlanEfficiency(
    currentPlan: string,
    totalUsage: Record<ResourceType, number>,
  ): { utilizationRate: number; recommendedPlan?: 'basic' | 'pro' | 'premium' } {
    const planLimits = this.getPlanLimits(currentPlan);

    // 计算主要资源的使用率
    const chatUsageRate = planLimits.chat_messages === -1
      ? 50 // 无限制计划假设50%使用率
      : (totalUsage.chat_messages || 0) / planLimits.chat_messages;

    const utilizationRate = Math.round(chatUsageRate * 100);

    // 推荐计划逻辑
    let recommendedPlan: 'basic' | 'pro' | 'premium' | undefined;
    if (utilizationRate > 90) {
      // 使用率过高，推荐升级
      if (currentPlan === 'free') {
        recommendedPlan = 'basic';
      } else if (currentPlan === 'basic') {
        recommendedPlan = 'pro';
      } else if (currentPlan === 'pro') {
        recommendedPlan = 'premium';
      }
    } else if (utilizationRate < 30 && currentPlan !== 'free') {
      // 使用率过低，可能可以降级（但不推荐到免费版）
      if (currentPlan === 'premium') {
        recommendedPlan = 'pro';
      } else if (currentPlan === 'pro') {
        recommendedPlan = 'basic';
      }
    }

    return {
      utilizationRate,
      recommendedPlan,
    };
  }

  /**
   * 获取计划限制
   */
  private getPlanLimits(plan: string): Record<ResourceType, number> {
    const limits = {
      free: { chat_messages: 10, ai_calls: 5, api_requests: 100, storage_mb: 100 },
      basic: { chat_messages: 100, ai_calls: 50, api_requests: 1000, storage_mb: 1000 },
      pro: { chat_messages: 1000, ai_calls: 500, api_requests: 10000, storage_mb: 5000 },
      premium: { chat_messages: -1, ai_calls: -1, api_requests: -1, storage_mb: 10000 },
    };

    return limits[plan as keyof typeof limits] || limits.free;
  }
}
