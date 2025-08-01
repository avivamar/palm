'use client';

import Script from 'next/script';

type ClarityServiceProps = {
  projectId: string;
};

export function ClarityService({ projectId }: ClarityServiceProps) {
  if (!projectId) {
    console.warn('Microsoft Clarity: NEXT_PUBLIC_CLARITY_PROJECT_ID is not provided');
    return null;
  }

  return (
    <Script
      id="microsoft-clarity"
      strategy="afterInteractive"
      onLoad={() => {
        if (typeof window !== 'undefined') {
          // Microsoft Clarity is loaded via script tag, no need for additional import
          console.log('Microsoft Clarity loaded via script tag');
        }
      }}
    >
      {`
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${projectId}");
      `}
    </Script>
  );
}

// 导出 Clarity 功能函数
export const identifyUser = (userId: string, sessionId?: string, pageId?: string, userHint?: string) => {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('identify', userId, sessionId, pageId, userHint);
  }
};

export const setTag = (key: string, value: string) => {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('set', key, value);
  }
};

export const trackClarityEvent = (eventName: string) => {
  if (typeof window !== 'undefined' && window.clarity) {
    window.clarity('event', eventName);
  }
};

// 类型声明已在 src/types/clarity-js.d.ts 中定义
