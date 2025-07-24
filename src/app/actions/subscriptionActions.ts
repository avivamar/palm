/**
 * Subscription payment actions - Independent functionality
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

'use server';

import type {
  StripeSubscriptionSessionParams,
  SupportedLocale,
} from '@rolitt/payments';
import {
  getAllLocalizedPlans,
  SubscriptionService,

} from '@rolitt/payments';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// Environment configuration
const getSubscriptionConfig = () => {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return { stripeSecretKey, appUrl };
};

// Validation schemas
const subscriptionCheckoutSchema = z.object({
  email: z.string().email('Invalid email address'),
  priceId: z.string().min(1, 'Price ID is required'),
  locale: z.enum(['en', 'es', 'ja', 'zh-HK']),
  planId: z.string().min(1, 'Plan ID is required'),
  interval: z.enum(['monthly', 'yearly']),
  // Optional fields
  customerId: z.string().optional(),
  trialPeriodDays: z.number().min(0).max(365).optional(),
});

/**
 * Create subscription checkout session
 */
export async function createSubscriptionCheckout(formData: FormData) {
  try {
    console.log('[SubscriptionActions] Starting subscription checkout');

    // Parse and validate form data
    const rawData = Object.fromEntries(formData);
    const validatedData = subscriptionCheckoutSchema.parse(rawData);

    const { stripeSecretKey, appUrl } = getSubscriptionConfig();
    const subscriptionService = new SubscriptionService(stripeSecretKey);

    // Prepare subscription session parameters
    const sessionParams: StripeSubscriptionSessionParams = {
      email: validatedData.email,
      priceId: validatedData.priceId,
      currency: 'USD', // Default currency
      locale: validatedData.locale,
      successUrl: `${appUrl}/${validatedData.locale}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/${validatedData.locale}/subscription/cancel`,
      customerId: validatedData.customerId,
      trialPeriodDays: validatedData.trialPeriodDays,
      metadata: {
        planId: validatedData.planId,
        interval: validatedData.interval,
        locale: validatedData.locale,
        source: 'subscription_test',
      },
    };

    console.log('[SubscriptionActions] Creating subscription session:', {
      email: validatedData.email,
      priceId: validatedData.priceId,
      planId: validatedData.planId,
      interval: validatedData.interval,
    });

    // Create subscription checkout session
    const { url, sessionId } = await subscriptionService.createSubscriptionSession(sessionParams);

    console.log('[SubscriptionActions] Subscription session created:', sessionId);

    // Redirect to Stripe checkout
    redirect(url);
  } catch (error) {
    console.error('[SubscriptionActions] Error creating subscription checkout:', error);

    // Extract locale for error redirect
    const locale = formData.get('locale') as string || 'en';

    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map(e => e.message).join(', ');
      redirect(`/${locale}/subscription/error?message=${encodeURIComponent(errorMessage)}`);
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    redirect(`/${locale}/subscription/error?message=${encodeURIComponent(errorMessage)}`);
  }
}

/**
 * Get subscription plans for display
 */
export async function getSubscriptionPlans(locale: SupportedLocale = 'en') {
  try {
    console.log('[SubscriptionActions] Getting subscription plans for locale:', locale);

    const plans = getAllLocalizedPlans(locale);

    return {
      success: true,
      plans,
    };
  } catch (error) {
    console.error('[SubscriptionActions] Error getting subscription plans:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get subscription plans',
      plans: [],
    };
  }
}

/**
 * Get customer subscriptions by email
 */
export async function getCustomerSubscriptions(email: string) {
  try {
    console.log('[SubscriptionActions] Getting subscriptions for email:', email);

    const { stripeSecretKey } = getSubscriptionConfig();
    const subscriptionService = new SubscriptionService(stripeSecretKey);

    const subscriptions = await subscriptionService.getSubscriptionsByEmail(email);

    return {
      success: true,
      subscriptions,
    };
  } catch (error) {
    console.error('[SubscriptionActions] Error getting customer subscriptions:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get subscriptions',
      subscriptions: [],
    };
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string, immediately: boolean = false) {
  try {
    console.log('[SubscriptionActions] Canceling subscription:', subscriptionId, 'immediately:', immediately);

    const { stripeSecretKey } = getSubscriptionConfig();
    const subscriptionService = new SubscriptionService(stripeSecretKey);

    const canceledSubscription = await subscriptionService.cancelSubscription(subscriptionId, immediately);

    return {
      success: true,
      subscription: canceledSubscription,
      message: immediately ? 'Subscription canceled immediately' : 'Subscription will cancel at period end',
    };
  } catch (error) {
    console.error('[SubscriptionActions] Error canceling subscription:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cancel subscription',
    };
  }
}

/**
 * Reactivate subscription
 */
export async function reactivateSubscription(subscriptionId: string) {
  try {
    console.log('[SubscriptionActions] Reactivating subscription:', subscriptionId);

    const { stripeSecretKey } = getSubscriptionConfig();
    const subscriptionService = new SubscriptionService(stripeSecretKey);

    const reactivatedSubscription = await subscriptionService.reactivateSubscription(subscriptionId);

    return {
      success: true,
      subscription: reactivatedSubscription,
      message: 'Subscription reactivated successfully',
    };
  } catch (error) {
    console.error('[SubscriptionActions] Error reactivating subscription:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reactivate subscription',
    };
  }
}

/**
 * Get subscription analytics for customer
 */
export async function getSubscriptionAnalytics(customerId: string) {
  try {
    console.log('[SubscriptionActions] Getting subscription analytics for customer:', customerId);

    const { stripeSecretKey } = getSubscriptionConfig();
    const subscriptionService = new SubscriptionService(stripeSecretKey);

    const analytics = await subscriptionService.getSubscriptionAnalytics(customerId);

    return {
      success: true,
      analytics,
    };
  } catch (error) {
    console.error('[SubscriptionActions] Error getting subscription analytics:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get subscription analytics',
      analytics: null,
    };
  }
}
