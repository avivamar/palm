/**
 * Stripe checkout service
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

import type { StripeSessionParams, StripeSubscriptionSessionParams } from '../../types';
import Stripe from 'stripe';
import { handlePaymentError, PaymentError } from '../../libs/errors';

export class StripeCheckoutService {
  private stripe: Stripe;

  constructor(secretKey: string, apiVersion: string = '2025-06-30.basil') {
    this.stripe = new Stripe(secretKey, {
      apiVersion: apiVersion as any,
      typescript: true,
    });
  }

  /**
   * Create Stripe checkout session for preorder
   */
  async createCheckoutSession(params: StripeSessionParams): Promise<{ url: string; sessionId: string }> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: params.currency.toLowerCase(),
              product_data: {
                name: 'Rolitt AI Companion - Pre-order',
                description: `Color: ${params.colorCode}`,
                images: ['https://rolitt.com/api/og'],
              },
              unit_amount: params.price * 100, // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        customer_email: params.email,
        phone_number_collection: {
          enabled: true,
        },
        billing_address_collection: 'auto',
        metadata: {
          color_code: params.colorCode,
          locale: params.locale,
          phone: params.phone || '',
          type: 'preorder',
        },
        payment_intent_data: {
          metadata: {
            color_code: params.colorCode,
            locale: params.locale,
            phone: params.phone || '',
            type: 'preorder',
          },
        },
      });

      if (!session.url) {
        throw new PaymentError('Failed to create checkout session URL', 'SESSION_CREATE_FAILED', 'stripe');
      }

      return {
        url: session.url,
        sessionId: session.id,
      };
    } catch (error) {
      throw handlePaymentError(error);
    }
  }

  /**
   * Validate webhook signature
   */
  async validateWebhook(payload: string, signature: string, webhookSecret: string): Promise<Stripe.Event> {
    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      throw new PaymentError(
        'Webhook signature validation failed',
        'WEBHOOK_VALIDATION_FAILED',
        'stripe',
        error,
      );
    }
  }

  /**
   * Process webhook event (enhanced with subscription support)
   */
  async processWebhookEvent(event: Stripe.Event): Promise<{ processed: boolean; message?: string }> {
    try {
      switch (event.type) {
        // Checkout events
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          if (session.mode === 'subscription') {
            return await this.handleSubscriptionCheckoutCompleted(session);
          } else {
            return await this.handleCheckoutCompleted(session);
          }
        }

        // Payment events
        case 'payment_intent.succeeded': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          return await this.handlePaymentSucceeded(paymentIntent);
        }

        case 'payment_intent.payment_failed': {
          const failedPayment = event.data.object as Stripe.PaymentIntent;
          return await this.handlePaymentFailed(failedPayment);
        }

        // Subscription lifecycle events
        case 'customer.subscription.created': {
          const createdSub = event.data.object as Stripe.Subscription;
          return await this.handleSubscriptionCreated(createdSub);
        }

        case 'customer.subscription.updated': {
          const updatedSub = event.data.object as Stripe.Subscription;
          return await this.handleSubscriptionUpdated(updatedSub);
        }

        case 'customer.subscription.deleted': {
          const deletedSub = event.data.object as Stripe.Subscription;
          return await this.handleSubscriptionDeleted(deletedSub);
        }

        // Invoice events
        case 'invoice.payment_succeeded': {
          const successInvoice = event.data.object as Stripe.Invoice;
          return await this.handleInvoicePaymentSucceeded(successInvoice);
        }

        case 'invoice.payment_failed': {
          const failedInvoice = event.data.object as Stripe.Invoice;
          return await this.handleInvoicePaymentFailed(failedInvoice);
        }

        case 'invoice.upcoming': {
          const upcomingInvoice = event.data.object as Stripe.Invoice;
          return await this.handleInvoiceUpcoming(upcomingInvoice);
        }

        default:
          return { processed: false, message: `Unhandled event type: ${event.type}` };
      }
    } catch (error) {
      throw handlePaymentError(error);
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<{ processed: boolean; message?: string }> {
    // Process completed checkout
    console.warn('Checkout completed:', session.id);
    return { processed: true, message: 'Checkout completed successfully' };
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<{ processed: boolean; message?: string }> {
    // Process successful payment
    console.warn('Payment succeeded:', paymentIntent.id);
    return { processed: true, message: 'Payment processed successfully' };
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<{ processed: boolean; message?: string }> {
    // Process failed payment
    console.warn('Payment failed:', paymentIntent.id);
    return { processed: true, message: 'Payment failure handled' };
  }

  private async handleSubscriptionCheckoutCompleted(session: Stripe.Checkout.Session): Promise<{ processed: boolean; message?: string }> {
    console.warn('Subscription checkout completed:', session.id);

    // Extract subscription details
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;
    const customerEmail = session.customer_details?.email;

    if (!subscriptionId || !customerEmail) {
      console.error('Missing subscription ID or customer email in session:', session.id);
      return { processed: false, message: 'Missing required subscription data' };
    }

    // Retrieve subscription details
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price.id;

    console.warn('Subscription activated:', {
      subscriptionId,
      customerId,
      customerEmail,
      priceId,
      status: subscription.status,
    });

    // This is where you would typically:
    // 1. Create/update user subscription record in database
    // 2. Send welcome email
    // 3. Trigger onboarding flow
    // 4. Update user permissions

    return { processed: true, message: 'Subscription checkout completed successfully' };
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<{ processed: boolean; message?: string }> {
    console.warn('Subscription created:', subscription.id);

    const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
    const priceId = subscription.items.data[0]?.price.id;
    const subData = subscription as any; // Type assertion for Stripe properties

    console.warn('New subscription details:', {
      subscriptionId: subscription.id,
      customerId,
      priceId,
      status: subscription.status,
      currentPeriodStart: subData.current_period_start ? new Date(subData.current_period_start * 1000) : null,
      currentPeriodEnd: subData.current_period_end ? new Date(subData.current_period_end * 1000) : null,
    });

    // Handle subscription creation logic here
    // This event is typically triggered when a subscription starts

    return { processed: true, message: 'Subscription created successfully' };
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<{ processed: boolean; message?: string }> {
    console.warn('Subscription updated:', subscription.id);

    const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
    const priceId = subscription.items.data[0]?.price.id;
    const subData = subscription as any; // Type assertion for Stripe properties

    console.warn('Updated subscription details:', {
      subscriptionId: subscription.id,
      customerId,
      priceId,
      status: subscription.status,
      cancelAtPeriodEnd: subData.cancel_at_period_end,
      currentPeriodEnd: subData.current_period_end ? new Date(subData.current_period_end * 1000) : null,
    });

    // Handle subscription updates here
    // This includes plan changes, status changes, cancellations scheduled, etc.

    return { processed: true, message: 'Subscription updated successfully' };
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<{ processed: boolean; message?: string }> {
    console.warn('Subscription deleted/canceled:', subscription.id);

    const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

    console.warn('Canceled subscription details:', {
      subscriptionId: subscription.id,
      customerId,
      status: subscription.status,
      canceledAt: (subscription as any).canceled_at ? new Date((subscription as any).canceled_at * 1000) : null,
      endedAt: (subscription as any).ended_at ? new Date((subscription as any).ended_at * 1000) : null,
    });

    // Handle subscription cancellation here
    // Update user permissions, send cancellation email, etc.

    return { processed: true, message: 'Subscription cancellation handled successfully' };
  }

  private async handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<{ processed: boolean; message?: string }> {
    console.warn('Invoice payment succeeded:', invoice.id);

    const invoiceData = invoice as any; // Type assertion for Stripe properties
    const subscriptionId = typeof invoiceData.subscription === 'string' ? invoiceData.subscription : invoiceData.subscription?.id;
    const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

    console.warn('Successful invoice payment:', {
      invoiceId: invoice.id,
      subscriptionId,
      customerId,
      amountPaid: invoice.amount_paid / 100,
      currency: invoice.currency,
      periodStart: new Date(invoice.period_start * 1000),
      periodEnd: new Date(invoice.period_end * 1000),
    });

    // Handle successful subscription renewal here
    // This is triggered for recurring subscription payments

    return { processed: true, message: 'Invoice payment processed successfully' };
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<{ processed: boolean; message?: string }> {
    console.error('Invoice payment failed:', invoice.id);

    const invoiceData = invoice as any; // Type assertion for Stripe properties
    const subscriptionId = typeof invoiceData.subscription === 'string' ? invoiceData.subscription : invoiceData.subscription?.id;
    const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

    console.error('Failed invoice payment:', {
      invoiceId: invoice.id,
      subscriptionId,
      customerId,
      amountDue: invoice.amount_due / 100,
      currency: invoice.currency,
      attemptCount: invoice.attempt_count,
      nextPaymentAttempt: invoice.next_payment_attempt ? new Date(invoice.next_payment_attempt * 1000) : null,
    });

    // Handle failed subscription payment here
    // Send payment failure email, retry logic, grace period, etc.

    return { processed: true, message: 'Invoice payment failure handled successfully' };
  }

  private async handleInvoiceUpcoming(invoice: Stripe.Invoice): Promise<{ processed: boolean; message?: string }> {
    console.log('Upcoming invoice:', invoice.id);

    const invoiceData = invoice as any; // Type assertion for Stripe properties
    const subscriptionId = typeof invoiceData.subscription === 'string' ? invoiceData.subscription : invoiceData.subscription?.id;
    const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

    console.log('Upcoming invoice details:', {
      invoiceId: invoice.id,
      subscriptionId,
      customerId,
      amountDue: invoice.amount_due / 100,
      currency: invoice.currency,
      periodStart: new Date(invoice.period_start * 1000),
      periodEnd: new Date(invoice.period_end * 1000),
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
    });

    // Handle upcoming invoice here
    // Send renewal reminder email, pre-payment notifications, etc.

    return { processed: true, message: 'Upcoming invoice notification handled successfully' };
  }

  /**
   * Retrieve checkout session
   */
  async getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      throw handlePaymentError(error);
    }
  }

  /**
   * Create Stripe checkout session for subscription
   */
  async createSubscriptionCheckoutSession(params: StripeSubscriptionSessionParams): Promise<{ url: string; sessionId: string }> {
    try {
      // Create or retrieve customer
      let customerId = params.customerId;

      if (!customerId) {
        const customer = await this.createCustomer(params.email, undefined, params.phone);
        customerId = customer.id;
      }

      const sessionConfig: Stripe.Checkout.SessionCreateParams = {
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: params.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        phone_number_collection: {
          enabled: true,
        },
        billing_address_collection: 'auto',
        metadata: {
          locale: params.locale,
          type: 'subscription',
          customer_id: customerId,
          ...params.metadata,
        },
        subscription_data: {
          metadata: {
            locale: params.locale,
            type: 'subscription',
            customer_id: customerId,
            ...params.metadata,
          },
          ...(params.trialPeriodDays && {
            trial_period_days: params.trialPeriodDays,
          }),
        },
        // Allow promotion codes for subscriptions
        allow_promotion_codes: true,
        // Automatic tax calculation
        automatic_tax: {
          enabled: true,
        },
      };

      const session = await this.stripe.checkout.sessions.create(sessionConfig);

      if (!session.url) {
        throw new PaymentError('Failed to create subscription checkout session URL', 'SUBSCRIPTION_SESSION_CREATE_FAILED', 'stripe');
      }

      return {
        url: session.url,
        sessionId: session.id,
      };
    } catch (error) {
      throw handlePaymentError(error);
    }
  }

  /**
   * Retrieve subscription
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      throw handlePaymentError(error);
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId: string, params: { priceId?: string; quantity?: number }): Promise<Stripe.Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

      const updateParams: Stripe.SubscriptionUpdateParams = {};

      if (params.priceId) {
        updateParams.items = [
          {
            id: subscription.items.data[0]?.id,
            price: params.priceId,
            quantity: params.quantity || 1,
          },
        ];
      }

      return await this.stripe.subscriptions.update(subscriptionId, updateParams);
    } catch (error) {
      throw handlePaymentError(error);
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, immediately: boolean = false): Promise<Stripe.Subscription> {
    try {
      if (immediately) {
        return await this.stripe.subscriptions.cancel(subscriptionId);
      } else {
        return await this.stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      }
    } catch (error) {
      throw handlePaymentError(error);
    }
  }

  /**
   * Create customer
   */
  async createCustomer(email: string, name?: string, phone?: string): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.create({
        email,
        name,
        phone,
      });
    } catch (error) {
      throw handlePaymentError(error);
    }
  }
}
