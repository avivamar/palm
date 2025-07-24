import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    deployment: process.env.VERCEL ? 'vercel' : 'local',
    region: process.env.VERCEL_REGION || 'local',

    // 检查关键环境变量
    environment_variables: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      APP_URL: !!process.env.APP_URL,
      NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
      FIREBASE_SERVICE_ACCOUNT_KEY: !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
      KLAVIYO_API_KEY: !!process.env.KLAVIYO_API_KEY,
    },

    // URL配置检查
    urls: {
      app_url: process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'NOT_SET',
      webhook_url: `${process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'NOT_SET'}/api/webhooks/stripe`,
      is_https: (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || '').startsWith('https://'),
      is_localhost: (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || '').includes('localhost'),
    },

    // 缺失的关键变量
    missing_critical_vars: [] as string[],
  };

  // 检查缺失的关键环境变量
  const criticalVars = ['DATABASE_URL', 'STRIPE_SECRET_KEY', 'APP_URL'];
  criticalVars.forEach((varName) => {
    if (!process.env[varName]) {
      checks.missing_critical_vars.push(varName);
    }
  });

  // 总体健康状态
  const isHealthy = checks.missing_critical_vars.length === 0;

  return NextResponse.json({
    ...checks,
    status: isHealthy ? 'HEALTHY' : 'CRITICAL_ISSUES',
    message: isHealthy
      ? 'All critical environment variables are configured'
      : `Missing critical variables: ${checks.missing_critical_vars.join(', ')}`,
  }, {
    status: isHealthy ? 200 : 500,
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'application/json',
    },
  });
}
