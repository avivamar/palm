# 多支付供应商集成指南

本指南展示如何在 Next.js 应用中使用新的多供应商支付系统。

## 快速开始

### 1. 基础配置

```typescript
// app/api/payments/create-session/route.ts
import { getPaymentService } from '@rolitt/payments';

export async function POST(request: Request) {
  const { amount, currency, customerId } = await request.json();
  
  // 获取支付服务实例 (自动配置所有可用供应商)
  const paymentService = getPaymentService();
  
  // 创建支付会话 (智能路由会自动选择最佳供应商)
  const session = await paymentService.createPaymentSession({
    amount,
    currency,
    customerId,
    successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/success`,
    cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/cancel`,
  });
  
  return Response.json(session);
}
```

### 2. 智能路由示例

```typescript
// app/api/payments/smart-checkout/route.ts
import { getPaymentService } from '@rolitt/payments';

export async function POST(request: Request) {
  const paymentService = getPaymentService();
  const { amount, currency, region, customerPreference } = await request.json();
  
  // 智能路由 - 根据条件自动选择供应商
  const { provider, paymentIntent } = await paymentService.smartPaymentRouting({
    amount,
    currency,
    customerId: 'customer_123',
    description: 'Product purchase',
  }, {
    preferredProviders: customerPreference ? [customerPreference] : undefined,
    region, // 'US', 'EU', 'GLOBAL'
    paymentMethod: 'card', // 或 'paypal', 'google_pay' 等
  });
  
  console.log(`Using provider: ${provider}`);
  
  return Response.json({ 
    provider, 
    clientSecret: paymentIntent.clientSecret 
  });
}
```

### 3. 手动指定供应商

```typescript
// app/api/payments/specific-provider/route.ts
import { getPaymentService } from '@rolitt/payments';

export async function POST(request: Request) {
  const paymentService = getPaymentService();
  const { provider, amount, currency } = await request.json();
  
  // 验证供应商是否可用
  const availableProviders = paymentService.getAvailableProviders();
  if (!availableProviders.includes(provider)) {
    return Response.json(
      { error: `Provider ${provider} not available` }, 
      { status: 400 }
    );
  }
  
  // 使用指定供应商创建支付
  const paymentIntent = await paymentService.createPaymentIntent({
    amount,
    currency,
    customerId: 'customer_123',
    description: 'Product purchase',
  }, provider);
  
  return Response.json({ 
    provider,
    paymentIntent 
  });
}
```

## 前端集成

### React 组件示例

```tsx
// components/CheckoutForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

interface CheckoutFormProps {
  amount: number;
  currency: string;
}

export function CheckoutForm({ amount, currency }: CheckoutFormProps) {
  const [provider, setProvider] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const createPaymentSession = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/payments/smart-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount, 
          currency,
          region: 'US', // 可以根据用户IP或设置动态获取
        }),
      });
      
      const data = await response.json();
      setProvider(data.provider);
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Payment session creation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    createPaymentSession();
  }, [amount, currency]);

  if (loading) {
    return <div>正在准备支付...</div>;
  }

  // 根据供应商渲染不同的支付组件
  switch (provider) {
    case 'stripe':
      return <StripeCheckout clientSecret={clientSecret} />;
    case 'paddle':
      return <PaddleCheckout clientSecret={clientSecret} />;
    case 'braintree':
      return <BraintreeCheckout clientSecret={clientSecret} />;
    default:
      return <div>不支持的支付方式</div>;
  }
}
```

### Webhook 处理

```typescript
// app/api/webhooks/payments/route.ts
import { getPaymentService } from '@rolitt/payments';
import { paymentAnalytics } from '@rolitt/payments';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature') || 
                   headers().get('paddle-signature') || 
                   headers().get('creem-signature');
  
  const paymentService = getPaymentService();
  
  try {
    // 验证并处理 webhook (自动检测供应商)
    const event = await paymentService.handleWebhook(body, signature);
    
    // 记录到分析系统
    paymentAnalytics.recordEvent({
      provider: event.provider,
      type: event.type as any,
      amount: event.data.amount,
      currency: event.data.currency,
      customerId: event.data.customerId,
      processingTime: event.processingTime,
    });
    
    // 处理具体事件
    switch (event.type) {
      case 'payment_succeeded':
        // 订单履约逻辑
        await fulfillOrder(event.data);
        break;
      case 'payment_failed':
        // 失败处理逻辑
        await handlePaymentFailure(event.data);
        break;
    }
    
    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook processing failed:', error);
    return Response.json({ error: 'Webhook failed' }, { status: 400 });
  }
}
```

## 监控和分析

### 支付分析面板

```tsx
// components/PaymentAnalyticsDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { paymentAnalytics } from '@rolitt/payments';

export function PaymentAnalyticsDashboard() {
  const [metrics, setMetrics] = useState([]);
  const [realTimeStats, setRealTimeStats] = useState(null);

  useEffect(() => {
    // 获取所有供应商指标
    const allMetrics = paymentAnalytics.getAllMetrics();
    setMetrics(allMetrics);

    // 获取实时统计
    const stats = paymentAnalytics.getRealTimeStats();
    setRealTimeStats(stats);

    // 每30秒更新一次
    const interval = setInterval(() => {
      const newStats = paymentAnalytics.getRealTimeStats();
      setRealTimeStats(newStats);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="payment-analytics">
      <h2>支付供应商表现</h2>
      
      {realTimeStats && (
        <div className="real-time-stats">
          <h3>实时统计 (过去1小时)</h3>
          <p>活跃事件: {realTimeStats.recentEvents}</p>
          <p>成功率: {realTimeStats.recentSuccessRate}%</p>
          <p>平均处理时间: {realTimeStats.avgProcessingTime}ms</p>
          <p>活跃供应商: {realTimeStats.activeProviders.join(', ')}</p>
        </div>
      )}

      <div className="provider-metrics">
        {metrics.map((metric) => (
          <div key={metric.provider} className="metric-card">
            <h4>{metric.provider.toUpperCase()}</h4>
            <p>总交易: {metric.totalTransactions}</p>
            <p>成功率: {(metric.successRate * 100).toFixed(2)}%</p>
            <p>平均金额: ${(metric.averageAmount / 100).toFixed(2)}</p>
            <p>平均处理时间: {metric.averageProcessingTime.toFixed(0)}ms</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 性能报告生成

```typescript
// app/api/admin/payment-report/route.ts
import { paymentAnalytics } from '@rolitt/payments';

export async function GET() {
  const report = paymentAnalytics.generatePerformanceReport();
  
  return Response.json({
    ...report,
    generatedAt: new Date().toISOString(),
  });
}
```

## 配置切换

### 开发环境测试

```typescript
// scripts/test-payment-setup.ts
import { PaymentProviderTester } from '@rolitt/payments/scripts/test-providers';

async function testSetup() {
  const tester = new PaymentProviderTester();
  await tester.runAllTests();
}

testSetup().catch(console.error);
```

### 生产环境渐进式切换

```typescript
// 在实际路由中实现渐进式切换
export async function POST(request: Request) {
  const paymentService = getPaymentService();
  const { amount, currency } = await request.json();
  
  // 获取用户ID的哈希值，用于A/B测试
  const userIdHash = getUserIdHash(userId);
  
  let preferredProviders: string[] = ['stripe']; // 默认使用 Stripe
  
  // 渐进式推出新供应商
  if (userIdHash % 10 < 2) { // 20% 用户使用新供应商
    preferredProviders = ['creem', 'stripe'];
  } else if (userIdHash % 10 < 5) { // 30% 用户使用 Paddle
    preferredProviders = ['paddle', 'stripe'];
  }
  
  const { provider, paymentIntent } = await paymentService.smartPaymentRouting({
    amount,
    currency,
    customerId: userId,
    description: 'Product purchase',
  }, {
    preferredProviders,
    region: getUserRegion(request),
  });
  
  return Response.json({ provider, paymentIntent });
}
```

## 故障切换

```typescript
// utils/payment-failover.ts
import { getPaymentService } from '@rolitt/payments';

export async function createPaymentWithFailover(
  paymentData: PaymentIntentParams,
  preferredProvider?: string
) {
  const paymentService = getPaymentService();
  const availableProviders = paymentService.getAvailableProviders();
  
  // 确定尝试顺序
  const tryOrder = preferredProvider 
    ? [preferredProvider, ...availableProviders.filter(p => p !== preferredProvider)]
    : availableProviders;
  
  for (const provider of tryOrder) {
    try {
      const result = await paymentService.createPaymentIntent(paymentData, provider);
      console.log(`Payment created successfully with ${provider}`);
      return { success: true, provider, result };
    } catch (error) {
      console.error(`Payment failed with ${provider}:`, error);
      
      // 记录失败事件
      paymentAnalytics.recordEvent({
        provider,
        type: 'payment_failed',
        amount: paymentData.amount,
        currency: paymentData.currency,
        errorMessage: error.message,
      });
      
      // 如果不是最后一个供应商，继续尝试
      if (provider !== tryOrder[tryOrder.length - 1]) {
        continue;
      }
    }
  }
  
  return { success: false, error: 'All payment providers failed' };
}
```

## 最佳实践

### 1. 监控和报警

```typescript
// utils/payment-monitoring.ts
export function setupPaymentMonitoring() {
  // 每5分钟检查一次供应商健康状态
  setInterval(async () => {
    try {
      const { providerHealth } = await checkPaymentHealth();
      
      const unhealthyProviders = providerHealth.filter(p => p.status === 'unhealthy');
      
      if (unhealthyProviders.length > 0) {
        // 发送报警
        await sendAlert({
          type: 'payment_provider_down',
          providers: unhealthyProviders.map(p => p.provider),
          message: '支付供应商异常，请检查配置',
        });
      }
    } catch (error) {
      console.error('Payment health check failed:', error);
    }
  }, 5 * 60 * 1000);
}
```

### 2. 成本优化

```typescript
// 根据交易费用选择供应商
export function getCostOptimalProvider(amount: number, currency: string): string {
  const fees = {
    stripe: amount * 0.029 + 30, // 2.9% + $0.30
    creem: amount * 0.025 + 25,  // 2.5% + $0.25
    paddle: amount * 0.05,       // 5% (含税务处理)
    braintree: amount * 0.029 + 30, // 2.9% + $0.30
  };
  
  return Object.entries(fees).reduce((a, b) => fees[a[0]] < fees[b[0]] ? a : b)[0];
}
```

### 3. 用户体验优化

```typescript
// 保存用户偏好的支付方式
export function saveUserPaymentPreference(userId: string, provider: string) {
  // 保存到数据库或缓存
  return saveToUserPreferences(userId, { preferredPaymentProvider: provider });
}

export function getUserPaymentPreference(userId: string): string | null {
  // 从数据库或缓存获取
  return getUserPreferences(userId)?.preferredPaymentProvider || null;
}
```

## 部署检查清单

- [ ] 所有环境变量已正确配置
- [ ] Webhook 端点已设置并通过验证
- [ ] 测试脚本运行成功
- [ ] 监控和报警已启用
- [ ] 渐进式推出策略已实施
- [ ] 错误处理和回退机制已测试
- [ ] 合规性检查已通过
- [ ] 文档已更新