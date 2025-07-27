import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { 
  PalmHeroSection,
  PalmHowItWorksSection,
  PalmFeaturesSection,
  PalmPricingSection,
  PalmFAQSection,
  PalmContactSection
} from '@/components/palm';

interface PalmPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PalmPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'palm.meta' });
  
  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      locale: locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
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
      <PalmPricingSection />
      <PalmFAQSection />
      <PalmContactSection />
    </main>
  );
}