'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

type KlaviyoServiceProps = {
  companyId: string;
};

export function KlaviyoService({ companyId }: KlaviyoServiceProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // 确保只在客户端执行
    if (typeof window !== 'undefined') {
      // 无限制营销策略：直接加载 Klaviyo
      // 调试信息（仅开发环境）
      if (process.env.NODE_ENV === 'development') {
        // Klaviyo 无限制加载策略配置
      }

      // 立即加载 Klaviyo，无需任何条件检查
      setShouldLoad(true);
    }
  }, []);

  if (!companyId) {
    console.warn('Klaviyo: NEXT_PUBLIC_KLAVIYO_COMPANY_ID is not provided');
    return null;
  }

  if (!shouldLoad) {
    return null;
  }
  const MAX_RETRIES = 3;

  const handleError = (error: Error) => {
    console.error('Failed to load Klaviyo:', error);
    if (retryCount < MAX_RETRIES) {
      // 延迟重试，每次重试时间递增
      const retryDelay = 2 ** retryCount * 1000;
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setShouldLoad(false);
        setTimeout(() => setShouldLoad(true), 100);
      }, retryDelay);
    }
  };

  return (
    <Script
      id="klaviyo-service"
      strategy="afterInteractive"
      src={`https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=${companyId}&shop_platform=none`}
      onLoad={() => {
        if (typeof window !== 'undefined' && window.klaviyo) {
          setRetryCount(0); // 重置重试计数
        }
      }}
      onError={handleError}
    />
  );
}

// 导出 Klaviyo 功能函数
export const identifyKlaviyoUser = (email: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.klaviyo) {
    window.klaviyo.identify({
      email,
      ...properties,
    });
  }
};

export const trackKlaviyoEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.klaviyo) {
    window.klaviyo.track(eventName, properties);
  }
};

export const showKlaviyoForm = (formId: string) => {
  if (typeof window !== 'undefined' && window.klaviyo) {
    window.klaviyo.show(formId);
  }
};

// 类型声明
declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    klaviyo: any;
  }
}

// 添加默认导出
export default KlaviyoService;
