import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ISolutionProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ISolutionProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Solution' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    openGraph: {
      title: t('meta_title'),
      description: t('meta_description'),
      images: [
        {
          url: '/solution.svg',
          width: 1200,
          height: 630,
          alt: t('title'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta_title'),
      description: t('meta_description'),
      images: ['/solution.svg'],
    },
  };
}

export default async function Solution(props: ISolutionProps) {
  const { locale } = await props.params;

  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'Solution' });

  const solutions = [
    {
      title: t('solution1_title'),
      description: t('solution1_description'),
      icon: '🏭',
    },
    {
      title: t('solution2_title'),
      description: t('solution2_description'),
      icon: '🏥',
    },
    {
      title: t('solution3_title'),
      description: t('solution3_description'),
      icon: '🎓',
    },
    {
      title: t('solution4_title'),
      description: t('solution4_description'),
      icon: '🏠',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          {t('subtitle')}
        </p>
      </div>

      <div className="mx-auto mt-16 max-w-7xl">
        <div className="mb-16 flex justify-center">
          <Image
            src="/solution.svg"
            alt={t('title')}
            width={600}
            height={400}
            className="rounded-lg shadow-xl"
          />
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {solutions.map((solution, index) => (
            <Card key={index} className="border-none shadow-md transition-all hover:shadow-lg hover:-translate-y-1 duration-300">
              <CardHeader>
                <div className="mb-4 text-4xl">{solution.icon}</div>
                <CardTitle>{solution.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{solution.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
