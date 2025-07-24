// 简化的支付监控 - 只保留核心业务指标
export type PaymentMetrics = {
  totalAttempts: number;
  successfulPayments: number;
  failedPayments: number;
  successRate: number;
  lastUpdated: Date;
};

export type PaymentAlert = {
  id: string;
  type: 'success_rate_low' | 'high_error_rate';
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Date;
};

const DEFAULT_CONFIG = {
  successRateThreshold: 0.95, // 95%
  errorRateThreshold: 0.05, // 5%
  metricsWindow: 3600000, // 1小时
};

export class PaymentMonitor {
  private config = DEFAULT_CONFIG;
  private metrics: PaymentMetrics;
  private alerts: PaymentAlert[] = [];
  private paymentEvents: Array<{
    timestamp: Date;
    success: boolean;
  }> = [];

  constructor() {
    this.metrics = this.initializeMetrics();
  }

  private initializeMetrics(): PaymentMetrics {
    return {
      totalAttempts: 0,
      successfulPayments: 0,
      failedPayments: 0,
      successRate: 1.0,
      lastUpdated: new Date(),
    };
  }

  /**
   * 记录支付成功
   */
  recordPaymentSuccess(): void {
    const event = {
      timestamp: new Date(),
      success: true,
    };

    this.paymentEvents.push(event);
    this.cleanupOldEvents();
    this.updateMetrics();
    this.checkAlerts();
  }

  /**
   * 记录支付失败
   */
  recordPaymentFailure(): void {
    const event = {
      timestamp: new Date(),
      success: false,
    };

    this.paymentEvents.push(event);
    this.cleanupOldEvents();
    this.updateMetrics();
    this.checkAlerts();
  }

  /**
   * 获取当前指标
   */
  getMetrics(): PaymentMetrics {
    return { ...this.metrics };
  }

  /**
   * 获取系统健康状态
   */
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    metrics: PaymentMetrics;
    alerts: PaymentAlert[];
  } {
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (this.metrics.successRate < 0.8) {
      status = 'critical';
    } else if (this.metrics.successRate < this.config.successRateThreshold) {
      status = 'warning';
    }

    return {
      status,
      metrics: this.metrics,
      alerts: this.alerts,
    };
  }

  private cleanupOldEvents(): void {
    const cutoff = Date.now() - this.config.metricsWindow;
    this.paymentEvents = this.paymentEvents.filter(
      event => event.timestamp.getTime() > cutoff,
    );
  }

  private updateMetrics(): void {
    const events = this.paymentEvents;
    const totalAttempts = events.length;
    const successfulPayments = events.filter(e => e.success).length;
    const failedPayments = totalAttempts - successfulPayments;

    const successRate = totalAttempts > 0 ? successfulPayments / totalAttempts : 1.0;

    this.metrics = {
      totalAttempts,
      successfulPayments,
      failedPayments,
      successRate,
      lastUpdated: new Date(),
    };
  }

  private checkAlerts(): void {
    // 检查成功率告警
    if (this.metrics.successRate < this.config.successRateThreshold) {
      const alert: PaymentAlert = {
        id: `alert_${Date.now()}`,
        type: 'success_rate_low',
        severity: this.metrics.successRate < 0.8 ? 'critical' : 'warning',
        message: `Payment success rate: ${(this.metrics.successRate * 100).toFixed(1)}%`,
        timestamp: new Date(),
      };
      this.alerts.push(alert);
    }

    // 检查错误率告警
    const errorRate = this.metrics.totalAttempts > 0 ? this.metrics.failedPayments / this.metrics.totalAttempts : 0;
    if (errorRate > this.config.errorRateThreshold) {
      const alert: PaymentAlert = {
        id: `alert_${Date.now()}`,
        type: 'high_error_rate',
        severity: errorRate > 0.2 ? 'critical' : 'warning',
        message: `Payment error rate: ${(errorRate * 100).toFixed(1)}%`,
        timestamp: new Date(),
      };
      this.alerts.push(alert);
    }

    // 只保留最近的告警
    this.alerts = this.alerts.slice(-10);
  }
}

// 全局监控实例
export const globalPaymentMonitor = new PaymentMonitor();

// 便捷函数
export const recordPaymentSuccess = () => {
  globalPaymentMonitor.recordPaymentSuccess();
};

export const recordPaymentFailure = () => {
  globalPaymentMonitor.recordPaymentFailure();
};

export const getPaymentHealthStatus = () => {
  return globalPaymentMonitor.getHealthStatus();
};

export const getPaymentMetrics = () => {
  return globalPaymentMonitor.getMetrics();
};
