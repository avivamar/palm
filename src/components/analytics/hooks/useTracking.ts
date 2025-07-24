'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { useAnalytics } from './useAnalytics';

export function useTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { trackPageView, trackEvent } = useAnalytics();

  // 自动页面浏览追踪
  useEffect(() => {
    const query = searchParams?.toString();
    const url = pathname + (query ? `?${query}` : '');
    trackPageView(url);
  }, [pathname, searchParams, trackPageView]);

  // 滚动深度追踪
  const trackScrollDepth = useCallback(() => {
    let maxScroll = 0;
    const thresholds = [25, 50, 75, 90, 100];
    const tracked = new Set<number>();

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / docHeight) * 100);

      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;

        thresholds.forEach((threshold) => {
          if (scrollPercent >= threshold && !tracked.has(threshold)) {
            tracked.add(threshold);
            trackEvent({
              name: 'scroll_depth',
              parameters: {
                scroll_depth: threshold,
                page_location: window.location.href,
              },
            });
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackEvent]);

  // 页面停留时间追踪
  const trackTimeOnPage = useCallback(() => {
    const startTime = Date.now();
    const intervals = [30, 60, 120, 300]; // 30s, 1m, 2m, 5m
    const tracked = new Set<number>();

    const checkTimeSpent = () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      intervals.forEach((interval) => {
        if (timeSpent >= interval && !tracked.has(interval)) {
          tracked.add(interval);
          trackEvent({
            name: 'time_on_page',
            parameters: {
              time_spent: interval,
              page_location: window.location.href,
            },
          });
        }
      });
    };

    const timer = setInterval(checkTimeSpent, 10000); // 每10秒检查一次

    // 页面卸载时记录总时间
    const handleBeforeUnload = () => {
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      if (totalTime > 5) { // 只记录超过5秒的访问
        trackEvent({
          name: 'page_exit',
          parameters: {
            total_time: totalTime,
            page_location: window.location.href,
          },
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [trackEvent]);

  // 点击追踪
  const trackClicks = useCallback(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // 追踪链接点击
      if (target.tagName === 'A') {
        const href = target.getAttribute('href');
        const text = target.textContent?.trim();

        trackEvent({
          name: 'link_click',
          parameters: {
            link_url: href,
            link_text: text,
            page_location: window.location.href,
          },
        });
      }

      // 追踪按钮点击
      if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
        const buttonText = target.textContent?.trim();
        const buttonId = target.id;
        const buttonClass = target.className;

        trackEvent({
          name: 'button_click',
          parameters: {
            button_text: buttonText,
            button_id: buttonId,
            button_class: buttonClass,
            page_location: window.location.href,
          },
        });
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [trackEvent]);

  // 表单交互追踪
  const trackFormInteractions = useCallback(() => {
    const handleFormSubmit = (event: Event) => {
      const form = event.target as HTMLFormElement;
      const formId = form.id;
      const formAction = form.action;

      trackEvent({
        name: 'form_submit',
        parameters: {
          form_id: formId,
          form_action: formAction,
          page_location: window.location.href,
        },
      });
    };

    const handleFormFocus = (event: Event) => {
      const input = event.target as HTMLInputElement;
      const formId = input.form?.id;
      const inputName = input.name;

      trackEvent({
        name: 'form_start',
        parameters: {
          form_id: formId,
          input_name: inputName,
          page_location: window.location.href,
        },
      });
    };

    document.addEventListener('submit', handleFormSubmit);
    document.addEventListener('focusin', handleFormFocus, { once: true });

    return () => {
      document.removeEventListener('submit', handleFormSubmit);
      document.removeEventListener('focusin', handleFormFocus);
    };
  }, [trackEvent]);

  // 启用所有追踪
  const enableAllTracking = useCallback(() => {
    const cleanupFunctions = [
      trackScrollDepth(),
      trackTimeOnPage(),
      trackClicks(),
      trackFormInteractions(),
    ];

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [trackScrollDepth, trackTimeOnPage, trackClicks, trackFormInteractions]);

  return {
    trackScrollDepth,
    trackTimeOnPage,
    trackClicks,
    trackFormInteractions,
    enableAllTracking,
  };
}
