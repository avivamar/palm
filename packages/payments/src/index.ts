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

// Multi-provider payment services
export { PaymentService } from './services/PaymentService';
export type { PaymentServiceConfig } from './services/PaymentService';
export { getPaymentService, PaymentServiceFactory } from './services/PaymentServiceFactory';
export { paymentAnalytics, PaymentAnalytics } from './services/PaymentAnalytics';
export type { PaymentMetrics, PaymentEvent } from './services/PaymentAnalytics';

// Payment providers
export { PaymentProviderManager } from './providers';
export type { ExtendedPaymentConfig } from './providers';
export { StripeProvider } from './providers/stripe';
export { CreemProvider } from './providers/creem';
export { PaddleProvider } from './providers/paddle';
// Braintree provider - server-side only due to Node.js dependencies
// Import from './providers/braintree/server' for server-side use
export type { BraintreeConfig } from './providers/braintree';

// Legacy Stripe services (for backward compatibility)
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
