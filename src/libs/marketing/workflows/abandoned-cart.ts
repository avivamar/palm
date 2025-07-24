/**
 * 购物车挽回自动化工作流
 * 智能化挽回放弃购物车的用户，提高转化率
 */

export enum AbandonedCartStep {
  IMMEDIATE_REMINDER = 'immediate_reminder',
  BENEFIT_HIGHLIGHT = 'benefit_highlight',
  SOCIAL_PROOF = 'social_proof',
  INCENTIVE_OFFER = 'incentive_offer',
  FINAL_URGENCY = 'final_urgency',
  LAST_CHANCE = 'last_chance',
}

export enum AbandonmentReason {
  HIGH_PRICE = 'high_price',
  SHIPPING_COST = 'shipping_cost',
  DELIVERY_TIME = 'delivery_time',
  PAYMENT_ISSUES = 'payment_issues',
  COMPARISON_SHOPPING = 'comparison_shopping',
  DISTRACTION = 'distraction',
  UNCERTAINTY = 'uncertainty',
  UNKNOWN = 'unknown',
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
  imageUrl?: string;
};

type AbandonedCartData = {
  cartId: string;
  userEmail: string;
  userId?: string;
  sessionId: string;
  abandonmentTime: Date;
  cartItems: CartItem[];
  cartValue: number;
  currency: string;

  // Abandonment context
  checkoutStep?: 'product_selection' | 'shipping_info' | 'payment_info' | 'review';
  timeOnCart: number; // seconds spent on cart/checkout
  deviceType: 'mobile' | 'desktop' | 'tablet';
  userAgent?: string;

  // User context
  isFirstTimeCustomer: boolean;
  previousCartAbandons: number;
  lastPurchaseDate?: Date;
  averageOrderValue?: number;
  engagementScore: number;
  preferredLanguage: string;
  location?: {
    country: string;
    timezone: string;
  };

  // Behavioral insights
  priceComparison?: boolean;
  shippingConcerns?: boolean;
  paymentHesitation?: boolean;
  mobileCheckoutIssues?: boolean;
};

type CartRecoverySequence = {
  cartId: string;
  userEmail: string;
  currentStep: AbandonedCartStep;
  startDate: Date;
  completedSteps: AbandonedCartStep[];
  nextSendTime: Date;
  isActive: boolean;
  isRecovered: boolean;
  recoveryValue?: number;
  totalEmailsSent: number;
  abTestVariant?: string;
  customIncentive?: {
    type: 'discount' | 'free_shipping' | 'gift' | 'extended_warranty';
    value: number | string;
    code?: string;
    expiryDate: Date;
  };
};

/**
 * Abandoned Cart Recovery Workflow
 */
export class AbandonedCartWorkflow {
  private static instance: AbandonedCartWorkflow;
  private recoverySequences: Map<string, CartRecoverySequence> = new Map();

  private constructor() {}

  public static getInstance(): AbandonedCartWorkflow {
    if (!AbandonedCartWorkflow.instance) {
      AbandonedCartWorkflow.instance = new AbandonedCartWorkflow();
    }
    return AbandonedCartWorkflow.instance;
  }

  /**
   * Start cart recovery sequence
   */
  public async startCartRecovery(cartData: AbandonedCartData): Promise<void> {
    const sequenceId = `cart_recovery_${cartData.cartId}_${Date.now()}`;

    // Check if cart already has active recovery sequence
    const existingSequence = Array.from(this.recoverySequences.values())
      .find(seq => seq.cartId === cartData.cartId && seq.isActive);

    if (existingSequence) {
      console.log(`[AbandonedCartWorkflow] Cart ${cartData.cartId} already has active recovery sequence`);
      return;
    }

    // Analyze abandonment reason
    const abandonmentReason = await this.analyzeAbandonmentReason(cartData);

    // Determine optimal recovery strategy
    const recoveryStrategy = this.determineRecoveryStrategy(cartData, abandonmentReason);

    // Generate personalized incentive if needed
    const customIncentive = await this.generateCustomIncentive(cartData, abandonmentReason);

    // Initialize recovery sequence
    this.recoverySequences.set(sequenceId, {
      cartId: cartData.cartId,
      userEmail: cartData.userEmail,
      currentStep: AbandonedCartStep.IMMEDIATE_REMINDER,
      startDate: new Date(),
      completedSteps: [],
      nextSendTime: new Date(Date.now() + (1 * 60 * 60 * 1000)), // 1 hour delay
      isActive: true,
      isRecovered: false,
      totalEmailsSent: 0,
      abTestVariant: this.determineABTestVariant(cartData),
      customIncentive,
    });

    // Track cart abandonment
    await this.trackCartEvent('Cart Abandoned', {
      ...cartData,
      abandonmentReason,
      recoveryStrategy,
      sequenceId,
    });

    // Schedule recovery emails
    await this.scheduleRecoverySequence(sequenceId, cartData, abandonmentReason);
  }

  /**
   * Analyze abandonment reason using behavioral data
   */
  private async analyzeAbandonmentReason(cartData: AbandonedCartData): Promise<AbandonmentReason> {
    const { checkoutStep, timeOnCart, cartValue, deviceType, averageOrderValue } = cartData;

    // Price-related abandonment
    if (averageOrderValue && cartValue > averageOrderValue * 1.5) {
      return AbandonmentReason.HIGH_PRICE;
    }

    // Checkout step analysis
    if (checkoutStep === 'shipping_info' && timeOnCart > 120) {
      return AbandonmentReason.SHIPPING_COST;
    }

    if (checkoutStep === 'payment_info' && timeOnCart > 180) {
      return AbandonmentReason.PAYMENT_ISSUES;
    }

    // Mobile-specific issues
    if (deviceType === 'mobile' && timeOnCart < 60) {
      return AbandonmentReason.COMPARISON_SHOPPING;
    }

    // Quick abandonment usually indicates distraction
    if (timeOnCart < 30) {
      return AbandonmentReason.DISTRACTION;
    }

    // Extended time without completion suggests uncertainty
    if (timeOnCart > 300) {
      return AbandonmentReason.UNCERTAINTY;
    }

    return AbandonmentReason.UNKNOWN;
  }

  /**
   * Determine recovery strategy based on user and abandonment data
   */
  private determineRecoveryStrategy(
    cartData: AbandonedCartData,
    reason: AbandonmentReason,
  ): 'gentle' | 'incentive_heavy' | 'urgency_focused' | 'educational' {
    const { isFirstTimeCustomer, engagementScore, previousCartAbandons } = cartData;

    // First-time customers get gentle approach
    if (isFirstTimeCustomer && previousCartAbandons === 0) {
      return 'gentle';
    }

    // Price-sensitive users get incentive-heavy approach
    if (reason === AbandonmentReason.HIGH_PRICE || reason === AbandonmentReason.SHIPPING_COST) {
      return 'incentive_heavy';
    }

    // High abandonment rate users get urgency
    if (previousCartAbandons > 2) {
      return 'urgency_focused';
    }

    // Uncertain users get educational approach
    if (reason === AbandonmentReason.UNCERTAINTY || engagementScore < 40) {
      return 'educational';
    }

    return 'gentle';
  }

  /**
   * Generate custom incentive based on user and cart data
   */
  private async generateCustomIncentive(
    cartData: AbandonedCartData,
    reason: AbandonmentReason,
  ): Promise<CartRecoverySequence['customIncentive']> {
    const { cartValue, isFirstTimeCustomer, previousCartAbandons } = cartData;

    // No incentive for gentle approach
    if (isFirstTimeCustomer && previousCartAbandons === 0) {
      return undefined;
    }

    // Shipping-related concerns get free shipping
    if (reason === AbandonmentReason.SHIPPING_COST || reason === AbandonmentReason.DELIVERY_TIME) {
      return {
        type: 'free_shipping',
        value: 'Free Shipping',
        code: this.generateDiscountCode(cartData.userEmail),
        expiryDate: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // 7 days
      };
    }

    // Price concerns get percentage discount
    if (reason === AbandonmentReason.HIGH_PRICE) {
      const discountPercentage = cartValue > 200 ? 15 : 10;
      return {
        type: 'discount',
        value: discountPercentage,
        code: this.generateDiscountCode(cartData.userEmail),
        expiryDate: new Date(Date.now() + (5 * 24 * 60 * 60 * 1000)), // 5 days
      };
    }

    // High-value carts get premium incentives
    if (cartValue > 300) {
      return {
        type: 'extended_warranty',
        value: '2-Year Extended Warranty',
        code: this.generateDiscountCode(cartData.userEmail),
        expiryDate: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)), // 3 days
      };
    }

    // Default small discount for repeat abandoners
    if (previousCartAbandons > 1) {
      return {
        type: 'discount',
        value: 5,
        code: this.generateDiscountCode(cartData.userEmail),
        expiryDate: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)), // 7 days
      };
    }

    return undefined;
  }

  /**
   * Schedule complete recovery sequence
   */
  private async scheduleRecoverySequence(
    sequenceId: string,
    cartData: AbandonedCartData,
    reason: AbandonmentReason,
  ): Promise<void> {
    const sequence = this.recoverySequences.get(sequenceId);
    if (!sequence) {
      return;
    }

    const steps = this.getRecoverySteps(cartData, reason);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (!step) {
        continue;
      }

      const delay = this.getStepDelay(step, i);

      setTimeout(async () => {
        await this.executeRecoveryStep(sequenceId, cartData, step);
      }, delay);
    }
  }

  /**
   * Get recovery steps based on strategy
   */
  private getRecoverySteps(cartData: AbandonedCartData, reason: AbandonmentReason): AbandonedCartStep[] {
    const strategy = this.determineRecoveryStrategy(cartData, reason);

    const strategySteps: Record<'gentle' | 'incentive_heavy' | 'urgency_focused' | 'educational', AbandonedCartStep[]> = {
      gentle: [
        AbandonedCartStep.IMMEDIATE_REMINDER,
        AbandonedCartStep.BENEFIT_HIGHLIGHT,
        AbandonedCartStep.SOCIAL_PROOF,
      ],
      incentive_heavy: [
        AbandonedCartStep.IMMEDIATE_REMINDER,
        AbandonedCartStep.INCENTIVE_OFFER,
        AbandonedCartStep.FINAL_URGENCY,
        AbandonedCartStep.LAST_CHANCE,
      ],
      urgency_focused: [
        AbandonedCartStep.IMMEDIATE_REMINDER,
        AbandonedCartStep.FINAL_URGENCY,
        AbandonedCartStep.LAST_CHANCE,
      ],
      educational: [
        AbandonedCartStep.IMMEDIATE_REMINDER,
        AbandonedCartStep.BENEFIT_HIGHLIGHT,
        AbandonedCartStep.SOCIAL_PROOF,
        AbandonedCartStep.INCENTIVE_OFFER,
      ],
    };

    return strategySteps[strategy];
  }

  /**
   * Get delay for each step
   */
  private getStepDelay(step: AbandonedCartStep, _index: number): number {
    const baseDelays: Record<AbandonedCartStep, number> = {
      [AbandonedCartStep.IMMEDIATE_REMINDER]: 1, // 1 hour
      [AbandonedCartStep.BENEFIT_HIGHLIGHT]: 24, // 1 day
      [AbandonedCartStep.SOCIAL_PROOF]: 72, // 3 days
      [AbandonedCartStep.INCENTIVE_OFFER]: 120, // 5 days
      [AbandonedCartStep.FINAL_URGENCY]: 144, // 6 days
      [AbandonedCartStep.LAST_CHANCE]: 168, // 7 days
    };

    return (baseDelays[step] || 24) * 60 * 60 * 1000; // Convert to milliseconds
  }

  /**
   * Execute specific recovery step
   */
  private async executeRecoveryStep(
    sequenceId: string,
    cartData: AbandonedCartData,
    step: AbandonedCartStep,
  ): Promise<void> {
    const sequence = this.recoverySequences.get(sequenceId);
    if (!sequence || !sequence.isActive || sequence.isRecovered) {
      return;
    }

    try {
      // Generate step content
      const emailContent = await this.generateStepContent(step, cartData, sequence);

      // Send email
      await this.sendRecoveryEmail(cartData.userEmail, emailContent);

      // Update sequence
      sequence.completedSteps.push(step);
      sequence.totalEmailsSent++;
      sequence.currentStep = step;

      // Track step completion
      await this.trackCartEvent('Recovery Email Sent', {
        sequenceId,
        step,
        userEmail: cartData.userEmail,
        cartId: cartData.cartId,
        emailSubject: emailContent.subject,
        hasIncentive: !!sequence.customIncentive,
      });

      console.log(`[AbandonedCartWorkflow] Sent ${step} email for cart ${cartData.cartId}`);
    } catch (error) {
      console.error(`[AbandonedCartWorkflow] Failed to execute step ${step}:`, error);
      await this.trackCartEvent('Recovery Email Error', {
        sequenceId,
        step,
        error: (error as Error).message,
      });
    }
  }

  /**
   * Generate content for recovery step
   */
  private async generateStepContent(
    step: AbandonedCartStep,
    cartData: AbandonedCartData,
    sequence: CartRecoverySequence,
  ): Promise<{
    subject: string;
    templateId: string;
    personalizations: Record<string, any>;
  }> {
    const { cartItems, cartValue, currency, userEmail, deviceType } = cartData;
    const firstName = userEmail.split('@')[0]; // Simplified name extraction

    const basePersonalizations = {
      firstName,
      cartItems: cartItems.map(item => ({
        ...item,
        formattedPrice: this.formatPrice(item.unitPrice, currency),
      })),
      cartValue: this.formatPrice(cartValue, currency),
      cartItemCount: cartItems.length,
      deviceType,
      recoveryUrl: this.generateRecoveryUrl(cartData.cartId, userEmail),
      customIncentive: sequence.customIncentive,
    };

    const stepConfigs: Record<AbandonedCartStep, {
      subject: string;
      templateId: string;
      personalizations: Record<string, any>;
    }> = {
      [AbandonedCartStep.IMMEDIATE_REMINDER]: {
        subject: `You left something behind, ${firstName}`,
        templateId: 'cart_recovery_reminder_v1',
        personalizations: {
          ...basePersonalizations,
          isGentle: true,
          message: 'Your items are waiting for you',
        },
      },

      [AbandonedCartStep.BENEFIT_HIGHLIGHT]: {
        subject: `Why ${cartItems[0]?.productName} is perfect for you`,
        templateId: 'cart_recovery_benefits_v1',
        personalizations: {
          ...basePersonalizations,
          productBenefits: await this.getProductBenefits(cartItems),
          freeShippingThreshold: 299,
          warrantyInfo: '2-year warranty included',
        },
      },

      [AbandonedCartStep.SOCIAL_PROOF]: {
        subject: `Join 1,000+ happy customers who chose Rolitt`,
        templateId: 'cart_recovery_social_proof_v1',
        personalizations: {
          ...basePersonalizations,
          testimonials: await this.getRelevantTestimonials(cartData),
          totalCustomers: 1247,
          averageRating: 4.9,
          recentPurchases: 23,
        },
      },

      [AbandonedCartStep.INCENTIVE_OFFER]: {
        subject: sequence.customIncentive
          ? `${sequence.customIncentive.value}% off your Rolitt order`
          : `Complete your order and save`,
        templateId: 'cart_recovery_incentive_v1',
        personalizations: {
          ...basePersonalizations,
          hasSpecialOffer: !!sequence.customIncentive,
          incentiveExpiryDate: sequence.customIncentive?.expiryDate?.toLocaleDateString(),
          urgencyLevel: 'medium',
        },
      },

      [AbandonedCartStep.FINAL_URGENCY]: {
        subject: `⏰ Your cart expires in 24 hours`,
        templateId: 'cart_recovery_urgency_v1',
        personalizations: {
          ...basePersonalizations,
          urgencyLevel: 'high',
          expiryTime: '24 hours',
          stockLevel: 'limited',
          isLimitedTime: true,
        },
      },

      [AbandonedCartStep.LAST_CHANCE]: {
        subject: `Last chance: Your ${cartItems[0]?.productName} is about to expire`,
        templateId: 'cart_recovery_last_chance_v1',
        personalizations: {
          ...basePersonalizations,
          urgencyLevel: 'critical',
          isFinalEmail: true,
          alternativeProducts: await this.getAlternativeProducts(cartItems),
        },
      },
    };

    return stepConfigs[step];
  }

  /**
   * Send recovery email via Klaviyo
   */
  private async sendRecoveryEmail(
    email: string,
    content: { subject: string; templateId: string; personalizations: Record<string, any> },
  ): Promise<void> {
    try {
      const { Klaviyo } = await import('../../Klaviyo');

      await Klaviyo.track('Cart Recovery Email Sent', {
        email,
        subject: content.subject,
        templateId: content.templateId,
        personalizations: content.personalizations,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[AbandonedCartWorkflow] Failed to send recovery email:', error);
      throw error;
    }
  }

  /**
   * Mark cart as recovered
   */
  public async markCartRecovered(cartId: string, recoveryValue: number): Promise<void> {
    const sequence = Array.from(this.recoverySequences.values())
      .find(seq => seq.cartId === cartId && seq.isActive);

    if (sequence) {
      sequence.isRecovered = true;
      sequence.isActive = false;
      sequence.recoveryValue = recoveryValue;

      await this.trackCartEvent('Cart Recovered', {
        cartId,
        sequenceId: cartId,
        recoveryValue,
        emailsSent: sequence.totalEmailsSent,
        recoveryStep: sequence.currentStep,
        timeToRecovery: Date.now() - sequence.startDate.getTime(),
      });
    }
  }

  /**
   * Utility functions
   */
  private determineABTestVariant(cartData: AbandonedCartData): string {
    const hash = this.hashString(cartData.userEmail);
    return hash % 2 === 0 ? 'variant_a' : 'variant_b';
  }

  private generateDiscountCode(email: string): string {
    const hash = this.hashString(email).toString().slice(0, 4);
    return `SAVE${hash}`;
  }

  private generateRecoveryUrl(cartId: string, email: string): string {
    const token = Buffer.from(`${cartId}:${email}`).toString('base64');
    return `/cart/recover?token=${token}`;
  }

  private formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(price / 100);
  }

  private async getProductBenefits(_cartItems: CartItem[]): Promise<string[]> {
    return [
      'Advanced AI conversations that feel natural',
      'Emotional intelligence that understands you',
      'Premium build quality with 2-year warranty',
      'Free lifetime software updates',
    ];
  }

  private async getRelevantTestimonials(cartData: AbandonedCartData): Promise<Array<{
    name: string;
    quote: string;
    rating: number;
    location: string;
  }>> {
    return [
      {
        name: 'Sarah M.',
        quote: 'Rolitt has become my daily companion. The AI conversations are incredibly natural!',
        rating: 5,
        location: cartData.location?.country || 'USA',
      },
      {
        name: 'David Chen',
        quote: 'Worth every penny. The emotional intelligence feature is mind-blowing.',
        rating: 5,
        location: 'Canada',
      },
    ];
  }

  private async getAlternativeProducts(_cartItems: CartItem[]): Promise<string[]> {
    return [
      'Rolitt AI Companion - Alternative Color',
      'Rolitt Starter Bundle with Accessories',
    ];
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  /**
   * Track cart recovery events
   */
  private async trackCartEvent(eventName: string, properties: Record<string, any>): Promise<void> {
    try {
      const { Klaviyo } = await import('../../Klaviyo');
      await Klaviyo.track(eventName, properties);
    } catch (error) {
      console.error('[AbandonedCartWorkflow] Failed to track event:', error);
    }
  }

  /**
   * Get cart recovery analytics
   */
  public getCartRecoveryAnalytics(): {
    totalSequences: number;
    activeSequences: number;
    recoveredCarts: number;
    recoveryRate: number;
    totalRecoveryValue: number;
    averageEmailsToRecovery: number;
    stepPerformance: Record<AbandonedCartStep, {
      sent: number;
      recovered: number;
      conversionRate: number;
    }>;
    recoveryTimeDistribution: Record<string, number>;
  } {
    const sequences = Array.from(this.recoverySequences.values());
    const totalSequences = sequences.length;
    const activeSequences = sequences.filter(s => s.isActive).length;
    const recoveredCarts = sequences.filter(s => s.isRecovered).length;
    const recoveryRate = totalSequences > 0 ? (recoveredCarts / totalSequences) * 100 : 0;

    const totalRecoveryValue = sequences
      .filter(s => s.isRecovered && s.recoveryValue)
      .reduce((sum, s) => sum + (s.recoveryValue || 0), 0);

    const recoveredSequences = sequences.filter(s => s.isRecovered);
    const averageEmailsToRecovery = recoveredSequences.length > 0
      ? recoveredSequences.reduce((sum, s) => sum + s.totalEmailsSent, 0) / recoveredSequences.length
      : 0;

    // Step performance analysis
    const stepPerformance: Record<AbandonedCartStep, { sent: number; recovered: number; conversionRate: number }> = {
      [AbandonedCartStep.IMMEDIATE_REMINDER]: { sent: 0, recovered: 0, conversionRate: 0 },
      [AbandonedCartStep.BENEFIT_HIGHLIGHT]: { sent: 0, recovered: 0, conversionRate: 0 },
      [AbandonedCartStep.SOCIAL_PROOF]: { sent: 0, recovered: 0, conversionRate: 0 },
      [AbandonedCartStep.INCENTIVE_OFFER]: { sent: 0, recovered: 0, conversionRate: 0 },
      [AbandonedCartStep.FINAL_URGENCY]: { sent: 0, recovered: 0, conversionRate: 0 },
      [AbandonedCartStep.LAST_CHANCE]: { sent: 0, recovered: 0, conversionRate: 0 },
    };

    sequences.forEach((sequence) => {
      sequence.completedSteps.forEach((step) => {
        stepPerformance[step].sent++;
        if (sequence.isRecovered) {
          stepPerformance[step].recovered++;
        }
      });
    });

    Object.values(stepPerformance).forEach((step) => {
      step.conversionRate = step.sent > 0 ? (step.recovered / step.sent) * 100 : 0;
    });

    // Recovery time distribution
    const recoveryTimeDistribution: Record<string, number> = {
      '0-1 hour': 0,
      '1-24 hours': 0,
      '1-3 days': 0,
      '3-7 days': 0,
      '7+ days': 0,
    };

    recoveredSequences.forEach((sequence) => {
      const recoveryTime = (Date.now() - sequence.startDate.getTime()) / (1000 * 60 * 60); // hours

      if (recoveryTime <= 1) {
        recoveryTimeDistribution['0-1 hour']!++;
      } else if (recoveryTime <= 24) {
        recoveryTimeDistribution['1-24 hours']!++;
      } else if (recoveryTime <= 72) {
        recoveryTimeDistribution['1-3 days']!++;
      } else if (recoveryTime <= 168) {
        recoveryTimeDistribution['3-7 days']!++;
      } else {
        recoveryTimeDistribution['7+ days']!++;
      }
    });

    return {
      totalSequences,
      activeSequences,
      recoveredCarts,
      recoveryRate,
      totalRecoveryValue,
      averageEmailsToRecovery,
      stepPerformance,
      recoveryTimeDistribution,
    };
  }
}

// Singleton instance
export const abandonedCartWorkflow = AbandonedCartWorkflow.getInstance();

// Convenience functions
export const startCartRecoveryForAbandonment = (cartData: AbandonedCartData) =>
  abandonedCartWorkflow.startCartRecovery(cartData);

export const markCartAsRecovered = (cartId: string, value: number) =>
  abandonedCartWorkflow.markCartRecovered(cartId, value);
