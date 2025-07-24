import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { headers } from 'next/headers';

import { BlogAdapter } from '@/app/[locale]/(marketing)/blog/lib/blog-adapter';
import BlogShowcase from '@/components/BlogShowcase';
import CTA from '@/components/CTA';
import { ProductJsonLd } from '@/components/JsonLd';
import { PageTransition } from '@/components/PageTransition';
import { ScrollIndicator } from '@/components/ScrollIndicator';
import { ScrollToTop } from '@/components/ScrollToTop';
import { StaticFAQ } from '@/components/StaticFAQ';
import { StaticFeatures } from '@/components/StaticFeatures';
import { OptimizedHero } from '@/components/OptimizedHero';

// Optional: Referral tracking (requires @rolitt/referral package)
const trackReferral = async (searchParams: URLSearchParams) => {
  try {
    // Dynamic import with proper error handling
    const referralModule = await import('@rolitt/referral').catch(() => null);
    if (!referralModule?.ReferralTracker) return;

    const headersList = await headers();

    // Create a mock request object for tracking
    const mockRequest = new Request(`http://localhost:3000?${searchParams.toString()}`, {
      headers: headersList,
    });

    if (referralModule.ReferralTracker.shouldTrack(mockRequest)) {
      const ref = searchParams.get('ref');
      if (ref) {
        await referralModule.ReferralTracker.trackClick(ref, {
          ip: headersList.get('x-forwarded-for') || 'unknown',
          userAgent: headersList.get('user-agent') || 'unknown',
          referer: headersList.get('referer') || '',
          timestamp: new Date(),
        });
      }
    }
  } catch (error) {
    // Gracefully handle if referral package is not available
    console.error('Referral tracking error:', error);
  }
};

// 启用 ISR - 每60秒重新验证页面
export const revalidate = 60;

// 静态生成参数 - 支持的语言
export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'es' },
    { locale: 'ja' },
    { locale: 'zh-HK' },
  ];
}

type IHomeProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: IHomeProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Index',
  });

  // 获取基础URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.rolitt.com';
  // 构建规范链接
  const canonicalUrl = `${baseUrl}/${locale}`;

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    keywords: t('meta_keywords'),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en`,
        'es': `${baseUrl}/es`,
        'ja': `${baseUrl}/ja`,
        'zh-HK': `${baseUrl}/zh-HK`,
      },
    },
    openGraph: {
      title: t('meta_og_title'),
      description: t('meta_og_description'),
      url: canonicalUrl,
      images: [
        {
          url: '/twittercard.webp',
          width: 1200,
          height: 630,
          alt: t('meta_og_image_alt'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta_twitter_title'),
      description: t('meta_twitter_description'),
      images: ['/twittercard.webp'],
    },
  };
}

export default async function Home(props: IHomeProps) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  setRequestLocale(locale);

  // Optional: Track referral if ref parameter exists
  if (searchParams?.ref) {
    const urlSearchParams = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (typeof value === 'string') {
        urlSearchParams.set(key, value);
      }
    });
    await trackReferral(urlSearchParams);
  }

  // 获取特色博客文章
  const featuredPosts = await BlogAdapter.getFeaturedPosts();

  return (
    <>
      <ProductJsonLd />
      <ScrollIndicator />
      <PageTransition>
        <div className="flex flex-col w-full">
          <OptimizedHero />
          <StaticFeatures />
          <BlogShowcase posts={featuredPosts} />
          <StaticFAQ />
          <CTA />
        </div>
      </PageTransition>
      <ScrollToTop />
    </>
  );
}
