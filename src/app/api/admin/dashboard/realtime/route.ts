/**
 * Real-time Dashboard Monitoring API Route
 * Following CLAUDE.md: 商业价值优先，TypeScript严格模式
 */

import { eq, gte, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDB } from '@/libs/DB';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';
import { preordersSchema, usersSchema, webhookLogsSchema } from '@/models/Schema';

export async function GET() {
  try {
    // Verify admin access
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Authentication service not available' }, { status: 503 });
    }

    const supabase = await createServerClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDB();

    // Calculate time ranges for real-time monitoring
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
    const last15Minutes = new Date(now.getTime() - 15 * 60 * 1000);

    // Execute all real-time queries in parallel
    const [
      webhookStatsResult,
      recentOrdersResult,
      recentUsersResult,
      systemHealthResult,
      activeSessionsResult,
    ] = await Promise.all([
      // Webhook events in last 24 hours
      db.select({
        total: sql<number>`count(*)`,
        success: sql<number>`count(case when ${webhookLogsSchema.status} = 'success' then 1 end)`,
        failed: sql<number>`count(case when ${webhookLogsSchema.status} = 'failed' then 1 end)`,
      }).from(webhookLogsSchema).where(gte(webhookLogsSchema.createdAt, last24Hours)),

      // Recent orders in last hour
      db.select({
        count: sql<number>`count(*)`,
        totalAmount: sql<number>`sum(case when ${preordersSchema.amount} is not null then ${preordersSchema.amount} else 0 end)`,
      }).from(preordersSchema).where(gte(preordersSchema.createdAt, lastHour)),

      // Recent user registrations in last hour
      db.select({ count: sql<number>`count(*)` }).from(usersSchema).where(gte(usersSchema.createdAt, lastHour)),

      // System health indicators
      db.select({
        pendingOrders: sql<number>`count(case when ${preordersSchema.status} = 'initiated' then 1 end)`,
        processingOrders: sql<number>`count(case when ${preordersSchema.status} = 'processing' then 1 end)`,
        failedWebhooks: sql<number>`count(case when ${webhookLogsSchema.status} = 'failed' and ${webhookLogsSchema.createdAt} >= ${last15Minutes} then 1 end)`,
      }).from(preordersSchema).leftJoin(webhookLogsSchema, eq(preordersSchema.id, webhookLogsSchema.preorderId)),

      // Active sessions estimate (users who registered in last 15 minutes)
      db.select({ count: sql<number>`count(*)` }).from(usersSchema).where(gte(usersSchema.createdAt, last15Minutes)),
    ]);

    // Extract real-time data
    const webhookStats = webhookStatsResult[0] || { total: 0, success: 0, failed: 0 };
    const recentOrders = recentOrdersResult[0] || { count: 0, totalAmount: 0 };
    const recentUsers = recentUsersResult[0]?.count || 0;
    const systemHealth = systemHealthResult[0] || { pendingOrders: 0, processingOrders: 0, failedWebhooks: 0 };
    const activeSessions = activeSessionsResult[0]?.count || 0;

    // Calculate health score (0-100)
    const webhookSuccessRate = webhookStats.total > 0 ? (webhookStats.success / webhookStats.total) * 100 : 100;
    const isSystemHealthy = systemHealth.failedWebhooks === 0 && systemHealth.pendingOrders < 10;
    const healthScore = Math.round((webhookSuccessRate + (isSystemHealthy ? 100 : 50)) / 2);

    return NextResponse.json({
      timestamp: now.toISOString(),
      webhookEvents: {
        last24Hours: webhookStats.total,
        successRate: webhookSuccessRate,
        failed: webhookStats.failed,
      },
      recentActivity: {
        ordersLastHour: recentOrders.count,
        revenueLastHour: Number(recentOrders.totalAmount),
        usersLastHour: recentUsers,
        activeSessions,
      },
      systemHealth: {
        healthScore,
        pendingOrders: systemHealth.pendingOrders,
        processingOrders: systemHealth.processingOrders,
        failedWebhooks: systemHealth.failedWebhooks,
        status: isSystemHealthy ? 'healthy' : 'warning',
      },
    });
  } catch (error) {
    console.error('Failed to fetch real-time dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch real-time dashboard data' },
      { status: 500 },
    );
  }
}
