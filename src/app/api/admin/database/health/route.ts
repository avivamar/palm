/**
 * 数据库健康检查API
 * 提供数据库性能和健康状态监控
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSafeDB } from '@/libs/DB';
import { sql } from 'drizzle-orm';
import { checkDatabaseHealth } from '@/libs/db-optimization';
import { adminAuth } from '@/libs/adminAuth';

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await adminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const safeDb = await getSafeDB();
    if (!safeDb) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // 获取数据库健康状态
    const health = await checkDatabaseHealth();

    // 获取数据库统计信息
    const stats = await safeDb.execute(sql`
      SELECT 
        schemaname,
        tablename,
        n_live_tup as row_count,
        n_dead_tup as dead_rows,
        last_vacuum,
        last_autovacuum,
        last_analyze,
        last_autoanalyze
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY n_live_tup DESC
    `);

    // 获取数据库大小
    const dbSize = await safeDb.execute(sql`
      SELECT 
        pg_database_size(current_database()) as total_size,
        pg_size_pretty(pg_database_size(current_database())) as total_size_pretty
    `);

    // 获取活跃连接数
    const connections = await safeDb.execute(sql`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections,
        count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
      FROM pg_stat_activity
      WHERE datname = current_database()
    `);

    // 获取索引使用情况
    const indexUsage = await safeDb.execute(sql`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan as scans,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      ORDER BY idx_scan DESC
      LIMIT 20
    `);

    // 获取缓存命中率
    const cacheHitRate = await safeDb.execute(sql`
      SELECT 
        sum(heap_blks_read) as heap_read,
        sum(heap_blks_hit) as heap_hit,
        CASE 
          WHEN sum(heap_blks_read) + sum(heap_blks_hit) > 0 
          THEN round(100.0 * sum(heap_blks_hit) / (sum(heap_blks_read) + sum(heap_blks_hit)), 2)
          ELSE 0
        END as cache_hit_ratio
      FROM pg_statio_user_tables
    `);

    // 获取长时间运行的查询
    const longQueries = await safeDb.execute(sql`
      SELECT 
        pid,
        usename,
        application_name,
        client_addr,
        query_start,
        state,
        LEFT(query, 100) as query_snippet
      FROM pg_stat_activity
      WHERE state != 'idle'
        AND query_start < NOW() - INTERVAL '1 minute'
      ORDER BY query_start
      LIMIT 10
    `);

    // 组装响应
    const response = {
      status: health.status,
      timestamp: new Date().toISOString(),
      database: {
        size: dbSize.rows[0],
        connections: connections.rows[0],
        cacheHitRate: cacheHitRate.rows[0],
      },
      tables: stats.rows,
      indexes: {
        usage: indexUsage.rows,
        count: indexUsage.rows.length,
      },
      longRunningQueries: longQueries.rows,
      health: health,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Database health check error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check database health',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// 执行数据库优化
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await adminAuth(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action } = await request.json();

    const safeDb = await getSafeDB();
    if (!safeDb) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    switch (action) {
      case 'vacuum':
        // 执行VACUUM
        await safeDb.execute(sql`VACUUM ANALYZE`);
        return NextResponse.json({ 
          success: true, 
          message: 'VACUUM ANALYZE completed' 
        });

      case 'reindex':
        // 重建索引
        await safeDb.execute(sql`REINDEX DATABASE CONCURRENTLY`);
        return NextResponse.json({ 
          success: true, 
          message: 'Database reindex completed' 
        });

      case 'analyze':
        // 更新统计信息
        await safeDb.execute(sql`ANALYZE`);
        return NextResponse.json({ 
          success: true, 
          message: 'Statistics updated' 
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Database optimization error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to optimize database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}