/**
 * Dashboard Statistics API Route
 * Following CLAUDE.md: 商业价值优先，TypeScript严格模式，安全性优先
 */

import type { NextRequest } from 'next/server';
import type { AdminUser } from '@/middleware/admin-auth';
import { and, eq, gte, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDB } from '@/libs/DB';
import { logAdminAction, withAdminAuth } from '@/middleware/admin-auth';
import { preordersSchema, usersSchema } from '@/models/Schema';
// import { cacheApiResponse } from '@/libs/cache-manager';

async function handleGET(_request: NextRequest, user: AdminUser) {
  try {
    // Log admin action for audit
    logAdminAction(user, 'READ', 'dashboard_stats');

    // Use cache for dashboard stats (3 minutes cache)
    // const cacheKey = `dashboard_stats:${user.id}`;

    // Cache disabled for now
    // return await cacheApiResponse(
    //   cacheKey,
    //   async () => {

    try {
      const db = await getDB();

      // Calculate date ranges for comparison
      const now = new Date();
      const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Helper function to calculate percentage changes
      const calculateChange = (current: number, previous: number): string => {
        if (previous === 0) {
          return current > 0 ? '+100%' : '0%';
        }
        const change = ((current - previous) / previous) * 100;
        return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
      };

      // Execute all queries in parallel for better performance
      const [
        totalUsersResult,
        usersThisMonthResult,
        totalOrdersResult,
        ordersThisMonthResult,
        completedOrdersResult,
        completedOrdersThisMonthResult,
        totalRevenueResult,
        revenueThisMonthResult,
      ] = await Promise.all([
        // Total users count
        db.select({ count: sql<number>`count(*)` }).from(usersSchema),

        // Users created this month
        db.select({ count: sql<number>`count(*)` }).from(usersSchema).where(gte(usersSchema.createdAt, startOfCurrentMonth)),

        // Total orders count
        db.select({ count: sql<number>`count(*)` }).from(preordersSchema),

        // Orders created this month
        db.select({ count: sql<number>`count(*)` }).from(preordersSchema).where(gte(preordersSchema.createdAt, startOfCurrentMonth)),

        // Completed orders count
        db.select({ count: sql<number>`count(*)` }).from(preordersSchema).where(eq(preordersSchema.status, 'completed')),

        // Completed orders this month
        db.select({ count: sql<number>`count(*)` }).from(preordersSchema).where(and(
          eq(preordersSchema.status, 'completed'),
          gte(preordersSchema.createdAt, startOfCurrentMonth),
        )),

        // Total revenue from completed orders
        db.select({
          total: sql<number>`sum(case when ${preordersSchema.status} = 'completed' then ${preordersSchema.amount} else 0 end)`,
        }).from(preordersSchema),

        // Revenue this month from completed orders
        db.select({
          total: sql<number>`sum(case when ${preordersSchema.status} = 'completed' then ${preordersSchema.amount} else 0 end)`,
        }).from(preordersSchema).where(gte(preordersSchema.createdAt, startOfCurrentMonth)),
      ]);

      // Extract current period data
      const totalUsers = totalUsersResult[0]?.count || 0;
      const usersThisMonth = usersThisMonthResult[0]?.count || 0;
      const totalOrders = totalOrdersResult[0]?.count || 0;
      const ordersThisMonth = ordersThisMonthResult[0]?.count || 0;
      const completedOrders = completedOrdersResult[0]?.count || 0;
      const completedOrdersThisMonth = completedOrdersThisMonthResult[0]?.count || 0;
      const totalRevenue = Number(totalRevenueResult[0]?.total) || 0;
      const revenueThisMonth = Number(revenueThisMonthResult[0]?.total) || 0;

      // Calculate previous period data for comparison
      const usersLastMonth = totalUsers - usersThisMonth;
      const ordersLastMonth = totalOrders - ordersThisMonth;
      const completedOrdersLastMonth = completedOrders - completedOrdersThisMonth;
      const revenueLastMonth = totalRevenue - revenueThisMonth;

      // Calculate conversion rates
      const conversionRate = totalUsers > 0 ? (completedOrders / totalUsers) * 100 : 0;
      const conversionRateLastMonth = usersLastMonth > 0 ? (completedOrdersLastMonth / usersLastMonth) * 100 : 0;

      return NextResponse.json({
        totalUsers,
        totalOrders,
        revenue: totalRevenue,
        conversionRate,
        totalUsersChange: calculateChange(usersThisMonth, usersLastMonth),
        totalOrdersChange: calculateChange(ordersThisMonth, ordersLastMonth),
        revenueChange: calculateChange(revenueThisMonth, revenueLastMonth),
        conversionRateChange: calculateChange(conversionRate, conversionRateLastMonth),
      });
      // },
      // 180 // 3 minutes cache for dashboard stats
    // );
    } catch (dbError) {
      console.error('Database query failed:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 },
    );
  }
}

// Export the GET handler with admin authentication
export const GET = withAdminAuth(handleGET);
