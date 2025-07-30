/**
 * 多支付供应商环境变量验证工具
 */

import { z } from 'zod';

// 单个供应商配置验证
const StripeConfigSchema = z.object({
  publishableKey: z.string().startsWith('pk_'),
  secretKey: z.string().startsWith('sk_'),
  webhookSecret: z.string().startsWith('whsec_'),
  apiVersion: z.string().default('2025-06-30.basil'),
});

const CreemConfigSchema = z.object({
  apiKey: z.string().startsWith('ck_'),
  publicKey: z.string().startsWith('pk_'),
  webhookSecret: z.string().startsWith('whsec_'),
  environment: z.enum(['sandbox', 'production']).default('sandbox'),
});

const PaddleConfigSchema = z.object({
  vendorId: z.string().regex(/^\d+$/, 'Vendor ID must be numeric'),
  vendorAuthCode: z.string().min(32, 'Vendor auth code too short'),
  publicKey: z.string().startsWith('pk_'),
  environment: z.enum(['sandbox', 'production']).default('sandbox'),
});

const BraintreeConfigSchema = z.object({
  merchantId: z.string().min(1, 'Merchant ID required'),
  publicKey: z.string().min(1, 'Public key required'),
  privateKey: z.string().min(1, 'Private key required'),
  environment: z.enum(['sandbox', 'production']).default('sandbox'),
});

// 完整环境变量schema
const PaymentEnvSchema = z.object({
  // Stripe (必需)
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),

  // Creem.io (可选)
  CREEM_API_KEY: z.string().startsWith('ck_').optional(),
  CREEM_PUBLIC_KEY: z.string().startsWith('pk_').optional(),
  CREEM_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional(),
  CREEM_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),

  // Paddle (可选)
  PADDLE_VENDOR_ID: z.string().regex(/^\d+$/).optional(),
  PADDLE_VENDOR_AUTH_CODE: z.string().min(32).optional(),
  PADDLE_PUBLIC_KEY: z.string().startsWith('pk_').optional(),
  PADDLE_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),

  // Braintree (可选)
  BRAINTREE_MERCHANT_ID: z.string().optional(),
  BRAINTREE_PUBLIC_KEY: z.string().optional(),
  BRAINTREE_PRIVATE_KEY: z.string().optional(),
  BRAINTREE_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),

  // 全局配置
  DEFAULT_PAYMENT_PROVIDER: z.enum(['stripe', 'creem', 'paddle', 'braintree']).default('stripe'),
  ENABLE_SMART_ROUTING: z.string().transform(val => val === 'true').default('false'),
  HIGH_AMOUNT_THRESHOLD: z.string().transform(val => parseInt(val, 10)).default('10000'),
  EU_CURRENCIES: z.string().default('EUR,GBP,CHF,NOK,SEK,DKK'),
  PAYMENT_DEBUG_MODE: z.string().transform(val => val === 'true').default('false'),
});

export type PaymentEnvConfig = z.infer<typeof PaymentEnvSchema>;

/**
 * 验证环境变量配置
 */
export function validateEnvConfig(): {
  config: PaymentEnvConfig;
  availableProviders: string[];
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  try {
    const config = PaymentEnvSchema.parse(process.env);
    
    // 检查可用的供应商
    const availableProviders: string[] = ['stripe']; // Stripe 总是可用
    
    // 检查 Creem.io 配置
    if (config.CREEM_API_KEY && config.CREEM_PUBLIC_KEY && config.CREEM_WEBHOOK_SECRET) {
      try {
        CreemConfigSchema.parse({
          apiKey: config.CREEM_API_KEY,
          publicKey: config.CREEM_PUBLIC_KEY,
          webhookSecret: config.CREEM_WEBHOOK_SECRET,
          environment: config.CREEM_ENVIRONMENT,
        });
        availableProviders.push('creem');
      } catch (error) {
        warnings.push('Creem.io configuration incomplete or invalid');
      }
    } else if (config.CREEM_API_KEY || config.CREEM_PUBLIC_KEY || config.CREEM_WEBHOOK_SECRET) {
      warnings.push('Partial Creem.io configuration detected. All keys required: CREEM_API_KEY, CREEM_PUBLIC_KEY, CREEM_WEBHOOK_SECRET');
    }
    
    // 检查 Paddle 配置
    if (config.PADDLE_VENDOR_ID && config.PADDLE_VENDOR_AUTH_CODE && config.PADDLE_PUBLIC_KEY) {
      try {
        PaddleConfigSchema.parse({
          vendorId: config.PADDLE_VENDOR_ID,
          vendorAuthCode: config.PADDLE_VENDOR_AUTH_CODE,
          publicKey: config.PADDLE_PUBLIC_KEY,
          environment: config.PADDLE_ENVIRONMENT,
        });
        availableProviders.push('paddle');
      } catch (error) {
        warnings.push('Paddle configuration incomplete or invalid');
      }
    } else if (config.PADDLE_VENDOR_ID || config.PADDLE_VENDOR_AUTH_CODE || config.PADDLE_PUBLIC_KEY) {
      warnings.push('Partial Paddle configuration detected. All keys required: PADDLE_VENDOR_ID, PADDLE_VENDOR_AUTH_CODE, PADDLE_PUBLIC_KEY');
    }
    
    // 检查 Braintree 配置
    if (config.BRAINTREE_MERCHANT_ID && config.BRAINTREE_PUBLIC_KEY && config.BRAINTREE_PRIVATE_KEY) {
      try {
        BraintreeConfigSchema.parse({
          merchantId: config.BRAINTREE_MERCHANT_ID,
          publicKey: config.BRAINTREE_PUBLIC_KEY,
          privateKey: config.BRAINTREE_PRIVATE_KEY,
          environment: config.BRAINTREE_ENVIRONMENT,
        });
        availableProviders.push('braintree');
      } catch (error) {
        warnings.push('Braintree configuration incomplete or invalid');
      }
    } else if (config.BRAINTREE_MERCHANT_ID || config.BRAINTREE_PUBLIC_KEY || config.BRAINTREE_PRIVATE_KEY) {
      warnings.push('Partial Braintree configuration detected. All keys required: BRAINTREE_MERCHANT_ID, BRAINTREE_PUBLIC_KEY, BRAINTREE_PRIVATE_KEY');
    }
    
    // 检查默认供应商是否可用
    if (!availableProviders.includes(config.DEFAULT_PAYMENT_PROVIDER)) {
      warnings.push(`Default provider '${config.DEFAULT_PAYMENT_PROVIDER}' is not configured. Falling back to 'stripe'.`);
      config.DEFAULT_PAYMENT_PROVIDER = 'stripe';
    }
    
    // 生产环境检查
    if (process.env.NODE_ENV === 'production') {
      if (config.CREEM_ENVIRONMENT === 'sandbox') {
        warnings.push('Creem.io is in sandbox mode in production environment');
      }
      if (config.PADDLE_ENVIRONMENT === 'sandbox') {
        warnings.push('Paddle is in sandbox mode in production environment');
      }
      if (config.BRAINTREE_ENVIRONMENT === 'sandbox') {
        warnings.push('Braintree is in sandbox mode in production environment');
      }
    }

    return {
      config,
      availableProviders,
      warnings,
      errors,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
    } else {
      errors.push('Unknown configuration error');
    }
    
    throw new Error(`Payment configuration validation failed: ${errors.join(', ')}`);
  }
}

/**
 * 获取供应商特定配置
 */
export function getProviderConfig(provider: string, envConfig: PaymentEnvConfig) {
  switch (provider) {
    case 'stripe':
      return {
        publishableKey: envConfig.STRIPE_PUBLISHABLE_KEY,
        secretKey: envConfig.STRIPE_SECRET_KEY,
        webhookSecret: envConfig.STRIPE_WEBHOOK_SECRET,
        apiVersion: '2025-06-30.basil',
      };
      
    case 'creem':
      if (!envConfig.CREEM_API_KEY || !envConfig.CREEM_PUBLIC_KEY || !envConfig.CREEM_WEBHOOK_SECRET) {
        throw new Error('Creem.io configuration incomplete');
      }
      return {
        apiKey: envConfig.CREEM_API_KEY,
        publicKey: envConfig.CREEM_PUBLIC_KEY,
        webhookSecret: envConfig.CREEM_WEBHOOK_SECRET,
        environment: envConfig.CREEM_ENVIRONMENT,
      };
      
    case 'paddle':
      if (!envConfig.PADDLE_VENDOR_ID || !envConfig.PADDLE_VENDOR_AUTH_CODE || !envConfig.PADDLE_PUBLIC_KEY) {
        throw new Error('Paddle configuration incomplete');
      }
      return {
        vendorId: envConfig.PADDLE_VENDOR_ID,
        vendorAuthCode: envConfig.PADDLE_VENDOR_AUTH_CODE,
        publicKey: envConfig.PADDLE_PUBLIC_KEY,
        environment: envConfig.PADDLE_ENVIRONMENT,
      };
      
    case 'braintree':
      if (!envConfig.BRAINTREE_MERCHANT_ID || !envConfig.BRAINTREE_PUBLIC_KEY || !envConfig.BRAINTREE_PRIVATE_KEY) {
        throw new Error('Braintree configuration incomplete');
      }
      return {
        merchantId: envConfig.BRAINTREE_MERCHANT_ID,
        publicKey: envConfig.BRAINTREE_PUBLIC_KEY,
        privateKey: envConfig.BRAINTREE_PRIVATE_KEY,
        environment: envConfig.BRAINTREE_ENVIRONMENT,
      };
      
    default:
      throw new Error(`Unknown payment provider: ${provider}`);
  }
}

/**
 * 打印配置报告
 */
export function printConfigReport() {
  const { config, availableProviders, warnings, errors } = validateEnvConfig();
  
  console.log('\n🎯 Payment Providers Configuration Report');
  console.log('=' .repeat(50));
  
  console.log(`\n✅ Available Providers: ${availableProviders.join(', ')}`);
  console.log(`🎯 Default Provider: ${config.DEFAULT_PAYMENT_PROVIDER}`);
  console.log(`🧠 Smart Routing: ${config.ENABLE_SMART_ROUTING ? 'Enabled' : 'Disabled'}`);
  console.log(`💰 High Amount Threshold: $${config.HIGH_AMOUNT_THRESHOLD / 100}`);
  console.log(`🌍 EU Currencies: ${config.EU_CURRENCIES}`);
  console.log(`🐛 Debug Mode: ${config.PAYMENT_DEBUG_MODE ? 'Enabled' : 'Disabled'}`);
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(warning => console.log(`   ${warning}`));
  }
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(error => console.log(`   ${error}`));
  }
  
  console.log('\n' + '=' .repeat(50));
}