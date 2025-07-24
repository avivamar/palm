// 统一支付服务

import type {
  CustomerData,
  PaymentCustomer,
  PaymentIntent,
  PaymentIntentRequest,
  PaymentProvider,
  PaymentResult,
  Subscription,
  SubscriptionRequest,
  SubscriptionUpdate,
  UserProfile,
  WebhookEvent,
  WebhookResult,
} from './payment-types';
import { StripePaymentProvider } from '../providers/stripe/stripe-provider';
import { PaymentError } from './payment-errors';

export class PaymentService {
  private providers: Map<string, PaymentProvider> = new Map();
  private defaultProvider: string = 'stripe';

  constructor() {
    // 注册默认的支付提供商
    this.registerProvider(new StripePaymentProvider());
  }

  /**
   * 注册支付提供商
   */
  registerProvider(provider: PaymentProvider): void {
    this.providers.set(provider.name, provider);
  }

  /**
   * 获取支付提供商
   */
  getProvider(name?: string): PaymentProvider {
    const providerName = name || this.defaultProvider;
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new PaymentError(
        `Payment provider '${providerName}' not found`,
        'PROVIDER_NOT_FOUND',
      );
    }

    return provider;
  }

  /**
   * 设置默认支付提供商
   */
  setDefaultProvider(name: string): void {
    if (!this.providers.has(name)) {
      throw new PaymentError(
        `Cannot set default provider '${name}': provider not registered`,
        'PROVIDER_NOT_FOUND',
      );
    }
    this.defaultProvider = name;
  }

  /**
   * 获取所有已注册的提供商
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  // 客户管理方法
  async createCustomer(user: UserProfile, provider?: string): Promise<PaymentCustomer> {
    return await this.getProvider(provider).createCustomer(user);
  }

  async updateCustomer(
    customerId: string,
    data: Partial<CustomerData>,
    provider?: string,
  ): Promise<PaymentCustomer> {
    return await this.getProvider(provider).updateCustomer(customerId, data);
  }

  async deleteCustomer(customerId: string, provider?: string): Promise<void> {
    return await this.getProvider(provider).deleteCustomer(customerId);
  }

  // 支付处理方法
  async createPaymentIntent(
    request: PaymentIntentRequest,
    provider?: string,
  ): Promise<PaymentIntent> {
    return await this.getProvider(provider).createPaymentIntent(request);
  }

  async confirmPayment(
    paymentId: string,
    paymentMethod: string,
    provider?: string,
  ): Promise<PaymentResult> {
    return await this.getProvider(provider).confirmPayment(paymentId, paymentMethod);
  }

  async cancelPayment(paymentId: string, provider?: string): Promise<PaymentResult> {
    return await this.getProvider(provider).cancelPayment(paymentId);
  }

  // 订阅管理方法
  async createSubscription(
    request: SubscriptionRequest,
    provider?: string,
  ): Promise<Subscription> {
    return await this.getProvider(provider).createSubscription(request);
  }

  async updateSubscription(
    subscriptionId: string,
    updates: SubscriptionUpdate,
    provider?: string,
  ): Promise<Subscription> {
    return await this.getProvider(provider).updateSubscription(subscriptionId, updates);
  }

  async cancelSubscription(subscriptionId: string, provider?: string): Promise<Subscription> {
    return await this.getProvider(provider).cancelSubscription(subscriptionId);
  }

  // Webhook处理方法
  async validateWebhook(
    payload: string,
    signature: string,
    provider: string,
  ): Promise<WebhookEvent> {
    return await this.getProvider(provider).validateWebhook(payload, signature);
  }

  async processWebhook(event: WebhookEvent): Promise<WebhookResult> {
    return await this.getProvider(event.provider).processWebhook(event);
  }
}

// 单例实例
export const paymentService = new PaymentService();
