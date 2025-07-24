import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDB } from '@/libs/DB';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';
import { referralsSchema, usersSchema } from '@/models/Schema';

export const dynamic = 'force-dynamic';

// GET: Fetch user referral statistics
export async function GET() {
  try {
    // Check authentication
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { success: false, message: 'Authentication not configured' },
        { status: 500 },
      );
    }

    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 },
      );
    }

    const db = await getDB();

    // Find user by email or supabase ID
    const userResult = await db
      .select({ id: usersSchema.id })
      .from(usersSchema)
      .where(
        sql`${usersSchema.email} = ${session.user.email} OR ${usersSchema.supabaseId} = ${session.user.id}`,
      )
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 },
      );
    }

    const userId = userResult[0].id;

    // Generate referral code (base64 encoded user ID)
    const referralCode = Buffer.from(userId.toString()).toString('base64');

    // Get user's referral statistics
    const referralStats = await db
      .select({
        totalClicks: sql<number>`coalesce(sum(${referralsSchema.clickCount}), 0)`,
        totalConversions: sql<number>`coalesce(sum(${referralsSchema.conversionCount}), 0)`,
        totalRewards: sql<number>`coalesce(sum(${referralsSchema.rewardAmount}), 0)`,
        totalReferrals: sql<number>`count(${referralsSchema.id})`,
      })
      .from(referralsSchema)
      .where(sql`${referralsSchema.referrerUserId} = ${userId}`);

    // Get recent referrals
    const recentReferrals = await db
      .select({
        id: referralsSchema.id,
        referredEmail: sql<string>`referred.email`,
        status: referralsSchema.status,
        rewardAmount: referralsSchema.rewardAmount,
        createdAt: referralsSchema.createdAt,
      })
      .from(referralsSchema)
      .leftJoin(
        sql`${usersSchema} as referred`,
        sql`referred.id = ${referralsSchema.referredUserId}`,
      )
      .where(sql`${referralsSchema.referrerUserId} = ${userId}`)
      .orderBy(sql`${referralsSchema.createdAt} desc`)
      .limit(5);

    const stats = referralStats[0] || {
      totalClicks: 0,
      totalConversions: 0,
      totalRewards: 0,
      totalReferrals: 0,
    };

    const conversionRate = stats.totalClicks > 0
      ? (stats.totalConversions / stats.totalClicks) * 100
      : 0;

    const userStats = {
      referralCode,
      totalReferrals: stats.totalReferrals,
      totalClicks: stats.totalClicks,
      totalConversions: stats.totalConversions,
      totalRewards: stats.totalRewards,
      conversionRate,
      recentReferrals: recentReferrals.map((r: any) => ({
        ...r,
        createdAt: r.createdAt?.toISOString() || new Date().toISOString(),
      })),
    };

    return NextResponse.json({
      success: true,
      stats: userStats,
    });
  } catch (error) {
    console.error('Failed to fetch user referral stats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch statistics' },
      { status: 500 },
    );
  }
}
