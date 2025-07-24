import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDB } from '@/libs/DB';
import { referralConfigSchema } from '@/models/Schema';

export const dynamic = 'force-dynamic';

// GET: Fetch current referral configuration
export async function GET() {
  try {
    const db = await getDB();

    // Get the latest configuration
    const configs = await db
      .select()
      .from(referralConfigSchema)
      .orderBy(referralConfigSchema.id)
      .limit(1);

    // Return default config if none exists
    const defaultConfig = {
      enabled: false,
      rewardType: 'percentage' as const,
      rewardValue: 20,
      cookieDays: 30,
    };

    const config = configs.length > 0 ? configs[0] : defaultConfig;

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error) {
    console.error('Failed to fetch referral config:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch configuration' },
      { status: 500 },
    );
  }
}

// POST: Update referral configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { enabled, rewardType, rewardValue, cookieDays } = body;

    // Validate input
    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'Invalid enabled value' },
        { status: 400 },
      );
    }

    if (!['percentage', 'fixed'].includes(rewardType)) {
      return NextResponse.json(
        { success: false, message: 'Invalid reward type' },
        { status: 400 },
      );
    }

    if (typeof rewardValue !== 'number' || rewardValue < 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid reward value' },
        { status: 400 },
      );
    }

    if (rewardType === 'percentage' && rewardValue > 100) {
      return NextResponse.json(
        { success: false, message: 'Percentage cannot exceed 100%' },
        { status: 400 },
      );
    }

    if (typeof cookieDays !== 'number' || cookieDays < 1 || cookieDays > 365) {
      return NextResponse.json(
        { success: false, message: 'Cookie days must be between 1 and 365' },
        { status: 400 },
      );
    }

    const db = await getDB();

    // Check if configuration exists
    const existingConfigs = await db
      .select()
      .from(referralConfigSchema)
      .limit(1);

    const configData = {
      enabled,
      rewardType,
      rewardValue,
      cookieDays,
      updatedAt: new Date(),
    };

    if (existingConfigs.length > 0) {
      // Update existing configuration
      await db
        .update(referralConfigSchema)
        .set(configData)
        .where(eq(referralConfigSchema.id, existingConfigs[0].id));
    } else {
      // Create new configuration
      await db
        .insert(referralConfigSchema)
        .values(configData);
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration updated successfully',
    });
  } catch (error) {
    console.error('Failed to update referral config:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update configuration' },
      { status: 500 },
    );
  }
}
