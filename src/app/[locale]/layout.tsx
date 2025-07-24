import type { Metadata, Viewport } from 'next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import React from 'react';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { AnimationProvider } from '@/components/AnimationContext';
import { ConditionalLayout } from '@/components/ConditionalLayout';
import { OrganizationJsonLd } from '@/components/JsonLd';

import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
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

async function getLocalMessages(locale: string) {
  try {
    // 加载拆分的多语言文件
    return {
      ...(await import(`@/locales/${locale}/business.json`)).default,
      dashboard: (await import(`@/locales/${locale}/dashboard.json`)).default,
      ...(await import(`@/locales/${locale}/commerce.json`)).default,
      ...(await import(`@/locales/${locale}/core.json`)).default,
      ...(await import(`@/locales/${locale}/legal.json`)).default,
      ...(await import(`@/locales/${locale}/pages.json`)).default,
      ...(await import(`@/locales/${locale}/user.json`)).default,
      admin: (await import(`@/locales/${locale}/admin.json`)).default,
      ...(await import(`@/locales/${locale}/unauthorized.json`)).default,
      ...(await import(`@/locales/${locale}/validation.json`)).default,
    };
  } catch {
    notFound();
  }
}

export async function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function RootLayout({
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

  const messages = await getLocalMessages(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* 预加载关键资源 */}
        <link rel="preload" href="/assets/images/hero.webp" as="image" />

        {/* DNS 预解析 */}
        <link rel="dns-prefetch" href="//cdn.shopify.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        {/* Prevent iOS auto-detection that can cause hydration mismatches */}
        <meta
          name="format-detection"
          content="telephone=no, date=no, email=no, address=no"
        />
      </head>
      <body className={cn(fontSans.variable, 'font-sans')} suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <AnalyticsProvider>
              <AnimationProvider>
                <ConditionalLayout>{children}</ConditionalLayout>
                <Toaster />
              </AnimationProvider>
            </AnalyticsProvider>
          </AuthProvider>
        </NextIntlClientProvider>
        <OrganizationJsonLd />
        <SpeedInsights />
      </body>
    </html>
  );
}
