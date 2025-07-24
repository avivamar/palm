/**
 * Subscription management service
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

import type {
  StripeSubscriptionSessionParams,
  Subscription,
  SubscriptionRequest,
  SubscriptionStatus,
  SubscriptionUpdate,
} from '../../types';
import Stripe from 'stripe';
import { handlePaymentError, SubscriptionError } from '../../libs/errors';
import { StripeCheckoutService } from '../stripe/StripeCheckoutService';
import { getPlanByPriceId } from './SubscriptionPlans';

export class SubscriptionService {
  private checkoutService: StripeCheckoutService;
  private stripe: Stripe;

  constructor(secretKey: string, apiVersion: string = '2025-06-30.basil') {
    this.checkoutService = new StripeCheckoutService(secretKey, apiVersion);
    this.stripe = new Stripe(secretKey, {
      apiVersion: apiVersion as any,
      typescript: true,
    });
  }

  /**
   * Create subscription checkout session
   */
  async createSubscriptionSession(params: StripeSubscriptionSessionParams): Promise<{ url: string; sessionId: string }> {
    try {
      // Validate price ID exists in our plans
      const plan = getPlanByPriceId(params.priceId);
      if (!plan) {
        throw new SubscriptionError(
          `Invalid price ID: ${params.priceId}`,
          'INVALID_PRICE_ID',
          'stripe',
        );
      }

      return await this.checkoutService.createSubscriptionCheckoutSession(params);
    } catch (error) {
      throw handlePaymentError(error);
    }
  }

  /**
   * Create subscription directly (without checkout)
   */
  async createSubscription(request: SubscriptionRequest): Promise<Subscription> {
    try {
      // Validate price ID
      const plan = getPlanByPriceId(request.priceId);
      if (!plan) {
        throw new SubscriptionError(
          `Invalid price ID: ${request.priceId}`,
          'INVALID_PRICE_ID',
          'stripe',
        );
      }

      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer: request.customerId,
        items: [
          {
            price: request.priceId,
            quantity: request.quantity || 1,
          },
        ],
        metadata: request.metadata || {},
      };

      // Add trial period if specified
      if (request.trialPeriodDays && request.trialPeriodDays > 0) {
        subscriptionParams.trial_period_days = request.trialPeriodDays;
      }

      const stripeSubscription = await this.stripe.subscriptions.create(subscriptionParams);

      return this.mapStripeSubscriptionToLocal(stripeSubscription);
    } catch (error) {
      throw handlePaymentError(error);
    }
  }

  /**
   * Retrieve subscription
   */
  async getSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const stripeSubscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      return this.mapStripeSubscriptionToLocal(stripeSubscription);
    } catch (error) {
      throw handlePaymentError(error);
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId: string, updates: SubscriptionUpdate): Promise<Subscription> {
    try {
      const currentSubscription = await this.stripe.subscriptions.retrieve(subscriptionId);

      const updateParams: Stripe.SubscriptionUpdateParams = {};

      // Update metadata
      if (updates.metadata) {
        updateParams.metadata = updates.metadata;
      }

      // Update price and/or quantity
      if (updates.priceId || updates.quantity) {
        // Validate new price ID if provided
        if (updates.priceId) {
          const plan = getPlanByPriceId(updates.priceId);
          if (!plan) {
            throw new SubscriptionError(
              `Invalid price ID: ${updates.priceId}`,
              'INVALID_PRICE_ID',
              'stripe',
            );
          }
        }

        updateParams.items = [
          {
            id: currentSubscription.items.data[0]?.id,
            price: updates.priceId || currentSubscription.items.data[0]?.price.id,
            quantity: updates.quantity || currentSubscription.items.data[0]?.quantity || 1,
          },
        ];

        // Prorate by default for plan changes
        updateParams.proration_behavior = 'create_prorations';
      }

      const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, updateParams);

      return this.mapStripeSubscriptionToLocal(updatedSubscription);
    } catch (error) {
      throw handlePaymentError(error);
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, immediately: boolean = false): Promise<Subscription> {
    try {
      let canceledSubscription: Stripe.Subscription;

      if (immediately) {
        // Cancel immediately
        canceledSubscription = await this.stripe.subscriptions.cancel(subscriptionId);
      } else {
        // Cancel at period end
        canceledSubscription = await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      }

      return this.mapStripeSubscriptionToLocal(canceledSubscription);
    } catch (error) {
      throw handlePaymentError(error);
    }
  }

  /**
   * Reactivate canceled subscription (if still in grace period)
   */
  async reactivateSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });

      return this.mapStripeSubscriptionToLocal(subscription);
    } catch (error) {
      throw handlePaymentError(error);
    }
  }

  /**
   * Get customer subscriptions
   */
  async getCustomerSubscriptions(customerId: string): Promise<Subscription[]> {
    try {
      const subscriptions = await this.stripe.subscriptions.list({
        customer: customerId,
        limit: 100, // Adjust as needed
      });

      return subscriptions.data.map(sub => this.mapStripeSubscriptionToLocal(sub));
    } catch (error) {
      throw handlePaymentError(error);
    }
  }

  /**
   * Get subscription by customer email
   */
  async getSubscriptionsByEmail(email: string): Promise<Subscription[]> {
    try {
      // First, find the customer by email
      const customers = await this.stripe.customers.list({
        email,
        limit: 1,
      });

      if (customers.data.length === 0) {
        return [];
      }

      const customerId = customers.data[0]!.id;
      return await this.getCustomerSubscriptions(customerId);
    } catch (error) {
      throw handlePaymentError(error);
    }
  }

  /**
   * Get upcoming invoice for subscription
   */
  async getUpcomingInvoice(subscriptionId: string): Promise<{
    amount: number;
    currency: string;
    periodStart: Date;
    periodEnd: Date;
    dueDate?: Date;
  } | null> {
    try {
      // Use any to work around Stripe TypeScript limitations
      const invoiceData = await (this.stripe.invoices as any).retrieveUpcoming({
        subscription: subscriptionId,
      });

      return {
        amount: invoiceData.amount_due / 100, // Convert from cents
        currency: invoiceData.currency,
        periodStart: new Date(invoiceData.period_start * 1000),
        periodEnd: new Date(invoiceData.period_end * 1000),
        dueDate: invoiceData.due_date ? new Date(invoiceData.due_date * 1000) : undefined,
      };
    } catch (error) {
      // No upcoming invoice found
      return null;
    }
  }

  /**
   * Get subscription usage/analytics
   */
  async getSubscriptionAnalytics(customerId: string): Promise<{
    activeSubscriptions: number;
    totalSpent: number;
    currency: string;
    subscriptionHistory: Array<{
      id: string;
      planName: string;
      status: SubscriptionStatus;
      startDate: Date;
      endDate?: Date;
    }>;
  }> {
    try {
      const subscriptions = await this.getCustomerSubscriptions(customerId);

      // Get all invoices for the customer
      const invoices = await this.stripe.invoices.list({
        customer: customerId,
        limit: 100,
      });

      const totalSpent = invoices.data
        .filter(invoice => invoice.status === 'paid')
        .reduce((sum, invoice) => sum + invoice.amount_paid, 0) / 100;

      const activeSubscriptions = subscriptions.filter(
        sub => sub.status === 'active' || sub.status === 'trialing',
      ).length;

      const subscriptionHistory = subscriptions.map((sub) => {
        const plan = getPlanByPriceId(sub.metadata?.priceId || '');
        const subData = sub as any;

        return {
          id: sub.id,
          planName: plan?.name || 'Unknown Plan',
          status: sub.status as SubscriptionStatus,
          startDate: subData.created ? new Date(subData.created * 1000) : new Date(),
          endDate: subData.ended_at ? new Date(subData.ended_at * 1000) : undefined,
        };
      });

      return {
        activeSubscriptions,
        totalSpent,
        currency: invoices.data[0]?.currency || 'usd',
        subscriptionHistory,
      };
    } catch (error) {
      throw handlePaymentError(error);
    }
  }

  /**
   * Map Stripe subscription to local subscription type
   */
  private mapStripeSubscriptionToLocal(stripeSubscription: Stripe.Subscription): Subscription {
    const subData = stripeSubscription as any;

    return {
      id: stripeSubscription.id,
      customerId: typeof stripeSubscription.customer === 'string'
        ? stripeSubscription.customer
        : stripeSubscription.customer.id,
      status: stripeSubscription.status as SubscriptionStatus,
      currentPeriodStart: subData.current_period_start
        ? new Date(subData.current_period_start * 1000)
        : new Date(),
      currentPeriodEnd: subData.current_period_end
        ? new Date(subData.current_period_end * 1000)
        : new Date(),
      metadata: stripeSubscription.metadata || {},
    };
  }
}
