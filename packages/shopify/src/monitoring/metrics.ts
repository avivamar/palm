/**
 * Shopify 集成度量和监控系统
 */

import type { MetricsSummary } from '../types';

type ShopifyMetrics = {
  totalApiCalls: number;
  successfulApiCalls: number;
  failedApiCalls: number;
  ordersSynced: number;
  ordersFailedSync: number;
  productsSynced: number;
  inventoryUpdates: number;
  averageResponseTime: number;
  lastSyncTime: Date | null;
  errorRate: number;
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
};

export class ShopifyMetricsCollector {
  private metrics: ShopifyMetrics;
  private responseTimes: number[];
  private maxResponseTimeHistory = 100; // Keep last 100 response times

  constructor() {
    this.metrics = {
      totalApiCalls: 0,
      successfulApiCalls: 0,
      failedApiCalls: 0,
      ordersSynced: 0,
      ordersFailedSync: 0,
      productsSynced: 0,
      inventoryUpdates: 0,
      averageResponseTime: 0,
      lastSyncTime: null,
      errorRate: 0,
      healthStatus: 'healthy',
    };
    this.responseTimes = [];
  }

  // 记录 API 调用
  recordApiCall(success: boolean, responseTime: number) {
    this.metrics.totalApiCalls++;

    if (success) {
      this.metrics.successfulApiCalls++;
    } else {
      this.metrics.failedApiCalls++;
    }

    // 记录响应时间
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > this.maxResponseTimeHistory) {
      this.responseTimes.shift();
    }

    // 计算平均响应时间
    this.metrics.averageResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;

    // 计算错误率
    this.metrics.errorRate = this.metrics.totalApiCalls > 0
      ? (this.metrics.failedApiCalls / this.metrics.totalApiCalls) * 100
      : 0;

    // 更新健康状态
    this.updateHealthStatus();
  }

  // 记录订单同步
  recordOrderSync(success: boolean) {
    if (success) {
      this.metrics.ordersSynced++;
      this.metrics.lastSyncTime = new Date();
    } else {
      this.metrics.ordersFailedSync++;
    }
  }

  // 记录产品同步
  recordProductSync(count: number = 1) {
    this.metrics.productsSynced += count;
    this.metrics.lastSyncTime = new Date();
  }

  // 记录库存更新
  recordInventoryUpdate(count: number = 1) {
    this.metrics.inventoryUpdates += count;
  }

  // 更新健康状态
  private updateHealthStatus() {
    const errorRate = this.metrics.errorRate;
    const avgResponseTime = this.metrics.averageResponseTime;

    if (errorRate >= 50 || avgResponseTime > 5000) {
      this.metrics.healthStatus = 'unhealthy';
    } else if (errorRate >= 20 || avgResponseTime > 2000) {
      this.metrics.healthStatus = 'degraded';
    } else {
      this.metrics.healthStatus = 'healthy';
    }
  }

  // 获取当前度量
  getMetrics(): ShopifyMetrics {
    return { ...this.metrics };
  }

  // 获取详细报告
  getDetailedReport() {
    const successRate = this.metrics.totalApiCalls > 0
      ? ((this.metrics.successfulApiCalls / this.metrics.totalApiCalls) * 100).toFixed(2)
      : '0';

    return {
      summary: this.metrics,
      performance: {
        successRate: `${successRate}%`,
        errorRate: `${this.metrics.errorRate.toFixed(2)}%`,
        averageResponseTime: `${this.metrics.averageResponseTime.toFixed(0)}ms`,
        recentResponseTimes: this.responseTimes.slice(-10), // Last 10 response times
      },
      sync: {
        orderSyncSuccessRate: this.metrics.ordersSynced + this.metrics.ordersFailedSync > 0
          ? `${((this.metrics.ordersSynced / (this.metrics.ordersSynced + this.metrics.ordersFailedSync)) * 100).toFixed(2)}%`
          : '0%',
        totalOrdersProcessed: this.metrics.ordersSynced + this.metrics.ordersFailedSync,
        lastSyncTime: this.metrics.lastSyncTime?.toISOString() || 'Never',
      },
      health: {
        status: this.metrics.healthStatus,
        recommendations: this.getHealthRecommendations(),
      },
    };
  }

  // 获取健康建议
  private getHealthRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.errorRate >= 20) {
      recommendations.push('High error rate detected. Check Shopify API configuration and network connectivity.');
    }

    if (this.metrics.averageResponseTime > 2000) {
      recommendations.push('Slow API response times. Consider implementing request optimization or caching.');
    }

    if (this.metrics.ordersFailedSync > this.metrics.ordersSynced * 0.1) {
      recommendations.push('High order sync failure rate. Review order data validation and Shopify store configuration.');
    }

    if (!this.metrics.lastSyncTime || Date.now() - this.metrics.lastSyncTime.getTime() > 24 * 60 * 60 * 1000) {
      recommendations.push('No recent sync activity detected. Verify webhook configuration and connectivity.');
    }

    if (recommendations.length === 0) {
      recommendations.push('All metrics are within normal parameters. System is operating optimally.');
    }

    return recommendations;
  }

  // 重置度量
  reset() {
    this.metrics = {
      totalApiCalls: 0,
      successfulApiCalls: 0,
      failedApiCalls: 0,
      ordersSynced: 0,
      ordersFailedSync: 0,
      productsSynced: 0,
      inventoryUpdates: 0,
      averageResponseTime: 0,
      lastSyncTime: null,
      errorRate: 0,
      healthStatus: 'healthy',
    };
    this.responseTimes = [];
  }

  // 导出度量到 JSON
  exportMetrics() {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      performance: {
        recentResponseTimes: this.responseTimes,
      },
    };
  }
}

// 保持向后兼容的 Metrics 类
export class Metrics {
  private metricsData: MetricsSummary = {
    apiCalls: 0,
    syncedProducts: 0,
    syncedOrders: 0,
    errors: 0,
    lastSync: new Date().toISOString(),
  };

  constructor() {
    // Initialize metrics
  }

  /**
   * 获取指标汇总
   */
  async getSummary(): Promise<MetricsSummary> {
    return this.metricsData;
  }

  /**
   * 增加 API 调用计数
   */
  incrementApiCalls(): void {
    this.metricsData.apiCalls++;
  }

  /**
   * 增加同步产品计数
   */
  incrementSyncedProducts(count: number = 1): void {
    this.metricsData.syncedProducts += count;
  }

  /**
   * 增加同步订单计数
   */
  incrementSyncedOrders(count: number = 1): void {
    this.metricsData.syncedOrders += count;
  }

  /**
   * 增加错误计数
   */
  incrementErrors(count: number = 1): void {
    this.metricsData.errors += count;
  }

  /**
   * 更新最后同步时间
   */
  updateLastSync(): void {
    this.metricsData.lastSync = new Date().toISOString();
  }

  /**
   * 重置指标
   */
  reset(): void {
    this.metricsData = {
      apiCalls: 0,
      syncedProducts: 0,
      syncedOrders: 0,
      errors: 0,
      lastSync: new Date().toISOString(),
    };
  }
}

// 全局度量收集器实例
export const shopifyMetrics = new ShopifyMetricsCollector();
