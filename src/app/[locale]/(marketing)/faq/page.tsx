import type { Metadata } from 'next';
import type { Language, LocalizedContent } from '@/types/i18n';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { FaqJsonLd } from '@/components/JsonLd';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { faqData } from '@/data/faq';

type IFAQProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: IFAQProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'FAQ',
  });

  // 获取基础URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.rolitt.com';
  // 构建规范链接
  const canonicalUrl = `${baseUrl}/${locale}/faq`;

  return {
    title: t('meta_title'),
    description: t('meta_description'),
    keywords: t('meta_keywords'),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'en': `${baseUrl}/en/faq`,
        'es': `${baseUrl}/es/faq`,
        'ja': `${baseUrl}/ja/faq`,
        'zh-HK': `${baseUrl}/zh-HK/faq`,
      },
    },
    openGraph: {
      title: t('meta_og_title'),
      description: t('meta_og_description'),
      url: canonicalUrl,
      images: [
        {
          url: '/faq.png',
          width: 1200,
          height: 630,
          alt: t('meta_title'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('meta_twitter_title'),
      description: t('meta_twitter_description'),
      images: ['/faq.png'],
    },
  };
}

export default async function FAQ(props: IFAQProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({
    locale,
    namespace: 'FAQ',
  });

  // 获取当前语言的 FAQ 数据
  const currentFaqData = faqData[locale as Language] || faqData.en;

  // 转换为 JsonLd 所需的格式
  const questions = currentFaqData.map(item => ({
    question: {
      'en': item.question,
      'es': faqData.es?.find(q => q.keywords === item.keywords)?.question || item.question,
      'ja': faqData.ja?.find(q => q.keywords === item.keywords)?.question || item.question,
      'zh-HK': faqData['zh-HK']?.find(q => q.keywords === item.keywords)?.question || item.question,

    } as LocalizedContent,
    answer: {
      'en': item.answer,
      'es': faqData.es?.find(q => q.keywords === item.keywords)?.answer || item.answer,
      'ja': faqData.ja?.find(q => q.keywords === item.keywords)?.answer || item.answer,
      'zh-HK': faqData['zh-HK']?.find(q => q.keywords === item.keywords)?.answer || item.answer,

    } as LocalizedContent,
    keywords: item.keywords,
  }));

  return (
    <>
      <FaqJsonLd questions={questions} lang={locale as Language} />
      <div className="container py-12 md:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              {t('title')}
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>

          <div className="mb-16 flex justify-center">
            <Image
              src="/faq-illustration.svg"
              alt={t('title')}
              width={600}
              height={400}
              className="rounded-lg"
            />
          </div>

          <Card>
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {currentFaqData.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left text-lg font-medium">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <div className="mt-16 text-center">
            <p className="mb-4 text-lg text-muted-foreground">
              {t('still_have_questions')}
            </p>
            <Card className="bg-primary/10 border-none p-6">
              <CardContent className="p-0">
                <p className="mb-0 text-lg font-medium">{t('contact_us_text')}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
