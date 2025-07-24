import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';

// Updated interface to match the PageProps constraint
type IAboutProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: IAboutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'About' });

  // 获取基础URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.rolitt.com';
  // 构建规范链接
  const canonicalUrl = `${baseUrl}/${locale}/about`;

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en/about`,
        'zh-HK': `${baseUrl}/zh-HK/about`,
        'ja': `${baseUrl}/ja/about`,
        'es': `${baseUrl}/es/about`,
      },
    },
    openGraph: {
      title: t('meta_title'),
      description: t('meta_description'),
      url: canonicalUrl,
      images: [
        {
          url: '/images/og-image.jpg',
          alt: t('meta_og_image_alt'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta_title'),
      description: t('meta_description'),
      images: [
        {
          url: '/images/og-image.jpg',
          alt: t('meta_og_image_alt'),
        },
      ],
    },
  };
}

export default async function About(props: IAboutProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'About' });

  return (
    <div className="container mx-auto px-4 py-16">
      {/* Hero Section with Background */}
      <div className="relative overflow-hidden rounded-2xl mb-20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/20 blur-3xl opacity-70"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-primary/20 blur-3xl opacity-70"></div>

        <div className="relative z-10 text-center py-20 px-4">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            {t('title')}
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="mb-24 scroll-m-20" id="mission">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold">{t('mission_title')}</h2>
          </div>
          <div className="pl-16">
            <p className="text-lg leading-relaxed mb-6 text-muted-foreground">{t('mission_description')}</p>
            <div className="w-full h-1 bg-gradient-to-r from-primary/50 to-transparent rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="mb-24 scroll-m-20" id="story">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m2 12 5-3 2 6 5-5 2 4 6-4" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold">{t('story_title')}</h2>
          </div>
          <div className="pl-16">
            <p className="text-lg leading-relaxed mb-6 text-muted-foreground">{t('story_description')}</p>
            <div className="w-full h-1 bg-gradient-to-r from-primary/50 to-transparent rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="mb-24 scroll-m-20" id="approach">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                <path d="M12 2v2" />
                <path d="M12 22v-2" />
                <path d="m17 20.66-1-1.73" />
                <path d="M11 10.27 7 3.34" />
                <path d="m20.66 17-1.73-1" />
                <path d="m3.34 7 1.73 1" />
                <path d="M14 12h8" />
                <path d="M2 12h2" />
                <path d="m20.66 7-1.73 1" />
                <path d="m3.34 17 1.73-1" />
                <path d="m17 3.34-1 1.73" />
                <path d="m11 13.73-4 6.93" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold">{t('approach_title')}</h2>
          </div>
          <div className="pl-16">
            <p className="text-lg leading-relaxed mb-6 text-muted-foreground">{t('approach_description')}</p>
            <p className="text-lg leading-relaxed mb-6 text-muted-foreground">{t('approach_description2')}</p>
            <div className="w-full h-1 bg-gradient-to-r from-primary/50 to-transparent rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="mb-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">Our Core Values</span>
            <h2 className="text-3xl font-bold">What Drives Us</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-xl p-8 shadow-sm border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M12 22v-5" />
                  <path d="M9 8V2" />
                  <path d="M15 8V2" />
                  <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('value1_title')}</h3>
              <p className="text-muted-foreground">{t('value1_description')}</p>
            </div>

            <div className="bg-card rounded-xl p-8 shadow-sm border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('value2_title')}</h3>
              <p className="text-muted-foreground">{t('value2_description')}</p>
            </div>

            <div className="bg-card rounded-xl p-8 shadow-sm border border-border hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M2 12h20" />
                  <path d="M12 2v20" />
                  <path d="m4.93 4.93 14.14 14.14" />
                  <path d="m19.07 4.93-14.14 14.14" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('value3_title')}</h3>
              <p className="text-muted-foreground">{t('value3_description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-4xl mx-auto text-center">
        <div className="bg-primary/10 rounded-2xl p-12 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/20 blur-2xl opacity-70"></div>
          <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-primary/20 blur-2xl opacity-70"></div>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Join Us on Our Journey</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-muted-foreground">
              Discover how Rolitt is redefining the relationship between humans and technology.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
