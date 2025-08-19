import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { JsonLd } from '@/components/JsonLd';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });

  return {
    title: `${t('title')} | Thepalmistrylife`,
    description: t('description'),
    keywords: 'FAQ, questions, palmistry, palm reading, hand analysis, fortune telling, life lines',
    alternates: {
      canonical: 'https://thepalmistry.life/faq',
    },
    openGraph: {
      title: `${t('title')} | Thepalmistrylife`,
      description: t('description'),
      url: 'https://thepalmistry.life/faq',
      siteName: 'Thepalmistrylife',
      locale: `${locale}_${locale.toUpperCase()}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t('title')} | Thepalmistrylife`,
      description: t('description'),
    },
  };
}

export default function FAQPage() {
  const t = useTranslations('faq');

  // 从翻译文件获取FAQ数据
  const palmistryFaqData = t.raw('questions') as Array<{ question: string; answer: string }>;

  // 转换为 JsonLd 所需的格式
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': palmistryFaqData.map(item => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.answer,
      },
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-8 text-4xl font-bold tracking-tight sm:text-5xl">
            {t('title')}
          </h1>
          <p className="mb-12 text-xl text-muted-foreground">
            {t('description')}
          </p>

          <div className="mb-16">
            <img
              src="/images/faq-illustration.svg"
              alt={t('title')}
              className="mx-auto mb-8 h-64 w-64"
            />
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {palmistryFaqData.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="rounded-lg border">
                <AccordionTrigger className="px-6 py-4 text-left hover:bg-muted/50">
                  <h3 className="text-lg font-semibold">{item.question}</h3>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <p className="text-muted-foreground">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-16 rounded-lg bg-muted/50 p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold">{t('contact.title')}</h2>
            <p className="mb-6 text-muted-foreground">
              {t('contact.description')}
            </p>
            <button className="rounded-lg bg-primary px-6 py-3 text-primary-foreground hover:bg-primary/90">
              {t('contact.button')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
