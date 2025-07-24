'use client';

import { GoogleAnalytics as NextGoogleAnalytics } from '@next/third-parties/google';

type GoogleAnalyticsProps = {
  gaId: string;
};

export function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  if (!gaId) {
    console.warn('Google Analytics: GA_MEASUREMENT_ID is not provided');
    return null;
  }

  return (
    <NextGoogleAnalytics
      gaId={gaId}
      dataLayerName="dataLayer"
    />
  );
}

// 导出事件追踪函数
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

// 导出页面浏览追踪函数
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      page_path: url,
    });
  }
};

// 类型声明
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}
