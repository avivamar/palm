/**
 * 支付服务工厂 - 自动配置多供应商
 */

import { PaymentService, PaymentServiceConfig } from './PaymentService';
import { validateEnvConfig, getProviderConfig, printConfigReport } from '../utils/env-validation';
import type { ExtendedPaymentConfig } from '../providers';

export class PaymentServiceFactory {
  private static instance: PaymentService | null = null;

  /**
   * 获取支付服务单例实例
   */
  static getInstance(options?: {
    forceRecreate?: boolean;
    debugMode?: boolean;
    customConfig?: Partial<PaymentServiceConfig>;
  }): PaymentService {
    const { forceRecreate = false, debugMode = false, customConfig } = options || {};

    if (!this.instance || forceRecreate) {
      if (debugMode) {
        printConfigReport();
      }

      const config = this.createConfiguration(customConfig);
      this.instance = new PaymentService(config);
      
      if (debugMode) {
        console.log('\n✅ PaymentService initialized with providers:', 
          this.instance.getAvailableProviders().join(', '));
      }
    }

    return this.instance;
  }

  /**
   * 创建配置对象
   */
  private static createConfiguration(customConfig?: Partial<PaymentServiceConfig>): PaymentServiceConfig {
    const { config: envConfig, availableProviders } = validateEnvConfig();
    
    const providers: ExtendedPaymentConfig = {} as ExtendedPaymentConfig;

    // 配置 Stripe (总是可用)
    providers.stripe = getProviderConfig('stripe', envConfig);

    // 配置其他供应商 (如果可用)
    if (availableProviders.includes('creem')) {
      providers.creem = getProviderConfig('creem', envConfig);
    }

    if (availableProviders.includes('paddle')) {
      providers.paddle = getProviderConfig('paddle', envConfig);
    }

    if (availableProviders.includes('braintree')) {
      providers.braintree = getProviderConfig('braintree', envConfig);
    }

    const defaultConfig: PaymentServiceConfig = {
      providers,
      defaultProvider: envConfig.DEFAULT_PAYMENT_PROVIDER,
    };

    // 合并自定义配置
    return {
      ...defaultConfig,
      ...customConfig,
      providers: {
        ...defaultConfig.providers,
        ...customConfig?.providers,
      },
    };
  }

  /**
   * 创建测试用配置
   */
  static createTestInstance(testProviders: Partial<ExtendedPaymentConfig>): PaymentService {
    const config: PaymentServiceConfig = {
      providers: testProviders as ExtendedPaymentConfig,
      defaultProvider: Object.keys(testProviders)[0] as any,
    };

    return new PaymentService(config);
  }

  /**
   * 重置单例实例（主要用于测试）
   */
  static reset(): void {
    this.instance = null;
  }

  /**
   * 检查配置状态
   */
  static checkConfiguration(): {
    isValid: boolean;
    availableProviders: string[];
    warnings: string[];
    errors: string[];
  } {
    try {
      const { availableProviders, warnings, errors } = validateEnvConfig();
      
      return {
        isValid: errors.length === 0,
        availableProviders,
        warnings,
        errors,
      };
    } catch (error) {
      return {
        isValid: false,
        availableProviders: [],
        warnings: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }
}

/**
 * 便捷函数：获取默认支付服务实例
 */
export function getPaymentService(options?: {
  forceRecreate?: boolean;
  debugMode?: boolean;
}): PaymentService {
  return PaymentServiceFactory.getInstance(options);
}

/**
 * 便捷函数：创建开发环境实例（带调试信息）
 */
export function getDevPaymentService(): PaymentService {
  return PaymentServiceFactory.getInstance({
    debugMode: true,
    forceRecreate: process.env.NODE_ENV === 'development',
  });
}

/**
 * 便捷函数：检查支付配置健康状态
 */
export async function checkPaymentHealth(): Promise<{
  configStatus: ReturnType<typeof PaymentServiceFactory.checkConfiguration>;
  providerHealth: Array<{
    provider: string;
    status: 'healthy' | 'unhealthy';
    error?: string;
  }>;
}> {
  const configStatus = PaymentServiceFactory.checkConfiguration();
  
  if (!configStatus.isValid) {
    return {
      configStatus,
      providerHealth: [],
    };
  }

  try {
    const paymentService = getPaymentService();
    const providerHealth = await paymentService.checkAllProvidersHealth();
    
    return {
      configStatus,
      providerHealth,
    };
  } catch (error) {
    return {
      configStatus: {
        ...configStatus,
        errors: [...configStatus.errors, error instanceof Error ? error.message : 'Service initialization failed'],
      },
      providerHealth: [],
    };
  }
}