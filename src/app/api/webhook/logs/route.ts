import type { NextRequest } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDB } from '@/libs/DB';
import { webhookLogsSchema } from '@/models/Schema';

// 有效的 webhook 状态枚举值
const VALID_WEBHOOK_STATUSES = ['success', 'failed', 'pending', 'retry'] as const;
type ValidWebhookStatus = typeof VALID_WEBHOOK_STATUSES[number];

// 验证 webhook 状态是否有效
function isValidWebhookStatus(status: string): status is ValidWebhookStatus {
  return VALID_WEBHOOK_STATUSES.includes(status as ValidWebhookStatus);
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Number.parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');

    const db = await getDB();

    let query = db.select().from(webhookLogsSchema);

    if (status && status !== 'all') {
      if (!isValidWebhookStatus(status)) {
        return NextResponse.json(
          { error: 'Invalid status parameter', validStatuses: VALID_WEBHOOK_STATUSES },
          { status: 400 },
        );
      }
      query = query.where(eq(webhookLogsSchema.status, status));
    }

    const logs = await query.orderBy(desc(webhookLogsSchema.createdAt)).limit(limit);

    return NextResponse.json({
      logs: logs || [],
      total: logs?.length || 0,
      hasMore: (logs?.length || 0) === limit,
    });
  } catch (error) {
    console.error('Error fetching webhook logs:', error);
    const errorMessage
      = error instanceof Error ? error.message : 'An unknown error occurred';

    // 返回空数据而不是错误，这样调试界面可以正常显示
    return NextResponse.json({
      logs: [],
      total: 0,
      hasMore: false,
      error: `Database error: ${errorMessage}`,
    });
  }
}
