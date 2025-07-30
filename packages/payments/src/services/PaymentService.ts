/**
 * 统一支付服务
 * 提供多个支付供应商的统一接口
 */

import { PaymentProviderManager, ExtendedPaymentConfig } from '../providers';
import { StripeProvider } from '../providers/stripe';
import { CreemProvider } from '../providers/creem';
import { PaddleProvider } from '../providers/paddle';
import { BraintreeProvider } from '../providers/braintree';
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
} from '../types';

export interface PaymentServiceConfig {
  providers: ExtendedPaymentConfig;
  defaultProvider?: string;
}

export class PaymentService {
  private providerManager: PaymentProviderManager;

  constructor(config: PaymentServiceConfig) {
    this.providerManager = new PaymentProviderManager();
    this.initializeProviders(config);
  }

  private initializeProviders(config: PaymentServiceConfig): void {
    const { providers } = config;

    // 初始化 Stripe
    if (providers.stripe) {
      const stripeProvider = new StripeProvider(providers.stripe);
      this.providerManager.registerProvider('stripe', stripeProvider);
    }

    // 初始化 Creem.io
    if (providers.creem) {
      const creemProvider = new CreemProvider(providers.creem);
      this.providerManager.registerProvider('creem', creemProvider);
    }

    // 初始化 Paddle
    if (providers.paddle) {
      const paddleProvider = new PaddleProvider(providers.paddle);
      this.providerManager.registerProvider('paddle', paddleProvider);
    }

    // 初始化 Braintree
    if (providers.braintree) {
      const braintreeProvider = new BraintreeProvider(providers.braintree);
      this.providerManager.registerProvider('braintree', braintreeProvider);
    }

    // 设置默认供应商
    if (config.defaultProvider) {
      this.providerManager.setDefaultProvider(config.defaultProvider);
    }
  }

  /**
   * 获取可用的支付供应商列表
   */
  getAvailableProviders(): string[] {
    return this.providerManager.getAvailableProviders();
  }

  /**
   * 切换默认支付供应商
   */
  setDefaultProvider(providerName: string): void {
    this.providerManager.setDefaultProvider(providerName);
  }

  /**
   * 创建客户
   */
  async createCustomer(user: UserProfile, providerName?: string): Promise<PaymentCustomer> {
    const provider = this.providerManager.getProvider(providerName);
    return provider.createCustomer(user);
  }

  /**
   * 更新客户信息
   */
  async updateCustomer(
    customerId: string, 
    data: Partial<CustomerData>, 
    providerName?: string
  ): Promise<PaymentCustomer> {
    const provider = this.providerManager.getProvider(providerName);
    return provider.updateCustomer(customerId, data);
  }

  /**
   * 删除客户
   */
  async deleteCustomer(customerId: string, providerName?: string): Promise<void> {
    const provider = this.providerManager.getProvider(providerName);
    return provider.deleteCustomer(customerId);
  }

  /**
   * 创建支付意图
   */
  async createPaymentIntent(
    request: PaymentIntentRequest, 
    providerName?: string
  ): Promise<PaymentIntent> {
    const provider = this.providerManager.getProvider(providerName);
    return provider.createPaymentIntent(request);
  }

  /**
   * 确认支付
   */
  async confirmPayment(
    paymentId: string, 
    paymentMethod: string, 
    providerName?: string
  ): Promise<PaymentResult> {
    const provider = this.providerManager.getProvider(providerName);
    return provider.confirmPayment(paymentId, paymentMethod);
  }

  /**
   * 取消支付
   */
  async cancelPayment(paymentId: string, providerName?: string): Promise<PaymentResult> {
    const provider = this.providerManager.getProvider(providerName);
    return provider.cancelPayment(paymentId);
  }

  /**
   * 创建订阅
   */
  async createSubscription(
    request: SubscriptionRequest, 
    providerName?: string
  ): Promise<Subscription> {
    const provider = this.providerManager.getProvider(providerName);
    return provider.createSubscription(request);
  }

  /**
   * 更新订阅
   */
  async updateSubscription(
    subscriptionId: string, 
    updates: SubscriptionUpdate, 
    providerName?: string
  ): Promise<Subscription> {
    const provider = this.providerManager.getProvider(providerName);
    return provider.updateSubscription(subscriptionId, updates);
  }

  /**
   * 取消订阅
   */
  async cancelSubscription(subscriptionId: string, providerName?: string): Promise<Subscription> {
    const provider = this.providerManager.getProvider(providerName);
    return provider.cancelSubscription(subscriptionId);
  }

  /**
   * 验证 Webhook
   */
  async validateWebhook(
    payload: string, 
    signature: string, 
    providerName?: string
  ): Promise<WebhookEvent> {
    const provider = this.providerManager.getProvider(providerName);
    return provider.validateWebhook(payload, signature);
  }

  /**
   * 处理 Webhook
   */
  async processWebhook(event: WebhookEvent, providerName?: string): Promise<WebhookResult> {
    const provider = this.providerManager.getProvider(providerName);
    return provider.processWebhook(event);
  }

  /**
   * 检查供应商健康状态
   */
  async checkProviderHealth(providerName?: string): Promise<{
    provider: string;
    status: 'healthy' | 'unhealthy';
    error?: string;
  }> {
    return this.providerManager.checkProviderHealth(providerName);
  }

  /**
   * 检查所有供应商健康状态
   */
  async checkAllProvidersHealth(): Promise<Array<{
    provider: string;
    status: 'healthy' | 'unhealthy';
    error?: string;
  }>> {
    const providers = this.getAvailableProviders();
    const healthChecks = await Promise.all(
      providers.map(provider => this.checkProviderHealth(provider))
    );
    return healthChecks;
  }

  /**
   * 智能支付路由 - 根据条件选择最佳支付供应商
   */
  async smartPaymentRouting(request: PaymentIntentRequest, preferences?: {
    preferredProviders?: string[];
    excludeProviders?: string[];
    requireFeatures?: string[];
  }): Promise<{ provider: string; paymentIntent: PaymentIntent }> {
    const availableProviders = this.getAvailableProviders();
    
    // 过滤可用供应商
    let candidateProviders = availableProviders;
    
    if (preferences?.preferredProviders) {
      candidateProviders = candidateProviders.filter(p => 
        preferences.preferredProviders!.includes(p)
      );
    }
    
    if (preferences?.excludeProviders) {
      candidateProviders = candidateProviders.filter(p => 
        !preferences.excludeProviders!.includes(p)
      );
    }

    // 简单的路由逻辑，可以根据需要扩展
    let selectedProvider = candidateProviders[0];
    
    // 根据金额选择供应商（示例逻辑）
    if (request.amount > 100000) { // > $1000
      // 大额支付优先使用 Stripe 或 Braintree
      const preferredForHighAmount = candidateProviders.filter(p => 
        ['stripe', 'braintree'].includes(p)
      );
      if (preferredForHighAmount.length > 0) {
        selectedProvider = preferredForHighAmount[0];
      }
    }

    // 根据地区选择供应商（示例逻辑）
    if (request.currency === 'EUR') {
      // 欧洲地区优先使用 Paddle
      const paddleProvider = candidateProviders.find(p => p === 'paddle');
      if (paddleProvider) {
        selectedProvider = paddleProvider;
      }
    }

    try {
      const paymentIntent = await this.createPaymentIntent(request, selectedProvider);
      return {
        provider: selectedProvider,
        paymentIntent
      };
    } catch (error) {
      // 如果首选供应商失败，尝试下一个
      if (candidateProviders.length > 1) {
        const fallbackProvider = candidateProviders.find(p => p !== selectedProvider);
        if (fallbackProvider) {
          const paymentIntent = await this.createPaymentIntent(request, fallbackProvider);
          return {
            provider: fallbackProvider,
            paymentIntent
          };
        }
      }
      throw error;
    }
  }
}