/**
 * Deployment Status API Route
 * Following CLAUDE.md: 商业价值优先，TypeScript严格模式
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getDeployment } from '@/libs/admin/deployment-store';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const deploymentId = searchParams.get('id');

    if (!deploymentId) {
      return NextResponse.json({ error: 'Deployment ID is required' }, { status: 400 });
    }

    const deployment = getDeployment(deploymentId);

    if (!deployment) {
      return NextResponse.json({ error: 'Deployment not found' }, { status: 404 });
    }

    const duration = deployment.endTime
      ? Math.round((new Date(deployment.endTime).getTime() - new Date(deployment.startTime).getTime()) / 1000)
      : undefined;

    return NextResponse.json({
      deploymentId: deployment.id,
      status: deployment.status,
      logs: deployment.logs,
      startTime: deployment.startTime,
      endTime: deployment.endTime,
      duration,
      type: deployment.type,
      branch: deployment.branch,
    });
  } catch (error) {
    console.error('Deployment status error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get deployment status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
