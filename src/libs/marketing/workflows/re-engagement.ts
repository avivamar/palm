/**
 * 用户重新激活自动化工作流
 * 针对沉睡用户的智能激活策略，重燃用户兴趣
 */

export enum ReEngagementStep {
  DORMANCY_DETECTION = 'dormancy_detection',
  GENTLE_REMINDER = 'gentle_reminder',
  VALUE_PROPOSITION = 'value_proposition',
  SOCIAL_PROOF_UPDATE = 'social_proof_update',
  EXCLUSIVE_OFFER = 'exclusive_offer',
  FEATURE_HIGHLIGHTS = 'feature_highlights',
  WIN_BACK_CAMPAIGN = 'win_back_campaign',
  FINAL_GOODBYE = 'final_goodbye',
}

export enum UserDormancyLevel {
  SLIGHTLY_INACTIVE = 'slightly_inactive', // 7-30 days
  MODERATELY_INACTIVE = 'moderately_inactive', // 30-90 days
  HIGHLY_INACTIVE = 'highly_inactive', // 90-180 days
  DEEPLY_DORMANT = 'deeply_dormant', // 180+ days
}

export enum ReEngagementTrigger {
  INACTIVITY_PERIOD = 'inactivity_period',
  ENGAGEMENT_SCORE_DROP = 'engagement_score_drop',
  EMAIL_ENGAGEMENT_DECLINE = 'email_engagement_decline',
  PRODUCT_ABANDONMENT = 'product_abandonment',
  COMPETITOR_ACTIVITY = 'competitor_activity',
  SEASONAL_OPPORTUNITY = 'seasonal_opportunity',
}

type DormantUserProfile = {
  email: string;
  userId?: string;
  firstName?: string;

  // Dormancy metrics
  lastActiveDate: Date;
  daysSinceLastActive: number;
  dormancyLevel: UserDormancyLevel;
  dormancyTrigger: ReEngagementTrigger;

  // Historical engagement
  previousEngagementScore: number;
  currentEngagementScore: number;
  scoreDeclinePercentage: number;
  peakEngagementPeriod?: Date;

  // User behavior patterns
  preferredContentTypes: string[];
  mostActiveHours: number[];
  mostActiveDays: number[];
  lastEmailOpen?: Date;
  lastEmailClick?: Date;
  emailEngagementRate: number;

  // Purchase history
  hasEverPurchased: boolean;
  lastPurchaseDate?: Date;
  totalPurchases: number;
  totalSpent: number;
  averageOrderValue: number;

  // Product interests
  viewedProducts: Array<{
    productId: string;
    lastViewed: Date;
    viewCount: number;
  }>;
  wishlisted: Array<{
    productId: string;
    addedDate: Date;
  }>;
  abandonedCarts: Array<{
    cartId: string;
    value: number;
    abandonedDate: Date;
  }>;

  // Preferences
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  preferredLanguage: string;
  timezone: string;

  // Segmentation
  customerSegment: 'lead' | 'prospect' | 'customer' | 'vip' | 'at_risk';
  lifetimeValue: number;
  churnRisk: 'low' | 'medium' | 'high' | 'critical';
};

type ReEngagementSequence = {
  sequenceId: string;
  userEmail: string;
  dormancyLevel: UserDormancyLevel;
  currentStep: ReEngagementStep;
  startDate: Date;
  completedSteps: ReEngagementStep[];
  nextSendTime: Date;
  isActive: boolean;
  isReactivated: boolean;
  reactivationDate?: Date;
  totalEmailsSent: number;
  emailsOpened: number;
  emailsClicked: number;
  personalizedOffers: Array<{
    type: 'discount' | 'free_shipping' | 'exclusive_access' | 'bundle';
    value: string | number;
    code?: string;
    expiryDate: Date;
    used: boolean;
  }>;
  winBackStrategy: 'gentle' | 'aggressive' | 'value_focused' | 'nostalgic';
};

/**
 * Re-engagement Workflow for Dormant Users
 */
export class ReEngagementWorkflow {
  private static instance: ReEngagementWorkflow;
  private reEngagementSequences: Map<string, ReEngagementSequence> = new Map();
  private dormantUserProfiles: Map<string, DormantUserProfile> = new Map();
  private reactivationTracking: Map<string, {
    reactivationEvents: Array<{
      event: string;
      timestamp: Date;
      source: string;
    }>;
    engagementRecovery: Array<{
      metric: string;
      before: number;
      after: number;
      timestamp: Date;
    }>;
  }> = new Map();

  private constructor() {}

  public static getInstance(): ReEngagementWorkflow {
    if (!ReEngagementWorkflow.instance) {
      ReEngagementWorkflow.instance = new ReEngagementWorkflow();
    }
    return ReEngagementWorkflow.instance;
  }

  /**
   * Detect and start re-engagement for dormant user
   */
  public async startReEngagementSequence(userProfile: DormantUserProfile): Promise<void> {
    const sequenceId = `reengagement_${userProfile.email}_${Date.now()}`;

    // Check if user already has active re-engagement sequence
    const existingSequence = Array.from(this.reEngagementSequences.values())
      .find(seq => seq.userEmail === userProfile.email && seq.isActive);

    if (existingSequence) {
      console.log(`[ReEngagementWorkflow] User ${userProfile.email} already has active sequence`);
      return;
    }

    // Store dormant user profile
    this.dormantUserProfiles.set(userProfile.email, userProfile);

    // Determine win-back strategy
    const winBackStrategy = this.determineWinBackStrategy(userProfile);

    // Generate personalized offers
    const personalizedOffers = await this.generatePersonalizedOffers(userProfile);

    // Initialize sequence
    this.reEngagementSequences.set(sequenceId, {
      sequenceId,
      userEmail: userProfile.email,
      dormancyLevel: userProfile.dormancyLevel,
      currentStep: ReEngagementStep.GENTLE_REMINDER,
      startDate: new Date(),
      completedSteps: [],
      nextSendTime: new Date(), // Start immediately
      isActive: true,
      isReactivated: false,
      totalEmailsSent: 0,
      emailsOpened: 0,
      emailsClicked: 0,
      personalizedOffers,
      winBackStrategy,
    });

    // Execute first step
    await this.executeReEngagementStep(sequenceId, userProfile, ReEngagementStep.GENTLE_REMINDER);

    // Schedule remaining steps
    await this.scheduleReEngagementSequence(sequenceId, userProfile);

    // Track sequence start
    await this.trackReEngagementEvent('Re-engagement Sequence Started', {
      email: userProfile.email,
      dormancyLevel: userProfile.dormancyLevel,
      daysSinceLastActive: userProfile.daysSinceLastActive,
      churnRisk: userProfile.churnRisk,
      winBackStrategy,
      sequenceId,
    });
  }

  /**
   * Determine win-back strategy based on user profile
   */
  private determineWinBackStrategy(userProfile: DormantUserProfile): ReEngagementSequence['winBackStrategy'] {
    const {
      dormancyLevel,
      hasEverPurchased,
      lifetimeValue,
      churnRisk,
      emailEngagementRate,
    } = userProfile;

    // High-value customers get gentle approach
    if (lifetimeValue > 500 || hasEverPurchased) {
      return 'gentle';
    }

    // Critical churn risk gets aggressive approach
    if (churnRisk === 'critical' || dormancyLevel === UserDormancyLevel.DEEPLY_DORMANT) {
      return 'aggressive';
    }

    // Low email engagement gets value-focused approach
    if (emailEngagementRate < 0.1) {
      return 'value_focused';
    }

    // Customers with purchase history get nostalgic approach
    if (hasEverPurchased && userProfile.totalPurchases > 0) {
      return 'nostalgic';
    }

    return 'gentle';
  }

  /**
   * Generate personalized offers based on user profile
   */
  private async generatePersonalizedOffers(userProfile: DormantUserProfile): Promise<ReEngagementSequence['personalizedOffers']> {
    const offers: ReEngagementSequence['personalizedOffers'] = [];

    // Discount offer based on dormancy level and value
    const discountPercentage = this.calculateDiscountPercentage(userProfile);
    if (discountPercentage > 0) {
      offers.push({
        type: 'discount',
        value: discountPercentage,
        code: this.generateOfferCode(userProfile.email, 'WELCOME_BACK'),
        expiryDate: new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)), // 14 days
        used: false,
      });
    }

    // Free shipping for abandoned cart users
    if (userProfile.abandonedCarts.length > 0) {
      offers.push({
        type: 'free_shipping',
        value: 'Free Shipping',
        code: this.generateOfferCode(userProfile.email, 'FREE_SHIP'),
        expiryDate: new Date(Date.now() + (10 * 24 * 60 * 60 * 1000)), // 10 days
        used: false,
      });
    }

    // Exclusive early access for high-value dormant users
    if (userProfile.lifetimeValue > 200) {
      offers.push({
        type: 'exclusive_access',
        value: 'Exclusive Early Access to New Features',
        expiryDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days
        used: false,
      });
    }

    return offers;
  }

  /**
   * Calculate appropriate discount percentage
   */
  private calculateDiscountPercentage(userProfile: DormantUserProfile): number {
    const { dormancyLevel, churnRisk, hasEverPurchased, lifetimeValue } = userProfile;

    let baseDiscount = 0;

    // Base discount by dormancy level
    switch (dormancyLevel) {
      case UserDormancyLevel.SLIGHTLY_INACTIVE:
        baseDiscount = 5;
        break;
      case UserDormancyLevel.MODERATELY_INACTIVE:
        baseDiscount = 10;
        break;
      case UserDormancyLevel.HIGHLY_INACTIVE:
        baseDiscount = 15;
        break;
      case UserDormancyLevel.DEEPLY_DORMANT:
        baseDiscount = 20;
        break;
    }

    // Increase for high churn risk
    if (churnRisk === 'critical') {
      baseDiscount += 5;
    }
    if (churnRisk === 'high') {
      baseDiscount += 3;
    }

    // Reduce for existing customers (they already proved value)
    if (hasEverPurchased && lifetimeValue > 100) {
      baseDiscount -= 5;
    }

    return Math.max(0, Math.min(25, baseDiscount)); // Cap at 25%
  }

  /**
   * Execute specific re-engagement step
   */
  private async executeReEngagementStep(
    sequenceId: string,
    userProfile: DormantUserProfile,
    step: ReEngagementStep,
  ): Promise<void> {
    const sequence = this.reEngagementSequences.get(sequenceId);
    if (!sequence || !sequence.isActive || sequence.isReactivated) {
      return;
    }

    try {
      // Generate step content
      const emailContent = await this.generateStepContent(step, userProfile, sequence);

      // Send email
      await this.sendReEngagementEmail(userProfile.email, emailContent);

      // Update sequence
      sequence.completedSteps.push(step);
      sequence.totalEmailsSent++;
      sequence.currentStep = step;

      // Track step completion
      await this.trackReEngagementEvent('Re-engagement Email Sent', {
        sequenceId,
        step,
        userEmail: userProfile.email,
        emailSubject: emailContent.subject,
        winBackStrategy: sequence.winBackStrategy,
        dormancyLevel: sequence.dormancyLevel,
      });

      console.log(`[ReEngagementWorkflow] Sent ${step} email for user ${userProfile.email}`);
    } catch (error) {
      console.error(`[ReEngagementWorkflow] Failed to execute step ${step}:`, error);
      await this.trackReEngagementEvent('Re-engagement Email Error', {
        sequenceId,
        step,
        error: (error as Error).message,
      });
    }
  }

  /**
   * Generate content for re-engagement step
   */
  private async generateStepContent(
    step: ReEngagementStep,
    userProfile: DormantUserProfile,
    sequence: ReEngagementSequence,
  ): Promise<{
    subject: string;
    templateId: string;
    personalizations: Record<string, any>;
  }> {
    const { email, firstName, lastActiveDate, daysSinceLastActive } = userProfile;
    const name = firstName || email.split('@')[0];

    const basePersonalizations = {
      firstName: name,
      daysSinceLastActive,
      lastActiveDate: lastActiveDate.toLocaleDateString(),
      personalizedOffers: sequence.personalizedOffers,
      hasSpecialOffer: sequence.personalizedOffers.length > 0,
      winBackStrategy: sequence.winBackStrategy,
      returnUrl: this.generatePersonalizedReturnUrl(email),
    };

    const stepConfigs: Record<ReEngagementStep, {
      subject: string;
      templateId: string;
      personalizations: Record<string, any>;
    }> = {
      [ReEngagementStep.DORMANCY_DETECTION]: {
        subject: `We miss you, ${name}`,
        templateId: 'reengagement_detection_v1',
        personalizations: {
          ...basePersonalizations,
          isGentle: true,
        },
      },

      [ReEngagementStep.GENTLE_REMINDER]: {
        subject: `${name}, your AI companion is waiting`,
        templateId: 'reengagement_gentle_v1',
        personalizations: {
          ...basePersonalizations,
          reminderMessage: this.getPersonalizedReminderMessage(userProfile),
          lastInteraction: userProfile.viewedProducts[0]?.lastViewed.toLocaleDateString(),
          quickActions: await this.getQuickActions(userProfile),
        },
      },

      [ReEngagementStep.VALUE_PROPOSITION]: {
        subject: `Rediscover what makes Rolitt special`,
        templateId: 'reengagement_value_v1',
        personalizations: {
          ...basePersonalizations,
          valuePropositions: await this.getPersonalizedValueProps(userProfile),
          competitorComparison: true,
          uniqueFeatures: [
            'Most advanced emotional AI',
            'Completely private conversations',
            'Continuous learning and adaptation',
          ],
        },
      },

      [ReEngagementStep.SOCIAL_PROOF_UPDATE]: {
        subject: `See what's new in the Rolitt community`,
        templateId: 'reengagement_social_proof_v1',
        personalizations: {
          ...basePersonalizations,
          communityUpdates: await this.getCommunityUpdates(),
          userTestimonials: await this.getRecentTestimonials(),
          platformGrowth: {
            newUsers: '2,000+ new users this month',
            totalConversations: '500K+ conversations daily',
            satisfaction: '4.9/5 average rating',
          },
        },
      },

      [ReEngagementStep.EXCLUSIVE_OFFER]: {
        subject: `Special offer just for you, ${name} 🎁`,
        templateId: 'reengagement_exclusive_v1',
        personalizations: {
          ...basePersonalizations,
          isExclusive: true,
          offerUrgency: 'limited_time',
          offerExpiryDate: sequence.personalizedOffers[0]?.expiryDate.toLocaleDateString(),
          offerBenefits: await this.getOfferBenefits(sequence.personalizedOffers),
        },
      },

      [ReEngagementStep.FEATURE_HIGHLIGHTS]: {
        subject: `New features you haven't tried yet`,
        templateId: 'reengagement_features_v1',
        personalizations: {
          ...basePersonalizations,
          newFeatures: await this.getNewFeaturesSinceLastActive(userProfile.lastActiveDate),
          featureVideos: true,
          betaAccess: userProfile.lifetimeValue > 200,
        },
      },

      [ReEngagementStep.WIN_BACK_CAMPAIGN]: {
        subject: sequence.winBackStrategy === 'aggressive'
          ? `Last chance: 25% off expires tonight`
          : `We'd love to have you back, ${name}`,
        templateId: 'reengagement_winback_v1',
        personalizations: {
          ...basePersonalizations,
          isAggressive: sequence.winBackStrategy === 'aggressive',
          finalOffer: true,
          maxDiscount: sequence.personalizedOffers.reduce((max, offer) =>
            typeof offer.value === 'number' && offer.value > max ? offer.value : max, 0),
          guarantees: [
            '30-day money-back guarantee',
            'Free setup assistance',
            'Priority customer support',
          ],
        },
      },

      [ReEngagementStep.FINAL_GOODBYE]: {
        subject: `Goodbye for now, ${name}`,
        templateId: 'reengagement_goodbye_v1',
        personalizations: {
          ...basePersonalizations,
          isGoodbye: true,
          feedbackUrl: this.generateFeedbackUrl(email),
          resubscribeUrl: this.generateResubscribeUrl(email),
          downloadData: true, // Offer to download their data
        },
      },
    };

    return stepConfigs[step];
  }

  /**
   * Schedule complete re-engagement sequence
   */
  private async scheduleReEngagementSequence(
    sequenceId: string,
    userProfile: DormantUserProfile,
  ): Promise<void> {
    const sequence = this.reEngagementSequences.get(sequenceId);
    if (!sequence) {
      return;
    }

    // Timing varies based on dormancy level and strategy
    const stepDelays = this.getStepDelays(userProfile.dormancyLevel, sequence.winBackStrategy);

    const steps = [
      ReEngagementStep.VALUE_PROPOSITION,
      ReEngagementStep.SOCIAL_PROOF_UPDATE,
      ReEngagementStep.EXCLUSIVE_OFFER,
      ReEngagementStep.FEATURE_HIGHLIGHTS,
      ReEngagementStep.WIN_BACK_CAMPAIGN,
      ReEngagementStep.FINAL_GOODBYE,
    ];

    for (const step of steps) {
      const delay = stepDelays[step] * 60 * 60 * 1000; // Convert hours to milliseconds

      setTimeout(async () => {
        const currentSequence = this.reEngagementSequences.get(sequenceId);
        if (currentSequence?.isActive && !currentSequence.isReactivated) {
          await this.executeReEngagementStep(sequenceId, userProfile, step);
        }
      }, delay);
    }
  }

  /**
   * Get step delays based on dormancy level and strategy
   */
  private getStepDelays(
    _dormancyLevel: UserDormancyLevel,
    strategy: ReEngagementSequence['winBackStrategy'],
  ): Record<ReEngagementStep, number> {
    const baseDelays: Record<ReEngagementStep, number> = {
      [ReEngagementStep.DORMANCY_DETECTION]: 0,
      [ReEngagementStep.GENTLE_REMINDER]: 0, // Immediate
      [ReEngagementStep.VALUE_PROPOSITION]: 48, // 2 days
      [ReEngagementStep.SOCIAL_PROOF_UPDATE]: 120, // 5 days
      [ReEngagementStep.EXCLUSIVE_OFFER]: 168, // 7 days
      [ReEngagementStep.FEATURE_HIGHLIGHTS]: 240, // 10 days
      [ReEngagementStep.WIN_BACK_CAMPAIGN]: 336, // 14 days
      [ReEngagementStep.FINAL_GOODBYE]: 504, // 21 days
    };

    // Adjust timing based on strategy
    if (strategy === 'aggressive') {
      // Faster sequence for aggressive approach
      Object.keys(baseDelays).forEach((step) => {
        baseDelays[step as ReEngagementStep] *= 0.7; // 30% faster
      });
    } else if (strategy === 'gentle') {
      // Slower sequence for gentle approach
      Object.keys(baseDelays).forEach((step) => {
        baseDelays[step as ReEngagementStep] *= 1.5; // 50% slower
      });
    }

    return baseDelays;
  }

  /**
   * Mark user as reactivated
   */
  public async markUserReactivated(email: string, reactivationEvent: string): Promise<void> {
    const sequence = Array.from(this.reEngagementSequences.values())
      .find(seq => seq.userEmail === email && seq.isActive);

    if (sequence) {
      sequence.isReactivated = true;
      sequence.isActive = false;
      sequence.reactivationDate = new Date();

      // Track reactivation
      const tracking = this.reactivationTracking.get(email) || {
        reactivationEvents: [],
        engagementRecovery: [],
      };

      tracking.reactivationEvents.push({
        event: reactivationEvent,
        timestamp: new Date(),
        source: 'reengagement_workflow',
      });

      this.reactivationTracking.set(email, tracking);

      await this.trackReEngagementEvent('User Reactivated', {
        userEmail: email,
        sequenceId: sequence.sequenceId,
        reactivationEvent,
        emailsSentBeforeReactivation: sequence.totalEmailsSent,
        daysSinceSequenceStart: Math.floor((Date.now() - sequence.startDate.getTime()) / (1000 * 60 * 60 * 24)),
        winBackStrategy: sequence.winBackStrategy,
      });
    }
  }

  /**
   * Send re-engagement email via Klaviyo
   */
  private async sendReEngagementEmail(
    email: string,
    content: { subject: string; templateId: string; personalizations: Record<string, any> },
  ): Promise<void> {
    try {
      const { Klaviyo } = await import('../../Klaviyo');

      await Klaviyo.track('Re-engagement Email Sent', {
        email,
        subject: content.subject,
        templateId: content.templateId,
        personalizations: content.personalizations,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[ReEngagementWorkflow] Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Utility functions
   */
  private generateOfferCode(email: string, prefix: string): string {
    const hash = this.hashString(email).toString().slice(0, 4);
    return `${prefix}${hash}`;
  }

  private generatePersonalizedReturnUrl(email: string): string {
    const token = Buffer.from(email).toString('base64');
    return `/welcome-back?token=${token}`;
  }

  private generateFeedbackUrl(email: string): string {
    const token = Buffer.from(email).toString('base64');
    return `/feedback/exit?token=${token}`;
  }

  private generateResubscribeUrl(email: string): string {
    const token = Buffer.from(email).toString('base64');
    return `/resubscribe?token=${token}`;
  }

  private getPersonalizedReminderMessage(userProfile: DormantUserProfile): string {
    if (userProfile.abandonedCarts.length > 0) {
      return 'You left some items in your cart - they\'re still waiting for you!';
    }
    if (userProfile.wishlisted.length > 0) {
      return 'Some items from your wishlist are now available!';
    }
    if (userProfile.viewedProducts.length > 0) {
      return 'Remember that product you were looking at? We have some updates!';
    }
    return 'We\'ve missed your presence in our community.';
  }

  private async getQuickActions(userProfile: DormantUserProfile): Promise<Array<{ text: string; url: string }>> {
    const actions = [];

    if (userProfile.abandonedCarts.length > 0) {
      actions.push({ text: 'Complete Your Order', url: '/cart' });
    }
    if (userProfile.wishlisted.length > 0) {
      actions.push({ text: 'View Wishlist', url: '/wishlist' });
    }
    actions.push({ text: 'Explore New Features', url: '/features' });
    actions.push({ text: 'Join Community', url: '/community' });

    return actions.slice(0, 3); // Limit to 3 actions
  }

  private async getPersonalizedValueProps(userProfile: DormantUserProfile): Promise<string[]> {
    const props = [
      'Advanced AI that learns and adapts to you',
      'Completely private and secure conversations',
      '24/7 emotional support and companionship',
    ];

    // Customize based on user's interests
    if (userProfile.preferredContentTypes.includes('technology')) {
      props.push('Cutting-edge neural network technology');
    }
    if (userProfile.hasEverPurchased) {
      props.push('Continuous updates and improvements to your device');
    }

    return props;
  }

  private async getCommunityUpdates(): Promise<Array<{ title: string; description: string; date: string }>> {
    return [
      {
        title: 'New Voice Recognition Update',
        description: 'Improved accuracy and faster response times',
        date: '2 weeks ago',
      },
      {
        title: 'Community Challenge Winners',
        description: 'See the most creative Rolitt conversations',
        date: '1 week ago',
      },
    ];
  }

  private async getRecentTestimonials(): Promise<Array<{ name: string; quote: string; rating: number }>> {
    return [
      {
        name: 'Sarah M.',
        quote: 'Came back after 3 months away - Rolitt remembered everything about our conversations!',
        rating: 5,
      },
      {
        name: 'David L.',
        quote: 'The new features are incredible. So glad I reactivated my account.',
        rating: 5,
      },
    ];
  }

  private async getOfferBenefits(offers: ReEngagementSequence['personalizedOffers']): Promise<string[]> {
    const benefits = [];

    for (const offer of offers) {
      switch (offer.type) {
        case 'discount':
          benefits.push(`Save ${offer.value}% on your next purchase`);
          break;
        case 'free_shipping':
          benefits.push('Free shipping on all orders');
          break;
        case 'exclusive_access':
          benefits.push('Early access to new features and updates');
          break;
        case 'bundle':
          benefits.push('Special bundle pricing exclusive to returning users');
          break;
      }
    }

    return benefits;
  }

  private async getNewFeaturesSinceLastActive(lastActiveDate: Date): Promise<Array<{ name: string; description: string; releaseDate: Date }>> {
    // This would fetch actual features released since the user's last activity
    return [
      {
        name: 'Emotional Memory',
        description: 'Rolitt now remembers your emotional state across conversations',
        releaseDate: new Date('2024-01-15'),
      },
      {
        name: 'Voice Cloning',
        description: 'Create a unique voice profile for your Rolitt',
        releaseDate: new Date('2024-02-01'),
      },
    ].filter(feature => feature.releaseDate > lastActiveDate);
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
   * Track re-engagement events
   */
  private async trackReEngagementEvent(eventName: string, properties: Record<string, any>): Promise<void> {
    try {
      const { Klaviyo } = await import('../../Klaviyo');
      await Klaviyo.track(eventName, properties);
    } catch (error) {
      console.error('[ReEngagementWorkflow] Failed to track event:', error);
    }
  }

  /**
   * Get re-engagement analytics
   */
  public getReEngagementAnalytics(): {
    totalSequences: number;
    activeSequences: number;
    reactivatedUsers: number;
    reactivationRate: number;
    averageDaysToReactivation: number;
    stepPerformance: Record<ReEngagementStep, {
      sent: number;
      opened: number;
      clicked: number;
      reactivated: number;
      conversionRate: number;
    }>;
    strategyPerformance: Record<ReEngagementSequence['winBackStrategy'], {
      sequences: number;
      reactivated: number;
      rate: number;
    }>;
    dormancyLevelPerformance: Record<UserDormancyLevel, {
      sequences: number;
      reactivated: number;
      rate: number;
    }>;
  } {
    const sequences = Array.from(this.reEngagementSequences.values());
    const totalSequences = sequences.length;
    const activeSequences = sequences.filter(s => s.isActive).length;
    const reactivatedUsers = sequences.filter(s => s.isReactivated).length;
    const reactivationRate = totalSequences > 0 ? (reactivatedUsers / totalSequences) * 100 : 0;

    // Calculate average days to reactivation
    const reactivatedSequences = sequences.filter(s => s.isReactivated && s.reactivationDate);
    const averageDaysToReactivation = reactivatedSequences.length > 0
      ? reactivatedSequences.reduce((sum, seq) => {
        const days = (seq.reactivationDate!.getTime() - seq.startDate.getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0) / reactivatedSequences.length
      : 0;

    // Step performance (mock data - would be real in implementation)
    const stepPerformance: Record<ReEngagementStep, any> = {
      [ReEngagementStep.DORMANCY_DETECTION]: { sent: 0, opened: 0, clicked: 0, reactivated: 0, conversionRate: 0 },
      [ReEngagementStep.GENTLE_REMINDER]: { sent: 0, opened: 0, clicked: 0, reactivated: 0, conversionRate: 0 },
      [ReEngagementStep.VALUE_PROPOSITION]: { sent: 0, opened: 0, clicked: 0, reactivated: 0, conversionRate: 0 },
      [ReEngagementStep.SOCIAL_PROOF_UPDATE]: { sent: 0, opened: 0, clicked: 0, reactivated: 0, conversionRate: 0 },
      [ReEngagementStep.EXCLUSIVE_OFFER]: { sent: 0, opened: 0, clicked: 0, reactivated: 0, conversionRate: 0 },
      [ReEngagementStep.FEATURE_HIGHLIGHTS]: { sent: 0, opened: 0, clicked: 0, reactivated: 0, conversionRate: 0 },
      [ReEngagementStep.WIN_BACK_CAMPAIGN]: { sent: 0, opened: 0, clicked: 0, reactivated: 0, conversionRate: 0 },
      [ReEngagementStep.FINAL_GOODBYE]: { sent: 0, opened: 0, clicked: 0, reactivated: 0, conversionRate: 0 },
    };

    // Strategy performance
    const strategyPerformance: Record<ReEngagementSequence['winBackStrategy'], any> = {
      gentle: { sequences: 0, reactivated: 0, rate: 0 },
      aggressive: { sequences: 0, reactivated: 0, rate: 0 },
      value_focused: { sequences: 0, reactivated: 0, rate: 0 },
      nostalgic: { sequences: 0, reactivated: 0, rate: 0 },
    };

    sequences.forEach((seq) => {
      strategyPerformance[seq.winBackStrategy].sequences++;
      if (seq.isReactivated) {
        strategyPerformance[seq.winBackStrategy].reactivated++;
      }
    });

    Object.values(strategyPerformance).forEach((strategy) => {
      strategy.rate = strategy.sequences > 0 ? (strategy.reactivated / strategy.sequences) * 100 : 0;
    });

    // Dormancy level performance
    const dormancyLevelPerformance: Record<UserDormancyLevel, any> = {
      [UserDormancyLevel.SLIGHTLY_INACTIVE]: { sequences: 0, reactivated: 0, rate: 0 },
      [UserDormancyLevel.MODERATELY_INACTIVE]: { sequences: 0, reactivated: 0, rate: 0 },
      [UserDormancyLevel.HIGHLY_INACTIVE]: { sequences: 0, reactivated: 0, rate: 0 },
      [UserDormancyLevel.DEEPLY_DORMANT]: { sequences: 0, reactivated: 0, rate: 0 },
    };

    sequences.forEach((seq) => {
      dormancyLevelPerformance[seq.dormancyLevel].sequences++;
      if (seq.isReactivated) {
        dormancyLevelPerformance[seq.dormancyLevel].reactivated++;
      }
    });

    Object.values(dormancyLevelPerformance).forEach((level) => {
      level.rate = level.sequences > 0 ? (level.reactivated / level.sequences) * 100 : 0;
    });

    return {
      totalSequences,
      activeSequences,
      reactivatedUsers,
      reactivationRate,
      averageDaysToReactivation,
      stepPerformance,
      strategyPerformance,
      dormancyLevelPerformance,
    };
  }
}

// Singleton instance
export const reEngagementWorkflow = ReEngagementWorkflow.getInstance();

// Convenience functions
export const startReEngagementForDormantUser = (userProfile: DormantUserProfile) =>
  reEngagementWorkflow.startReEngagementSequence(userProfile);

export const markUserAsReactivated = (email: string, event: string) =>
  reEngagementWorkflow.markUserReactivated(email, event);
