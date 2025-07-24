/**
 * Shopify同步历史API路由
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // 模拟同步历史数据
    const mockRecords = [
      {
        id: 'sync_001',
        entityType: 'order' as const,
        entityId: 'order_123',
        syncType: 'create' as const,
        status: 'completed' as const,
        attempts: 1,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        completedAt: new Date(Date.now() - 3500000).toISOString(),
        shopifyId: 'shop_order_456',
      },
      {
        id: 'sync_002',
        entityType: 'product' as const,
        entityId: 'product_789',
        syncType: 'update' as const,
        status: 'failed' as const,
        attempts: 3,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        lastAttempt: new Date(Date.now() - 1800000).toISOString(),
        error: 'Product not found in Shopify',
      },
      {
        id: 'sync_003',
        entityType: 'order' as const,
        entityId: 'order_456',
        syncType: 'create' as const,
        status: 'processing' as const,
        attempts: 1,
        createdAt: new Date(Date.now() - 300000).toISOString(),
      },
      {
        id: 'sync_004',
        entityType: 'customer' as const,
        entityId: 'customer_123',
        syncType: 'create' as const,
        status: 'pending' as const,
        attempts: 0,
        createdAt: new Date(Date.now() - 60000).toISOString(),
      },
    ];

    // 按状态过滤
    const filteredRecords = status && status !== 'all'
      ? mockRecords.filter(record => record.status === status)
      : mockRecords;

    return NextResponse.json({ records: filteredRecords });
  } catch (error) {
    console.error('Shopify sync history API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sync history' },
      { status: 500 },
    );
  }
}
