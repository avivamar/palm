/**
 * 欢迎邮件序列自动化工作流
 * 为新用户提供个性化的欢迎体验和产品介绍
 */

export enum WelcomeSeriesStep {
  IMMEDIATE_WELCOME = 'immediate_welcome',
  PRODUCT_INTRODUCTION = 'product_introduction',
  FEATURE_HIGHLIGHTS = 'feature_highlights',
  SOCIAL_PROOF = 'social_proof',
  EARLY_BIRD_OFFER = 'early_bird_offer',
  COMMUNITY_INVITATION = 'community_invitation',
}

export enum TriggerEvent {
  NEWSLETTER_SIGNUP = 'Newsletter Signup',
  ACCOUNT_CREATION = 'Account Creation',
  FIRST_PRODUCT_VIEW = 'First Product View',
  CART_ABANDONMENT = 'Cart Abandonment',
  PURCHASE_COMPLETION = 'Purchase Completion',
}

type WelcomeSeriesConfig = {
  step: WelcomeSeriesStep;
  delay: number; // hours after previous step
  subject: string;
  templateId: string;
  personalizations: {
    [key: string]: string | number | boolean;
  };
  conditions?: {
    userSegment?: string[];
    minEngagementScore?: number;
    hasNotPurchased?: boolean;
    preferredChannel?: 'email' | 'sms';
  };
  abTestVariants?: {
    variantId: string;
    percentage: number;
    subject: string;
    templateId: string;
  }[];
};

type UserProfile = {
  email: string;
  firstName?: string;
  lastName?: string;
  source?: string;
  signupDate: Date;
  lastEngagement?: Date;
  engagementScore: number;
  preferredLanguage: string;
  hasCompletedPurchase: boolean;
  interests: string[];
  deviceType: 'mobile' | 'desktop' | 'tablet';
  location?: {
    country: string;
    timezone: string;
  };
};

/**
 * Welcome Series Automation Workflow
 */
export class WelcomeSeriesWorkflow {
  private static instance: WelcomeSeriesWorkflow;
  private activeSequences: Map<string, {
    userEmail: string;
    currentStep: WelcomeSeriesStep;
    startDate: Date;
    completedSteps: WelcomeSeriesStep[];
    nextSendTime: Date;
    isActive: boolean;
    abTestVariant?: string;
  }> = new Map();

  private constructor() {}

  public static getInstance(): WelcomeSeriesWorkflow {
    if (!WelcomeSeriesWorkflow.instance) {
      WelcomeSeriesWorkflow.instance = new WelcomeSeriesWorkflow();
    }
    return WelcomeSeriesWorkflow.instance;
  }

  /**
   * Start welcome series for new user
   */
  public async startWelcomeSeries(
    userProfile: UserProfile,
    triggerEvent: TriggerEvent = TriggerEvent.NEWSLETTER_SIGNUP,
  ): Promise<void> {
    const sequenceId = `welcome_${userProfile.email}_${Date.now()}`;

    // Check if user already has an active welcome series
    const existingSequence = Array.from(this.activeSequences.values())
      .find(seq => seq.userEmail === userProfile.email && seq.isActive);

    if (existingSequence) {
      console.log(`[WelcomeSeriesWorkflow] User ${userProfile.email} already has active welcome series`);
      return;
    }

    // Determine A/B test variant
    const abTestVariant = this.determineABTestVariant(userProfile);

    // Initialize sequence
    this.activeSequences.set(sequenceId, {
      userEmail: userProfile.email,
      currentStep: WelcomeSeriesStep.IMMEDIATE_WELCOME,
      startDate: new Date(),
      completedSteps: [],
      nextSendTime: new Date(), // Send immediately
      isActive: true,
      abTestVariant,
    });

    // Send immediate welcome email
    await this.executeWelcomeStep(sequenceId, userProfile, WelcomeSeriesStep.IMMEDIATE_WELCOME);

    // Schedule remaining steps
    await this.scheduleNextSteps(sequenceId, userProfile);

    // Track welcome series start
    await this.trackWelcomeSeriesEvent('Welcome Series Started', {
      email: userProfile.email,
      triggerEvent,
      abTestVariant,
      userSegment: this.getUserSegment(userProfile),
    });
  }

  /**
   * Execute specific welcome step
   */
  private async executeWelcomeStep(
    sequenceId: string,
    userProfile: UserProfile,
    step: WelcomeSeriesStep,
  ): Promise<void> {
    const sequence = this.activeSequences.get(sequenceId);
    if (!sequence || !sequence.isActive) {
      return;
    }

    const stepConfig = this.getStepConfiguration(step, userProfile, sequence.abTestVariant);

    // Check conditions before sending
    if (!this.checkStepConditions(stepConfig, userProfile)) {
      console.log(`[WelcomeSeriesWorkflow] Conditions not met for step ${step}, skipping`);
      await this.advanceToNextStep(sequenceId, userProfile);
      return;
    }

    try {
      // Personalize content
      const personalizedContent = await this.personalizeContent(stepConfig, userProfile);

      // Send email via Klaviyo
      await this.sendEmailViaKlaviyo(userProfile.email, personalizedContent);

      // Update sequence status
      sequence.completedSteps.push(step);
      const nextStep = this.getNextStep(step);
      if (nextStep) {
        sequence.currentStep = nextStep;
      }

      // Track step completion
      await this.trackWelcomeSeriesEvent('Welcome Step Completed', {
        email: userProfile.email,
        step,
        sequenceId,
        abTestVariant: sequence.abTestVariant,
      });

      // Schedule next step if not final
      if (sequence.currentStep !== step) {
        await this.scheduleNextStep(sequenceId, userProfile);
      } else {
        // Mark sequence as completed
        sequence.isActive = false;
        await this.trackWelcomeSeriesEvent('Welcome Series Completed', {
          email: userProfile.email,
          sequenceId,
          totalSteps: sequence.completedSteps.length,
          abTestVariant: sequence.abTestVariant,
        });
      }
    } catch (error) {
      console.error(`[WelcomeSeriesWorkflow] Failed to execute step ${step}:`, error);

      // Track error and retry logic
      await this.handleStepError(sequenceId, step, error as Error);
    }
  }

  /**
   * Get step configuration based on user profile and A/B test
   */
  private getStepConfiguration(
    step: WelcomeSeriesStep,
    userProfile: UserProfile,
    abTestVariant?: string,
  ): WelcomeSeriesConfig {
    const baseConfigs: Record<WelcomeSeriesStep, WelcomeSeriesConfig> = {
      [WelcomeSeriesStep.IMMEDIATE_WELCOME]: {
        step,
        delay: 0,
        subject: `Welcome to Rolitt, ${userProfile.firstName || 'Friend'}! 🎉`,
        templateId: 'welcome_immediate_v1',
        personalizations: {
          firstName: userProfile.firstName || 'Friend',
          signupSource: userProfile.source || 'website',
          preferredLanguage: userProfile.preferredLanguage,
        },
        abTestVariants: [
          {
            variantId: 'subject_emoji',
            percentage: 50,
            subject: `Welcome to the Future, ${userProfile.firstName || 'Friend'}! 🚀`,
            templateId: 'welcome_immediate_v2',
          },
        ],
      },

      [WelcomeSeriesStep.PRODUCT_INTRODUCTION]: {
        step,
        delay: 24, // 1 day after welcome
        subject: `Meet Your Future AI Companion`,
        templateId: 'welcome_product_intro_v1',
        personalizations: {
          firstName: userProfile.firstName || 'Friend',
          deviceType: userProfile.deviceType,
          hasViewedProduct: false, // Will be dynamically updated
        },
        conditions: {
          hasNotPurchased: true,
        },
        abTestVariants: [
          {
            variantId: 'video_focus',
            percentage: 50,
            subject: `See Rolitt in Action (Video Inside)`,
            templateId: 'welcome_product_video_v1',
          },
        ],
      },

      [WelcomeSeriesStep.FEATURE_HIGHLIGHTS]: {
        step,
        delay: 72, // 3 days after welcome
        subject: `3 Reasons Why Early Adopters Love Rolitt`,
        templateId: 'welcome_features_v1',
        personalizations: {
          firstName: userProfile.firstName || 'Friend',
          topFeatures: this.getPersonalizedFeatures(userProfile).join(', '),
          userSegment: this.getUserSegment(userProfile),
        },
        conditions: {
          hasNotPurchased: true,
          minEngagementScore: 20,
        },
      },

      [WelcomeSeriesStep.SOCIAL_PROOF]: {
        step,
        delay: 120, // 5 days after welcome
        subject: `What 1,000+ Early Adopters Are Saying`,
        templateId: 'welcome_social_proof_v1',
        personalizations: {
          firstName: userProfile.firstName || 'Friend',
          testimonialsCount: this.getRelevantTestimonials(userProfile).length,
          totalPreorders: 1247,
          avgRating: 4.9,
          countriesShipped: 15,
        },
        conditions: {
          hasNotPurchased: true,
        },
      },

      [WelcomeSeriesStep.EARLY_BIRD_OFFER]: {
        step,
        delay: 168, // 7 days after welcome
        subject: `⏰ Your Early Bird Discount Expires Soon`,
        templateId: 'welcome_early_bird_v1',
        personalizations: {
          firstName: userProfile.firstName || 'Friend',
          discountCode: this.generatePersonalizedDiscount(userProfile),
          discountPercentage: this.calculateDiscountPercentage(userProfile),
          expiryDate: this.calculateDiscountExpiry(),
        },
        conditions: {
          hasNotPurchased: true,
          minEngagementScore: 30,
        },
      },

      [WelcomeSeriesStep.COMMUNITY_INVITATION]: {
        step,
        delay: 240, // 10 days after welcome
        subject: `Join the Rolitt Community`,
        templateId: 'welcome_community_v1',
        personalizations: {
          firstName: userProfile.firstName || 'Friend',
          totalMembers: 2500,
          dailyDiscussions: 45,
          supportResponse: '< 2 hours',
        },
      },
    };

    const config = baseConfigs[step];

    // Apply A/B test variant if applicable
    if (abTestVariant && config.abTestVariants) {
      const variant = config.abTestVariants.find(v => v.variantId === abTestVariant);
      if (variant) {
        config.subject = variant.subject;
        config.templateId = variant.templateId;
        config.personalizations.abTestVariant = variant.variantId;
      }
    }

    return config;
  }

  /**
   * Determine A/B test variant for user
   */
  private determineABTestVariant(userProfile: UserProfile): string | undefined {
    // Simple hash-based assignment for consistent user experience
    const hash = this.hashString(userProfile.email);
    const percentage = hash % 100;

    if (percentage < 50) {
      return 'variant_a';
    }
    return 'variant_b';
  }

  /**
   * Check if step conditions are met
   */
  private checkStepConditions(config: WelcomeSeriesConfig, userProfile: UserProfile): boolean {
    if (!config.conditions) {
      return true;
    }

    const { conditions } = config;

    // Check purchase status
    if (conditions.hasNotPurchased && userProfile.hasCompletedPurchase) {
      return false;
    }

    // Check engagement score
    if (conditions.minEngagementScore && userProfile.engagementScore < conditions.minEngagementScore) {
      return false;
    }

    // Check user segment
    if (conditions.userSegment && !conditions.userSegment.includes(this.getUserSegment(userProfile))) {
      return false;
    }

    return true;
  }

  /**
   * Personalize email content
   */
  private async personalizeContent(
    config: WelcomeSeriesConfig,
    userProfile: UserProfile,
  ): Promise<{
    subject: string;
    templateId: string;
    personalizations: Record<string, any>;
  }> {
    // Add dynamic personalization based on user behavior
    const enhancedPersonalizations = {
      ...config.personalizations,

      // Time-based personalization
      timeOfDay: this.getTimeOfDayGreeting(userProfile.location?.timezone),
      daysSinceSignup: Math.floor((Date.now() - userProfile.signupDate.getTime()) / (1000 * 60 * 60 * 24)),

      // Behavioral personalization
      lastEngagement: userProfile.lastEngagement?.toLocaleDateString(),
      engagementLevel: this.getEngagementLevel(userProfile.engagementScore),

      // Location-based personalization
      localCurrency: this.getLocalCurrency(userProfile.location?.country),
      shippingEstimate: this.getShippingEstimate(userProfile.location?.country),

      // Dynamic content
      recommendedProducts: await this.getRecommendedProducts(userProfile),
      personalizedCTA: this.getPersonalizedCTA(userProfile, config.step),
    };

    return {
      subject: this.personalizeSubject(config.subject, enhancedPersonalizations),
      templateId: config.templateId,
      personalizations: enhancedPersonalizations,
    };
  }

  /**
   * Send email via Klaviyo
   */
  private async sendEmailViaKlaviyo(
    email: string,
    content: { subject: string; templateId: string; personalizations: Record<string, any> },
  ): Promise<void> {
    try {
      const { Klaviyo } = await import('../../Klaviyo');

      // Use Klaviyo's template system
      await Klaviyo.track('Welcome Email Sent', {
        email,
        subject: content.subject,
        templateId: content.templateId,
        personalizations: content.personalizations,
        timestamp: new Date().toISOString(),
      });

      // Note: In a real implementation, you would use Klaviyo's email sending API
      // This is a simplified version that tracks the email send event
    } catch (error) {
      console.error('[WelcomeSeriesWorkflow] Failed to send email via Klaviyo:', error);
      throw error;
    }
  }

  /**
   * Schedule next steps in the sequence
   */
  private async scheduleNextSteps(sequenceId: string, userProfile: UserProfile): Promise<void> {
    const sequence = this.activeSequences.get(sequenceId);
    if (!sequence) {
      return;
    }

    const allSteps = Object.values(WelcomeSeriesStep);
    const currentIndex = allSteps.indexOf(sequence.currentStep);

    for (let i = currentIndex + 1; i < allSteps.length; i++) {
      const nextStep = allSteps[i];
      if (!nextStep) {
        continue;
      }

      const stepConfig = this.getStepConfiguration(nextStep, userProfile, sequence.abTestVariant);

      const sendTime = new Date(sequence.startDate.getTime() + (stepConfig.delay * 60 * 60 * 1000));

      // Schedule the step (in a real implementation, this would use a job queue)
      setTimeout(async () => {
        await this.executeWelcomeStep(sequenceId, userProfile, nextStep);
      }, sendTime.getTime() - Date.now());
    }
  }

  /**
   * Schedule next individual step
   */
  private async scheduleNextStep(sequenceId: string, userProfile: UserProfile): Promise<void> {
    const sequence = this.activeSequences.get(sequenceId);
    if (!sequence) {
      return;
    }

    const nextStep = this.getNextStep(sequence.currentStep);
    if (!nextStep) {
      return;
    }

    const stepConfig = this.getStepConfiguration(nextStep, userProfile, sequence.abTestVariant);
    const sendTime = new Date(Date.now() + (stepConfig.delay * 60 * 60 * 1000));

    sequence.nextSendTime = sendTime;

    // Schedule next step
    setTimeout(async () => {
      await this.executeWelcomeStep(sequenceId, userProfile, nextStep);
    }, stepConfig.delay * 60 * 60 * 1000);
  }

  /**
   * Get next step in sequence
   */
  private getNextStep(currentStep: WelcomeSeriesStep): WelcomeSeriesStep | null {
    const steps = Object.values(WelcomeSeriesStep);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      return nextStep || null;
    }
    return null;
  }

  /**
   * Advance to next step
   */
  private async advanceToNextStep(sequenceId: string, userProfile: UserProfile): Promise<void> {
    const sequence = this.activeSequences.get(sequenceId);
    if (!sequence) {
      return;
    }

    const nextStep = this.getNextStep(sequence.currentStep);
    if (nextStep) {
      sequence.currentStep = nextStep;
      await this.scheduleNextStep(sequenceId, userProfile);
    } else {
      sequence.isActive = false;
    }
  }

  /**
   * Handle step execution error
   */
  private async handleStepError(sequenceId: string, step: WelcomeSeriesStep, error: Error): Promise<void> {
    await this.trackWelcomeSeriesEvent('Welcome Step Error', {
      sequenceId,
      step,
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    // Implement retry logic here if needed
    // For now, we'll log and continue
    console.error(`[WelcomeSeriesWorkflow] Step ${step} failed for sequence ${sequenceId}:`, error);
  }

  /**
   * Utility functions
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private getUserSegment(userProfile: UserProfile): string {
    if (userProfile.engagementScore > 80) {
      return 'highly_engaged';
    }
    if (userProfile.engagementScore > 50) {
      return 'moderately_engaged';
    }
    if (userProfile.hasCompletedPurchase) {
      return 'customer';
    }
    return 'new_user';
  }

  private getPersonalizedFeatures(_userProfile: UserProfile): string[] {
    // Return features based on user interests and behavior
    const allFeatures = [
      'Advanced AI Conversations',
      'Emotional Intelligence',
      'Voice Recognition',
      'Companion Customization',
      'Smart Home Integration',
    ];

    return allFeatures.slice(0, 3); // Return top 3 for email brevity
  }

  private getRelevantTestimonials(userProfile: UserProfile): Array<{ name: string; quote: string; location: string }> {
    // Return testimonials relevant to user's location or interests
    return [
      {
        name: 'Sarah Chen',
        quote: 'Rolitt has become my daily companion. The AI is incredibly natural!',
        location: userProfile.location?.country || 'USA',
      },
      {
        name: 'Michael Roberts',
        quote: 'The emotional intelligence feature is mind-blowing. It really understands me.',
        location: 'Canada',
      },
    ];
  }

  private generatePersonalizedDiscount(userProfile: UserProfile): string {
    // Generate unique discount code based on user
    const hash = this.hashString(userProfile.email).toString().slice(0, 4);
    return `WELCOME${hash}`;
  }

  private calculateDiscountPercentage(userProfile: UserProfile): number {
    // Higher engagement = higher discount
    if (userProfile.engagementScore > 70) {
      return 15;
    }
    if (userProfile.engagementScore > 40) {
      return 10;
    }
    return 5;
  }

  private calculateDiscountExpiry(): string {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7); // 7 days from now
    return expiry.toLocaleDateString();
  }

  private getTimeOfDayGreeting(_timezone?: string): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good morning';
    }
    if (hour < 18) {
      return 'Good afternoon';
    }
    return 'Good evening';
  }

  private getEngagementLevel(score: number): string {
    if (score > 80) {
      return 'very_high';
    }
    if (score > 60) {
      return 'high';
    }
    if (score > 40) {
      return 'medium';
    }
    return 'low';
  }

  private getLocalCurrency(country?: string): string {
    const currencyMap: Record<string, string> = {
      US: 'USD',
      CA: 'CAD',
      GB: 'GBP',
      EU: 'EUR',
      AU: 'AUD',
      JP: 'JPY',
      HK: 'HKD',
    };
    return currencyMap[country || 'US'] || 'USD';
  }

  private getShippingEstimate(country?: string): string {
    const shippingMap: Record<string, string> = {
      US: '3-5 business days',
      CA: '5-7 business days',
      GB: '7-10 business days',
      EU: '7-10 business days',
      AU: '10-14 business days',
      JP: '7-10 business days',
      HK: '5-7 business days',
    };
    return shippingMap[country || 'US'] || '10-14 business days';
  }

  private async getRecommendedProducts(_userProfile: UserProfile): Promise<string[]> {
    // Return product recommendations based on user interests
    return ['Rolitt AI Companion - Honey Khaki', 'Premium Accessories Bundle'];
  }

  private getPersonalizedCTA(_userProfile: UserProfile, step: WelcomeSeriesStep): string {
    const ctaMap: Record<WelcomeSeriesStep, string> = {
      [WelcomeSeriesStep.IMMEDIATE_WELCOME]: 'Explore Rolitt',
      [WelcomeSeriesStep.PRODUCT_INTRODUCTION]: 'See Rolitt in Action',
      [WelcomeSeriesStep.FEATURE_HIGHLIGHTS]: 'Discover All Features',
      [WelcomeSeriesStep.SOCIAL_PROOF]: 'Join 1,000+ Happy Customers',
      [WelcomeSeriesStep.EARLY_BIRD_OFFER]: 'Claim Your Discount',
      [WelcomeSeriesStep.COMMUNITY_INVITATION]: 'Join the Community',
    };

    return ctaMap[step] || 'Learn More';
  }

  private personalizeSubject(subject: string, personalizations: Record<string, any>): string {
    let personalizedSubject = subject;

    // Replace placeholders with actual values
    Object.entries(personalizations).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      if (personalizedSubject.includes(placeholder)) {
        personalizedSubject = personalizedSubject.replace(placeholder, String(value));
      }
    });

    return personalizedSubject;
  }

  /**
   * Track welcome series events
   */
  private async trackWelcomeSeriesEvent(eventName: string, properties: Record<string, any>): Promise<void> {
    try {
      const { Klaviyo } = await import('../../Klaviyo');
      await Klaviyo.track(eventName, properties);
    } catch (error) {
      console.error('[WelcomeSeriesWorkflow] Failed to track event:', error);
    }
  }

  /**
   * Get welcome series analytics
   */
  public getWelcomeSeriesAnalytics(): {
    totalSequences: number;
    activeSequences: number;
    completedSequences: number;
    stepCompletionRates: Record<WelcomeSeriesStep, number>;
    averageSequenceDuration: number;
    abTestResults: Record<string, { sends: number; opens: number; clicks: number; conversions: number }>;
  } {
    const sequences = Array.from(this.activeSequences.values());
    const totalSequences = sequences.length;
    const activeSequences = sequences.filter(s => s.isActive).length;
    const completedSequences = sequences.filter(s => !s.isActive).length;

    // Calculate step completion rates
    const stepCounts: Record<WelcomeSeriesStep, number> = {
      [WelcomeSeriesStep.IMMEDIATE_WELCOME]: 0,
      [WelcomeSeriesStep.PRODUCT_INTRODUCTION]: 0,
      [WelcomeSeriesStep.FEATURE_HIGHLIGHTS]: 0,
      [WelcomeSeriesStep.SOCIAL_PROOF]: 0,
      [WelcomeSeriesStep.EARLY_BIRD_OFFER]: 0,
      [WelcomeSeriesStep.COMMUNITY_INVITATION]: 0,
    };

    sequences.forEach((sequence) => {
      sequence.completedSteps.forEach((step) => {
        stepCounts[step]++;
      });
    });

    const stepCompletionRates: Record<WelcomeSeriesStep, number> = {} as any;
    Object.entries(stepCounts).forEach(([step, count]) => {
      stepCompletionRates[step as WelcomeSeriesStep] = totalSequences > 0 ? (count / totalSequences) * 100 : 0;
    });

    // Calculate average sequence duration
    const completedDurations = sequences
      .filter(s => !s.isActive)
      .map(s => Date.now() - s.startDate.getTime());

    const averageSequenceDuration = completedDurations.length > 0
      ? completedDurations.reduce((a, b) => a + b, 0) / completedDurations.length
      : 0;

    // Mock A/B test results (in real implementation, this would come from Klaviyo)
    const abTestResults = {
      variant_a: { sends: 623, opens: 435, clicks: 87, conversions: 23 },
      variant_b: { sends: 624, opens: 468, clicks: 102, conversions: 31 },
    };

    return {
      totalSequences,
      activeSequences,
      completedSequences,
      stepCompletionRates,
      averageSequenceDuration,
      abTestResults,
    };
  }
}

// Singleton instance
export const welcomeSeriesWorkflow = WelcomeSeriesWorkflow.getInstance();

// Convenience functions
export const startWelcomeSeriesForNewUser = (userProfile: UserProfile) =>
  welcomeSeriesWorkflow.startWelcomeSeries(userProfile, TriggerEvent.NEWSLETTER_SIGNUP);

export const startWelcomeSeriesForAccountCreation = (userProfile: UserProfile) =>
  welcomeSeriesWorkflow.startWelcomeSeries(userProfile, TriggerEvent.ACCOUNT_CREATION);
