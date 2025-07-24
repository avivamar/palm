/**
 * Shopify配置API路由
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    // 模拟配置数据
    const mockConfig = {
      config: {
        storeDomain: process.env.SHOPIFY_STORE_DOMAIN || '',
        adminAccessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || '',
        webhook: {
          secret: process.env.SHOPIFY_WEBHOOK_SECRET || '',
          endpoint: process.env.SHOPIFY_WEBHOOK_ENDPOINT || '/api/webhooks/shopify',
        },
        features: {
          enableOrderSync: true,
          enableProductSync: true,
          enableWebhooks: true,
          enableRealTimeSync: false,
        },
        limits: {
          maxRetries: 3,
          batchSize: 50,
          rateLimitPerMinute: 100,
        },
      },
      connectionStatus: {
        isConnected: Boolean(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_ADMIN_ACCESS_TOKEN),
        lastTestAt: new Date().toISOString(),
        testResults: {
          apiConnection: Boolean(process.env.SHOPIFY_ADMIN_ACCESS_TOKEN),
          webhookSetup: Boolean(process.env.SHOPIFY_WEBHOOK_SECRET),
          permissions: true,
        },
      },
    };

    return NextResponse.json(mockConfig);
  } catch (error) {
    console.error('Shopify config API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Shopify config' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();

    // 在实际实现中，这里会保存配置到数据库或环境变量
    console.log('Saving Shopify config:', config);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Shopify config save error:', error);
    return NextResponse.json(
      { error: 'Failed to save Shopify config' },
      { status: 500 },
    );
  }
}
