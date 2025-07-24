/**
 * 购后跟进自动化工作流
 * 为完成购买的客户提供周到的购后体验和增值服务
 */

export enum PostPurchaseStep {
  ORDER_CONFIRMATION = 'order_confirmation',
  SHIPPING_NOTIFICATION = 'shipping_notification',
  DELIVERY_REMINDER = 'delivery_reminder',
  UNBOXING_GUIDE = 'unboxing_guide',
  SETUP_ASSISTANCE = 'setup_assistance',
  SATISFACTION_SURVEY = 'satisfaction_survey',
  REVIEW_REQUEST = 'review_request',
  CROSS_SELL_OFFER = 'cross_sell_offer',
  LOYALTY_INVITATION = 'loyalty_invitation',
}

export enum OrderStatus {
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
}

type OrderData = {
  orderId: string;
  orderNumber: string;
  userEmail: string;
  userId?: string;
  orderValue: number;
  currency: string;
  orderDate: Date;
  estimatedDelivery?: Date;
  trackingNumber?: string;

  // Product information
  products: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    variant?: {
      color?: string;
      size?: string;
      sku?: string;
    };
  }>;

  // Customer context
  isFirstTimeCustomer: boolean;
  customerSegment: 'new' | 'regular' | 'vip' | 'at_risk';
  totalLifetimeOrders: number;
  totalLifetimeValue: number;
  preferredLanguage: string;

  // Shipping information
  shippingAddress: {
    country: string;
    state?: string;
    city?: string;
    postalCode?: string;
  };

  // Order characteristics
  orderSource: 'website' | 'mobile_app' | 'social_media' | 'email' | 'referral';
  paymentMethod: string;
  hasDiscountApplied: boolean;
  discountAmount?: number;
};

type PostPurchaseSequence = {
  orderId: string;
  userEmail: string;
  currentStep: PostPurchaseStep;
  startDate: Date;
  completedSteps: PostPurchaseStep[];
  nextSendTime: Date;
  isActive: boolean;
  orderStatus: OrderStatus;
  totalEmailsSent: number;
  customerSatisfactionScore?: number;
  hasLeftReview: boolean;
  crossSellConversion?: {
    offered: boolean;
    clicked: boolean;
    purchased: boolean;
    productId?: string;
    value?: number;
  };
};

/**
 * Post-Purchase Follow-up Workflow
 */
export class PostPurchaseWorkflow {
  private static instance: PostPurchaseWorkflow;
  private postPurchaseSequences: Map<string, PostPurchaseSequence> = new Map();
  private orderTracking: Map<string, {
    currentStatus: OrderStatus;
    statusHistory: Array<{ status: OrderStatus; timestamp: Date }>;
    deliveryEvents: Array<{ event: string; timestamp: Date; location?: string }>;
  }> = new Map();

  private constructor() {}

  public static getInstance(): PostPurchaseWorkflow {
    if (!PostPurchaseWorkflow.instance) {
      PostPurchaseWorkflow.instance = new PostPurchaseWorkflow();
    }
    return PostPurchaseWorkflow.instance;
  }

  /**
   * Start post-purchase sequence
   */
  public async startPostPurchaseSequence(orderData: OrderData): Promise<void> {
    const sequenceId = `post_purchase_${orderData.orderId}_${Date.now()}`;

    // Check if order already has active sequence
    const existingSequence = Array.from(this.postPurchaseSequences.values())
      .find(seq => seq.orderId === orderData.orderId && seq.isActive);

    if (existingSequence) {
      console.log(`[PostPurchaseWorkflow] Order ${orderData.orderId} already has active sequence`);
      return;
    }

    // Initialize sequence
    this.postPurchaseSequences.set(sequenceId, {
      orderId: orderData.orderId,
      userEmail: orderData.userEmail,
      currentStep: PostPurchaseStep.ORDER_CONFIRMATION,
      startDate: new Date(),
      completedSteps: [],
      nextSendTime: new Date(), // Send confirmation immediately
      isActive: true,
      orderStatus: OrderStatus.CONFIRMED,
      totalEmailsSent: 0,
      hasLeftReview: false,
    });

    // Initialize order tracking
    this.orderTracking.set(orderData.orderId, {
      currentStatus: OrderStatus.CONFIRMED,
      statusHistory: [{ status: OrderStatus.CONFIRMED, timestamp: new Date() }],
      deliveryEvents: [],
    });

    // Send immediate order confirmation
    await this.executePostPurchaseStep(sequenceId, orderData, PostPurchaseStep.ORDER_CONFIRMATION);

    // Schedule follow-up steps
    await this.schedulePostPurchaseSequence(sequenceId, orderData);

    // Track sequence start
    await this.trackPostPurchaseEvent('Post Purchase Sequence Started', {
      orderId: orderData.orderId,
      userEmail: orderData.userEmail,
      orderValue: orderData.orderValue,
      isFirstTimeCustomer: orderData.isFirstTimeCustomer,
      customerSegment: orderData.customerSegment,
      sequenceId,
    });
  }

  /**
   * Update order status and trigger relevant steps
   */
  public async updateOrderStatus(orderId: string, newStatus: OrderStatus, metadata?: {
    trackingNumber?: string;
    estimatedDelivery?: Date;
    deliveryLocation?: string;
  }): Promise<void> {
    const tracking = this.orderTracking.get(orderId);
    if (!tracking) {
      return;
    }

    // Update tracking data
    tracking.currentStatus = newStatus;
    tracking.statusHistory.push({ status: newStatus, timestamp: new Date() });

    // Add delivery event if provided
    if (metadata?.deliveryLocation) {
      tracking.deliveryEvents.push({
        event: `Status updated to ${newStatus}`,
        timestamp: new Date(),
        location: metadata.deliveryLocation,
      });
    }

    this.orderTracking.set(orderId, tracking);

    // Find active sequence for this order
    const sequence = Array.from(this.postPurchaseSequences.values())
      .find(seq => seq.orderId === orderId && seq.isActive);

    if (sequence) {
      sequence.orderStatus = newStatus;

      // Trigger relevant follow-up based on status
      const statusTriggers: Record<OrderStatus, PostPurchaseStep | null> = {
        [OrderStatus.CONFIRMED]: null, // Already handled
        [OrderStatus.PROCESSING]: null, // No immediate action
        [OrderStatus.SHIPPED]: PostPurchaseStep.SHIPPING_NOTIFICATION,
        [OrderStatus.DELIVERED]: PostPurchaseStep.UNBOXING_GUIDE,
        [OrderStatus.COMPLETED]: PostPurchaseStep.SATISFACTION_SURVEY,
      };

      const triggerStep = statusTriggers[newStatus];
      if (triggerStep) {
        // Find order data for this sequence
        const orderData = await this.getOrderDataForSequence(sequence);
        if (orderData) {
          await this.executePostPurchaseStep(
            Array.from(this.postPurchaseSequences.entries())
              .find(([, seq]) => seq === sequence)?.[0] || '',
            orderData,
            triggerStep,
          );
        }
      }
    }

    // Track status update
    await this.trackPostPurchaseEvent('Order Status Updated', {
      orderId,
      newStatus,
      trackingNumber: metadata?.trackingNumber,
      estimatedDelivery: metadata?.estimatedDelivery?.toISOString(),
    });
  }

  /**
   * Execute specific post-purchase step
   */
  private async executePostPurchaseStep(
    sequenceId: string,
    orderData: OrderData,
    step: PostPurchaseStep,
  ): Promise<void> {
    const sequence = this.postPurchaseSequences.get(sequenceId);
    if (!sequence || !sequence.isActive) {
      return;
    }

    try {
      // Generate step content
      const emailContent = await this.generateStepContent(step, orderData, sequence);

      // Send email
      await this.sendPostPurchaseEmail(orderData.userEmail, emailContent);

      // Update sequence
      sequence.completedSteps.push(step);
      sequence.totalEmailsSent++;
      sequence.currentStep = step;

      // Track step completion
      await this.trackPostPurchaseEvent('Post Purchase Email Sent', {
        sequenceId,
        step,
        orderId: orderData.orderId,
        userEmail: orderData.userEmail,
        emailSubject: emailContent.subject,
        orderValue: orderData.orderValue,
      });

      console.log(`[PostPurchaseWorkflow] Sent ${step} email for order ${orderData.orderId}`);
    } catch (error) {
      console.error(`[PostPurchaseWorkflow] Failed to execute step ${step}:`, error);
      await this.trackPostPurchaseEvent('Post Purchase Email Error', {
        sequenceId,
        step,
        error: (error as Error).message,
      });
    }
  }

  /**
   * Generate content for post-purchase step
   */
  private async generateStepContent(
    step: PostPurchaseStep,
    orderData: OrderData,
    _sequence: PostPurchaseSequence,
  ): Promise<{
    subject: string;
    templateId: string;
    personalizations: Record<string, any>;
  }> {
    const { products, orderValue, currency, userEmail, orderNumber, trackingNumber } = orderData;
    const firstName = userEmail.split('@')[0]; // Simplified name extraction

    const basePersonalizations = {
      firstName,
      orderNumber,
      orderId: orderData.orderId,
      orderValue: this.formatPrice(orderValue, currency),
      products: products.map(product => ({
        ...product,
        formattedPrice: this.formatPrice(product.unitPrice, currency),
      })),
      productCount: products.length,
      trackingNumber,
      supportUrl: '/support',
      accountUrl: '/account',
      estimatedDelivery: orderData.estimatedDelivery?.toLocaleDateString(),
    };

    const stepConfigs: Record<PostPurchaseStep, {
      subject: string;
      templateId: string;
      personalizations: Record<string, any>;
    }> = {
      [PostPurchaseStep.ORDER_CONFIRMATION]: {
        subject: `Order confirmed! Your Rolitt is on the way 🎉`,
        templateId: 'post_purchase_confirmation_v1',
        personalizations: {
          ...basePersonalizations,
          isFirstTimeCustomer: orderData.isFirstTimeCustomer,
          estimatedProcessingTime: '1-2 business days',
          whatHappensNext: [
            'We\'ll prepare your order with care',
            'You\'ll receive shipping notification',
            'Track your package in real-time',
          ],
        },
      },

      [PostPurchaseStep.SHIPPING_NOTIFICATION]: {
        subject: `Your Rolitt is on its way! 📦`,
        templateId: 'post_purchase_shipping_v1',
        personalizations: {
          ...basePersonalizations,
          trackingUrl: this.generateTrackingUrl(trackingNumber),
          shippingCarrier: 'FedEx', // This would be dynamic
          deliveryInstructions: await this.getDeliveryInstructions(orderData.shippingAddress.country),
        },
      },

      [PostPurchaseStep.DELIVERY_REMINDER]: {
        subject: `Your Rolitt delivery is approaching`,
        templateId: 'post_purchase_delivery_reminder_v1',
        personalizations: {
          ...basePersonalizations,
          deliveryWindow: 'Today between 9 AM - 6 PM',
          preparationTips: [
            'Ensure someone is available to receive the package',
            'Have your ID ready for signature',
            'Clear space for the delivery',
          ],
        },
      },

      [PostPurchaseStep.UNBOXING_GUIDE]: {
        subject: `Welcome to Rolitt! Your unboxing guide is here 📱`,
        templateId: 'post_purchase_unboxing_v1',
        personalizations: {
          ...basePersonalizations,
          unboxingVideoUrl: '/videos/unboxing-guide',
          setupGuideUrl: '/setup',
          quickStartSteps: [
            'Carefully remove Rolitt from packaging',
            'Download the Rolitt companion app',
            'Follow the 5-minute setup process',
            'Start your first conversation!',
          ],
        },
      },

      [PostPurchaseStep.SETUP_ASSISTANCE]: {
        subject: `Need help setting up your Rolitt? We're here! 🤝`,
        templateId: 'post_purchase_setup_v1',
        personalizations: {
          ...basePersonalizations,
          setupVideoUrl: '/videos/setup-guide',
          troubleshootingUrl: '/troubleshooting',
          liveChat: true,
          supportHours: '9 AM - 9 PM EST, 7 days a week',
          commonIssues: await this.getCommonSetupIssues(),
        },
      },

      [PostPurchaseStep.SATISFACTION_SURVEY]: {
        subject: `How's your Rolitt experience so far? 💭`,
        templateId: 'post_purchase_survey_v1',
        personalizations: {
          ...basePersonalizations,
          surveyUrl: this.generateSurveyUrl(orderData.orderId, orderData.userEmail),
          incentive: '10% off your next purchase',
          estimatedTime: '2 minutes',
        },
      },

      [PostPurchaseStep.REVIEW_REQUEST]: {
        subject: `Share your Rolitt story with others ⭐`,
        templateId: 'post_purchase_review_v1',
        personalizations: {
          ...basePersonalizations,
          reviewUrl: this.generateReviewUrl(products[0]?.productId || ''),
          reviewIncentive: 'Enter to win monthly accessories bundle',
          socialShareBonus: 'Get 15% off when you share on social media',
          reviewExamples: await this.getReviewExamples(),
        },
      },

      [PostPurchaseStep.CROSS_SELL_OFFER]: {
        subject: `Complete your Rolitt experience with these accessories`,
        templateId: 'post_purchase_cross_sell_v1',
        personalizations: {
          ...basePersonalizations,
          recommendedProducts: await this.getRecommendedAccessories(orderData),
          bundleDiscount: 20,
          limitedTimeOffer: true,
          offerExpiryDate: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toLocaleDateString(),
        },
      },

      [PostPurchaseStep.LOYALTY_INVITATION]: {
        subject: `Join the Rolitt Inner Circle 👑`,
        templateId: 'post_purchase_loyalty_v1',
        personalizations: {
          ...basePersonalizations,
          loyaltyProgram: 'Rolitt Inner Circle',
          memberBenefits: [
            'Exclusive early access to new features',
            '15% off all future purchases',
            'Priority customer support',
            'Monthly virtual meetups with other users',
          ],
          signupBonus: '500 loyalty points',
          pointsValue: '$5 equivalent',
        },
      },
    };

    return stepConfigs[step];
  }

  /**
   * Schedule complete post-purchase sequence
   */
  private async schedulePostPurchaseSequence(
    sequenceId: string,
    orderData: OrderData,
  ): Promise<void> {
    const sequence = this.postPurchaseSequences.get(sequenceId);
    if (!sequence) {
      return;
    }

    // Define step timing based on typical delivery and usage patterns
    const stepDelays: Record<PostPurchaseStep, number> = {
      [PostPurchaseStep.ORDER_CONFIRMATION]: 0, // Immediate
      [PostPurchaseStep.SHIPPING_NOTIFICATION]: 24, // When shipped (triggered by status)
      [PostPurchaseStep.DELIVERY_REMINDER]: 72, // 3 days (before delivery)
      [PostPurchaseStep.UNBOXING_GUIDE]: 0, // Triggered by delivery status
      [PostPurchaseStep.SETUP_ASSISTANCE]: 24, // 1 day after delivery
      [PostPurchaseStep.SATISFACTION_SURVEY]: 168, // 1 week after delivery
      [PostPurchaseStep.REVIEW_REQUEST]: 336, // 2 weeks after delivery
      [PostPurchaseStep.CROSS_SELL_OFFER]: 504, // 3 weeks after delivery
      [PostPurchaseStep.LOYALTY_INVITATION]: 720, // 1 month after delivery
    };

    // Schedule non-status-triggered steps
    const scheduledSteps = [
      PostPurchaseStep.DELIVERY_REMINDER,
      PostPurchaseStep.SETUP_ASSISTANCE,
      PostPurchaseStep.SATISFACTION_SURVEY,
      PostPurchaseStep.REVIEW_REQUEST,
      PostPurchaseStep.CROSS_SELL_OFFER,
      PostPurchaseStep.LOYALTY_INVITATION,
    ];

    for (const step of scheduledSteps) {
      const delay = stepDelays[step] * 60 * 60 * 1000; // Convert hours to milliseconds

      setTimeout(async () => {
        const currentSequence = this.postPurchaseSequences.get(sequenceId);
        if (currentSequence?.isActive) {
          await this.executePostPurchaseStep(sequenceId, orderData, step);
        }
      }, delay);
    }
  }

  /**
   * Send post-purchase email via Klaviyo
   */
  private async sendPostPurchaseEmail(
    email: string,
    content: { subject: string; templateId: string; personalizations: Record<string, any> },
  ): Promise<void> {
    try {
      const { Klaviyo } = await import('../../Klaviyo');

      await Klaviyo.track('Post Purchase Email Sent', {
        email,
        subject: content.subject,
        templateId: content.templateId,
        personalizations: content.personalizations,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[PostPurchaseWorkflow] Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Mark customer as having left review
   */
  public async markReviewCompleted(orderId: string): Promise<void> {
    const sequence = Array.from(this.postPurchaseSequences.values())
      .find(seq => seq.orderId === orderId && seq.isActive);

    if (sequence) {
      sequence.hasLeftReview = true;

      await this.trackPostPurchaseEvent('Customer Review Completed', {
        orderId,
        sequenceId: orderId,
        userEmail: sequence.userEmail,
      });
    }
  }

  /**
   * Track cross-sell conversion
   */
  public async trackCrossSellConversion(
    orderId: string,
    action: 'offered' | 'clicked' | 'purchased',
    details?: { productId?: string; value?: number },
  ): Promise<void> {
    const sequence = Array.from(this.postPurchaseSequences.values())
      .find(seq => seq.orderId === orderId && seq.isActive);

    if (sequence) {
      if (!sequence.crossSellConversion) {
        sequence.crossSellConversion = {
          offered: false,
          clicked: false,
          purchased: false,
        };
      }

      sequence.crossSellConversion[action] = true;
      if (details?.productId) {
        sequence.crossSellConversion.productId = details.productId;
      }
      if (details?.value) {
        sequence.crossSellConversion.value = details.value;
      }

      await this.trackPostPurchaseEvent('Cross Sell Conversion', {
        orderId,
        action,
        details,
        userEmail: sequence.userEmail,
      });
    }
  }

  /**
   * Utility functions
   */
  private formatPrice(price: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(price / 100);
  }

  private generateTrackingUrl(trackingNumber?: string): string {
    if (!trackingNumber) {
      return '/account/orders';
    }
    return `/track?number=${trackingNumber}`;
  }

  private generateSurveyUrl(orderId: string, email: string): string {
    const token = Buffer.from(`${orderId}:${email}`).toString('base64');
    return `/survey/satisfaction?token=${token}`;
  }

  private generateReviewUrl(productId: string): string {
    return `/products/${productId}/review`;
  }

  private async getDeliveryInstructions(country: string): Promise<string[]> {
    const instructions: Record<string, string[]> = {
      US: [
        'Signature required for delivery',
        'Package will be left in a secure location if no one is home',
        'Delivery between 9 AM - 8 PM',
      ],
      CA: [
        'Canada Post delivery',
        'Signature required for packages over $20',
        'Delivery Monday-Friday',
      ],
    };

    return instructions[country] || instructions.US!;
  }

  private async getCommonSetupIssues(): Promise<Array<{ issue: string; solution: string }>> {
    return [
      {
        issue: 'Rolitt won\'t turn on',
        solution: 'Hold power button for 3 seconds, ensure battery is charged',
      },
      {
        issue: 'Can\'t connect to Wi-Fi',
        solution: 'Check network settings, ensure 2.4GHz network is available',
      },
      {
        issue: 'Voice recognition not working',
        solution: 'Complete voice training in the app settings',
      },
    ];
  }

  private async getReviewExamples(): Promise<string[]> {
    return [
      'The AI conversations feel incredibly natural and helpful!',
      'Setup was surprisingly easy, working perfectly after 5 minutes.',
      'My daily companion - Rolitt understands my mood and responds perfectly.',
    ];
  }

  private async getRecommendedAccessories(_orderData: OrderData): Promise<Array<{
    productId: string;
    name: string;
    price: number;
    description: string;
    imageUrl: string;
  }>> {
    // This would be based on the customer's order and preferences
    return [
      {
        productId: 'acc-charging-dock',
        name: 'Premium Charging Dock',
        price: 4900, // $49.00
        description: 'Elegant charging station with ambient lighting',
        imageUrl: '/images/accessories/charging-dock.jpg',
      },
      {
        productId: 'acc-travel-case',
        name: 'Travel Protection Case',
        price: 2900, // $29.00
        description: 'Durable case for safe travel with your Rolitt',
        imageUrl: '/images/accessories/travel-case.jpg',
      },
    ];
  }

  private async getOrderDataForSequence(_sequence: PostPurchaseSequence): Promise<OrderData | null> {
    // In a real implementation, this would fetch order data from database
    // For now, return null to indicate data needs to be provided
    return null;
  }

  /**
   * Track post-purchase events
   */
  private async trackPostPurchaseEvent(eventName: string, properties: Record<string, any>): Promise<void> {
    try {
      const { Klaviyo } = await import('../../Klaviyo');
      await Klaviyo.track(eventName, properties);
    } catch (error) {
      console.error('[PostPurchaseWorkflow] Failed to track event:', error);
    }
  }

  /**
   * Get post-purchase analytics
   */
  public getPostPurchaseAnalytics(): {
    totalSequences: number;
    activeSequences: number;
    completedSequences: number;
    stepCompletionRates: Record<PostPurchaseStep, number>;
    averageSequenceDuration: number;
    customerSatisfactionAverage: number;
    reviewCompletionRate: number;
    crossSellConversionRate: number;
    crossSellRevenue: number;
  } {
    const sequences = Array.from(this.postPurchaseSequences.values());
    const totalSequences = sequences.length;
    const activeSequences = sequences.filter(s => s.isActive).length;
    const completedSequences = sequences.filter(s => !s.isActive).length;

    // Calculate step completion rates
    const stepCounts: Record<PostPurchaseStep, number> = {
      [PostPurchaseStep.ORDER_CONFIRMATION]: 0,
      [PostPurchaseStep.SHIPPING_NOTIFICATION]: 0,
      [PostPurchaseStep.DELIVERY_REMINDER]: 0,
      [PostPurchaseStep.UNBOXING_GUIDE]: 0,
      [PostPurchaseStep.SETUP_ASSISTANCE]: 0,
      [PostPurchaseStep.SATISFACTION_SURVEY]: 0,
      [PostPurchaseStep.REVIEW_REQUEST]: 0,
      [PostPurchaseStep.CROSS_SELL_OFFER]: 0,
      [PostPurchaseStep.LOYALTY_INVITATION]: 0,
    };

    sequences.forEach((sequence) => {
      sequence.completedSteps.forEach((step) => {
        stepCounts[step]++;
      });
    });

    const stepCompletionRates: Record<PostPurchaseStep, number> = {} as any;
    Object.entries(stepCounts).forEach(([step, count]) => {
      stepCompletionRates[step as PostPurchaseStep] = totalSequences > 0 ? (count / totalSequences) * 100 : 0;
    });

    // Calculate satisfaction metrics
    const satisfactionScores = sequences
      .map(s => s.customerSatisfactionScore)
      .filter(score => score !== undefined) as number[];

    const customerSatisfactionAverage = satisfactionScores.length > 0
      ? satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length
      : 0;

    // Calculate review completion rate
    const reviewCompletionRate = totalSequences > 0
      ? (sequences.filter(s => s.hasLeftReview).length / totalSequences) * 100
      : 0;

    // Calculate cross-sell metrics
    const crossSellOffered = sequences.filter(s => s.crossSellConversion?.offered).length;
    const crossSellPurchased = sequences.filter(s => s.crossSellConversion?.purchased).length;
    const crossSellConversionRate = crossSellOffered > 0 ? (crossSellPurchased / crossSellOffered) * 100 : 0;

    const crossSellRevenue = sequences
      .filter(s => s.crossSellConversion?.purchased && s.crossSellConversion.value)
      .reduce((sum, s) => sum + (s.crossSellConversion?.value || 0), 0);

    return {
      totalSequences,
      activeSequences,
      completedSequences,
      stepCompletionRates,
      averageSequenceDuration: 0, // Would calculate from actual durations
      customerSatisfactionAverage,
      reviewCompletionRate,
      crossSellConversionRate,
      crossSellRevenue,
    };
  }
}

// Singleton instance
export const postPurchaseWorkflow = PostPurchaseWorkflow.getInstance();

// Convenience functions
export const startPostPurchaseFlow = (orderData: OrderData) =>
  postPurchaseWorkflow.startPostPurchaseSequence(orderData);

export const updateOrderStatusForWorkflow = (orderId: string, status: OrderStatus, metadata?: any) =>
  postPurchaseWorkflow.updateOrderStatus(orderId, status, metadata);
