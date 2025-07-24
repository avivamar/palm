import type { Metadata, Viewport } from 'next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react';

import { ConditionalLayout } from '@/components/ConditionalLayout';
import { OrganizationJsonLd } from '@/components/JsonLd';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { routing } from '@/libs/i18nRouting';
import { fontSans } from '@/styles/fonts';
import '@/styles/globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    template: '%s | Rolitt',
    default: 'Rolitt - Your AI Companion',
  },
  description: 'Rolitt is a next-generation AI companion that combines emotional recognition, natural language processing, and machine learning technologies.',
  metadataBase: new URL(process.env.SITE_URL || 'https://www.rolitt.com'),
  applicationName: 'Rolitt',
  authors: [{ name: 'Rolitt Team', url: 'https://www.rolitt.com/about' }],
  generator: 'Next.js',
  keywords: ['AI companion', 'emotional AI', 'smart robot', 'Rolitt', 'AI technology'],
  referrer: 'origin-when-cross-origin',
  creator: 'Rolitt',
  publisher: 'Rolitt',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      'index': true,
      'follow': true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.rolitt.com',
    siteName: 'Rolitt',
    title: 'Rolitt - Your AI Companion',
    description: 'Rolitt is a next-generation AI companion that combines emotional recognition, natural language processing, and machine learning technologies.',
    images: [
      {
        url: '/twittercard.webp',
        width: 1200,
        height: 630,
        alt: 'Rolitt AI Companion',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rolitt - Your AI Companion',
    description: 'Rolitt is a next-generation AI companion that combines emotional recognition, natural language processing, and machine learning technologies.',
    creator: '@rolittai',
    images: ['/twittercard.webp'],
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    other: {
      'baidu-site-verification': 'codeva-7Z6oDod9Qm',
    },
  },
  alternates: {
    languages: {
      'en': 'https://www.rolitt.com',
      'es': 'https://www.rolitt.com/es',
      'ja': 'https://www.rolitt.com/ja',
      'zh-HK': 'https://www.rolitt.com/zh-HK',
    },
  },
};

// 优化：异步加载非关键翻译文件
async function getCoreMessages(locale: string) {
  try {
    // 只加载首页必需的翻译文件
    return {
      ...(await import(`@/locales/${locale}/core.json`)).default,
      ...(await import(`@/locales/${locale}/pages.json`)).default,
    };
  } catch {
    notFound();
  }
}

// 延迟加载的分析提供者
const LazyAnalyticsProvider = React.lazy(() =>
  import('@/components/analytics/AnalyticsProvider').then(module => ({
    default: module.AnalyticsProvider,
  })),
);

const LazyAuthProvider = React.lazy(() =>
  import('@/contexts/AuthContext').then(module => ({
    default: module.AuthProvider,
  })),
);

const LazyAnimationProvider = React.lazy(() =>
  import('@/components/AnimationContext').then(module => ({
    default: module.AnimationProvider,
  })),
);

export async function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function OptimizedRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locale || !routing.locales.includes(locale)) {
    notFound();
  }

  // 只加载核心翻译，其他的延迟加载
  const messages = await getCoreMessages(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* 预加载关键资源 */}
        <link rel="preload" href="/assets/images/hero.webp" as="image" />

        {/* DNS 预解析 */}
        <link rel="dns-prefetch" href="//cdn.shopify.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />

        {/* 防止 iOS 自动检测 */}
        <meta
          name="format-detection"
          content="telephone=no, date=no, email=no, address=no"
        />
      </head>
      <body className={cn(fontSans.variable, 'font-sans')} suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* 立即渲染核心布局 */}
          <ConditionalLayout>
            {children}
          </ConditionalLayout>

          {/* 延迟加载非关键提供者 */}
          <Suspense fallback={null}>
            <LazyAuthProvider>
              <LazyAnalyticsProvider>
                <LazyAnimationProvider>
                  <div />
                  {' '}
                  {/* 空容器，仅为提供上下文 */}
                </LazyAnimationProvider>
              </LazyAnalyticsProvider>
            </LazyAuthProvider>
          </Suspense>

          <Toaster />
        </NextIntlClientProvider>

        {/* 延迟加载 JSON-LD */}
        <Suspense fallback={null}>
          <OrganizationJsonLd />
        </Suspense>

        {/* 延迟加载 Speed Insights */}
        <Suspense fallback={null}>
          <SpeedInsights />
        </Suspense>
      </body>
    </html>
  );
}
