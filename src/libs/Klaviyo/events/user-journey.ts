/**
 * 用户旅程事件追踪
 * 覆盖用户完整生命周期的事件追踪系统
 */

export enum UserJourneyStage {
  AWARENESS = 'awareness',
  INTEREST = 'interest',
  CONSIDERATION = 'consideration',
  INTENT = 'intent',
  PURCHASE = 'purchase',
  RETENTION = 'retention',
  ADVOCACY = 'advocacy',
}

export enum UserJourneyEvent {
  // Awareness Stage
  LANDING_PAGE_VIEW = 'Landing Page View',
  SOCIAL_MEDIA_VISIT = 'Social Media Visit',
  REFERRAL_VISIT = 'Referral Visit',
  SEARCH_VISIT = 'Search Visit',

  // Interest Stage
  PRODUCT_PAGE_VIEW = 'Product Page View',
  VIDEO_WATCH = 'Video Watch',
  NEWSLETTER_SIGNUP = 'Newsletter Signup',
  WAITLIST_JOIN = 'Waitlist Join',

  // Consideration Stage
  PRODUCT_COMPARE = 'Product Compare',
  REVIEWS_READ = 'Reviews Read',
  FAQ_VIEW = 'FAQ View',
  FEATURES_EXPLORE = 'Features Explore',
  PRICING_VIEW = 'Pricing View',

  // Intent Stage
  CART_ADD = 'Cart Add',
  CHECKOUT_START = 'Checkout Start',
  PAYMENT_INFO_ENTER = 'Payment Info Enter',
  SHIPPING_INFO_ENTER = 'Shipping Info Enter',

  // Purchase Stage
  PAYMENT_ATTEMPT = 'Payment Attempt',
  PAYMENT_SUCCESS = 'Payment Success',
  PAYMENT_FAILED = 'Payment Failed',
  ORDER_CONFIRMED = 'Order Confirmed',

  // Retention Stage
  ORDER_SHIPPED = 'Order Shipped',
  ORDER_DELIVERED = 'Order Delivered',
  PRODUCT_ACTIVATION = 'Product Activation',
  SUPPORT_CONTACT = 'Support Contact',
  SATISFACTION_SURVEY = 'Satisfaction Survey',

  // Advocacy Stage
  REVIEW_SUBMIT = 'Review Submit',
  REFERRAL_SEND = 'Referral Send',
  SOCIAL_SHARE = 'Social Share',
  REPEAT_PURCHASE = 'Repeat Purchase',
}

type UserJourneyEventProps = {
  email?: string;
  userId?: string;
  sessionId: string;
  stage: UserJourneyStage;
  event: UserJourneyEvent;
  properties?: Record<string, any>;
  timestamp?: Date;
};

type UserProfile = {
  email: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  language?: string;
  source?: string;
  // Behavioral attributes
  totalPageViews?: number;
  totalTimeOnSite?: number;
  lastActiveDate?: Date;
  purchaseHistory?: Array<{
    orderId: string;
    amount: number;
    currency: string;
    date: Date;
  }>;
  // Engagement metrics
  emailEngagement?: {
    opened: number;
    clicked: number;
    unsubscribed: boolean;
  };
  // Preferences
  communicationPreferences?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
};

/**
 * Enhanced user journey tracking system
 */
export class UserJourneyTracker {
  private static instance: UserJourneyTracker;
  private userProfiles: Map<string, UserProfile> = new Map();
  private sessionData: Map<string, {
    startTime: Date;
    events: UserJourneyEventProps[];
    currentStage: UserJourneyStage;
  }> = new Map();

  private constructor() {}

  public static getInstance(): UserJourneyTracker {
    if (!UserJourneyTracker.instance) {
      UserJourneyTracker.instance = new UserJourneyTracker();
    }
    return UserJourneyTracker.instance;
  }

  /**
   * Initialize user session
   */
  public initializeSession(sessionId: string, userEmail?: string): void {
    this.sessionData.set(sessionId, {
      startTime: new Date(),
      events: [],
      currentStage: UserJourneyStage.AWARENESS,
    });

    if (userEmail) {
      this.updateUserProfile(userEmail, { email: userEmail });
    }
  }

  /**
   * Track user journey event
   */
  public async trackEvent(eventProps: UserJourneyEventProps): Promise<void> {
    const { email, userId, sessionId, stage, event, properties = {}, timestamp = new Date() } = eventProps;

    // Update session data
    const session = this.sessionData.get(sessionId);
    if (session) {
      session.events.push(eventProps);
      session.currentStage = stage;
    }

    // Update user profile if email is available
    if (email) {
      this.updateUserProfile(email, {
        email,
        userId,
        lastActiveDate: timestamp,
        ...properties,
      });
    }

    // Prepare Klaviyo event
    const klaviyoEvent = {
      eventName: event,
      properties: {
        email,
        userId,
        sessionId,
        stage,
        timestamp: timestamp.toISOString(),
        ...properties,
        // Session context
        sessionDuration: session ? Date.now() - session.startTime.getTime() : 0,
        eventsInSession: session ? session.events.length : 0,
        currentStage: stage,
      },
    };

    // Send to Klaviyo (integrate with existing Klaviyo.ts)
    await this.sendToKlaviyo(klaviyoEvent);

    // Send to analytics
    await this.sendToAnalytics(eventProps);
  }

  /**
   * Update user profile data
   */
  private updateUserProfile(email: string, updates: Partial<UserProfile>): void {
    const existingProfile = this.userProfiles.get(email) || { email };
    const updatedProfile = { ...existingProfile, ...updates };

    // Update engagement metrics
    if (updates.lastActiveDate) {
      updatedProfile.totalPageViews = (updatedProfile.totalPageViews || 0) + 1;
    }

    this.userProfiles.set(email, updatedProfile);
  }

  /**
   * Get user journey analytics
   */
  public getUserJourneyAnalytics(email: string): {
    profile: UserProfile | null;
    currentStage: UserJourneyStage | null;
    completedStages: UserJourneyStage[];
    conversionFunnel: Record<UserJourneyStage, number>;
  } {
    const profile = this.userProfiles.get(email) || null;

    // Find user's current session
    let currentStage: UserJourneyStage | null = null;
    let completedStages: UserJourneyStage[] = [];

    for (const [, session] of this.sessionData) {
      const userEvents = session.events.filter(e => e.email === email);
      if (userEvents.length > 0) {
        currentStage = session.currentStage;
        completedStages = [...new Set(userEvents.map(e => e.stage))];
        break;
      }
    }

    // Calculate conversion funnel
    const conversionFunnel: Record<UserJourneyStage, number> = {
      [UserJourneyStage.AWARENESS]: 0,
      [UserJourneyStage.INTEREST]: 0,
      [UserJourneyStage.CONSIDERATION]: 0,
      [UserJourneyStage.INTENT]: 0,
      [UserJourneyStage.PURCHASE]: 0,
      [UserJourneyStage.RETENTION]: 0,
      [UserJourneyStage.ADVOCACY]: 0,
    };

    // Count events by stage for this user
    for (const session of this.sessionData.values()) {
      const userEvents = session.events.filter(e => e.email === email);
      for (const event of userEvents) {
        conversionFunnel[event.stage]++;
      }
    }

    return {
      profile,
      currentStage,
      completedStages,
      conversionFunnel,
    };
  }

  /**
   * Get session analytics
   */
  public getSessionAnalytics(sessionId: string): {
    duration: number;
    events: UserJourneyEventProps[];
    currentStage: UserJourneyStage;
    stageProgression: UserJourneyStage[];
  } | null {
    const session = this.sessionData.get(sessionId);
    if (!session) {
      return null;
    }

    const duration = Date.now() - session.startTime.getTime();
    const stageProgression = [...new Set(session.events.map(e => e.stage))];

    return {
      duration,
      events: session.events,
      currentStage: session.currentStage,
      stageProgression,
    };
  }

  /**
   * Send event to Klaviyo
   */
  private async sendToKlaviyo(event: { eventName: string; properties: Record<string, any> }): Promise<void> {
    try {
      // Import Klaviyo module dynamically to avoid circular dependencies
      const { Klaviyo } = await import('../../Klaviyo');

      if (event.properties.email) {
        await Klaviyo.track(event.eventName, event.properties);
      }
    } catch (error) {
      console.error('[UserJourneyTracker] Failed to send event to Klaviyo:', error);
    }
  }

  /**
   * Send event to analytics
   */
  private async sendToAnalytics(event: UserJourneyEventProps): Promise<void> {
    try {
      // Send to Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', event.event, {
          event_category: 'user_journey',
          event_label: event.stage,
          custom_session_id: event.sessionId,
          custom_user_id: event.userId,
          custom_email: event.email,
          ...event.properties,
        });
      }

      // Send to internal analytics API
      // await fetch('/api/analytics/user-journey', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // });
    } catch (error) {
      console.error('[UserJourneyTracker] Failed to send event to analytics:', error);
    }
  }

  /**
   * Get conversion rate by stage
   */
  public getConversionRates(): Record<UserJourneyStage, { users: number; conversionRate: number }> {
    const stageCounts: Record<UserJourneyStage, Set<string>> = {
      [UserJourneyStage.AWARENESS]: new Set(),
      [UserJourneyStage.INTEREST]: new Set(),
      [UserJourneyStage.CONSIDERATION]: new Set(),
      [UserJourneyStage.INTENT]: new Set(),
      [UserJourneyStage.PURCHASE]: new Set(),
      [UserJourneyStage.RETENTION]: new Set(),
      [UserJourneyStage.ADVOCACY]: new Set(),
    };

    // Count unique users by stage
    for (const session of this.sessionData.values()) {
      for (const event of session.events) {
        if (event.email) {
          stageCounts[event.stage].add(event.email);
        }
      }
    }

    const totalUsers = stageCounts[UserJourneyStage.AWARENESS].size;
    const conversionRates: Record<UserJourneyStage, { users: number; conversionRate: number }> = {
      [UserJourneyStage.AWARENESS]: { users: totalUsers, conversionRate: 100 },
      [UserJourneyStage.INTEREST]: { users: 0, conversionRate: 0 },
      [UserJourneyStage.CONSIDERATION]: { users: 0, conversionRate: 0 },
      [UserJourneyStage.INTENT]: { users: 0, conversionRate: 0 },
      [UserJourneyStage.PURCHASE]: { users: 0, conversionRate: 0 },
      [UserJourneyStage.RETENTION]: { users: 0, conversionRate: 0 },
      [UserJourneyStage.ADVOCACY]: { users: 0, conversionRate: 0 },
    };

    Object.entries(stageCounts).forEach(([stage, users]) => {
      const userCount = users.size;
      const conversionRate = totalUsers > 0 ? (userCount / totalUsers) * 100 : 0;
      conversionRates[stage as UserJourneyStage] = { users: userCount, conversionRate };
    });

    return conversionRates;
  }

  /**
   * Clean up old session data
   */
  public cleanupOldSessions(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoffTime = Date.now() - maxAge;

    for (const [sessionId, session] of this.sessionData) {
      if (session.startTime.getTime() < cutoffTime) {
        this.sessionData.delete(sessionId);
      }
    }
  }
}

// Singleton instance
export const userJourneyTracker = UserJourneyTracker.getInstance();

// Convenience functions for common events
export const trackLandingPageView = (sessionId: string, properties?: Record<string, any>) =>
  userJourneyTracker.trackEvent({
    sessionId,
    stage: UserJourneyStage.AWARENESS,
    event: UserJourneyEvent.LANDING_PAGE_VIEW,
    properties,
  });

export const trackProductView = (sessionId: string, productId: string, email?: string, properties?: Record<string, any>) =>
  userJourneyTracker.trackEvent({
    email,
    sessionId,
    stage: UserJourneyStage.INTEREST,
    event: UserJourneyEvent.PRODUCT_PAGE_VIEW,
    properties: { productId, ...properties },
  });

export const trackCheckoutStart = (sessionId: string, email: string, properties?: Record<string, any>) =>
  userJourneyTracker.trackEvent({
    email,
    sessionId,
    stage: UserJourneyStage.INTENT,
    event: UserJourneyEvent.CHECKOUT_START,
    properties,
  });

export const trackPaymentSuccess = (sessionId: string, email: string, orderId: string, amount: number, properties?: Record<string, any>) =>
  userJourneyTracker.trackEvent({
    email,
    sessionId,
    stage: UserJourneyStage.PURCHASE,
    event: UserJourneyEvent.PAYMENT_SUCCESS,
    properties: { orderId, amount, ...properties },
  });
