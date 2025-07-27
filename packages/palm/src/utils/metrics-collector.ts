import { AILogger, type Logger } from '@rolitt/ai-core';
import { PalmConfig } from '../config';

/**
 * 指标收集器 - 业务和技术指标监控
 * 
 * 功能特性：
 * - 性能指标收集
 * - 业务指标追踪
 * - 错误率监控
 * - 用户行为分析
 * - 实时统计报告
 */
export class MetricsCollector {
  private logger: Logger;
  private metrics: {
    // 性能指标
    analyses: AnalysisMetric[];
    processingTimes: number[];
    
    // 业务指标
    conversions: ConversionMetric[];
    userSessions: UserSessionMetric[];
    
    // 技术指标
    errors: ErrorMetric[];
    cacheStats: CacheMetric[];
    
    // 统计数据
    dailyStats: DailyStats;
    realTimeStats: RealTimeStats;
  };

  constructor(private config: PalmConfig, logger?: Logger) {
    this.logger = logger || new AILogger();
    this.metrics = {
      analyses: [],
      processingTimes: [],
      conversions: [],
      userSessions: [],
      errors: [],
      cacheStats: [],
      dailyStats: this.initDailyStats(),
      realTimeStats: this.initRealTimeStats()
    };

    if (this.config.monitoring.enabled) {
      this.startMetricsCollection();
    }
  }

  /**
   * 记录分析指标
   */
  recordAnalysis(metric: AnalysisMetric): void {
    try {
      if (!this.config.monitoring.metrics.performance) {
        return;
      }

      this.metrics.analyses.push(metric);
      this.metrics.processingTimes.push(metric.processingTime);
      
      // 更新实时统计
      this.updateRealTimeStats('analysis', metric);
      
      // 更新日常统计
      this.updateDailyStats('analysis', metric);

      this.logger.debug('Analysis metric recorded', { 
        type: metric.type,
        success: metric.success,
        processingTime: metric.processingTime
      });

      // 检查告警阈值
      this.checkAlerts('analysis', metric);

    } catch (error) {
      this.logger.error('Failed to record analysis metric', { error });
    }
  }

  /**
   * 记录转化指标
   */
  recordConversion(metric: ConversionMetric): void {
    try {
      if (!this.config.monitoring.metrics.business) {
        return;
      }

      this.metrics.conversions.push(metric);
      
      // 更新实时统计
      this.updateRealTimeStats('conversion', metric);
      
      // 更新日常统计
      this.updateDailyStats('conversion', metric);

      this.logger.debug('Conversion metric recorded', { 
        userId: metric.userId,
        action: metric.action,
        value: metric.value
      });

      // 检查告警阈值
      this.checkAlerts('conversion', metric);

    } catch (error) {
      this.logger.error('Failed to record conversion metric', { error });
    }
  }

  /**
   * 记录错误指标
   */
  recordError(metric: ErrorMetric): void {
    try {
      if (!this.config.monitoring.metrics.errors) {
        return;
      }

      this.metrics.errors.push(metric);
      
      // 更新实时统计
      this.updateRealTimeStats('error', metric);
      
      // 更新日常统计
      this.updateDailyStats('error', metric);

      this.logger.warn('Error metric recorded', { 
        type: metric.type,
        severity: metric.severity,
        message: metric.message
      });

      // 检查告警阈值
      this.checkAlerts('error', metric);

    } catch (error) {
      this.logger.error('Failed to record error metric', { error });
    }
  }

  /**
   * 记录用户会话
   */
  recordUserSession(metric: UserSessionMetric): void {
    try {
      if (!this.config.monitoring.metrics.usage) {
        return;
      }

      this.metrics.userSessions.push(metric);
      
      // 更新实时统计
      this.updateRealTimeStats('session', metric);
      
      // 更新日常统计
      this.updateDailyStats('session', metric);

      this.logger.debug('User session recorded', { 
        userId: metric.userId,
        duration: metric.duration,
        actions: metric.actions
      });

    } catch (error) {
      this.logger.error('Failed to record user session', { error });
    }
  }

  /**
   * 记录缓存指标
   */
  recordCacheMetric(metric: CacheMetric): void {
    try {
      this.metrics.cacheStats.push(metric);
      
      this.logger.debug('Cache metric recorded', { 
        hitRate: metric.hitRate,
        size: metric.size
      });

    } catch (error) {
      this.logger.error('Failed to record cache metric', { error });
    }
  }

  /**
   * 获取性能指标
   */
  async getPerformanceMetrics(): Promise<{
    avgProcessingTime: number;
    successRate: number;
    errorRate: number;
  }> {
    try {
      const recentAnalyses = this.getRecentMetrics(this.metrics.analyses, 3600000); // 1小时内
      
      if (recentAnalyses.length === 0) {
        return {
          avgProcessingTime: 0,
          successRate: 0,
          errorRate: 0
        };
      }

      const avgProcessingTime = recentAnalyses.reduce((sum, a) => sum + a.processingTime, 0) / recentAnalyses.length;
      const successCount = recentAnalyses.filter(a => a.success).length;
      const successRate = successCount / recentAnalyses.length;
      const errorRate = 1 - successRate;

      return {
        avgProcessingTime: Math.round(avgProcessingTime),
        successRate: Math.round(successRate * 100) / 100,
        errorRate: Math.round(errorRate * 100) / 100
      };

    } catch (error) {
      this.logger.error('Failed to get performance metrics', { error });
      return {
        avgProcessingTime: 0,
        successRate: 0,
        errorRate: 1
      };
    }
  }

  /**
   * 获取业务指标
   */
  async getBusinessMetrics(): Promise<{
    conversionRate: number;
    averageOrderValue: number;
    dailyActiveUsers: number;
    totalRevenue: number;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayConversions = this.metrics.conversions.filter(
        c => c.timestamp >= today
      );
      
      const todaySessions = this.metrics.userSessions.filter(
        s => s.startTime >= today
      );

      const totalSessions = todaySessions.length;
      const paidConversions = todayConversions.filter(c => c.action === 'purchase');
      const conversionRate = totalSessions > 0 ? paidConversions.length / totalSessions : 0;
      
      const totalRevenue = paidConversions.reduce((sum, c) => sum + (c.value || 0), 0);
      const averageOrderValue = paidConversions.length > 0 ? totalRevenue / paidConversions.length : 0;
      
      const uniqueUsers = new Set(todaySessions.map(s => s.userId)).size;

      return {
        conversionRate: Math.round(conversionRate * 10000) / 100, // 保留2位小数的百分比
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        dailyActiveUsers: uniqueUsers,
        totalRevenue: Math.round(totalRevenue * 100) / 100
      };

    } catch (error) {
      this.logger.error('Failed to get business metrics', { error });
      return {
        conversionRate: 0,
        averageOrderValue: 0,
        dailyActiveUsers: 0,
        totalRevenue: 0
      };
    }
  }

  /**
   * 获取实时统计
   */
  getRealTimeStats(): RealTimeStats {
    return { ...this.metrics.realTimeStats };
  }

  /**
   * 获取日常统计
   */
  getDailyStats(): DailyStats {
    return { ...this.metrics.dailyStats };
  }

  /**
   * 导出指标数据
   */
  exportMetrics(timeRange?: { start: Date; end: Date }): any {
    try {
      const start = timeRange?.start || new Date(Date.now() - 24 * 60 * 60 * 1000);
      const end = timeRange?.end || new Date();

      return {
        analyses: this.metrics.analyses.filter(
          a => a.timestamp >= start && a.timestamp <= end
        ),
        conversions: this.metrics.conversions.filter(
          c => c.timestamp >= start && c.timestamp <= end
        ),
        errors: this.metrics.errors.filter(
          e => e.timestamp >= start && e.timestamp <= end
        ),
        userSessions: this.metrics.userSessions.filter(
          s => s.startTime >= start && s.startTime <= end
        ),
        summary: {
          timeRange: { start, end },
          totalAnalyses: this.metrics.analyses.length,
          totalConversions: this.metrics.conversions.length,
          totalErrors: this.metrics.errors.length,
          totalSessions: this.metrics.userSessions.length
        }
      };

    } catch (error) {
      this.logger.error('Failed to export metrics', { error });
      return null;
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      // 检查指标收集是否正常
      const recentMetrics = this.getRecentMetrics(this.metrics.analyses, 300000); // 5分钟内
      
      // 如果5分钟内没有任何指标，可能有问题
      if (this.config.monitoring.enabled && recentMetrics.length === 0) {
        this.logger.warn('No recent metrics found');
      }

      return true;

    } catch (error) {
      this.logger.error('Metrics health check failed', { error });
      return false;
    }
  }

  /**
   * 释放资源
   */
  async dispose(): Promise<void> {
    try {
      // 停止定时任务
      if (this.metricsInterval) {
        clearInterval(this.metricsInterval);
      }

      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
      }

      this.logger.info('Metrics collector disposed');

    } catch (error) {
      this.logger.error('Metrics dispose error', { error });
    }
  }

  // 私有方法

  private metricsInterval?: NodeJS.Timeout;
  private cleanupInterval?: NodeJS.Timeout;

  /**
   * 初始化日常统计
   */
  private initDailyStats(): DailyStats {
    return {
      date: new Date().toISOString().split('T')[0] || new Date().toISOString().substring(0, 10),
      totalAnalyses: 0,
      successfulAnalyses: 0,
      totalConversions: 0,
      totalRevenue: 0,
      uniqueUsers: new Set(),
      avgProcessingTime: 0,
      errorCount: 0
    };
  }

  /**
   * 初始化实时统计
   */
  private initRealTimeStats(): RealTimeStats {
    return {
      timestamp: new Date(),
      activeUsers: 0,
      analysesInProgress: 0,
      recentErrors: 0,
      currentLoad: 0,
      systemHealth: 'healthy'
    };
  }

  /**
   * 启动指标收集
   */
  private startMetricsCollection(): void {
    // 每分钟更新实时统计
    this.metricsInterval = setInterval(() => {
      this.updateRealTimeStats();
    }, 60000);

    // 每小时清理旧数据
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldMetrics();
    }, 3600000);
  }

  /**
   * 更新实时统计
   */
  private updateRealTimeStats(_type?: string, _metric?: any): void {
    try {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      // 更新活跃用户数
      const recentSessions = this.metrics.userSessions.filter(
        s => s.startTime >= fiveMinutesAgo
      );
      this.metrics.realTimeStats.activeUsers = new Set(recentSessions.map(s => s.userId)).size;

      // 更新进行中的分析数
      const recentAnalyses = this.metrics.analyses.filter(
        a => a.timestamp >= fiveMinutesAgo
      );
      this.metrics.realTimeStats.analysesInProgress = recentAnalyses.filter(a => !a.success && !a.error).length;

      // 更新近期错误数
      const recentErrors = this.metrics.errors.filter(
        e => e.timestamp >= fiveMinutesAgo
      );
      this.metrics.realTimeStats.recentErrors = recentErrors.length;

      // 更新系统负载
      this.metrics.realTimeStats.currentLoad = this.calculateSystemLoad();

      // 更新系统健康状态
      this.metrics.realTimeStats.systemHealth = this.calculateSystemHealth();

      this.metrics.realTimeStats.timestamp = now;

    } catch (error) {
      this.logger.error('Failed to update real-time stats', { error });
    }
  }

  /**
   * 更新日常统计
   */
  private updateDailyStats(type: string, metric: any): void {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 如果是新的一天，重置统计
      if (this.metrics.dailyStats.date !== today) {
        this.metrics.dailyStats = this.initDailyStats();
      }

      switch (type) {
        case 'analysis':
          this.metrics.dailyStats.totalAnalyses++;
          if (metric.success) {
            this.metrics.dailyStats.successfulAnalyses++;
          }
          break;

        case 'conversion':
          this.metrics.dailyStats.totalConversions++;
          if (metric.value) {
            this.metrics.dailyStats.totalRevenue += metric.value;
          }
          break;

        case 'session':
          this.metrics.dailyStats.uniqueUsers.add(metric.userId);
          break;

        case 'error':
          this.metrics.dailyStats.errorCount++;
          break;
      }

    } catch (error) {
      this.logger.error('Failed to update daily stats', { error });
    }
  }

  /**
   * 检查告警阈值
   */
  private checkAlerts(type: string, metric: any): void {
    try {
      if (!this.config.monitoring.alerting.enabled) {
        return;
      }

      const thresholds = this.config.monitoring.alerting.thresholds;

      switch (type) {
        case 'analysis':
          if (metric.processingTime > thresholds.responseTime) {
            this.triggerAlert('slow_response', `分析处理时间 ${metric.processingTime}ms 超过阈值 ${thresholds.responseTime}ms`);
          }
          break;

        case 'error':
          // 检查错误率
          const recentAnalyses = this.getRecentMetrics(this.metrics.analyses, 300000);
          const errorRate = recentAnalyses.length > 0 ? 
            recentAnalyses.filter(a => !a.success).length / recentAnalyses.length : 0;
          
          if (errorRate > thresholds.errorRate) {
            this.triggerAlert('high_error_rate', `错误率 ${(errorRate * 100).toFixed(2)}% 超过阈值 ${(thresholds.errorRate * 100).toFixed(2)}%`);
          }
          break;

        case 'conversion':
          // 检查转化率
          const recentConversions = this.getRecentMetrics(this.metrics.conversions, 3600000);
          const recentSessions = this.metrics.userSessions.filter(s => s.startTime >= new Date(Date.now() - 3600000));
          
          if (recentSessions.length > 10) { // 至少有10个会话才检查
            const conversionRate = recentConversions.filter(c => c.action === 'purchase').length / recentSessions.length;
            if (conversionRate < thresholds.conversionRate) {
              this.triggerAlert('low_conversion', `转化率 ${(conversionRate * 100).toFixed(2)}% 低于阈值 ${(thresholds.conversionRate * 100).toFixed(2)}%`);
            }
          }
          break;
      }

    } catch (error) {
      this.logger.error('Failed to check alerts', { error });
    }
  }

  /**
   * 触发告警
   */
  private triggerAlert(type: string, message: string): void {
    this.logger.warn('Alert triggered', { type, message });
    
    // 在实际项目中，这里会发送到告警系统
    // 例如：Slack、PagerDuty、Email 等
  }

  /**
   * 获取最近的指标
   */
  private getRecentMetrics<T extends { timestamp: Date }>(metrics: T[], timeWindow: number): T[] {
    const cutoff = new Date(Date.now() - timeWindow);
    return metrics.filter(m => m.timestamp >= cutoff);
  }

  /**
   * 计算系统负载
   */
  private calculateSystemLoad(): number {
    // 简化的负载计算，实际项目中可能会考虑更多因素
    const recentAnalyses = this.getRecentMetrics(this.metrics.analyses, 60000); // 1分钟内
    return Math.min(recentAnalyses.length / 10, 1); // 假设10个分析为满负载
  }

  /**
   * 计算系统健康状态
   */
  private calculateSystemHealth(): 'healthy' | 'degraded' | 'unhealthy' {
    const recentErrors = this.getRecentMetrics(this.metrics.errors, 300000); // 5分钟内
    const currentLoad = this.metrics.realTimeStats.currentLoad;

    if (recentErrors.length > 5 || currentLoad > 0.9) {
      return 'unhealthy';
    } else if (recentErrors.length > 2 || currentLoad > 0.7) {
      return 'degraded';
    } else {
      return 'healthy';
    }
  }

  /**
   * 清理旧指标数据
   */
  private cleanupOldMetrics(): void {
    try {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 保留24小时

      // 清理旧的分析指标
      this.metrics.analyses = this.metrics.analyses.filter(a => a.timestamp >= cutoff);
      
      // 清理旧的转化指标
      this.metrics.conversions = this.metrics.conversions.filter(c => c.timestamp >= cutoff);
      
      // 清理旧的错误指标
      this.metrics.errors = this.metrics.errors.filter(e => e.timestamp >= cutoff);
      
      // 清理旧的会话指标
      this.metrics.userSessions = this.metrics.userSessions.filter(s => s.startTime >= cutoff);
      
      // 清理旧的缓存指标
      this.metrics.cacheStats = this.metrics.cacheStats.filter(c => c.timestamp >= cutoff);

      this.logger.debug('Old metrics cleaned up');

    } catch (error) {
      this.logger.error('Failed to cleanup old metrics', { error });
    }
  }
}

// 类型定义
interface AnalysisMetric {
  type: 'quick' | 'full';
  processingTime: number;
  success: boolean;
  userId: string;
  error?: string;
  timestamp: Date;
}

interface ConversionMetric {
  userId: string;
  action: 'view_report' | 'click_upgrade' | 'purchase' | 'abandon';
  value?: number;
  source: string;
  timestamp: Date;
}

interface ErrorMetric {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  stack?: string;
  userId?: string;
  timestamp: Date;
}

interface UserSessionMetric {
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  actions: string[];
  source: string;
}

interface CacheMetric {
  hitRate: number;
  size: number;
  evictions: number;
  timestamp: Date;
}

interface DailyStats {
  date: string;
  totalAnalyses: number;
  successfulAnalyses: number;
  totalConversions: number;
  totalRevenue: number;
  uniqueUsers: Set<string>;
  avgProcessingTime: number;
  errorCount: number;
}

interface RealTimeStats {
  timestamp: Date;
  activeUsers: number;
  analysesInProgress: number;
  recentErrors: number;
  currentLoad: number;
  systemHealth: 'healthy' | 'degraded' | 'unhealthy';
}