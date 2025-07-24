/**
 * 📊 精准营销关键指标监控系统
 * 基于PM文档中的预警阈值和追踪指标
 */
'use client';

import { useEffect, useState } from 'react';

export type MarketingMetrics = {
  // 漏斗转化率
  visitorToFormRate: number; // 访客 → 填表
  formToPaymentRate: number; // 填表 → 支付
  paymentToRegistrationRate: number; // 支付 → 注册
  overallConversionRate: number; // 总体转化率

  // 营销效果
  preorderEventTriggerRate: number; // 预订启动事件触发率
  abandonedCartRecoveryRate: number; // 放弃购物车挽回率
  retargetingCTR: number; // 重定向广告CTR

  // 用户质量
  paidUserLTV: number; // 付费用户LTV
  repurchaseRate: number; // 复购率
  referralRate: number; // 推荐率

  // 业务指标
  totalVisitors: number;
  emailCaptures: number;
  paymentIntents: number;
  completedPurchases: number;
  totalRevenue: number;

  // 时间戳
  timestamp: Date;
  period: 'hourly' | 'daily' | 'weekly' | 'monthly';
};

export type AlertRule = {
  id: string;
  metric: keyof MarketingMetrics;
  operator: 'less_than' | 'greater_than' | 'equals';
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  action?: string;
};

export type Alert = {
  id: string;
  ruleId: string;
  metric: string;
  currentValue: number;
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  action?: string;
  triggeredAt: Date;
  status: 'active' | 'acknowledged' | 'resolved';
};

/**
 * 🚨 基于PM文档的预警规则配置
 */
export const MARKETING_ALERT_RULES: AlertRule[] = [
  // PM文档预警阈值
  {
    id: 'form_conversion_low',
    metric: 'visitorToFormRate',
    operator: 'less_than',
    threshold: 0.03, // 3%
    severity: 'critical',
    message: '填表转化率过低，需要优化产品页',
    action: 'optimize_product_page',
  },
  {
    id: 'payment_conversion_low',
    metric: 'formToPaymentRate',
    operator: 'less_than',
    threshold: 0.70, // 70%
    severity: 'critical',
    message: '支付转化率过低，需要优化支付流程',
    action: 'optimize_payment_flow',
  },
  {
    id: 'recovery_rate_low',
    metric: 'abandonedCartRecoveryRate',
    operator: 'less_than',
    threshold: 0.15, // 15%
    severity: 'warning',
    message: '放弃挽回率过低，需要优化营销内容',
    action: 'optimize_marketing_content',
  },

  // 业务关键指标
  {
    id: 'overall_conversion_excellent',
    metric: 'overallConversionRate',
    operator: 'greater_than',
    threshold: 0.10, // 10%
    severity: 'info',
    message: '总体转化率优秀，考虑扩大营销投入',
    action: 'scale_marketing',
  },
  {
    id: 'ltv_declining',
    metric: 'paidUserLTV',
    operator: 'less_than',
    threshold: 500, // $500
    severity: 'warning',
    message: '用户LTV下降，检查产品价值和定价策略',
    action: 'review_pricing',
  },
  {
    id: 'retargeting_poor',
    metric: 'retargetingCTR',
    operator: 'less_than',
    threshold: 0.02, // 2%
    severity: 'warning',
    message: '重定向广告CTR偏低，优化广告创意',
    action: 'optimize_ad_creative',
  },
];

/**
 * 📊 营销指标监控器
 */
export class MarketingMetricsMonitor {
  private static instance: MarketingMetricsMonitor;
  private metrics: MarketingMetrics[] = [];
  private alerts: Alert[] = [];
  private alertRules: AlertRule[] = MARKETING_ALERT_RULES;

  static getInstance(): MarketingMetricsMonitor {
    if (!MarketingMetricsMonitor.instance) {
      MarketingMetricsMonitor.instance = new MarketingMetricsMonitor();
    }
    return MarketingMetricsMonitor.instance;
  }

  /**
   * 📈 收集当前指标快照
   */
  async collectMetrics(period: 'hourly' | 'daily' = 'hourly'): Promise<MarketingMetrics> {
    try {
      // 从数据库或分析系统获取指标
      const rawData = await this.fetchRawMetricsData(period);

      const metrics: MarketingMetrics = {
        // 计算转化率
        visitorToFormRate: rawData.emailCaptures / Math.max(rawData.totalVisitors, 1),
        formToPaymentRate: rawData.paymentIntents / Math.max(rawData.emailCaptures, 1),
        paymentToRegistrationRate: rawData.completedPurchases / Math.max(rawData.paymentIntents, 1),
        overallConversionRate: rawData.completedPurchases / Math.max(rawData.totalVisitors, 1),

        // 营销效果指标
        preorderEventTriggerRate: rawData.preorderEvents / Math.max(rawData.emailCaptures, 1),
        abandonedCartRecoveryRate: rawData.recoveredCarts / Math.max(rawData.abandonedCarts, 1),
        retargetingCTR: rawData.retargetingClicks / Math.max(rawData.retargetingImpressions, 1),

        // 用户质量指标
        paidUserLTV: rawData.totalRevenue / Math.max(rawData.completedPurchases, 1),
        repurchaseRate: rawData.repurchases / Math.max(rawData.completedPurchases, 1),
        referralRate: rawData.referrals / Math.max(rawData.completedPurchases, 1),

        // 原始数据
        totalVisitors: rawData.totalVisitors,
        emailCaptures: rawData.emailCaptures,
        paymentIntents: rawData.paymentIntents,
        completedPurchases: rawData.completedPurchases,
        totalRevenue: rawData.totalRevenue,

        timestamp: new Date(),
        period,
      };

      // 保存指标
      this.metrics.push(metrics);

      // 检查预警
      await this.checkAlerts(metrics);

      console.log(`[MetricsMonitor] Collected ${period} metrics:`, {
        conversion: `${(metrics.overallConversionRate * 100).toFixed(2)}%`,
        ltv: `$${metrics.paidUserLTV.toFixed(2)}`,
        visitors: metrics.totalVisitors,
      });

      return metrics;
    } catch (error) {
      console.error('[MetricsMonitor] Failed to collect metrics:', error);
      throw error;
    }
  }

  /**
   * 🚨 检查预警规则
   */
  private async checkAlerts(metrics: MarketingMetrics): Promise<void> {
    for (const rule of this.alertRules) {
      const currentValue = metrics[rule.metric] as number;
      let shouldAlert = false;

      switch (rule.operator) {
        case 'less_than':
          shouldAlert = currentValue < rule.threshold;
          break;
        case 'greater_than':
          shouldAlert = currentValue > rule.threshold;
          break;
        case 'equals':
          shouldAlert = Math.abs(currentValue - rule.threshold) < 0.001;
          break;
      }

      if (shouldAlert) {
        // 检查是否已有活跃预警
        const existingAlert = this.alerts.find(
          a => a.ruleId === rule.id && a.status === 'active',
        );

        if (!existingAlert) {
          const alert: Alert = {
            id: `alert_${Date.now()}_${Math.random().toString(36).substring(2)}`,
            ruleId: rule.id,
            metric: rule.metric,
            currentValue,
            threshold: rule.threshold,
            severity: rule.severity,
            message: rule.message,
            action: rule.action,
            triggeredAt: new Date(),
            status: 'active',
          };

          this.alerts.push(alert);
          await this.handleAlert(alert);
        }
      }
    }
  }

  /**
   * 🔔 处理预警
   */
  private async handleAlert(alert: Alert): Promise<void> {
    console.warn(`[MetricsMonitor] 🚨 ALERT [${alert.severity.toUpperCase()}]:`, {
      metric: alert.metric,
      current: alert.currentValue,
      threshold: alert.threshold,
      message: alert.message,
      action: alert.action,
    });

    // 发送到监控系统
    try {
      await this.sendAlertNotification(alert);
    } catch (error) {
      console.error('[MetricsMonitor] Failed to send alert notification:', error);
    }

    // 根据严重程度执行自动化行动
    if (alert.severity === 'critical' && alert.action) {
      await this.executeAutomatedAction(alert.action, alert);
    }
  }

  /**
   * 📊 获取指标趋势
   */
  getMetricsTrend(
    metric: keyof MarketingMetrics,
    hours: number = 24,
  ): { timestamps: Date[]; values: number[] } {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoff);

    return {
      timestamps: recentMetrics.map(m => m.timestamp),
      values: recentMetrics.map(m => m[metric] as number),
    };
  }

  /**
   * 📈 获取实时仪表板数据
   */
  getDashboardData(): {
    current: MarketingMetrics | null;
    alerts: Alert[];
    trends: Record<string, { timestamps: Date[]; values: number[] }>;
    healthScore: number;
  } {
    const current = this.metrics[this.metrics.length - 1] || null;
    const activeAlerts = this.alerts.filter(a => a.status === 'active');

    // 关键指标趋势
    const trends = {
      conversion: this.getMetricsTrend('overallConversionRate', 24),
      ltv: this.getMetricsTrend('paidUserLTV', 24),
      recovery: this.getMetricsTrend('abandonedCartRecoveryRate', 24),
    };

    // 计算健康评分 (0-100)
    let healthScore = 100;
    if (current) {
      // 根据关键指标调整健康评分
      if (current.visitorToFormRate < 0.03) {
        healthScore -= 30;
      }
      if (current.formToPaymentRate < 0.70) {
        healthScore -= 25;
      }
      if (current.abandonedCartRecoveryRate < 0.15) {
        healthScore -= 20;
      }
      if (current.overallConversionRate < 0.02) {
        healthScore -= 25;
      }

      // 预警扣分
      activeAlerts.forEach((alert) => {
        switch (alert.severity) {
          case 'critical': healthScore -= 15; break;
          case 'warning': healthScore -= 8; break;
          case 'info': healthScore += 2; break;
        }
      });
    }

    return {
      current,
      alerts: activeAlerts,
      trends,
      healthScore: Math.max(0, Math.min(100, healthScore)),
    };
  }

  /**
   * 📊 模拟数据获取（生产环境中应连接真实数据源）
   */
  private async fetchRawMetricsData(_period: string): Promise<any> {
    // 模拟数据 - 生产环境中应从数据库获取
    const baseVisitors = 1000;
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8-1.2

    return {
      totalVisitors: Math.floor(baseVisitors * randomFactor),
      emailCaptures: Math.floor(baseVisitors * randomFactor * 0.08), // ~8%
      paymentIntents: Math.floor(baseVisitors * randomFactor * 0.08 * 0.75), // ~75% of captures
      completedPurchases: Math.floor(baseVisitors * randomFactor * 0.08 * 0.75 * 0.80), // ~80% of intents
      totalRevenue: Math.floor(baseVisitors * randomFactor * 0.08 * 0.75 * 0.80 * 299),

      preorderEvents: Math.floor(baseVisitors * randomFactor * 0.08 * 0.95), // ~95% of captures
      abandonedCarts: Math.floor(baseVisitors * randomFactor * 0.08 * 0.25), // ~25% abandon
      recoveredCarts: Math.floor(baseVisitors * randomFactor * 0.08 * 0.25 * 0.18), // ~18% recovery

      retargetingImpressions: Math.floor(baseVisitors * randomFactor * 5), // 5x visitors
      retargetingClicks: Math.floor(baseVisitors * randomFactor * 5 * 0.025), // ~2.5% CTR

      repurchases: Math.floor(baseVisitors * randomFactor * 0.08 * 0.75 * 0.80 * 0.15), // ~15%
      referrals: Math.floor(baseVisitors * randomFactor * 0.08 * 0.75 * 0.80 * 0.12), // ~12%
    };
  }

  /**
   * 🔔 发送预警通知
   */
  private async sendAlertNotification(alert: Alert): Promise<void> {
    // 实现发送到Slack、邮件、短信等
    const payload = {
      type: 'marketing_alert',
      severity: alert.severity,
      metric: alert.metric,
      value: alert.currentValue,
      threshold: alert.threshold,
      message: alert.message,
      action: alert.action,
      timestamp: alert.triggeredAt.toISOString(),
    };

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/alerts/notify', JSON.stringify(payload));
    }
  }

  /**
   * 🤖 执行自动化行动
   */
  private async executeAutomatedAction(action: string, _alert: Alert): Promise<void> {
    console.log(`[MetricsMonitor] 🤖 Executing automated action: ${action}`);

    switch (action) {
      case 'optimize_product_page':
        // 触发产品页A/B测试
        console.log('🎯 Triggering product page optimization');
        break;

      case 'optimize_payment_flow':
        // 启用简化支付流程
        console.log('💳 Enabling simplified payment flow');
        break;

      case 'optimize_marketing_content':
        // 调整营销内容策略
        console.log('📧 Adjusting marketing content strategy');
        break;

      case 'scale_marketing':
        // 增加营销投入
        console.log('📈 Scaling marketing investment');
        break;

      default:
        console.log(`⚠️ Unknown action: ${action}`);
    }
  }
}

/**
 * 🎯 React Hook：在组件中使用营销指标
 */
export function useMarketingMetrics(autoRefresh: boolean = true) {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const monitor = MarketingMetricsMonitor.getInstance();

    const loadData = async () => {
      try {
        await monitor.collectMetrics();
        const data = monitor.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to load metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    if (autoRefresh) {
      const interval = setInterval(loadData, 5 * 60 * 1000); // 每5分钟刷新
      return () => clearInterval(interval);
    }

    return undefined;
  }, [autoRefresh]);

  return {
    ...dashboardData,
    isLoading,
    refresh: () => {
      setIsLoading(true);
      MarketingMetricsMonitor.getInstance().collectMetrics().then(() => {
        const data = MarketingMetricsMonitor.getInstance().getDashboardData();
        setDashboardData(data);
        setIsLoading(false);
      });
    },
  };
}

export default MarketingMetricsMonitor;
