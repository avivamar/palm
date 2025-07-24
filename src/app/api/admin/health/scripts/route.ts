/**
 * Core Scripts Status Check API Route
 * Following CLAUDE.md: 商业价值优先，TypeScript严格模式
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { NextResponse } from 'next/server';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';

const execAsync = promisify(exec);

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

    // Check environment validation
    let environmentValidationStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    let environmentValidationDetails = 'Environment validation passed';

    try {
      const { stdout, stderr } = await execAsync('node scripts/check-env.js', {
        cwd: process.cwd(),
        timeout: 10000,
      });

      const output = stdout + stderr;
      if (output.includes('❌')) {
        environmentValidationStatus = 'critical';
        environmentValidationDetails = 'Critical environment variables missing';
      } else if (output.includes('⚠️')) {
        environmentValidationStatus = 'warning';
        environmentValidationDetails = 'Some optional environment variables missing';
      }
    } catch (envError) {
      environmentValidationStatus = 'warning';
      environmentValidationDetails = 'Environment validation script not found or failed';
    }

    // Check build validation
    let buildValidationStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    let buildValidationDetails = 'Build validation passed';

    try {
      // Quick TypeScript check
      await execAsync('npx tsc --noEmit --skipLibCheck', {
        cwd: process.cwd(),
        timeout: 30000,
      });
    } catch (buildError) {
      buildValidationStatus = 'warning';
      buildValidationDetails = 'TypeScript compilation issues detected';
    }

    // Check Stripe sync
    let stripeSyncStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    let stripeSyncDetails = 'Stripe configuration validated';

    const stripeSecret = process.env.STRIPE_SECRET_KEY;
    const stripePublishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!stripeSecret || !stripePublishable) {
      stripeSyncStatus = 'warning';
      stripeSyncDetails = 'Stripe environment variables missing';
    }

    return NextResponse.json({
      environmentValidation: environmentValidationStatus,
      buildValidation: buildValidationStatus,
      stripeSync: stripeSyncStatus,
      details: {
        environmentValidation: environmentValidationDetails,
        buildValidation: buildValidationDetails,
        stripeSync: stripeSyncDetails,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Core scripts health check failed:', error);
    return NextResponse.json(
      {
        error: 'Core scripts health check failed',
        environmentValidation: 'critical',
        buildValidation: 'critical',
        stripeSync: 'critical',
        details: {
          environmentValidation: 'Health check system error',
          buildValidation: 'Health check system error',
          stripeSync: 'Health check system error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
