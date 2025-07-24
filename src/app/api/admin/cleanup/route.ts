/**
 * Data Cleanup API Route
 * Following CLAUDE.md: 商业价值优先，TypeScript严格模式，安全性优先
 */

import type { NextRequest } from 'next/server';
import type { AdminUser } from '@/middleware/admin-auth';
import { NextResponse } from 'next/server';
import { dataCleanupService, getCleanupStatsAPI, runDataCleanupAPI } from '@/libs/data-cleanup';
import { withAdminAuth } from '@/middleware/admin-auth';

async function handleGET(_request: NextRequest, _user: AdminUser) {
  try {
    // Get cleanup statistics
    const stats = await getCleanupStatsAPI();
    const isRunning = dataCleanupService.isCleanupRunning();

    return NextResponse.json({
      success: true,
      isRunning,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to get cleanup stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get cleanup statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

async function handlePOST(_request: NextRequest, _user: AdminUser) {
  try {
    // Check if cleanup is already running
    if (dataCleanupService.isCleanupRunning()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cleanup is already running',
          message: 'Please wait for the current cleanup to complete',
        },
        { status: 409 },
      );
    }

    // Run cleanup
    const result = await runDataCleanupAPI();

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to run cleanup:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to run data cleanup',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// Export the handlers with admin authentication
export const GET = withAdminAuth(handleGET);
export const POST = withAdminAuth(handlePOST);
