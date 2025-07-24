/**
 * 🧪 A/B测试管理系统
 * 实现文档中建议的A/B测试框架
 */
'use client';

import { useEffect, useState } from 'react';

export type ABTestConfig = {
  id: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  trafficAllocation: Record<string, number>; // variant -> percentage
  startDate: Date;
  endDate?: Date;
  status: 'draft' | 'active' | 'paused' | 'completed';
  targetMetrics: string[];
  segmentRules?: ABTestSegmentRule[];
};

export type ABTestVariant = {
  id: string;
  name: string;
  description: string;
  config: Record<string, any>;
  isControl: boolean;
};

export type ABTestSegmentRule = {
  type: 'utm_source' | 'utm_medium' | 'utm_campaign' | 'device' | 'location' | 'new_visitor' | 'returning_visitor';
  operator: 'equals' | 'contains' | 'not_equals';
  value: string;
};

export type ABTestAssignment = {
  userId?: string;
  sessionId: string;
  testId: string;
  variantId: string;
  assignedAt: Date;
  exposureLogged: boolean;
};

export type ABTestMetrics = {
  testId: string;
  variantId: string;
  date: string;
  metrics: {
    // 漏斗指标
    visitors: number;
    emailCaptures: number;
    formCompletions: number;
    paymentIntents: number;
    completedPurchases: number;

    // 转化率
    emailCaptureRate: number;
    formCompletionRate: number;
    paymentConversionRate: number;
    overallConversionRate: number;

    // 营销指标
    marketingROI: number;
    customerLTV: number;
    averageOrderValue: number;

    // 用户体验指标
    timeOnSite: number;
    pageViews: number;
    bounceRate: number;
  };
};

/**
 * 🎯 A/B测试配置：渐进式 vs 传统预订流程
 */
export const PROGRESSIVE_VS_TRADITIONAL_TEST: ABTestConfig = {
  id: 'progressive-vs-traditional-2024',
  name: 'Progressive vs Traditional Preorder Flow',
  description: 'Test progressive email collection vs traditional full form',
  variants: [
    {
      id: 'control-traditional',
      name: 'Traditional Full Form',
      description: 'Current implementation: collect all info at once',
      config: {
        formType: 'traditional',
        showFullForm: true,
        requireAllFields: true,
      },
      isControl: true,
    },
    {
      id: 'variant-progressive',
      name: 'Progressive Form',
      description: 'Step 1: Email → Step 2: Product → Step 3: Payment',
      config: {
        formType: 'progressive',
        showEmailFirst: true,
        delayProductSelection: true,
        addProgressIndicator: true,
      },
      isControl: false,
    },
  ],
  trafficAllocation: {
    'control-traditional': 50,
    'variant-progressive': 50,
  },
  startDate: new Date('2025-01-15'),
  status: 'active',
  targetMetrics: [
    'emailCaptureRate',
    'formCompletionRate',
    'paymentConversionRate',
    'overallConversionRate',
    'marketingROI',
    'customerLTV',
  ],
  segmentRules: [
    // 只对新访客进行测试
    {
      type: 'new_visitor',
      operator: 'equals',
      value: 'true',
    },
  ],
};

/**
 * 🧪 A/B测试管理器
 */
export class ABTestManager {
  private static instance: ABTestManager;
  private activeTests: Map<string, ABTestConfig> = new Map();
  private userAssignments: Map<string, ABTestAssignment[]> = new Map();

  static getInstance(): ABTestManager {
    if (!ABTestManager.instance) {
      ABTestManager.instance = new ABTestManager();
      // 初始化测试配置
      ABTestManager.instance.activeTests.set(
        PROGRESSIVE_VS_TRADITIONAL_TEST.id,
        PROGRESSIVE_VS_TRADITIONAL_TEST,
      );
    }
    return ABTestManager.instance;
  }

  /**
   * 🎯 获取用户的测试变体分配
   */
  async assignUserToTest(
    testId: string,
    sessionId: string,
    userId?: string,
    userContext?: {
      isNewVisitor?: boolean;
      utmSource?: string;
      utmMedium?: string;
      utmCampaign?: string;
      device?: string;
      location?: string;
    },
  ): Promise<ABTestVariant | null> {
    const test = this.activeTests.get(testId);
    if (!test || test.status !== 'active') {
      return null;
    }

    // 检查是否符合分组规则
    if (!this.matchesSegmentRules(test.segmentRules || [], userContext || {})) {
      return null;
    }

    // 检查是否已有分配
    const existingAssignment = this.getUserAssignment(sessionId, testId);
    if (existingAssignment) {
      const variant = test.variants.find(v => v.id === existingAssignment.variantId);
      return variant || null;
    }

    // 新分配
    const variant = this.selectVariant(test, sessionId);
    if (variant) {
      const assignment: ABTestAssignment = {
        userId,
        sessionId,
        testId,
        variantId: variant.id,
        assignedAt: new Date(),
        exposureLogged: false,
      };

      // 保存分配记录
      if (!this.userAssignments.has(sessionId)) {
        this.userAssignments.set(sessionId, []);
      }
      this.userAssignments.get(sessionId)!.push(assignment);

      // 持久化到本地存储
      this.persistAssignment(assignment);
    }

    return variant;
  }

  /**
   * 🎲 根据流量分配选择变体
   */
  private selectVariant(test: ABTestConfig, sessionId: string): ABTestVariant | null {
    // 使用sessionId创建确定性hash
    const hash = this.hashString(sessionId + test.id);
    const bucket = hash % 100;

    let cumulativeWeight = 0;
    for (const variant of test.variants) {
      cumulativeWeight += test.trafficAllocation[variant.id] || 0;
      if (bucket < cumulativeWeight) {
        return variant;
      }
    }

    return null;
  }

  /**
   * 📏 检查用户是否符合分组规则
   */
  private matchesSegmentRules(
    rules: ABTestSegmentRule[],
    userContext: Record<string, any>,
  ): boolean {
    if (rules.length === 0) {
      return true;
    }

    return rules.every((rule) => {
      const contextValue = userContext[rule.type];
      if (contextValue === undefined) {
        return false;
      }

      switch (rule.operator) {
        case 'equals':
          return contextValue === rule.value;
        case 'contains':
          return String(contextValue).includes(rule.value);
        case 'not_equals':
          return contextValue !== rule.value;
        default:
          return false;
      }
    });
  }

  /**
   * 📊 记录测试曝光
   */
  async logExposure(sessionId: string, testId: string, variantId: string): Promise<void> {
    const assignments = this.userAssignments.get(sessionId) || [];
    const assignment = assignments.find(a => a.testId === testId && a.variantId === variantId);

    if (assignment && !assignment.exposureLogged) {
      assignment.exposureLogged = true;

      console.log(`[ABTest] Exposure logged: ${testId}:${variantId} for session ${sessionId}`);

      // 发送到分析系统
      try {
        await this.sendExposureEvent({
          testId,
          variantId,
          sessionId,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('[ABTest] Failed to send exposure event:', error);
      }
    }
  }

  /**
   * 📈 记录转化事件
   */
  async logConversion(
    sessionId: string,
    testId: string,
    eventType: 'email_capture' | 'form_completion' | 'payment_intent' | 'purchase_completion',
    value?: number,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const assignments = this.userAssignments.get(sessionId) || [];
    const assignment = assignments.find(a => a.testId === testId);

    if (!assignment) {
      return;
    }

    console.log(`[ABTest] Conversion logged: ${testId}:${assignment.variantId} - ${eventType}`);

    try {
      await this.sendConversionEvent({
        testId,
        variantId: assignment.variantId,
        sessionId,
        eventType,
        value,
        metadata,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[ABTest] Failed to send conversion event:', error);
    }
  }

  /**
   * 💾 获取用户分配
   */
  private getUserAssignment(sessionId: string, testId: string): ABTestAssignment | undefined {
    // 先从内存查找
    const assignments = this.userAssignments.get(sessionId) || [];
    let assignment = assignments.find(a => a.testId === testId);

    // 如果内存中没有，从本地存储恢复
    if (!assignment) {
      assignment = this.loadAssignmentFromStorage(sessionId, testId);
      if (assignment) {
        if (!this.userAssignments.has(sessionId)) {
          this.userAssignments.set(sessionId, []);
        }
        this.userAssignments.get(sessionId)!.push(assignment);
      }
    }

    return assignment;
  }

  /**
   * 💾 持久化分配记录
   */
  private persistAssignment(assignment: ABTestAssignment): void {
    try {
      const key = `abtest_${assignment.sessionId}_${assignment.testId}`;
      localStorage.setItem(key, JSON.stringify({
        ...assignment,
        assignedAt: assignment.assignedAt.toISOString(),
      }));
    } catch (error) {
      console.warn('[ABTest] Failed to persist assignment:', error);
    }
  }

  /**
   * 📥 从存储加载分配记录
   */
  private loadAssignmentFromStorage(sessionId: string, testId: string): ABTestAssignment | undefined {
    try {
      const key = `abtest_${sessionId}_${testId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const data = JSON.parse(stored);
        return {
          ...data,
          assignedAt: new Date(data.assignedAt),
        };
      }
    } catch (error) {
      console.warn('[ABTest] Failed to load assignment:', error);
    }
    return undefined;
  }

  /**
   * 🔢 创建确定性hash
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash);
  }

  /**
   * 📊 发送曝光事件
   */
  private async sendExposureEvent(data: any): Promise<void> {
    // 实现发送到分析系统的逻辑
    // 可以发送到 Google Analytics, Mixpanel, 或自定义分析端点

    // 示例：发送到自定义端点
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/ab-test/exposure', JSON.stringify(data));
    }
  }

  /**
   * 📈 发送转化事件
   */
  private async sendConversionEvent(data: any): Promise<void> {
    // 实现发送到分析系统的逻辑
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/ab-test/conversion', JSON.stringify(data));
    }
  }

  /**
   * 📊 获取测试结果摘要
   */
  async getTestResults(testId: string): Promise<Record<string, any> | null> {
    const test = this.activeTests.get(testId);
    if (!test) {
      return null;
    }

    // 这里应该从数据库或分析系统获取实际结果
    // 返回模拟数据作为示例
    return {
      testId,
      testName: test.name,
      status: test.status,
      variants: test.variants.map(variant => ({
        id: variant.id,
        name: variant.name,
        isControl: variant.isControl,
        // 模拟指标
        metrics: {
          visitors: Math.floor(Math.random() * 1000) + 500,
          emailCaptureRate: Math.random() * 0.3 + 0.1,
          formCompletionRate: Math.random() * 0.2 + 0.05,
          paymentConversionRate: Math.random() * 0.15 + 0.03,
          overallConversionRate: Math.random() * 0.1 + 0.02,
        },
      })),
    };
  }
}

/**
 * 🎯 便捷Hook：在React组件中使用A/B测试
 */
export function useABTest(testId: string, sessionId: string, userId?: string) {
  const [variant, setVariant] = useState<ABTestVariant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const assignVariant = async () => {
      try {
        const manager = ABTestManager.getInstance();
        const userContext = {
          isNewVisitor: !localStorage.getItem('returning_visitor'),
          utmSource: new URLSearchParams(window.location.search).get('utm_source') || undefined,
          utmMedium: new URLSearchParams(window.location.search).get('utm_medium') || undefined,
          utmCampaign: new URLSearchParams(window.location.search).get('utm_campaign') || undefined,
        };

        const assignedVariant = await manager.assignUserToTest(testId, sessionId, userId, userContext);
        setVariant(assignedVariant);

        // 记录曝光
        if (assignedVariant) {
          await manager.logExposure(sessionId, testId, assignedVariant.id);
        }
      } catch (error) {
        console.error('[ABTest] Failed to assign variant:', error);
      } finally {
        setIsLoading(false);
      }
    };

    assignVariant();
  }, [testId, sessionId, userId]);

  const logConversion = async (
    eventType: 'email_capture' | 'form_completion' | 'payment_intent' | 'purchase_completion',
    value?: number,
    metadata?: Record<string, any>,
  ) => {
    const manager = ABTestManager.getInstance();
    await manager.logConversion(sessionId, testId, eventType, value, metadata);
  };

  return {
    variant,
    isLoading,
    logConversion,
    isControl: variant?.isControl || false,
    variantConfig: variant?.config || {},
  };
}

export default ABTestManager;
