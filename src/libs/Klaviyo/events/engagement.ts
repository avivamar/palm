/**
 * 参与度事件追踪
 * 追踪用户与品牌、内容和社区的互动参与度
 */

export enum EngagementEvent {
  // Content Engagement
  BLOG_POST_VIEW = 'Blog Post View',
  BLOG_POST_READ = 'Blog Post Read',
  VIDEO_PLAY = 'Video Play',
  VIDEO_COMPLETE = 'Video Complete',
  TUTORIAL_START = 'Tutorial Start',
  TUTORIAL_COMPLETE = 'Tutorial Complete',

  // Email Engagement
  EMAIL_OPEN = 'Email Open',
  EMAIL_CLICK = 'Email Click',
  EMAIL_FORWARD = 'Email Forward',
  EMAIL_UNSUBSCRIBE = 'Email Unsubscribe',
  EMAIL_RESUBSCRIBE = 'Email Resubscribe',

  // Social Engagement
  SOCIAL_FOLLOW = 'Social Follow',
  SOCIAL_UNFOLLOW = 'Social Unfollow',
  SOCIAL_LIKE = 'Social Like',
  SOCIAL_SHARE = 'Social Share',
  SOCIAL_COMMENT = 'Social Comment',

  // Community Engagement
  FORUM_POST = 'Forum Post',
  FORUM_REPLY = 'Forum Reply',
  FORUM_LIKE = 'Forum Like',
  REVIEW_SUBMIT = 'Review Submit',
  REVIEW_HELPFUL = 'Review Helpful',
  QA_QUESTION = 'QA Question',
  QA_ANSWER = 'QA Answer',

  // Support Engagement
  SUPPORT_TICKET = 'Support Ticket',
  SUPPORT_CHAT = 'Support Chat',
  FAQ_VIEW = 'FAQ View',
  KNOWLEDGE_BASE_SEARCH = 'Knowledge Base Search',
  HELP_ARTICLE_VIEW = 'Help Article View',

  // Newsletter & Communications
  NEWSLETTER_SIGNUP = 'Newsletter Signup',
  NEWSLETTER_PREFERENCES = 'Newsletter Preferences',
  SMS_OPTIN = 'SMS Opt-in',
  SMS_OPTOUT = 'SMS Opt-out',
  PUSH_NOTIFICATION_ALLOW = 'Push Notification Allow',
  PUSH_NOTIFICATION_DENY = 'Push Notification Deny',

  // Survey & Feedback
  SURVEY_START = 'Survey Start',
  SURVEY_COMPLETE = 'Survey Complete',
  FEEDBACK_SUBMIT = 'Feedback Submit',
  NPS_RESPONSE = 'NPS Response',
  TESTIMONIAL_SUBMIT = 'Testimonial Submit',

  // Referral & Loyalty
  REFERRAL_SEND = 'Referral Send',
  REFERRAL_ACCEPT = 'Referral Accept',
  LOYALTY_POINTS_EARN = 'Loyalty Points Earn',
  LOYALTY_POINTS_REDEEM = 'Loyalty Points Redeem',
  LOYALTY_TIER_UPGRADE = 'Loyalty Tier Upgrade',

  // Account Management
  PROFILE_UPDATE = 'Profile Update',
  PASSWORD_CHANGE = 'Password Change',
  PRIVACY_SETTINGS_UPDATE = 'Privacy Settings Update',
  ACCOUNT_DELETION_REQUEST = 'Account Deletion Request',
}

export enum EngagementChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WEBSITE = 'website',
  MOBILE_APP = 'mobile_app',
  SOCIAL_MEDIA = 'social_media',
  SUPPORT = 'support',
  COMMUNITY = 'community',
}

export enum EngagementLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

type EngagementEventProps = {
  email?: string;
  userId?: string;
  sessionId: string;
  event: EngagementEvent;
  channel: EngagementChannel;

  // Content specific
  contentId?: string;
  contentType?: string;
  contentTitle?: string;
  contentCategory?: string;
  contentDuration?: number; // in seconds
  engagementDuration?: number; // time spent engaging

  // Social specific
  platform?: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok';
  postId?: string;
  shareType?: 'link' | 'image' | 'video';

  // Email specific
  campaignId?: string;
  emailSubject?: string;
  linkUrl?: string;

  // Survey/Feedback specific
  rating?: number;
  score?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';

  // Additional context
  properties?: Record<string, any>;
  timestamp?: Date;
};

type EngagementProfile = {
  email: string;
  userId?: string;

  // Overall engagement metrics
  totalEngagements: number;
  engagementLevel: EngagementLevel;
  engagementScore: number; // 0-100
  lastEngagementDate?: Date;

  // Channel preferences
  preferredChannels: EngagementChannel[];
  channelEngagement: Record<EngagementChannel, {
    count: number;
    lastEngagement?: Date;
    engagementRate: number;
  }>;

  // Content preferences
  favoriteContentTypes: string[];
  averageContentEngagementTime: number;

  // Communication preferences
  emailOptIn: boolean;
  smsOptIn: boolean;
  pushOptIn: boolean;
  unsubscribedFromEmails: boolean;

  // Behavioral insights
  peakEngagementHours: number[]; // Hours of day (0-23)
  peakEngagementDays: number[]; // Days of week (0-6)
  engagementTrend: 'increasing' | 'stable' | 'decreasing';

  // Loyalty metrics
  loyaltyPoints?: number;
  loyaltyTier?: string;
  referralsSent: number;
  reviewsSubmitted: number;
};

/**
 * Engagement tracking system
 */
export class EngagementTracker {
  private static instance: EngagementTracker;
  private engagementEvents: Map<string, EngagementEventProps[]> = new Map();
  private engagementProfiles: Map<string, EngagementProfile> = new Map();
  private engagementSessions: Map<string, {
    startTime: Date;
    channel: EngagementChannel;
    totalEngagements: number;
    contentViewed: string[];
  }> = new Map();

  private constructor() {}

  public static getInstance(): EngagementTracker {
    if (!EngagementTracker.instance) {
      EngagementTracker.instance = new EngagementTracker();
    }
    return EngagementTracker.instance;
  }

  /**
   * Track engagement event
   */
  public async trackEngagement(eventProps: EngagementEventProps): Promise<void> {
    const {
      email,
      userId,
      sessionId,
      event,
      channel,
      contentId,
      contentType,
      engagementDuration,
      platform,
      rating,
      properties = {},
      timestamp = new Date(),
    } = eventProps;

    // Store event data
    const events = this.engagementEvents.get(sessionId) || [];
    events.push(eventProps);
    this.engagementEvents.set(sessionId, events);

    // Update engagement session
    this.updateEngagementSession(sessionId, channel, contentId, timestamp);

    // Update user engagement profile
    if (email) {
      await this.updateEngagementProfile(email, eventProps);
    }

    // Prepare enhanced properties for Klaviyo
    const engagementProfile = email ? this.engagementProfiles.get(email) : null;
    const enhancedProperties = {
      email,
      userId,
      sessionId,
      channel,
      contentId,
      contentType,
      platform,
      rating,
      timestamp: timestamp.toISOString(),

      // Engagement context
      sessionEngagements: events.length,
      engagementDuration,

      // User profile data
      userEngagementLevel: engagementProfile?.engagementLevel,
      userEngagementScore: engagementProfile?.engagementScore,
      totalUserEngagements: engagementProfile?.totalEngagements,
      preferredChannels: engagementProfile?.preferredChannels,

      // Behavioral insights
      isFirstEngagement: !engagementProfile,
      timeSinceLastEngagement: engagementProfile?.lastEngagementDate
        ? Date.now() - engagementProfile.lastEngagementDate.getTime()
        : null,

      ...properties,
    };

    // Send to Klaviyo
    await this.sendToKlaviyo(event, enhancedProperties);

    // Send to analytics
    await this.sendToAnalytics(eventProps, enhancedProperties);

    // Trigger engagement-based workflows
    await this.triggerEngagementWorkflows(event, enhancedProperties);
  }

  /**
   * Update engagement session
   */
  private updateEngagementSession(
    sessionId: string,
    channel: EngagementChannel,
    contentId?: string,
    timestamp?: Date,
  ): void {
    const session = this.engagementSessions.get(sessionId) || {
      startTime: timestamp || new Date(),
      channel,
      totalEngagements: 0,
      contentViewed: [],
    };

    session.totalEngagements++;
    if (contentId && !session.contentViewed.includes(contentId)) {
      session.contentViewed.push(contentId);
    }

    this.engagementSessions.set(sessionId, session);
  }

  /**
   * Update user engagement profile
   */
  private async updateEngagementProfile(email: string, eventProps: EngagementEventProps): Promise<void> {
    const existing = this.engagementProfiles.get(email) || {
      email,
      totalEngagements: 0,
      engagementLevel: EngagementLevel.LOW,
      engagementScore: 0,
      preferredChannels: [],
      channelEngagement: {
        [EngagementChannel.EMAIL]: { count: 0, engagementRate: 0 },
        [EngagementChannel.SMS]: { count: 0, engagementRate: 0 },
        [EngagementChannel.PUSH]: { count: 0, engagementRate: 0 },
        [EngagementChannel.WEBSITE]: { count: 0, engagementRate: 0 },
        [EngagementChannel.MOBILE_APP]: { count: 0, engagementRate: 0 },
        [EngagementChannel.SOCIAL_MEDIA]: { count: 0, engagementRate: 0 },
        [EngagementChannel.SUPPORT]: { count: 0, engagementRate: 0 },
        [EngagementChannel.COMMUNITY]: { count: 0, engagementRate: 0 },
      },
      favoriteContentTypes: [],
      averageContentEngagementTime: 0,
      emailOptIn: true,
      smsOptIn: false,
      pushOptIn: false,
      unsubscribedFromEmails: false,
      peakEngagementHours: [],
      peakEngagementDays: [],
      engagementTrend: 'stable' as const,
      referralsSent: 0,
      reviewsSubmitted: 0,
    };

    // Update basic metrics
    existing.totalEngagements++;
    existing.lastEngagementDate = eventProps.timestamp || new Date();

    // Update channel engagement
    const channelData = existing.channelEngagement[eventProps.channel];
    channelData.count++;
    channelData.lastEngagement = existing.lastEngagementDate;

    // Update communication preferences based on events
    if (eventProps.event === EngagementEvent.EMAIL_UNSUBSCRIBE) {
      existing.emailOptIn = false;
      existing.unsubscribedFromEmails = true;
    } else if (eventProps.event === EngagementEvent.EMAIL_RESUBSCRIBE) {
      existing.emailOptIn = true;
      existing.unsubscribedFromEmails = false;
    } else if (eventProps.event === EngagementEvent.SMS_OPTIN) {
      existing.smsOptIn = true;
    } else if (eventProps.event === EngagementEvent.SMS_OPTOUT) {
      existing.smsOptIn = false;
    } else if (eventProps.event === EngagementEvent.PUSH_NOTIFICATION_ALLOW) {
      existing.pushOptIn = true;
    } else if (eventProps.event === EngagementEvent.PUSH_NOTIFICATION_DENY) {
      existing.pushOptIn = false;
    }

    // Update loyalty metrics
    if (eventProps.event === EngagementEvent.REFERRAL_SEND) {
      existing.referralsSent++;
    } else if (eventProps.event === EngagementEvent.REVIEW_SUBMIT) {
      existing.reviewsSubmitted++;
    }

    // Track peak engagement times
    const hour = (eventProps.timestamp || new Date()).getHours();
    const day = (eventProps.timestamp || new Date()).getDay();

    if (!existing.peakEngagementHours.includes(hour)) {
      existing.peakEngagementHours.push(hour);
    }
    if (!existing.peakEngagementDays.includes(day)) {
      existing.peakEngagementDays.push(day);
    }

    // Calculate engagement score (0-100)
    existing.engagementScore = this.calculateEngagementScore(existing);

    // Determine engagement level
    existing.engagementLevel = this.determineEngagementLevel(existing.engagementScore);

    // Update preferred channels
    existing.preferredChannels = this.getPreferredChannels(existing.channelEngagement);

    // Update favorite content types
    if (eventProps.contentType) {
      existing.favoriteContentTypes = this.updateFavoriteContentTypes(
        existing.favoriteContentTypes,
        eventProps.contentType,
      );
    }

    this.engagementProfiles.set(email, existing);

    // Send profile update to Klaviyo
    await this.sendEngagementProfileToKlaviyo(existing);
  }

  /**
   * Calculate engagement score
   */
  private calculateEngagementScore(profile: EngagementProfile): number {
    let score = 0;

    // Base engagement frequency (0-30 points)
    const engagementFrequency = Math.min(profile.totalEngagements / 10, 30);
    score += engagementFrequency;

    // Channel diversity (0-20 points)
    const activeChannels = Object.values(profile.channelEngagement)
      .filter(channel => channel.count > 0)
      .length;
    score += Math.min(activeChannels * 2.5, 20);

    // Recent activity (0-25 points)
    if (profile.lastEngagementDate) {
      const daysSinceLastEngagement = (Date.now() - profile.lastEngagementDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceLastEngagement <= 1) {
        score += 25;
      } else if (daysSinceLastEngagement <= 7) {
        score += 20;
      } else if (daysSinceLastEngagement <= 30) {
        score += 10;
      }
    }

    // Communication opt-ins (0-15 points)
    if (profile.emailOptIn) {
      score += 5;
    }
    if (profile.smsOptIn) {
      score += 5;
    }
    if (profile.pushOptIn) {
      score += 5;
    }

    // Community participation (0-10 points)
    score += Math.min(profile.reviewsSubmitted * 2, 5);
    score += Math.min(profile.referralsSent, 5);

    return Math.min(Math.round(score), 100);
  }

  /**
   * Determine engagement level
   */
  private determineEngagementLevel(score: number): EngagementLevel {
    if (score >= 80) {
      return EngagementLevel.VERY_HIGH;
    }
    if (score >= 60) {
      return EngagementLevel.HIGH;
    }
    if (score >= 40) {
      return EngagementLevel.MEDIUM;
    }
    return EngagementLevel.LOW;
  }

  /**
   * Get preferred channels
   */
  private getPreferredChannels(channelEngagement: EngagementProfile['channelEngagement']): EngagementChannel[] {
    return Object.entries(channelEngagement)
      .filter(([, data]) => data.count > 0)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 3)
      .map(([channel]) => channel as EngagementChannel);
  }

  /**
   * Update favorite content types
   */
  private updateFavoriteContentTypes(existing: string[], newType: string): string[] {
    const updated = [...existing];
    if (!updated.includes(newType)) {
      updated.push(newType);
    }
    return updated.slice(0, 5); // Keep top 5
  }

  /**
   * Get engagement analytics
   */
  public getEngagementAnalytics(timeRange?: { start: Date; end: Date }): {
    totalEngagements: number;
    uniqueUsers: number;
    averageEngagementScore: number;
    engagementByChannel: Record<EngagementChannel, number>;
    engagementByLevel: Record<EngagementLevel, number>;
    topEvents: Array<{ event: EngagementEvent; count: number }>;
    contentPerformance: Array<{ contentId: string; engagements: number; uniqueUsers: number }>;
  } {
    let totalEngagements = 0;
    const uniqueUsers = new Set<string>();
    const scores: number[] = [];
    const channelCounts: Record<EngagementChannel, number> = {
      [EngagementChannel.EMAIL]: 0,
      [EngagementChannel.SMS]: 0,
      [EngagementChannel.PUSH]: 0,
      [EngagementChannel.WEBSITE]: 0,
      [EngagementChannel.MOBILE_APP]: 0,
      [EngagementChannel.SOCIAL_MEDIA]: 0,
      [EngagementChannel.SUPPORT]: 0,
      [EngagementChannel.COMMUNITY]: 0,
    };
    const levelCounts: Record<EngagementLevel, number> = {
      [EngagementLevel.LOW]: 0,
      [EngagementLevel.MEDIUM]: 0,
      [EngagementLevel.HIGH]: 0,
      [EngagementLevel.VERY_HIGH]: 0,
    };
    const eventCounts: Record<string, number> = {};
    const contentCounts: Record<string, { engagements: number; users: Set<string> }> = {};

    // Analyze engagement events
    for (const events of this.engagementEvents.values()) {
      const filteredEvents = timeRange
        ? events.filter((e) => {
            const timestamp = e.timestamp || new Date();
            return timestamp >= timeRange.start && timestamp <= timeRange.end;
          })
        : events;

      filteredEvents.forEach((event) => {
        totalEngagements++;

        if (event.email) {
          uniqueUsers.add(event.email);
        }

        channelCounts[event.channel]++;

        eventCounts[event.event] = (eventCounts[event.event] || 0) + 1;

        if (event.contentId) {
          if (!contentCounts[event.contentId]) {
            contentCounts[event.contentId] = { engagements: 0, users: new Set() };
          }
          contentCounts[event.contentId]!.engagements++;
          if (event.email) {
            contentCounts[event.contentId]!.users.add(event.email);
          }
        }
      });
    }

    // Analyze user profiles
    for (const profile of this.engagementProfiles.values()) {
      scores.push(profile.engagementScore);
      levelCounts[profile.engagementLevel]++;
    }

    const averageEngagementScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    const topEvents = Object.entries(eventCounts)
      .map(([event, count]) => ({ event: event as EngagementEvent, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const contentPerformance = Object.entries(contentCounts)
      .map(([contentId, data]) => ({
        contentId,
        engagements: data.engagements,
        uniqueUsers: data.users.size,
      }))
      .sort((a, b) => b.engagements - a.engagements)
      .slice(0, 10);

    return {
      totalEngagements,
      uniqueUsers: uniqueUsers.size,
      averageEngagementScore,
      engagementByChannel: channelCounts,
      engagementByLevel: levelCounts,
      topEvents,
      contentPerformance,
    };
  }

  /**
   * Send engagement profile to Klaviyo
   */
  private async sendEngagementProfileToKlaviyo(profile: EngagementProfile): Promise<void> {
    try {
      const { Klaviyo } = await import('../../Klaviyo');

      await Klaviyo.track('Engagement Profile Updated', {
        email: profile.email,
        engagementLevel: profile.engagementLevel,
        engagementScore: profile.engagementScore,
        totalEngagements: profile.totalEngagements,
        preferredChannels: profile.preferredChannels,
        emailOptIn: profile.emailOptIn,
        smsOptIn: profile.smsOptIn,
        pushOptIn: profile.pushOptIn,
        referralsSent: profile.referralsSent,
        reviewsSubmitted: profile.reviewsSubmitted,
        lastEngagementDate: profile.lastEngagementDate?.toISOString(),
      });
    } catch (error) {
      console.error('[EngagementTracker] Failed to send engagement profile to Klaviyo:', error);
    }
  }

  /**
   * Trigger engagement workflows
   */
  private async triggerEngagementWorkflows(
    event: EngagementEvent,
    properties: Record<string, any>,
  ): Promise<void> {
    try {
      const workflowTriggers: Partial<Record<EngagementEvent, string>> = {
        [EngagementEvent.EMAIL_UNSUBSCRIBE]: 'Email Unsubscribe Feedback',
        [EngagementEvent.NEWSLETTER_SIGNUP]: 'Welcome Series',
        [EngagementEvent.REVIEW_SUBMIT]: 'Review Thank You',
        [EngagementEvent.REFERRAL_SEND]: 'Referral Confirmation',
        [EngagementEvent.SUPPORT_TICKET]: 'Support Follow Up',
        [EngagementEvent.NPS_RESPONSE]: 'NPS Follow Up',
      };

      const workflowName = workflowTriggers[event];
      if (workflowName) {
        await this.sendToKlaviyo(`Trigger: ${workflowName}`, properties);
      }
    } catch (error) {
      console.error('[EngagementTracker] Failed to trigger engagement workflows:', error);
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
      console.error('[EngagementTracker] Failed to send event to Klaviyo:', error);
    }
  }

  /**
   * Send event to analytics
   */
  private async sendToAnalytics(
    event: EngagementEventProps,
    enhancedProperties: Record<string, any>,
  ): Promise<void> {
    try {
      // Send to Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', event.event, {
          event_category: 'engagement',
          event_label: event.channel,
          value: event.rating || event.engagementDuration,
          custom_session_id: event.sessionId,
          custom_user_id: event.userId,
          custom_content_id: event.contentId,
          ...enhancedProperties,
        });
      }
    } catch (error) {
      console.error('[EngagementTracker] Failed to send event to analytics:', error);
    }
  }
}

// Singleton instance
export const engagementTracker = EngagementTracker.getInstance();

// Convenience functions for common engagement events
export const trackNewsletterSignup = (sessionId: string, email: string, properties?: Record<string, any>) =>
  engagementTracker.trackEngagement({
    email,
    sessionId,
    event: EngagementEvent.NEWSLETTER_SIGNUP,
    channel: EngagementChannel.EMAIL,
    properties,
  });

export const trackSocialShare = (sessionId: string, platform: string, contentId?: string, email?: string, properties?: Record<string, any>) =>
  engagementTracker.trackEngagement({
    email,
    sessionId,
    event: EngagementEvent.SOCIAL_SHARE,
    channel: EngagementChannel.SOCIAL_MEDIA,
    platform: platform as any,
    contentId,
    properties,
  });

export const trackReviewSubmit = (sessionId: string, email: string, rating: number, properties?: Record<string, any>) =>
  engagementTracker.trackEngagement({
    email,
    sessionId,
    event: EngagementEvent.REVIEW_SUBMIT,
    channel: EngagementChannel.COMMUNITY,
    rating,
    properties,
  });

export const trackVideoWatch = (sessionId: string, contentId: string, duration: number, email?: string, properties?: Record<string, any>) =>
  engagementTracker.trackEngagement({
    email,
    sessionId,
    event: EngagementEvent.VIDEO_PLAY,
    channel: EngagementChannel.WEBSITE,
    contentId,
    contentType: 'video',
    engagementDuration: duration,
    properties,
  });
