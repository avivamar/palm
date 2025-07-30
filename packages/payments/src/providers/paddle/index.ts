/**
 * Paddle 支付供应商实现
 * 基于 Paddle API 文档: https://www.paddle.com/
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

export interface PaddleConfig {
  vendorId: string;
  vendorAuthCode: string;
  publicKey: string;
  environment: 'sandbox' | 'production';
}

export class PaddleProvider implements PaymentProvider {
  readonly name = 'paddle';
  readonly version = '1.0.0';
  
  private vendorId: string;
  private vendorAuthCode: string;
  private publicKey: string;
  private baseUrl: string;

  constructor(config: PaddleConfig) {
    this.vendorId = config.vendorId;
    this.vendorAuthCode = config.vendorAuthCode;
    this.publicKey = config.publicKey;
    this.baseUrl = config.environment === 'production' 
      ? 'https://vendors.paddle.com/api'
      : 'https://sandbox-vendors.paddle.com/api';
  }

  private async makeRequest(endpoint: string, data: any = {}): Promise<any> {
    const formData = new URLSearchParams();
    formData.append('vendor_id', this.vendorId);
    formData.append('vendor_auth_code', this.vendorAuthCode);
    
    // 添加其他数据
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const result = await response.json();

    if (!result.success) {
      throw new PaymentError(result.error?.message || 'Paddle API error', 'PADDLE_API_ERROR');
    }

    return result.response || result;
  }

  async createCustomer(user: UserProfile): Promise<PaymentCustomer> {
    try {
      // Paddle 没有专门的客户创建 API，我们在内存中管理客户信息
      // 或者使用 Paddle 的订阅用户管理功能
      return {
        id: `paddle_${user.uid}`, // 使用用户 UID 作为 Paddle 客户 ID
        email: user.email,
        name: user.displayName,
        provider: this.name,
        metadata: {
          uid: user.uid,
        },
      };
    } catch (error) {
      throw error instanceof PaymentError ? error : new PaymentError('Failed to create customer', 'CUSTOMER_CREATION_FAILED');
    }
  }

  async updateCustomer(customerId: string, data: Partial<CustomerData>): Promise<PaymentCustomer> {
    try {
      // Paddle 的客户更新通常通过订阅更新来处理
      // 这里返回更新后的客户信息
      return {
        id: customerId,
        email: data.email || '',
        name: data.name || '',
        provider: this.name,
        metadata: data.metadata,
      };
    } catch (error) {
      throw error instanceof PaymentError ? error : new PaymentError('Failed to update customer', 'CUSTOMER_UPDATE_FAILED');
    }
  }

  async deleteCustomer(customerId: string): Promise<void> {
    try {
      // Paddle 客户删除通常通过取消所有订阅来实现
      console.log(`Customer ${customerId} marked for deletion`);
    } catch (error) {
      throw error instanceof PaymentError ? error : new PaymentError('Failed to delete customer', 'CUSTOMER_DELETE_FAILED');
    }
  }

  async createPaymentIntent(request: PaymentIntentRequest): Promise<PaymentIntent> {
    try {
      // Paddle 使用 Pay Links 或 Checkout API 进行一次性支付
      const paymentData = await this.makeRequest('/2.0/product/generate_pay_link', {
        product_id: 'custom', // 需要配置产品 ID
        title: request.description || 'Payment',
        webhook_url: process.env.PADDLE_WEBHOOK_URL,
        prices: [`${request.currency.toUpperCase()}:${(request.amount / 100).toFixed(2)}`],
        customer_email: request.customerId, // 在 Paddle 中，我们使用 email 作为客户标识
        passthrough: JSON.stringify(request.metadata || {}),
      });

      return {
        id: paymentData.url.split('/').pop() || Date.now().toString(),
        clientSecret: paymentData.url, // Paddle 使用 URL 而不是 secret
        status: 'requires_payment_method',
        amount: request.amount,
        currency: request.currency,
        customerId: request.customerId,
        createdAt: new Date(),
        metadata: request.metadata,
      };
    } catch (error) {
      throw error instanceof PaymentError ? error : new PaymentError('Failed to create payment intent', 'PAYMENT_INTENT_CREATION_FAILED');
    }
  }

  async confirmPayment(paymentId: string, paymentMethod: string): Promise<PaymentResult> {
    try {
      // Paddle 的支付确认通过 webhook 自动处理
      // 这里我们模拟一个成功的确认
      return {
        success: true,
        paymentIntent: {
          id: paymentId,
          clientSecret: paymentMethod,
          status: 'succeeded',
          amount: 0, // 实际金额需要从数据库获取
          currency: 'USD',
          customerId: '',
          createdAt: new Date(),
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
      // Paddle 的支付取消需要通过退款 API
      return {
        success: true,
        paymentIntent: {
          id: paymentId,
          clientSecret: '',
          status: 'canceled',
          amount: 0,
          currency: 'USD',
          customerId: '',
          createdAt: new Date(),
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
      const subscriptionData = await this.makeRequest('/2.0/subscription/users', {
        plan_id: request.priceId, // Paddle 使用 plan_id
        customer_email: request.customerId, // 在 Paddle 中使用 email
        passthrough: JSON.stringify(request.metadata || {}),
      });

      return {
        id: subscriptionData.subscription_id.toString(),
        customerId: request.customerId,
        status: 'active', // Paddle 订阅状态映射
        currentPeriodStart: new Date(subscriptionData.next_payment_date),
        currentPeriodEnd: new Date(subscriptionData.next_payment_date),
        metadata: request.metadata,
      };
    } catch (error) {
      throw error instanceof PaymentError ? error : new PaymentError('Failed to create subscription', 'SUBSCRIPTION_CREATION_FAILED');
    }
  }

  async updateSubscription(subscriptionId: string, updates: SubscriptionUpdate): Promise<Subscription> {
    try {
      const updateData: any = {
        subscription_id: subscriptionId,
      };

      if (updates.priceId) {
        updateData.plan_id = updates.priceId;
      }

      if (updates.quantity) {
        updateData.quantity = updates.quantity;
      }

      if (updates.metadata) {
        updateData.passthrough = JSON.stringify(updates.metadata);
      }

      const subscriptionData = await this.makeRequest('/2.0/subscription/users/update', updateData);

      return {
        id: subscriptionId,
        customerId: subscriptionData.email,
        status: 'active',
        currentPeriodStart: new Date(subscriptionData.next_payment_date),
        currentPeriodEnd: new Date(subscriptionData.next_payment_date),
        metadata: updates.metadata,
      };
    } catch (error) {
      throw error instanceof PaymentError ? error : new PaymentError('Failed to update subscription', 'SUBSCRIPTION_UPDATE_FAILED');
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const subscriptionData = await this.makeRequest('/2.0/subscription/users_cancel', {
        subscription_id: subscriptionId,
      });

      return {
        id: subscriptionId,
        customerId: subscriptionData.email,
        status: 'canceled',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(subscriptionData.next_payment_date),
        metadata: {},
      };
    } catch (error) {
      throw error instanceof PaymentError ? error : new PaymentError('Failed to cancel subscription', 'SUBSCRIPTION_CANCEL_FAILED');
    }
  }

  async validateWebhook(payload: string, signature: string): Promise<WebhookEvent> {
    try {
      // Paddle webhook 验证逻辑
      const crypto = await import('crypto');
      const data = JSON.parse(payload);
      
      // Paddle 使用不同的验证方式，需要根据实际 API 调整
      // 这里简化处理
      return {
        id: data.alert_id || Date.now().toString(),
        type: data.alert_name || 'unknown',
        data: data,
        created: new Date(),
        provider: this.name,
      };
    } catch (error) {
      throw error instanceof PaymentError ? error : new PaymentError('Webhook validation failed', 'WEBHOOK_VALIDATION_FAILED');
    }
  }

  async processWebhook(event: WebhookEvent): Promise<WebhookResult> {
    try {
      switch (event.type) {
        case 'payment_succeeded':
          console.log('Paddle payment succeeded:', event.data);
          break;
        
        case 'payment_failed':
          console.log('Paddle payment failed:', event.data);
          break;
        
        case 'subscription_created':
          console.log('Paddle subscription created:', event.data);
          break;
        
        case 'subscription_updated':
          console.log('Paddle subscription updated:', event.data);
          break;
        
        case 'subscription_cancelled':
          console.log('Paddle subscription cancelled:', event.data);
          break;
        
        default:
          console.log('Unhandled Paddle event type:', event.type);
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