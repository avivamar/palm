// Meta Pixel 使用示例 - 使用新的分析工具系统

import { useAnalytics } from '@/components/analytics/hooks/useAnalytics';

export function ProductPage() {
  const { trackEvent, trackAddToCart, trackPurchase } = useAnalytics();

  const handleAddToCart = (product: any) => {
    // 追踪添加到购物车事件
    trackAddToCart(product.id || 'unknown', product.name, product.price, 'USD');
  };

  const handlePurchase = (order: any) => {
    // 追踪购买事件
    trackPurchase(order.id || 'unknown', order.total, 'USD');
  };

  const handleContactForm = () => {
    // 追踪联系表单提交
    trackEvent({
      name: 'Contact',
    });
  };

  const handleCustomEvent = () => {
    // 追踪自定义事件
    trackEvent({
      name: 'CustomEvent',
      parameters: {
        custom_parameter: 'value',
        user_type: 'premium',
      },
    });
  };

  return (
    <div>
      <h1>产品页面</h1>
      <button onClick={handleAddToCart}>添加到购物车</button>
      <button onClick={handlePurchase}>立即购买</button>
      <button onClick={handleContactForm}>联系我们</button>
      <button onClick={handleCustomEvent}>自定义事件</button>
    </div>
  );
}

// 在联系表单中使用
export function ContactForm() {
  const { trackEvent } = useAnalytics();

  // 模拟表单提交函数
  const submitForm = async (_formData: any) => {
    // 这里应该是实际的表单提交逻辑
    // 例如: await fetch('/api/contact', { method: 'POST', body: formData })
    return Promise.resolve({ success: true });
  };

  const handleSubmit = async (formData: any) => {
    try {
      // 提交表单逻辑
      await submitForm(formData);

      // 追踪成功提交
      trackEvent({
        name: 'Lead',
        parameters: {
          content_name: 'Contact Form',
          content_category: 'Contact',
        },
      });
    } catch {
      // Form submission failed
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 表单内容 */}
    </form>
  );
}

// 在购物车页面中使用
export function Cart() {
  const { trackEvent } = useAnalytics();

  const handleCheckout = () => {
    trackEvent({
      name: 'InitiateCheckout',
      parameters: {
        content_ids: ['product1', 'product2'],
        content_type: 'product',
      },
      value: 99.99,
      currency: 'USD',
    });
  };

  return (
    <div>
      {/* 购物车内容 */}
      <button onClick={handleCheckout}>结账</button>
    </div>
  );
}
