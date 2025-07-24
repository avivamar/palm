import type { NextRequest } from 'next/server';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDB } from '@/libs/DB';
import { referralsSchema, usersSchema } from '@/models/Schema';

export const dynamic = 'force-dynamic';

// GET: Fetch referral statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = Number.parseInt(searchParams.get('range') || '30');

    // Validate range
    if (![7, 30, 90, 365].includes(range)) {
      return NextResponse.json(
        { success: false, message: 'Invalid time range' },
        { status: 400 },
      );
    }

    const db = await getDB();
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - range);

    // Get basic statistics
    const totalReferralsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(referralsSchema);

    const activeReferralsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(referralsSchema)
      .where(sql`${referralsSchema.createdAt} >= ${dateThreshold}`);

    const totalClicksResult = await db
      .select({ sum: sql<number>`coalesce(sum(${referralsSchema.clickCount}), 0)` })
      .from(referralsSchema)
      .where(sql`${referralsSchema.createdAt} >= ${dateThreshold}`);

    const totalConversionsResult = await db
      .select({ sum: sql<number>`coalesce(sum(${referralsSchema.conversionCount}), 0)` })
      .from(referralsSchema)
      .where(sql`${referralsSchema.createdAt} >= ${dateThreshold}`);

    const totalRewardsResult = await db
      .select({ sum: sql<number>`coalesce(sum(${referralsSchema.rewardAmount}), 0)` })
      .from(referralsSchema)
      .where(sql`${referralsSchema.createdAt} >= ${dateThreshold}`);

    const totalDiscountsResult = await db
      .select({ sum: sql<number>`coalesce(sum(${referralsSchema.discountAmount}), 0)` })
      .from(referralsSchema)
      .where(sql`${referralsSchema.createdAt} >= ${dateThreshold}`);

    // Get recent referrals with user information
    const recentReferrals = await db
      .select({
        id: referralsSchema.id,
        referrerEmail: sql<string>`referrer.email`,
        referredEmail: sql<string>`referred.email`,
        status: referralsSchema.status,
        clickCount: referralsSchema.clickCount,
        conversionCount: referralsSchema.conversionCount,
        rewardAmount: referralsSchema.rewardAmount,
        createdAt: referralsSchema.createdAt,
      })
      .from(referralsSchema)
      .leftJoin(
        sql`${usersSchema} as referrer`,
        sql`referrer.id = ${referralsSchema.referrerUserId}`,
      )
      .leftJoin(
        sql`${usersSchema} as referred`,
        sql`referred.id = ${referralsSchema.referredUserId}`,
      )
      .where(sql`${referralsSchema.createdAt} >= ${dateThreshold}`)
      .orderBy(sql`${referralsSchema.createdAt} desc`)
      .limit(10);

    // Get top referrers
    const topReferrers = await db
      .select({
        email: sql<string>`referrer.email`,
        referralCount: sql<number>`count(${referralsSchema.id})`,
        totalRewards: sql<number>`coalesce(sum(${referralsSchema.rewardAmount}), 0)`,
      })
      .from(referralsSchema)
      .leftJoin(
        sql`${usersSchema} as referrer`,
        sql`referrer.id = ${referralsSchema.referrerUserId}`,
      )
      .where(sql`${referralsSchema.createdAt} >= ${dateThreshold}`)
      .groupBy(sql`referrer.email`)
      .having(sql`count(${referralsSchema.id}) > 0`)
      .orderBy(sql`count(${referralsSchema.id}) desc`)
      .limit(10);

    // Get monthly statistics (last 6 months)
    const monthlyStats = await db
      .select({
        month: sql<string>`to_char(${referralsSchema.createdAt}, 'YYYY-MM')`,
        referrals: sql<number>`count(${referralsSchema.id})`,
        conversions: sql<number>`coalesce(sum(${referralsSchema.conversionCount}), 0)`,
        rewards: sql<number>`coalesce(sum(${referralsSchema.rewardAmount}), 0)`,
      })
      .from(referralsSchema)
      .where(sql`${referralsSchema.createdAt} >= ${new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)}`)
      .groupBy(sql`to_char(${referralsSchema.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${referralsSchema.createdAt}, 'YYYY-MM') desc`);

    // Calculate statistics
    const totalReferrals = totalReferralsResult[0]?.count || 0;
    const activeReferrals = activeReferralsResult[0]?.count || 0;
    const totalClicks = totalClicksResult[0]?.sum || 0;
    const totalConversions = totalConversionsResult[0]?.sum || 0;
    const totalRewardsIssued = totalRewardsResult[0]?.sum || 0;
    const totalDiscountsGiven = totalDiscountsResult[0]?.sum || 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    const stats = {
      totalReferrals,
      activeReferrals,
      totalClicks,
      totalConversions,
      conversionRate,
      totalRewardsIssued,
      totalDiscountsGiven,
      recentReferrals: recentReferrals.map((r: any) => ({
        ...r,
        createdAt: r.createdAt?.toISOString() || new Date().toISOString(),
      })),
      topReferrers: topReferrers.filter((r: any) => r.email), // Filter out null emails
      monthlyStats: monthlyStats.map((m: any) => ({
        ...m,
        month: formatMonth(m.month),
      })),
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Failed to fetch referral stats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch statistics' },
      { status: 500 },
    );
  }
}

// Helper function to format month display
function formatMonth(monthString: string): string {
  try {
    const date = new Date(`${monthString}-01`);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  } catch {
    return monthString;
  }
}
