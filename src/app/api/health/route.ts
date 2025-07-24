import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const isRailwayHealthCheck = request.headers.get('user-agent')?.includes('Railway');

  if (isRailwayHealthCheck) {
    // Railway 健康检查的简化响应
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  }

  // 详细的健康检查信息
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
    },
    platform: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
    },
  };

  return NextResponse.json(healthData, { status: 200 });
}

// 支持 HEAD 请求用于简单的健康检查
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
