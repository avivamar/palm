import { NextResponse } from 'next/server';
import { getSafeDB } from '@/libs/DB';

export const dynamic = 'force-dynamic';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      stripe: 'unknown',
      klaviyo: 'unknown',
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_TYPE: 'PostgreSQL',
    },
  };

  try {
    // Check database connection
    await getSafeDB();
    health.services.database = 'connected';
  } catch (error) {
    console.error('Database health check failed:', error);
    health.services.database = 'failed';
    health.status = 'degraded';
  }

  // Check Stripe configuration
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET) {
    health.services.stripe = 'configured';
  } else {
    health.services.stripe = 'not_configured';
    health.status = 'degraded';
  }

  // Check Klaviyo configuration
  if (process.env.KLAVIYO_API_KEY) {
    health.services.klaviyo = 'configured';
  } else {
    health.services.klaviyo = 'not_configured';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;

  return new NextResponse(JSON.stringify(health, null, 2), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });
}
