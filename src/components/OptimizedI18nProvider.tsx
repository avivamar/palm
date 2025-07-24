'use client';

import { NextIntlClientProvider } from 'next-intl';
import { useEffect, useState } from 'react';
import { loadSecondaryTranslations } from '@/utils/i18n-loader';

type OptimizedI18nProviderProps = {
  locale: string;
  criticalMessages: any;
  children: React.ReactNode;
};

export function OptimizedI18nProvider({
  locale,
  criticalMessages,
  children,
}: OptimizedI18nProviderProps) {
  const [messages, setMessages] = useState(criticalMessages);
  const [isLoadingSecondary, setIsLoadingSecondary] = useState(true);

  useEffect(() => {
    // 延迟加载次要翻译
    const loadSecondary = async () => {
      try {
        const secondaryMessages = await loadSecondaryTranslations(locale);
        setMessages((prev: any) => ({ ...prev, ...secondaryMessages }));
      } catch (error) {
        console.error('Failed to load secondary translations:', error);
      } finally {
        setIsLoadingSecondary(false);
      }
    };

    // 使用 requestIdleCallback 优化加载时机
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => loadSecondary());
      return () => window.cancelIdleCallback(id);
    } else {
      // 降级方案
      const timer = setTimeout(loadSecondary, 100);
      return () => clearTimeout(timer);
    }
  }, [locale]);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      onError={(error) => {
        // 静默处理缺失的翻译，避免影响性能
        if (process.env.NODE_ENV === 'development') {
          console.warn('Translation error:', error);
        }
      }}
    >
      {children}
      {/* 可选：加载指示器 */}
      {isLoadingSecondary && process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 text-xs text-gray-500">
          Loading translations...
        </div>
      )}
    </NextIntlClientProvider>
  );
}
