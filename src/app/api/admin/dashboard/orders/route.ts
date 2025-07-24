/**
 * Order Analytics API Route
 * Following CLAUDE.md: 商业价值优先，TypeScript严格模式
 */

import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDB } from '@/libs/DB';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';
import { preordersSchema } from '@/models/Schema';

export async function GET(request: Request) {
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
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '30'; // default to last 30 days

    // Calculate time ranges
    const now = new Date();
    const daysAgo = new Date(now.getTime() - Number.parseInt(period) * 24 * 60 * 60 * 1000);

    // Execute order analytics queries
    const [
      orderStatusBreakdownResult,
      ordersByPeriodResult,
      ordersByColorResult,
      recentOrdersResult,
      orderValueDistributionResult,
      dailyOrderTrendsResult,
      orderGeographyResult,
      orderFailureAnalysisResult,
    ] = await Promise.all([
      // Order status breakdown
      db.select({
        status: preordersSchema.status,
        count: sql<number>`count(*)`,
        totalAmount: sql<number>`sum(${preordersSchema.amount})`,
      }).from(preordersSchema).where(gte(preordersSchema.createdAt, daysAgo)).groupBy(preordersSchema.status),

      // Orders by time period
      db.select({
        count: sql<number>`count(*)`,
        totalAmount: sql<number>`sum(${preordersSchema.amount})`,
        avgAmount: sql<number>`avg(${preordersSchema.amount})`,
      }).from(preordersSchema).where(gte(preordersSchema.createdAt, daysAgo)),

      // Orders by product color
      db.select({
        color: preordersSchema.color,
        count: sql<number>`count(*)`,
        totalAmount: sql<number>`sum(case when ${preordersSchema.status} = 'completed' then ${preordersSchema.amount} else 0 end)`,
        completionRate: sql<number>`(count(case when ${preordersSchema.status} = 'completed' then 1 end) * 100.0 / count(*))`,
      }).from(preordersSchema).where(gte(preordersSchema.createdAt, daysAgo)).groupBy(preordersSchema.color),

      // Recent orders with user info
      db.select({
        id: preordersSchema.id,
        email: preordersSchema.email,
        amount: preordersSchema.amount,
        status: preordersSchema.status,
        color: preordersSchema.color,
        createdAt: preordersSchema.createdAt,
        billingCountry: preordersSchema.billingCountry,
      }).from(preordersSchema).where(gte(preordersSchema.createdAt, daysAgo)).orderBy(desc(preordersSchema.createdAt)).limit(50),

      // Order value distribution
      db.select({
        range: sql<string>`
          case 
            when ${preordersSchema.amount} < 50 then 'Under $50'
            when ${preordersSchema.amount} < 100 then '$50-$100'
            when ${preordersSchema.amount} < 200 then '$100-$200'
            when ${preordersSchema.amount} < 500 then '$200-$500'
            else 'Over $500'
          end
        `,
        count: sql<number>`count(*)`,
        totalAmount: sql<number>`sum(${preordersSchema.amount})`,
      }).from(preordersSchema).where(and(
        gte(preordersSchema.createdAt, daysAgo),
        eq(preordersSchema.status, 'completed'),
      )).groupBy(sql`
          case 
            when ${preordersSchema.amount} < 50 then 'Under $50'
            when ${preordersSchema.amount} < 100 then '$50-$100'
            when ${preordersSchema.amount} < 200 then '$100-$200'
            when ${preordersSchema.amount} < 500 then '$200-$500'
            else 'Over $500'
          end
        `),

      // Daily order trends
      db.select({
        date: sql<string>`date(${preordersSchema.createdAt})`,
        orders: sql<number>`count(*)`,
        completed: sql<number>`count(case when ${preordersSchema.status} = 'completed' then 1 end)`,
        revenue: sql<number>`sum(case when ${preordersSchema.status} = 'completed' then ${preordersSchema.amount} else 0 end)`,
      }).from(preordersSchema).where(gte(preordersSchema.createdAt, daysAgo)).groupBy(sql`date(${preordersSchema.createdAt})`).orderBy(sql`date(${preordersSchema.createdAt})`),

      // Order geography (top countries)
      db.select({
        country: preordersSchema.billingCountry,
        count: sql<number>`count(*)`,
        totalAmount: sql<number>`sum(case when ${preordersSchema.status} = 'completed' then ${preordersSchema.amount} else 0 end)`,
      }).from(preordersSchema).where(and(
        gte(preordersSchema.createdAt, daysAgo),
        sql`${preordersSchema.billingCountry} is not null`,
      )).groupBy(preordersSchema.billingCountry).orderBy(desc(sql`count(*)`)).limit(10),

      // Order failure analysis
      db.select({
        failedOrders: sql<number>`count(case when ${preordersSchema.status} in ('failed', 'cancelled') then 1 end)`,
        totalOrders: sql<number>`count(*)`,
        failureRate: sql<number>`(count(case when ${preordersSchema.status} in ('failed', 'cancelled') then 1 end) * 100.0 / count(*))`,
        avgTimeToComplete: sql<number>`avg(extract(epoch from (${preordersSchema.updatedAt} - ${preordersSchema.createdAt})) / 3600)`,
      }).from(preordersSchema).where(gte(preordersSchema.createdAt, daysAgo)),
    ]);

    // Process results
    const orderStatusBreakdown = orderStatusBreakdownResult.map((item: any) => ({
      status: item.status,
      count: item.count,
      totalAmount: Number(item.totalAmount) || 0,
      percentage: 0, // Will be calculated below
    }));

    const totalOrdersInPeriod = orderStatusBreakdown.reduce((sum: number, item: any) => sum + item.count, 0);
    orderStatusBreakdown.forEach((item: any) => {
      item.percentage = totalOrdersInPeriod > 0 ? (item.count / totalOrdersInPeriod) * 100 : 0;
    });

    const ordersByPeriod = ordersByPeriodResult[0] || { count: 0, totalAmount: 0, avgAmount: 0 };
    const orderFailureAnalysis = orderFailureAnalysisResult[0] || { failedOrders: 0, totalOrders: 0, failureRate: 0, avgTimeToComplete: 0 };

    return NextResponse.json({
      summary: {
        totalOrders: ordersByPeriod.count,
        totalRevenue: Number(ordersByPeriod.totalAmount) || 0,
        averageOrderValue: Number(ordersByPeriod.avgAmount) || 0,
        failureRate: Number(orderFailureAnalysis.failureRate) || 0,
        avgTimeToComplete: Number(orderFailureAnalysis.avgTimeToComplete) || 0,
      },
      statusBreakdown: orderStatusBreakdown,
      productPerformance: ordersByColorResult.map((item: any) => ({
        color: item.color,
        orders: item.count,
        revenue: Number(item.totalAmount) || 0,
        completionRate: Number(item.completionRate) || 0,
      })),
      recentOrders: recentOrdersResult.map((order: any) => ({
        id: order.id,
        email: order.email,
        amount: Number(order.amount) || 0,
        status: order.status,
        color: order.color,
        country: order.billingCountry,
        createdAt: order.createdAt?.toISOString(),
      })),
      valueDistribution: orderValueDistributionResult.map((item: any) => ({
        range: item.range,
        count: item.count,
        totalAmount: Number(item.totalAmount) || 0,
      })),
      dailyTrends: dailyOrderTrendsResult.map((item: any) => ({
        date: item.date,
        orders: item.orders,
        completed: item.completed,
        revenue: Number(item.revenue) || 0,
        completionRate: item.orders > 0 ? (item.completed / item.orders) * 100 : 0,
      })),
      geography: orderGeographyResult.map((item: any) => ({
        country: item.country,
        orders: item.count,
        revenue: Number(item.totalAmount) || 0,
      })),
      period: Number.parseInt(period),
      generatedAt: now.toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch order analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order analytics' },
      { status: 500 },
    );
  }
}
