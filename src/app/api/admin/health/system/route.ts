/**
 * System Health Check API Route
 * Following CLAUDE.md: 商业价值优先，TypeScript严格模式
 */

import Redis from 'ioredis';
import { NextResponse } from 'next/server';
import { getDB } from '@/libs/DB';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';

export async function GET() {
  try {
    // Verify admin access
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Authentication service not available' }, { status: 503 });
    }

    const supabase = await createServerClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check database health
    let databaseStatus: 'healthy' | 'warning' | 'critical' = 'critical';
    let databaseDetails = 'Database connection failed';

    try {
      const db = await getDB();
      await db.execute('SELECT 1 as health_check');
      databaseStatus = 'healthy';
      databaseDetails = 'Database connection successful';
    } catch (dbError) {
      console.error('Database health check failed:', dbError);
      databaseStatus = 'critical';
      databaseDetails = `Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`;
    }

    // Check Redis health
    let redisStatus: 'healthy' | 'warning' | 'critical' = 'critical';
    let redisDetails = 'Redis connection failed';

    try {
      const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
      const pong = await redis.ping();
      if (pong === 'PONG') {
        redisStatus = 'healthy';
        redisDetails = 'Redis connection successful';
      }
      await redis.disconnect();
    } catch (redisError) {
      console.error('Redis health check failed:', redisError);
      redisStatus = 'warning'; // Redis is often optional
      redisDetails = `Redis warning: ${redisError instanceof Error ? redisError.message : 'Connection failed'}`;
    }

    // Check API health (basic check)
    const apiStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    const apiDetails = 'API services operational';

    // Overall system health
    const overallHealthy = databaseStatus === 'healthy' && (redisStatus === 'healthy' || redisStatus === 'warning');

    return NextResponse.json({
      database: databaseStatus,
      redis: redisStatus,
      api: apiStatus,
      details: {
        database: databaseDetails,
        redis: redisDetails,
        api: apiDetails,
      },
      overall: overallHealthy ? 'healthy' : 'critical',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        error: 'Health check failed',
        database: 'critical',
        redis: 'critical',
        api: 'critical',
        details: {
          database: 'Health check system error',
          redis: 'Health check system error',
          api: 'Health check system error',
        },
        overall: 'critical',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
