/**
 * Environment Variables Check API
 * Following .cursorrules: TypeScript strict mode, clear types, minimal code
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { NextResponse } from 'next/server';

const execAsync = promisify(exec);

// Force dynamic rendering
export const dynamic = 'force-dynamic';

type EnvCheckResult = {
  status: 'success' | 'warning' | 'error';
  message: string;
  details: string[];
  timestamp: string;
};

export async function GET(): Promise<NextResponse<EnvCheckResult>> {
  try {
    // Execute environment check script
    const { stdout, stderr } = await execAsync('node scripts/check-env.js', {
      cwd: process.cwd(),
      timeout: 10000, // 10 second timeout
    });

    // Parse output to determine status
    const output = stdout + stderr;
    const hasErrors = output.includes('❌');
    const hasWarnings = output.includes('⚠️');

    let status: 'success' | 'warning' | 'error' = 'success';
    if (hasErrors) {
      status = 'error';
    } else if (hasWarnings) {
      status = 'warning';
    }

    // Extract key information
    const lines = output.split('\n').filter(line => line.trim());
    const details = lines.filter(line =>
      line.includes('✅') || line.includes('❌') || line.includes('⚠️'),
    );

    return NextResponse.json({
      status,
      message: status === 'success'
        ? 'All environment variables configured correctly'
        : status === 'warning'
          ? 'Some optional environment variables missing'
          : 'Critical environment variables missing',
      details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Environment check failed:', error);

    return NextResponse.json({
      status: 'error',
      message: 'Failed to execute environment check',
      details: [error instanceof Error ? error.message : 'Unknown error'],
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
