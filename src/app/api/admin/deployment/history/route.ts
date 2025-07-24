/**
 * Deployment History API Route
 * Following CLAUDE.md: 商业价值优先，TypeScript严格模式
 */

import { NextResponse } from 'next/server';
import { getAllDeployments } from '@/libs/admin/deployment-store';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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

    const deployments = getAllDeployments();

    const formattedDeployments = deployments.map((deployment) => {
      const duration = deployment.endTime
        ? Math.round((new Date(deployment.endTime).getTime() - new Date(deployment.startTime).getTime()) / 1000)
        : undefined;

      return {
        deploymentId: deployment.id,
        status: deployment.status,
        logs: deployment.logs,
        startTime: deployment.startTime,
        endTime: deployment.endTime,
        duration,
        type: deployment.type,
        branch: deployment.branch,
      };
    });

    return NextResponse.json(formattedDeployments);
  } catch (error) {
    console.error('Deployment history error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get deployment history',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
