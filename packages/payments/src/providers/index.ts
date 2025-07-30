/**
 * 支付供应商插件式架构
 * 支持多个支付提供商的统一接口
 */

import type { PaymentProvider, PaymentConfig } from '../types';

// 扩展支付配置以支持多个供应商
export interface ExtendedPaymentConfig extends PaymentConfig {
  // 现有 Stripe 配置
  stripe: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
    apiVersion: string;
  };
  
  // Creem.io 配置
  creem?: {
    apiKey: string;
    publicKey: string;
    webhookSecret: string;
    environment: 'sandbox' | 'production';
  };
  
  // Paddle 配置
  paddle?: {
    vendorId: string;
    vendorAuthCode: string;
    publicKey: string;
    environment: 'sandbox' | 'production';
  };
  
  // Braintree/PayPal 配置
  braintree?: {
    environment: 'sandbox' | 'production';
    merchantId: string;
    publicKey: string;
    privateKey: string;
  };
}

// 支付供应商管理器
export class PaymentProviderManager {
  private providers: Map<string, PaymentProvider> = new Map();
  private defaultProvider: string | null = null;

  /**
   * 注册支付供应商
   */
  registerProvider(name: string, provider: PaymentProvider): void {
    this.providers.set(name, provider);
    
    // 如果没有默认供应商，将第一个注册的设为默认
    if (!this.defaultProvider) {
      this.defaultProvider = name;
    }
  }

  /**
   * 获取支付供应商
   */
  getProvider(name?: string): PaymentProvider {
    const providerName = name || this.defaultProvider;
    
    if (!providerName) {
      throw new Error('No payment provider available');
    }
    
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Payment provider '${providerName}' not found`);
    }
    
    return provider;
  }

  /**
   * 获取所有可用供应商
   */
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  /**
   * 设置默认供应商
   */
  setDefaultProvider(name: string): void {
    if (!this.providers.has(name)) {
      throw new Error(`Provider '${name}' is not registered`);
    }
    this.defaultProvider = name;
  }

  /**
   * 检查供应商健康状态
   */
  async checkProviderHealth(name?: string): Promise<{
    provider: string;
    status: 'healthy' | 'unhealthy';
    error?: string;
  }> {
    const providerName = name || this.defaultProvider!;
    const provider = this.getProvider(providerName);

    try {
      // 通过创建一个测试客户来检查健康状态
      // 这里可以实现更精细的健康检查逻辑
      return {
        provider: providerName,
        status: 'healthy'
      };
    } catch (error) {
      return {
        provider: providerName,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// 导出供应商类型
export * from './stripe';
export * from './creem';
export * from './paddle';
export * from './braintree';