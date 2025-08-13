import type { NextRequest } from 'next/server';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { NextResponse } from 'next/server';

import { getDB } from '@/libs/DB';

// Add runtime declaration for Node.js compatibility
export const runtime = 'nodejs';

/**
 * 🗄️ 数据库迁移 API
 * 仅在生产环境中手动运行迁移
 */
export async function POST(request: NextRequest) {
  try {
    // 安全检查：仅在非生产环境或有特殊授权时允许
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.MIGRATION_SECRET_TOKEN;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized: Migration token required' },
        { status: 401 },
      );
    }

    console.warn('[Migration] 🚀 Starting database migration...');

    // 获取数据库连接
    const db = await getDB();

    // 运行迁移
    await migrate(db, { migrationsFolder: './migrations' });

    console.warn('[Migration] ✅ Database migration completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Migration] ❌ Migration failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

/**
 * 检查数据库状态
 */
export async function GET() {
  try {
    const db = await getDB();

    // 检查关键表是否存在
    const result = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'preorders', 'webhook_logs')
      ORDER BY table_name;
    `);

    console.warn('[Migration] Query result:', result);

    // 处理不同的结果格式
    let rows: any[] = [];
    if (Array.isArray(result)) {
      rows = result;
    } else if (result && typeof result === 'object') {
      if ('rows' in result && Array.isArray(result.rows)) {
        rows = result.rows;
      } else if ('rowsAffected' in result && Array.isArray(result.rows)) {
        rows = result.rows;
      } else if (Array.isArray((result as any).values)) {
        rows = (result as any).values;
      }
    }

    console.warn('[Migration] Processed rows:', rows);

    const existingTables = rows.map((row: any) => {
      // 处理不同的行格式
      if (typeof row === 'object' && row !== null) {
        return row.table_name || row[0];
      }
      return row;
    }).filter(Boolean);

    const requiredTables = ['users', 'preorders', 'webhook_logs'];
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));

    return NextResponse.json({
      status: missingTables.length === 0 ? 'ready' : 'needs_migration',
      existingTables,
      missingTables,
      timestamp: new Date().toISOString(),
      debug: {
        resultType: typeof result,
        resultKeys: result && typeof result === 'object' ? Object.keys(result) : [],
        rowsLength: rows.length,
      },
    });
  } catch (error) {
    console.error('[Migration] ❌ Database status check failed:', error);

    return NextResponse.json(
      {
        status: 'error',
        error: 'Database status check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
