'use client';

import { useEffect, useRef, useState } from 'react';
import { useAnalytics } from '@/components/analytics/hooks/useAnalytics';
import { calculateEngagementScore, getPersonalizedRetargeting, trackUserEngagement } from '@/libs/marketing/precision-marketing';

/**
 * 🎯 精准营销：客户端用户行为追踪器
 * 实时监控用户互动，触发营销事件
 */

type UserSession = {
  sessionId: string;
  startTime: number;
  pageViews: number;
  scrollDepth: number;
  timeOnSite: number;
  interactions: string[];
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

type MarketingTrackerProps = {
  /** 用户邮箱（如果已知） */
  email?: string;
  /** 用户ID（如果已登录） */
  userId?: string;
  /** 当前页面类型 */
  pageType?: 'home' | 'product' | 'preorder' | 'checkout' | 'success';
  /** 自定义属性 */
  customProperties?: Record<string, any>;
  /** 是否启用调试模式 */
  debug?: boolean;
};

export function MarketingTracker({
  email,
  userId,
  pageType = 'home',
  customProperties = {},
  debug = false,
}: MarketingTrackerProps) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [hasTrackedPageView, setHasTrackedPageView] = useState(false);
  const scrollDepthRef = useRef(0);
  const { trackEvent } = useAnalytics();

  // 生成或获取会话ID
  const getSessionId = (): string => {
    let sessionId = sessionStorage.getItem('rolitt_session_id');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      sessionStorage.setItem('rolitt_session_id', sessionId);
    }
    return sessionId;
  };

  // 获取UTM参数
  const getUtmParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utmSource: urlParams.get('utm_source') || undefined,
      utmMedium: urlParams.get('utm_medium') || undefined,
      utmCampaign: urlParams.get('utm_campaign') || undefined,
    };
  };

  // 初始化会话
  useEffect(() => {
    const utmParams = getUtmParams();
    const newSession: UserSession = {
      sessionId: getSessionId(),
      startTime: Date.now(),
      pageViews: 1,
      scrollDepth: 0,
      timeOnSite: 0,
      interactions: [],
      ...utmParams,
    };

    setSession(newSession);

    if (debug) {
      console.log('[MarketingTracker] Session initialized:', newSession);
    }
  }, [debug]);

  // 追踪页面浏览
  useEffect(() => {
    if (!session || hasTrackedPageView) {
      return;
    }

    const trackPageView = async () => {
      try {
        await trackUserEngagement('page_view', {
          sessionId: session.sessionId,
          userId,
          email,
          utmSource: session.utmSource,
          utmMedium: session.utmMedium,
          utmCampaign: session.utmCampaign,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          location: window.location.pathname,
          ...customProperties,
        });

        // 发送像素事件
        trackEvent({
          name: 'PageView',
          parameters: {
            page_type: pageType,
            session_id: session.sessionId,
            ...customProperties,
          },
        });

        setHasTrackedPageView(true);

        if (debug) {
          console.log('[MarketingTracker] Page view tracked');
        }
      } catch (error) {
        console.error('[MarketingTracker] Failed to track page view:', error);
      }
    };

    trackPageView();
  }, [session, hasTrackedPageView, userId, email, pageType, customProperties, debug, trackEvent]);

  // 追踪滚动深度
  useEffect(() => {
    if (!session) {
      return;
    }

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.pageYOffset;
      const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);

      if (scrollPercentage > scrollDepthRef.current) {
        scrollDepthRef.current = scrollPercentage;

        setSession(prev => prev
          ? {
              ...prev,
              scrollDepth: scrollPercentage,
            }
          : null);

        // 在关键滚动节点触发事件
        if (scrollPercentage >= 50 && !session.interactions.includes('scroll_50')) {
          session.interactions.push('scroll_50');

          if (debug) {
            console.log('[MarketingTracker] Deep scroll detected: 50%');
          }
        }

        if (scrollPercentage >= 80 && !session.interactions.includes('scroll_80')) {
          session.interactions.push('scroll_80');

          if (debug) {
            console.log('[MarketingTracker] Deep scroll detected: 80%');
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [session, debug]);

  // 追踪页面停留时间
  useEffect(() => {
    if (!session) {
      return;
    }

    const updateTimeOnSite = () => {
      setSession(prev => prev
        ? {
            ...prev,
            timeOnSite: Date.now() - prev.startTime,
          }
        : null);
    };

    const interval = setInterval(updateTimeOnSite, 5000); // 每5秒更新一次
    return () => clearInterval(interval);
  }, [session]);

  // 在页面卸载时发送最终数据
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (!session) {
        return;
      }

      const finalTimeOnSite = Date.now() - session.startTime;

      // 计算用户参与评分
      const engagementScore = calculateEngagementScore({
        timeOnSite: finalTimeOnSite,
        pageViews: session.pageViews,
        scrollDepth: session.scrollDepth,
        engagementEvents: session.interactions,
        emailCaptured: !!email,
        colorSelected: session.interactions.includes('select_color'),
        paymentAttempted: session.interactions.includes('enter_payment'),
      });

      // 获取个性化重定向策略
      const retargetingStrategy = await getPersonalizedRetargeting({
        timeOnSite: finalTimeOnSite,
        pageViews: session.pageViews,
        scrollDepth: session.scrollDepth,
        previousEngagements: session.interactions,
        emailCaptured: !!email,
        paymentAttempted: session.interactions.includes('enter_payment'),
      });

      if (debug) {
        console.log('[MarketingTracker] Session ending:', {
          session,
          engagementScore,
          retargetingStrategy,
        });
      }

      // 使用 sendBeacon 确保数据发送
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/marketing/session-end', JSON.stringify({
          sessionId: session.sessionId,
          timeOnSite: finalTimeOnSite,
          engagementScore,
          retargetingStrategy,
          email,
          userId,
        }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [session, email, userId, debug]);

  // 提供追踪特定互动的方法
  const trackInteraction = async (
    interaction: 'view_product' | 'check_price' | 'select_color' | 'fill_form' | 'enter_payment' | 'abandon_payment',
    additionalData?: Record<string, any>,
  ) => {
    if (!session) {
      return;
    }

    try {
      // 添加到会话互动记录
      if (!session.interactions.includes(interaction)) {
        session.interactions.push(interaction);
      }

      // 发送营销追踪事件
      await trackUserEngagement(interaction, {
        sessionId: session.sessionId,
        userId,
        email,
        utmSource: session.utmSource,
        utmMedium: session.utmMedium,
        utmCampaign: session.utmCampaign,
        timeOnSite: Date.now() - session.startTime,
        pageViews: session.pageViews,
        scrollDepth: session.scrollDepth,
        location: window.location.pathname,
        ...customProperties,
        ...additionalData,
      });

      if (debug) {
        console.log(`[MarketingTracker] Interaction tracked: ${interaction}`, additionalData);
      }
    } catch (error) {
      console.error(`[MarketingTracker] Failed to track interaction ${interaction}:`, error);
    }
  };

  // 暴露追踪方法给父组件使用
  useEffect(() => {
    // 将追踪方法挂载到全局对象，供其他组件调用
    (window as any).rolittTracker = {
      trackInteraction,
      getSession: () => session,
      getEngagementScore: () => session
        ? calculateEngagementScore({
            timeOnSite: Date.now() - session.startTime,
            pageViews: session.pageViews,
            scrollDepth: session.scrollDepth,
            engagementEvents: session.interactions,
            emailCaptured: !!email,
            colorSelected: session.interactions.includes('select_color'),
            paymentAttempted: session.interactions.includes('enter_payment'),
          })
        : null,
    };

    return () => {
      delete (window as any).rolittTracker;
    };
  }, [session, email, trackInteraction]);

  // 这个组件不渲染任何UI
  return null;
}

/**
 * 🎯 便捷的Hook：在任何组件中追踪营销事件
 */
export function useMarketingTracker() {
  const trackInteraction = (
    interaction: 'view_product' | 'check_price' | 'select_color' | 'fill_form' | 'enter_payment' | 'abandon_payment',
    additionalData?: Record<string, any>,
  ) => {
    const tracker = (window as any).rolittTracker;
    if (tracker) {
      tracker.trackInteraction(interaction, additionalData);
    } else {
      console.warn('[useMarketingTracker] Tracker not initialized');
    }
  };

  const getEngagementScore = () => {
    const tracker = (window as any).rolittTracker;
    return tracker ? tracker.getEngagementScore() : null;
  };

  const getSession = () => {
    const tracker = (window as any).rolittTracker;
    return tracker ? tracker.getSession() : null;
  };

  return {
    trackInteraction,
    getEngagementScore,
    getSession,
  };
}

export default MarketingTracker;
