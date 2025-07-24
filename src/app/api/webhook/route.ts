import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// 超时配置
const TIMEOUT_CONFIG = {
  requestParsing: 5000, // 5秒 - 请求解析
};

// 超时包装器
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
}

// GET /api/webhook - 获取webhook信息
export async function GET(_request: NextRequest) {
  try {
    return NextResponse.json({
      message: 'Webhook endpoint is active',
      endpoints: {
        logs: '/api/webhook/logs',
        stripe: '/api/webhook/stripe',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Webhook endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// POST /api/webhook - 处理通用webhook请求
export async function POST(request: NextRequest) {
  try {
    const body = await withTimeout(request.json(), TIMEOUT_CONFIG.requestParsing);

    // 记录webhook请求
    console.warn('Webhook received:', {
      timestamp: new Date().toISOString(),
      body,
      headers: Object.fromEntries(request.headers.entries()),
    });

    return NextResponse.json({
      received: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Webhook processing error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // 处理超时错误
    if (error instanceof Error && error.message.includes('timed out')) {
      return NextResponse.json(
        { error: 'Request processing timed out' },
        { status: 408 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 400 },
    );
  }
}
