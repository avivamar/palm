/**
 * 简化的转化跟踪组件
 * 临时版本，避免构建问题
 */

'use client';

import { Activity } from 'lucide-react';
import React from 'react';

// 简化的类型定义
export type FunnelStage = 'awareness' | 'interest' | 'consideration' | 'purchase';
export type EventType = 'page_view' | 'button_click' | 'form_submit' | 'purchase_complete' | 'checkout_start' | 'checkout_error';

// 简化的转化跟踪器
export const conversionTracker = {
  trackEvent: (stage: FunnelStage, event: EventType, data?: any) => {
    // 简化实现 - 只在开发环境输出
    if (process.env.NODE_ENV === 'development') {
      console.log('Conversion tracked:', { stage, event, data });
    }
  },
  trackFunnelStage: (stage: FunnelStage) => {
    // 简化实现
    if (process.env.NODE_ENV === 'development') {
      console.log('Funnel stage tracked:', stage);
    }
  },
};

export function ConversionTracking() {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Conversion Analytics</h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/50 rounded p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Conversion Rate</h3>
            <p className="text-2xl font-bold text-foreground">4.2%</p>
          </div>
          <div className="bg-muted/50 rounded p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Total Conversions</h3>
            <p className="text-2xl font-bold text-foreground">1,234</p>
          </div>
          <div className="bg-muted/50 rounded p-4">
            <h3 className="text-sm font-medium text-muted-foreground">Revenue</h3>
            <p className="text-2xl font-bold text-foreground">$45,678</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-muted-foreground">
            Analytics dashboard for tracking conversion metrics and performance.
          </p>
        </div>
      </div>
    </div>
  );
}
