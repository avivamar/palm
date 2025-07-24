import { NextResponse } from 'next/server';
import { getDB } from '@/libs/DB';

export const dynamic = 'force-dynamic';

// 超时配置
const TIMEOUT_CONFIG = {
  dbConnection: 5000, // 5秒
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

export async function GET() {
  try {
    await withTimeout(getDB(), TIMEOUT_CONFIG.dbConnection);
    return NextResponse.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database health check failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    // 处理超时错误
    if (error instanceof Error && error.message.includes('timed out')) {
      return NextResponse.json(
        { status: 'error', database: 'timeout', error: 'Database connection timed out' },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { status: 'error', database: 'disconnected', error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
