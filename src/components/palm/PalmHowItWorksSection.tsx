'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Calendar, Brain, Sparkles, FileText, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export function PalmHowItWorksSection() {
  const steps = [
    {
      icon: Upload,
      title: 'Upload a clear photo of your palm',
      description: 'Take a well-lit photo of your dominant hand palm',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      icon: Calendar,
      title: 'Enter your birthday',
      description: 'Provide your birth date for deeper astrological insights',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      icon: Brain,
      title: 'AI scans palm lines, mounts & shapes',
      description: 'Advanced AI analyzes your palm features and patterns',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950',
    },
    {
      icon: Sparkles,
      title: 'Blends palm features with astrological logic',
      description: 'Combines palmistry with astrology and personality science',
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950',
    },
    {
      icon: FileText,
      title: 'Generates your personal insight report',
      description: 'Receive a detailed analysis in seconds',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
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
          <Badge variant="secondary" className="mb-4 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
            <Brain className="w-3 h-3 mr-1" />
            Transparent Process
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            How Palm AI Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our AI-powered system combines ancient palmistry wisdom with modern technology 
            to provide you with accurate, personalized insights.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className={`p-6 h-full ${step.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
                <div className="flex flex-col items-center text-center">
                  {/* Step Number */}
                  <div className="relative mb-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-300 shadow-md">
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
              🚫 We don't store your photos. Everything is encrypted & deleted after analysis.
            </span>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}