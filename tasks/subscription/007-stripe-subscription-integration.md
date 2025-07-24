# Task 007: Stripe 订阅功能集成

## 🎯 目标
在现有的 `@rolitt/payments` 包基础上增强订阅功能，支持订阅计划管理、Webhook 处理和多语言定价，实现稳定的经常性收入（MRR）增长。

## 📊 当前状态
- ✅ 已有完整的 `@rolitt/payments` 包，包含 Stripe 集成
- ✅ 订阅相关类型定义已存在（SubscriptionRequest, Subscription, SubscriptionUpdate）
- ✅ StripeCheckoutService 已实现，支持一次性支付
- ✅ PaymentProvider 接口已定义订阅方法（createSubscription, updateSubscription, cancelSubscription）
- ❌ 缺少订阅模式的 checkout session 创建
- ❌ 缺少订阅相关的 Webhook 事件处理
- ❌ 缺少订阅计划配置和多语言定价数据
- tactshop 项目提供了成熟的订阅实现参考

## 🔧 实施步骤
- [ ] 步骤1：扩展 StripeCheckoutService 支持订阅模式 checkout
- [ ] 步骤2：创建订阅计划配置和多语言定价数据结构
- [ ] 步骤3：增强 Webhook 处理支持订阅生命周期事件
- [ ] 步骤4：在 payments 包中实现完整的订阅管理功能
- [ ] 步骤5：集成到主应用的支付流程（支持订阅选择）
- [ ] 步骤6：添加订阅相关的数据库字段和迁移
- [ ] 步骤7：创建订阅管理 UI 组件
- [ ] 步骤8：编写集成测试和文档

## 📁 涉及文件
- `修改: packages/payments/src/features/stripe/StripeCheckoutService.ts` - 增加订阅 checkout
- `新建: packages/payments/src/features/subscription/SubscriptionPlans.ts` - 订阅计划配置
- `新建: packages/payments/src/features/subscription/SubscriptionPricingData.ts` - 多语言定价
- `新建: packages/payments/src/features/subscription/SubscriptionService.ts` - 订阅管理服务
- `修改: packages/payments/src/features/webhooks/StripeWebhookHandler.ts` - 订阅事件处理
- `修改: packages/payments/src/types/index.ts` - 增强订阅类型定义
- `修改: packages/payments/src/index.ts` - 导出新功能
- `修改: src/app/api/webhooks/stripe/route.ts` - 集成订阅 Webhook
- `修改: src/models/Schema.ts` - 添加订阅相关表结构
- `修改: src/app/actions/checkoutActions.ts` - 支持订阅 checkout
- `新建: migrations/add-subscription-fields.sql` - 数据库迁移

## ✅ 验收标准
- [ ] 用户可以选择并购买订阅计划
- [ ] 订阅状态正确同步到数据库
- [ ] Webhook 可靠处理订阅生命周期事件
- [ ] 支持4种语言的定价显示（en, es, ja, zh-HK）
- [ ] 订阅创建响应时间 < 300ms（遵循异步架构）
- [ ] 订阅功能可独立测试
- [ ] 零技术分裂，与现有 payments 包完全兼容
- [ ] 支持一次性付费和订阅的统一流程

## 🔗 相关资源
- [Stripe 订阅 API 文档](https://stripe.com/docs/api/subscriptions)
- [tactshop 订阅实现参考](../tactshop/packages/stripe/)
- [Rolitt 支付系统文档](../docs/payment-system.md)
- [Workspace 包开发指南](../docs/workspace-packages.md)

## ⚠️ 技术考虑
- **API 版本一致性**：使用 Stripe API '2025-06-30.basil' 版本
- **幂等性保证**：Webhook 处理必须支持重复事件
- **状态机设计**：订阅状态流转需明确定义（trialing → active → canceled → past_due）
- **价格同步**：Stripe Dashboard 价格 ID 需与代码配置保持同步
- **用户体验**：订阅选择应集成到现有产品选择流程中
- **容错机制**：网络故障时使用本地配置作为降级方案
- **数据一致性**：PostgreSQL 事务确保用户、订阅、支付数据的原子性更新

## 📋 实施细节

### 增强现有 payments 包
```typescript
// packages/payments/src/types/index.ts - 扩展现有类型
export type SubscriptionPlan = {
  id: string;
  name: string;
  interval: 'month' | 'year';
  amount: number;
  currency: string;
  features: string[];
  stripePriceId: string;
};

// 扩展现有 StripeSessionParams 支持订阅
export type StripeSubscriptionSessionParams = {
  priceId: string; // Stripe Price ID for subscription
  mode: 'subscription';
  trialPeriodDays?: number;
} & Omit<StripeSessionParams, 'price'>;
```

### 集成策略
1. **扩展而非重写**: 在现有 StripeCheckoutService 基础上添加订阅支持
2. **复用 Webhook 基础设施**: 扩展现有 StripeWebhookHandler
3. **统一数据流**: 订阅和一次性支付共享相同的数据库模型
4. **渐进式增强**: 先实现核心功能，再扩展 UI 界面

### 商业价值
- 🎯 **稳定现金流**: 从一次性付费转向经常性收入模式
- 📈 **客户生命周期价值提升**: 订阅模式提高 LTV
- 🔄 **自动续费**: 减少流失，提高留存
- 💰 **预测性收入**: 便于财务规划和估值
