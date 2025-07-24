/**
 * Database Optimization Script
 * Following CLAUDE.md: 数据库性能优化，索引管理
 */

import { sql } from 'drizzle-orm';
import { getSafeDB } from '@/libs/DB';

/**
 * Database optimization configurations
 */
const OPTIMIZATION_CONFIG = {
  // 索引创建配置
  indexes: [
    // 用户表索引
    {
      name: 'idx_users_email',
      table: 'users',
      columns: ['email'],
      unique: true,
      description: 'Unique index for user email lookups',
    },
    {
      name: 'idx_users_supabase_id',
      table: 'users',
      columns: ['supabase_id'],
      unique: true,
      description: 'Unique index for Supabase ID lookups',
    },
    {
      name: 'idx_users_role_created',
      table: 'users',
      columns: ['role', 'created_at'],
      description: 'Composite index for role-based queries with creation date',
    },

    // 预订表索引
    {
      name: 'idx_preorders_email',
      table: 'preorders',
      columns: ['email'],
      description: 'Index for preorder email lookups',
    },
    {
      name: 'idx_preorders_status',
      table: 'preorders',
      columns: ['status'],
      description: 'Index for preorder status filtering',
    },
    {
      name: 'idx_preorders_created_at',
      table: 'preorders',
      columns: ['created_at'],
      description: 'Index for preorder date range queries',
    },
    {
      name: 'idx_preorders_status_created',
      table: 'preorders',
      columns: ['status', 'created_at'],
      description: 'Composite index for status and date filtering',
    },
    {
      name: 'idx_preorders_user_id',
      table: 'preorders',
      columns: ['user_id'],
      description: 'Index for user preorder lookups',
    },
    {
      name: 'idx_preorders_session_id',
      table: 'preorders',
      columns: ['session_id'],
      description: 'Index for session-based preorder lookups',
    },

    // Webhook 日志索引
    {
      name: 'idx_webhook_logs_event',
      table: 'webhook_logs',
      columns: ['event'],
      description: 'Index for webhook event type filtering',
    },
    {
      name: 'idx_webhook_logs_status',
      table: 'webhook_logs',
      columns: ['status'],
      description: 'Index for webhook status filtering',
    },
    {
      name: 'idx_webhook_logs_created_at',
      table: 'webhook_logs',
      columns: ['created_at'],
      description: 'Index for webhook log date queries',
    },
    {
      name: 'idx_webhook_logs_stripe_event_id',
      table: 'webhook_logs',
      columns: ['stripe_event_id'],
      unique: true,
      description: 'Unique index for Stripe event ID lookups',
    },
    {
      name: 'idx_webhook_logs_preorder_id',
      table: 'webhook_logs',
      columns: ['preorder_id'],
      description: 'Index for preorder-webhook relationship',
    },
  ],

  // 查询优化配置
  queryOptimizations: [
    {
      name: 'analyze_tables',
      description: 'Update table statistics for query planner',
      sql: 'ANALYZE;',
    },
    {
      name: 'vacuum_analyze',
      description: 'Vacuum and analyze all tables',
      sql: 'VACUUM ANALYZE;',
    },
  ],

  // 性能监控查询
  performanceQueries: [
    {
      name: 'slow_queries',
      description: 'Find slow queries',
      sql: `
        SELECT query, mean_exec_time, calls, total_exec_time
        FROM pg_stat_statements
        WHERE mean_exec_time > 1000
        ORDER BY mean_exec_time DESC
        LIMIT 10;
      `,
    },
    {
      name: 'index_usage',
      description: 'Check index usage statistics',
      sql: `
        SELECT 
          schemaname,
          tablename,
          indexname,
          idx_tup_read,
          idx_tup_fetch,
          idx_scan
        FROM pg_stat_user_indexes
        ORDER BY idx_scan DESC;
      `,
    },
    {
      name: 'table_sizes',
      description: 'Check table sizes',
      sql: `
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
      `,
    },
  ],
};

/**
 * Create database indexes
 */
async function createIndexes(): Promise<void> {
  console.log('🔧 Creating database indexes...');

  const db = await getSafeDB();

  for (const index of OPTIMIZATION_CONFIG.indexes) {
    try {
      const indexSql = `
        CREATE INDEX ${index.unique ? 'UNIQUE ' : ''}${index.name} 
        ON ${index.table} (${index.columns.join(', ')})
      `;

      // Check if index already exists
      const existsQuery = `
        SELECT 1 FROM pg_indexes 
        WHERE indexname = '${index.name}'
      `;

      const exists = await db.execute(sql.raw(existsQuery));

      if (!exists || exists.length === 0) {
        await db.execute(sql.raw(indexSql));
        console.log(`✅ Created index: ${index.name} - ${index.description}`);
      } else {
        console.log(`⏭️  Index already exists: ${index.name}`);
      }
    } catch (error) {
      console.error(`❌ Failed to create index ${index.name}:`, error);
    }
  }
}

/**
 * Drop unused indexes
 */
async function dropUnusedIndexes(): Promise<void> {
  console.log('🗑️  Checking for unused indexes...');

  const db = await getSafeDB();

  const unusedIndexQuery = `
    SELECT 
      schemaname,
      tablename,
      indexname,
      idx_scan
    FROM pg_stat_user_indexes
    WHERE idx_scan = 0
    AND NOT indexname LIKE '%_pkey'
    ORDER BY schemaname, tablename, indexname;
  `;

  try {
    const unusedIndexes = await db.execute(sql.raw(unusedIndexQuery));

    if (unusedIndexes.length === 0) {
      console.log('✅ No unused indexes found');
      return;
    }

    console.log(`⚠️  Found ${unusedIndexes.length} unused indexes:`);
    unusedIndexes.forEach((index: any) => {
      console.log(`  - ${index.indexname} on ${index.tablename}`);
    });

    // Note: We don't automatically drop indexes, just report them
    console.log('💡 Consider dropping unused indexes manually if appropriate');
  } catch (error) {
    console.error('❌ Failed to check unused indexes:', error);
  }
}

/**
 * Optimize database performance
 */
async function optimizeDatabase(): Promise<void> {
  console.log('🚀 Optimizing database performance...');

  const db = await getSafeDB();

  for (const optimization of OPTIMIZATION_CONFIG.queryOptimizations) {
    try {
      console.log(`🔧 Running: ${optimization.description}`);
      await db.execute(sql.raw(optimization.sql));
      console.log(`✅ Completed: ${optimization.name}`);
    } catch (error) {
      console.error(`❌ Failed optimization ${optimization.name}:`, error);
    }
  }
}

/**
 * Check database performance metrics
 */
async function checkPerformance(): Promise<void> {
  console.log('📊 Checking database performance...');

  const db = await getSafeDB();

  for (const query of OPTIMIZATION_CONFIG.performanceQueries) {
    try {
      console.log(`\n📈 ${query.description}:`);
      const result = await db.execute(sql.raw(query.sql));

      if (result.length === 0) {
        console.log('  No results found');
        continue;
      }

      // Display results in a readable format
      console.table(result.slice(0, 10)); // Show first 10 results
    } catch (error) {
      console.error(`❌ Failed to run performance query ${query.name}:`, error);
    }
  }
}

/**
 * Run full database optimization
 */
export async function runDatabaseOptimization(): Promise<void> {
  console.log('🎯 Starting database optimization process...');

  try {
    // Step 1: Create indexes
    await createIndexes();

    // Step 2: Optimize database
    await optimizeDatabase();

    // Step 3: Check for unused indexes
    await dropUnusedIndexes();

    // Step 4: Performance check
    await checkPerformance();

    console.log('✅ Database optimization completed successfully!');
  } catch (error) {
    console.error('❌ Database optimization failed:', error);
    throw error;
  }
}

/**
 * Health check for database
 */
export async function databaseHealthCheck(): Promise<boolean> {
  try {
    const db = await getSafeDB();

    // Basic connectivity test
    await db.execute(sql.raw('SELECT 1 as health_check'));

    // Check if critical tables exist
    const tableCheck = await db.execute(sql.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'preorders', 'webhook_logs')
    `));

    if (tableCheck.length < 3) {
      console.error('❌ Critical tables missing');
      return false;
    }

    console.log('✅ Database health check passed');
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<any> {
  const db = await getSafeDB();

  const stats = await db.execute(sql.raw(`
    SELECT 
      schemaname,
      tablename,
      n_tup_ins as inserts,
      n_tup_upd as updates,
      n_tup_del as deletes,
      n_live_tup as live_tuples,
      n_dead_tup as dead_tuples,
      last_vacuum,
      last_autovacuum,
      last_analyze,
      last_autoanalyze
    FROM pg_stat_user_tables
    ORDER BY n_live_tup DESC;
  `));

  return stats;
}

// CLI interface when run directly
if (require.main === module) {
  const command = process.argv[2];

  switch (command) {
    case 'optimize':
      runDatabaseOptimization();
      break;
    case 'health':
      databaseHealthCheck();
      break;
    case 'stats':
      getDatabaseStats().then(stats => console.table(stats));
      break;
    default:
      console.log('Usage: node db-optimize.js [optimize|health|stats]');
  }
}
