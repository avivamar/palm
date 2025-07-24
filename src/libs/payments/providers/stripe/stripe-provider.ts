// Stripe 支付提供商实现

import type {
  CustomerData,
  PaymentCustomer,
  PaymentIntent,
  PaymentIntentRequest,
  PaymentProvider,
  PaymentResult,
  PaymentStatus,
  Subscription,
  SubscriptionRequest,
  SubscriptionUpdate,
  UserProfile,
  WebhookEvent,
  WebhookResult,
} from '../../core/payment-types';
import Stripe from 'stripe';
import { Env } from '@/libs/Env';
import {
  CustomerError,
  PaymentError,
  PaymentIntentError,
  SubscriptionError,
  WebhookValidationError,
} from '../../core/payment-errors';

export class StripePaymentProvider implements PaymentProvider {
  readonly name = 'stripe';
  readonly version = '2024-12-18.acacia';

  private stripe: Stripe;

  constructor() {
    if (!Env.STRIPE_SECRET_KEY) {
      throw new PaymentError('Stripe secret key is required', 'MISSING_CONFIG', 'stripe');
    }

    this.stripe = new Stripe(Env.STRIPE_SECRET_KEY, { apiVersion: '2025-06-30.basil' as any, typescript: true });
  }

  async createCustomer(user: UserProfile): Promise<PaymentCustomer> {
    try {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.displayName,
        metadata: {
          firebaseUid: user.uid,
          source: 'firebase_sync',
          createdAt: new Date().toISOString(),
        },
      });

      return {
        id: customer.id,
        email: customer.email!,
        name: customer.name!,
        provider: 'stripe',
        metadata: customer.metadata,
      };
    } catch (error) {
      throw new CustomerError(
        `Failed to create Stripe customer: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'stripe',
        error,
      );
    }
  }

  async updateCustomer(customerId: string, data: Partial<CustomerData>): Promise<PaymentCustomer> {
    try {
      const customer = await this.stripe.customers.update(customerId, {
        email: data.email,
        name: data.name,
        metadata: data.metadata,
      });

      return {
        id: customer.id,
        email: customer.email!,
        name: customer.name!,
        provider: 'stripe',
        metadata: customer.metadata,
      };
    } catch (error) {
      throw new CustomerError(
        `Failed to update Stripe customer: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'stripe',
        error,
      );
    }
  }

  async deleteCustomer(customerId: string): Promise<void> {
    try {
      await this.stripe.customers.del(customerId);
    } catch (error) {
      throw new CustomerError(
        `Failed to delete Stripe customer: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'stripe',
        error,
      );
    }
  }

  async createPaymentIntent(request: PaymentIntentRequest): Promise<PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: request.amount,
        currency: request.currency,
        customer: request.customerId,
        description: request.description,
        metadata: request.metadata,
        payment_method_types: request.paymentMethodTypes || ['card'],
        capture_method: request.captureMethod || 'automatic',
        setup_future_usage: 'off_session',
        confirmation_method: 'manual',
        confirm: false,
      });

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        status: this.mapStripeStatus(paymentIntent.status),
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        customerId: paymentIntent.customer as string,
        createdAt: new Date(paymentIntent.created * 1000),
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      throw new PaymentIntentError(
        `Failed to create payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'stripe',
        error,
      );
    }
  }

  async confirmPayment(paymentId: string, paymentMethod: string): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentId, {
        payment_method: paymentMethod,
      });

      return {
        success: paymentIntent.status === 'succeeded',
        paymentIntent: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.client_secret!,
          status: this.mapStripeStatus(paymentIntent.status),
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          customerId: paymentIntent.customer as string,
          createdAt: new Date(paymentIntent.created * 1000),
          metadata: paymentIntent.metadata,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async cancelPayment(paymentId: string): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.cancel(paymentId);

      return {
        success: paymentIntent.status === 'canceled',
        paymentIntent: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.client_secret!,
          status: this.mapStripeStatus(paymentIntent.status),
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          customerId: paymentIntent.customer as string,
          createdAt: new Date(paymentIntent.created * 1000),
          metadata: paymentIntent.metadata,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async createSubscription(request: SubscriptionRequest): Promise<Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: request.customerId,
        items: [{ price: request.priceId, quantity: request.quantity || 1 }],
        trial_period_days: request.trialPeriodDays,
        metadata: request.metadata,
      });

      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        status: subscription.status,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        metadata: subscription.metadata,
      };
    } catch (error) {
      throw new SubscriptionError(
        `Failed to create subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'stripe',
        error,
      );
    }
  }

  async updateSubscription(subscriptionId: string, updates: SubscriptionUpdate): Promise<Subscription> {
    try {
      const updateData: Stripe.SubscriptionUpdateParams = {
        metadata: updates.metadata,
      };

      if (updates.priceId) {
        updateData.items = [{ price: updates.priceId, quantity: updates.quantity || 1 }];
      }

      const subscription = await this.stripe.subscriptions.update(subscriptionId, updateData);

      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        status: subscription.status,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        metadata: subscription.metadata,
      };
    } catch (error) {
      throw new SubscriptionError(
        `Failed to update subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'stripe',
        error,
      );
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.cancel(subscriptionId);

      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        status: subscription.status,
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        metadata: subscription.metadata,
      };
    } catch (error) {
      throw new SubscriptionError(
        `Failed to cancel subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'stripe',
        error,
      );
    }
  }

  async validateWebhook(payload: string, signature: string): Promise<WebhookEvent> {
    try {
      if (!Env.STRIPE_WEBHOOK_SECRET) {
        throw new WebhookValidationError('Stripe webhook secret is not configured');
      }

      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        Env.STRIPE_WEBHOOK_SECRET,
      );

      return {
        id: event.id,
        type: event.type,
        data: event.data,
        created: new Date(event.created * 1000),
        provider: 'stripe',
      };
    } catch (error) {
      throw new WebhookValidationError('Stripe webhook validation failed', error);
    }
  }

  async processWebhook(event: WebhookEvent): Promise<WebhookResult> {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          return await this.handlePaymentSuccess(event.data.object);

        case 'payment_intent.payment_failed':
          return await this.handlePaymentFailure(event.data.object);

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          return await this.handleSubscriptionUpdate(event.data.object);

        case 'customer.subscription.deleted':
          return await this.handleSubscriptionCancellation(event.data.object);

        case 'invoice.payment_succeeded':
          return await this.handleInvoicePayment(event.data.object);

        default:
          return {
            processed: false,
            message: `Unhandled event type: ${event.type}`,
          };
      }
    } catch (error) {
      return {
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private mapStripeStatus(stripeStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      requires_payment_method: 'requires_payment_method',
      requires_confirmation: 'requires_confirmation',
      requires_action: 'requires_action',
      processing: 'processing',
      succeeded: 'succeeded',
      canceled: 'canceled',
    };

    return statusMap[stripeStatus] || 'failed';
  }

  private async handlePaymentSuccess(_paymentIntent: any): Promise<WebhookResult> {
    // TODO: 实现支付成功处理逻辑
    return { processed: true, message: 'Payment success handled' };
  }

  private async handlePaymentFailure(_paymentIntent: any): Promise<WebhookResult> {
    // TODO: 实现支付失败处理逻辑
    return { processed: true, message: 'Payment failure handled' };
  }

  private async handleSubscriptionUpdate(_subscription: any): Promise<WebhookResult> {
    // TODO: 实现订阅更新处理逻辑
    return { processed: true, message: 'Subscription update handled' };
  }

  private async handleSubscriptionCancellation(_subscription: any): Promise<WebhookResult> {
    // TODO: 实现订阅取消处理逻辑
    return { processed: true, message: 'Subscription cancellation handled' };
  }

  private async handleInvoicePayment(_invoice: any): Promise<WebhookResult> {
    // TODO: 实现发票支付处理逻辑
    return { processed: true, message: 'Invoice payment handled' };
  }
}
