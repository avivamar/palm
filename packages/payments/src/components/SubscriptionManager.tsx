/**
 * Subscription Manager Component - Manage existing subscriptions
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

'use client';

import type { Subscription, SubscriptionStatus } from '../types';
import React, { useEffect, useState } from 'react';

export type SubscriptionManagerProps = {
  email: string;
  onGetSubscriptions: (email: string) => Promise<{
    success: boolean;
    subscriptions: Subscription[];
    error?: string;
  }>;
  onCancelSubscription: (subscriptionId: string, immediately?: boolean) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
  onReactivateSubscription: (subscriptionId: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
  className?: string;
};

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({
  email,
  onGetSubscriptions,
  onCancelSubscription,
  onReactivateSubscription,
  className = '',
}) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadSubscriptions = async () => {
    if (!onGetSubscriptions) {
      console.warn('No subscription getter provided');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await onGetSubscriptions(email);
      if (result.success) {
        setSubscriptions(result.subscriptions || []);
      } else {
        setError(result.error || 'Failed to load subscriptions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, [email]);

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!onCancelSubscription) {
      console.warn('No cancel subscription handler provided');
      return;
    }

    setActionLoading(subscriptionId);

    try {
      const result = await onCancelSubscription(subscriptionId);
      if (result.success) {
        console.warn('Subscription canceled successfully');
        await loadSubscriptions(); // Reload subscriptions
      } else {
        console.warn('Failed to cancel subscription');
      }
    } catch (err) {
      console.warn('Error canceling subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateSubscription = async (subscriptionId: string) => {
    if (!onReactivateSubscription) {
      console.warn('No reactivate subscription handler provided');
      return;
    }

    setActionLoading(subscriptionId);

    try {
      const result = await onReactivateSubscription(subscriptionId);
      if (result.success) {
        console.warn('Subscription reactivated successfully');
        await loadSubscriptions(); // Reload subscriptions
      } else {
        console.warn('Failed to reactivate subscription');
      }
    } catch (err) {
      console.warn('Error reactivating subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'trialing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'canceled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'past_due':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'unpaid':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className={`subscription-manager ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Loading subscriptions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`subscription-manager ${className}`}>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-destructive mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-destructive">Error</h3>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
              <button
                onClick={loadSubscriptions}
                className="mt-2 text-sm text-destructive hover:text-destructive/80"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`subscription-manager ${className}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Your Subscriptions
          </h2>
          <p className="text-muted-foreground">
            Manage your active subscriptions for
            {' '}
            {email}
          </p>
          <button
            onClick={loadSubscriptions}
            disabled={isLoading}
            className="mt-2 text-sm text-primary hover:text-primary/80"
          >
            Refresh
          </button>
        </div>

        {/* Subscriptions List */}
        {subscriptions.length === 0
          ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No subscriptions found
                </h3>
                <p className="text-muted-foreground">
                  You don't have any active subscriptions yet.
                </p>
              </div>
            )
          : (
              <div className="space-y-4">
                {subscriptions.map(subscription => (
                  <div
                    key={subscription.id}
                    className="bg-card border border-border rounded-lg p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Subscription Header */}
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-semibold text-card-foreground">
                            Subscription
                          </h3>
                          <span
                            className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status as SubscriptionStatus)}`}
                          >
                            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                          </span>
                        </div>

                        {/* Subscription Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Subscription ID</p>
                            <p className="text-sm font-mono text-card-foreground">
                              {subscription.id}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Current Period</p>
                            <p className="text-sm text-card-foreground">
                              {formatDate(subscription.currentPeriodStart)}
                              {' '}
                              -
                              {formatDate(subscription.currentPeriodEnd)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Customer ID</p>
                            <p className="text-sm font-mono text-card-foreground">
                              {subscription.customerId}
                            </p>
                          </div>
                        </div>

                        {/* Metadata */}
                        {subscription.metadata && Object.keys(subscription.metadata).length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-muted-foreground mb-2">Additional Info</p>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(subscription.metadata).map(([key, value]) => (
                                <div key={key} className="text-sm">
                                  <span className="text-muted-foreground">
                                    {key}
                                    :
                                  </span>
                                  <span className="ml-1 text-card-foreground">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="ml-4 flex flex-col space-y-2">
                        {(subscription.status === 'active' || subscription.status === 'trialing') && (
                          <>
                            <button
                              onClick={() => handleCancelSubscription(subscription.id)}
                              disabled={actionLoading === subscription.id}
                              className="px-3 py-1 text-sm text-orange-600 hover:text-orange-500 border border-orange-300 hover:border-orange-400 rounded disabled:opacity-50"
                            >
                              {actionLoading === subscription.id ? 'Processing...' : 'Cancel at Period End'}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to cancel immediately? This action cannot be undone.')) {
                                  handleCancelSubscription(subscription.id);
                                }
                              }}
                              disabled={actionLoading === subscription.id}
                              className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 disabled:opacity-50"
                            >
                              Cancel Immediately
                            </button>
                          </>
                        )}

                        {subscription.status === 'canceled' && (
                          <button
                            onClick={() => handleReactivateSubscription(subscription.id)}
                            disabled={actionLoading === subscription.id}
                            className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
                          >
                            {actionLoading === subscription.id ? 'Processing...' : 'Reactivate'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
      </div>
    </div>
  );
}; ;
