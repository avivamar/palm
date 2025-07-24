/**
 * 产品交互事件追踪
 * 追踪用户与产品相关的所有交互行为
 */

export enum ProductInteractionEvent {
  // Product Discovery
  PRODUCT_SEARCH = 'Product Search',
  PRODUCT_FILTER = 'Product Filter',
  PRODUCT_SORT = 'Product Sort',

  // Product Engagement
  PRODUCT_VIEW = 'Product View',
  PRODUCT_IMAGE_VIEW = 'Product Image View',
  PRODUCT_VIDEO_PLAY = 'Product Video Play',
  PRODUCT_360_VIEW = 'Product 360 View',

  // Product Comparison
  PRODUCT_COMPARE_ADD = 'Product Compare Add',
  PRODUCT_COMPARE_REMOVE = 'Product Compare Remove',
  PRODUCT_COMPARE_VIEW = 'Product Compare View',

  // Product Configuration
  COLOR_SELECT = 'Color Select',
  SIZE_SELECT = 'Size Select',
  VARIANT_SELECT = 'Variant Select',
  CUSTOMIZATION_START = 'Customization Start',
  CUSTOMIZATION_COMPLETE = 'Customization Complete',

  // Product Interaction
  ZOOM_IN = 'Zoom In',
  ZOOM_OUT = 'Zoom Out',
  IMAGE_GALLERY_NAVIGATE = 'Image Gallery Navigate',
  SPECIFICATION_VIEW = 'Specification View',
  REVIEWS_VIEW = 'Reviews View',

  // Cart Actions
  ADD_TO_CART = 'Add to Cart',
  REMOVE_FROM_CART = 'Remove from Cart',
  UPDATE_QUANTITY = 'Update Quantity',
  SAVE_FOR_LATER = 'Save for Later',

  // Wishlist Actions
  ADD_TO_WISHLIST = 'Add to Wishlist',
  REMOVE_FROM_WISHLIST = 'Remove from Wishlist',
  WISHLIST_SHARE = 'Wishlist Share',

  // Social Interactions
  PRODUCT_SHARE = 'Product Share',
  PRODUCT_LIKE = 'Product Like',
  PRODUCT_REVIEW_WRITE = 'Product Review Write',
  PRODUCT_QA_ASK = 'Product QA Ask',
  PRODUCT_QA_ANSWER = 'Product QA Answer',
}

type ProductInteractionProps = {
  email?: string;
  userId?: string;
  sessionId: string;
  event: ProductInteractionEvent;
  productId: string;
  productName?: string;
  productCategory?: string;
  productPrice?: number;
  productCurrency?: string;
  variant?: {
    color?: string;
    size?: string;
    sku?: string;
  };
  properties?: Record<string, any>;
  timestamp?: Date;
};

type ProductAnalytics = {
  productId: string;
  productName?: string;
  totalViews: number;
  uniqueViews: number;
  averageViewDuration: number;
  conversionRate: number;
  addToCartRate: number;
  bounceRate: number;
  popularVariants: Array<{
    variant: string;
    count: number;
    percentage: number;
  }>;
  userInteractions: Array<{
    event: ProductInteractionEvent;
    count: number;
    users: number;
  }>;
  heatmapData: Record<string, number>;
};

/**
 * Product interaction tracking system
 */
export class ProductInteractionTracker {
  private static instance: ProductInteractionTracker;
  private interactions: Map<string, ProductInteractionProps[]> = new Map();
  private productSessions: Map<string, {
    startTime: Date;
    endTime?: Date;
    events: ProductInteractionEvent[];
    addedToCart: boolean;
    purchased: boolean;
  }> = new Map();

  private constructor() {}

  public static getInstance(): ProductInteractionTracker {
    if (!ProductInteractionTracker.instance) {
      ProductInteractionTracker.instance = new ProductInteractionTracker();
    }
    return ProductInteractionTracker.instance;
  }

  /**
   * Track product interaction event
   */
  public async trackProductInteraction(interactionProps: ProductInteractionProps): Promise<void> {
    const {
      email,
      userId,
      sessionId,
      event,
      productId,
      productName,
      productCategory,
      productPrice,
      productCurrency,
      variant,
      properties = {},
      timestamp = new Date(),
    } = interactionProps;

    // Store interaction data
    const key = `${sessionId}_${productId}`;
    const interactions = this.interactions.get(key) || [];
    interactions.push(interactionProps);
    this.interactions.set(key, interactions);

    // Update product session data
    this.updateProductSession(sessionId, productId, event, timestamp);

    // Prepare enhanced properties for Klaviyo
    const enhancedProperties = {
      email,
      userId,
      sessionId,
      productId,
      productName,
      productCategory,
      productPrice,
      productCurrency,
      variant,
      timestamp: timestamp.toISOString(),

      // Interaction context
      interactionNumber: interactions.length,
      timeOnProduct: this.getTimeOnProduct(sessionId, productId),
      previousEvents: interactions.slice(-3).map(i => i.event), // Last 3 events

      // Product metrics
      totalProductViews: await this.getProductViewCount(productId),
      userProductHistory: await this.getUserProductHistory(email, productId),

      ...properties,
    };

    // Send to Klaviyo
    await this.sendToKlaviyo(event, enhancedProperties);

    // Send to analytics
    await this.sendToAnalytics(interactionProps, enhancedProperties);

    // Trigger real-time recommendations if applicable
    if (this.shouldTriggerRecommendations(event)) {
      await this.triggerProductRecommendations(email, productId, enhancedProperties);
    }
  }

  /**
   * Update product session tracking
   */
  private updateProductSession(sessionId: string, productId: string, event: ProductInteractionEvent, timestamp: Date): void {
    const key = `${sessionId}_${productId}`;
    const session = this.productSessions.get(key) || {
      startTime: timestamp,
      events: [],
      addedToCart: false,
      purchased: false,
    };

    session.events.push(event);
    session.endTime = timestamp;

    // Update conversion flags
    if (event === ProductInteractionEvent.ADD_TO_CART) {
      session.addedToCart = true;
    }

    this.productSessions.set(key, session);
  }

  /**
   * Get time spent on product
   */
  private getTimeOnProduct(sessionId: string, productId: string): number {
    const key = `${sessionId}_${productId}`;
    const session = this.productSessions.get(key);

    if (!session || !session.endTime) {
      return 0;
    }

    return session.endTime.getTime() - session.startTime.getTime();
  }

  /**
   * Get product view count
   */
  private async getProductViewCount(productId: string): Promise<number> {
    let count = 0;
    for (const interactions of this.interactions.values()) {
      count += interactions.filter(i =>
        i.productId === productId && i.event === ProductInteractionEvent.PRODUCT_VIEW,
      ).length;
    }
    return count;
  }

  /**
   * Get user's product interaction history
   */
  private async getUserProductHistory(email?: string, productId?: string): Promise<{
    totalInteractions: number;
    lastInteraction?: Date;
    favoriteVariant?: string;
    hasAddedToCart: boolean;
    hasPurchased: boolean;
  }> {
    if (!email) {
      return {
        totalInteractions: 0,
        hasAddedToCart: false,
        hasPurchased: false,
      };
    }

    let totalInteractions = 0;
    let lastInteraction: Date | undefined;
    let hasAddedToCart = false;
    const hasPurchased = false;
    const variants: Record<string, number> = {};

    // Analyze all interactions for this user and product
    for (const interactions of this.interactions.values()) {
      const userInteractions = interactions.filter(i =>
        i.email === email && (!productId || i.productId === productId),
      );

      totalInteractions += userInteractions.length;

      for (const interaction of userInteractions) {
        if (!lastInteraction || interaction.timestamp! > lastInteraction) {
          lastInteraction = interaction.timestamp;
        }

        if (interaction.event === ProductInteractionEvent.ADD_TO_CART) {
          hasAddedToCart = true;
        }

        // Track variant preferences
        if (interaction.variant?.color) {
          variants[interaction.variant.color] = (variants[interaction.variant.color] || 0) + 1;
        }
      }
    }

    // Find favorite variant
    const favoriteVariant = Object.entries(variants)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    return {
      totalInteractions,
      lastInteraction,
      favoriteVariant,
      hasAddedToCart,
      hasPurchased,
    };
  }

  /**
   * Check if should trigger recommendations
   */
  private shouldTriggerRecommendations(event: ProductInteractionEvent): boolean {
    const triggerEvents = [
      ProductInteractionEvent.PRODUCT_VIEW,
      ProductInteractionEvent.ADD_TO_CART,
      ProductInteractionEvent.ADD_TO_WISHLIST,
      ProductInteractionEvent.COLOR_SELECT,
    ];

    return triggerEvents.includes(event);
  }

  /**
   * Trigger product recommendations
   */
  private async triggerProductRecommendations(
    email?: string,
    productId?: string,
    context?: Record<string, any>,
  ): Promise<void> {
    if (!email) {
      return;
    }

    try {
      // This would integrate with a recommendation engine
      // For now, we'll track the recommendation trigger event
      await this.sendToKlaviyo('Product Recommendation Triggered', {
        email,
        triggerProductId: productId,
        context,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[ProductInteractionTracker] Failed to trigger recommendations:', error);
    }
  }

  /**
   * Get product analytics
   */
  public getProductAnalytics(productId: string, timeRange?: { start: Date; end: Date }): ProductAnalytics {
    const productInteractions: ProductInteractionProps[] = [];
    const uniqueUsers = new Set<string>();
    const viewDurations: number[] = [];
    const variants: Record<string, number> = {};
    const eventCounts: Record<ProductInteractionEvent, { count: number; users: Set<string> }> = {} as any;

    // Collect all interactions for this product
    for (const interactions of this.interactions.values()) {
      const filtered = interactions.filter((i) => {
        if (i.productId !== productId) {
          return false;
        }
        if (timeRange) {
          const timestamp = i.timestamp || new Date();
          return timestamp >= timeRange.start && timestamp <= timeRange.end;
        }
        return true;
      });

      productInteractions.push(...filtered);

      // Collect unique users
      filtered.forEach((i) => {
        if (i.email) {
          uniqueUsers.add(i.email);
        }

        // Count variants
        if (i.variant?.color) {
          variants[i.variant.color] = (variants[i.variant.color] || 0) + 1;
        }

        // Count events
        if (!eventCounts[i.event]) {
          eventCounts[i.event] = { count: 0, users: new Set() };
        }
        eventCounts[i.event].count++;
        if (i.email) {
          eventCounts[i.event].users.add(i.email);
        }
      });
    }

    // Calculate view durations
    for (const session of this.productSessions.values()) {
      if (session.events.some(e => productInteractions.some(i => i.event === e))) {
        const duration = session.endTime
          ? session.endTime.getTime() - session.startTime.getTime()
          : 0;
        if (duration > 0) {
          viewDurations.push(duration);
        }
      }
    }

    // Calculate metrics
    const totalViews = productInteractions.filter(i => i.event === ProductInteractionEvent.PRODUCT_VIEW).length;
    const uniqueViews = uniqueUsers.size;
    const averageViewDuration = viewDurations.length > 0
      ? viewDurations.reduce((a, b) => a + b, 0) / viewDurations.length
      : 0;

    const addToCartCount = productInteractions.filter(i => i.event === ProductInteractionEvent.ADD_TO_CART).length;
    const addToCartRate = totalViews > 0 ? (addToCartCount / totalViews) * 100 : 0;

    // Calculate bounce rate (users who viewed but didn't interact further)
    const bouncedUsers = Array.from(uniqueUsers).filter((user) => {
      const userInteractions = productInteractions.filter(i => i.email === user);
      return userInteractions.length === 1 && userInteractions[0]?.event === ProductInteractionEvent.PRODUCT_VIEW;
    });
    const bounceRate = uniqueUsers.size > 0 ? (bouncedUsers.length / uniqueUsers.size) * 100 : 0;

    // Popular variants
    const totalVariantSelections = Object.values(variants).reduce((a, b) => a + b, 0);
    const popularVariants = Object.entries(variants)
      .map(([variant, count]) => ({
        variant,
        count,
        percentage: totalVariantSelections > 0 ? (count / totalVariantSelections) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // User interactions summary
    const userInteractions = Object.entries(eventCounts).map(([event, data]) => ({
      event: event as ProductInteractionEvent,
      count: data.count,
      users: data.users.size,
    })).sort((a, b) => b.count - a.count);

    return {
      productId,
      productName: productInteractions[0]?.productName,
      totalViews,
      uniqueViews,
      averageViewDuration,
      conversionRate: 0, // Would need purchase data
      addToCartRate,
      bounceRate,
      popularVariants,
      userInteractions,
      heatmapData: {}, // Would need UI interaction data
    };
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
      console.error('[ProductInteractionTracker] Failed to send event to Klaviyo:', error);
    }
  }

  /**
   * Send event to analytics
   */
  private async sendToAnalytics(
    interaction: ProductInteractionProps,
    enhancedProperties: Record<string, any>,
  ): Promise<void> {
    try {
      // Send to Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', interaction.event, {
          event_category: 'product_interaction',
          event_label: interaction.productId,
          value: interaction.productPrice,
          custom_session_id: interaction.sessionId,
          custom_user_id: interaction.userId,
          custom_product_id: interaction.productId,
          ...enhancedProperties,
        });
      }

      // Send to internal analytics API
      // await fetch('/api/analytics/product-interactions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ interaction, enhancedProperties })
      // });
    } catch (error) {
      console.error('[ProductInteractionTracker] Failed to send event to analytics:', error);
    }
  }

  /**
   * Clean up old interaction data
   */
  public cleanupOldData(maxAge: number = 30 * 24 * 60 * 60 * 1000): void {
    const cutoffTime = Date.now() - maxAge;

    for (const [key, interactions] of this.interactions) {
      const filtered = interactions.filter(i =>
        (i.timestamp?.getTime() || 0) > cutoffTime,
      );

      if (filtered.length === 0) {
        this.interactions.delete(key);
      } else {
        this.interactions.set(key, filtered);
      }
    }

    for (const [key, session] of this.productSessions) {
      if (session.startTime.getTime() < cutoffTime) {
        this.productSessions.delete(key);
      }
    }
  }
}

// Singleton instance
export const productInteractionTracker = ProductInteractionTracker.getInstance();

// Convenience functions for common product interactions
export const trackProductView = (sessionId: string, productId: string, email?: string, properties?: Record<string, any>) =>
  productInteractionTracker.trackProductInteraction({
    email,
    sessionId,
    event: ProductInteractionEvent.PRODUCT_VIEW,
    productId,
    properties,
  });

export const trackColorSelect = (sessionId: string, productId: string, color: string, email?: string, properties?: Record<string, any>) =>
  productInteractionTracker.trackProductInteraction({
    email,
    sessionId,
    event: ProductInteractionEvent.COLOR_SELECT,
    productId,
    variant: { color },
    properties,
  });

export const trackAddToCart = (sessionId: string, productId: string, email?: string, quantity: number = 1, properties?: Record<string, any>) =>
  productInteractionTracker.trackProductInteraction({
    email,
    sessionId,
    event: ProductInteractionEvent.ADD_TO_CART,
    productId,
    properties: { quantity, ...properties },
  });

export const trackProductShare = (sessionId: string, productId: string, platform: string, email?: string, properties?: Record<string, any>) =>
  productInteractionTracker.trackProductInteraction({
    email,
    sessionId,
    event: ProductInteractionEvent.PRODUCT_SHARE,
    productId,
    properties: { platform, ...properties },
  });
