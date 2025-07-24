/**
 * Dashboard Stats API Route
 * Following CLAUDE.md: 商业价值优先，TypeScript严格模式
 */

import type { NextRequest } from 'next/server';
import { and, eq, gte, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { cacheDbQuery, cacheUserSession, getCachedUserSession } from '@/libs/cache-manager';
import { getDB } from '@/libs/DB';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';
import { preordersSchema } from '@/models/Schema';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    // 添加响应缓存头
    const headers = new Headers();
    headers.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=300');

    // Verify user authentication
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: 'Authentication service not available' },
        { status: 503, headers },
      );
    }

    const supabase = await createServerClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
    }

    const userEmail = session.user.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400, headers });
    }

    // Check cache for user session data
    const userId = session.user.id;
    const cachedUserData = await getCachedUserSession(userId);

    if (!cachedUserData) {
      // Cache user session data for faster access
      await cacheUserSession(userId, {
        email: userEmail,
        id: userId,
        created_at: session.user.created_at,
        last_sign_in_at: session.user.last_sign_in_at,
        user_metadata: session.user.user_metadata,
        email_confirmed_at: session.user.email_confirmed_at,
        phone: session.user.phone,
      });
    }

    // Cache key for user stats
    const userStatsCacheKey = `user_stats:${userEmail}`;

    const userStats = await cacheDbQuery(
      userStatsCacheKey,
      async () => {
        const db = await getDB();

        // Calculate time ranges
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Execute parallel queries for user-specific data
        const [
          userOrdersResult,
          userRecentActivityResult,
          userNotificationsResult,
        ] = await Promise.all([
          // User orders statistics
          db.select({
            total: sql<number>`count(*)`,
            completed: sql<number>`count(case when ${preordersSchema.status} = 'completed' then 1 end)`,
            processing: sql<number>`count(case when ${preordersSchema.status} = 'processing' then 1 end)`,
            cancelled: sql<number>`count(case when ${preordersSchema.status} = 'cancelled' then 1 end)`,
            totalSpent: sql<number>`sum(case when ${preordersSchema.status} = 'completed' then ${preordersSchema.amount} else 0 end)`,
          }).from(preordersSchema).where(eq(preordersSchema.email, userEmail)),

          // Recent user activity (last 30 days)
          db.select({
            id: preordersSchema.id,
            email: preordersSchema.email,
            status: preordersSchema.status,
            amount: preordersSchema.amount,
            color: preordersSchema.color,
            createdAt: preordersSchema.createdAt,
            updatedAt: preordersSchema.updatedAt,
          }).from(preordersSchema).where(and(
            eq(preordersSchema.email, userEmail),
            gte(preordersSchema.createdAt, thirtyDaysAgo),
          )).orderBy(sql`${preordersSchema.createdAt} DESC`).limit(10),

          // User notifications count (mock for now, can be replaced with real notification system)
          db.select({
            total: sql<number>`count(*)`,
            recent: sql<number>`count(case when ${preordersSchema.createdAt} >= ${thirtyDaysAgo} then 1 end)`,
          }).from(preordersSchema).where(eq(preordersSchema.email, userEmail)),
        ]);

        // Process results
        const orderStats = userOrdersResult[0] || {
          total: 0,
          completed: 0,
          processing: 0,
          cancelled: 0,
          totalSpent: 0,
        };

        const recentActivity = userRecentActivityResult || [];
        const notificationStats = userNotificationsResult[0] || { total: 0, recent: 0 };

        // Calculate activity level based on orders and engagement
        const calculateActivityLevel = (orderCount: number, totalSpent: number) => {
          if (orderCount === 0) {
            return 'New User';
          }
          if (orderCount >= 5 && totalSpent >= 1000) {
            return 'VIP Customer';
          }
          if (orderCount >= 3 || totalSpent >= 500) {
            return 'Active User';
          }
          return 'Regular User';
        };

        // Calculate activity points
        const calculateActivityPoints = (orderCount: number, totalSpent: number) => {
          return Math.floor(orderCount * 50 + (totalSpent / 10));
        };

        const activityLevel = calculateActivityLevel(orderStats.total, Number(orderStats.totalSpent) || 0);
        const activityPoints = calculateActivityPoints(orderStats.total, Number(orderStats.totalSpent) || 0);

        // Generate recent activity from real data
        const recentActivityFormatted = recentActivity.map((order: any) => ({
          id: `activity_${order.id}`,
          type: order.status === 'completed' ? 'order_completed' : 'order_placed',
          description: order.status === 'completed'
            ? `Order #${order.id} completed - ${order.color} AI Companion`
            : `Order #${order.id} placed - ${order.color} AI Companion`,
          timestamp: order.createdAt?.toISOString() || new Date().toISOString(),
          metadata: {
            orderNumber: order.id,
            amount: Number(order.amount) || 0,
            color: order.color,
            status: order.status,
          },
        }));

        // Add account creation activity
        recentActivityFormatted.push({
          id: 'activity_account_created',
          type: 'account_created',
          description: 'Account created',
          timestamp: session.user.created_at,
          metadata: {},
        });

        // Real user statistics
        return {
          orders: {
            total: orderStats.total,
            completed: orderStats.completed,
            processing: orderStats.processing,
            cancelled: orderStats.cancelled,
            totalSpent: Number(orderStats.totalSpent) || 0,
            currency: 'USD',
          },
          favorites: {
            total: 0, // TODO: Implement favorites system
            categories: ['AI Companions'], // TODO: Calculate from real data
          },
          account: {
            joinDate: session.user.user_metadata?.created_at || session.user.created_at,
            lastLogin: session.user.last_sign_in_at,
            emailVerified: session.user.email_confirmed_at !== null,
            profileCompleted: calculateProfileCompletion(session.user),
          },
          notifications: {
            unread: notificationStats.recent,
            total: notificationStats.total,
          },
          activity: {
            level: activityLevel,
            points: activityPoints,
            nextLevelPoints: activityPoints < 500 ? 500 : activityPoints < 1000 ? 1000 : activityPoints < 2000 ? 2000 : activityPoints + 500,
          },
          recentActivity: recentActivityFormatted.slice(0, 10), // Limit to 10 recent activities
        };
      },
      300, // 5 minutes cache for user stats
    );

    return NextResponse.json(userStats, { headers });
  } catch (error) {
    console.error('Dashboard stats API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch dashboard stats',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// 计算用户资料完成度的辅助函数
function calculateProfileCompletion(user: any): number {
  let completionScore = 0;
  const totalFields = 5;

  // 邮箱验证
  if (user.email_confirmed_at) {
    completionScore += 1;
  }

  // 显示名称
  if (user.user_metadata?.display_name || user.user_metadata?.full_name) {
    completionScore += 1;
  }

  // 头像
  if (user.user_metadata?.avatar_url) {
    completionScore += 1;
  }

  // 电话号码
  if (user.phone) {
    completionScore += 1;
  }

  // 基础信息完整
  if (user.email && user.created_at) {
    completionScore += 1;
  }

  return Math.round((completionScore / totalFields) * 100);
}
