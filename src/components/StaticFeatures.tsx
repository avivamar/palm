'use client';

import type { Variants } from 'framer-motion';
import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { useAnimation } from './AnimationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function StaticFeatures() {
  const t = useTranslations('Features');
  const ref = useRef(null);
  const { prefersReducedMotion } = useAnimation();
  const isInView = useInView(ref, { once: true, amount: 0.2, margin: '50px' });

  const features = [
    {
      title: t('feature1_title'),
      description: t('feature1_description'),
      icon: '💖',
      mainSpec: t('feature1_main_spec'),
      detailSpecs: [t('feature1_detail_spec1'), t('feature1_detail_spec2')],
    },
    {
      title: t('feature2_title'),
      description: t('feature2_description'),
      icon: '🎉',
      mainSpec: t('feature2_main_spec'),
      detailSpecs: [t('feature2_detail_spec1'), t('feature2_detail_spec2')],
    },
    {
      title: t('feature3_title'),
      description: t('feature3_description'),
      icon: '🌍',
      mainSpec: t('feature3_main_spec'),
      detailSpecs: [t('feature3_detail_spec1'), t('feature3_detail_spec2')],
    },
    {
      title: t('feature4_title'),
      description: t('feature4_description'),
      icon: '🧠',
      mainSpec: t('feature4_main_spec'),
      detailSpecs: [t('feature4_detail_spec1'), t('feature4_detail_spec2')],
    },
    {
      title: t('feature5_title'),
      description: t('feature5_description'),
      icon: '🌈',
      mainSpec: t('feature5_main_spec'),
      detailSpecs: [t('feature5_detail_spec1'), t('feature5_detail_spec2')],
    },
    {
      title: t('feature6_title'),
      description: t('feature6_description'),
      icon: '🤗',
      mainSpec: t('feature6_main_spec'),
      detailSpecs: [t('feature6_detail_spec1'), t('feature6_detail_spec2')],
    },
  ];

  // 动画配置 - 根据用户偏好调整
  const containerVariants = {
    hidden: { opacity: prefersReducedMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: prefersReducedMotion
        ? {}
        : {
            staggerChildren: 0.1,
            delayChildren: 0.2,
          },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: prefersReducedMotion ? 1 : 0,
      y: prefersReducedMotion ? 0 : 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: prefersReducedMotion
        ? {}
        : {
            duration: 0.6,
            ease: 'easeOut',
          },
    },
  };

  const titleVariants: Variants = {
    hidden: {
      opacity: prefersReducedMotion ? 1 : 0,
      y: prefersReducedMotion ? 0 : 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: prefersReducedMotion
        ? {}
        : {
            duration: 0.8,
            ease: 'easeOut',
          },
    },
  };

  return (
    <section className="py-20 md:py-32 bg-muted/50 w-full overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          className="mx-auto mb-16 max-w-2xl text-center"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          <motion.div
            className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
            variants={itemVariants}
          >
            {t('section_subtitle')}
          </motion.div>
          <motion.h2
            className="text-3xl font-bold tracking-tight sm:text-4xl"
            variants={titleVariants}
          >
            {t('section_title')}
          </motion.h2>
          <motion.p
            className="mt-4 text-lg text-muted-foreground"
            variants={itemVariants}
          >
            {t('section_description')}
          </motion.p>
        </motion.div>

        <motion.div
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="h-full"
              variants={itemVariants}
              whileHover={prefersReducedMotion
                ? {}
                : {
                    scale: 1.03,
                    transition: { duration: 0.2 },
                  }}
            >
              <Card className="border-none shadow-md h-full group">
                <CardHeader>
                  <motion.div
                    className="mb-4 text-4xl"
                    initial={{ scale: 1 }}
                    whileHover={{
                      scale: 1.2,
                      rotate: [0, 10, -10, 0],
                      transition: {
                        duration: 0.5,
                        ease: 'easeInOut',
                        times: [0, 0.2, 0.5, 0.8, 1],
                      },
                    }}
                  >
                    {feature.icon}
                  </motion.div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base group-hover:text-foreground group-hover:font-medium transition-all duration-300">
                    {feature.description}
                  </CardDescription>
                  <ul className="text-sm text-gray-600 mt-4 list-disc pl-5 space-y-1">
                    <li><strong>{feature.mainSpec}</strong></li>
                    {feature.detailSpecs.map((spec, specIndex) => (
                      <li key={specIndex}>{spec}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
