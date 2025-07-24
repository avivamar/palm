/**
 * 忠诚度计划自动化工作流
 * 管理客户忠诚度计划的完整生命周期，从新用户到VIP客户的升级与奖励
 */

export enum LoyaltyTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

export enum LoyaltyEvent {
  PROGRAM_JOIN = 'program_join',
  POINTS_EARNED = 'points_earned',
  POINTS_REDEEMED = 'points_redeemed',
  TIER_UPGRADE = 'tier_upgrade',
  TIER_DOWNGRADE = 'tier_downgrade',
  BONUS_EARNED = 'bonus_earned',
  MILESTONE_ACHIEVED = 'milestone_achieved',
  REFERRAL_REWARDED = 'referral_rewarded',
  ANNIVERSARY_BONUS = 'anniversary_bonus',
  BIRTHDAY_BONUS = 'birthday_bonus',
}

export enum PointsEarnedAction {
  PURCHASE = 'purchase',
  REVIEW = 'review',
  REFERRAL = 'referral',
  SOCIAL_SHARE = 'social_share',
  SURVEY_COMPLETION = 'survey_completion',
  COMMUNITY_PARTICIPATION = 'community_participation',
  PRODUCT_FEEDBACK = 'product_feedback',
  BIRTHDAY_BONUS = 'birthday_bonus',
  ANNIVERSARY_BONUS = 'anniversary_bonus',
}

export enum RedemptionType {
  DISCOUNT = 'discount',
  FREE_SHIPPING = 'free_shipping',
  EXCLUSIVE_PRODUCT = 'exclusive_product',
  EARLY_ACCESS = 'early_access',
  PREMIUM_SUPPORT = 'premium_support',
  GIFT_CARD = 'gift_card',
  CHARITY_DONATION = 'charity_donation',
}

type LoyaltyMember = {
  memberId: string;
  email: string;
  firstName?: string;
  joinDate: Date;
  currentTier: LoyaltyTier;

  // Points and spending
  totalPointsEarned: number;
  currentPointsBalance: number;
  totalPointsRedeemed: number;
  lifetimeSpend: number;

  // Tier progress
  pointsToNextTier: number;
  spendToNextTier: number;
  tierProgress: number; // 0-100%
  nextTierDate?: Date;

  // Engagement metrics
  totalReferrals: number;
  totalReviews: number;
  socialShares: number;
  communityParticipation: number;

  // Member status
  isActive: boolean;
  lastActivity: Date;
  membershipStatus: 'active' | 'at_risk' | 'dormant' | 'churned';

  // Preferences
  communicationPreferences: {
    tierUpdates: boolean;
    promotionalOffers: boolean;
    pointsReminders: boolean;
    exclusiveAccess: boolean;
  };

  // Special dates
  birthday?: Date;
  anniversaryDate: Date;
};

type LoyaltyWorkflowSequence = {
  sequenceId: string;
  memberId: string;
  email: string;
  currentTier: LoyaltyTier;
  triggerEvent: LoyaltyEvent;
  isActive: boolean;
  startDate: Date;
  completionDate?: Date;

  // Workflow-specific data
  emailsSent: number;
  pointsAwarded: number;
  bonusesGiven: Array<{
    type: string;
    value: number;
    date: Date;
  }>;

  // Performance tracking
  engagementRate: number;
  redemptionRate: number;
  tierUpgradeAchieved: boolean;
};

type TierBenefit = {
  tier: LoyaltyTier;
  benefits: Array<{
    type: 'discount' | 'free_shipping' | 'early_access' | 'support' | 'exclusive';
    name: string;
    description: string;
    value?: string | number;
  }>;
  pointsMultiplier: number;
  minimumSpend: number;
  minimumPoints: number;
};

/**
 * Loyalty Program Workflow
 */
export class LoyaltyProgramWorkflow {
  private static instance: LoyaltyProgramWorkflow;
  private loyaltyMembers: Map<string, LoyaltyMember> = new Map();
  private workflowSequences: Map<string, LoyaltyWorkflowSequence> = new Map();
  private tierBenefits!: Record<LoyaltyTier, TierBenefit>;
  private pointsExchangeRates!: Record<PointsEarnedAction, number>;

  private constructor() {
    this.initializeTierBenefits();
    this.initializePointsSystem();
  }

  public static getInstance(): LoyaltyProgramWorkflow {
    if (!LoyaltyProgramWorkflow.instance) {
      LoyaltyProgramWorkflow.instance = new LoyaltyProgramWorkflow();
    }
    return LoyaltyProgramWorkflow.instance;
  }

  /**
   * Initialize tier benefits structure
   */
  private initializeTierBenefits(): void {
    this.tierBenefits = {
      [LoyaltyTier.BRONZE]: {
        tier: LoyaltyTier.BRONZE,
        benefits: [
          { type: 'discount', name: '5% Member Discount', description: '5% off all purchases', value: 5 },
          { type: 'free_shipping', name: 'Free Shipping', description: 'Free shipping on orders over $75', value: 75 },
        ],
        pointsMultiplier: 1,
        minimumSpend: 0,
        minimumPoints: 0,
      },

      [LoyaltyTier.SILVER]: {
        tier: LoyaltyTier.SILVER,
        benefits: [
          { type: 'discount', name: '10% Member Discount', description: '10% off all purchases', value: 10 },
          { type: 'free_shipping', name: 'Free Shipping', description: 'Free shipping on orders over $50', value: 50 },
          { type: 'early_access', name: 'Early Access', description: '24-hour early access to new products', value: 24 },
        ],
        pointsMultiplier: 1.25,
        minimumSpend: 250,
        minimumPoints: 500,
      },

      [LoyaltyTier.GOLD]: {
        tier: LoyaltyTier.GOLD,
        benefits: [
          { type: 'discount', name: '15% Member Discount', description: '15% off all purchases', value: 15 },
          { type: 'free_shipping', name: 'Always Free Shipping', description: 'Free shipping on all orders', value: 0 },
          { type: 'early_access', name: 'Early Access', description: '48-hour early access to new products', value: 48 },
          { type: 'support', name: 'Priority Support', description: 'Priority customer support line', value: 'priority' },
        ],
        pointsMultiplier: 1.5,
        minimumSpend: 500,
        minimumPoints: 1000,
      },

      [LoyaltyTier.PLATINUM]: {
        tier: LoyaltyTier.PLATINUM,
        benefits: [
          { type: 'discount', name: '20% Member Discount', description: '20% off all purchases', value: 20 },
          { type: 'free_shipping', name: 'Always Free Shipping', description: 'Free expedited shipping on all orders', value: 0 },
          { type: 'early_access', name: 'VIP Early Access', description: '72-hour early access to new products', value: 72 },
          { type: 'support', name: 'VIP Support', description: 'Dedicated VIP support representative', value: 'vip' },
          { type: 'exclusive', name: 'Exclusive Events', description: 'Invitation to exclusive member events', value: 'events' },
        ],
        pointsMultiplier: 2,
        minimumSpend: 1000,
        minimumPoints: 2500,
      },

      [LoyaltyTier.DIAMOND]: {
        tier: LoyaltyTier.DIAMOND,
        benefits: [
          { type: 'discount', name: '25% Member Discount', description: '25% off all purchases', value: 25 },
          { type: 'free_shipping', name: 'White Glove Service', description: 'Free white glove delivery and setup', value: 0 },
          { type: 'early_access', name: 'Beta Access', description: 'Access to beta features and products', value: 'beta' },
          { type: 'support', name: 'Concierge Support', description: '24/7 personal concierge service', value: 'concierge' },
          { type: 'exclusive', name: 'Co-creation', description: 'Input on product development', value: 'co_creation' },
        ],
        pointsMultiplier: 2.5,
        minimumSpend: 2500,
        minimumPoints: 5000,
      },
    };
  }

  /**
   * Initialize points earning rates
   */
  private initializePointsSystem(): void {
    this.pointsExchangeRates = {
      [PointsEarnedAction.PURCHASE]: 1, // 1 point per $1 spent
      [PointsEarnedAction.REVIEW]: 50, // 50 points per review
      [PointsEarnedAction.REFERRAL]: 200, // 200 points per successful referral
      [PointsEarnedAction.SOCIAL_SHARE]: 25, // 25 points per social share
      [PointsEarnedAction.SURVEY_COMPLETION]: 30, // 30 points per survey
      [PointsEarnedAction.COMMUNITY_PARTICIPATION]: 15, // 15 points per forum post/comment
      [PointsEarnedAction.PRODUCT_FEEDBACK]: 40, // 40 points per feedback submission
      [PointsEarnedAction.BIRTHDAY_BONUS]: 100, // 100 points birthday bonus
      [PointsEarnedAction.ANNIVERSARY_BONUS]: 150, // 150 points anniversary bonus
    };
  }

  /**
   * Join loyalty program
   */
  public async joinLoyaltyProgram(memberData: {
    email: string;
    firstName?: string;
    birthday?: Date;
    initialPurchaseAmount?: number;
  }): Promise<string> {
    const memberId = `member_${Date.now()}_${this.hashString(memberData.email)}`;

    // Check if user already exists
    const existingMember = Array.from(this.loyaltyMembers.values())
      .find(member => member.email === memberData.email);

    if (existingMember) {
      console.log(`[LoyaltyProgramWorkflow] User ${memberData.email} already a member`);
      return existingMember.memberId;
    }

    // Create new member
    const newMember: LoyaltyMember = {
      memberId,
      email: memberData.email,
      firstName: memberData.firstName,
      joinDate: new Date(),
      currentTier: LoyaltyTier.BRONZE,

      totalPointsEarned: 0,
      currentPointsBalance: 0,
      totalPointsRedeemed: 0,
      lifetimeSpend: memberData.initialPurchaseAmount || 0,

      pointsToNextTier: this.tierBenefits[LoyaltyTier.SILVER].minimumPoints,
      spendToNextTier: this.tierBenefits[LoyaltyTier.SILVER].minimumSpend,
      tierProgress: 0,

      totalReferrals: 0,
      totalReviews: 0,
      socialShares: 0,
      communityParticipation: 0,

      isActive: true,
      lastActivity: new Date(),
      membershipStatus: 'active',

      communicationPreferences: {
        tierUpdates: true,
        promotionalOffers: true,
        pointsReminders: true,
        exclusiveAccess: true,
      },

      birthday: memberData.birthday,
      anniversaryDate: new Date(),
    };

    this.loyaltyMembers.set(memberId, newMember);

    // Award welcome bonus
    if (memberData.initialPurchaseAmount) {
      await this.awardPoints(memberId, PointsEarnedAction.PURCHASE, memberData.initialPurchaseAmount);
    }

    // Start welcome workflow
    await this.startLoyaltyWorkflow(memberId, LoyaltyEvent.PROGRAM_JOIN);

    // Track join event
    await this.trackLoyaltyEvent('Loyalty Program Joined', {
      memberId,
      email: memberData.email,
      initialTier: LoyaltyTier.BRONZE,
      welcomeBonus: memberData.initialPurchaseAmount || 0,
    });

    return memberId;
  }

  /**
   * Award points to member
   */
  public async awardPoints(
    memberId: string,
    action: PointsEarnedAction,
    value?: number,
  ): Promise<void> {
    const member = this.loyaltyMembers.get(memberId);
    if (!member) {
      return;
    }

    const basePoints = this.pointsExchangeRates[action];
    const multiplier = this.tierBenefits[member.currentTier].pointsMultiplier;
    const pointsToAward = Math.floor((value || 1) * basePoints * multiplier);

    // Update member points
    member.totalPointsEarned += pointsToAward;
    member.currentPointsBalance += pointsToAward;
    member.lastActivity = new Date();

    // Update activity counters
    switch (action) {
      case PointsEarnedAction.PURCHASE:
        member.lifetimeSpend += (value || 0);
        break;
      case PointsEarnedAction.REVIEW:
        member.totalReviews++;
        break;
      case PointsEarnedAction.REFERRAL:
        member.totalReferrals++;
        break;
      case PointsEarnedAction.SOCIAL_SHARE:
        member.socialShares++;
        break;
      case PointsEarnedAction.COMMUNITY_PARTICIPATION:
        member.communityParticipation++;
        break;
    }

    // Check for tier upgrade
    await this.checkTierUpgrade(memberId);

    // Start points earned workflow
    await this.startLoyaltyWorkflow(memberId, LoyaltyEvent.POINTS_EARNED, {
      action,
      pointsAwarded: pointsToAward,
      newBalance: member.currentPointsBalance,
    });

    // Track points awarded
    await this.trackLoyaltyEvent('Points Awarded', {
      memberId,
      email: member.email,
      action,
      pointsAwarded: pointsToAward,
      multiplier,
      newBalance: member.currentPointsBalance,
      currentTier: member.currentTier,
    });
  }

  /**
   * Redeem points
   */
  public async redeemPoints(
    memberId: string,
    redemptionType: RedemptionType,
    pointsCost: number,
    metadata?: Record<string, any>,
  ): Promise<{ success: boolean; redemptionCode?: string; message?: string }> {
    const member = this.loyaltyMembers.get(memberId);
    if (!member) {
      return { success: false, message: 'Member not found' };
    }

    if (member.currentPointsBalance < pointsCost) {
      return { success: false, message: 'Insufficient points balance' };
    }

    // Deduct points
    member.currentPointsBalance -= pointsCost;
    member.totalPointsRedeemed += pointsCost;
    member.lastActivity = new Date();

    // Generate redemption code
    const redemptionCode = this.generateRedemptionCode(memberId, redemptionType);

    // Start redemption workflow
    await this.startLoyaltyWorkflow(memberId, LoyaltyEvent.POINTS_REDEEMED, {
      redemptionType,
      pointsCost,
      redemptionCode,
      metadata,
    });

    // Track redemption
    await this.trackLoyaltyEvent('Points Redeemed', {
      memberId,
      email: member.email,
      redemptionType,
      pointsCost,
      redemptionCode,
      remainingBalance: member.currentPointsBalance,
      metadata,
    });

    return {
      success: true,
      redemptionCode,
      message: `Successfully redeemed ${pointsCost} points for ${redemptionType}`,
    };
  }

  /**
   * Check and process tier upgrade
   */
  private async checkTierUpgrade(memberId: string): Promise<void> {
    const member = this.loyaltyMembers.get(memberId);
    if (!member) {
      return;
    }

    const currentTierIndex = Object.values(LoyaltyTier).indexOf(member.currentTier);
    const nextTierValues = Object.values(LoyaltyTier);

    // Check if upgrade is possible
    for (let i = currentTierIndex + 1; i < nextTierValues.length; i++) {
      const nextTier = nextTierValues[i];
      if (!nextTier) {
        continue;
      }
      const tierRequirements = this.tierBenefits[nextTier];

      const meetsSpendRequirement = member.lifetimeSpend >= tierRequirements.minimumSpend;
      const meetsPointsRequirement = member.totalPointsEarned >= tierRequirements.minimumPoints;

      if (meetsSpendRequirement && meetsPointsRequirement) {
        const previousTier = member.currentTier;
        member.currentTier = nextTier;

        // Update tier progress for next level
        if (i < nextTierValues.length - 1) {
          const nextTierUp = nextTierValues[i + 1];
          if (nextTierUp) {
            const nextTierRequirements = this.tierBenefits[nextTierUp];
            member.pointsToNextTier = Math.max(0, nextTierRequirements.minimumPoints - member.totalPointsEarned);
            member.spendToNextTier = Math.max(0, nextTierRequirements.minimumSpend - member.lifetimeSpend);
            member.tierProgress = this.calculateTierProgress(member, nextTierUp);
          }
        } else {
          // Already at highest tier
          member.pointsToNextTier = 0;
          member.spendToNextTier = 0;
          member.tierProgress = 100;
        }

        // Award tier upgrade bonus
        const upgradeBonus = this.calculateTierUpgradeBonus(nextTier);
        member.currentPointsBalance += upgradeBonus;
        member.totalPointsEarned += upgradeBonus;

        // Start tier upgrade workflow
        await this.startLoyaltyWorkflow(memberId, LoyaltyEvent.TIER_UPGRADE, {
          previousTier,
          newTier: nextTier,
          upgradeBonus,
        });

        // Track tier upgrade
        await this.trackLoyaltyEvent('Tier Upgraded', {
          memberId,
          email: member.email,
          previousTier,
          newTier: nextTier,
          upgradeBonus,
          lifetimeSpend: member.lifetimeSpend,
          totalPointsEarned: member.totalPointsEarned,
        });

        break; // Only upgrade one tier at a time
      }
    }

    // Update tier progress for current tier
    const nextTierIndex = Math.min(currentTierIndex + 1, nextTierValues.length - 1);
    if (nextTierIndex > currentTierIndex) {
      const nextTier = nextTierValues[nextTierIndex];
      if (nextTier) {
        member.tierProgress = this.calculateTierProgress(member, nextTier);
      }
    }
  }

  /**
   * Calculate tier progress percentage
   */
  private calculateTierProgress(member: LoyaltyMember, targetTier: LoyaltyTier): number {
    const requirements = this.tierBenefits[targetTier];

    const spendProgress = member.lifetimeSpend / requirements.minimumSpend;
    const pointsProgress = member.totalPointsEarned / requirements.minimumPoints;

    // Use the lower of the two progress metrics
    const overallProgress = Math.min(spendProgress, pointsProgress);

    return Math.min(100, Math.max(0, overallProgress * 100));
  }

  /**
   * Calculate tier upgrade bonus
   */
  private calculateTierUpgradeBonus(tier: LoyaltyTier): number {
    const bonusMap: Record<LoyaltyTier, number> = {
      [LoyaltyTier.BRONZE]: 0,
      [LoyaltyTier.SILVER]: 100,
      [LoyaltyTier.GOLD]: 250,
      [LoyaltyTier.PLATINUM]: 500,
      [LoyaltyTier.DIAMOND]: 1000,
    };

    return bonusMap[tier] || 0;
  }

  /**
   * Start loyalty program workflow
   */
  private async startLoyaltyWorkflow(
    memberId: string,
    triggerEvent: LoyaltyEvent,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const member = this.loyaltyMembers.get(memberId);
    if (!member) {
      return;
    }

    const sequenceId = `loyalty_${memberId}_${triggerEvent}_${Date.now()}`;

    // Create workflow sequence
    const sequence: LoyaltyWorkflowSequence = {
      sequenceId,
      memberId,
      email: member.email,
      currentTier: member.currentTier,
      triggerEvent,
      isActive: true,
      startDate: new Date(),
      emailsSent: 0,
      pointsAwarded: 0,
      bonusesGiven: [],
      engagementRate: 0,
      redemptionRate: 0,
      tierUpgradeAchieved: false,
    };

    this.workflowSequences.set(sequenceId, sequence);

    // Execute workflow based on trigger event
    await this.executeLoyaltyWorkflow(sequenceId, triggerEvent, metadata);
  }

  /**
   * Execute loyalty workflow
   */
  private async executeLoyaltyWorkflow(
    sequenceId: string,
    triggerEvent: LoyaltyEvent,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const sequence = this.workflowSequences.get(sequenceId);
    if (!sequence) {
      return;
    }

    const member = this.loyaltyMembers.get(sequence.memberId);
    if (!member) {
      return;
    }

    try {
      let emailContent;

      switch (triggerEvent) {
        case LoyaltyEvent.PROGRAM_JOIN:
          emailContent = await this.generateWelcomeEmail(member, sequence);
          break;

        case LoyaltyEvent.POINTS_EARNED:
          emailContent = await this.generatePointsEarnedEmail(member, sequence, metadata);
          break;

        case LoyaltyEvent.TIER_UPGRADE:
          emailContent = await this.generateTierUpgradeEmail(member, sequence, metadata);
          break;

        case LoyaltyEvent.POINTS_REDEEMED:
          emailContent = await this.generateRedemptionEmail(member, sequence, metadata);
          break;

        case LoyaltyEvent.MILESTONE_ACHIEVED:
          emailContent = await this.generateMilestoneEmail(member, sequence, metadata);
          break;

        default:
          console.log(`[LoyaltyProgramWorkflow] No workflow defined for ${triggerEvent}`);
          return;
      }

      if (emailContent) {
        await this.sendLoyaltyEmail(member.email, emailContent);
        sequence.emailsSent++;

        // Track email sent
        await this.trackLoyaltyEvent('Loyalty Email Sent', {
          sequenceId,
          triggerEvent,
          memberId: member.memberId,
          email: member.email,
          emailSubject: emailContent.subject,
          currentTier: member.currentTier,
        });
      }

      // Mark sequence as completed
      sequence.isActive = false;
      sequence.completionDate = new Date();
    } catch (error) {
      console.error(`[LoyaltyProgramWorkflow] Failed to execute workflow for ${triggerEvent}:`, error);
      await this.trackLoyaltyEvent('Loyalty Workflow Error', {
        sequenceId,
        triggerEvent,
        error: (error as Error).message,
      });
    }
  }

  /**
   * Generate welcome email content
   */
  private async generateWelcomeEmail(
    member: LoyaltyMember,
    _sequence: LoyaltyWorkflowSequence,
  ): Promise<{ subject: string; templateId: string; personalizations: Record<string, any> }> {
    const tierBenefits = this.tierBenefits[member.currentTier];

    return {
      subject: `Welcome to Rolitt Rewards, ${member.firstName || 'Member'}! 🎉`,
      templateId: 'loyalty_welcome_v1',
      personalizations: {
        firstName: member.firstName || 'Member',
        currentTier: member.currentTier,
        tierBenefits: tierBenefits.benefits,
        pointsBalance: member.currentPointsBalance,
        pointsToNextTier: member.pointsToNextTier,
        spendToNextTier: member.spendToNextTier,
        nextTier: this.getNextTier(member.currentTier),
        membershipId: member.memberId.slice(-8).toUpperCase(),
        programGuideUrl: '/loyalty/guide',
        pointsHistoryUrl: '/loyalty/points',
        tierProgressPercentage: member.tierProgress,
      },
    };
  }

  /**
   * Generate points earned email content
   */
  private async generatePointsEarnedEmail(
    member: LoyaltyMember,
    _sequence: LoyaltyWorkflowSequence,
    metadata?: Record<string, any>,
  ): Promise<{ subject: string; templateId: string; personalizations: Record<string, any> }> {
    const pointsAwarded = metadata?.pointsAwarded || 0;
    const action = metadata?.action || 'activity';

    return {
      subject: `You earned ${pointsAwarded} points! 🌟`,
      templateId: 'loyalty_points_earned_v1',
      personalizations: {
        firstName: member.firstName || 'Member',
        pointsAwarded,
        action,
        newBalance: member.currentPointsBalance,
        currentTier: member.currentTier,
        pointsMultiplier: this.tierBenefits[member.currentTier].pointsMultiplier,
        redemptionSuggestions: await this.getRedemptionSuggestions(member),
        pointsToNextTier: member.pointsToNextTier,
        tierProgressPercentage: member.tierProgress,
      },
    };
  }

  /**
   * Generate tier upgrade email content
   */
  private async generateTierUpgradeEmail(
    member: LoyaltyMember,
    _sequence: LoyaltyWorkflowSequence,
    metadata?: Record<string, any>,
  ): Promise<{ subject: string; templateId: string; personalizations: Record<string, any> }> {
    const newTier = (metadata?.newTier || member.currentTier) as LoyaltyTier;
    const upgradeBonus = metadata?.upgradeBonus || 0;
    const newBenefits = this.tierBenefits[newTier];

    return {
      subject: `Congratulations! You're now ${newTier.toUpperCase()} tier! 👑`,
      templateId: 'loyalty_tier_upgrade_v1',
      personalizations: {
        firstName: member.firstName || 'Member',
        previousTier: metadata?.previousTier,
        newTier,
        upgradeBonus,
        newBenefits: newBenefits.benefits,
        newPointsMultiplier: newBenefits.pointsMultiplier,
        exclusiveOffers: await this.getTierExclusiveOffers(newTier),
        celebrationGifUrl: '/images/tier-upgrade-celebration.gif',
        shareUrl: this.generateTierUpgradeShareUrl(member.memberId, newTier),
      },
    };
  }

  /**
   * Generate redemption confirmation email
   */
  private async generateRedemptionEmail(
    member: LoyaltyMember,
    _sequence: LoyaltyWorkflowSequence,
    metadata?: Record<string, any>,
  ): Promise<{ subject: string; templateId: string; personalizations: Record<string, any> }> {
    const redemptionType = metadata?.redemptionType;
    const pointsCost = metadata?.pointsCost || 0;
    const redemptionCode = metadata?.redemptionCode;

    return {
      subject: `Your reward is ready! 🎁`,
      templateId: 'loyalty_redemption_v1',
      personalizations: {
        firstName: member.firstName || 'Member',
        redemptionType,
        pointsCost,
        redemptionCode,
        remainingBalance: member.currentPointsBalance,
        redemptionInstructions: this.getRedemptionInstructions(redemptionType),
        expiryDate: new Date(Date.now() + (90 * 24 * 60 * 60 * 1000)).toLocaleDateString(), // 90 days
        moreRewards: await this.getRedemptionSuggestions(member),
      },
    };
  }

  /**
   * Generate milestone achievement email
   */
  private async generateMilestoneEmail(
    member: LoyaltyMember,
    _sequence: LoyaltyWorkflowSequence,
    metadata?: Record<string, any>,
  ): Promise<{ subject: string; templateId: string; personalizations: Record<string, any> }> {
    const milestone = metadata?.milestone || 'achievement';
    const bonus = metadata?.bonus || 0;

    return {
      subject: `Milestone unlocked: ${milestone}! 🏆`,
      templateId: 'loyalty_milestone_v1',
      personalizations: {
        firstName: member.firstName || 'Member',
        milestone,
        bonus,
        totalPointsEarned: member.totalPointsEarned,
        memberSince: member.joinDate.toLocaleDateString(),
        nextMilestone: await this.getNextMilestone(member),
        celebrationOffer: await this.getMilestoneOffer(member),
      },
    };
  }

  /**
   * Utility functions
   */
  private getNextTier(currentTier: LoyaltyTier): LoyaltyTier | null {
    const tiers = Object.values(LoyaltyTier);
    const currentIndex = tiers.indexOf(currentTier);
    return currentIndex < tiers.length - 1 ? (tiers[currentIndex + 1] as LoyaltyTier) : null;
  }

  private generateRedemptionCode(memberId: string, redemptionType: RedemptionType): string {
    const hash = this.hashString(`${memberId}_${redemptionType}_${Date.now()}`).toString().slice(0, 8);
    return `REWARD${hash}`.toUpperCase();
  }

  private generateTierUpgradeShareUrl(memberId: string, tier: LoyaltyTier): string {
    return `/loyalty/share?member=${memberId}&tier=${tier}`;
  }

  private async getRedemptionSuggestions(member: LoyaltyMember): Promise<Array<{ type: RedemptionType; cost: number; description: string }>> {
    const balance = member.currentPointsBalance;
    const suggestions = [];

    if (balance >= 100) {
      suggestions.push({ type: RedemptionType.DISCOUNT, cost: 100, description: '5% discount on next purchase' });
    }
    if (balance >= 200) {
      suggestions.push({ type: RedemptionType.FREE_SHIPPING, cost: 200, description: 'Free shipping on next order' });
    }
    if (balance >= 500) {
      suggestions.push({ type: RedemptionType.EXCLUSIVE_PRODUCT, cost: 500, description: 'Access to limited edition colors' });
    }

    return suggestions.slice(0, 3);
  }

  private async getTierExclusiveOffers(tier: LoyaltyTier): Promise<string[]> {
    const offers: Record<LoyaltyTier, string[]> = {
      [LoyaltyTier.BRONZE]: ['Welcome kit with accessories'],
      [LoyaltyTier.SILVER]: ['Monthly member-only webinars', 'Extended warranty'],
      [LoyaltyTier.GOLD]: ['Quarterly exclusive product previews', 'Personal AI training sessions'],
      [LoyaltyTier.PLATINUM]: ['VIP customer events', 'Direct line to product team'],
      [LoyaltyTier.DIAMOND]: ['Co-creation opportunities', 'Annual VIP retreat invitation'],
    };

    return offers[tier] || [];
  }

  private getRedemptionInstructions(redemptionType: RedemptionType): string[] {
    const instructions: Record<RedemptionType, string[]> = {
      [RedemptionType.DISCOUNT]: ['Apply code at checkout', 'Valid for 30 days', 'Cannot be combined with other offers'],
      [RedemptionType.FREE_SHIPPING]: ['Automatically applied to your account', 'Valid for next order', 'No minimum purchase required'],
      [RedemptionType.EXCLUSIVE_PRODUCT]: ['Access granted to your account', 'Limited quantities available', 'Early access for 48 hours'],
      [RedemptionType.EARLY_ACCESS]: ['You\'ll be notified 24 hours before public launch', 'Access link sent via email', 'Valid for 72 hours'],
      [RedemptionType.PREMIUM_SUPPORT]: ['Priority queue activated', 'Direct phone line available', 'Response time under 2 hours'],
      [RedemptionType.GIFT_CARD]: ['Digital gift card sent to your email', 'Can be used immediately', 'Never expires'],
      [RedemptionType.CHARITY_DONATION]: ['Donation made on your behalf', 'Tax receipt available', 'Thank you certificate included'],
    };

    return instructions[redemptionType] || ['Instructions will be provided separately'];
  }

  private async getNextMilestone(member: LoyaltyMember): Promise<string> {
    const milestones = [
      { points: 1000, name: 'First Thousand' },
      { points: 2500, name: 'Rising Star' },
      { points: 5000, name: 'Loyalty Champion' },
      { points: 10000, name: 'Elite Member' },
      { points: 25000, name: 'Platinum Legacy' },
    ];

    const nextMilestone = milestones.find(m => m.points > member.totalPointsEarned);
    return nextMilestone ? `${nextMilestone.name} (${nextMilestone.points} points)` : 'You\'ve achieved all milestones!';
  }

  private async getMilestoneOffer(_member: LoyaltyMember): Promise<{ description: string; value: string }> {
    return {
      description: 'Special milestone bonus',
      value: '15% off + free shipping',
    };
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
   * Send loyalty email via Klaviyo
   */
  private async sendLoyaltyEmail(
    email: string,
    content: { subject: string; templateId: string; personalizations: Record<string, any> },
  ): Promise<void> {
    try {
      const { Klaviyo } = await import('../../Klaviyo');

      await Klaviyo.track('Loyalty Email Sent', {
        email,
        subject: content.subject,
        templateId: content.templateId,
        personalizations: content.personalizations,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[LoyaltyProgramWorkflow] Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Track loyalty events
   */
  private async trackLoyaltyEvent(eventName: string, properties: Record<string, any>): Promise<void> {
    try {
      const { Klaviyo } = await import('../../Klaviyo');
      await Klaviyo.track(eventName, properties);
    } catch (error) {
      console.error('[LoyaltyProgramWorkflow] Failed to track event:', error);
    }
  }

  /**
   * Get loyalty program analytics
   */
  public getLoyaltyAnalytics(): {
    totalMembers: number;
    activeMembers: number;
    membersByTier: Record<LoyaltyTier, number>;
    totalPointsAwarded: number;
    totalPointsRedeemed: number;
    averagePointsBalance: number;
    tierUpgradesToday: number;
    redemptionRate: number;
    memberRetentionRate: number;
    lifetimeValue: {
      byTier: Record<LoyaltyTier, number>;
      overall: number;
    };
  } {
    const members = Array.from(this.loyaltyMembers.values());
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.isActive).length;

    // Members by tier
    const membersByTier: Record<LoyaltyTier, number> = {
      [LoyaltyTier.BRONZE]: 0,
      [LoyaltyTier.SILVER]: 0,
      [LoyaltyTier.GOLD]: 0,
      [LoyaltyTier.PLATINUM]: 0,
      [LoyaltyTier.DIAMOND]: 0,
    };

    let totalPointsAwarded = 0;
    let totalPointsRedeemed = 0;
    let totalPointsBalance = 0;

    const lifetimeValueByTier: Record<LoyaltyTier, number[]> = {
      [LoyaltyTier.BRONZE]: [],
      [LoyaltyTier.SILVER]: [],
      [LoyaltyTier.GOLD]: [],
      [LoyaltyTier.PLATINUM]: [],
      [LoyaltyTier.DIAMOND]: [],
    };

    members.forEach((member) => {
      membersByTier[member.currentTier]++;
      totalPointsAwarded += member.totalPointsEarned;
      totalPointsRedeemed += member.totalPointsRedeemed;
      totalPointsBalance += member.currentPointsBalance;
      lifetimeValueByTier[member.currentTier].push(member.lifetimeSpend);
    });

    const averagePointsBalance = totalMembers > 0 ? totalPointsBalance / totalMembers : 0;
    const redemptionRate = totalPointsAwarded > 0 ? (totalPointsRedeemed / totalPointsAwarded) * 100 : 0;

    // Calculate tier upgrades today (mock data)
    const tierUpgradesToday = 5; // Would be calculated from actual data

    // Calculate retention rate (mock data)
    const memberRetentionRate = 85; // Would be calculated from actual data

    // Calculate lifetime value by tier
    const lifetimeValue = {
      byTier: {} as Record<LoyaltyTier, number>,
      overall: 0,
    };

    Object.entries(lifetimeValueByTier).forEach(([tier, values]) => {
      lifetimeValue.byTier[tier as LoyaltyTier] = values.length > 0
        ? values.reduce((a, b) => a + b, 0) / values.length
        : 0;
    });

    lifetimeValue.overall = members.length > 0
      ? members.reduce((sum, member) => sum + member.lifetimeSpend, 0) / members.length
      : 0;

    return {
      totalMembers,
      activeMembers,
      membersByTier,
      totalPointsAwarded,
      totalPointsRedeemed,
      averagePointsBalance,
      tierUpgradesToday,
      redemptionRate,
      memberRetentionRate,
      lifetimeValue,
    };
  }
}

// Singleton instance
export const loyaltyProgramWorkflow = LoyaltyProgramWorkflow.getInstance();

// Convenience functions
export const joinLoyaltyProgram = (memberData: { email: string; firstName?: string; birthday?: Date; initialPurchaseAmount?: number }) =>
  loyaltyProgramWorkflow.joinLoyaltyProgram(memberData);

export const awardLoyaltyPoints = (memberId: string, action: PointsEarnedAction, value?: number) =>
  loyaltyProgramWorkflow.awardPoints(memberId, action, value);

export const redeemLoyaltyPoints = (memberId: string, redemptionType: RedemptionType, pointsCost: number, metadata?: Record<string, any>) =>
  loyaltyProgramWorkflow.redeemPoints(memberId, redemptionType, pointsCost, metadata);
