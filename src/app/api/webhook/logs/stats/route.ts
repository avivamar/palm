import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDB } from '@/libs/DB';
import { preordersSchema, webhookLogsSchema } from '@/models/Schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDB();

    // 简化的统计查询，避免复杂的SQL聚合
    const webhookStats = {
      total: 0,
      success: 0,
      failed: 0,
      pending: 0,
      klaviyo_success: 0,
      klaviyo_total: 0,
    };
    const preorderStats = { total: 0, completed: 0 };

    try {
      // 获取 webhook 详细统计 - 使用更简单且兼容的查询方式
      const webhookCount = await db.select({
        total: sql<number>`count(*)`,
      }).from(webhookLogsSchema);

      webhookStats.total = Number(webhookCount[0]?.total || 0);

      // 分别查询不同状态的 webhook 数量
      if (webhookStats.total > 0) {
        const successCount = await db.select({
          count: sql<number>`count(*)`,
        }).from(webhookLogsSchema).where(sql`status = 'success'`);

        const failedCount = await db.select({
          count: sql<number>`count(*)`,
        }).from(webhookLogsSchema).where(sql`status = 'failed'`);

        const pendingCount = await db.select({
          count: sql<number>`count(*)`,
        }).from(webhookLogsSchema).where(sql`status = 'pending'`);

        const klaviyoSuccessCount = await db.select({
          count: sql<number>`count(*)`,
        }).from(webhookLogsSchema).where(sql`klaviyo_event_sent = true`);

        const klaviyoTotalCount = await db.select({
          count: sql<number>`count(*)`,
        }).from(webhookLogsSchema).where(sql`klaviyo_event_sent IS NOT NULL`);

        webhookStats.success = Number(successCount[0]?.count || 0);
        webhookStats.failed = Number(failedCount[0]?.count || 0);
        webhookStats.pending = Number(pendingCount[0]?.count || 0);
        webhookStats.klaviyo_success = Number(klaviyoSuccessCount[0]?.count || 0);
        webhookStats.klaviyo_total = Number(klaviyoTotalCount[0]?.count || 0);
      }

      // 获取预订统计
      const preorderCount = await db.select({
        total: sql<number>`count(*)`,
      }).from(preordersSchema);

      preorderStats.total = Number(preorderCount[0]?.total || 0);

      // 获取已完成的预订数量
      if (preorderStats.total > 0) {
        const completedCount = await db.select({
          count: sql<number>`count(*)`,
        }).from(preordersSchema).where(sql`status = 'completed'`);

        preorderStats.completed = Number(completedCount[0]?.count || 0);
      }
    } catch (dbError) {
      console.error('Database query error:', dbError);
      // 继续执行，返回默认值
    }

    // 计算 Klaviyo 成功率
    const klaviyoSuccessRate = webhookStats.klaviyo_total > 0
      ? (webhookStats.klaviyo_success / webhookStats.klaviyo_total) * 100
      : 100; // 默认100%

    const stats = {
      total_preorders: preorderStats.total,
      completed_preorders: preorderStats.completed,
      webhook_logs_count: webhookStats.total,
      webhook_success: webhookStats.success,
      webhook_failed: webhookStats.failed,
      webhook_pending: webhookStats.pending,
      klaviyo_success_rate: klaviyoSuccessRate,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching webhook stats:', error);

    // 返回默认统计数据而不是错误
    const defaultStats = {
      total_preorders: 0,
      completed_preorders: 0,
      webhook_logs_count: 0,
      webhook_success: 0,
      webhook_failed: 0,
      webhook_pending: 0,
      klaviyo_success_rate: 100,
      error: `Stats error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };

    return NextResponse.json(defaultStats);
  }
}
