/**
 * 数据库查询优化工具
 * 提供优化的查询方法和性能监控
 */

import { getSafeDB } from '@/libs/DB';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { 
  usersSchema, 
  preordersSchema, 
  palmAnalysisSessionsSchema
} from '@/models/Schema';

/**
 * 优化的用户查询
 */
export const optimizedUserQueries = {
  // 通过邮箱查找用户（使用索引）
  async findByEmail(email: string) {
    const db = await getSafeDB();
    return await db
      .select()
      .from(usersSchema)
      .where(sql`LOWER(${usersSchema.email}) = LOWER(${email})`)
      .limit(1);
  },

  // 获取用户统计（使用聚合索引）
  async getUserStats(userId: string) {
    const db = await getSafeDB();
    const [orders, sessions] = await Promise.all([
      // 订单统计
      db
        .select({
          total: sql<number>`count(*)`,
          completed: sql<number>`count(*) filter (where status = 'completed')`,
          revenue: sql<number>`coalesce(sum(stripe_amount), 0)`,
        })
        .from(preordersSchema)
        .where(eq(preordersSchema.userId, userId)),

      // Palm分析统计
      db
        .select({
          total: sql<number>`count(*)`,
          completed: sql<number>`count(*) filter (where status = 'completed')`,
        })
        .from(palmAnalysisSessionsSchema)
        .where(eq(palmAnalysisSessionsSchema.userId, userId)),
    ]);

    return {
      orders: orders[0],
      sessions: sessions[0],
    };
  },

  // 批量获取用户（避免N+1查询）
  async findManyByIds(userIds: string[]) {
    if (userIds.length === 0) return [];
    
    const db = await getSafeDB();
    return await db
      .select()
      .from(usersSchema)
      .where(sql`${usersSchema.id} = ANY(${userIds})`);
  },
};

/**
 * 优化的订单查询
 */
export const optimizedOrderQueries = {
  // 获取最近订单（使用复合索引）
  async getRecentOrders(limit = 10, offset = 0) {
    const db = await getSafeDB();
    return await db
      .select({
        order: preordersSchema,
        user: usersSchema,
      })
      .from(preordersSchema)
      .leftJoin(usersSchema, eq(preordersSchema.userId, usersSchema.id))
      .orderBy(desc(preordersSchema.createdAt))
      .limit(limit)
      .offset(offset);
  },

  // 按状态获取订单（使用索引）
  async getOrdersByStatus(status: 'initiated' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled', limit = 100) {
    const db = await getSafeDB();
    return await db
      .select()
      .from(preordersSchema)
      .where(eq(preordersSchema.status, status))
      .orderBy(desc(preordersSchema.createdAt))
      .limit(limit);
  },

  // 获取订单统计（使用聚合）
  async getOrderStats(startDate?: Date) {
    const db = await getSafeDB();
    const conditions = startDate 
      ? [gte(preordersSchema.createdAt, startDate)]
      : [];

    return await db
      .select({
        status: preordersSchema.status,
        count: sql<number>`count(*)`,
        totalAmount: sql<number>`coalesce(sum(stripe_amount), 0)`,
      })
      .from(preordersSchema)
      .where(and(...conditions))
      .groupBy(preordersSchema.status);
  },
};

/**
 * 优化的Palm分析查询
 */
export const optimizedPalmQueries = {
  // 获取用户的分析历史
  async getUserAnalysisHistory(userId: string, limit = 10) {
    const db = await getSafeDB();
    return await db
      .select()
      .from(palmAnalysisSessionsSchema)
      .where(eq(palmAnalysisSessionsSchema.userId, userId))
      .orderBy(desc(palmAnalysisSessionsSchema.createdAt))
      .limit(limit);
  },

  // 获取待处理的分析
  async getPendingAnalysis(limit = 10) {
    const db = await getSafeDB();
    return await db
      .select()
      .from(palmAnalysisSessionsSchema)
      .where(eq(palmAnalysisSessionsSchema.status, 'pending'))
      .orderBy(palmAnalysisSessionsSchema.createdAt)
      .limit(limit);
  },

  // 获取分析统计
  async getAnalysisStats() {
    const db = await getSafeDB();
    return await db
      .select({
        status: palmAnalysisSessionsSchema.status,
        analysisType: palmAnalysisSessionsSchema.analysisType,
        count: sql<number>`count(*)`,
        avgProcessingTime: sql<number>`avg(processing_time)`,
      })
      .from(palmAnalysisSessionsSchema)
      .groupBy(
        palmAnalysisSessionsSchema.status,
        palmAnalysisSessionsSchema.analysisType
      );
  },
};

// 推荐系统查询将在推荐功能实现后添加

/**
 * 数据库健康检查
 */
export async function checkDatabaseHealth() {
  try {
    const db = await getSafeDB();
    
    // 检查连接
    await db.execute(sql`SELECT 1`);
    
    // 检查表大小
    const tableSizes = await db.execute(sql`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `);

    // 检查慢查询（需要pg_stat_statements扩展）
    let slowQueries = [];
    try {
      slowQueries = await db.execute(sql`
        SELECT 
          query,
          calls,
          total_exec_time,
          mean_exec_time,
          max_exec_time
        FROM pg_stat_statements
        WHERE mean_exec_time > 1000
        ORDER BY mean_exec_time DESC
        LIMIT 10
      `);
    } catch (e) {
      // pg_stat_statements可能未启用
    }

    return {
      status: 'healthy',
      tableSizes,
      slowQueries,
      timestamp: new Date(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
    };
  }
}

/**
 * 执行VACUUM和ANALYZE维护
 */
export async function performMaintenance() {
  const db = await getSafeDB();
  const tables = [
    'users',
    'preorders',
    'palm_analysis_sessions',
    'user_images',
    'webhook_logs',
  ];

  for (const table of tables) {
    try {
      await db.execute(sql`VACUUM ANALYZE ${sql.identifier(table)}`);
      console.log(`✅ Maintained table: ${table}`);
    } catch (error) {
      console.error(`❌ Failed to maintain table ${table}:`, error);
    }
  }
}

// 导出所有优化的查询
export const optimizedQueries = {
  users: optimizedUserQueries,
  orders: optimizedOrderQueries,
  palm: optimizedPalmQueries,
};