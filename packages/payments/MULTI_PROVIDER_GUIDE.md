# 多支付供应商集成指南

## 🎯 概述

`@rolitt/payments` 包现在支持插件式多支付供应商架构，支持以下支付提供商：

- ✅ **Stripe** - 完整功能支持
- 🆕 **Creem.io** - 新兴支付平台
- 🆕 **Paddle** - 专注于SaaS订阅
- 🆕 **Braintree/PayPal** - PayPal生态系统

## 🏗️ 架构设计

### 核心组件

```typescript
PaymentService (统一接口)
├── PaymentProviderManager (供应商管理)
├── StripeProvider (Stripe实现)
├── CreemProvider (Creem.io实现)  
├── PaddleProvider (Paddle实现)
└── BraintreeProvider (Braintree实现)
```

### 统一接口

所有支付供应商都实现相同的 `PaymentProvider` 接口：

```typescript
interface PaymentProvider {
  // 客户管理
  createCustomer(user: UserProfile): Promise<PaymentCustomer>;
  updateCustomer(customerId: string, data: Partial<CustomerData>): Promise<PaymentCustomer>;
  deleteCustomer(customerId: string): Promise<void>;

  // 支付处理
  createPaymentIntent(request: PaymentIntentRequest): Promise<PaymentIntent>;
  confirmPayment(paymentId: string, paymentMethod: string): Promise<PaymentResult>;
  cancelPayment(paymentId: string): Promise<PaymentResult>;

  // 订阅管理
  createSubscription(request: SubscriptionRequest): Promise<Subscription>;
  updateSubscription(subscriptionId: string, updates: SubscriptionUpdate): Promise<Subscription>;
  cancelSubscription(subscriptionId: string): Promise<Subscription>;

  // Webhook处理
  validateWebhook(payload: string, signature: string): Promise<WebhookEvent>;
  processWebhook(event: WebhookEvent): Promise<WebhookResult>;
}
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 核心包已包含
npm install @rolitt/payments

# 根据需要安装特定供应商的依赖
npm install stripe                    # Stripe
npm install braintree                 # Braintree (可选)
# Creem.io 和 Paddle 使用 HTTP API，无需额外依赖
```

### 2. 基础配置

```typescript
import { PaymentService } from '@rolitt/payments';

const paymentService = new PaymentService({
  providers: {
    // Stripe 配置
    stripe: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
      secretKey: process.env.STRIPE_SECRET_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      apiVersion: '2025-06-30.basil',
    },
    
    // Creem.io 配置
    creem: {
      apiKey: process.env.CREEM_API_KEY!,
      publicKey: process.env.CREEM_PUBLIC_KEY!,
      webhookSecret: process.env.CREEM_WEBHOOK_SECRET!,
      environment: 'production', // 或 'sandbox'
    },
    
    // Paddle 配置
    paddle: {
      vendorId: process.env.PADDLE_VENDOR_ID!,
      vendorAuthCode: process.env.PADDLE_VENDOR_AUTH_CODE!,
      publicKey: process.env.PADDLE_PUBLIC_KEY!,
      environment: 'production', // 或 'sandbox'
    },
    
    // Braintree 配置
    braintree: {
      environment: 'production', // 或 'sandbox'
      merchantId: process.env.BRAINTREE_MERCHANT_ID!,
      publicKey: process.env.BRAINTREE_PUBLIC_KEY!,
      privateKey: process.env.BRAINTREE_PRIVATE_KEY!,
    },
  },
  defaultProvider: 'stripe', // 设置默认供应商
});
```

## 💻 使用示例

### 创建支付

```typescript
// 使用默认供应商
const paymentIntent = await paymentService.createPaymentIntent({
  amount: 2000, // $20.00
  currency: 'USD',
  customerId: 'customer_123',
  description: 'Product purchase',
});

// 指定特定供应商
const creemPayment = await paymentService.createPaymentIntent({
  amount: 2000,
  currency: 'USD', 
  customerId: 'customer_123',
  description: 'Product purchase',
}, 'creem'); // 使用 Creem.io
```

### 智能支付路由

```typescript
// 自动选择最佳支付供应商
const { provider, paymentIntent } = await paymentService.smartPaymentRouting({
  amount: 5000, // $50.00
  currency: 'EUR',
  customerId: 'customer_123',
}, {
  preferredProviders: ['paddle', 'stripe'], // 优先使用
  excludeProviders: ['braintree'],          // 排除使用
});

console.log(`Selected provider: ${provider}`);
```

### 创建订阅

```typescript
// 使用 Paddle 创建 SaaS 订阅
const subscription = await paymentService.createSubscription({
  customerId: 'customer_123',
  priceId: 'price_1234567890',
  quantity: 1,
  trialPeriodDays: 14,
}, 'paddle');
```

### Webhook 处理

```typescript
// API 路由中处理多供应商 webhook
export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get('signature') || '';
  
  // 根据 URL 路径确定供应商
  const provider = request.url.includes('/stripe') ? 'stripe' : 
                  request.url.includes('/creem') ? 'creem' :
                  request.url.includes('/paddle') ? 'paddle' : 'braintree';
  
  try {
    // 验证 webhook
    const event = await paymentService.validateWebhook(payload, signature, provider);
    
    // 处理事件
    const result = await paymentService.processWebhook(event, provider);
    
    return Response.json({ success: result.processed });
  } catch (error) {
    return Response.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}
```

## 🔧 高级功能

### 供应商健康检查

```typescript
// 检查单个供应商
const health = await paymentService.checkProviderHealth('stripe');
console.log(`Stripe status: ${health.status}`);

// 检查所有供应商
const allHealth = await paymentService.checkAllProvidersHealth();
allHealth.forEach(({ provider, status, error }) => {
  console.log(`${provider}: ${status}${error ? ` - ${error}` : ''}`);
});
```

### 供应商切换

```typescript
// 运行时切换默认供应商
paymentService.setDefaultProvider('creem');

// 获取可用供应商列表
const providers = paymentService.getAvailableProviders();
console.log('Available providers:', providers);
```

### 自定义支付逻辑

```typescript
// 根据业务逻辑选择供应商
async function selectPaymentProvider(amount: number, currency: string, region: string) {
  if (region === 'EU' && currency === 'EUR') {
    return 'paddle'; // 欧洲用户使用 Paddle
  }
  
  if (amount > 100000) { // > $1000
    return 'stripe'; // 大额支付使用 Stripe
  }
  
  if (currency === 'USD') {
    return 'creem'; // 美元支付试用新供应商
  }
  
  return 'stripe'; // 默认使用 Stripe
}

const provider = await selectPaymentProvider(5000, 'EUR', 'DE');
const payment = await paymentService.createPaymentIntent(request, provider);
```

## 🌍 环境变量配置

```bash
# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Creem.io
CREEM_API_KEY=ck_live_...
CREEM_PUBLIC_KEY=pk_live_...
CREEM_WEBHOOK_SECRET=whsec_...

# Paddle
PADDLE_VENDOR_ID=123456
PADDLE_VENDOR_AUTH_CODE=abc123...
PADDLE_PUBLIC_KEY=pk_live_...

# Braintree
BRAINTREE_MERCHANT_ID=merchant_id
BRAINTREE_PUBLIC_KEY=public_key
BRAINTREE_PRIVATE_KEY=private_key
```

## 📊 供应商对比

| 功能 | Stripe | Creem.io | Paddle | Braintree |
|------|--------|----------|--------|-----------|
| 一次性支付 | ✅ | ✅ | ✅ | ✅ |
| 订阅计费 | ✅ | ✅ | ✅ | ✅ |
| 国际支付 | ✅ | ✅ | ✅ | ✅ |
| 支付方式 | 多种 | 多种 | 多种 | PayPal生态 |
| 费率 | 2.9%+$0.30 | 竞争性 | 5%+$0.50 | 2.9%+$0.30 |
| 最佳用例 | 通用 | 新兴市场 | SaaS订阅 | PayPal用户 |

## 🔒 安全考虑

1. **API 密钥管理**
   - 使用环境变量存储敏感信息
   - 定期轮换 API 密钥
   - 使用不同环境的不同密钥

2. **Webhook 验证**
   - 始终验证 webhook 签名
   - 使用 HTTPS 端点
   - 实现幂等性处理

3. **错误处理**
   - 不在客户端暴露敏感错误信息
   - 记录详细的服务器端日志
   - 实现重试机制

## 🚦 迁移指南

### 从单一 Stripe 迁移

```typescript
// 旧代码
import { StripeCheckoutService } from '@rolitt/payments';
const stripe = new StripeCheckoutService(secretKey);

// 新代码
import { PaymentService } from '@rolitt/payments';
const paymentService = new PaymentService({
  providers: { stripe: stripeConfig },
  defaultProvider: 'stripe'
});

// API 保持相同，但现在可以指定供应商
```

### 添加新供应商

1. 在配置中添加新供应商
2. 更新环境变量
3. 测试 webhook 端点
4. 逐步切换流量

## 🔍 故障排除

### 常见问题

1. **供应商初始化失败**
   ```typescript
   // 检查配置
   const providers = paymentService.getAvailableProviders();
   console.log('Initialized providers:', providers);
   ```

2. **Webhook 验证失败**
   ```typescript
   // 确保使用正确的签名头
   const signature = request.headers.get('stripe-signature') || // Stripe
                    request.headers.get('creem-signature') ||   // Creem
                    request.headers.get('x-paddle-signature'); // Paddle
   ```

3. **支付失败回退**
   ```typescript
   try {
     return await paymentService.createPaymentIntent(request, 'creem');
   } catch (error) {
     // 回退到 Stripe
     return await paymentService.createPaymentIntent(request, 'stripe');
   }
   ```

## 📈 监控和分析

```typescript
// 记录供应商使用情况
const metrics = {
  stripe: { success: 0, failed: 0 },
  creem: { success: 0, failed: 0 },
  paddle: { success: 0, failed: 0 },
  braintree: { success: 0, failed: 0 },
};

// 在支付处理后更新指标
function updateMetrics(provider: string, success: boolean) {
  if (success) {
    metrics[provider].success++;
  } else {
    metrics[provider].failed++;
  }
}
```

这个多供应商架构为你的支付系统提供了：
- 🔄 **灵活性** - 轻松切换和测试不同供应商
- 🛡️ **冗余性** - 一个供应商故障时自动回退
- 💰 **成本优化** - 根据交易类型选择最经济的供应商
- 🌍 **全球化** - 针对不同地区使用最适合的支付方式
- 📊 **数据洞察** - 比较不同供应商的表现