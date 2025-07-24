# 008 - 订阅系统数据库集成计划

**任务编号**: 008
**任务类型**: 数据库集成 + 功能开发
**预估时间**: 2-3小时
**优先级**: 中等
**业务价值**: 支持AI功能权限控制和用户订阅管理

## 🎯 目标

为Rolitt AI伴侣项目集成订阅数据库，实现用户订阅状态追踪、AI功能权限控制和商业数据分析。

## 📋 具体任务

### Phase 1: 数据库设计 (30分钟)
1. **扩展用户表**
   - 添加订阅状态字段
   - 关联Stripe customer ID

2. **创建订阅表**
   - 订阅基础信息
   - 计划详情和状态
   - 周期和续费信息

3. **创建使用量表**
   - AI对话次数追踪
   - 功能使用统计
   - 每日/月度重置机制

### Phase 2: 数据迁移 (45分钟)
1. **生成Drizzle迁移文件**
2. **编写数据同步脚本**
3. **测试迁移流程**

### Phase 3: 业务逻辑集成 (60分钟)
1. **订阅状态同步服务**
2. **权限检查中间件**
3. **使用量限制组件**

### Phase 4: Webhook集成 (30分钟)
1. **扩展Stripe webhook处理**
2. **订阅状态自动同步**
3. **错误处理和重试机制**

### Phase 5: 测试验证 (15分钟)
1. **数据库操作测试**
2. **权限控制验证**
3. **Webhook事件测试**

## 🗄️ 数据库架构

### 用户表扩展
```sql
ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'free';
ALTER TABLE users ADD COLUMN subscription_plan VARCHAR(50) DEFAULT 'free';
```

### 订阅表
```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  plan_id VARCHAR(50), -- basic/pro/premium
  status VARCHAR(50), -- active/canceled/past_due/trialing
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 使用量表
```sql
CREATE TABLE subscription_usage (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  resource_type VARCHAR(50), -- 'chat_messages', 'ai_calls'
  usage_count INTEGER DEFAULT 0,
  limit_count INTEGER,
  period_start TIMESTAMP,
  period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 核心服务

### 1. 订阅同步服务
```typescript
export class SubscriptionSyncService {
  async syncFromStripe(stripeSubscriptionId: string);
  async updateUserSubscriptionStatus(userId: number);
  async handleSubscriptionEvent(event: Stripe.Event);
}
```

### 2. 权限检查服务
```typescript
export class SubscriptionPermissionService {
  async checkFeatureAccess(userId: number, featureId: string);
  async checkUsageLimit(userId: number, resourceType: string);
  async incrementUsage(userId: number, resourceType: string);
}
```

### 3. 使用量管理服务
```typescript
export class UsageTrackingService {
  async getCurrentUsage(userId: number, resourceType: string);
  async resetMonthlyUsage(userId: number);
  async getUsageAnalytics(userId: number);
}
```

## 🎯 业务价值

### 1. AI功能控制
- **聊天限制**: Basic 10次/天, Pro 100次/天, Premium 无限
- **模型访问**: Free用户只能用基础模型
- **功能解锁**: 高级订阅解锁特殊AI能力

### 2. 用户体验优化
- **实时权限检查**: < 10ms vs Stripe API 300ms+
- **使用量显示**: 用户可查看剩余额度
- **平滑升级**: 引导用户升级订阅

### 3. 商业分析
- **收入追踪**: MRR/ARR实时计算
- **用户行为**: 使用模式分析
- **转化优化**: 识别升级触发点

## 📈 实施步骤

### Step 1: 数据库迁移
```bash
npm run db:generate  # 生成迁移文件
npm run db:migrate   # 执行迁移
```

### Step 2: 服务开发
```bash
# 创建核心服务
mkdir -p src/libs/subscription
touch src/libs/subscription/SubscriptionSyncService.ts
touch src/libs/subscription/PermissionService.ts
touch src/libs/subscription/UsageTrackingService.ts
```

### Step 3: Webhook集成
```bash
# 扩展现有webhook处理
# 在 src/app/api/webhooks/stripe/route.ts 中添加数据库同步
```

### Step 4: 中间件集成
```bash
# 创建权限检查中间件
touch src/middleware/subscriptionAuth.ts
```

## ⚠️ 风险和注意事项

### 技术风险
- **数据一致性**: Stripe和本地数据库可能不同步
- **性能影响**: 每次API调用都要查数据库
- **迁移风险**: 现有用户数据需要妥善处理

### 缓解措施
- **定期同步**: 每小时对比Stripe数据
- **缓存策略**: Redis缓存权限检查结果
- **优雅降级**: 数据库出错时回退到Stripe API

## 🔗 相关资源

- [Drizzle ORM迁移指南](https://orm.drizzle.team/docs/migrations)
- [Stripe Webhooks最佳实践](https://stripe.com/docs/webhooks/best-practices)
- [PostgreSQL行级安全](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

**创建时间**: 2025-07-20
**预计完成**: 2025-07-21
**责任人**: AI Assistant
