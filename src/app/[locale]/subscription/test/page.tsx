/**
 * Subscription Test Page - Independent test page for subscription functionality
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

'use client';

import type { SupportedLocale } from '@rolitt/payments';

import { SubscriptionManager, SubscriptionPlans } from '@rolitt/payments';
import React, { use, useState } from 'react';
import {
  cancelSubscription,
  createSubscriptionCheckout,
  getCustomerSubscriptions,
  reactivateSubscription,
} from '@/app/actions/subscriptionActions';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default function SubscriptionTestPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const locale = (resolvedParams?.locale as SupportedLocale) || 'en';
  const [testEmail, setTestEmail] = useState('');
  const [showManager, setShowManager] = useState(false);

  const handleSubscribe = async (planData: {
    planId: string;
    priceId: string;
    interval: 'monthly' | 'yearly';
    email: string;
  }) => {
    try {
      console.warn('Starting subscription checkout:', planData);

      // Create form data for server action
      const formData = new FormData();
      formData.append('email', planData.email);
      formData.append('priceId', planData.priceId);
      formData.append('locale', locale);
      formData.append('planId', planData.planId);
      formData.append('interval', planData.interval);

      // Optional: Add trial period for testing
      // formData.append('trialPeriodDays', '7');

      // Call server action
      await createSubscriptionCheckout(formData);
    } catch (error) {
      console.error('Subscription error:', error);
      console.warn(`Failed to start subscription process: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleGetSubscriptions = async (email: string) => {
    return await getCustomerSubscriptions(email);
  };

  const handleCancelSubscription = async (subscriptionId: string, immediately?: boolean) => {
    console.warn('Canceling subscription:', subscriptionId);
    return await cancelSubscription(subscriptionId, immediately);
  };

  const handleReactivateSubscription = async (subscriptionId: string) => {
    return await reactivateSubscription(subscriptionId);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Subscription Test Page (
            {locale}
            )
          </h1>

          {/* Test Email Input */}
          <div className="mb-8 p-4 bg-card border border-border rounded-lg">
            <h2 className="text-xl font-semibold text-card-foreground mb-4">
              Test Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="test-email" className="block text-sm font-medium text-card-foreground mb-2">
                  Test Email Address
                </label>
                <input
                  id="test-email"
                  type="email"
                  value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Enter test email address"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showManager}
                    onChange={e => setShowManager(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-card-foreground">Show Subscription Manager</span>
                </label>
              </div>
            </div>
          </div>
          <p className="text-lg text-muted-foreground mb-6">
            Test the subscription functionality independently from the main business flow
          </p>

          {/* Locale Badge */}
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
            Current Locale:
            {' '}
            {locale}
          </span>
        </div>

        {/* Toggle Between Plans and Manager */}
        <div className="flex justify-center mb-8">
          <div className="bg-card p-1 rounded-lg shadow-sm border border-border">
            <button
              onClick={() => setShowManager(false)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                !showManager
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Subscription Plans
            </button>
            <button
              onClick={() => setShowManager(true)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                showManager
                  ? 'bg-primary text-primary-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Manage Subscriptions
            </button>
          </div>
        </div>

        {/* Content */}
        {!showManager ? (
          /* Subscription Plans */
          <div className="mb-8">
            <SubscriptionPlans
              locale={locale}
              onSubscribe={handleSubscribe}
              className="mb-8"
            />
          </div>
        ) : (
          /* Subscription Manager */
          <div className="mb-8">
            {/* Email Input for Manager */}
            <div className="max-w-md mx-auto mb-8">
              <label className="block text-sm font-medium text-foreground mb-2">
                Enter email to manage subscriptions:
              </label>
              <div className="flex space-x-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="flex-1 px-4 py-2 border border-input rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground"
                />
              </div>
            </div>

            {testEmail && (
              <SubscriptionManager
                email={testEmail}
                onGetSubscriptions={handleGetSubscriptions}
                onCancelSubscription={handleCancelSubscription}
                onReactivateSubscription={handleReactivateSubscription}
                className="mb-8"
              />
            )}
          </div>
        )}

        {/* Debug Information */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-muted rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Debug Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Current Locale:</p>
                <p className="font-mono text-foreground">{locale}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Test Mode:</p>
                <p className="font-mono text-foreground">Independent Subscription Testing</p>
              </div>
              <div>
                <p className="text-muted-foreground">Components:</p>
                <p className="font-mono text-foreground">@rolitt/payments</p>
              </div>
              <div>
                <p className="text-muted-foreground">Actions:</p>
                <p className="font-mono text-foreground">subscriptionActions.ts</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-secondary rounded border border-border">
              <p className="text-sm text-secondary-foreground">
                <strong>Note:</strong>
                {' '}
                This is a test page for subscription functionality.
                {' '}
                It operates independently from the main pre-order business flow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
