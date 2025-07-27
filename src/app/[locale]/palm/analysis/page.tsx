import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PalmAnalysisClient } from './client';

interface AnalysisPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: AnalysisPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'palm.form' });
  
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function PalmAnalysisPage({ params }: AnalysisPageProps) {
  const { locale } = await params;
  
  return <PalmAnalysisClient locale={locale} />;
}