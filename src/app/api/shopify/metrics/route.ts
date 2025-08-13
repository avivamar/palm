/**
 * Shopify 集成指标查询端点
 */

import type { NextRequest } from 'next/server';
import { shopifyMetrics } from '@rolitt/shopify/monitoring/metrics';
import { NextResponse } from 'next/server';

// Add runtime declaration for Node.js compatibility
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('[API] 📊 Fetching Shopify metrics...');

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'summary'; // 'summary' | 'detailed' | 'export'

    // 获取基础指标
    const metrics = shopifyMetrics.getMetrics();

    // 根据格式返回不同详细程度的数据
    switch (format) {
      case 'detailed':
        const detailedReport = shopifyMetrics.getDetailedReport();
        return NextResponse.json({
          success: true,
          timestamp: new Date().toISOString(),
          format: 'detailed',
          data: detailedReport,
        });

      case 'export':
        const exportData = shopifyMetrics.exportMetrics();
        return NextResponse.json({
          success: true,
          timestamp: new Date().toISOString(),
          format: 'export',
          data: exportData,
        });

      case 'summary':
      default:
        return NextResponse.json({
          success: true,
          timestamp: new Date().toISOString(),
          format: 'summary',
          data: {
            healthStatus: metrics.healthStatus,
            totalApiCalls: metrics.totalApiCalls,
            successRate: metrics.totalApiCalls > 0
              ? `${((metrics.successfulApiCalls / metrics.totalApiCalls) * 100).toFixed(2)}%`
              : '0%',
            errorRate: `${metrics.errorRate.toFixed(2)}%`,
            averageResponseTime: `${metrics.averageResponseTime.toFixed(0)}ms`,
            ordersSynced: metrics.ordersSynced,
            ordersFailedSync: metrics.ordersFailedSync,
            orderSyncSuccessRate: metrics.ordersSynced + metrics.ordersFailedSync > 0
              ? `${((metrics.ordersSynced / (metrics.ordersSynced + metrics.ordersFailedSync)) * 100).toFixed(2)}%`
              : '0%',
            lastSyncTime: metrics.lastSyncTime?.toISOString() || null,
          },
        });
    }
  } catch (error) {
    console.error('[API] ❌ Error fetching Shopify metrics:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * 重置指标（仅限开发环境）
 */
export async function DELETE(_request: NextRequest) {
  // 仅在开发环境允许重置指标
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({
      success: false,
      error: 'Metrics reset is only allowed in development environment',
    }, { status: 403 });
  }

  try {
    console.log('[API] 🔄 Resetting Shopify metrics...');

    shopifyMetrics.reset();

    return NextResponse.json({
      success: true,
      message: 'Metrics reset successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] ❌ Error resetting Shopify metrics:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
