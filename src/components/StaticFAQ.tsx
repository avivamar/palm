'use client';

import { useTranslations } from 'next-intl';
import {
  StaticAccordion,
  StaticAccordionContent,
  StaticAccordionItem,
  StaticAccordionTrigger,
} from '@/components/ui/static-accordion';

export function StaticFAQ() {
  const t = useTranslations('FAQ');

  const faqs = [
    {
      question: t('question_1'),
      answer: t('answer_1'),
    },
    {
      question: t('question_2'),
      answer: t('answer_2'),
    },
    {
      question: t('question_3'),
      answer: t('answer_3'),
    },
    {
      question: t('question_4'),
      answer: t('answer_4'),
    },
    {
      question: t('question_5'),
      answer: t('answer_5'),
    },
    {
      question: t('question_6'),
      answer: t('answer_6'),
    },
  ];

  return (
    <section className="py-20 md:py-32 w-full">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <div className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            {t('title')}
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t('subtitle')}
          </h2>
        </div>

        <div className="mx-auto max-w-4xl">
          <StaticAccordion className="w-full">
            {faqs.map((faq, index) => (
              <StaticAccordionItem key={index} value={`item-${index}`}>
                <StaticAccordionTrigger className="text-lg font-medium">
                  {faq.question}
                </StaticAccordionTrigger>
                <StaticAccordionContent className="text-muted-foreground">
                  {faq.answer}
                </StaticAccordionContent>
              </StaticAccordionItem>
            ))}
          </StaticAccordion>
        </div>
      </div>
    </section>
  );
}
