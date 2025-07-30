# 多供应商支付系统迁移指南

本指南将帮助你从单一 Stripe 集成迁移到多供应商支付系统。

## 迁移概览

### 当前状态 → 目标状态

```diff
// 之前：单一 Stripe 集成
- import Stripe from 'stripe';
- const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 之后：多供应商支付系统
+ import { getPaymentService } from '@rolitt/payments';
+ const paymentService = getPaymentService();
```

## 第一阶段：准备工作

### 1. 安装依赖

```bash
# 如果需要 Braintree 支持
npm install braintree

# 确保已安装基础依赖
npm install zod
```

### 2. 环境变量配置

复制 `packages/payments/.env.example` 到你的环境配置中：

```bash
# 复制模板
cp packages/payments/.env.example .env.local

# 编辑配置
vim .env.local
```

#### 最小配置（仅 Stripe）

```env
# 保持现有 Stripe 配置
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# 新增配置
DEFAULT_PAYMENT_PROVIDER=stripe
ENABLE_SMART_ROUTING=false
PAYMENT_DEBUG_MODE=true
```

#### 完整配置（多供应商）

```env
# Stripe (现有)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Creem.io (新增)
CREEM_API_KEY=ck_test_...
CREEM_PUBLIC_KEY=pk_test_...
CREEM_WEBHOOK_SECRET=whsec_...
CREEM_ENVIRONMENT=sandbox

# Paddle (新增)
PADDLE_VENDOR_ID=123456
PADDLE_VENDOR_AUTH_CODE=abc123...
PADDLE_PUBLIC_KEY=pk_test_...
PADDLE_ENVIRONMENT=sandbox

# Braintree (新增)
BRAINTREE_MERCHANT_ID=your_merchant_id
BRAINTREE_PUBLIC_KEY=your_public_key
BRAINTREE_PRIVATE_KEY=your_private_key
BRAINTREE_ENVIRONMENT=sandbox

# 智能路由配置
DEFAULT_PAYMENT_PROVIDER=stripe
ENABLE_SMART_ROUTING=true
HIGH_AMOUNT_THRESHOLD=10000
EU_CURRENCIES=EUR,GBP,CHF,NOK,SEK,DKK
PAYMENT_DEBUG_MODE=false
```

### 3. 验证配置

```bash
# 运行配置验证
npm run payments:validate

# 运行供应商测试
npm run test:payments
```

## 第二阶段：渐进式迁移

### 步骤 1：替换支付创建逻辑

#### 之前的代码

```typescript
// 旧的 Stripe 实现
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(request: Request) {
  const { amount, currency } = await request.json();
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    automatic_payment_methods: { enabled: true },
  });
  
  return Response.json({ 
    clientSecret: paymentIntent.client_secret 
  });
}
```

#### 迁移后的代码

```typescript
// 新的多供应商实现
import { getPaymentService } from '@rolitt/payments';

export async function POST(request: Request) {
  const { amount, currency, userId } = await request.json();
  
  const paymentService = getPaymentService();
  
  // 向后兼容：如果不启用智能路由，默认使用 Stripe
  const paymentIntent = await paymentService.createPaymentIntent({
    amount,
    currency,
    customerId: userId,
    description: 'Payment for order',
  }, 'stripe'); // 明确指定使用 Stripe
  
  return Response.json({ 
    clientSecret: paymentIntent.clientSecret,
    provider: 'stripe' // 前端需要知道使用哪个供应商
  });
}
```

### 步骤 2：迁移 Webhook 处理

#### 之前的代码

```typescript
// 旧的 Stripe Webhook
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature')!;
  
  const event = stripe.webhooks.constructEvent(
    body, 
    signature, 
    process.env.STRIPE_WEBHOOK_SECRET!
  );
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      // 处理支付成功
      break;
  }
  
  return Response.json({ received: true });
}
```

#### 迁移后的代码

```typescript
// 新的统一 Webhook 处理
import { getPaymentService } from '@rolitt/payments';
import { paymentAnalytics } from '@rolitt/payments';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature') ||
                   headers().get('paddle-signature') ||
                   headers().get('creem-signature');
  
  const paymentService = getPaymentService();
  const startTime = Date.now();
  
  try {
    // 自动检测供应商并验证 webhook
    const event = await paymentService.handleWebhook(body, signature!);
    
    // 记录分析数据
    paymentAnalytics.recordEvent({
      provider: event.provider,
      type: event.type as any,
      amount: event.data.amount,
      currency: event.data.currency,
      processingTime: Date.now() - startTime,
    });
    
    // 统一的事件处理
    switch (event.type) {
      case 'payment_succeeded':
        await handlePaymentSuccess(event.data);
        break;
      case 'payment_failed':
        await handlePaymentFailure(event.data);
        break;
    }
    
    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook failed:', error);
    return Response.json({ error: 'Invalid webhook' }, { status: 400 });
  }
}
```

### 步骤 3：更新前端组件

#### 之前的代码

```tsx
// 旧的 Stripe 组件
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function CheckoutForm({ amount }: { amount: number }) {
  const [clientSecret, setClientSecret] = useState('');
  
  useEffect(() => {
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency: 'usd' }),
    })
    .then(res => res.json())
    .then(data => setClientSecret(data.clientSecret));
  }, [amount]);
  
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm />
    </Elements>
  );
}
```

#### 迁移后的代码

```tsx
// 新的多供应商组件
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function CheckoutForm({ amount }: { amount: number }) {
  const [paymentData, setPaymentData] = useState<{
    clientSecret: string;
    provider: string;
  } | null>(null);
  
  useEffect(() => {
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency: 'usd' }),
    })
    .then(res => res.json())
    .then(data => setPaymentData({
      clientSecret: data.clientSecret,
      provider: data.provider,
    }));
  }, [amount]);
  
  if (!paymentData) return <div>Loading...</div>;
  
  // 目前只支持 Stripe，后续可扩展其他供应商
  if (paymentData.provider === 'stripe') {
    return (
      <Elements 
        stripe={stripePromise} 
        options={{ clientSecret: paymentData.clientSecret }}
      >
        <PaymentForm />
      </Elements>
    );
  }
  
  return <div>Unsupported payment provider: {paymentData.provider}</div>;
}
```

## 第三阶段：启用智能路由

### 步骤 1：启用智能路由配置

```env
# 在 .env.local 中启用
ENABLE_SMART_ROUTING=true
DEFAULT_PAYMENT_PROVIDER=stripe
```

### 步骤 2：更新支付创建逻辑

```typescript
// 启用智能路由
export async function POST(request: Request) {
  const { amount, currency, userId } = await request.json();
  
  const paymentService = getPaymentService();
  
  // 使用智能路由自动选择最佳供应商
  const { provider, paymentIntent } = await paymentService.smartPaymentRouting({
    amount,
    currency,
    customerId: userId,
    description: 'Payment for order',
  }, {
    region: getRegionFromRequest(request), // 从 IP 获取地区
    paymentMethod: 'card',
  });
  
  return Response.json({ 
    clientSecret: paymentIntent.clientSecret,
    provider,
  });
}
```

### 步骤 3：实现 A/B 测试

```typescript
// 渐进式推出新供应商
export async function POST(request: Request) {
  const { amount, currency, userId } = await request.json();
  const paymentService = getPaymentService();
  
  // 根据用户 ID 进行 A/B 分组
  const userGroup = getUserGroup(userId);
  let preferredProviders: string[] = ['stripe'];
  
  switch (userGroup) {
    case 'control':
      preferredProviders = ['stripe']; // 100% Stripe
      break;
    case 'test_creem':
      preferredProviders = ['creem', 'stripe']; // 优先 Creem，失败时回退到 Stripe
      break;
    case 'test_paddle':
      preferredProviders = ['paddle', 'stripe']; // 优先 Paddle
      break;
  }
  
  const { provider, paymentIntent } = await paymentService.smartPaymentRouting({
    amount,
    currency,
    customerId: userId,
    description: 'Payment for order',
  }, {
    preferredProviders,
    region: getRegionFromRequest(request),
  });
  
  // 记录 A/B 测试数据
  await logABTest({
    userId,
    group: userGroup,
    assignedProvider: preferredProviders[0],
    actualProvider: provider,
    amount,
    currency,
  });
  
  return Response.json({ clientSecret: paymentIntent.clientSecret, provider });
}

function getUserGroup(userId: string): 'control' | 'test_creem' | 'test_paddle' {
  const hash = hashUserId(userId);
  const segment = hash % 100;
  
  if (segment < 80) return 'control';        // 80% 控制组
  if (segment < 90) return 'test_creem';     // 10% 测试 Creem
  return 'test_paddle';                      // 10% 测试 Paddle
}
```

## 第四阶段：监控和优化

### 1. 设置监控面板

```typescript
// app/admin/payment-analytics/page.tsx
import { PaymentAnalyticsDashboard } from '@/components/PaymentAnalyticsDashboard';

export default function PaymentAnalyticsPage() {
  return (
    <div className="container">
      <h1>支付系统分析</h1>
      <PaymentAnalyticsDashboard />
    </div>
  );
}
```

### 2. 设置告警系统

```typescript
// utils/payment-alerts.ts
import { checkPaymentHealth } from '@rolitt/payments';

export async function setupPaymentAlerts() {
  setInterval(async () => {
    const { providerHealth } = await checkPaymentHealth();
    
    const unhealthyProviders = providerHealth
      .filter(p => p.status === 'unhealthy')
      .map(p => p.provider);
    
    if (unhealthyProviders.length > 0) {
      await sendSlackAlert({
        message: `🚨 支付供应商异常: ${unhealthyProviders.join(', ')}`,
        severity: 'high',
      });
    }
  }, 5 * 60 * 1000); // 每5分钟检查一次
}
```

### 3. 性能优化

```typescript
// 基于历史数据优化路由
export class SmartRoutingOptimizer {
  async getOptimalProvider(params: {
    amount: number;
    currency: string;
    region: string;
  }): Promise<string> {
    const metrics = paymentAnalytics.getAllMetrics();
    
    // 过滤适合的供应商
    const availableProviders = metrics.filter(m => {
      // 成功率 > 95%
      if (m.successRate < 0.95) return false;
      
      // 平均处理时间 < 3秒
      if (m.averageProcessingTime > 3000) return false;
      
      return true;
    });
    
    if (availableProviders.length === 0) {
      return 'stripe'; // 兜底方案
    }
    
    // 根据地区和金额选择最佳供应商
    if (params.region === 'EU' && params.currency === 'EUR') {
      const paddle = availableProviders.find(p => p.provider === 'paddle');
      if (paddle) return 'paddle';
    }
    
    if (params.amount < 1000) { // 小额支付，选择费用最低的
      return this.getCheapestProvider(availableProviders);
    }
    
    // 选择成功率最高的
    return availableProviders
      .sort((a, b) => b.successRate - a.successRate)[0]
      .provider;
  }
  
  private getCheapestProvider(providers: any[]): string {
    // 简化的费用计算逻辑
    const fees = {
      stripe: 0.029,
      creem: 0.025,
      paddle: 0.05,
      braintree: 0.029,
    };
    
    return providers
      .sort((a, b) => fees[a.provider] - fees[b.provider])[0]
      .provider;
  }
}
```

## 迁移检查清单

### 阶段一：准备
- [ ] 安装必要依赖
- [ ] 配置环境变量
- [ ] 运行配置验证测试
- [ ] 备份现有配置

### 阶段二：基础迁移
- [ ] 替换支付创建 API
- [ ] 更新 Webhook 处理逻辑
- [ ] 测试现有功能正常工作
- [ ] 更新前端组件

### 阶段三：智能路由
- [ ] 启用智能路由配置
- [ ] 实现 A/B 测试逻辑
- [ ] 监控新供应商表现
- [ ] 逐步扩大测试范围

### 阶段四：监控优化
- [ ] 设置监控面板
- [ ] 配置告警系统
- [ ] 实现性能优化
- [ ] 建立运维文档

## 常见问题和解决方案

### Q1: 迁移后某些支付失败了怎么办？

**A:** 检查以下几点：
1. 环境变量配置是否正确
2. Webhook 端点是否正确设置
3. 供应商账户是否激活
4. 查看错误日志确定具体原因

```bash
# 运行诊断脚本
npm run payments:diagnose

# 查看实时日志
npm run payments:logs
```

### Q2: 如何回滚到原来的 Stripe 集成？

**A:** 设置环境变量：
```env
DEFAULT_PAYMENT_PROVIDER=stripe
ENABLE_SMART_ROUTING=false
```

### Q3: 新供应商的成功率比 Stripe 低怎么办？

**A:** 
1. 先检查配置是否正确
2. 在测试环境验证集成
3. 如果确实表现不佳，可以在智能路由中降低其优先级

```typescript
// 临时降低优先级
const { provider, paymentIntent } = await paymentService.smartPaymentRouting(
  paymentData,
  {
    preferredProviders: ['stripe', 'creem'], // 将表现不好的供应商排在后面
    region,
  }
);
```

### Q4: 如何处理不同供应商的费用差异？

**A:** 在智能路由中加入成本考虑：

```typescript
// 考虑成本的路由策略
if (amount > 10000) { // 大额支付，选择固定费用的供应商
  preferredProviders = ['paddle', 'stripe'];
} else { // 小额支付，选择百分比费用低的供应商
  preferredProviders = ['creem', 'stripe'];
}
```

## 技术支持

如果在迁移过程中遇到问题：

1. 查看[完整文档](./README.md)
2. 运行诊断工具：`npm run payments:diagnose`
3. 查看[集成示例](./next-app-integration.ts)
4. 在 GitHub 上提交 Issue