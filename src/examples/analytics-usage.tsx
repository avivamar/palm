'use client';

import { useEffect } from 'react';
import { useAnalytics } from '@/components/analytics/hooks/useAnalytics';
import { useTracking } from '@/components/analytics/hooks/useTracking';

// 示例：如何在组件中使用分析工具
export function AnalyticsUsageExample() {
  const {
    trackEvent,
    trackPurchase,
    trackAddToCart,
    trackButtonClick,
    trackFormSubmit,
    trackVideoPlay,
  } = useAnalytics();

  const { enableAllTracking } = useTracking();

  // 启用自动追踪
  useEffect(() => {
    const cleanup = enableAllTracking();
    return cleanup;
  }, [enableAllTracking]);

  // 示例：追踪按钮点击
  const handleButtonClick = () => {
    trackButtonClick('cta-button', 'hero-section');
    // 你的业务逻辑
  };

  // 示例：追踪表单提交
  const handleFormSubmit = async (formData: FormData) => {
    try {
      // 提交表单逻辑
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        trackFormSubmit('contact-form', true);
      } else {
        trackFormSubmit('contact-form', false);
      }
    } catch (error) {
      trackFormSubmit('contact-form', false);
    }
  };

  // 示例：追踪购买事件
  const handlePurchase = () => {
    trackPurchase(
      'order-123',
      99.99,
      'USD',
      [
        {
          item_id: 'rolitt-001',
          item_name: 'Rolitt AI Companion',
          category: 'AI Products',
          quantity: 1,
          price: 99.99,
        },
      ],
    );
  };

  // 示例：追踪添加到购物车
  const handleAddToCart = () => {
    trackAddToCart('rolitt-001', 'Rolitt AI Companion', 99.99, 'USD');
  };

  // 示例：追踪视频播放
  const handleVideoPlay = () => {
    trackVideoPlay('Rolitt Product Demo', 120);
  };

  // 示例：追踪自定义事件
  const handleCustomEvent = () => {
    trackEvent({
      name: 'feature_interaction',
      parameters: {
        feature_name: 'voice_command',
        interaction_type: 'click',
        user_segment: 'premium',
      },
    });
  };

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold">分析工具使用示例</h2>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleButtonClick}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          追踪按钮点击
        </button>

        <button
          onClick={handleAddToCart}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          追踪添加到购物车
        </button>

        <button
          onClick={handlePurchase}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          追踪购买事件
        </button>

        <button
          onClick={handleVideoPlay}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          追踪视频播放
        </button>

        <button
          onClick={handleCustomEvent}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          追踪自定义事件
        </button>
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        handleFormSubmit(formData);
      }}
      >
        <input
          name="email"
          type="email"
          placeholder="邮箱地址"
          className="border p-2 rounded mr-2"
        />
        <button
          type="submit"
          className="bg-indigo-500 text-white px-4 py-2 rounded"
        >
          提交表单（会追踪）
        </button>
      </form>

      <div className="text-sm text-gray-600">
        <p>此页面启用了以下自动追踪功能：</p>
        <ul className="list-disc list-inside mt-2">
          <li>页面浏览追踪</li>
          <li>滚动深度追踪（25%, 50%, 75%, 90%, 100%）</li>
          <li>页面停留时间追踪（30s, 1m, 2m, 5m）</li>
          <li>链接和按钮点击追踪</li>
          <li>表单交互追踪</li>
        </ul>
      </div>
    </div>
  );
}
