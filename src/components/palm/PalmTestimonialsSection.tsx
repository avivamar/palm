'use client';

import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

export function PalmTestimonialsSection() {
  const testimonials = [
    {
      name: 'KH',
      username: '@ria._.panwar',
      date: '09/17/2021',
      content: 'The palm reading was incredibly insightful and provided me the clarity I needed about my relationship situation. It gave me hope that my love life could flourish. The accuracy was amazing! Highly recommended!',
      rating: 5,
      category: 'Love & Relationships',
    },
    {
      name: 'JP',
      username: '@jp63_',
      date: '09/29/2021',
      content: 'Amazing, absolutely amazing! The life guidance I received and nurturing advice about my career path was worth everything! The palm analysis revealed so much about my potential. Truly, thank you!',
      rating: 5,
      category: 'Career Growth',
    },
    {
      name: 'TH',
      username: '@aarmstrong623',
      date: '10/02/2021',
      content: 'The palm reading helps me trust myself and my choices for the future by giving me reassurance with the insights I received. My goals and dreams are going to happen and now I trust myself to pursue them confidently.',
      rating: 5,
      category: 'Personal Growth',
    },
    {
      name: 'MR',
      username: '@maria_wellness',
      date: '10/15/2021',
      content: 'The health insights from my palm analysis were spot-on! It helped me understand my energy patterns and make better lifestyle choices. I feel more in tune with my body now.',
      rating: 5,
      category: 'Health & Wellness',
    },
    {
      name: 'DL',
      username: '@david_entrepreneur',
      date: '10/28/2021',
      content: 'The business and financial guidance from my palm reading was incredible. It revealed my natural talents and the best timing for major decisions. My business has grown significantly since then!',
      rating: 5,
      category: 'Business Success',
    },
    {
      name: 'AS',
      username: '@anna_spiritual',
      date: '11/05/2021',
      content: 'This palm analysis transformed my spiritual journey. The insights about my life purpose and spiritual gifts were profound. I finally understand my path and feel aligned with my true self.',
      rating: 5,
      category: 'Spiritual Growth',
    },
  ];

  const categoryColors = {
    'Love & Relationships': 'from-pink-500 to-rose-500',
    'Career Growth': 'from-blue-500 to-indigo-500',
    'Personal Growth': 'from-purple-500 to-violet-500',
    'Health & Wellness': 'from-green-500 to-emerald-500',
    'Business Success': 'from-orange-500 to-amber-500',
    'Spiritual Growth': 'from-teal-500 to-cyan-500',
  };

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
            Users Love Us
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Life-Changing Palm Readings
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Discover how our palm analysis has transformed lives, providing clarity, guidance, and confidence to thousands of users worldwide.
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
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${categoryColors[testimonial.category as keyof typeof categoryColors]}`}></div>

                {/* Quote Icon */}
                <div className="flex justify-between items-start mb-4">
                  <Quote className="w-6 h-6 text-purple-400 opacity-50" />
                  <Badge
                    variant="outline"
                    className={`text-xs bg-gradient-to-r ${categoryColors[testimonial.category as keyof typeof categoryColors]} text-white border-0`}
                  >
                    {testimonial.category}
                  </Badge>
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
                        {testimonial.username}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {testimonial.date}
                    </p>
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