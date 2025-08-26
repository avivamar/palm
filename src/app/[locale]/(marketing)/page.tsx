import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import {
  PalmFAQSection,
  PalmFeaturesSection,
  PalmHeroSection,
  PalmHowItWorksSection,
  PalmTestimonialsSection,
} from '@/components/palm';

type PalmPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export async function generateMetadata({ params }: PalmPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'palmindex' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    keywords: t('meta.keywords'),
    openGraph: {
      title: t('meta.title'),
      description: t('meta.description'),
      type: 'website',
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta.title'),
      description: t('meta.description'),
    },
  };
}

export default async function PalmPage({ params }: PalmPageProps) {
  const { locale: _locale } = await params;

  return (
    <main className="min-h-screen">
      <PalmHeroSection />
      <PalmHowItWorksSection />
      <PalmFeaturesSection />
      <PalmTestimonialsSection />
      <PalmFAQSection />
    </main>
  );
}