/**
 * 📊 Shopify集成指标监控
 * 收集和分析Shopify集成的关键指标
 */

import { isFeatureEnabled } from '../config';

export type ShopifyMetricsData = {
  // API调用指标
  apiCalls: {
    total: number;
    successful: number;
    failed: number;
    rateLimited: number;
    avgResponseTime: number;
  };

  // 同步指标
  sync: {
    productsSync: {
      total: number;
      successful: number;
      failed: number;
      lastSyncTime?: Date;
    };
    ordersSync: {
      total: number;
      successful: number;
      failed: number;
      lastSyncTime?: Date;
    };
    inventorySync: {
      total: number;
      successful: number;
      failed: number;
      lastSyncTime?: Date;
    };
  };

  // 错误指标
  errors: {
    networkErrors: number;
    authErrors: number;
    rateLimitErrors: number;
    dataErrors: number;
    otherErrors: number;
  };

  // 性能指标
  performance: {
    avgApiLatency: number;
    syncDuration: number;
    queueLength: number;
    memoryUsage: number;
  };
};

/**
 * 📊 Shopify指标收集器
 */
export class ShopifyMetrics {
  private static instance: ShopifyMetrics;
  private metrics: ShopifyMetricsData = this.initializeMetrics();
  private startTime = Date.now();

  private constructor() {}

  public static getInstance(): ShopifyMetrics {
    if (!ShopifyMetrics.instance) {
      ShopifyMetrics.instance = new ShopifyMetrics();
    }
    return ShopifyMetrics.instance;
  }

  /**
   * 🏁 初始化指标
   */
  private initializeMetrics(): ShopifyMetricsData {
    return {
      apiCalls: {
        total: 0,
        successful: 0,
        failed: 0,
        rateLimited: 0,
        avgResponseTime: 0,
      },
      sync: {
        productsSync: {
          total: 0,
          successful: 0,
          failed: 0,
        },
        ordersSync: {
          total: 0,
          successful: 0,
          failed: 0,
        },
        inventorySync: {
          total: 0,
          successful: 0,
          failed: 0,
        },
      },
      errors: {
        networkErrors: 0,
        authErrors: 0,
        rateLimitErrors: 0,
        dataErrors: 0,
        otherErrors: 0,
      },
      performance: {
        avgApiLatency: 0,
        syncDuration: 0,
        queueLength: 0,
        memoryUsage: 0,
      },
    };
  }

  /**
   * 📈 记录API调用
   */
  public recordApiCall(success: boolean, responseTime: number, errorType?: string): void {
    if (!isFeatureEnabled('METRICS_ENABLED')) {
      return;
    }

    this.metrics.apiCalls.total++;

    if (success) {
      this.metrics.apiCalls.successful++;
    } else {
      this.metrics.apiCalls.failed++;

      // 分类错误类型
      if (errorType) {
        switch (errorType) {
          case 'RATE_LIMIT':
            this.metrics.apiCalls.rateLimited++;
            this.metrics.errors.rateLimitErrors++;
            break;
          case 'NETWORK_ERROR':
            this.metrics.errors.networkErrors++;
            break;
          case 'AUTH_ERROR':
            this.metrics.errors.authErrors++;
            break;
          case 'DATA_ERROR':
            this.metrics.errors.dataErrors++;
            break;
          default:
            this.metrics.errors.otherErrors++;
        }
      }
    }

    // 更新平均响应时间
    this.updateAvgResponseTime(responseTime);
  }

  /**
   * 📦 记录同步操作
   */
  public recordSync(
    type: 'products' | 'orders' | 'inventory',
    success: boolean,
    count: number = 1,
  ): void {
    if (!isFeatureEnabled('METRICS_ENABLED')) {
      return;
    }

    const syncMetrics = this.metrics.sync[`${type}Sync`];
    syncMetrics.total += count;

    if (success) {
      syncMetrics.successful += count;
      syncMetrics.lastSyncTime = new Date();
    } else {
      syncMetrics.failed += count;
    }
  }

  /**
   * ⚡ 更新性能指标
   */
  public updatePerformance(data: {
    apiLatency?: number;
    syncDuration?: number;
    queueLength?: number;
    memoryUsage?: number;
  }): void {
    if (!isFeatureEnabled('METRICS_ENABLED')) {
      return;
    }

    if (data.apiLatency !== undefined) {
      this.metrics.performance.avgApiLatency = this.calculateAverage(
        this.metrics.performance.avgApiLatency,
        data.apiLatency,
        this.metrics.apiCalls.total,
      );
    }

    if (data.syncDuration !== undefined) {
      this.metrics.performance.syncDuration = data.syncDuration;
    }

    if (data.queueLength !== undefined) {
      this.metrics.performance.queueLength = data.queueLength;
    }

    if (data.memoryUsage !== undefined) {
      this.metrics.performance.memoryUsage = data.memoryUsage;
    }
  }

  /**
   * 📊 获取当前指标
   */
  public getMetrics(): ShopifyMetricsData & {
    uptime: number;
    successRate: number;
    errorRate: number;
  } {
    const uptime = Date.now() - this.startTime;
    const totalCalls = this.metrics.apiCalls.total;
    const successRate = totalCalls > 0
      ? (this.metrics.apiCalls.successful / totalCalls * 100)
      : 100;
    const errorRate = 100 - successRate;

    return {
      ...this.metrics,
      uptime,
      successRate: Math.round(successRate * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
    };
  }

  /**
   * 📋 获取指标摘要
   */
  public getMetricsSummary(): {
    status: 'healthy' | 'warning' | 'critical';
    summary: string;
    keyMetrics: {
      label: string;
      value: string;
      status: 'good' | 'warning' | 'critical';
    }[];
  } {
    const metrics = this.getMetrics();
    const keyMetrics: {
      label: string;
      value: string;
      status: 'good' | 'warning' | 'critical';
    }[] = [];

    // API成功率
    const successRateStatus: 'good' | 'warning' | 'critical' = metrics.successRate >= 95
      ? 'good'
      : metrics.successRate >= 85 ? 'warning' : 'critical';
    keyMetrics.push({
      label: 'API成功率',
      value: `${metrics.successRate}%`,
      status: successRateStatus,
    });

    // 平均响应时间
    const latencyStatus: 'good' | 'warning' | 'critical' = metrics.performance.avgApiLatency <= 1000
      ? 'good'
      : metrics.performance.avgApiLatency <= 3000 ? 'warning' : 'critical';
    keyMetrics.push({
      label: '平均响应时间',
      value: `${Math.round(metrics.performance.avgApiLatency)}ms`,
      status: latencyStatus,
    });

    // 限流频率
    const rateLimitRate = metrics.apiCalls.total > 0
      ? (metrics.apiCalls.rateLimited / metrics.apiCalls.total * 100)
      : 0;
    const rateLimitStatus: 'good' | 'warning' | 'critical' = rateLimitRate <= 5
      ? 'good'
      : rateLimitRate <= 15 ? 'warning' : 'critical';
    keyMetrics.push({
      label: '限流频率',
      value: `${Math.round(rateLimitRate * 100) / 100}%`,
      status: rateLimitStatus,
    });

    // 运行时间
    const uptimeHours = Math.round(metrics.uptime / (1000 * 60 * 60) * 10) / 10;
    keyMetrics.push({
      label: '运行时间',
      value: `${uptimeHours}小时`,
      status: 'good',
    });

    // 确定整体状态
    const hasCritical = keyMetrics.some(m => m.status === 'critical');
    const hasWarning = keyMetrics.some(m => m.status === 'warning');

    const status = hasCritical ? 'critical' : hasWarning ? 'warning' : 'healthy';

    // 生成摘要
    let summary = '';
    switch (status) {
      case 'healthy':
        summary = `✅ Shopify集成运行正常，已处理${metrics.apiCalls.total}次API调用`;
        break;
      case 'warning':
        summary = `⚠️ Shopify集成有轻微问题，成功率${metrics.successRate}%`;
        break;
      case 'critical':
        summary = `❌ Shopify集成有严重问题，需要立即关注`;
        break;
    }

    return {
      status,
      summary,
      keyMetrics,
    };
  }

  /**
   * 🧹 重置指标
   */
  public resetMetrics(): void {
    this.metrics = this.initializeMetrics();
    this.startTime = Date.now();
  }

  /**
   * 📊 导出指标（用于外部监控系统）
   */
  public exportMetrics(): {
    timestamp: string;
    shopify_api_calls_total: number;
    shopify_api_calls_successful: number;
    shopify_api_calls_failed: number;
    shopify_api_calls_rate_limited: number;
    shopify_api_success_rate: number;
    shopify_api_avg_response_time: number;
    shopify_sync_products_total: number;
    shopify_sync_products_successful: number;
    shopify_sync_orders_total: number;
    shopify_sync_orders_successful: number;
    shopify_errors_network: number;
    shopify_errors_auth: number;
    shopify_errors_rate_limit: number;
    shopify_uptime_seconds: number;
  } {
    const metrics = this.getMetrics();

    return {
      timestamp: new Date().toISOString(),
      shopify_api_calls_total: metrics.apiCalls.total,
      shopify_api_calls_successful: metrics.apiCalls.successful,
      shopify_api_calls_failed: metrics.apiCalls.failed,
      shopify_api_calls_rate_limited: metrics.apiCalls.rateLimited,
      shopify_api_success_rate: metrics.successRate,
      shopify_api_avg_response_time: metrics.performance.avgApiLatency,
      shopify_sync_products_total: metrics.sync.productsSync.total,
      shopify_sync_products_successful: metrics.sync.productsSync.successful,
      shopify_sync_orders_total: metrics.sync.ordersSync.total,
      shopify_sync_orders_successful: metrics.sync.ordersSync.successful,
      shopify_errors_network: metrics.errors.networkErrors,
      shopify_errors_auth: metrics.errors.authErrors,
      shopify_errors_rate_limit: metrics.errors.rateLimitErrors,
      shopify_uptime_seconds: Math.round(metrics.uptime / 1000),
    };
  }

  /**
   * 🧮 计算移动平均值
   */
  private calculateAverage(currentAvg: number, newValue: number, count: number): number {
    if (count === 0) {
      return newValue;
    }
    return (currentAvg * (count - 1) + newValue) / count;
  }

  /**
   * ⏱️ 更新平均响应时间
   */
  private updateAvgResponseTime(responseTime: number): void {
    this.metrics.apiCalls.avgResponseTime = this.calculateAverage(
      this.metrics.apiCalls.avgResponseTime,
      responseTime,
      this.metrics.apiCalls.total,
    );
  }
}
