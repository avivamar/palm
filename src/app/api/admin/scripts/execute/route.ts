/**
 * Script Execution API Route
 * Following CLAUDE.md: 商业价值优先，TypeScript严格模式
 */

import type { NextRequest } from 'next/server';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { NextResponse } from 'next/server';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';

const execAsync = promisify(exec);

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type ScriptConfig = {
  command: string;
  timeout: number;
  description: string;
};

const SCRIPT_CONFIGS: Record<string, ScriptConfig> = {
  'check-env.js': {
    command: 'node scripts/check-env.js',
    timeout: 10000,
    description: 'Environment variables validation',
  },
  'check-stripe.js': {
    command: 'node scripts/check-stripe.js',
    timeout: 15000,
    description: 'Stripe API connection test',
  },
  'check-supabase.js': {
    command: 'node scripts/check-supabase.js',
    timeout: 10000,
    description: 'Supabase connection verification',
  },
  'check-db-status.js': {
    command: 'node scripts/check-db-status.js',
    timeout: 10000,
    description: 'Database connectivity check',
  },
  'validate-locales.js': {
    command: 'node scripts/validate-locales.js',
    timeout: 10000,
    description: 'Internationalization files validation',
  },
  'sync-colors.js': {
    command: 'node scripts/sync-colors.js',
    timeout: 10000,
    description: 'Brand colors synchronization',
  },
  'railway-safe-build.sh': {
    command: 'bash scripts/railway-safe-build.sh',
    timeout: 300000, // 5 minutes
    description: 'Railway deployment with safety checks',
  },
  'pre-push-validation.sh': {
    command: 'bash scripts/pre-push-validation.sh',
    timeout: 60000,
    description: 'Pre-push validation checks',
  },
};

// 正在运行的脚本进程
const runningProcesses = new Map<string, any>();

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { scriptName, category } = body;

    if (!scriptName || typeof scriptName !== 'string') {
      return NextResponse.json({ error: 'Script name is required' }, { status: 400 });
    }

    // Validate script is allowed
    const scriptConfig = SCRIPT_CONFIGS[scriptName];
    if (!scriptConfig) {
      return NextResponse.json({
        error: `Script "${scriptName}" is not allowed or does not exist`,
        allowedScripts: Object.keys(SCRIPT_CONFIGS),
      }, { status: 400 });
    }

    console.log(`Executing script: ${scriptName} (category: ${category})`);

    const startTime = Date.now();

    try {
      const { stdout, stderr } = await execAsync(scriptConfig.command, {
        cwd: process.cwd(),
        timeout: scriptConfig.timeout,
        encoding: 'utf8',
      });

      const executionTime = Date.now() - startTime;
      const output = stdout + (stderr ? `\n${stderr}` : '');

      // Determine success based on output content and exit code
      const hasErrors = output.includes('❌') || output.includes('Error:') || output.includes('Failed:');
      const success = !hasErrors;

      return NextResponse.json({
        success,
        output: output || `✅ Script ${scriptName} executed successfully`,
        executionTime,
        timestamp: new Date().toISOString(),
        category,
        scriptName,
      });
    } catch (execError: any) {
      const executionTime = Date.now() - startTime;
      const errorMessage = execError.message || 'Script execution failed';

      console.error(`Script execution failed for ${scriptName}:`, execError);

      return NextResponse.json({
        success: false,
        output: `❌ Script execution failed:\n${errorMessage}`,
        executionTime,
        timestamp: new Date().toISOString(),
        error: errorMessage,
        category,
        scriptName,
      });
    }
  } catch (error) {
    console.error('Script execution API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// 停止脚本执行
export async function DELETE(request: NextRequest) {
  try {
    const { scriptId } = await request.json();

    if (runningProcesses.has(scriptId)) {
      const process = runningProcesses.get(scriptId);
      process.kill('SIGTERM');
      runningProcesses.delete(scriptId);

      return NextResponse.json({
        success: true,
        message: `脚本 ${scriptId} 已停止`,
      });
    }

    return NextResponse.json(
      { error: '脚本未在运行' },
      { status: 404 },
    );
  } catch (error) {
    console.error('[ScriptExecution] 停止脚本错误:', error);
    return NextResponse.json(
      { error: '停止脚本失败' },
      { status: 500 },
    );
  }
}

// 获取运行状态
export async function GET() {
  try {
    const runningScripts = Array.from(runningProcesses.keys());

    return NextResponse.json({
      runningScripts,
      availableScripts: Object.keys(SCRIPT_CONFIGS),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[ScriptExecution] 获取状态错误:', error);
    return NextResponse.json(
      { error: '获取状态失败' },
      { status: 500 },
    );
  }
}
