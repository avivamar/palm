'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

type TabType = 'shipping' | 'refund' | 'perks';

export function FaqSection() {
  const t = useTranslations('preOrder');
  const [activeTab, setActiveTab] = useState<TabType>('shipping');

  const tabs: { key: TabType; label: string }[] = [
    { key: 'shipping', label: t('faq.tabs.shipping') },
    { key: 'refund', label: t('faq.tabs.refund') },
    { key: 'perks', label: t('faq.tabs.perks') },
  ];

  const getFaqsByTab = (tab: TabType) => {
    const basePath = `faq.faqs.${tab}`;
    const faqCount = tab === 'shipping' ? 2 : tab === 'refund' ? 2 : 2;

    return Array.from({ length: faqCount }, (_, index) => ({
      question: t(`${basePath}.${index}.question`),
      answer: t(`${basePath}.${index}.answer`),
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <section className="bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t('faq.title')}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t('faq.description')}
            </p>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center mb-8 space-y-2 sm:space-y-0 sm:space-x-2"
          >
            {tabs.map(tab => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.key)}
                className="w-full sm:w-auto px-6 py-3 text-sm font-medium transition-all duration-200 hover:scale-105"
              >
                {tab.label}
              </Button>
            ))}
          </motion.div>

          {/* FAQ Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-4"
            >
              {getFaqsByTab(activeTab).map((faq, index) => (
                <motion.div key={`${activeTab}-${index}`} variants={itemVariants}>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem
                      value={`${activeTab}-${index}`}
                      className="border border-border rounded-lg px-6 py-2 bg-card hover:bg-accent/50 transition-colors duration-200"
                    >
                      <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pt-2 pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
