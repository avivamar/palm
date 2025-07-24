/**
 * Shopify连接测试API路由
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  try {
    // 模拟连接测试
    // 在实际实现中，这里会测试与Shopify的实际连接
    const mockTestResult: {
      isConnected: boolean;
      lastTestAt: string;
      testResults: {
        apiConnection: boolean;
        webhookSetup: boolean;
        permissions: boolean;
      };
      error?: string;
    } = {
      isConnected: true,
      lastTestAt: new Date().toISOString(),
      testResults: {
        apiConnection: true,
        webhookSetup: Boolean(process.env.SHOPIFY_WEBHOOK_SECRET),
        permissions: true,
      },
    };

    // 模拟一些随机的测试结果
    if (Math.random() < 0.1) {
      mockTestResult.testResults.apiConnection = false;
      mockTestResult.isConnected = false;
      mockTestResult.error = 'Invalid API credentials';
    }

    return NextResponse.json(mockTestResult);
  } catch (error) {
    console.error('Shopify test API error:', error);
    return NextResponse.json(
      {
        isConnected: false,
        lastTestAt: new Date().toISOString(),
        testResults: {
          apiConnection: false,
          webhookSetup: false,
          permissions: false,
        },
        error: 'Connection test failed',
      },
      { status: 500 },
    );
  }
}
