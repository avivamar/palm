import { NextResponse } from 'next/server';
import { getDB } from '@/libs/DB';
import { createServerClient } from '@/libs/supabase/config';

// 超时配置
const TIMEOUT_CONFIG = {
  database: 5000, // 5秒
  supabase: 5000, // 5秒
  stripe: 8000, // 8秒
  overall: 30000, // 30秒总超时
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
  const startTime = Date.now();

  // 整体超时控制
  const overallTimeout = setTimeout(() => {
    console.error('Health check overall timeout reached');
  }, TIMEOUT_CONFIG.overall);

  const healthCheck = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    deployment: process.env.VERCEL ? 'vercel' : 'local',
    region: process.env.VERCEL_REGION || 'local',
    checks: {} as Record<string, any>,
    summary: { passed: 0, failed: 0, total: 0 },
    executionTime: 0,
    overall_status: '' as string,
    suggestions: [] as any[],
  };

  // 检查1: 环境变量
  try {
    const requiredEnvs = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      APP_URL: !!process.env.APP_URL,
      NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
      FIREBASE_SERVICE_ACCOUNT_KEY: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      KLAVIYO_API_KEY: !!process.env.KLAVIYO_API_KEY,
    };

    const missingEnvs = Object.entries(requiredEnvs)
      .filter(([, exists]) => !exists)
      .map(([key]) => key);

    healthCheck.checks.environment_variables = {
      status: missingEnvs.length === 0 ? 'PASSED' : 'FAILED',
      details: requiredEnvs,
      missing: missingEnvs,
      critical_missing: missingEnvs.filter(env =>
        ['DATABASE_URL', 'STRIPE_SECRET_KEY'].includes(env),
      ),
    };

    if (missingEnvs.length === 0) {
      healthCheck.summary.passed++;
    } else {
      healthCheck.summary.failed++;
    }
  } catch (error) {
    healthCheck.checks.environment_variables = {
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    healthCheck.summary.failed++;
  }

  // 检查2: 数据库连接
  try {
    const db = await withTimeout(getDB(), TIMEOUT_CONFIG.database);

    // 简单查询测试
    const testQuery = await withTimeout(
      db.execute('SELECT 1 as test'),
      TIMEOUT_CONFIG.database,
    ) as any;

    // 检查关键表
    const tablesCheck = await withTimeout(
      db.execute(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('preorders', 'users', 'webhook_logs')
      `),
      TIMEOUT_CONFIG.database,
    ) as any;

    const databaseCheck = {
      status: 'PASSED' as const,
      connection: 'connected',
      test_query: testQuery.rows[0]?.test === 1,
      tables_found: tablesCheck.rows.map((r: { table_name: string }) => r.table_name),
      expected_tables: ['preorders', 'users', 'webhook_logs'],
    };

    healthCheck.checks.database = databaseCheck;
    healthCheck.summary.passed++;
  } catch (error) {
    const isTimeout = error instanceof Error && error.message.includes('timed out');
    healthCheck.checks.database = {
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Database connection failed',
      details: isTimeout ? 'Database operation timed out' : 'Cannot connect to PostgreSQL database',
      timeout: isTimeout,
    };
    healthCheck.summary.failed++;
  }

  // 检查3: Supabase Auth
  try {
    const supabase = await withTimeout(
      createServerClient(),
      TIMEOUT_CONFIG.supabase,
    );

    // 测试会话获取
    const sessionResult = await withTimeout(
      supabase.auth.getSession(),
      TIMEOUT_CONFIG.supabase,
    ) as { data: { session: any }; error: any };
    const { error } = sessionResult;

    healthCheck.checks.supabase_auth = {
      status: 'PASSED',
      initialized: true,
      service: 'supabase',
      session_check: !error,
      error_message: error?.message || null,
    };
    healthCheck.summary.passed++;
  } catch (error) {
    const isTimeout = error instanceof Error && error.message.includes('timed out');
    healthCheck.checks.supabase_auth = {
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Supabase Auth error',
      hint: isTimeout ? 'Supabase initialization timed out' : 'Check SUPABASE_URL and SUPABASE_ANON_KEY',
      timeout: isTimeout,
    };
    healthCheck.summary.failed++;
  }

  // 检查4: Stripe配置
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    const Stripe = require('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-06-30.basil',
    });

    // 测试Stripe连接
    const account = await withTimeout(
      stripe.accounts.retrieve(),
      TIMEOUT_CONFIG.stripe,
    ) as any;

    healthCheck.checks.stripe = {
      status: 'PASSED',
      account_id: account.id,
      country: account.country,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
    };
    healthCheck.summary.passed++;
  } catch (error) {
    const isTimeout = error instanceof Error && error.message.includes('timed out');
    healthCheck.checks.stripe = {
      status: 'FAILED',
      error: error instanceof Error ? error.message : 'Stripe error',
      hint: isTimeout ? 'Stripe API call timed out' : 'Check STRIPE_SECRET_KEY validity',
      timeout: isTimeout,
    };
    healthCheck.summary.failed++;
  }

  // 检查5: URL配置
  try {
    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;

    healthCheck.checks.urls = {
      status: appUrl ? 'PASSED' : 'FAILED',
      app_url: appUrl || 'missing',
      webhook_url: appUrl ? `${appUrl}/api/webhooks/stripe` : 'cannot_construct',
      is_https: appUrl?.startsWith('https://') || false,
      is_localhost: appUrl?.includes('localhost') || false,
    };

    if (appUrl) {
      healthCheck.summary.passed++;
    } else {
      healthCheck.summary.failed++;
    }
  } catch (error) {
    healthCheck.checks.urls = {
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'URL check error',
    };
    healthCheck.summary.failed++;
  }

  // 总结
  healthCheck.summary.total = healthCheck.summary.passed + healthCheck.summary.failed;
  healthCheck.executionTime = Date.now() - startTime;
  healthCheck.overall_status = healthCheck.summary.failed === 0 ? 'HEALTHY' : 'ISSUES_DETECTED';

  // 添加修复建议
  const suggestions = [] as any[];

  if (healthCheck.checks.environment_variables?.status === 'FAILED') {
    suggestions.push({
      issue: 'Missing environment variables',
      action: 'Add missing variables to Vercel project settings',
      priority: 'HIGH',
    });
  }

  if (healthCheck.checks.database?.status === 'FAILED') {
    suggestions.push({
      issue: 'Database connection failed',
      action: 'Check DATABASE_URL and database accessibility from Vercel',
      priority: 'CRITICAL',
    });
  }

  if (healthCheck.checks.supabase_auth?.status === 'FAILED') {
    suggestions.push({
      issue: 'Supabase Auth initialization failed',
      action: 'Verify SUPABASE_URL and SUPABASE_ANON_KEY environment variables',
      priority: 'MEDIUM',
    });
  }

  if (healthCheck.checks.stripe?.status === 'FAILED') {
    suggestions.push({
      issue: 'Stripe connection failed',
      action: 'Verify STRIPE_SECRET_KEY and account status',
      priority: 'CRITICAL',
    });
  }

  healthCheck.suggestions = suggestions;

  // 清除总超时
  clearTimeout(overallTimeout);

  const responseStatus = healthCheck.overall_status === 'HEALTHY' ? 200 : 500;

  return NextResponse.json(healthCheck, {
    status: responseStatus,
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
    },
  });
}
