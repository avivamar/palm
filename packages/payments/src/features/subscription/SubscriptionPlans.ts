/**
 * Subscription plans configuration
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

import type { SubscriptionPlan } from '../../types';

// Environment variables for Stripe Price IDs
// These should be defined in your .env file
const env = {
  NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID || '',
  NEXT_PUBLIC_STRIPE_BASIC_YEARLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_BASIC_YEARLY_PRICE_ID || '',
  NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || '',
  NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID || '',
  NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID || '',
  NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID || '',
};

// Subscription plan enum for consistency
export const SubscriptionPlanId = {
  BASIC: 'basic',
  PRO: 'pro',
  PREMIUM: 'premium',
} as const;

export type SubscriptionPlanIdType = typeof SubscriptionPlanId[keyof typeof SubscriptionPlanId];

// Price ID to Plan mapping for webhook processing
export const SUBSCRIPTION_PLAN_MAPPING: Record<string, SubscriptionPlanIdType> = {
  [env.NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID]: SubscriptionPlanId.BASIC,
  [env.NEXT_PUBLIC_STRIPE_BASIC_YEARLY_PRICE_ID]: SubscriptionPlanId.BASIC,
  [env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID]: SubscriptionPlanId.PRO,
  [env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID]: SubscriptionPlanId.PRO,
  [env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID]: SubscriptionPlanId.PREMIUM,
  [env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID]: SubscriptionPlanId.PREMIUM,
};

// Base subscription plans configuration
export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanIdType, {
  monthly: SubscriptionPlan;
  yearly: SubscriptionPlan;
}> = {
  [SubscriptionPlanId.BASIC]: {
    monthly: {
      id: 'basic_monthly',
      name: 'Basic Monthly',
      description: 'Essential AI companion features',
      interval: 'month',
      amount: 9.99,
      currency: 'USD',
      stripePriceId: env.NEXT_PUBLIC_STRIPE_BASIC_MONTHLY_PRICE_ID,
      features: [
        'Basic AI conversations',
        'Standard response time',
        'Email support',
        'Mobile app access',
      ],
    },
    yearly: {
      id: 'basic_yearly',
      name: 'Basic Yearly',
      description: 'Essential AI companion features (Save 17%)',
      interval: 'year',
      amount: 99.99,
      currency: 'USD',
      stripePriceId: env.NEXT_PUBLIC_STRIPE_BASIC_YEARLY_PRICE_ID,
      features: [
        'Basic AI conversations',
        'Standard response time',
        'Email support',
        'Mobile app access',
        '2 months free',
      ],
    },
  },
  [SubscriptionPlanId.PRO]: {
    monthly: {
      id: 'pro_monthly',
      name: 'Pro Monthly',
      description: 'Advanced AI companion with premium features',
      interval: 'month',
      amount: 19.99,
      currency: 'USD',
      stripePriceId: env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
      popular: true,
      features: [
        'Advanced AI conversations',
        'Priority response time',
        'Voice interactions',
        'Personality customization',
        'Priority support',
        'Desktop app access',
      ],
    },
    yearly: {
      id: 'pro_yearly',
      name: 'Pro Yearly',
      description: 'Advanced AI companion with premium features (Save 17%)',
      interval: 'year',
      amount: 199.99,
      currency: 'USD',
      stripePriceId: env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
      popular: true,
      features: [
        'Advanced AI conversations',
        'Priority response time',
        'Voice interactions',
        'Personality customization',
        'Priority support',
        'Desktop app access',
        '2 months free',
      ],
    },
  },
  [SubscriptionPlanId.PREMIUM]: {
    monthly: {
      id: 'premium_monthly',
      name: 'Premium Monthly',
      description: 'Ultimate AI companion experience',
      interval: 'month',
      amount: 39.99,
      currency: 'USD',
      stripePriceId: env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID,
      features: [
        'Unlimited AI conversations',
        'Instant response time',
        'Advanced voice interactions',
        'Full personality customization',
        'Video call capability',
        'White-glove support',
        'Early access to new features',
        'API access',
      ],
    },
    yearly: {
      id: 'premium_yearly',
      name: 'Premium Yearly',
      description: 'Ultimate AI companion experience (Save 17%)',
      interval: 'year',
      amount: 399.99,
      currency: 'USD',
      stripePriceId: env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID,
      features: [
        'Unlimited AI conversations',
        'Instant response time',
        'Advanced voice interactions',
        'Full personality customization',
        'Video call capability',
        'White-glove support',
        'Early access to new features',
        'API access',
        '2 months free',
      ],
    },
  },
};

// Helper functions
export function getSubscriptionPlan(priceId: string): SubscriptionPlanIdType | null {
  return SUBSCRIPTION_PLAN_MAPPING[priceId] || null;
}

export function getPlanByPriceId(priceId: string): SubscriptionPlan | null {
  for (const planType of Object.values(SUBSCRIPTION_PLANS)) {
    if (planType.monthly.stripePriceId === priceId) {
      return planType.monthly;
    }
    if (planType.yearly.stripePriceId === priceId) {
      return planType.yearly;
    }
  }
  return null;
}

export function getAllPlans(): SubscriptionPlan[] {
  const plans: SubscriptionPlan[] = [];

  for (const planType of Object.values(SUBSCRIPTION_PLANS)) {
    plans.push(planType.monthly, planType.yearly);
  }

  return plans;
}

export function getPlansForDisplay(): Array<{
  id: SubscriptionPlanIdType;
  monthly: SubscriptionPlan;
  yearly: SubscriptionPlan;
  savings: number; // Percentage saved with yearly
}> {
  return Object.entries(SUBSCRIPTION_PLANS).map(([id, plans]) => {
    const monthlyCost = plans.monthly.amount * 12;
    const yearlyCost = plans.yearly.amount;
    const savings = Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);

    return {
      id: id as SubscriptionPlanIdType,
      monthly: plans.monthly,
      yearly: plans.yearly,
      savings,
    };
  });
}
