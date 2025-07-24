/**
 * 🎯 精准营销：渐进式用户参与追踪系统
 * 基于用户行为阶段进行差异化营销覆盖
 */

export type UserEngagementData = {
  sessionId?: string;
  userId?: string;
  email?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
  userAgent?: string;
  timeOnSite?: number;
  pageViews?: number;
  scrollDepth?: number;
  location?: string;
};

export type MarketingTouchpoint = {
  stage: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  marketingActions: string[];
  klaviyoEvent?: string;
  pixelEvent?: string;
  nextStageHint?: string;
};

/**
 * 营销触点配置：从低意向到高意向的渐进式覆盖
 */
const MARKETING_TOUCHPOINTS: Record<string, MarketingTouchpoint> = {
  // 🔍 初始探索阶段
  page_view: {
    stage: 'awareness',
    priority: 'low',
    marketingActions: ['pixel_track', 'anonymous_segment'],
    pixelEvent: 'PageView',
    nextStageHint: 'Encourage product exploration',
  },

  // 📱 产品兴趣阶段
  view_product: {
    stage: 'interest',
    priority: 'medium',
    marketingActions: ['pixel_track', 'retargeting_pool'],
    pixelEvent: 'ViewContent',
    klaviyoEvent: 'Viewed Product',
    nextStageHint: 'Show product benefits and social proof',
  },

  // 💰 价格关注阶段
  check_price: {
    stage: 'consideration',
    priority: 'medium',
    marketingActions: ['price_sensitive_segment', 'discount_eligibility'],
    klaviyoEvent: 'Viewed Pricing',
    nextStageHint: 'Highlight value proposition',
  },

  // 🎨 产品定制阶段
  select_color: {
    stage: 'customization',
    priority: 'high',
    marketingActions: ['personalization_segment', 'color_preference_track'],
    klaviyoEvent: 'Selected Color',
    nextStageHint: 'Create urgency for purchase',
  },

  // 📧 邮箱收集阶段（当前已实现）
  fill_form: {
    stage: 'high_intent',
    priority: 'critical',
    marketingActions: ['email_capture', 'high_intent_segment', 'immediate_followup'],
    klaviyoEvent: 'Started Preorder',
    nextStageHint: 'Immediate payment flow',
  },

  // 💳 支付意向阶段
  enter_payment: {
    stage: 'purchase_intent',
    priority: 'critical',
    marketingActions: ['payment_intent_segment', 'urgency_campaign'],
    klaviyoEvent: 'Initiated Checkout',
    nextStageHint: 'Remove payment friction',
  },

  // 🛑 支付放弃阶段
  abandon_payment: {
    stage: 'abandoned_cart',
    priority: 'critical',
    marketingActions: ['abandoned_cart_sequence', 'discount_offer', 'urgency_reminder'],
    klaviyoEvent: 'Abandoned Cart',
    nextStageHint: 'Multi-touch recovery campaign',
  },

  // ✅ 支付完成阶段
  complete_payment: {
    stage: 'customer',
    priority: 'critical',
    marketingActions: ['vip_segment', 'cross_sell', 'referral_program'],
    klaviyoEvent: 'Completed Purchase',
    nextStageHint: 'Customer retention and expansion',
  },
};

/**
 * 🎯 核心函数：追踪用户参与阶段
 */
export async function trackUserEngagement(
  step: keyof typeof MARKETING_TOUCHPOINTS,
  data: UserEngagementData,
  options?: {
    skipPixel?: boolean;
    skipKlaviyo?: boolean;
    customProperties?: Record<string, any>;
  },
): Promise<{ success: boolean; nextStage?: string; actions?: string[] }> {
  try {
    const touchpoint = MARKETING_TOUCHPOINTS[step];
    if (!touchpoint) {
      console.warn(`[MarketingTracker] Unknown touchpoint: ${step}`);
      return { success: false };
    }

    console.log(`[MarketingTracker] 🎯 Tracking ${step} for stage: ${touchpoint.stage}`);

    // 1. 📊 发送Klaviyo事件（如果有邮箱且配置了事件）
    if (!options?.skipKlaviyo && touchpoint.klaviyoEvent && data.email) {
      try {
        // 使用通用事件发送
        const { sendKlaviyoEventIdempotent } = await import('@/libs/klaviyo-utils');
        await sendKlaviyoEventIdempotent(
          touchpoint.klaviyoEvent,
          data.email,
          {
            engagement_stage: touchpoint.stage,
            priority: touchpoint.priority,
            session_id: data.sessionId,
            utm_source: data.utmSource,
            utm_medium: data.utmMedium,
            utm_campaign: data.utmCampaign,
            time_on_site: data.timeOnSite,
            page_views: data.pageViews,
            scroll_depth: data.scrollDepth,
            location: data.location,
            timestamp: new Date().toISOString(),
            ...options?.customProperties,
          },
          (data.userId || data.sessionId) as string,
        );

        console.log(`[MarketingTracker] ✅ Klaviyo event sent: ${touchpoint.klaviyoEvent}`);
      } catch (error) {
        console.error(`[MarketingTracker] ❌ Klaviyo event failed:`, error);
      }
    }

    // 2. 📱 发送像素事件（客户端处理）
    if (!options?.skipPixel && touchpoint.pixelEvent) {
      // 这里返回像素事件信息，客户端JavaScript会处理
      console.log(`[MarketingTracker] 📱 Pixel event queued: ${touchpoint.pixelEvent}`);
    }

    // 3. 🎯 执行营销行动
    for (const action of touchpoint.marketingActions) {
      await executeMarketingAction(action, data, touchpoint);
    }

    return {
      success: true,
      nextStage: touchpoint.nextStageHint,
      actions: touchpoint.marketingActions,
    };
  } catch (error) {
    console.error(`[MarketingTracker] ❌ Failed to track engagement:`, error);
    return { success: false };
  }
}

/**
 * 🔧 执行具体的营销行动
 */
async function executeMarketingAction(
  action: string,
  data: UserEngagementData,
  touchpoint: MarketingTouchpoint,
): Promise<void> {
  try {
    switch (action) {
      case 'pixel_track':
        // 像素追踪（客户端处理）
        console.log(`[MarketingAction] 📱 Pixel tracking for ${touchpoint.stage}`);
        break;

      case 'anonymous_segment':
        // 匿名用户分群
        console.log(`[MarketingAction] 👥 Anonymous segmentation`);
        break;

      case 'retargeting_pool':
        // 重定向广告池
        console.log(`[MarketingAction] 🎯 Added to retargeting pool`);
        break;

      case 'email_capture':
        // 邮箱捕获（已在现有系统中实现）
        if (data.email) {
          console.log(`[MarketingAction] 📧 Email captured: ${data.email.replace(/(.{2}).*(@.*)/, '$1***$2')}`);
        }
        break;

      case 'high_intent_segment':
        // 高意向用户分群
        if (data.email) {
          console.log(`[MarketingAction] ⚡ High intent segmentation`);
        }
        break;

      case 'abandoned_cart_sequence':
        // 放弃购物车序列（已在现有系统中实现）
        console.log(`[MarketingAction] 🛑 Abandoned cart sequence triggered`);
        break;

      case 'vip_segment':
        // VIP用户分群
        console.log(`[MarketingAction] 👑 VIP segmentation`);
        break;

      default:
        console.log(`[MarketingAction] ℹ️ Custom action: ${action}`);
    }
  } catch (error) {
    console.error(`[MarketingAction] ❌ Failed to execute ${action}:`, error);
  }
}

/**
 * 🎯 获取个性化重定向策略
 */
export async function getPersonalizedRetargeting(userBehavior: {
  timeOnSite?: number;
  pageViews?: number;
  scrollDepth?: number;
  previousEngagements?: string[];
  emailCaptured?: boolean;
  paymentAttempted?: boolean;
}): Promise<{
  campaign: string;
  priority: number;
  message: string;
  channels: string[];
}> {
  // 🔥 超高意向：已尝试支付
  if (userBehavior.paymentAttempted) {
    return {
      campaign: 'payment_recovery',
      priority: 100,
      message: 'Complete your order and secure your spot!',
      channels: ['email', 'sms', 'facebook', 'google'],
    };
  }

  // ⚡ 高意向：已捕获邮箱
  if (userBehavior.emailCaptured) {
    return {
      campaign: 'conversion_boost',
      priority: 80,
      message: 'Your personalized product is waiting!',
      channels: ['email', 'facebook', 'google'],
    };
  }

  // 🎯 中高意向：长时间浏览 + 深度互动
  if ((userBehavior.timeOnSite || 0) > 300 && (userBehavior.scrollDepth || 0) > 50) {
    return {
      campaign: 'discount_campaign',
      priority: 60,
      message: 'Special offer just for you!',
      channels: ['facebook', 'google', 'display'],
    };
  }

  // 📚 中等兴趣：多页面浏览
  if ((userBehavior.pageViews || 0) > 3) {
    return {
      campaign: 'education_campaign',
      priority: 40,
      message: 'Discover what makes our product special',
      channels: ['facebook', 'google'],
    };
  }

  // 🌟 普通访客：品牌认知
  return {
    campaign: 'awareness_campaign',
    priority: 20,
    message: 'Join thousands of satisfied customers',
    channels: ['facebook', 'display'],
  };
}

/**
 * 📊 获取用户参与评分
 */
export function calculateEngagementScore(userBehavior: {
  timeOnSite?: number;
  pageViews?: number;
  scrollDepth?: number;
  engagementEvents?: string[];
  emailCaptured?: boolean;
  colorSelected?: boolean;
  paymentAttempted?: boolean;
}): {
  score: number;
  level: 'cold' | 'warm' | 'hot' | 'burning';
  reasoning: string[];
} {
  let score = 0;
  const reasoning: string[] = [];

  // 基础浏览行为
  if ((userBehavior.timeOnSite || 0) > 60) {
    score += 10;
    reasoning.push('Spent time exploring');
  }

  if ((userBehavior.pageViews || 0) > 2) {
    score += 15;
    reasoning.push('Multiple page views');
  }

  if ((userBehavior.scrollDepth || 0) > 30) {
    score += 10;
    reasoning.push('Good content engagement');
  }

  // 意向行为
  if (userBehavior.colorSelected) {
    score += 25;
    reasoning.push('Product customization');
  }

  if (userBehavior.emailCaptured) {
    score += 40;
    reasoning.push('Provided contact information');
  }

  if (userBehavior.paymentAttempted) {
    score += 50;
    reasoning.push('Attempted purchase');
  }

  // 确定等级
  let level: 'cold' | 'warm' | 'hot' | 'burning';
  if (score >= 80) {
    level = 'burning';
  } else if (score >= 50) {
    level = 'hot';
  } else if (score >= 25) {
    level = 'warm';
  } else {
    level = 'cold';
  }

  return { score, level, reasoning };
}

export default {
  trackUserEngagement,
  getPersonalizedRetargeting,
  calculateEngagementScore,
  MARKETING_TOUCHPOINTS,
};
