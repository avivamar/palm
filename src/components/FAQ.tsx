'use client';

import { useTranslations } from 'next-intl';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FadeIn, ScrollReveal, TextReveal } from './animations';

export function FAQ() {
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
        <ScrollReveal className="mx-auto mb-16 max-w-2xl text-center">
          <FadeIn
            className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
            delay={0.1}
          >
            {t('title')}
          </FadeIn>
          <TextReveal
            as="h2"
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            delay={0.2}
          >
            {t('subtitle')}
          </TextReveal>
        </ScrollReveal>

        <FadeIn
          className="mx-auto max-w-4xl"
          delay={0.3}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <FadeIn
                key={index}
                delay={0.4 + index * 0.1}
                direction="left"
              >
                <AccordionItem value={`item-${index}`}>
                  <AccordionTrigger className="text-lg font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </FadeIn>
            ))}
          </Accordion>
        </FadeIn>
      </div>
    </section>
  );
}
