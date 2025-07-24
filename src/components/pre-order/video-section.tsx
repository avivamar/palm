'use client';

import type { Variants } from 'framer-motion';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { Card, CardContent } from '../ui/card';

export function VideoSection() {
  const t = useTranslations('VideoSection');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const titleVariants: Variants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  const videoVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        delay: 0.2,
      },
    },
  };

  const ctaVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.4,
      },
    },
  };

  return (
    <section className="py-12 md:py-16 bg-background w-full overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          className="mx-auto mb-16 max-w-2xl text-center"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          <motion.div
            className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
            variants={titleVariants}
          >
            {t('badge')}
          </motion.div>
          <motion.h2
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            variants={titleVariants}
          >
            {t('title')}
          </motion.h2>
          <motion.p
            className="mt-4 text-lg text-muted-foreground"
            variants={titleVariants}
          >
            {t('description')}
          </motion.p>
        </motion.div>

        <motion.div
          className="mx-auto max-w-4xl"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={videoVariants}
        >
          <Card className="border-none shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-video">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/PLgdA3y5GAw"
                  title="Rolitt AI Companion Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                >
                </iframe>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="mt-12 text-center"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={ctaVariants}
        >
          <p className="text-sm text-muted-foreground">
            {t('youtube_link_text')}
            {' '}
            <a
              href="https://youtube.com/@rolitt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {t('youtube_channel')}
            </a>
            {' '}
            {t('youtube_link_suffix')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
