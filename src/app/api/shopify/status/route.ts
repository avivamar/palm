/**
 * Shopify状态API路由
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    // 模拟Shopify状态数据
    // 在实际实现中，这里会调用Shopify集成包的真实API
    const mockStatus = {
      isConnected: true,
      lastSync: new Date().toISOString(),
      syncQueue: {
        total: 25,
        pending: 3,
        processing: 1,
        completed: 20,
        failed: 1,
        abandoned: 0,
      },
      health: {
        status: 'healthy' as const,
        apiConnection: true,
        webhookActive: true,
        lastHealthCheck: new Date().toISOString(),
        errors: [],
      },
      metrics: {
        totalOrders: 1234,
        syncedOrders: 1200,
        failedOrders: 34,
        totalProducts: 156,
        syncedProducts: 150,
        apiCalls: 5678,
        lastDay: {
          orders: 45,
          products: 8,
          apiCalls: 234,
        },
      },
    };

    return NextResponse.json(mockStatus);
  } catch (error) {
    console.error('Shopify status API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Shopify status' },
      { status: 500 },
    );
  }
}
