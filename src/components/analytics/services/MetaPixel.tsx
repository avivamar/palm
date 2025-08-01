'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect } from 'react';

type MetaPixelProps = {
  pixelId: string;
};

export function MetaPixel({ pixelId }: MetaPixelProps) {
  const pathname = usePathname();

  useEffect(() => {
    // 路由变化时追踪页面浏览
    if (typeof window !== 'undefined' && window.fbq && typeof window.fbq === 'function') {
      try {
        window.fbq('track', 'PageView');
      } catch (error) {
        console.warn('Meta Pixel tracking error:', error);
      }
    }
  }, [pathname]);

  if (!pixelId) {
    console.warn('Meta Pixel: NEXT_PUBLIC_META_PIXEL_ID is not provided');
    return null;
  }

  return (
    <>
      {/* Meta Pixel 初始化脚本 - 在加载外部脚本前先初始化 fbq */}
      <Script
        id="meta-pixel-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            
            // 检查是否已经初始化过此 Pixel ID
            if (!window._fbPixelIds) {
              window._fbPixelIds = new Set();
            }
            
            if (!window._fbPixelIds.has('${pixelId}')) {
              window._fbPixelIds.add('${pixelId}');
              try {
                fbq('init', '${pixelId}');
                fbq('track', 'PageView');
              } catch (error) {
                console.warn('Meta Pixel init error:', error);
              }
            }
          `,
        }}
      />

      {/* NoScript 回退 */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

// 添加默认导出
export default MetaPixel;

// 导出事件追踪函数
export const trackMetaEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters);
  }
};

// 导出转化事件追踪函数
export const trackMetaConversion = (eventName: string, value?: number, currency = 'USD') => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, {
      value,
      currency,
    });
  }
};

// Meta Pixel 类型声明已在其他地方定义
