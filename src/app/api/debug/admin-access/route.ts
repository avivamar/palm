/**
 * Admin Access Debug API
 * 用于调试 Admin 访问控制问题
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAccessConfig } from '@/libs/admin-access-control';

/**
 * 调试版本的访问检查 - 不受 IP 和维护模式限制
 */
function debugCheckAdminAccess(request: NextRequest) {
  const config = getAdminAccessConfig();
  const clientIP = request.headers.get('x-forwarded-for') 
    || request.headers.get('x-real-ip') 
    || request.headers.get('cf-connecting-ip')
    || 'unknown';

  // 紧急旁路检查
  if (config.emergencyBypass) {
    return {
      allowed: true,
      reason: 'Emergency bypass enabled',
      config,
    };
  }

  // 对于调试 API，我们总是允许访问，但会报告实际的访问状态
  return {
    allowed: true, // 调试 API 总是允许访问
    reason: 'Debug API access granted',
    config,
    actualAccessStatus: {
      wouldBeAllowed: config.enabled && 
        (!config.maintenanceMode || (config.allowedIPs && config.allowedIPs.includes(clientIP))) &&
        (!config.allowedIPs || config.allowedIPs.length === 0 || config.allowedIPs.includes(clientIP)),
      blockingFactors: [
        ...(!config.enabled ? ['Admin access disabled'] : []),
        ...(config.maintenanceMode && config.allowedIPs && !config.allowedIPs.includes(clientIP) ? ['Maintenance mode with IP restriction'] : []),
        ...(config.allowedIPs && config.allowedIPs.length > 0 && !config.allowedIPs.includes(clientIP) ? [`IP ${clientIP} not in whitelist`] : [])
      ]
    }
  };
}

export async function GET(request: NextRequest) {
  try {
    // 获取 Admin 访问配置
    const config = getAdminAccessConfig();
    
    // 检查访问权限（调试版本 - 不受限制）
    const accessCheck = debugCheckAdminAccess(request);
    
    // 获取客户端信息
    const clientIP = request.headers.get('x-forwarded-for') 
      || request.headers.get('x-real-ip') 
      || request.headers.get('cf-connecting-ip')
      || 'unknown';
    
    // 环境变量状态
    const envStatus = {
      ADMIN_MAINTENANCE_MODE: process.env.ADMIN_MAINTENANCE_MODE,
      ADMIN_EMERGENCY_BYPASS: process.env.ADMIN_EMERGENCY_BYPASS,
      ADMIN_ALLOWED_IPS: process.env.ADMIN_ALLOWED_IPS ? '***configured***' : undefined,
      NODE_ENV: process.env.NODE_ENV,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL ? '***configured***' : undefined,
    };

    const debugInfo = {
      timestamp: new Date().toISOString(),
      clientIP,
      userAgent: request.headers.get('user-agent'),
      url: request.url,
      config,
      accessCheck,
      envStatus,
      recommendations: [] as string[]
    };

    // 生成建议
    const recommendations: string[] = [];
    
    // 使用实际访问状态生成建议
    if (accessCheck.actualAccessStatus) {
      const { wouldBeAllowed, blockingFactors } = accessCheck.actualAccessStatus;
      
      if (!wouldBeAllowed && blockingFactors.length > 0) {
        recommendations.push('Admin access would be blocked by the following factors:');
        blockingFactors.forEach(factor => {
          recommendations.push(`- ${factor}`);
        });
      }
      
      if (config.maintenanceMode) {
        recommendations.push('ADMIN_MAINTENANCE_MODE is enabled - disable it or add your IP to ADMIN_ALLOWED_IPS');
      }
      
      if (config.allowedIPs && config.allowedIPs.length > 0 && !config.allowedIPs.includes(clientIP)) {
        recommendations.push(`Your IP (${clientIP}) is not in the allowed list. Add it to ADMIN_ALLOWED_IPS or remove IP restrictions`);
      }
      
      if (wouldBeAllowed) {
        recommendations.push('✅ Admin access control checks would pass');
        recommendations.push('If you still cannot access admin pages, check user authentication and role permissions');
      }
    }
    
    recommendations.push('Check user authentication and role permissions in database');
    recommendations.push('Ensure user email matches ADMIN_EMAIL environment variable');
    recommendations.push('Verify user has admin role in the database');

    debugInfo.recommendations = recommendations;

    return NextResponse.json(debugInfo, { 
      status: 200,
      headers: {
        'X-Debug-Mode': 'admin-access',
        'X-Access-Status': accessCheck.allowed ? 'granted' : 'denied'
      }
    });

  } catch (error) {
    console.error('[Admin Debug] Error:', error);
    
    return NextResponse.json({
      error: 'Debug API Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// 仅在开发环境或明确启用时可用
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development' && process.env.ADMIN_DEBUG_ENABLED !== 'true') {
    return NextResponse.json({ error: 'Debug API not available' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'emergency_enable':
        // 紧急启用 Admin 访问（仅开发环境）
        if (process.env.NODE_ENV === 'development') {
          process.env.ADMIN_EMERGENCY_BYPASS = 'true';
          return NextResponse.json({ 
            message: 'Emergency bypass enabled for this session',
            warning: 'This is temporary and only works in development'
          });
        } else {
          return NextResponse.json({ 
            error: 'Emergency bypass only available in development' 
          }, { status: 403 });
        }
        
      case 'test_config':
        // 测试配置
        const testConfig = getAdminAccessConfig();
        return NextResponse.json({
          message: 'Configuration test completed',
          config: testConfig
        });
        
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

  } catch (error) {
    return NextResponse.json({
      error: 'Debug action failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}