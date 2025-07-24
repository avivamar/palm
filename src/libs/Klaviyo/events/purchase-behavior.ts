/**
 * 购买行为事件追踪
 * 追踪用户从购买意图到完成交易的完整购买行为
 */

export enum PurchaseBehaviorEvent {
  // Pre-Purchase Intent
  PRICE_CHECK = 'Price Check',
  DISCOUNT_CODE_SEARCH = 'Discount Code Search',
  SHIPPING_INFO_CHECK = 'Shipping Info Check',
  RETURN_POLICY_VIEW = 'Return Policy View',
  STOCK_AVAILABILITY_CHECK = 'Stock Availability Check',

  // Cart Behavior
  CART_VIEW = 'Cart View',
  CART_ITEM_ADD = 'Cart Item Add',
  CART_ITEM_REMOVE = 'Cart Item Remove',
  CART_ITEM_UPDATE = 'Cart Item Update',
  CART_ABANDON = 'Cart Abandon',
  CART_RECOVER = 'Cart Recover',

  // Checkout Process
  CHECKOUT_INITIATE = 'Checkout Initiate',
  CHECKOUT_STEP_COMPLETE = 'Checkout Step Complete',
  CHECKOUT_STEP_ABANDON = 'Checkout Step Abandon',
  DISCOUNT_CODE_APPLY = 'Discount Code Apply',
  SHIPPING_METHOD_SELECT = 'Shipping Method Select',
  PAYMENT_METHOD_SELECT = 'Payment Method Select',

  // Payment Process
  PAYMENT_INFO_ENTER = 'Payment Info Enter',
  PAYMENT_ATTEMPT = 'Payment Attempt',
  PAYMENT_SUCCESS = 'Payment Success',
  PAYMENT_FAILURE = 'Payment Failure',
  PAYMENT_RETRY = 'Payment Retry',

  // Order Management
  ORDER_CONFIRM = 'Order Confirm',
  ORDER_RECEIPT_VIEW = 'Order Receipt View',
  ORDER_STATUS_CHECK = 'Order Status Check',
  ORDER_MODIFY_REQUEST = 'Order Modify Request',
  ORDER_CANCEL_REQUEST = 'Order Cancel Request',

  // Post-Purchase
  DELIVERY_TRACKING = 'Delivery Tracking',
  PRODUCT_RECEIVE = 'Product Receive',
  RETURN_INITIATE = 'Return Initiate',
  EXCHANGE_REQUEST = 'Exchange Request',
  REFUND_REQUEST = 'Refund Request',

  // Repeat Purchase
  REORDER = 'Reorder',
  SUBSCRIPTION_START = 'Subscription Start',
  SUBSCRIPTION_MODIFY = 'Subscription Modify',
  SUBSCRIPTION_CANCEL = 'Subscription Cancel',
}

export enum CheckoutStep {
  CART_REVIEW = 'cart_review',
  SHIPPING_INFO = 'shipping_info',
  PAYMENT_INFO = 'payment_info',
  ORDER_REVIEW = 'order_review',
  CONFIRMATION = 'confirmation',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  BANK_TRANSFER = 'bank_transfer',
  BUY_NOW_PAY_LATER = 'buy_now_pay_later',
}

type CartItem = {
  productId: string;
  productName: string;
  variant?: {
    color?: string;
    size?: string;
    sku?: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type PurchaseEventProps = {
  email?: string;
  userId?: string;
  sessionId: string;
  event: PurchaseBehaviorEvent;

  // Order information
  orderId?: string;
  orderNumber?: string;
  orderValue?: number;
  currency?: string;

  // Cart information
  cartItems?: CartItem[];
  cartValue?: number;
  cartItemCount?: number;

  // Checkout information
  checkoutStep?: CheckoutStep;
  paymentMethod?: PaymentMethod;
  shippingMethod?: string;
  discountCode?: string;
  discountAmount?: number;
  taxAmount?: number;
  shippingAmount?: number;

  // Additional context
  properties?: Record<string, any>;
  timestamp?: Date;
};

type PurchaseFunnel = {
  step: CheckoutStep;
  name: string;
  users: number;
  completionRate: number;
  dropOffRate: number;
  averageTime: number;
  commonExitPoints: string[];
  errorCounts: Record<string, number>;
};

type CustomerLifetimeValue = {
  customerId: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  daysBetweenOrders: number;
  lastOrderDate?: Date;
  predictedLifetimeValue: number;
  customerSegment: 'new' | 'regular' | 'vip' | 'at_risk' | 'dormant';
};

/**
 * Purchase behavior tracking system
 */
export class PurchaseBehaviorTracker {
  private static instance: PurchaseBehaviorTracker;
  private purchaseEvents: Map<string, PurchaseEventProps[]> = new Map();
  private checkoutSessions: Map<string, {
    startTime: Date;
    currentStep: CheckoutStep;
    completedSteps: CheckoutStep[];
    cartValue: number;
    abandoned: boolean;
    completed: boolean;
    errors: string[];
  }> = new Map();

  private customerProfiles: Map<string, CustomerLifetimeValue> = new Map();

  private constructor() {}

  public static getInstance(): PurchaseBehaviorTracker {
    if (!PurchaseBehaviorTracker.instance) {
      PurchaseBehaviorTracker.instance = new PurchaseBehaviorTracker();
    }
    return PurchaseBehaviorTracker.instance;
  }

  /**
   * Track purchase behavior event
   */
  public async trackPurchaseEvent(eventProps: PurchaseEventProps): Promise<void> {
    const {
      email,
      userId,
      sessionId,
      event,
      orderId,
      orderValue,
      currency = 'USD',
      cartItems = [],
      cartValue,
      checkoutStep,
      paymentMethod,
      properties = {},
      timestamp = new Date(),
    } = eventProps;

    // Store event data
    const events = this.purchaseEvents.get(sessionId) || [];
    events.push(eventProps);
    this.purchaseEvents.set(sessionId, events);

    // Update checkout session if applicable
    if (checkoutStep) {
      this.updateCheckoutSession(sessionId, checkoutStep, cartValue || 0, timestamp);
    }

    // Update customer profile if purchase completed
    if (event === PurchaseBehaviorEvent.PAYMENT_SUCCESS && email && orderValue) {
      await this.updateCustomerProfile(email, orderValue, timestamp);
    }

    // Prepare enhanced properties for Klaviyo
    const enhancedProperties = {
      email,
      userId,
      sessionId,
      orderId,
      orderValue,
      currency,
      timestamp: timestamp.toISOString(),

      // Cart analysis
      cartItems,
      cartItemCount: cartItems.length,
      cartValue: cartValue || cartItems.reduce((sum, item) => sum + item.totalPrice, 0),
      averageItemPrice: cartItems.length > 0
        ? cartItems.reduce((sum, item) => sum + item.unitPrice, 0) / cartItems.length
        : 0,

      // Session context
      eventSequenceNumber: events.length,
      sessionDuration: this.getSessionDuration(sessionId),
      checkoutStep,
      paymentMethod,

      // Customer insights
      customerSegment: email ? await this.getCustomerSegment(email) : 'unknown',
      isRepeatCustomer: email ? await this.isRepeatCustomer(email) : false,

      // Behavioral patterns
      previousCartAbandons: await this.getCartAbandonCount(email),
      timeSinceLastPurchase: email ? await this.getTimeSinceLastPurchase(email) : null,

      ...properties,
    };

    // Send to Klaviyo
    await this.sendToKlaviyo(event, enhancedProperties);

    // Send to analytics
    await this.sendToAnalytics(eventProps, enhancedProperties);

    // Trigger automation workflows if applicable
    await this.triggerAutomationWorkflows(event, enhancedProperties);
  }

  /**
   * Update checkout session tracking
   */
  private updateCheckoutSession(
    sessionId: string,
    step: CheckoutStep,
    cartValue: number,
    timestamp: Date,
  ): void {
    const session = this.checkoutSessions.get(sessionId) || {
      startTime: timestamp,
      currentStep: step,
      completedSteps: [],
      cartValue,
      abandoned: false,
      completed: false,
      errors: [],
    };

    // Update step progression
    if (!session.completedSteps.includes(session.currentStep)) {
      session.completedSteps.push(session.currentStep);
    }

    session.currentStep = step;
    session.cartValue = cartValue;

    this.checkoutSessions.set(sessionId, session);
  }

  /**
   * Update customer lifetime value profile
   */
  private async updateCustomerProfile(email: string, orderValue: number, orderDate: Date): Promise<void> {
    const existing = this.customerProfiles.get(email) || {
      customerId: email,
      email,
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      daysBetweenOrders: 0,
      predictedLifetimeValue: 0,
      customerSegment: 'new' as const,
    };

    // Update metrics
    existing.totalOrders += 1;
    existing.totalSpent += orderValue;
    existing.averageOrderValue = existing.totalSpent / existing.totalOrders;

    // Calculate days between orders
    if (existing.lastOrderDate) {
      const daysDiff = (orderDate.getTime() - existing.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24);
      existing.daysBetweenOrders = existing.totalOrders > 1
        ? ((existing.daysBetweenOrders * (existing.totalOrders - 2)) + daysDiff) / (existing.totalOrders - 1)
        : daysDiff;
    }

    existing.lastOrderDate = orderDate;

    // Update customer segment
    existing.customerSegment = this.calculateCustomerSegment(existing);

    // Calculate predicted lifetime value (simplified)
    existing.predictedLifetimeValue = this.calculatePredictedLTV(existing);

    this.customerProfiles.set(email, existing);

    // Send customer update to Klaviyo
    await this.sendCustomerProfileToKlaviyo(existing);
  }

  /**
   * Calculate customer segment
   */
  private calculateCustomerSegment(profile: CustomerLifetimeValue): CustomerLifetimeValue['customerSegment'] {
    const { totalOrders, totalSpent, lastOrderDate } = profile;
    const daysSinceLastOrder = lastOrderDate
      ? (Date.now() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
      : 0;

    if (totalOrders === 1) {
      return 'new';
    }
    if (totalSpent > 1000 && totalOrders > 5) {
      return 'vip';
    }
    if (daysSinceLastOrder > 180) {
      return 'dormant';
    }
    if (daysSinceLastOrder > 90) {
      return 'at_risk';
    }
    return 'regular';
  }

  /**
   * Calculate predicted lifetime value
   */
  private calculatePredictedLTV(profile: CustomerLifetimeValue): number {
    const { averageOrderValue, daysBetweenOrders, totalOrders } = profile;

    if (totalOrders < 2) {
      return averageOrderValue * 3;
    } // Conservative estimate for new customers

    // Simple LTV calculation: AOV * (365 / days between orders) * predicted lifespan
    const ordersPerYear = daysBetweenOrders > 0 ? 365 / daysBetweenOrders : 1;
    const predictedLifespanYears = Math.min(3, Math.max(1, totalOrders / 2)); // 1-3 years based on order history

    return averageOrderValue * ordersPerYear * predictedLifespanYears;
  }

  /**
   * Get session duration
   */
  private getSessionDuration(sessionId: string): number {
    const events = this.purchaseEvents.get(sessionId);
    if (!events || events.length === 0) {
      return 0;
    }

    const firstEvent = events[0];
    const lastEvent = events[events.length - 1];

    return (lastEvent?.timestamp?.getTime() || 0) - (firstEvent?.timestamp?.getTime() || 0);
  }

  /**
   * Get customer segment
   */
  private async getCustomerSegment(email: string): Promise<string> {
    const profile = this.customerProfiles.get(email);
    return profile?.customerSegment || 'new';
  }

  /**
   * Check if repeat customer
   */
  private async isRepeatCustomer(email: string): Promise<boolean> {
    const profile = this.customerProfiles.get(email);
    return (profile?.totalOrders || 0) > 1;
  }

  /**
   * Get cart abandon count
   */
  private async getCartAbandonCount(email?: string): Promise<number> {
    if (!email) {
      return 0;
    }

    let count = 0;
    for (const events of this.purchaseEvents.values()) {
      const userEvents = events.filter(e => e.email === email);
      const hasCartAbandon = userEvents.some(e => e.event === PurchaseBehaviorEvent.CART_ABANDON);
      if (hasCartAbandon) {
        count++;
      }
    }
    return count;
  }

  /**
   * Get time since last purchase
   */
  private async getTimeSinceLastPurchase(email: string): Promise<number | null> {
    const profile = this.customerProfiles.get(email);
    if (!profile?.lastOrderDate) {
      return null;
    }

    return Date.now() - profile.lastOrderDate.getTime();
  }

  /**
   * Get purchase funnel analytics
   */
  public getPurchaseFunnelAnalytics(): PurchaseFunnel[] {
    const stepCounts: Record<CheckoutStep, {
      users: Set<string>;
      sessions: string[];
      totalTime: number;
      errors: string[];
    }> = {
      [CheckoutStep.CART_REVIEW]: { users: new Set(), sessions: [], totalTime: 0, errors: [] },
      [CheckoutStep.SHIPPING_INFO]: { users: new Set(), sessions: [], totalTime: 0, errors: [] },
      [CheckoutStep.PAYMENT_INFO]: { users: new Set(), sessions: [], totalTime: 0, errors: [] },
      [CheckoutStep.ORDER_REVIEW]: { users: new Set(), sessions: [], totalTime: 0, errors: [] },
      [CheckoutStep.CONFIRMATION]: { users: new Set(), sessions: [], totalTime: 0, errors: [] },
    };

    // Analyze checkout sessions
    for (const [sessionId, session] of this.checkoutSessions) {
      session.completedSteps.forEach((step) => {
        stepCounts[step].sessions.push(sessionId);

        // Get user email from events
        const events = this.purchaseEvents.get(sessionId);
        const userEmail = events?.find(e => e.email)?.email;
        if (userEmail) {
          stepCounts[step].users.add(userEmail);
        }
      });
    }

    const steps = Object.values(CheckoutStep);
    const totalUsers = stepCounts[CheckoutStep.CART_REVIEW].users.size;

    return steps.map((step) => {
      const stepData = stepCounts[step];
      const users = stepData.users.size;
      const completionRate = totalUsers > 0 ? (users / totalUsers) * 100 : 0;
      const dropOffRate = 100 - completionRate;

      return {
        step,
        name: step.replace('_', ' ').toUpperCase(),
        users,
        completionRate,
        dropOffRate,
        averageTime: stepData.totalTime / Math.max(stepData.sessions.length, 1),
        commonExitPoints: [], // Would need more detailed tracking
        errorCounts: {},
      };
    });
  }

  /**
   * Send customer profile to Klaviyo
   */
  private async sendCustomerProfileToKlaviyo(profile: CustomerLifetimeValue): Promise<void> {
    try {
      const { Klaviyo } = await import('../../Klaviyo');

      await Klaviyo.track('Customer Profile Updated', {
        email: profile.email,
        customerId: profile.customerId,
        totalOrders: profile.totalOrders,
        totalSpent: profile.totalSpent,
        averageOrderValue: profile.averageOrderValue,
        customerSegment: profile.customerSegment,
        predictedLifetimeValue: profile.predictedLifetimeValue,
        daysBetweenOrders: profile.daysBetweenOrders,
        lastOrderDate: profile.lastOrderDate?.toISOString(),
      });
    } catch (error) {
      console.error('[PurchaseBehaviorTracker] Failed to send customer profile to Klaviyo:', error);
    }
  }

  /**
   * Trigger automation workflows
   */
  private async triggerAutomationWorkflows(
    event: PurchaseBehaviorEvent,
    properties: Record<string, any>,
  ): Promise<void> {
    try {
      const automationTriggers: Record<PurchaseBehaviorEvent, string> = {
        [PurchaseBehaviorEvent.CART_ABANDON]: 'Abandoned Cart Recovery',
        [PurchaseBehaviorEvent.PAYMENT_SUCCESS]: 'Post Purchase Welcome',
        [PurchaseBehaviorEvent.PAYMENT_FAILURE]: 'Payment Failed Recovery',
        [PurchaseBehaviorEvent.CHECKOUT_STEP_ABANDON]: 'Checkout Abandonment',
        [PurchaseBehaviorEvent.PRODUCT_RECEIVE]: 'Product Delivered',
        [PurchaseBehaviorEvent.REORDER]: 'Repeat Purchase Thank You',
      } as any;

      const workflowName = automationTriggers[event];
      if (workflowName) {
        await this.sendToKlaviyo(`Trigger: ${workflowName}`, properties);
      }
    } catch (error) {
      console.error('[PurchaseBehaviorTracker] Failed to trigger automation workflows:', error);
    }
  }

  /**
   * Send event to Klaviyo
   */
  private async sendToKlaviyo(eventName: string, properties: Record<string, any>): Promise<void> {
    try {
      const { Klaviyo } = await import('../../Klaviyo');

      if (properties.email) {
        await Klaviyo.track(eventName, properties);
      }
    } catch (error) {
      console.error('[PurchaseBehaviorTracker] Failed to send event to Klaviyo:', error);
    }
  }

  /**
   * Send event to analytics
   */
  private async sendToAnalytics(
    event: PurchaseEventProps,
    enhancedProperties: Record<string, any>,
  ): Promise<void> {
    try {
      // Send to Google Analytics Enhanced Ecommerce
      if (typeof window !== 'undefined' && window.gtag) {
        // Purchase events
        if (event.event === PurchaseBehaviorEvent.PAYMENT_SUCCESS) {
          window.gtag('event', 'purchase', {
            transaction_id: event.orderId,
            value: event.orderValue,
            currency: event.currency || 'USD',
            items: event.cartItems?.map(item => ({
              item_id: item.productId,
              item_name: item.productName,
              item_category: 'AI Companion',
              item_variant: item.variant?.color,
              quantity: item.quantity,
              price: item.unitPrice,
            })),
          });
        }

        // Add to cart events
        if (event.event === PurchaseBehaviorEvent.CART_ITEM_ADD) {
          window.gtag('event', 'add_to_cart', {
            currency: event.currency || 'USD',
            value: event.cartValue,
            items: event.cartItems?.map(item => ({
              item_id: item.productId,
              item_name: item.productName,
              quantity: item.quantity,
              price: item.unitPrice,
            })),
          });
        }

        // Checkout events
        if (event.event === PurchaseBehaviorEvent.CHECKOUT_INITIATE) {
          window.gtag('event', 'begin_checkout', {
            currency: event.currency || 'USD',
            value: event.cartValue,
            items: event.cartItems?.map(item => ({
              item_id: item.productId,
              item_name: item.productName,
              quantity: item.quantity,
              price: item.unitPrice,
            })),
          });
        }

        // Generic event tracking
        window.gtag('event', event.event, {
          event_category: 'purchase_behavior',
          event_label: event.checkoutStep || event.paymentMethod,
          value: event.orderValue || event.cartValue,
          custom_session_id: event.sessionId,
          custom_user_id: event.userId,
          ...enhancedProperties,
        });
      }
    } catch (error) {
      console.error('[PurchaseBehaviorTracker] Failed to send event to analytics:', error);
    }
  }
}

// Singleton instance
export const purchaseBehaviorTracker = PurchaseBehaviorTracker.getInstance();

// Convenience functions for common purchase events
export const trackCartAdd = (sessionId: string, cartItems: CartItem[], email?: string, properties?: Record<string, any>) =>
  purchaseBehaviorTracker.trackPurchaseEvent({
    email,
    sessionId,
    event: PurchaseBehaviorEvent.CART_ITEM_ADD,
    cartItems,
    cartValue: cartItems.reduce((sum, item) => sum + item.totalPrice, 0),
    properties,
  });

export const trackCheckoutStart = (sessionId: string, cartItems: CartItem[], email?: string, properties?: Record<string, any>) =>
  purchaseBehaviorTracker.trackPurchaseEvent({
    email,
    sessionId,
    event: PurchaseBehaviorEvent.CHECKOUT_INITIATE,
    checkoutStep: CheckoutStep.CART_REVIEW,
    cartItems,
    cartValue: cartItems.reduce((sum, item) => sum + item.totalPrice, 0),
    properties,
  });

export const trackPaymentSuccess = (
  sessionId: string,
  orderId: string,
  orderValue: number,
  email?: string,
  cartItems?: CartItem[],
  properties?: Record<string, any>,
) =>
  purchaseBehaviorTracker.trackPurchaseEvent({
    email,
    sessionId,
    event: PurchaseBehaviorEvent.PAYMENT_SUCCESS,
    orderId,
    orderValue,
    cartItems,
    properties,
  });

export const trackCartAbandon = (sessionId: string, cartValue: number, email?: string, properties?: Record<string, any>) =>
  purchaseBehaviorTracker.trackPurchaseEvent({
    email,
    sessionId,
    event: PurchaseBehaviorEvent.CART_ABANDON,
    cartValue,
    properties,
  });
