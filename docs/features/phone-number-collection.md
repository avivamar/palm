# 📱 手机号收集功能实现指南

## 🎯 功能概述

本功能实现了在 Stripe checkout 页面收集客户手机号，并将其保存到 PostgreSQL 数据库中。

## 🔧 技术实现

### 1. Stripe Checkout 配置

在 `src/app/actions/checkoutActions.ts` 中启用了手机号收集：

```typescript
phone_number_collection: {
  enabled: true,
}
```

### 2. 数据库结构

#### Users 表
- `phone` 字段：存储用户手机号（可选）

#### Preorders 表
- `billing_phone` 字段：存储订单相关的手机号
- `billing_address` 字段：JSONB 格式，包含完整的账单地址信息

### 3. Webhook 处理

在 `src/app/api/webhooks/stripe/route.ts` 中：
- 从 `session.customer_details.phone` 提取手机号
- 传递给 `createUserAndLinkPreorder` 函数

### 4. 用户创建和订单更新

在 `src/app/actions/preorderActions.ts` 中：
- 新用户创建时保存手机号到 `users.phone` 字段
- 订单更新时保存手机号到 `preorders.billing_phone` 字段
- 优先使用 Stripe checkout session 中的手机号

## 📋 部署清单

### 1. 数据库迁移

运行迁移文件添加 `billing_phone` 字段：

```bash
# 如果使用 Drizzle 迁移
npm run db:push

# 或者手动执行 SQL
psql -d your_database -f migrations/0001_add_billing_phone_field.sql
```

### 2. 环境变量检查

确保以下环境变量已配置：
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `DATABASE_URL`

### 3. Stripe Dashboard 配置

确认 Webhook 端点配置：
- URL: `https://your-domain.com/api/webhooks/stripe`
- 事件: `checkout.session.completed`

## 🧪 测试指南

### 1. 功能测试

1. **创建测试订单**：
   - 访问预订页面
   - 填写邮箱和选择颜色
   - 点击结账

2. **Stripe Checkout 页面**：
   - 确认页面显示手机号输入框
   - 填写测试手机号（如：+1234567890）
   - 使用测试卡号完成支付

3. **数据验证**：
   ```sql
   -- 检查用户表中的手机号
   SELECT id, email, phone FROM users WHERE email = 'test@example.com';

   -- 检查订单表中的手机号
   SELECT id, email, billing_phone FROM preorders WHERE email = 'test@example.com';
   ```

### 2. Webhook 测试

使用 Stripe CLI 测试 webhook：

```bash
# 监听 webhook 事件
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 触发测试事件
stripe trigger checkout.session.completed
```

### 3. 错误处理测试

- 测试没有手机号的情况
- 测试无效手机号格式
- 测试 webhook 处理失败的情况

## 🔍 监控和日志

### 关键日志点

1. **Checkout Session 创建**：
   ```
   [HybridCheckout] 🎯 Starting hybrid marketing payment flow
   ```

2. **Webhook 处理**：
   ```
   [Webhook] 🚀 Starting handleCheckoutSessionCompleted
   [Webhook] 👤 Calling createUserAndLinkPreorder
   ```

3. **用户创建**：
   ```
   [HybridUserCreation] ✅ High-value user created
   ```

### 监控指标

- 手机号收集率：有手机号的订单 / 总订单数
- Webhook 处理成功率
- 用户创建成功率

## 🚨 故障排查

### 常见问题

1. **手机号未显示在 Stripe Checkout**：
   - 检查 `phone_number_collection.enabled` 配置
   - 确认 Stripe 账户支持手机号收集功能

2. **手机号未保存到数据库**：
   - 检查 webhook 日志
   - 确认数据库迁移已执行
   - 检查 `createUserAndLinkPreorder` 函数参数

3. **Webhook 处理失败**：
   - 检查 `STRIPE_WEBHOOK_SECRET` 配置
   - 查看 webhook_logs 表中的错误信息
   - 确认网络连接和超时设置

### 调试命令

```sql
-- 查看最近的 webhook 日志
SELECT * FROM webhook_logs ORDER BY created_at DESC LIMIT 10;

-- 查看手机号收集统计
SELECT
  COUNT(*) as total_orders,
  COUNT(billing_phone) as orders_with_phone,
  ROUND(COUNT(billing_phone) * 100.0 / COUNT(*), 2) as phone_collection_rate
FROM preorders
WHERE created_at >= NOW() - INTERVAL '7 days';
```

## 📈 后续优化建议

1. **数据验证**：
   - 添加手机号格式验证
   - 实现国际手机号标准化

2. **用户体验**：
   - 添加手机号验证流程
   - 支持 SMS 通知功能

3. **营销集成**：
   - 将手机号同步到 Klaviyo
   - 支持 SMS 营销活动

4. **隐私合规**：
   - 添加手机号使用同意选项
   - 实现数据删除功能

---

**实施日期**：2025-01-26
**版本**：v1.0
**状态**：✅ 已完成
