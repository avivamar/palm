'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Stripe from 'stripe';
import { z } from 'zod';
import { isValidColorId } from '@/config/colors';
import { handleCheckoutError } from '@/libs/payments/error-handling';
import { initiatePreorder } from './preorderActions';

// Performance monitoring helpers
type PerformanceMetrics = {
  preorderDuration: number;
  stripeDuration: number;
  totalDuration: number;
  retryCount: number;
  success: boolean;
  errorType?: string;
};

class PerformanceTracker {
  private startTime: number;
  private checkpoints: Map<string, number> = new Map();

  constructor() {
    this.startTime = Date.now();
  }

  checkpoint(name: string): void {
    this.checkpoints.set(name, Date.now());
  }

  getDuration(from: string = 'start', to: string = 'now'): number {
    const fromTime = from === 'start' ? this.startTime : (this.checkpoints.get(from) || this.startTime);
    const toTime = to === 'now' ? Date.now() : (this.checkpoints.get(to) || Date.now());
    return toTime - fromTime;
  }

  getMetrics(): PerformanceMetrics {
    return {
      preorderDuration: this.getDuration('start', 'preorder_complete'),
      stripeDuration: this.getDuration('stripe_start', 'stripe_complete'),
      totalDuration: this.getDuration('start', 'now'),
      retryCount: 0,
      success: true,
    };
  }
}

// Smart retry configuration
type RetryConfig = {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
};

const RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 8000, // 8 seconds max
  backoffMultiplier: 2,
  retryableErrors: [
    'timeout',
    'network',
    'rate_limit_exceeded',
    'temporary_error',
    'connection_error',
  ],
};

// Smart retry with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = RETRY_CONFIG,
  operationName: string = 'operation',
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.warn(`[Retry] Attempt ${attempt + 1}/${config.maxRetries + 1} for ${operationName}`);
      }

      const result = await operation();

      if (attempt > 0) {
        console.warn(`[Retry] Success on attempt ${attempt + 1} for ${operationName}`);

        // Track retry success in analytics
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'retry_success', {
            operation_name: operationName,
            attempt_number: attempt + 1,
            total_attempts: config.maxRetries + 1,
          });
        }
      }

      return result;
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      const isRetryable = config.retryableErrors.some(retryableError =>
        lastError.message.toLowerCase().includes(retryableError.toLowerCase()),
      );

      if (!isRetryable || attempt === config.maxRetries) {
        console.error(`[Retry] Final failure for ${operationName} after ${attempt + 1} attempts:`, lastError);

        // Track retry failure in analytics
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'retry_failure', {
            operation_name: operationName,
            total_attempts: attempt + 1,
            error_message: lastError.message,
            is_retryable: isRetryable,
          });
        }

        throw new Error(`Operation ${operationName} failed after ${attempt + 1} attempts: ${lastError.message}`);
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * config.backoffMultiplier ** attempt,
        config.maxDelay,
      );

      console.warn(`[Retry] Attempt ${attempt + 1} failed for ${operationName}, retrying in ${delay}ms:`, lastError.message);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error(`Operation ${operationName} failed after all retry attempts`);
}

// Enhanced Stripe client with connection pooling
function createStripeInstance(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured. Please check your environment variables.');
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-06-30.basil' as any,
    typescript: true,
    timeout: 8000, // 8 second timeout
    maxNetworkRetries: 0, // We handle retries ourselves
  });
}

// Pre-warm Stripe connection (disabled for optimization)
// let stripeConnectionWarmed = false;
// async function warmStripeConnection(): Promise<void> {
//   if (stripeConnectionWarmed) {
//     return;
//   }

//   try {
//     const stripe = createStripeInstance();
//     // Make a lightweight API call to warm the connection
//     await stripe.prices.list({ limit: 1 });
//     stripeConnectionWarmed = true;
//     console.warn('[Performance] Stripe connection warmed');
//   } catch (error) {
//     console.warn('[Performance] Failed to warm Stripe connection:', error);
//   }
// }

// 有效的产品颜色枚举值
const VALID_PRODUCT_COLORS = ['Honey Khaki', 'Sakura Pink', 'Healing Green', 'Moonlight Grey', 'Red'] as const;

const formSchema = z.object({
  email: z.string().email(),
  color: z.string().refine(
    color => isValidColorId(color),
    { message: `Invalid color. Must be one of: ${VALID_PRODUCT_COLORS.join(', ')}` },
  ),
  priceId: z.string(),
  userId: z.string().optional(),
  locale: z.string(),
  // Additional fields for enhanced form
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

// Performance monitoring function
async function trackCheckoutPerformance(metrics: PerformanceMetrics): Promise<void> {
  try {
    // Send to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'checkout_performance', {
        preorder_duration: metrics.preorderDuration,
        stripe_duration: metrics.stripeDuration,
        total_duration: metrics.totalDuration,
        retry_count: metrics.retryCount,
        success: metrics.success,
        error_type: metrics.errorType,
      });
    }

    // Log performance metrics
    console.warn('[Performance] Checkout metrics:', {
      preorder: `${metrics.preorderDuration}ms`,
      stripe: `${metrics.stripeDuration}ms`,
      total: `${metrics.totalDuration}ms`,
      retries: metrics.retryCount,
      success: metrics.success,
    });

    // Send to monitoring service (optional)
    // await fetch('/api/performance/checkout', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(metrics)
    // });
  } catch (error) {
    console.warn('[Performance] Failed to track metrics:', error);
  }
}

export async function handleCheckout(formData: FormData) {
  const tracker = new PerformanceTracker();
  const retryCount = 0;
  let validatedData: any = null;

  try {
    // Warm Stripe connection early (but skip for faster execution)
    // const warmupPromise = warmStripeConnection();

    const data = Object.fromEntries(formData);
    validatedData = formSchema.parse(data);
    const { email, color, priceId, locale } = validatedData;

    // Optional: Extract referral code from cookies
    let referralCode: string | null = null;
    try {
      const { ReferralTracker } = await import('@rolitt/referral');
      const headersList = await headers();

      // Create mock request to extract referral code
      const mockRequest = new Request('http://localhost:3000', {
        headers: headersList,
      });

      referralCode = ReferralTracker.getReferralCode(mockRequest);
      if (referralCode) {
        console.warn(`[OptimizedCheckout] 🎁 Referral code found: ${referralCode}`);
        // Add referral code to form data for preorder creation
        formData.append('referrerCode', referralCode);
      }
    } catch (referralError) {
      console.warn('[OptimizedCheckout] ⚠️ Referral tracking not available:', referralError);
    }

    console.warn(`[OptimizedCheckout] 🎯 Starting optimized payment flow: ${email}`);

    // Phase 1: Preorder initialization with Vercel optimization
    tracker.checkpoint('preorder_start');

    const preorderResult = await withRetry(
      async () => {
        // 🚀 Vercel优化：缩短超时时间，优化for无服务器环境
        const timeoutPromise = new Promise<{ success: false; error: string }>((_, reject) =>
          setTimeout(() => reject(new Error('Preorder initialization timeout')), 4000), // 从8秒缩短到4秒
        );

        return Promise.race([
          initiatePreorder(formData),
          timeoutPromise,
        ]);
      },
      {
        maxRetries: 1, // 减少重试次数，从3次降到1次
        baseDelay: 500, // 缩短重试延迟
        maxDelay: 2000,
        backoffMultiplier: 1.5,
        retryableErrors: RETRY_CONFIG.retryableErrors,
      },
      'preorder_initialization',
    );

    if (!preorderResult.success) {
      console.warn('[OptimizedCheckout] ❌ Preorder initialization failed:', preorderResult.error);

      const metrics: PerformanceMetrics = {
        ...tracker.getMetrics(),
        success: false,
        errorType: 'preorder_failed',
        retryCount,
      };
      await trackCheckoutPerformance(metrics);

      const referer = await headers();
      redirect(`${referer.get('referer') || '/pre-order'}?error=preorder_failed`);
    }

    const { preorderId } = preorderResult;
    if (!preorderId) {
      console.warn('[OptimizedCheckout] ❌ Missing preorder ID');
      const referer = await headers();
      redirect(`${referer.get('referer') || '/pre-order'}?error=preorder_data_missing`);
    }

    tracker.checkpoint('preorder_complete');
    console.warn(`[OptimizedCheckout] ✅ Preorder record created: ${preorderId}`);

    // Phase 2: Stripe session creation - Vercel optimized
    tracker.checkpoint('stripe_start');

    // Skip warmup for faster execution
    // await warmupPromise; // Remove warmup to save time

    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;

    // 🚀 Vercel优化: 极简Stripe会话创建
    const session = await withRetry(
      async () => {
        const stripe = createStripeInstance(); // Create Stripe instance when needed

        // 🚀 精简配置，只包含必要字段
        const sessionConfig: Stripe.Checkout.SessionCreateParams = {
          customer_email: email,
          line_items: [{ price: priceId, quantity: 1 }],
          mode: 'payment',
          metadata: {
            locale,
            color,
            priceId,
            preorderId,
          },
          success_url: `${appUrl}/${locale}/pre-order/success?session_id={CHECKOUT_SESSION_ID}&preorder_id=${preorderId}`,
          cancel_url: `${appUrl}/${locale}/pre-order/cancel?preorder_id=${preorderId}`,
          // 🚀 性能优化：简化配置
          allow_promotion_codes: false,
          billing_address_collection: 'auto',
          // 简化运输地址收集
          shipping_address_collection: {
            allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'JP', 'SG', 'HK', 'TW'],
          },
          phone_number_collection: {
            enabled: true,
          },
        };

        // 🚀 缩短Stripe超时时间
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Stripe session creation timeout')), 4000), // 从8秒缩短到4秒
        );

        return Promise.race([
          stripe.checkout.sessions.create(sessionConfig),
          timeoutPromise,
        ]);
      },
      {
        maxRetries: 1, // 减少重试次数
        baseDelay: 300,
        maxDelay: 1000,
        backoffMultiplier: 1.5,
        retryableErrors: RETRY_CONFIG.retryableErrors,
      },
      'stripe_session_creation',
    );

    if (!session.url) {
      throw new Error('Failed to create a Stripe session URL.');
    }

    tracker.checkpoint('stripe_complete');

    const metrics: PerformanceMetrics = {
      ...tracker.getMetrics(),
      success: true,
      retryCount,
    };

    // Track performance asynchronously
    trackCheckoutPerformance(metrics).catch(console.warn);

    console.warn(`[OptimizedCheckout] 🎉 Session created (${tracker.getDuration('stripe_start', 'stripe_complete')}ms): ${session.id}`);
    redirect(session.url);
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }

    // Enhanced error handling with categorization using our error handler
    const errorResult = await handleCheckoutError(error as Error, {
      userId: validatedData?.userId,
      email: validatedData?.email,
      priceId: validatedData?.priceId,
      locale: validatedData?.locale || 'en',
    });

    const { paymentError, recovery } = errorResult;

    const metrics: PerformanceMetrics = {
      ...tracker.getMetrics(),
      success: false,
      errorType: paymentError.category,
      retryCount,
    };

    // Track error performance
    trackCheckoutPerformance(metrics).catch(console.warn);

    console.warn(`[OptimizedCheckout] ${paymentError.category.toUpperCase()} ERROR:`, {
      id: paymentError.id,
      message: paymentError.message,
      userMessage: paymentError.userMessage,
      retryable: paymentError.retryable,
      recovery: recovery.canRecover,
    });

    // 🚀 转化优先：修复URL参数重复问题
    const referer = await headers();
    const redirectUrl = referer.get('referer') || '/pre-order';

    // 清理现有URL参数，避免重复
    const urlObj = new URL(redirectUrl, 'http://localhost');
    urlObj.search = ''; // 清空现有参数

    // 添加错误信息到URL
    const errorParams = new URLSearchParams({
      error: paymentError.category,
      error_id: paymentError.id,
      retryable: paymentError.retryable.toString(),
      user_message: encodeURIComponent(paymentError.userMessage),
    });

    // 添加恢复建议
    if (recovery.fallbackOptions.length > 0) {
      errorParams.set('recovery_options', recovery.fallbackOptions.join('|'));
    }

    // 构建最终URL，确保没有重复参数
    const finalUrl = `${urlObj.pathname}?${errorParams.toString()}`;
    redirect(finalUrl);
  }
}
