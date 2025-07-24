/**
 * Payments package main index
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

// Components
export { CheckoutForm } from './components/CheckoutForm';
export type { CheckoutFormProps } from './components/CheckoutForm';
export { SubscriptionManager } from './components/SubscriptionManager';

export type { SubscriptionManagerProps } from './components/SubscriptionManager';
export { SubscriptionPlans } from './components/SubscriptionPlans';
export type { SubscriptionPlansProps } from './components/SubscriptionPlans';

// Stripe services
export { StripeCheckoutService } from './features/stripe/StripeCheckoutService';
export {
  getAllPlans,
  getPlanByPriceId,
  getPlansForDisplay,
  getSubscriptionPlan,
  SUBSCRIPTION_PLAN_MAPPING,
  SUBSCRIPTION_PLANS,
  SubscriptionPlanId,
} from './features/subscription/SubscriptionPlans';
export type { SubscriptionPlanIdType } from './features/subscription/SubscriptionPlans';

export {
  combineWithPricing,
  getAllLocalizedPlans,
  getLocalizedPlan,
  getLocalizedPricingData,
  subscriptionPricingData,
} from './features/subscription/SubscriptionPricingData';

export type { SupportedLocale } from './features/subscription/SubscriptionPricingData';
// Subscription services
export { SubscriptionService } from './features/subscription/SubscriptionService';

export { StripeWebhookHandler } from './features/webhooks/StripeWebhookHandler';
export type { WebhookHandlerConfig } from './features/webhooks/StripeWebhookHandler';

// Error handling
export {
  CustomerError,
  handlePaymentError,
  PaymentError,
  PaymentIntentError,
  SubscriptionError,
  WebhookValidationError,
} from './libs/errors';
// Core types
export type {
  CustomerData,
  PaymentConfig,
  PaymentCustomer,
  PaymentIntent,
  PaymentIntentRequest,
  PaymentProvider,
  PaymentResult,
  PaymentStatus,
  PreorderData,
  StripeSessionParams,
  StripeSubscriptionSessionParams,
  Subscription,
  SubscriptionPlan,
  SubscriptionRequest,
  SubscriptionStatus,
  SubscriptionUpdate,
  UserProfile,
  WebhookEvent,
  WebhookResult,
} from './types';
