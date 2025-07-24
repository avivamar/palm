'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useABTest } from '@/libs/marketing/ab-testing';
import { useMarketingMetrics } from '@/libs/marketing/metrics-monitor';
import { MarketingTracker } from './MarketingTracker';
import { ProgressivePreorderForm } from './ProgressivePreorderForm';

/**
 * 🎯 精准营销系统主组件
 * 整合所有营销策略：渐进式收集 + A/B测试 + 实时监控
 */

type PrecisionMarketingSystemProps = {
  /** 页面类型 */
  pageType?: 'home' | 'product' | 'preorder' | 'checkout' | 'success';
  /** 是否启用调试模式 */
  debug?: boolean;
  /** 成功回调 */
  onPreorderSuccess?: (data: { email: string; color: string; priceId: string }) => void;
  /** 自定义样式 */
  className?: string;
};

export function PrecisionMarketingSystem({
  pageType = 'preorder',
  debug = false,
  onPreorderSuccess,
  className = '',
}: PrecisionMarketingSystemProps) {
  const { user } = useAuth();

  // 生成或获取会话ID
  const getSessionId = (): string => {
    let sessionId = sessionStorage.getItem('rolitt_session_id');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      sessionStorage.setItem('rolitt_session_id', sessionId);
    }
    return sessionId;
  };

  const sessionId = getSessionId();

  // 🧪 A/B测试：渐进式 vs 传统预订流程
  const {
    variant: abTestVariant,
    isLoading: abTestLoading,
    logConversion,
    variantConfig,
  } = useABTest('progressive-vs-traditional-2024', sessionId, user?.id);

  // 📊 营销指标监控
  const {
    current: currentMetrics,
    healthScore,
    alerts,
  } = useMarketingMetrics(true);

  // 🎯 处理预订成功
  const handlePreorderSuccess = async (data: { email: string; color: string; priceId: string }) => {
    try {
      // 记录A/B测试转化
      if (abTestVariant) {
        await logConversion('purchase_completion', 299, {
          variant: abTestVariant.id,
          formType: variantConfig.formType,
          ...data,
        });
      }

      // 调用外部成功回调
      onPreorderSuccess?.(data);

      if (debug) {
        console.log('[PrecisionMarketing] Preorder success:', data);
      }
    } catch (error) {
      console.error('[PrecisionMarketing] Failed to handle success:', error);
    }
  };

  // 🎯 处理阶段变化（用于A/B测试转化追踪）
  const handleStageChange = async (stage: number, data: any) => {
    try {
      if (!abTestVariant) {
        return;
      }

      switch (stage) {
        case 2: // 邮箱收集完成
          await logConversion('email_capture', undefined, {
            variant: abTestVariant.id,
            email: data.email,
            formType: variantConfig.formType,
          });
          break;

        case 3: // 表单完成，进入支付
          await logConversion('form_completion', undefined, {
            variant: abTestVariant.id,
            formType: variantConfig.formType,
            ...data,
          });
          break;
      }

      if (debug) {
        console.log(`[PrecisionMarketing] Stage ${stage} completed:`, data);
      }
    } catch (error) {
      console.error('[PrecisionMarketing] Failed to track stage change:', error);
    }
  };

  // 🚨 显示关键预警（仅在调试模式下）
  useEffect(() => {
    if (debug && alerts && alerts.length > 0) {
      const criticalAlerts = alerts.filter((a: any) => a.severity === 'critical');
      if (criticalAlerts.length > 0) {
        console.warn('[PrecisionMarketing] 🚨 Critical Marketing Alerts:', criticalAlerts);
      }
    }
  }, [alerts, debug]);

  // 🎯 渲染调试信息
  const DebugPanel = () => {
    if (!debug) {
      return null;
    }

    return (
      <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg text-sm max-w-md z-50">
        <div className="font-bold mb-2">🎯 Precision Marketing Debug</div>

        <div className="space-y-1">
          <div>
            📊 Health Score:
            <span className="font-mono">{healthScore || 'Loading...'}</span>
          </div>
          <div>
            🧪 A/B Test:
            <span className="font-mono">{abTestVariant?.name || 'Loading...'}</span>
          </div>
          {abTestVariant && (
            <div className="text-xs text-gray-300">
              {abTestVariant.isControl ? '🔵 Control' : '🟡 Variant'}
              {' '}
              -
              {variantConfig.formType}
            </div>
          )}

          {currentMetrics && (
            <div className="mt-2 text-xs text-gray-300">
              <div>
                Conversion:
                {(currentMetrics.overallConversionRate * 100).toFixed(2)}
                %
              </div>
              <div>
                LTV: $
                {currentMetrics.paidUserLTV.toFixed(0)}
              </div>
            </div>
          )}

          {alerts && alerts.length > 0 && (
            <div className="mt-2">
              <div className="text-yellow-400">
                🚨
                {alerts.length}
                {' '}
                Alert(s)
              </div>
              {alerts.slice(0, 2).map((alert: any) => (
                <div key={alert.id} className="text-xs text-red-300">
                  {alert.metric}
                  :
                  {alert.currentValue.toFixed(3)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 加载状态
  if (abTestLoading) {
    return (
      <div className={`flex items-center justify-center min-h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing precision marketing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* 🎯 营销追踪器 - 后台运行，不渲染UI */}
      <MarketingTracker
        email={user?.email}
        userId={user?.id}
        pageType={pageType}
        debug={debug}
        customProperties={{
          ab_test_variant: abTestVariant?.id,
          form_type: variantConfig.formType,
          health_score: healthScore,
        }}
      />

      {/* 🧪 A/B测试驱动的预订表单 */}
      <ProgressivePreorderForm
        abTestMode={variantConfig.formType || 'progressive'}
        className="w-full"
        onSuccess={handlePreorderSuccess}
        onStageChange={handleStageChange}
      />

      {/* 🔧 调试面板 */}
      <DebugPanel />

      {/* 📊 营销健康状态指示器（仅低健康分时显示） */}
      {healthScore !== null && healthScore < 70 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center text-yellow-800">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm">
              Marketing optimization in progress (Health:
              {' '}
              {healthScore}
              /100)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 🎯 便捷组件：仅追踪器（用于其他页面）
 */
export function MarketingTrackerOnly({
  pageType = 'home',
  debug = false,
}: {
  pageType?: 'home' | 'product' | 'preorder' | 'checkout' | 'success';
  debug?: boolean;
}) {
  const { user } = useAuth();

  return (
    <MarketingTracker
      email={user?.email}
      userId={user?.id}
      pageType={pageType}
      debug={debug}
    />
  );
}

export default PrecisionMarketingSystem;
