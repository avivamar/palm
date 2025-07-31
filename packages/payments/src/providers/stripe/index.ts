/**
 * Stripe 支付供应商实现
 */

import Stripe from 'stripe';
import type { 
  PaymentProvider, 
  UserProfile, 
  PaymentCustomer, 
  CustomerData,
  PaymentIntentRequest,
  PaymentIntent,
  PaymentResult,
  SubscriptionRequest,
  Subscription,
  SubscriptionUpdate,
  WebhookEvent,
  WebhookResult
} from '../../types';
import { handlePaymentError, PaymentError } from '../../libs/errors';

export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
  webhookSecret: string;
  apiVersion: string;
}

export class StripeProvider implements PaymentProvider {
  readonly name = 'stripe';
  readonly version = '1.0.0';
  
  private stripe: Stripe;
  private webhookSecret: string;

  constructor(config: StripeConfig) {
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: config.apiVersion as any,
      typescript: true,
    });
    this.webhookSecret = config.webhookSecret;
  }

  async createCustomer(user: UserProfile): Promise<PaymentCustomer> {
    try {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.displayName,
        metadata: {
          uid: user.uid,
        },
      });

      return {
        id: customer.id,
        email: customer.email!,
        name: customer.name || user.displayName,
        provider: this.name,
        metadata: customer.metadata,
      };
    } catch (error) {
      throw handlePaymentError(error);
    }
  }

  async updateCustomer(customerId: string, data: Partial<CustomerData>): Promise<PaymentCustomer> {
    try {
      const customer = await this.stripe.customers.update(customerId, {
        email: data.email,
        name: data.name,
        phone: data.phone,
        metadata: data.metadata,
      });

      return {
        id: customer.id,
        email: customer.email!,
        name: customer.name || '',
        provider: this.name,
        metadata: customer.metadata,
      };
    } catch (error) {
      throw handlePaymentError(error);
    }
  }

  async deleteCustomer(customerId: string): Promise<void> {
    try {
      await this.stripe.customers.del(customerId);
    } catch (error) {
      throw handlePaymentError(error);
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
      });

      return {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        status: paymentIntent.status as any,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        customerId: paymentIntent.customer as string,
        createdAt: new Date(paymentIntent.created * 1000),
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      throw handlePaymentError(error);
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
          status: paymentIntent.status as any,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          customerId: paymentIntent.customer as string,
          createdAt: new Date(paymentIntent.created * 1000),
          metadata: paymentIntent.metadata,
        },
      };
    } catch (error) {
      const paymentError = handlePaymentError(error);
      return {
        success: false,
        error: paymentError.message,
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
          status: paymentIntent.status as any,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          customerId: paymentIntent.customer as string,
          createdAt: new Date(paymentIntent.created * 1000),
          metadata: paymentIntent.metadata,
        },
      };
    } catch (error) {
      const paymentError = handlePaymentError(error);
      return {
        success: false,
        error: paymentError.message,
      };
    }
  }

  async createSubscription(request: SubscriptionRequest): Promise<Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: request.customerId,
        items: [{
          price: request.priceId,
          quantity: request.quantity || 1,
        }],
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
      throw handlePaymentError(error);
    }
  }

  async updateSubscription(subscriptionId: string, updates: SubscriptionUpdate): Promise<Subscription> {
    try {
      const updateData: any = {
        metadata: updates.metadata,
      };

      if (updates.priceId) {
        // 获取当前订阅以更新价格
        const currentSub = await this.stripe.subscriptions.retrieve(subscriptionId);
        updateData.items = [{
          id: currentSub.items?.data[0]?.id,
          price: updates.priceId,
          quantity: updates.quantity || 1,
        }];
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
      throw handlePaymentError(error);
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
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
      throw handlePaymentError(error);
    }
  }

  async validateWebhook(payload: string, signature: string): Promise<WebhookEvent> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );

      return {
        id: event.id,
        type: event.type,
        data: event.data,
        created: new Date(event.created * 1000),
        provider: this.name,
      };
    } catch (error) {
      throw new PaymentError('Invalid webhook signature', 'WEBHOOK_VALIDATION_FAILED');
    }
  }

  async processWebhook(event: WebhookEvent): Promise<WebhookResult> {
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          // 处理支付成功
          console.log('Payment succeeded:', event.data);
          break;
        
        case 'payment_intent.payment_failed':
          // 处理支付失败
          console.log('Payment failed:', event.data);
          break;
        
        case 'customer.subscription.created':
          // 处理订阅创建
          console.log('Subscription created:', event.data);
          break;
        
        case 'customer.subscription.updated':
          // 处理订阅更新
          console.log('Subscription updated:', event.data);
          break;
        
        case 'customer.subscription.deleted':
          // 处理订阅删除
          console.log('Subscription deleted:', event.data);
          break;
        
        default:
          console.log('Unhandled event type:', event.type);
      }

      return {
        processed: true,
        message: `Successfully processed ${event.type}`,
      };
    } catch (error) {
      return {
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}