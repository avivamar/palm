/**
 * Braintree/PayPal 支付供应商实现
 * 基于 Braintree API 文档
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

export interface BraintreeConfig {
  environment: 'sandbox' | 'production';
  merchantId: string;
  publicKey: string;
  privateKey: string;
}

export class BraintreeProvider implements PaymentProvider {
  readonly name = 'braintree';
  readonly version = '1.0.0';
  
  private environment: string;
  private merchantId: string;
  private publicKey: string;
  private privateKey: string;
  private gateway: any; // Braintree gateway instance

  constructor(config: BraintreeConfig) {
    this.environment = config.environment;
    this.merchantId = config.merchantId;
    this.publicKey = config.publicKey;
    this.privateKey = config.privateKey;
    
    // 初始化 Braintree gateway (需要安装 braintree 包)
    this.initializeGateway();
  }

  private async initializeGateway() {
    try {
      // 动态导入 braintree，避免打包时的依赖问题
      const braintree = await import('braintree');
      
      this.gateway = new braintree.BraintreeGateway({
        environment: this.environment === 'production' 
          ? braintree.Environment.Production 
          : braintree.Environment.Sandbox,
        merchantId: this.merchantId,
        publicKey: this.publicKey,
        privateKey: this.privateKey,
      });
    } catch (error) {
      console.warn('Braintree package not installed. Install with: npm install braintree');
      throw new PaymentError('Braintree gateway initialization failed', 'BRAINTREE_INIT_FAILED');
    }
  }

  async createCustomer(user: UserProfile): Promise<PaymentCustomer> {
    try {
      const result = await this.gateway.customer.create({
        id: user.uid, // 使用用户 UID 作为客户 ID
        email: user.email,
        firstName: user.displayName.split(' ')[0] || '',
        lastName: user.displayName.split(' ').slice(1).join(' ') || '',
      });

      if (!result.success) {
        throw new PaymentError(result.message, 'BRAINTREE_CUSTOMER_CREATION_FAILED');
      }

      return {
        id: result.customer.id,
        email: result.customer.email,
        name: `${result.customer.firstName} ${result.customer.lastName}`.trim(),
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
      const updateData: any = {};
      
      if (data.email) updateData.email = data.email;
      if (data.name) {
        const nameParts = data.name.split(' ');
        updateData.firstName = nameParts[0] || '';
        updateData.lastName = nameParts.slice(1).join(' ') || '';
      }

      const result = await this.gateway.customer.update(customerId, updateData);

      if (!result.success) {
        throw new PaymentError(result.message, 'BRAINTREE_CUSTOMER_UPDATE_FAILED');
      }

      return {
        id: result.customer.id,
        email: result.customer.email,
        name: `${result.customer.firstName} ${result.customer.lastName}`.trim(),
        provider: this.name,
        metadata: data.metadata,
      };
    } catch (error) {
      throw error instanceof PaymentError ? error : new PaymentError('Failed to update customer', 'CUSTOMER_UPDATE_FAILED');
    }
  }

  async deleteCustomer(customerId: string): Promise<void> {
    try {
      const result = await this.gateway.customer.delete(customerId);
      
      if (!result.success) {
        throw new PaymentError(result.message, 'BRAINTREE_CUSTOMER_DELETE_FAILED');
      }
    } catch (error) {
      throw error instanceof PaymentError ? error : new PaymentError('Failed to delete customer', 'CUSTOMER_DELETE_FAILED');
    }
  }

  async createPaymentIntent(request: PaymentIntentRequest): Promise<PaymentIntent> {
    try {
      // 在 Braintree 中，我们首先生成客户端 token
      const clientTokenResult = await this.gateway.clientToken.generate({
        customerId: request.customerId,
      });

      if (!clientTokenResult.success) {
        throw new PaymentError('Failed to generate client token', 'BRAINTREE_TOKEN_GENERATION_FAILED');
      }

      // Braintree 使用不同的流程，这里我们创建一个待处理的交易记录
      const transactionId = `bt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        id: transactionId,
        clientSecret: clientTokenResult.clientToken, // Braintree 使用 client token
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
      // 在 Braintree 中，确认支付实际上是执行交易
      const result = await this.gateway.transaction.sale({
        amount: '0.00', // 实际金额需要从之前的 payment intent 获取
        paymentMethodNonce: paymentMethod, // Braintree 使用 nonce
        options: {
          submitForSettlement: true,
        },
      });

      if (!result.success) {
        return {
          success: false,
          error: result.message || 'Transaction failed',
        };
      }

      return {
        success: result.transaction.status === 'submitted_for_settlement' || result.transaction.status === 'settled',
        paymentIntent: {
          id: result.transaction.id,
          clientSecret: '',
          status: this.mapBraintreeStatus(result.transaction.status),
          amount: Math.round(parseFloat(result.transaction.amount) * 100), // 转换为分
          currency: result.transaction.currencyIsoCode,
          customerId: result.transaction.customer.id,
          createdAt: new Date(result.transaction.createdAt),
          metadata: {},
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
      // Braintree 中取消支付通常是 void 未结算的交易
      const result = await this.gateway.transaction.void(paymentId);

      if (!result.success) {
        return {
          success: false,
          error: result.message || 'Transaction void failed',
        };
      }

      return {
        success: result.transaction.status === 'voided',
        paymentIntent: {
          id: result.transaction.id,
          clientSecret: '',
          status: 'canceled',
          amount: Math.round(parseFloat(result.transaction.amount) * 100),
          currency: result.transaction.currencyIsoCode,
          customerId: result.transaction.customer?.id || '',
          createdAt: new Date(result.transaction.createdAt),
          metadata: {},
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
      const result = await this.gateway.subscription.create({
        paymentMethodToken: request.customerId, // 需要先创建支付方法
        planId: request.priceId, // Braintree 使用 plan ID
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      });

      if (!result.success) {
        throw new PaymentError(result.message, 'BRAINTREE_SUBSCRIPTION_CREATION_FAILED');
      }

      return {
        id: result.subscription.id,
        customerId: request.customerId,
        status: this.mapBraintreeSubscriptionStatus(result.subscription.status),
        currentPeriodStart: new Date(result.subscription.billingPeriodStartDate),
        currentPeriodEnd: new Date(result.subscription.billingPeriodEndDate),
        metadata: request.metadata,
      };
    } catch (error) {
      throw error instanceof PaymentError ? error : new PaymentError('Failed to create subscription', 'SUBSCRIPTION_CREATION_FAILED');
    }
  }

  async updateSubscription(subscriptionId: string, updates: SubscriptionUpdate): Promise<Subscription> {
    try {
      const updateData: any = {};
      
      if (updates.priceId) {
        updateData.planId = updates.priceId;
      }

      const result = await this.gateway.subscription.update(subscriptionId, updateData);

      if (!result.success) {
        throw new PaymentError(result.message, 'BRAINTREE_SUBSCRIPTION_UPDATE_FAILED');
      }

      return {
        id: result.subscription.id,
        customerId: '', // 需要从订阅信息中获取
        status: this.mapBraintreeSubscriptionStatus(result.subscription.status),
        currentPeriodStart: new Date(result.subscription.billingPeriodStartDate),
        currentPeriodEnd: new Date(result.subscription.billingPeriodEndDate),
        metadata: updates.metadata,
      };
    } catch (error) {
      throw error instanceof PaymentError ? error : new PaymentError('Failed to update subscription', 'SUBSCRIPTION_UPDATE_FAILED');
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const result = await this.gateway.subscription.cancel(subscriptionId);

      if (!result.success) {
        throw new PaymentError(result.message, 'BRAINTREE_SUBSCRIPTION_CANCEL_FAILED');
      }

      return {
        id: result.subscription.id,
        customerId: '',
        status: 'canceled',
        currentPeriodStart: new Date(result.subscription.billingPeriodStartDate),
        currentPeriodEnd: new Date(result.subscription.billingPeriodEndDate),
        metadata: {},
      };
    } catch (error) {
      throw error instanceof PaymentError ? error : new PaymentError('Failed to cancel subscription', 'SUBSCRIPTION_CANCEL_FAILED');
    }
  }

  async validateWebhook(payload: string, signature: string): Promise<WebhookEvent> {
    try {
      // Braintree webhook 验证
      const webhookNotification = this.gateway.webhookNotification.parse(signature, payload);

      return {
        id: webhookNotification.timestamp.toString(),
        type: webhookNotification.kind,
        data: webhookNotification,
        created: new Date(webhookNotification.timestamp),
        provider: this.name,
      };
    } catch (error) {
      throw error instanceof PaymentError ? error : new PaymentError('Webhook validation failed', 'WEBHOOK_VALIDATION_FAILED');
    }
  }

  async processWebhook(event: WebhookEvent): Promise<WebhookResult> {
    try {
      switch (event.type) {
        case 'transaction_settled':
          console.log('Braintree transaction settled:', event.data);
          break;
        
        case 'transaction_settlement_declined':
          console.log('Braintree transaction settlement declined:', event.data);
          break;
        
        case 'subscription_charged_successfully':
          console.log('Braintree subscription charged successfully:', event.data);
          break;
        
        case 'subscription_canceled':
          console.log('Braintree subscription canceled:', event.data);
          break;
        
        default:
          console.log('Unhandled Braintree event type:', event.type);
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

  private mapBraintreeStatus(status: string): any {
    const statusMap: Record<string, string> = {
      'authorized': 'requires_confirmation',
      'submitted_for_settlement': 'processing',
      'settling': 'processing',
      'settled': 'succeeded',
      'settlement_declined': 'failed',
      'failed': 'failed',
      'voided': 'canceled',
    };
    
    return statusMap[status] || status;
  }

  private mapBraintreeSubscriptionStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'Active': 'active',
      'Canceled': 'canceled',
      'Expired': 'canceled',
      'Past Due': 'past_due',
      'Pending': 'incomplete',
    };
    
    return statusMap[status] || status.toLowerCase();
  }
}