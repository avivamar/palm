'use client';

import { motion } from 'framer-motion';
import { Brain, Calendar, FileText, Shield, Sparkles, Upload, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Badge as BadgeComponent } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export function PalmHowItWorksSection() {
  const t = useTranslations('palmindex');

  const steps = [
    {
      icon: Upload,
      title: t('howItWorks.steps.0.title'),
      description: t('howItWorks.steps.0.description'),
      color: 'from-purple-500 via-purple-600 to-indigo-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950',
      glowColor: 'shadow-purple-500/20',
    },
    {
      icon: Calendar,
      title: t('howItWorks.steps.1.title'),
      description: t('howItWorks.steps.1.description'),
      color: 'from-blue-500 via-blue-600 to-cyan-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950',
      glowColor: 'shadow-blue-500/20',
    },
    {
      icon: Brain,
      title: t('howItWorks.steps.2.title'),
      description: t('howItWorks.steps.2.description'),
      color: 'from-indigo-500 via-indigo-600 to-purple-600',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950',
      glowColor: 'shadow-indigo-500/20',
    },
    {
      icon: Sparkles,
      title: t('howItWorks.steps.3.title'),
      description: t('howItWorks.steps.3.description'),
      color: 'from-cyan-500 via-cyan-600 to-teal-600',
      bgColor: 'bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950 dark:to-teal-950',
      glowColor: 'shadow-cyan-500/20',
    },
    {
      icon: Zap,
      title: t('howItWorks.steps.4.title'),
      description: t('howItWorks.steps.4.description'),
      color: 'from-yellow-500 via-orange-500 to-red-500',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950',
      glowColor: 'shadow-yellow-500/20',
    },
    {
      icon: FileText,
      title: t('howItWorks.steps.5.title'),
      description: t('howItWorks.steps.5.description'),
      color: 'from-emerald-500 via-green-600 to-teal-600',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950',
      glowColor: 'shadow-emerald-500/20',
    },
  ];

  return (
    <section className="py-20 px-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <BadgeComponent variant="secondary" className="mb-4 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 dark:from-purple-900 dark:to-indigo-900 dark:text-purple-300 border-0 shadow-lg">
            <Brain className="w-3 h-3 mr-1" />
            {t('howItWorks.title')}
          </BadgeComponent>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {t('howItWorks.subtitle')}
          </h2>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className={`p-6 h-full ${step.bgColor} border-0 shadow-xl hover:shadow-2xl ${step.glowColor} transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 backdrop-blur-sm`}>
                <div className="flex flex-col items-center text-center">
                  {/* Step Number */}
                  <div className="relative mb-6">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center shadow-2xl ${step.glowColor} transform rotate-3 hover:rotate-0 transition-transform duration-300`}>
                      <step.icon className="w-10 h-10 text-white drop-shadow-lg" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-white to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-300 shadow-lg border-2 border-white dark:border-gray-600">
                      {index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Privacy Assurance */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="inline-flex items-center gap-3 px-6 py-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-green-800 dark:text-green-200 font-medium">
              🚫 {t('howItWorks.privacy.description')}
            </span>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}