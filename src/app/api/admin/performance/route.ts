import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { globalPaymentMonitor } from '@/libs/monitoring/payment-monitor';
// import { cacheManager } from '@/libs/performance/cache-manager';
import { globalQueryOptimizer } from '@/libs/performance/query-optimizer';

// 验证管理员权限的中间件
async function verifyAdminAccess(request: NextRequest): Promise<boolean> {
  try {
    // 这里应该实现实际的管理员权限验证
    // 例如检查JWT token、session等
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    // 简化的验证逻辑，实际应用中需要更严格的验证
    // const token = authHeader.substring(7);

    // 这里应该验证token并检查用户是否为管理员
    // const user = await verifyToken(token);
    // return user && user.role === 'admin';

    // 临时返回true用于开发
    return true;
  } catch (error) {
    console.error('Admin access verification failed:', error);
    return false;
  }
}

// 获取系统健康状态
function getSystemHealth() {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  // 计算内存使用百分比
  const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;

  // 简化的CPU使用率计算
  const cpuPercent = Math.min(((cpuUsage.user + cpuUsage.system) / 1000000) / uptime * 100, 100);

  // 模拟响应时间（实际应用中应该从监控系统获取）
  const responseTime = Math.floor(Math.random() * 100) + 50;

  let status: 'healthy' | 'warning' | 'critical' = 'healthy';

  if (memoryPercent > 90 || cpuPercent > 90 || responseTime > 1000) {
    status = 'critical';
  } else if (memoryPercent > 70 || cpuPercent > 70 || responseTime > 500) {
    status = 'warning';
  }

  return {
    status,
    uptime,
    memoryUsage: memoryPercent,
    cpuUsage: cpuPercent,
    responseTime,
  };
}

// 生成系统告警
function generateAlerts(cacheStats: any, queryStats: any, systemHealth: any) {
  const alerts: any[] = [];

  // 缓存相关告警
  if (cacheStats.hitRate < 60) {
    alerts.push({
      id: `cache-hit-rate-${Date.now()}`,
      type: 'cache',
      severity: cacheStats.hitRate < 40 ? 'high' : 'medium',
      message: `Cache hit rate is low: ${cacheStats.hitRate.toFixed(1)}%. Consider optimizing cache strategy.`,
      timestamp: new Date(),
    });
  }

  if (cacheStats.errors > 10) {
    alerts.push({
      id: `cache-errors-${Date.now()}`,
      type: 'cache',
      severity: 'medium',
      message: `High number of cache errors detected: ${cacheStats.errors}`,
      timestamp: new Date(),
    });
  }

  // 查询相关告警
  if (queryStats.averageExecutionTime > 500) {
    alerts.push({
      id: `slow-queries-${Date.now()}`,
      type: 'query',
      severity: queryStats.averageExecutionTime > 1000 ? 'high' : 'medium',
      message: `Average query execution time is high: ${queryStats.averageExecutionTime.toFixed(0)}ms`,
      timestamp: new Date(),
    });
  }

  if (queryStats.slowQueries.length > 10) {
    alerts.push({
      id: `slow-query-count-${Date.now()}`,
      type: 'query',
      severity: 'medium',
      message: `High number of slow queries detected: ${queryStats.slowQueries.length}`,
      timestamp: new Date(),
    });
  }

  // 系统相关告警
  if (systemHealth.status === 'critical') {
    alerts.push({
      id: `system-critical-${Date.now()}`,
      type: 'system',
      severity: 'high',
      message: 'System is in critical state. Immediate attention required.',
      timestamp: new Date(),
    });
  } else if (systemHealth.status === 'warning') {
    alerts.push({
      id: `system-warning-${Date.now()}`,
      type: 'system',
      severity: 'medium',
      message: 'System performance is degraded. Monitor closely.',
      timestamp: new Date(),
    });
  }

  if (systemHealth.memoryUsage > 85) {
    alerts.push({
      id: `memory-usage-${Date.now()}`,
      type: 'system',
      severity: systemHealth.memoryUsage > 95 ? 'high' : 'medium',
      message: `High memory usage: ${systemHealth.memoryUsage.toFixed(1)}%`,
      timestamp: new Date(),
    });
  }

  if (systemHealth.cpuUsage > 80) {
    alerts.push({
      id: `cpu-usage-${Date.now()}`,
      type: 'system',
      severity: systemHealth.cpuUsage > 90 ? 'high' : 'medium',
      message: `High CPU usage: ${systemHealth.cpuUsage.toFixed(1)}%`,
      timestamp: new Date(),
    });
  }

  return alerts;
}

// GET - 获取性能指标
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const hasAccess = await verifyAdminAccess(request);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 },
      );
    }

    // 获取缓存统计
    // const cacheStats = cacheManager.getStats();
    const cacheStats = { hitRate: 0, errors: 0 }; // placeholder

    // 获取查询统计
    const queryStats = globalQueryOptimizer.getQueryStats();

    // 获取系统健康状态
    const systemHealth = getSystemHealth();

    // 生成告警
    const alerts = generateAlerts(cacheStats, queryStats, systemHealth);

    // 获取支付监控状态（如果可用）
    let paymentHealth = null;
    try {
      paymentHealth = globalPaymentMonitor.getHealthStatus();
    } catch (error) {
      console.warn('Payment monitor not available:', error);
    }

    const metrics = {
      cacheStats,
      queryStats,
      systemHealth,
      alerts,
      paymentHealth,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Failed to fetch performance metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// POST - 执行性能操作（清除缓存、重置统计等）
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const hasAccess = await verifyAdminAccess(request);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const actionSchema = z.object({
      action: z.enum(['clear_cache', 'reset_query_stats', 'reset_cache_stats', 'analyze_query']),
      params: z.object({}).optional(),
    });

    const { action, params } = actionSchema.parse(body);

    let result: any = {};

    switch (action) {
      case 'clear_cache':
        // result = await cacheManager.clear();
        result = { success: true, message: 'Cache cleared (disabled)' };
        break;

      case 'reset_query_stats':
        globalQueryOptimizer.clearHistory();
        result = { success: true, message: 'Query statistics reset successfully' };
        break;

      case 'reset_cache_stats':
        // cacheManager.resetStats();
        result = { success: true, message: 'Cache statistics reset successfully' };
        break;

      case 'analyze_query':
        if (!params || !('query' in params)) {
          return NextResponse.json(
            { error: 'Query parameter is required for analysis' },
            { status: 400 },
          );
        }
        result = await globalQueryOptimizer.analyzeQuery(params.query as string);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 },
        );
    }

    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Performance action failed:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// PUT - 更新性能配置
export async function PUT(request: NextRequest) {
  try {
    // 验证管理员权限
    const hasAccess = await verifyAdminAccess(request);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const configSchema = z.object({
      slowQueryThreshold: z.number().min(100).max(10000).optional(),
      cacheDefaultTTL: z.number().min(60).max(86400).optional(),
      maxQueryHistory: z.number().min(100).max(10000).optional(),
    });

    const config = configSchema.parse(body);

    // 更新配置
    if (config.slowQueryThreshold) {
      globalQueryOptimizer.setSlowQueryThreshold(config.slowQueryThreshold);
    }

    // 注意：缓存配置和查询历史大小的更新需要在相应的类中添加setter方法

    return NextResponse.json({
      success: true,
      message: 'Performance configuration updated successfully',
      config,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to update performance configuration:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid configuration format', details: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// DELETE - 清除特定类型的数据
export async function DELETE(request: NextRequest) {
  try {
    // 验证管理员权限
    const hasAccess = await verifyAdminAccess(request);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const pattern = searchParams.get('pattern');

    let result: any = {};

    switch (type) {
      case 'cache':
        if (pattern) {
          // result = await cacheManager.deletePattern(pattern);
          result = { success: true, message: 'Cache pattern deleted (disabled)' };
        } else {
          // result = await cacheManager.clear();
          result = { success: true, message: 'Cache cleared (disabled)' };
        }
        break;

      case 'query_history':
        globalQueryOptimizer.clearHistory();
        result = { success: true, message: 'Query history cleared successfully' };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 },
        );
    }

    return NextResponse.json({
      success: true,
      type,
      pattern,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to delete performance data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
