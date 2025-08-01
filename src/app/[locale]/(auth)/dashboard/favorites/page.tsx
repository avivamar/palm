import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FavoritesContent } from '@/components/dashboard/FavoritesContent';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'Dashboard',
  });

  return {
    title: `Favorites - ${t('meta_title')}`,
  };
}

export default async function FavoritesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container mx-auto px-4 py-8">
      <FavoritesContent />
    </div>
  );
}
