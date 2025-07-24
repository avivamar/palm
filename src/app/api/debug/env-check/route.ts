import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // 临时允许访问以调试 Admin 问题
  // TODO: 在问题解决后移除此 API

  const adminEnvVars = {
    ADMIN_EMERGENCY_BYPASS: process.env.ADMIN_EMERGENCY_BYPASS,
    ADMIN_MAINTENANCE_MODE: process.env.ADMIN_MAINTENANCE_MODE,
    ADMIN_ALLOWED_IPS: process.env.ADMIN_ALLOWED_IPS,
    ADMIN_ACCESS_ENABLED: process.env.ADMIN_ACCESS_ENABLED,
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    adminEnvVars,
    clientIP: request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip') || 
              request.headers.get('cf-connecting-ip') || 
              'unknown',
  });
}