'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Zap, Crown, Infinity, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function PalmPricingSection() {
  const plans = [
    {
      name: 'Basic Reading',
      price: '$9.99',
      description: 'Perfect for first-time users',
      features: [
        'Complete palm analysis',
        'Personality insights',
        'Basic compatibility check',
        'Health indicators',
        'PDF report download',
      ],
      icon: Zap,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      popular: false,
    },
    {
      name: 'Premium Reading',
      price: '$19.99',
      description: 'Most comprehensive analysis',
      features: [
        'Everything in Basic',
        'Detailed astrological insights',
        'Career & relationship guidance',
        'Monthly forecasts',
        'Compatibility with others',
        'Priority support',
      ],
      icon: Crown,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
      popular: true,
    },
    {
      name: 'Lifetime Access',
      price: '$49.99',
      description: 'One-time payment, lifetime value',
      features: [
        'Everything in Premium',
        'Unlimited re-readings',
        'Future updates included',
        'Advanced AI features',
        'Personal consultation call',
        'Exclusive community access',
      ],
      icon: Infinity,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950',
      popular: false,
    },
  ];

  return (
    <section className="py-20 px-4 bg-white dark:bg-gray-900">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            <Crown className="w-3 h-3 mr-1" />
            Simple Pricing
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Choose Your Reading
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get instant insights into your life with our AI-powered palm reading. 
            No subscriptions, just one-time payments for lasting value.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-1 shadow-lg">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <Card className={`p-8 h-full ${plan.bgColor} border-2 ${plan.popular ? 'border-purple-200 dark:border-purple-800 shadow-xl scale-105' : 'border-gray-200 dark:border-gray-700 shadow-lg'} hover:shadow-xl transition-all duration-300`}>
                {/* Header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center shadow-lg`}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {plan.description}
                  </p>
                  
                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-800 dark:text-gray-200">
                      {plan.price}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                      one-time
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button 
                  className={`w-full ${plan.popular 
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800' 
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
                  } text-white shadow-lg hover:shadow-xl transition-all duration-300 group`}
                  size="lg"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="inline-flex items-center gap-3 px-6 py-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-green-800 dark:text-green-200">
                30-Day Money Back Guarantee
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                Not satisfied? Get a full refund, no questions asked.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}