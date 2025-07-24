/**
 * Security Monitoring API Route
 * Following CLAUDE.md: 商业价值优先，TypeScript严格模式，安全性优先
 */

import type { NextRequest } from 'next/server';
import type { AdminUser } from '@/middleware/admin-auth';
import { NextResponse } from 'next/server';
// import { cacheManager } from '@/libs/cache-manager';
import { dataCleanupService } from '@/libs/data-cleanup';
import { getSecurityConfig, securityMonitor } from '@/libs/security-monitor';
import { logAdminAction, withAdminAuth } from '@/middleware/admin-auth';

async function handleGET(_request: NextRequest, user: AdminUser) {
  try {
    logAdminAction(user, 'READ', 'security_monitoring');

    // Get comprehensive security status
    const [
      monitoringStats,
      securityConfig,
      cacheHealth,
      cleanupStats,
    ] = await Promise.all([
      securityMonitor.getMonitoringStats(),
      getSecurityConfig(),
      // cacheManager.getHealthInfo(),
      null, // placeholder for cache health
      dataCleanupService.getCleanupStats(),
    ]);

    const systemHealth = {
      security: {
        monitoring: monitoringStats,
        config: securityConfig,
      },
      performance: {
        cache: cacheHealth || { status: 'disabled' },
      },
      maintenance: {
        dataCleanup: {
          stats: cleanupStats,
          isRunning: dataCleanupService.isCleanupRunning(),
        },
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: systemHealth,
    });
  } catch (error) {
    console.error('Failed to get security monitoring data:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve security monitoring data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

async function handlePOST(request: NextRequest, user: AdminUser) {
  try {
    const body = await request.json();
    const { action } = body;

    logAdminAction(user, 'EXECUTE', `security_action_${action}`);

    switch (action) {
      case 'test_alert':
        await securityMonitor.sendTestAlert();
        return NextResponse.json({
          success: true,
          message: 'Test alert sent successfully',
        });

      case 'clear_cache':
        // await cacheManager.clear();
        return NextResponse.json({
          success: true,
          message: 'Cache cleared successfully (disabled)',
        });

      case 'reset_rate_limits':
        // Note: This would need to be implemented in the rate limiter
        return NextResponse.json({
          success: true,
          message: 'Rate limits reset (not implemented)',
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
            availableActions: ['test_alert', 'clear_cache', 'reset_rate_limits'],
          },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error('Failed to execute security action:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to execute security action',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// Export the handlers with admin authentication
export const GET = withAdminAuth(handleGET);
export const POST = withAdminAuth(handlePOST);
