'use client';

import { lazy, Suspense, useEffect, useState } from 'react';

// 只导入最关键的分析服务
const GoogleAnalytics = lazy(() =>
  import('./services/GoogleAnalytics').then(m => ({
    default: m.GoogleAnalytics,
  })),
);

// 将所有次要分析服务打包在一起延迟加载
const SecondaryAnalytics = lazy(() =>
  import('./SecondaryAnalyticsBundle'),
);

type AnalyticsProviderProps = {
  children?: React.ReactNode;
};

export function OptimizedAnalyticsProvider({ children }: AnalyticsProviderProps) {
  const [analyticsPhase, setAnalyticsPhase] = useState<'none' | 'critical' | 'all'>('none');

  useEffect(() => {
    // 阶段性加载分析工具

    // 阶段1: 1秒后加载关键分析（GA）
    const phase1Timer = setTimeout(() => {
      setAnalyticsPhase('critical');
    }, 1000);

    // 阶段2: 使用 requestIdleCallback 加载次要分析
    let phase2Id: number;

    if ('requestIdleCallback' in window) {
      phase2Id = window.requestIdleCallback(() => {
        setAnalyticsPhase('all');
      }, { timeout: 5000 }); // 最多等待5秒
    } else {
      // 降级方案：3秒后加载
      const phase2Timer = setTimeout(() => {
        setAnalyticsPhase('all');
      }, 3000);

      return () => {
        clearTimeout(phase1Timer);
        clearTimeout(phase2Timer);
      };
    }

    return () => {
      clearTimeout(phase1Timer);
      if (phase2Id) {
        window.cancelIdleCallback(phase2Id);
      }
    };
  }, []);

  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const hasSecondaryAnalytics = Boolean(
    process.env.NEXT_PUBLIC_META_PIXEL_ID
    || process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID
    || process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID
    || process.env.NEXT_PUBLIC_KLAVIYO_COMPANY_ID,
  );

  return (
    <>
      {children}

      {/* 阶段1: 关键分析工具 */}
      {analyticsPhase !== 'none' && gaId && (
        <Suspense fallback={null}>
          <GoogleAnalytics gaId={gaId} />
        </Suspense>
      )}

      {/* 阶段2: 次要分析工具 */}
      {analyticsPhase === 'all' && hasSecondaryAnalytics && (
        <Suspense fallback={null}>
          <SecondaryAnalytics />
        </Suspense>
      )}

      {/* 开发环境指示器 */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-20 right-4 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          Analytics:
          {' '}
          {analyticsPhase}
        </div>
      )}
    </>
  );
}
