/**
 * Admin访问控制模块
 * 提供统一的Admin访问开关和安全检查
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Admin访问控制配置
 */
export type AdminAccessConfig = {
  enabled: boolean;
  maintenanceMode: boolean;
  allowedIPs?: string[];
  emergencyBypass?: boolean;
  reason?: string;
};

/**
 * 获取Admin访问配置
 */
export function getAdminAccessConfig(): AdminAccessConfig {
  // 移除 ADMIN_ACCESS_ENABLED 检查，访问控制完全依赖于用户角色权限
  // 保留其他安全控制选项
  const maintenanceMode = process.env.ADMIN_MAINTENANCE_MODE === 'true';
  const emergencyBypass = process.env.ADMIN_EMERGENCY_BYPASS === 'true';

  // 允许的IP列表（开发环境或紧急情况）
  const allowedIPs = process.env.ADMIN_ALLOWED_IPS?.split(',').map(ip => ip.trim()) || [];

  return {
    enabled: true, // 始终启用，访问控制由用户角色权限决定
    maintenanceMode,
    allowedIPs,
    emergencyBypass,
    reason: getAccessDeniedReason(true, maintenanceMode),
  };
}

/**
 * 获取访问被拒绝的原因
 */
function getAccessDeniedReason(enabled: boolean, maintenance: boolean): string {
  if (!enabled) {
    return 'Admin access is temporarily disabled for security review.';
  }
  if (maintenance) {
    return 'Admin panel is under maintenance. Please try again later.';
  }
  return 'Access denied for security reasons.';
}

/**
 * 检查Admin访问权限
 */
export function checkAdminAccess(request: NextRequest): {
  allowed: boolean;
  reason: string;
  config: AdminAccessConfig;
} {
  const config = getAdminAccessConfig();
  const clientIP = getClientIP(request);

  // 紧急旁路检查
  if (config.emergencyBypass) {
    logAdminAccessAttempt(request, true, 'emergency_bypass');
    return {
      allowed: true,
      reason: 'Emergency bypass enabled',
      config,
    };
  }

  // 基础开关检查
  if (!config.enabled) {
    logAdminAccessAttempt(request, false, 'admin_disabled');
    return {
      allowed: false,
      reason: config.reason || 'Admin access disabled',
      config,
    };
  }

  // 维护模式检查
  if (config.maintenanceMode) {
    // 检查是否在允许的IP列表中
    if (config.allowedIPs && config.allowedIPs.length > 0 && !config.allowedIPs.includes(clientIP)) {
      logAdminAccessAttempt(request, false, 'maintenance_mode');
      return {
        allowed: false,
        reason: config.reason || 'Under maintenance',
        config,
      };
    }
  }

  // IP白名单检查（如果配置了）
  if (config.allowedIPs && config.allowedIPs.length > 0 && !config.allowedIPs.includes(clientIP)) {
    logAdminAccessAttempt(request, false, 'ip_not_allowed');
    return {
      allowed: false,
      reason: 'Access denied: IP not in whitelist',
      config,
    };
  }

  logAdminAccessAttempt(request, true, 'access_granted');
  return {
    allowed: true,
    reason: 'Access granted',
    config,
  };
}

/**
 * 获取客户端IP地址
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');

  return (
    cfConnectingIP
    || realIP
    || (forwarded ? forwarded.split(',')[0]?.trim() : null)
    || 'unknown'
  );
}

/**
 * 记录Admin访问尝试
 */
function logAdminAccessAttempt(
  request: NextRequest,
  success: boolean,
  reason: string,
): void {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const url = request.url;

  // 控制台日志
  if (success) {
    console.log(`[Admin Access] ✅ Granted - IP: ${ip}, Reason: ${reason}`);
  } else {
    console.warn(`[Admin Access] 🚫 Denied - IP: ${ip}, Reason: ${reason}`);
  }

  // 在开发环境下记录详细信息
  if (process.env.NODE_ENV === 'development') {
    console.debug('[Admin Access] Details:', {
      success,
      reason,
      ip,
      userAgent,
      url,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * 创建Admin访问被拒绝的响应
 */
export function createAdminAccessDeniedResponse(
  reason: string,
  config: AdminAccessConfig,
): NextResponse {
  const response = NextResponse.json({
    error: 'Admin Access Denied',
    reason,
    timestamp: new Date().toISOString(),
    // 开发环境显示更多信息
    ...(process.env.NODE_ENV === 'development' && {
      config: {
        enabled: config.enabled,
        maintenanceMode: config.maintenanceMode,
        hasAllowedIPs: (config.allowedIPs?.length || 0) > 0,
      },
    }),
  }, { status: 403 });

  // 添加安全头部
  response.headers.set('X-Admin-Access', 'denied');
  response.headers.set('X-Access-Reason', reason);

  return response;
}

/**
 * Admin中间件 - 统一的访问控制
 */
export function adminAccessMiddleware(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  const accessCheck = checkAdminAccess(request);

  if (!accessCheck.allowed) {
    return Promise.resolve(
      createAdminAccessDeniedResponse(accessCheck.reason, accessCheck.config),
    );
  }

  return handler();
}

/**
 * 紧急启用Admin访问的函数（仅供紧急情况使用）
 */
export function emergencyEnableAdmin(): void {
  console.warn('🚨 Emergency Admin access enabled! This should only be used in emergencies.');
  process.env.ADMIN_EMERGENCY_BYPASS = 'true';
}

/**
 * 获取Admin状态信息（用于监控）
 */
export function getAdminStatus(): {
  accessible: boolean;
  reason: string;
  config: AdminAccessConfig;
} {
  const config = getAdminAccessConfig();

  return {
    accessible: config.enabled && !config.maintenanceMode,
    reason: config.reason || 'OK',
    config,
  };
}
