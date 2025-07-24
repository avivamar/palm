/**
 * Conversion Funnel Analysis API Route
 * Following CLAUDE.md: 商业价值优先，TypeScript严格模式
 */

import { and, eq, gte, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDB } from '@/libs/DB';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';
import { preordersSchema, usersSchema } from '@/models/Schema';

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

    // Calculate time ranges for funnel analysis
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Execute conversion funnel queries
    const [
      totalUsersResult,
      usersLast30DaysResult,
      usersLast7DaysResult,
      initiatedOrdersResult,
      completedOrdersResult,
      completedOrdersLast30DaysResult,
      completedOrdersLast7DaysResult,
      conversionByColorResult,
      averageOrderValueResult,
    ] = await Promise.all([
      // Total users (top of funnel)
      db.select({ count: sql<number>`count(*)` }).from(usersSchema),

      // Users last 30 days
      db.select({ count: sql<number>`count(*)` }).from(usersSchema).where(gte(usersSchema.createdAt, last30Days)),

      // Users last 7 days
      db.select({ count: sql<number>`count(*)` }).from(usersSchema).where(gte(usersSchema.createdAt, last7Days)),

      // Initiated orders (middle of funnel)
      db.select({ count: sql<number>`count(*)` }).from(preordersSchema),

      // Completed orders (bottom of funnel)
      db.select({ count: sql<number>`count(*)` }).from(preordersSchema).where(eq(preordersSchema.status, 'completed')),

      // Completed orders last 30 days
      db.select({ count: sql<number>`count(*)` }).from(preordersSchema).where(and(
        eq(preordersSchema.status, 'completed'),
        gte(preordersSchema.createdAt, last30Days),
      )),

      // Completed orders last 7 days
      db.select({ count: sql<number>`count(*)` }).from(preordersSchema).where(and(
        eq(preordersSchema.status, 'completed'),
        gte(preordersSchema.createdAt, last7Days),
      )),

      // Conversion by product color
      db.select({
        color: preordersSchema.color,
        initiated: sql<number>`count(*)`,
        completed: sql<number>`count(case when ${preordersSchema.status} = 'completed' then 1 end)`,
      }).from(preordersSchema).groupBy(preordersSchema.color),

      // Average order value
      db.select({
        avgOrderValue: sql<number>`avg(case when ${preordersSchema.status} = 'completed' then ${preordersSchema.amount} end)`,
        totalRevenue: sql<number>`sum(case when ${preordersSchema.status} = 'completed' then ${preordersSchema.amount} else 0 end)`,
      }).from(preordersSchema),
    ]);

    // Extract funnel data
    const totalUsers = totalUsersResult[0]?.count || 0;
    const usersLast30Days = usersLast30DaysResult[0]?.count || 0;
    const usersLast7Days = usersLast7DaysResult[0]?.count || 0;

    const initiatedOrders = initiatedOrdersResult[0]?.count || 0;

    const completedOrders = completedOrdersResult[0]?.count || 0;
    const completedOrdersLast30Days = completedOrdersLast30DaysResult[0]?.count || 0;
    const completedOrdersLast7Days = completedOrdersLast7DaysResult[0]?.count || 0;

    const avgOrderValue = Number(averageOrderValueResult[0]?.avgOrderValue) || 0;
    const totalRevenue = Number(averageOrderValueResult[0]?.totalRevenue) || 0;

    // Calculate conversion rates
    const overallConversionRate = totalUsers > 0 ? (completedOrders / totalUsers) * 100 : 0;
    const orderCompletionRate = initiatedOrders > 0 ? (completedOrders / initiatedOrders) * 100 : 0;
    const last30DaysConversionRate = usersLast30Days > 0 ? (completedOrdersLast30Days / usersLast30Days) * 100 : 0;
    const last7DaysConversionRate = usersLast7Days > 0 ? (completedOrdersLast7Days / usersLast7Days) * 100 : 0;

    // Process conversion by color
    const conversionByColor = conversionByColorResult.map((item: any) => ({
      color: item.color,
      initiated: item.initiated,
      completed: item.completed,
      conversionRate: item.initiated > 0 ? (item.completed / item.initiated) * 100 : 0,
    }));

    // Calculate funnel drop-off rates
    const visitToOrderRate = totalUsers > 0 ? (initiatedOrders / totalUsers) * 100 : 0;
    const orderToPaymentRate = initiatedOrders > 0 ? (completedOrders / initiatedOrders) * 100 : 0;

    return NextResponse.json({
      funnel: {
        totalUsers,
        initiatedOrders,
        completedOrders,
        visitToOrderRate,
        orderToPaymentRate,
        overallConversionRate,
      },
      conversionRates: {
        overall: overallConversionRate,
        orderCompletion: orderCompletionRate,
        last30Days: last30DaysConversionRate,
        last7Days: last7DaysConversionRate,
      },
      periodComparison: {
        allTime: {
          users: totalUsers,
          orders: completedOrders,
          conversionRate: overallConversionRate,
        },
        last30Days: {
          users: usersLast30Days,
          orders: completedOrdersLast30Days,
          conversionRate: last30DaysConversionRate,
        },
        last7Days: {
          users: usersLast7Days,
          orders: completedOrdersLast7Days,
          conversionRate: last7DaysConversionRate,
        },
      },
      productPerformance: conversionByColor,
      revenueMetrics: {
        averageOrderValue: avgOrderValue,
        totalRevenue,
        revenuePerUser: totalUsers > 0 ? totalRevenue / totalUsers : 0,
      },
    });
  } catch (error) {
    console.error('Failed to fetch conversion funnel data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversion funnel data' },
      { status: 500 },
    );
  }
}
