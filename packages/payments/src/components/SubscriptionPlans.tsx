/**
 * Subscription Plans Component - Independent UI for testing subscription functionality
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

'use client';

import type { SupportedLocale } from '../features/subscription/SubscriptionPricingData';
import React, { useState } from 'react';
import { getAllLocalizedPlans } from '../features/subscription/SubscriptionPricingData';

export type SubscriptionPlansProps = {
  locale?: SupportedLocale;
  onSubscribe?: (planData: {
    planId: string;
    priceId: string;
    interval: 'monthly' | 'yearly';
    email: string;
  }) => void;
  className?: string;
};

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  locale = 'en',
  onSubscribe,
  className = '',
}) => {
  const [selectedInterval, setSelectedInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const plans = getAllLocalizedPlans(locale);

  const handleSubscribe = async (planId: string, interval: 'monthly' | 'yearly') => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    if (!onSubscribe) {
      console.warn('Subscription handler not configured');
      return;
    }

    setIsLoading(true);

    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      const selectedPlan = interval === 'monthly' ? plan.monthly : plan.yearly;

      await onSubscribe({
        planId,
        priceId: selectedPlan.stripePriceId,
        interval,
        email,
      });
    } catch (error) {
      console.error('Subscription error:', error);
      console.warn('Failed to start subscription process');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`subscription-plans ${className}`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-muted-foreground">
            Select the perfect subscription plan for your AI companion experience
          </p>
        </div>

        {/* Email Input */}
        <div className="max-w-md mx-auto mb-8">
          <label className="block text-sm font-medium text-foreground mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
            required
          />
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-8">
          <div className="bg-muted rounded-lg p-1 flex">
            <button
              onClick={() => setSelectedInterval('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedInterval === 'monthly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedInterval('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedInterval === 'yearly'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const selectedPlan = selectedInterval === 'monthly' ? plan.monthly : plan.yearly;
            const isPopular = selectedPlan.popular;

            return (
              <div
                key={plan.id}
                className={`relative bg-card rounded-2xl shadow-xl border-2 transition-all duration-200 hover:shadow-2xl ${
                  isPopular
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-card-foreground mb-2">
                      {selectedPlan.name}
                    </h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-card-foreground">
                        $
                        {selectedPlan.amount}
                      </span>
                      <span className="text-muted-foreground">
                        /
                        {selectedPlan.interval}
                      </span>
                    </div>
                    {plan.savings && selectedInterval === 'yearly' && (
                      <div className="text-sm text-green-600 font-medium">
                        Save
                        {' '}
                        {plan.savings}
                        % vs monthly
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-card-foreground mb-3">
                      Features included:
                    </h4>
                    <ul className="space-y-2">
                      {selectedPlan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg
                            className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-muted-foreground">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Limitations */}
                    {selectedPlan.limitations && selectedPlan.limitations.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-muted-foreground mb-2">
                          Limitations:
                        </h5>
                        <ul className="space-y-1">
                          {selectedPlan.limitations.map((limitation, index) => (
                            <li key={index} className="flex items-start">
                              <svg
                                className="w-4 h-4 text-muted-foreground mt-0.5 mr-2 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span className="text-sm text-muted-foreground">
                                {limitation}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Subscribe Button */}
                  <button
                    onClick={() => handleSubscribe(plan.id, selectedInterval)}
                    disabled={isLoading || !email}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                      isPopular
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                        : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoading ? 'Processing...' : 'Subscribe Now'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            All plans include 24/7 support and a 30-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
}; ;
