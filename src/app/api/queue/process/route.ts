/**
 * 🚀 转化优先 Redis 队列处理器 API
 * 用于处理异步任务，确保支付流程不被阻塞
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getQueueStats, processQueueTasks } from '@/libs/redis-queue';

// Add runtime declaration for Node.js compatibility
export const runtime = 'nodejs';

// 在Vercel上作为定时任务运行，或者手动触发
export async function POST(request: NextRequest) {
  try {
    // 简单的授权检查
    const authorization = request.headers.get('authorization');
    const validToken = process.env.QUEUE_PROCESSOR_TOKEN;

    if (validToken && authorization !== `Bearer ${validToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[QueueProcessor] 🚀 Starting queue processing...');

    // 处理队列任务
    await processQueueTasks();

    // 获取队列统计
    const stats = await getQueueStats();

    console.log('[QueueProcessor] ✅ Queue processing completed', stats);

    return NextResponse.json({
      success: true,
      message: 'Queue processing completed',
      stats,
    });
  } catch (error) {
    console.error('[QueueProcessor] ❌ Error processing queue:', error);

    return NextResponse.json({
      error: 'Queue processing failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

// 获取队列状态
export async function GET() {
  try {
    const stats = await getQueueStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('[QueueProcessor] ❌ Error getting queue stats:', error);

    return NextResponse.json({
      error: 'Failed to get queue stats',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
