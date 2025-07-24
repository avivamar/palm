'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';

type TikTokPixelProps = {
  pixelId: string;
};

export function TikTokPixel({ pixelId }: TikTokPixelProps) {
  const pathname = usePathname();

  useEffect(() => {
    // 路由变化时追踪页面浏览
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.page();
    }
  }, [pathname]);

  if (!pixelId) {
    console.warn('TikTok Pixel: NEXT_PUBLIC_TIKTOK_PIXEL_ID is not provided');
    return null;
  }

  return (
    <Script
      id="tiktok-pixel"
      strategy="lazyOnload"
      onLoad={() => {
        // 使用 requestIdleCallback 在浏览器空闲时加载
        const loadTikTokPixel = () => {
          if (typeof window !== 'undefined') {
            try {
              // 初始化 TikTok Pixel
              window.ttq = window.ttq || function () {
                (window.ttq.q = window.ttq.q || []).push(arguments);
              };
              window.ttq.l = +new Date();
              window.ttq.init(pixelId);
              window.ttq.page();
            } catch (error) {
              console.error('TikTok Pixel initialization failed:', error);
            }
          }
        };

        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(loadTikTokPixel, { timeout: 5000 });
        } else {
          setTimeout(loadTikTokPixel, 3000);
        }
      }}
      onError={(error) => {
        console.error('TikTok Pixel script failed to load:', error);
      }}
    >
      {`
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
        }(window, document, 'ttq');
      `}
    </Script>
  );
}

// 导出事件追踪函数
export const trackTikTokEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.ttq) {
    window.ttq.track(eventName, parameters);
  }
};

// 导出转化事件追踪函数
export const trackTikTokConversion = (eventName: string, value?: number, currency = 'USD') => {
  if (typeof window !== 'undefined' && window.ttq) {
    window.ttq.track(eventName, {
      value,
      currency,
    });
  }
};

// 类型声明
declare global {
  interface Window {
    ttq: any;
  }
}

// 添加默认导出
export default TikTokPixel;
