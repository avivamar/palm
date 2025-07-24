// 支付系统核心类型定义
// Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
};

export type PaymentCustomer = {
  id: string;
  email: string;
  name: string;
  provider: string;
  metadata?: Record<string, any>;
};

export type CustomerData = {
  email?: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, any>;
};

export type PaymentStatus
  = | 'requires_payment_method'
    | 'requires_confirmation'
    | 'requires_action'
    | 'processing'
    | 'succeeded'
    | 'canceled'
    | 'failed';

export type PaymentIntentRequest = {
  amount: number;
  currency: string;
  customerId: string;
  description?: string;
  metadata?: Record<string, string>;
  paymentMethodTypes?: string[];
  captureMethod?: 'automatic' | 'manual';
};

export type PaymentIntent = {
  id: string;
  clientSecret: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  customerId: string;
  createdAt: Date;
  metadata?: Record<string, any>;
};

export type PaymentResult = {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: string;
};

export type SubscriptionRequest = {
  customerId: string;
  priceId: string;
  quantity?: number;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
};

export type Subscription = {
  id: string;
  customerId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  metadata?: Record<string, any>;
};

export type SubscriptionUpdate = {
  priceId?: string;
  quantity?: number;
  metadata?: Record<string, string>;
};

export type WebhookEvent = {
  id: string;
  type: string;
  data: any;
  created: Date;
  provider: string;
};

export type WebhookResult = {
  processed: boolean;
  message?: string;
  error?: string;
};

// 支付提供商抽象接口
export type PaymentProvider = {
  readonly name: string;
  readonly version: string;

  // 客户管理
  createCustomer: (user: UserProfile) => Promise<PaymentCustomer>;
  updateCustomer: (customerId: string, data: Partial<CustomerData>) => Promise<PaymentCustomer>;
  deleteCustomer: (customerId: string) => Promise<void>;

  // 支付处理
  createPaymentIntent: (request: PaymentIntentRequest) => Promise<PaymentIntent>;
  confirmPayment: (paymentId: string, paymentMethod: string) => Promise<PaymentResult>;
  cancelPayment: (paymentId: string) => Promise<PaymentResult>;

  // 订阅管理
  createSubscription: (request: SubscriptionRequest) => Promise<Subscription>;
  updateSubscription: (subscriptionId: string, updates: SubscriptionUpdate) => Promise<Subscription>;
  cancelSubscription: (subscriptionId: string) => Promise<Subscription>;

  // Webhook处理
  validateWebhook: (payload: string, signature: string) => Promise<WebhookEvent>;
  processWebhook: (event: WebhookEvent) => Promise<WebhookResult>;
};

// 支付配置类型
export type PaymentConfig = {
  stripe: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
    apiVersion: string;
  };
};

// 预订相关类型
export type PreorderData = {
  email: string;
  phone?: string;
  name?: string;
  color: string;
  colorCode: string;
  price: number;
  currency: string;
  locale: string;
};

export type StripeSessionParams = {
  email: string;
  phone?: string;
  colorCode: string;
  price: number;
  currency: string;
  locale: string;
  successUrl: string;
  cancelUrl: string;
};

// 订阅相关类型扩展
export type StripeSubscriptionSessionParams = {
  email: string;
  phone?: string;
  priceId: string; // Stripe Price ID for subscription
  currency: string;
  locale: string;
  successUrl: string;
  cancelUrl: string;
  customerId?: string; // Optional existing customer ID
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  interval: 'month' | 'year';
  amount: number;
  currency: string;
  features: string[];
  stripePriceId: string;
  popular?: boolean;
};

export type SubscriptionStatus
  = | 'incomplete'
    | 'incomplete_expired'
    | 'trialing'
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'unpaid';
