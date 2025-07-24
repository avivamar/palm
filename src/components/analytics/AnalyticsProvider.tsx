'use client';

import { lazy, Suspense, useEffect, useState } from 'react';

import { ClarityService } from './services/ClarityService';
import { GoogleAnalytics } from './services/GoogleAnalytics';

// 动态导入非关键分析服务 - 明确指定默认导出
const MetaPixel = lazy(() => import('./services/MetaPixel').then(m => ({ default: m.default || m.MetaPixel })));
const TikTokPixel = lazy(() => import('./services/TikTokPixel').then(m => ({ default: m.default || m.TikTokPixel })));
const KlaviyoService = lazy(() => import('./services/KlaviyoService').then(m => ({ default: m.default || m.KlaviyoService })));

type AnalyticsProviderProps = {
  children?: React.ReactNode;
};

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const [isClient, setIsClient] = useState(false);
  const [analyticsLoaded, setAnalyticsLoaded] = useState(false);

  // 确保只在客户端渲染分析服务
  useEffect(() => {
    setIsClient(true);

    // 延迟加载非关键分析服务，避免阻塞首次渲染
    const timer = setTimeout(() => {
      setAnalyticsLoaded(true);
    }, 2000); // 2秒后加载，确保关键内容已渲染

    return () => clearTimeout(timer);
  }, []);

  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  const tiktokPixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
  const klaviyoCompanyId = process.env.NEXT_PUBLIC_KLAVIYO_COMPANY_ID;

  return (
    <>
      {children}

      {/* 只在客户端渲染分析服务，避免 hydration 不匹配 */}
      {isClient && (
        <>
          {/* 关键分析服务 - afterInteractive 策略，立即加载 */}
          {gaId && (
            <GoogleAnalytics gaId={gaId} />
          )}

          {clarityId && (
            <ClarityService projectId={clarityId} />
          )}

          {/* 非关键分析服务 - 延迟加载，减少主线程阻塞 */}
          {analyticsLoaded && (
            <>
              {metaPixelId && (
                <Suspense fallback={null}>
                  <MetaPixel pixelId={metaPixelId} />
                </Suspense>
              )}

              {tiktokPixelId && (
                <Suspense fallback={null}>
                  <TikTokPixel pixelId={tiktokPixelId} />
                </Suspense>
              )}

              {klaviyoCompanyId && (
                <Suspense fallback={null}>
                  <KlaviyoService companyId={klaviyoCompanyId} />
                </Suspense>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
