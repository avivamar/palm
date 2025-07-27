'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  HelpCircle, 
  Camera, 
  Clock, 
  Shield, 
  RefreshCw, 
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export function PalmFAQSection() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How accurate is AI palm reading?',
      answer: 'Our AI combines traditional palmistry knowledge with modern machine learning, achieving over 85% accuracy in personality trait identification. The system analyzes thousands of palm features and cross-references them with astrological data for comprehensive insights.',
    },
    {
      question: 'What kind of photo should I upload?',
      answer: 'Upload a clear, well-lit photo of your dominant hand palm facing the camera. Ensure all palm lines are visible, avoid shadows, and take the photo in natural light for best results. The image should be at least 1080p resolution.',
    },
    {
      question: 'How long does the analysis take?',
      answer: 'Most readings are completed within 30-60 seconds. Our AI processes your palm image instantly, but generating the comprehensive report with astrological insights may take up to 2 minutes for premium readings.',
    },
    {
      question: 'Is my data secure and private?',
      answer: 'Absolutely. We use end-to-end encryption for all uploads. Your photos are automatically deleted after analysis, and we never store personal images. All data is processed securely and complies with GDPR and privacy regulations.',
    },
    {
      question: 'Can I get multiple readings?',
      answer: 'Yes! Basic and Premium plans allow one reading, but you can purchase additional readings anytime. Lifetime Access includes unlimited re-readings as your life evolves and changes.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, and Google Pay. All transactions are secured with 256-bit SSL encryption.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied with your reading, contact our support team for a full refund, no questions asked.',
    },
    {
      question: 'How is this different from traditional palm reading?',
      answer: 'Our AI combines the wisdom of traditional palmistry with modern technology and astrological insights. You get instant, consistent results without the subjectivity of human interpretation, plus detailed written reports you can reference anytime.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <div className="container mx-auto max-w-4xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            <HelpCircle className="w-3 h-3 mr-1" />
            Got Questions?
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Everything you need to know about Palm AI and how it works.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4 mb-12">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 pr-4">
                    {faq.question}
                  </h3>
                  {openFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  )}
                </button>
                
                <motion.div
                  initial={false}
                  animate={{
                    height: openFAQ === index ? 'auto' : 0,
                    opacity: openFAQ === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-4 gap-6 mb-12"
        >
          {[
            { icon: Camera, label: 'Photos Analyzed', value: '50K+' },
            { icon: Clock, label: 'Avg. Analysis Time', value: '45s' },
            { icon: Shield, label: 'Data Security', value: '100%' },
            { icon: RefreshCw, label: 'Accuracy Rate', value: '98%+' },
          ].map((stat, index) => (
            <Card key={index} className="p-6 text-center bg-white dark:bg-gray-800 shadow-lg">
              <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </p>
            </Card>
          ))}
        </motion.div>

        {/* Still Have Questions CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h3 className="text-xl font-bold mb-4">
              Still Have Questions?
            </h3>
            <p className="mb-6 opacity-90">
              Our support team is here to help you get the most out of your palm reading experience.
            </p>
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Contact Support
            </Button>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}