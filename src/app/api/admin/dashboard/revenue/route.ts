/**
 * Revenue Analytics API Route
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
    const previousPeriodStart = new Date(daysAgo.getTime() - Number.parseInt(period) * 24 * 60 * 60 * 1000);

    // Execute revenue analytics queries
    const [
      currentPeriodRevenueResult,
      previousPeriodRevenueResult,
      revenueByColorResult,
      revenueByCountryResult,
      monthlyRevenueResult,
      dailyRevenueResult,
      revenueMetricsResult,
      topCustomersResult,
    ] = await Promise.all([
      // Current period revenue
      db.select({
        totalRevenue: sql<number>`sum(${preordersSchema.amount})`,
        completedOrders: sql<number>`count(*)`,
        avgOrderValue: sql<number>`avg(${preordersSchema.amount})`,
      }).from(preordersSchema).where(and(
        eq(preordersSchema.status, 'completed'),
        gte(preordersSchema.createdAt, daysAgo),
      )),

      // Previous period revenue for comparison
      db.select({
        totalRevenue: sql<number>`sum(${preordersSchema.amount})`,
        completedOrders: sql<number>`count(*)`,
        avgOrderValue: sql<number>`avg(${preordersSchema.amount})`,
      }).from(preordersSchema).where(and(
        eq(preordersSchema.status, 'completed'),
        gte(preordersSchema.createdAt, previousPeriodStart),
        sql`${preordersSchema.createdAt} < ${daysAgo}`,
      )),

      // Revenue by product color
      db.select({
        color: preordersSchema.color,
        revenue: sql<number>`sum(${preordersSchema.amount})`,
        orders: sql<number>`count(*)`,
        avgOrderValue: sql<number>`avg(${preordersSchema.amount})`,
      }).from(preordersSchema).where(and(
        eq(preordersSchema.status, 'completed'),
        gte(preordersSchema.createdAt, daysAgo),
      )).groupBy(preordersSchema.color).orderBy(desc(sql`sum(${preordersSchema.amount})`)),

      // Revenue by country
      db.select({
        country: preordersSchema.billingCountry,
        revenue: sql<number>`sum(${preordersSchema.amount})`,
        orders: sql<number>`count(*)`,
        avgOrderValue: sql<number>`avg(${preordersSchema.amount})`,
      }).from(preordersSchema).where(and(
        eq(preordersSchema.status, 'completed'),
        gte(preordersSchema.createdAt, daysAgo),
        sql`${preordersSchema.billingCountry} is not null`,
      )).groupBy(preordersSchema.billingCountry).orderBy(desc(sql`sum(${preordersSchema.amount})`)).limit(10),

      // Monthly revenue trends (last 12 months)
      db.select({
        month: sql<string>`to_char(${preordersSchema.createdAt}, 'YYYY-MM')`,
        revenue: sql<number>`sum(${preordersSchema.amount})`,
        orders: sql<number>`count(*)`,
        avgOrderValue: sql<number>`avg(${preordersSchema.amount})`,
      }).from(preordersSchema).where(and(
        eq(preordersSchema.status, 'completed'),
        gte(preordersSchema.createdAt, new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)),
      )).groupBy(sql`to_char(${preordersSchema.createdAt}, 'YYYY-MM')`).orderBy(sql`to_char(${preordersSchema.createdAt}, 'YYYY-MM')`),

      // Daily revenue trends
      db.select({
        date: sql<string>`date(${preordersSchema.createdAt})`,
        revenue: sql<number>`sum(${preordersSchema.amount})`,
        orders: sql<number>`count(*)`,
        avgOrderValue: sql<number>`avg(${preordersSchema.amount})`,
      }).from(preordersSchema).where(and(
        eq(preordersSchema.status, 'completed'),
        gte(preordersSchema.createdAt, daysAgo),
      )).groupBy(sql`date(${preordersSchema.createdAt})`).orderBy(sql`date(${preordersSchema.createdAt})`),

      // Overall revenue metrics
      db.select({
        totalRevenue: sql<number>`sum(${preordersSchema.amount})`,
        totalOrders: sql<number>`count(*)`,
        avgOrderValue: sql<number>`avg(${preordersSchema.amount})`,
        medianOrderValue: sql<number>`percentile_cont(0.5) within group (order by ${preordersSchema.amount})`,
        minOrderValue: sql<number>`min(${preordersSchema.amount})`,
        maxOrderValue: sql<number>`max(${preordersSchema.amount})`,
      }).from(preordersSchema).where(eq(preordersSchema.status, 'completed')),

      // Top customers by revenue
      db.select({
        email: preordersSchema.email,
        totalRevenue: sql<number>`sum(${preordersSchema.amount})`,
        orderCount: sql<number>`count(*)`,
        avgOrderValue: sql<number>`avg(${preordersSchema.amount})`,
        firstOrderDate: sql<string>`min(${preordersSchema.createdAt})`,
        lastOrderDate: sql<string>`max(${preordersSchema.createdAt})`,
      }).from(preordersSchema).where(and(
        eq(preordersSchema.status, 'completed'),
        gte(preordersSchema.createdAt, daysAgo),
      )).groupBy(preordersSchema.email).orderBy(desc(sql`sum(${preordersSchema.amount})`)).limit(20),
    ]);

    // Process results
    const currentPeriodRevenue = currentPeriodRevenueResult[0] || { totalRevenue: 0, completedOrders: 0, avgOrderValue: 0 };
    const previousPeriodRevenue = previousPeriodRevenueResult[0] || { totalRevenue: 0, completedOrders: 0, avgOrderValue: 0 };
    const revenueMetrics = revenueMetricsResult[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, medianOrderValue: 0, minOrderValue: 0, maxOrderValue: 0 };

    // Calculate growth rates
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }
      return ((current - previous) / previous) * 100;
    };

    const revenueGrowth = calculateGrowth(
      Number(currentPeriodRevenue.totalRevenue) || 0,
      Number(previousPeriodRevenue.totalRevenue) || 0,
    );

    const orderGrowth = calculateGrowth(
      currentPeriodRevenue.completedOrders,
      previousPeriodRevenue.completedOrders,
    );

    const avgOrderValueGrowth = calculateGrowth(
      Number(currentPeriodRevenue.avgOrderValue) || 0,
      Number(previousPeriodRevenue.avgOrderValue) || 0,
    );

    return NextResponse.json({
      summary: {
        currentPeriod: {
          totalRevenue: Number(currentPeriodRevenue.totalRevenue) || 0,
          completedOrders: currentPeriodRevenue.completedOrders,
          avgOrderValue: Number(currentPeriodRevenue.avgOrderValue) || 0,
        },
        previousPeriod: {
          totalRevenue: Number(previousPeriodRevenue.totalRevenue) || 0,
          completedOrders: previousPeriodRevenue.completedOrders,
          avgOrderValue: Number(previousPeriodRevenue.avgOrderValue) || 0,
        },
        growth: {
          revenue: revenueGrowth,
          orders: orderGrowth,
          avgOrderValue: avgOrderValueGrowth,
        },
      },
      allTimeMetrics: {
        totalRevenue: Number(revenueMetrics.totalRevenue) || 0,
        totalOrders: revenueMetrics.totalOrders,
        avgOrderValue: Number(revenueMetrics.avgOrderValue) || 0,
        medianOrderValue: Number(revenueMetrics.medianOrderValue) || 0,
        minOrderValue: Number(revenueMetrics.minOrderValue) || 0,
        maxOrderValue: Number(revenueMetrics.maxOrderValue) || 0,
      },
      revenueByColor: revenueByColorResult.map((item: any) => ({
        color: item.color,
        revenue: Number(item.revenue) || 0,
        orders: item.orders,
        avgOrderValue: Number(item.avgOrderValue) || 0,
        share: Number(currentPeriodRevenue.totalRevenue) > 0
          ? (Number(item.revenue) / Number(currentPeriodRevenue.totalRevenue)) * 100
          : 0,
      })),
      revenueByCountry: revenueByCountryResult.map((item: any) => ({
        country: item.country,
        revenue: Number(item.revenue) || 0,
        orders: item.orders,
        avgOrderValue: Number(item.avgOrderValue) || 0,
      })),
      monthlyTrends: monthlyRevenueResult.map((item: any) => ({
        month: item.month,
        revenue: Number(item.revenue) || 0,
        orders: item.orders,
        avgOrderValue: Number(item.avgOrderValue) || 0,
      })),
      dailyTrends: dailyRevenueResult.map((item: any) => ({
        date: item.date,
        revenue: Number(item.revenue) || 0,
        orders: item.orders,
        avgOrderValue: Number(item.avgOrderValue) || 0,
      })),
      topCustomers: topCustomersResult.map((item: any) => ({
        email: item.email,
        totalRevenue: Number(item.totalRevenue) || 0,
        orderCount: item.orderCount,
        avgOrderValue: Number(item.avgOrderValue) || 0,
        firstOrderDate: item.firstOrderDate,
        lastOrderDate: item.lastOrderDate,
      })),
      period: Number.parseInt(period),
      generatedAt: now.toISOString(),
    });
  } catch (error) {
    console.error('Failed to fetch revenue analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue analytics' },
      { status: 500 },
    );
  }
}
