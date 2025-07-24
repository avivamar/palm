import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import DashboardContentOptimized from '@/components/dashboard/DashboardContentOptimized';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Dashboard',
  });

  return {
    title: `${t('meta_title')} - Rolitt`,
  };
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardContentOptimized />
    </div>
  );
}

// 添加静态参数生成
export async function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'zh' },
    { locale: 'ja' },
    { locale: 'ko' },
    { locale: 'es' },
    { locale: 'fr' },
    { locale: 'de' },
    { locale: 'it' },
    { locale: 'pt' },
    { locale: 'ru' },
    { locale: 'ar' },
    { locale: 'hi' },
    { locale: 'th' },
    { locale: 'vi' },
    { locale: 'id' },
    { locale: 'ms' },
    { locale: 'tl' },
  ];
}
