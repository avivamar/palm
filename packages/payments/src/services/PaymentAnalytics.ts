/**
 * 支付分析和监控服务
 * 用于追踪多供应商的表现和使用情况
 */

export interface PaymentMetrics {
  provider: string;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalAmount: number; // 总金额 (分为单位)
  averageAmount: number;
  successRate: number;
  averageProcessingTime: number; // 毫秒
  lastUpdated: Date;
}

export interface PaymentEvent {
  id: string;
  provider: string;
  type: 'payment_created' | 'payment_succeeded' | 'payment_failed' | 'subscription_created' | 'subscription_canceled';
  amount?: number;
  currency?: string;
  customerId?: string;
  processingTime?: number;
  errorMessage?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class PaymentAnalytics {
  private metrics: Map<string, PaymentMetrics> = new Map();
  private events: PaymentEvent[] = [];
  private maxEvents: number = 1000; // 保留最近1000个事件

  /**
   * 记录支付事件
   */
  recordEvent(event: Omit<PaymentEvent, 'id' | 'timestamp'>): void {
    const fullEvent: PaymentEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    // 添加事件到列表
    this.events.unshift(fullEvent);
    
    // 保持事件数量限制
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }

    // 更新指标
    this.updateMetrics(fullEvent);
  }

  /**
   * 更新供应商指标
   */
  private updateMetrics(event: PaymentEvent): void {
    const { provider, type, amount = 0, processingTime = 0 } = event;
    
    // 获取或创建供应商指标
    let metrics = this.metrics.get(provider);
    if (!metrics) {
      metrics = {
        provider,
        totalTransactions: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        totalAmount: 0,
        averageAmount: 0,
        successRate: 0,
        averageProcessingTime: 0,
        lastUpdated: new Date(),
      };
      this.metrics.set(provider, metrics);
    }

    // 更新指标
    if (type.includes('payment')) {
      metrics.totalTransactions++;
      metrics.totalAmount += amount;
      
      if (type === 'payment_succeeded') {
        metrics.successfulTransactions++;
      } else if (type === 'payment_failed') {
        metrics.failedTransactions++;
      }
      
      // 计算平均值
      metrics.averageAmount = metrics.totalAmount / metrics.totalTransactions;
      metrics.successRate = metrics.successfulTransactions / metrics.totalTransactions;
      
      // 更新平均处理时间 (简单移动平均)
      if (processingTime > 0) {
        metrics.averageProcessingTime = 
          (metrics.averageProcessingTime * (metrics.totalTransactions - 1) + processingTime) / 
          metrics.totalTransactions;
      }
    }

    metrics.lastUpdated = new Date();
  }

  /**
   * 获取供应商指标
   */
  getProviderMetrics(provider: string): PaymentMetrics | null {
    return this.metrics.get(provider) || null;
  }

  /**
   * 获取所有供应商指标
   */
  getAllMetrics(): PaymentMetrics[] {
    return Array.from(this.metrics.values()).sort((a, b) => 
      b.totalTransactions - a.totalTransactions
    );
  }

  /**
   * 获取最近的事件
   */
  getRecentEvents(limit: number = 50, provider?: string): PaymentEvent[] {
    let filteredEvents = this.events;
    
    if (provider) {
      filteredEvents = this.events.filter(e => e.provider === provider);
    }
    
    return filteredEvents.slice(0, limit);
  }

  /**
   * 获取时间范围内的事件
   */
  getEventsByTimeRange(
    startDate: Date, 
    endDate: Date, 
    provider?: string
  ): PaymentEvent[] {
    let filteredEvents = this.events.filter(e => 
      e.timestamp >= startDate && e.timestamp <= endDate
    );
    
    if (provider) {
      filteredEvents = filteredEvents.filter(e => e.provider === provider);
    }
    
    return filteredEvents;
  }

  /**
   * 生成性能报告
   */
  generatePerformanceReport(): {
    summary: {
      totalProviders: number;
      totalTransactions: number;
      overallSuccessRate: number;
      bestPerformingProvider: string;
      worstPerformingProvider: string;
    };
    providerComparison: Array<{
      provider: string;
      successRate: number;
      averageAmount: number;
      totalTransactions: number;
      ranking: number;
    }>;
    recommendations: string[];
  } {
    const metrics = this.getAllMetrics();
    
    if (metrics.length === 0) {
      return {
        summary: {
          totalProviders: 0,
          totalTransactions: 0,
          overallSuccessRate: 0,
          bestPerformingProvider: '',
          worstPerformingProvider: '',
        },
        providerComparison: [],
        recommendations: ['No payment data available. Start processing payments to see analytics.'],
      };
    }

    // 计算总体统计
    const totalTransactions = metrics.reduce((sum, m) => sum + m.totalTransactions, 0);
    const totalSuccessful = metrics.reduce((sum, m) => sum + m.successfulTransactions, 0);
    const overallSuccessRate = totalTransactions > 0 ? totalSuccessful / totalTransactions : 0;

    // 排序供应商 (按成功率和交易量)
    const sortedProviders = [...metrics].sort((a, b) => {
      // 首先按成功率排序，然后按交易量
      const rateComparison = b.successRate - a.successRate;
      if (Math.abs(rateComparison) > 0.05) { // 5% 差异阈值
        return rateComparison;
      }
      return b.totalTransactions - a.totalTransactions;
    });

    const bestProvider = sortedProviders[0]?.provider || '';
    const worstProvider = sortedProviders[sortedProviders.length - 1]?.provider || '';

    // 生成供应商对比
    const providerComparison = sortedProviders.map((provider, index) => ({
      provider: provider.provider,
      successRate: Math.round(provider.successRate * 100) / 100,
      averageAmount: Math.round(provider.averageAmount) / 100, // 转换为美元
      totalTransactions: provider.totalTransactions,
      ranking: index + 1,
    }));

    // 生成建议
    const recommendations: string[] = [];
    
    if (overallSuccessRate < 0.95) {
      recommendations.push('Overall success rate is below 95%. Consider investigating failed payments.');
    }
    
    if (metrics.length === 1) {
      recommendations.push('Consider adding backup payment providers for redundancy.');
    }
    
    const lowPerformingProviders = metrics.filter(m => m.successRate < 0.9);
    if (lowPerformingProviders.length > 0) {
      recommendations.push(
        `Low performing providers detected: ${lowPerformingProviders.map(p => p.provider).join(', ')}. ` +
        'Consider reviewing their configuration or reducing their traffic.'
      );
    }
    
    const highVolumeProvider = metrics.find(m => m.totalTransactions > totalTransactions * 0.8);
    if (highVolumeProvider) {
      recommendations.push(
        `${highVolumeProvider.provider} handles ${Math.round(highVolumeProvider.totalTransactions / totalTransactions * 100)}% of traffic. ` +
        'Consider load balancing to reduce single point of failure risk.'
      );
    }

    return {
      summary: {
        totalProviders: metrics.length,
        totalTransactions,
        overallSuccessRate: Math.round(overallSuccessRate * 10000) / 100, // 百分比，两位小数
        bestPerformingProvider: bestProvider,
        worstPerformingProvider: worstProvider,
      },
      providerComparison,
      recommendations,
    };
  }

  /**
   * 获取实时统计 (最近一小时)
   */
  getRealTimeStats(): {
    recentEvents: number;
    activeProviders: string[];
    recentSuccessRate: number;
    avgProcessingTime: number;
  } {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentEvents = this.getEventsByTimeRange(oneHourAgo, new Date());
    
    const paymentEvents = recentEvents.filter(e => e.type.includes('payment'));
    const successfulPayments = paymentEvents.filter(e => e.type === 'payment_succeeded');
    const recentSuccessRate = paymentEvents.length > 0 ? 
      successfulPayments.length / paymentEvents.length : 0;
    
    const activeProviders = [...new Set(recentEvents.map(e => e.provider))];
    
    const eventsWithProcessingTime = recentEvents.filter(e => e.processingTime && e.processingTime > 0);
    const avgProcessingTime = eventsWithProcessingTime.length > 0 ?
      eventsWithProcessingTime.reduce((sum, e) => sum + (e.processingTime || 0), 0) / eventsWithProcessingTime.length :
      0;

    return {
      recentEvents: recentEvents.length,
      activeProviders,
      recentSuccessRate: Math.round(recentSuccessRate * 10000) / 100,
      avgProcessingTime: Math.round(avgProcessingTime),
    };
  }

  /**
   * 清除旧数据
   */
  cleanup(olderThanDays: number = 30): void {
    const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
    this.events = this.events.filter(e => e.timestamp > cutoffDate);
  }

  /**
   * 导出数据 (用于外部分析)
   */
  exportData(): {
    metrics: PaymentMetrics[];
    events: PaymentEvent[];
    exportedAt: Date;
  } {
    return {
      metrics: this.getAllMetrics(),
      events: [...this.events],
      exportedAt: new Date(),
    };
  }

  /**
   * 重置所有数据
   */
  reset(): void {
    this.metrics.clear();
    this.events = [];
  }
}

// 全局分析实例
export const paymentAnalytics = new PaymentAnalytics();