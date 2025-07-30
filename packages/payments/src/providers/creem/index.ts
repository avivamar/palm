/**
 * Creem.io 支付供应商实现
 * 基于 Creem.io API 文档: https://www.creem.io/
 */

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
import { PaymentError } from '../../libs/errors';

export interface CreemConfig {
  apiKey: string;
  publicKey: string;
  webhookSecret: string;
  environment: 'sandbox' | 'production';
}

export class CreemProvider implements PaymentProvider {
  readonly name = 'creem';
  readonly version = '1.0.0';
  
  private apiKey: string;
  private publicKey: string;
  private webhookSecret: string;
  private baseUrl: string;

  constructor(config: CreemConfig) {
    this.apiKey = config.apiKey;
    this.publicKey = config.publicKey;
    this.webhookSecret = config.webhookSecret;
    this.baseUrl = config.environment === 'production' 
      ? 'https://api.creem.io/v1'
      : 'https://api-sandbox.creem.io/v1';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new PaymentError(error.message, 'CREEM_API_ERROR');
    }

    return response.json();
  }

  async createCustomer(user: UserProfile): Promise<PaymentCustomer> {
    try {
      const response = await this.makeRequest('/customers', {
        method: 'POST',
        body: JSON.stringify({
          email: user.email,
          name: user.displayName,
          metadata: {
            uid: user.uid,
          },
        }),
      });

      return {
        id: response.id,
        email: response.email,
        name: response.name,
        provider: this.name,
        metadata: response.metadata,
      };
    } catch (error) {
      throw error instanceof PaymentError ? error : new PaymentError('Failed to create customer', 'CUSTOMER_CREATION_FAILED');
    }
  }

  async updateCustomer(customerId: string, data: Partial<CustomerData>): Promise<PaymentCustomer> {
    try {
      const response = await this.makeRequest(`/customers/${customerId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      return {
        id: response.id,
        email: response.email,
        name: response.name,
        provider: this.name,
        metadata: response.metadata,
      };
    } catch (error) {
      throw error instanceof PaymentError ? error : new PaymentError('Failed to update customer', 'CUSTOMER_UPDATE_FAILED');
    }
  }

  async deleteCustomer(customerId: string): Promise<void> {
    try {
      await this.makeRequest(`/customers/${customerId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw error instanceof PaymentError ? error : new PaymentError('Failed to delete customer', 'CUSTOMER_DELETE_FAILED');
    }
  }

  async createPaymentIntent(request: PaymentIntentRequest): Promise<PaymentIntent> {
    try {
      const response = await this.makeRequest('/payment-intents', {
        method: 'POST',
        body: JSON.stringify({
          amount: request.amount,
          currency: request.currency,
          customer_id: request.customerId,
          description: request.description,
          metadata: request.metadata,
          payment_method_types: request.paymentMethodTypes || ['card'],
          capture_method: request.captureMethod || 'automatic',
        }),
      });

      return {
        id: response.id,
        clientSecret: response.client_secret,
        status: this.mapCreemStatus(response.status),
        amount: response.amount,
        currency: response.currency,
        customerId: response.customer_id,
        createdAt: new Date(response.created_at),
        metadata: response.metadata,
      };
    } catch (error) {
      throw error instanceof PaymentError ? error : new PaymentError('Failed to create payment intent', 'PAYMENT_INTENT_CREATION_FAILED');
    }
  }

  async confirmPayment(paymentId: string, paymentMethod: string): Promise<PaymentResult> {
    try {
      const response = await this.makeRequest(`/payment-intents/${paymentId}/confirm`, {
        method: 'POST',
        body: JSON.stringify({
          payment_method: paymentMethod,
        }),
      });

      return {
        success: response.status === 'succeeded',
        paymentIntent: {
          id: response.id,
          clientSecret: response.client_secret,
          status: this.mapCreemStatus(response.status),
          amount: response.amount,
          currency: response.currency,
          customerId: response.customer_id,
          createdAt: new Date(response.created_at),
          metadata: response.metadata,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment confirmation failed',
      };
    }
  }

  async cancelPayment(paymentId: string): Promise<PaymentResult> {
    try {
      const response = await this.makeRequest(`/payment-intents/${paymentId}/cancel`, {
        method: 'POST',
      });

      return {
        success: response.status === 'canceled',
        paymentIntent: {
          id: response.id,
          clientSecret: response.client_secret,
          status: this.mapCreemStatus(response.status),
          amount: response.amount,
          currency: response.currency,
          customerId: response.customer_id,
          createdAt: new Date(response.created_at),
          metadata: response.metadata,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment cancellation failed',
      };
    }
  }

  async createSubscription(request: SubscriptionRequest): Promise<Subscription> {
    try {
      const response = await this.makeRequest('/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          customer_id: request.customerId,
          price_id: request.priceId,
          quantity: request.quantity || 1,
          trial_period_days: request.trialPeriodDays,
          metadata: request.metadata,
        }),
      });

      return {
        id: response.id,
        customerId: response.customer_id,
        status: response.status,
        currentPeriodStart: new Date(response.current_period_start),
        currentPeriodEnd: new Date(response.current_period_end),
        metadata: response.metadata,
      };
    } catch (error) {
      throw error instanceof PaymentError ? error : new PaymentError('Failed to create subscription', 'SUBSCRIPTION_CREATION_FAILED');
    }
  }

  async updateSubscription(subscriptionId: string, updates: SubscriptionUpdate): Promise<Subscription> {
    try {
      const response = await this.makeRequest(`/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        body: JSON.stringify({
          price_id: updates.priceId,
          quantity: updates.quantity,
          metadata: updates.metadata,
        }),
      });

      return {
        id: response.id,
        customerId: response.customer_id,
        status: response.status,
        currentPeriodStart: new Date(response.current_period_start),
        currentPeriodEnd: new Date(response.current_period_end),
        metadata: response.metadata,
      };
    } catch (error) {
      throw error instanceof PaymentError ? error : new PaymentError('Failed to update subscription', 'SUBSCRIPTION_UPDATE_FAILED');
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const response = await this.makeRequest(`/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
      });

      return {
        id: response.id,
        customerId: response.customer_id,
        status: response.status,
        currentPeriodStart: new Date(response.current_period_start),
        currentPeriodEnd: new Date(response.current_period_end),
        metadata: response.metadata,
      };
    } catch (error) {
      throw error instanceof PaymentError ? error : new PaymentError('Failed to cancel subscription', 'SUBSCRIPTION_CANCEL_FAILED');
    }
  }

  async validateWebhook(payload: string, signature: string): Promise<WebhookEvent> {
    try {
      // Creem.io webhook 验证逻辑
      // 这里需要根据 Creem.io 的实际 webhook 验证方式实现
      const crypto = await import('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex');

      if (signature !== expectedSignature) {
        throw new PaymentError('Invalid webhook signature', 'WEBHOOK_VALIDATION_FAILED');
      }

      const event = JSON.parse(payload);
      return {
        id: event.id,
        type: event.type,
        data: event.data,
        created: new Date(event.created_at),
        provider: this.name,
      };
    } catch (error) {
      throw error instanceof PaymentError ? error : new PaymentError('Webhook validation failed', 'WEBHOOK_VALIDATION_FAILED');
    }
  }

  async processWebhook(event: WebhookEvent): Promise<WebhookResult> {
    try {
      switch (event.type) {
        case 'payment.succeeded':
          console.log('Creem payment succeeded:', event.data);
          break;
        
        case 'payment.failed':
          console.log('Creem payment failed:', event.data);
          break;
        
        case 'subscription.created':
          console.log('Creem subscription created:', event.data);
          break;
        
        case 'subscription.updated':
          console.log('Creem subscription updated:', event.data);
          break;
        
        case 'subscription.canceled':
          console.log('Creem subscription canceled:', event.data);
          break;
        
        default:
          console.log('Unhandled Creem event type:', event.type);
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

  private mapCreemStatus(status: string): any {
    // 将 Creem.io 的状态映射到统一的支付状态
    const statusMap: Record<string, string> = {
      'requires_payment_method': 'requires_payment_method',
      'requires_confirmation': 'requires_confirmation',
      'requires_action': 'requires_action',
      'processing': 'processing',
      'succeeded': 'succeeded',
      'canceled': 'canceled',
      'failed': 'failed',
    };
    
    return statusMap[status] || status;
  }
}