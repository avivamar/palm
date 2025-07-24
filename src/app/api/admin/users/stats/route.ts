/**
 * User Statistics API Route
 * Following CLAUDE.md: 商业价值优先，TypeScript严格模式
 */

import type { NextRequest } from 'next/server';
import { and, eq, gte, lt, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDB } from '@/libs/DB';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';
import { securityMiddleware } from '@/middleware/security/unified-security';
import { usersSchema } from '@/models/Schema';

export async function GET(request: NextRequest) {
  return securityMiddleware(request, async () => {
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

      // Calculate date ranges
      const now = new Date();
      const firstDayOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Parallel queries for better performance
      const [
        totalUsersResult,
        totalUsersLastMonthResult,
        adminUsersResult,
        adminUsersLastMonthResult,
        newThisMonthResult,
        newLastMonthResult,
        activeTodayResult,
        activeYesterdayResult,
      ] = await Promise.all([
      // Total users
        db.select({ count: sql<number>`count(*)` }).from(usersSchema),

        // Total users last month
        db.select({ count: sql<number>`count(*)` }).from(usersSchema).where(gte(usersSchema.createdAt, firstDayOfLastMonth)),

        // Admin users
        db.select({ count: sql<number>`count(*)` }).from(usersSchema).where(eq(usersSchema.role, 'admin')),

        // Admin users last month
        db.select({ count: sql<number>`count(*)` }).from(usersSchema).where(and(
          eq(usersSchema.role, 'admin'),
          gte(usersSchema.createdAt, firstDayOfLastMonth),
        )),

        // New this month
        db.select({ count: sql<number>`count(*)` }).from(usersSchema).where(gte(usersSchema.createdAt, firstDayOfThisMonth)),

        // New last month
        db.select({ count: sql<number>`count(*)` }).from(usersSchema).where(and(
          gte(usersSchema.createdAt, firstDayOfLastMonth),
          lt(usersSchema.createdAt, firstDayOfThisMonth),
        )),

        // Active today (users with recent login)
        db.select({ count: sql<number>`count(*)` }).from(usersSchema).where(gte(usersSchema.updatedAt, today)),

        // Active yesterday
        db.select({ count: sql<number>`count(*)` }).from(usersSchema).where(and(
          gte(usersSchema.updatedAt, yesterday),
          lt(usersSchema.updatedAt, today),
        )),
      ]);

      // Extract counts
      const totalUsers = totalUsersResult[0]?.count || 0;
      const totalUsersLastMonth = totalUsersLastMonthResult[0]?.count || 0;
      const adminUsers = adminUsersResult[0]?.count || 0;
      const adminUsersLastMonth = adminUsersLastMonthResult[0]?.count || 0;
      const newThisMonth = newThisMonthResult[0]?.count || 0;
      const newLastMonth = newLastMonthResult[0]?.count || 0;
      const activeToday = activeTodayResult[0]?.count || 0;
      const activeYesterday = activeYesterdayResult[0]?.count || 0;

      // Calculate percentage changes
      const calculateChange = (current: number, previous: number): string => {
        if (previous === 0) {
          return current > 0 ? '+100%' : '0%';
        }
        const change = ((current - previous) / previous) * 100;
        return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
      };

      return NextResponse.json({
        totalUsers,
        adminUsers,
        newThisMonth,
        activeToday,
        totalUsersChange: calculateChange(totalUsers, totalUsersLastMonth),
        adminUsersChange: calculateChange(adminUsers, adminUsersLastMonth),
        newThisMonthChange: calculateChange(newThisMonth, newLastMonth),
        activeTodayChange: calculateChange(activeToday, activeYesterday),
      });
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user stats' },
        { status: 500 },
      );
    }
  });
}
