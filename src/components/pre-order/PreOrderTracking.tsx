'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useAnalytics } from '@/components/analytics/hooks/useAnalytics';
import { useTracking } from '@/components/analytics/hooks/useTracking';

export function PreOrderTracking() {
  const searchParams = useSearchParams();
  const { trackEvent } = useAnalytics();
  const { enableAllTracking } = useTracking();

  useEffect(() => {
    // 启用所有追踪功能
    const cleanup = enableAllTracking();

    // 安全检查：确保 searchParams 存在
    if (!searchParams) {
      console.warn('[PreOrderTracking] searchParams is undefined, skipping UTM tracking');
      return cleanup;
    }

    // 检查UTM参数，特别是来自取消页面的跳转
    const utmSource = searchParams.get('utm_source');
    const utmMedium = searchParams.get('utm_medium');
    const utmCampaign = searchParams.get('utm_campaign');

    // 如果是从取消页面跳转过来的，记录特殊事件
    if (utmSource === 'cancel' && utmCampaign === 'retry') {
      trackEvent({
        name: 'pre_order_retry_from_cancel',
        parameters: {
          utm_source: utmSource,
          utm_medium: utmMedium || 'unknown',
          utm_campaign: utmCampaign,
          page_location: window.location.href,
          referrer: document.referrer,
          timestamp: new Date().toISOString(),
        },
      });

      // 记录用户重试行为
      trackEvent({
        name: 'user_retry_purchase',
        parameters: {
          retry_source: 'cancel_page',
          retry_method: utmMedium || 'unknown',
          page_location: window.location.href,
        },
      });
    }

    // 记录所有UTM参数（如果存在）
    if (utmSource || utmMedium || utmCampaign) {
      trackEvent({
        name: 'utm_tracking',
        parameters: {
          utm_source: utmSource || '',
          utm_medium: utmMedium || '',
          utm_campaign: utmCampaign || '',
          utm_term: searchParams?.get('utm_term') || '',
          utm_content: searchParams?.get('utm_content') || '',
          page_location: window.location.href,
        },
      });
    }

    // 检查是否有锚点跳转到产品选择区域
    if (window.location.hash === '#product-selection') {
      // 延迟滚动，确保页面完全加载
      setTimeout(() => {
        const productSection = document.getElementById('product-selection');
        if (productSection) {
          productSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });

          // 记录锚点跳转事件
          trackEvent({
            name: 'anchor_scroll',
            parameters: {
              target_section: 'product-selection',
              source: utmSource || 'direct',
              page_location: window.location.href,
            },
          });
        }
      }, 500);
    }

    return cleanup;
  }, [searchParams, trackEvent, enableAllTracking]);

  return null; // 这是一个纯追踪组件，不渲染任何UI
}
