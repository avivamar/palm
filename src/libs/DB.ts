import type { PgliteDatabase } from 'drizzle-orm/pglite';
import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/models/Schema';

// 检查是否在 Vercel 环境中
const isVercelEnvironment = process.env.VERCEL === '1';

// Vercel 优化的数据库配置
const getPostgresConfig = () => {
  if (isVercelEnvironment) {
    return {
      connect_timeout: 10, // 10秒连接超时
      idle_timeout: 30, // 30秒空闲超时
      max_lifetime: 300, // 5分钟最大生命周期
      max: 1, // Vercel 环境限制连接数
      prepare: false, // 禁用预处理语句以减少内存使用
      transform: {
        undefined: null, // 将 undefined 转换为 null
      },
    };
  }

  // 优化后的生产环境配置
  return {
    connect_timeout: 30,
    idle_timeout: 60,
    max_lifetime: 600,
    max: 20, // 增加连接池大小
    prepare: true,
    // 新增性能优化配置
    statement_timeout: 30000, // 30秒语句超时
    query_timeout: 25000, // 25秒查询超时
    transform: {
      undefined: null,
    },
    // 连接池健康检查
    onnotice: (notice: any) => {
      console.warn('[DB] Notice:', notice);
    },
    // 连接池错误处理
    onparameter: (key: string, value: any) => {
      if (key === 'server_version') {
        console.log(`[DB] PostgreSQL version: ${value}`);
      }
    },
  };
};

let dbInstance: any = null;
let initializationPromise: Promise<any> | null = null;

const initializePGlite = async () => {
  // Stores the db connection in the global scope to prevent multiple instances due to hot reloading with Next.js
  const global = globalThis as unknown as { client: PGlite; drizzle: PgliteDatabase<typeof schema> };

  if (!global.client) {
    global.client = new PGlite();
    await global.client.waitReady;
    global.drizzle = drizzlePglite(global.client, { schema });
    console.warn('PGlite database initialized successfully (fallback database)');
  }

  dbInstance = global.drizzle;
  return dbInstance;
};

const initializeDatabase = async () => {
  if (dbInstance) {
    return dbInstance;
  }

  if (initializationPromise) {
    return await initializationPromise;
  }

  initializationPromise = (async () => {
    if (process.env.DATABASE_URL) {
      try {
        console.warn(`[DB] Initializing PostgreSQL (Vercel: ${isVercelEnvironment})...`);

        const config = getPostgresConfig();
        console.warn(`[DB] Using config:`, {
          timeout: config.connect_timeout,
          max: config.max,
          prepare: config.prepare,
        });

        // 设置数据库操作超时
        const dbTimeout = isVercelEnvironment ? 8000 : 15000;

        const initPromise = (async () => {
          // Set SSL environment for Railway/Supabase compatibility
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

          const sql = postgres(process.env.DATABASE_URL!, config);

          // 测试连接
          await sql`SELECT 1`;

          console.warn('[DB] ✅ PostgreSQL connection test passed');

          dbInstance = drizzlePg(sql, { schema });
          console.warn('[DB] ✅ PostgreSQL connected successfully');
          return dbInstance;
        })();

        // 使用超时包装器
        const result = await Promise.race([
          initPromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Database connection timeout after ${dbTimeout}ms`)), dbTimeout),
          ),
        ]);

        return result;
      } catch (error) {
        console.error('[DB] ❌ PostgreSQL connection failed:', {
          error: error instanceof Error ? error.message : String(error),
          isVercel: isVercelEnvironment,
          hasUrl: !!process.env.DATABASE_URL,
        });

        // 在生产环境中不允许回退到 PGlite
        if (isVercelEnvironment || process.env.NODE_ENV === 'production') {
          console.error('[DB] 🚨 Production environment requires PostgreSQL connection');
          throw new Error(`Production database connection failed: ${error instanceof Error ? error.message : String(error)}`);
        }

        console.warn('[DB] 🔄 Falling back to PGlite...');
        return await initializePGlite();
      }
    } else {
      console.warn('[DB] No DATABASE_URL found, using PGlite');
      return await initializePGlite();
    }
  })();

  const result = await initializationPromise;
  initializationPromise = null;
  return result;
};

// Export a function that returns the database instance
export const getDB = async () => {
  return await initializeDatabase();
};

// Safe database getter - ensures database is initialized before use
export const getSafeDB = async () => {
  try {
    const database = await getDB();
    if (!database) {
      throw new Error('Database initialization failed');
    }
    return database;
  } catch (error) {
    console.error('Failed to get database instance:', error);
    throw new Error('Database unavailable');
  }
};
