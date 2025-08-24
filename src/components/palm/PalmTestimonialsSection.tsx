'use client';

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useTranslations } from 'next-intl';

export function PalmTestimonialsSection() {
  const t = useTranslations('palmindex.testimonials');
  
  const testimonials = t.raw('reviews') as Array<{
    name: string;
    role: string;
    content: string;
    rating: number;
  }>;


  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-900 dark:to-purple-950">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
            <Star className="w-3 h-3 mr-1" />
            {t('title')}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t('subtitle')}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t('cta')}
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="h-full"
            >
              <Card className="p-6 h-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 border-0 relative overflow-hidden group">
                {/* Background Gradient */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>

                {/* Quote Icon */}
                <div className="flex justify-between items-start mb-4">
                  <Quote className="w-6 h-6 text-purple-400 opacity-50" />
                </div>

                {/* Stars */}
                <div className="flex mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-sm italic">
                  "
                  {testimonial.content}
                  "
                </p>

                {/* Author Info */}
                <div className="mt-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-purple-600 dark:text-purple-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
        >
          <div className="p-4">
            <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              50K+
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Happy Users
            </p>
          </div>
          <div className="p-4">
            <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              98%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Accuracy Rate
            </p>
          </div>
          <div className="p-4">
            <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              4.9★
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Average Rating
            </p>
          </div>
          <div className="p-4">
            <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              24/7
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Support Available
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}