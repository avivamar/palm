# Rolitt 支付系统架构文档

## 概述

本文档详细介绍了 Rolitt 预售平台的支付系统架构设计、核心组件和工作流程。该系统采用现代化的微服务架构，以 Stripe 为主要支付提供商，实现了高性能、高可靠性的电商支付解决方案。

## 核心架构设计

### 支付服务层架构

支付系统采用分层架构设计，位于 `src/libs/payments/` 目录：

```
src/libs/payments/
├── core/                    # 核心层
│   ├── payment-service.ts   # 统一支付服务
│   ├── payment-types.ts     # 类型定义
│   └── payment-errors.ts    # 错误处理
└── providers/               # 提供商层
    └── stripe/
        └── stripe-provider.ts # Stripe 实现
```

#### 1. 统一支付接口 (`PaymentService`)

- **设计模式**: 策略模式 + 单例模式
- **功能**: 提供抽象的支付服务接口，支持多个支付提供商
- **特点**:
  - 提供商注册机制
  - 统一的客户管理、支付处理、订阅管理
  - 完整的 Webhook 处理流程

#### 2. Stripe 支付提供商 (`StripePaymentProvider`)

- **API 版本**: `2025-06-30.basil`
- **功能覆盖**:
  - 客户创建/更新/删除
  - 支付意图创建/确认/取消
  - 订阅管理
  - Webhook 验证和处理
- **错误处理**: 完整的错误分类和处理机制

### 结账流程优化

#### 架构演进：从同步到异步

**问题**: 原始的同步架构在 Serverless 环境下容易超时

**解决方案**: "立即响应，后台处理"的异步模式

```typescript
// 优化后的 handleCheckout 流程
export async function handleCheckout(formData: FormData) {
  // 1. 快速验证数据
  const validatedData = formSchema.parse(data);

  // 2. 立即创建 Stripe 会话
  const session = await stripe.checkout.sessions.create({...});

  // 3. 立即重定向用户到 Stripe
  redirect(session.url);

  // 注意：数据库写入和营销事件发送移至 Webhook 处理
}
```

**优势**:
- 极速用户体验（立即重定向）
- 解决 Serverless 超时问题
- 数据最终一致性保证

### Webhook 事件处理

#### 核心处理器 (`src/app/api/webhooks/stripe/route.ts`)

**事件驱动架构**:
```typescript
// 主要处理 checkout.session.completed 事件
async function handleCheckoutSessionCompleted(session, logId) {
  // 1. 验证会话数据
  // 2. 创建预订记录（PostgreSQL）
  // 3. 发送营销事件（Klaviyo）
  // 4. 记录处理日志
}
```

**关键特性**:
- **幂等性**: 防止重复处理
- **日志记录**: 完整的事件追踪
- **错误恢复**: 分层错误处理
- **异步处理**: 避免阻塞响应

## 前端支付组件

### 1. 产品选择组件 (`ProductSelection.tsx`)

**功能特性**:
- 动态产品排序（基于配置的颜色顺序）
- 实时价格显示
- 表单验证和状态管理
- 用户认证集成

**用户体验优化**:
- 加载骨架屏
- 选择状态视觉反馈
- 无障碍支持

### 2. 支付按钮组件 (`PaymentButton.tsx`)

**功能**:
- 支付状态指示
- 分析事件触发
- 表单提交处理

### 3. 错误边界 (`PaymentErrorBoundary.tsx`)

**错误分类处理**:
- 配置错误（环境变量缺失）
- 网络错误
- 一般支付错误

**用户体验**:
- 友好的错误提示
- 恢复操作建议
- 开发环境调试信息

## 数据层设计

### 数据库架构 (`src/models/Schema.ts`)

#### 核心表结构

**1. 预订表 (`preordersSchema`)**
```sql
-- 核心字段
id: text PRIMARY KEY          -- Nanoid 生成
userId: text                  -- Firebase UID（可选）
email: text NOT NULL         -- 客户邮箱
color: productColorEnum      -- 产品颜色
status: preorderStatusEnum   -- 订单状态
sessionId: text              -- Stripe 会话 ID
paymentIntentId: text        -- Stripe 支付意图 ID
amount: decimal(10,2)        -- 支付金额
currency: text               -- 货币代码
preorderNumber: text UNIQUE  -- 订单号（ROL-XXXXXXXX）

-- 扩展字段
shippingAddress: jsonb       -- 配送地址
locale: text                 -- 语言区域
trackingNumber: text         -- 物流追踪号
```

**2. Webhook 日志表 (`webhookLogsSchema`)**
```sql
-- 事件追踪
event: text NOT NULL         -- 事件类型
provider: text               -- 支付提供商
status: webhookStatusEnum    -- 处理状态
stripeEventId: text UNIQUE   -- Stripe 事件 ID

-- 业务关联
preorderId: text             -- 关联预订
email: text                  -- 客户邮箱
klaviyoEventSent: boolean    -- Klaviyo 事件发送状态

-- 调试信息
error: text                  -- 错误信息
rawData: jsonb              -- 原始数据
```

### Webhook 日志系统

#### 双存储架构支持

**PostgreSQL 模式**:
```typescript
// 基于 Drizzle ORM 的操作
const result = await db.insert(webhookLogsSchema).values({...});
```

**Firestore 模式**:
```typescript
// 基于 Firebase SDK 的操作
const docRef = await FirestoreDB.collection('webhook_logs').add({...});
```

#### 日志记录流程

```typescript
// 1. 事件开始记录
const logId = await WebhookLogger.logStripeEventStart(eventType, eventId, email);

// 2. 处理过程追踪
try {
  // 业务逻辑处理
  await processBusinessLogic();

  // 3. 成功记录
  await WebhookLogger.logStripeEventSuccess(logId, klaviyoSuccess, metadata);
} catch (error) {
  // 3. 失败记录
  await WebhookLogger.logStripeEventFailure(logId, error, metadata);
}
```

## 营销集成系统

### Klaviyo 事件管理

#### 幂等性保证机制

```typescript
// 事件去重缓存
const sentEvents = new Set<string>();

function generateEventKey(eventName: string, email: string, uniqueId: string): string {
  return `${eventName}:${email}:${uniqueId}`;
}
```

#### 核心事件类型

**1. 预售成功事件**:
```typescript
await RolittKlaviyoEvents.preorderSuccess(email, {
  color,
  preorder_id,
  locale,
  amount,
  currency,
  session_id
});
```

**2. 重试机制**:
- 指数退避策略
- 最大重试次数: 3
- 初始延迟: 1000ms

## 配置管理

### 环境变量配置 (`src/libs/Env.ts`)

**Stripe 配置**:
```typescript
STRIPE_SECRET_KEY: z.string().startsWith('sk_');
STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_');
STRIPE_PRODUCT_ID: z.string().startsWith('prod_');
COLOR_PRICE_MAP_JSON: z.string().min(1);
```

**数据存储配置**:
```typescript
DATABASE_STORAGE_TARGET: z.enum(['firestore', 'postgres']).default('postgres');
```

## 系统特性分析

### 1. 性能优化

**异步处理架构**:
- 用户支付流程: 100-200ms 响应时间
- 后台数据处理: 通过 Webhook 异步完成
- 避免 Serverless 冷启动和超时问题

**缓存策略**:
- 事件去重缓存（防止重复发送）
- 静态资源缓存
- 数据库连接池

### 2. 可靠性保证

**多层错误处理**:
- 应用层: React Error Boundary
- 服务层: 自定义错误类型
- 数据层: 事务处理
- 网络层: 重试机制

**数据一致性**:
- 事件驱动架构确保最终一致性
- 幂等操作防止重复处理
- 完整的审计日志

### 3. 扩展性设计

**支付提供商抽象**:
- 接口定义: `PaymentProvider`
- 插件式架构: 支持动态注册新提供商
- 配置驱动: 环境变量控制功能开关

**数据存储抽象**:
- 支持 PostgreSQL 和 Firestore
- 统一的数据访问接口
- 平滑的数据迁移能力

## 监控和调试

### 日志系统

**分级日志**:
- Error: 系统错误和业务异常
- Warn: 潜在问题和降级处理
- Info: 关键业务流程节点
- Debug: 详细的调试信息

**日志聚合**:
- Webhook 事件完整追踪
- 支付流程端到端监控
- 错误模式识别和告警

### 性能监控

**关键指标**:
- 支付成功率
- 平均响应时间
- Webhook 处理延迟
- 错误率趋势

## 最佳实践总结

### 1. 架构设计

- **异步优先**: 关键用户流程保持同步，辅助流程异步处理
- **事件驱动**: 使用 Webhook 实现系统解耦
- **幂等设计**: 所有外部调用都支持幂等操作

### 2. 错误处理

- **分层处理**: 不同层级采用不同的错误处理策略
- **用户友好**: 向用户展示可理解的错误信息
- **开发友好**: 提供详细的调试信息

### 3. 数据管理

- **强类型**: 使用 TypeScript 和 Zod 确保类型安全
- **审计日志**: 记录所有关键业务操作
- **数据完整性**: 使用数据库约束和验证规则

### 4. 用户体验

- **渐进式加载**: 优先显示关键内容
- **状态反馈**: 及时的用户操作反馈
- **错误恢复**: 提供明确的恢复路径

## 技术栈总结

- **前端**: Next.js 14, React, TypeScript
- **后端**: Next.js API Routes, Server Actions
- **支付**: Stripe API v2025-06-30.basil
- **数据库**: PostgreSQL (Drizzle ORM) / Firestore
- **营销**: Klaviyo API
- **部署**: Vercel Serverless
- **监控**: 自定义日志系统

这个支付系统体现了现代电商平台的最佳实践，在保证用户体验的同时，确保了系统的可靠性、可扩展性和可维护性。
