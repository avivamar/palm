'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Camera, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { PalmAnalysisForm } from './PalmAnalysisForm';

export function PalmHeroSection() {
  const [isHovered, setIsHovered] = useState(false);
  const [showAnalysisForm, setShowAnalysisForm] = useState(false);
  const t = useTranslations('palm.hero');

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden palm-page-bg">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-indigo-600/10" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-purple-400/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-xl animate-pulse delay-1000" />
      
      <div className="palm-container relative z-10">
        {!showAnalysisForm ? (
          <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" suppressHydrationWarning>
                <Sparkles className="w-3 h-3 mr-1" />
                {t('badge')}
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-tight"
              suppressHydrationWarning
            >
              {t('titleBefore')}
              <motion.span 
                className="relative inline-block bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent font-extrabold"
                initial={{ scale: 1 }}
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {t('highlight')}
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full shadow-lg"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                />
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-lg blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.span>
              {t('titleAfter')}
            </motion.h1>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 space-y-2"
            >
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <Camera className="w-5 h-5 text-purple-500" />
                <span>{t('subtitle.upload')}</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span>{t('subtitle.birth')}</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <Zap className="w-5 h-5 text-indigo-500" />
                <span>{t('subtitle.report')}</span>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <Button
                size="lg"
                className="palm-btn palm-btn-primary palm-btn-lg"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => setShowAnalysisForm(true)}
              >
                <Upload className={`w-5 h-5 mr-2 transition-transform duration-300 ${isHovered ? 'scale-110' : ''}`} />
                {t('cta')}
                <motion.span
                  className="ml-2"
                  animate={{ x: isHovered ? 5 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  🔥
                </motion.span>
              </Button>
              
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('privacy')}
              </p>
            </motion.div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <Card className="p-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-0 shadow-2xl">
              <div className="relative">
                {/* Palm Image Placeholder */}
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-2xl flex items-center justify-center mb-6 overflow-hidden">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, -2, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-6xl"
                  >
                    🖐️
                  </motion.div>
                </div>
                
                {/* AI Analysis Visualization */}
                <div className="space-y-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    transition={{ delay: 1, duration: 1 }}
                    className="h-2 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    transition={{ delay: 1.2, duration: 1 }}
                    className="h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '90%' }}
                    transition={{ delay: 1.4, duration: 1 }}
                    className="h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
                  />
                </div>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4"
                >
                  {t('analyzing')}
                </motion.p>
              </div>
            </Card>
          </motion.div>
          </div>
        ) : (
          // 分析表单
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-8">
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-4xl font-bold mb-4 palm-fade-in"
              >
                {t('start_analysis')}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-600 dark:text-gray-300"
              >
                {t('analysis_subtitle')}
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="palm-card p-8"
            >
              <PalmAnalysisForm 
                onBack={() => setShowAnalysisForm(false)}
                embedded={true}
              />
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}