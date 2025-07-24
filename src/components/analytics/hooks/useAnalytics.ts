'use client';

import { useCallback } from 'react';
import { trackClarityEvent } from '../services/ClarityService';
import { trackEvent as trackGAEvent } from '../services/GoogleAnalytics';
import { trackKlaviyoEvent } from '../services/KlaviyoService';
import { trackMetaConversion, trackMetaEvent } from '../services/MetaPixel';
import { trackTikTokConversion, trackTikTokEvent } from '../services/TikTokPixel';

export type AnalyticsEvent = {
  name: string;
  parameters?: Record<string, any>;
  value?: number;
  currency?: string;
};

export function useAnalytics() {
  // 统一事件追踪
  const trackEvent = useCallback((event: AnalyticsEvent) => {
    const { name, parameters, value, currency } = event;

    try {
      // Google Analytics
      trackGAEvent(name, parameters);

      // Microsoft Clarity
      trackClarityEvent(name);

      // Meta Pixel
      if (value !== undefined) {
        trackMetaConversion(name, value, currency);
      } else {
        trackMetaEvent(name, parameters);
      }

      // TikTok Pixel
      if (value !== undefined) {
        trackTikTokConversion(name, value, currency);
      } else {
        trackTikTokEvent(name, parameters);
      }

      // Klaviyo
      trackKlaviyoEvent(name, parameters);
    } catch (error) {
      // Analytics tracking error
    }
  }, []);

  // 页面浏览追踪
  const trackPageView = useCallback((url: string, title?: string) => {
    trackEvent({
      name: 'page_view',
      parameters: {
        page_location: url,
        page_title: title || document.title,
      },
    });
  }, [trackEvent]);

  // 转化事件追踪
  const trackConversion = useCallback((eventName: string, value: number, currency = 'USD', additionalParams?: Record<string, any>) => {
    trackEvent({
      name: eventName,
      parameters: additionalParams,
      value,
      currency,
    });
  }, [trackEvent]);

  // 电商事件追踪
  const trackPurchase = useCallback((transactionId: string, value: number, currency = 'USD', items?: any[]) => {
    trackEvent({
      name: 'purchase',
      parameters: {
        transaction_id: transactionId,
        items,
      },
      value,
      currency,
    });
  }, [trackEvent]);

  const trackAddToCart = useCallback((itemId: string, itemName: string, value: number, currency = 'USD') => {
    trackEvent({
      name: 'add_to_cart',
      parameters: {
        item_id: itemId,
        item_name: itemName,
      },
      value,
      currency,
    });
  }, [trackEvent]);

  const trackBeginCheckout = useCallback((value: number, currency = 'USD', items?: any[]) => {
    trackEvent({
      name: 'begin_checkout',
      parameters: {
        items,
      },
      value,
      currency,
    });
  }, [trackEvent]);

  // 用户互动事件
  const trackButtonClick = useCallback((buttonName: string, location?: string) => {
    trackEvent({
      name: 'button_click',
      parameters: {
        button_name: buttonName,
        location,
      },
    });
  }, [trackEvent]);

  const trackFormSubmit = useCallback((formName: string, success: boolean) => {
    trackEvent({
      name: 'form_submit',
      parameters: {
        form_name: formName,
        success,
      },
    });
  }, [trackEvent]);

  const trackVideoPlay = useCallback((videoTitle: string, duration?: number) => {
    trackEvent({
      name: 'video_play',
      parameters: {
        video_title: videoTitle,
        video_duration: duration,
      },
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackConversion,
    trackPurchase,
    trackAddToCart,
    trackBeginCheckout,
    trackButtonClick,
    trackFormSubmit,
    trackVideoPlay,
  };
}
