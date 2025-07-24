# Shopify 集成重构计划

## 🎯 核心问题分析

### 当前架构问题
1. **双重实现**：`src/libs/shopify/` 和 `packages/shopify/` 功能重复
2. **配置分散**：配置管理在多个地方，容易不一致
3. **类型不统一**：两套类型定义，增加维护成本
4. **依赖混乱**：主应用同时依赖两套实现

## 🏗️ 重构方案

### Phase 1: 代码统一 (1-2天)

#### 1.1 移除旧实现
```bash
# 删除旧的 Shopify 实现
rm -rf src/libs/shopify/

# 更新所有导入引用
# 从: import { ShopifyAdminClient } from '@/libs/shopify/core/client'
# 到: import { ShopifyClient } from '@rolitt/shopify'
```

#### 1.2 统一配置管理
```typescript
// packages/shopify/src/config/unified-config.ts
export const createShopifyConfig = () => {
  return validateConfig({
    storeDomain: process.env.SHOPIFY_STORE_DOMAIN,
    adminAccessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
    apiVersion: process.env.SHOPIFY_API_VERSION || '2025-01',
    features: {
      enabled: process.env.SHOPIFY_INTEGRATION_ENABLED === 'true',
      productSync: process.env.SHOPIFY_PRODUCT_SYNC !== 'false',
      orderSync: process.env.SHOPIFY_ORDER_SYNC !== 'false',
      inventorySync: process.env.SHOPIFY_INVENTORY_SYNC !== 'false',
      webhooks: process.env.SHOPIFY_WEBHOOKS !== 'false',
    },
    security: {
      webhookSecret: process.env.SHOPIFY_WEBHOOK_SECRET,
      enforceHttps: process.env.NODE_ENV === 'production',
      rateLimitStrategy: 'balanced',
    }
  });
};
```

### Phase 2: 业务逻辑完善 (2-3天)

#### 2.1 完善支付集成
```typescript
// packages/shopify/src/integration/payment-integration.ts
export class PaymentIntegrationService {
  async handleStripeWebhook(event: Stripe.Event): Promise<OrderSyncResult> {
    // 1. 验证 webhook 签名
    // 2. 提取订单数据
    // 3. 转换为 Shopify 格式
    // 4. 同步到 Shopify
    // 5. 更新本地状态
  }
  
  async syncOrderToShopify(orderData: RolittOrder): Promise<OrderSyncResult> {
    // 完整的订单同步逻辑
  }
}
```

#### 2.2 数据库集成实现
```typescript
// packages/shopify/src/integration/database-integration.ts
export class DatabaseIntegrationService {
  async syncOrderStatus(orderId: string, shopifyData: any): Promise<void> {
    // 更新数据库中的订单状态
    await db.update(preorders)
      .set({
        shopifyOrderId: shopifyData.id,
        shopifyOrderNumber: shopifyData.order_number,
        syncStatus: 'synced',
        syncedAt: new Date(),
      })
      .where(eq(preorders.id, orderId));
  }
}
```

### Phase 3: 安全加固 (1天)

#### 3.1 环境变量验证
```typescript
// packages/shopify/src/config/security.ts
export const securityValidation = {
  validateToken: (token: string) => {
    if (!token.startsWith('shpat_')) {
      throw new Error('Invalid Shopify admin token format');
    }
    if (token.length < 32) {
      throw new Error('Shopify admin token too short');
    }
  },
  
  validateDomain: (domain: string) => {
    if (!domain.endsWith('.myshopify.com')) {
      throw new Error('Invalid Shopify domain format');
    }
  },
  
  validateWebhookSecret: (secret?: string) => {
    if (process.env.NODE_ENV === 'production' && !secret) {
      throw new Error('Webhook secret is required in production');
    }
  }
};
```

#### 3.2 Webhook 签名验证
```typescript
// packages/shopify/src/webhooks/verification.ts
export const verifyWebhookSignature = (
  rawBody: string,
  signature: string,
  secret: string
): boolean => {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawBody, 'utf8');
  const calculatedSignature = hmac.digest('base64');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'base64'),
    Buffer.from(calculatedSignature, 'base64')
  );
};
```

## 🔄 迁移步骤

### Step 1: 准备工作
1. 备份当前实现
2. 创建迁移分支
3. 更新包依赖

### Step 2: 代码迁移
1. 统一所有导入语句
2. 更新类型定义
3. 测试基础功能

### Step 3: 功能完善
1. 实现缺失的业务逻辑
2. 添加安全验证
3. 完善错误处理

### Step 4: 测试验证
1. 单元测试
2. 集成测试
3. 端到端测试

## 📊 预期收益

### 代码质量提升
- 消除重复代码 ~40%
- 统一类型定义
- 提高可维护性

### 安全性增强
- 严格的环境变量验证
- 完整的 Webhook 签名验证
- 生产环境安全检查

### 开发效率提升
- 单一真实来源
- 清晰的 API 接口
- 完善的错误处理

## ⚠️ 风险评估

### 高风险
- 现有功能可能暂时中断
- 需要全面测试验证

### 中风险  
- 配置迁移可能遗漏
- 类型定义需要适配

### 低风险
- 包依赖更新
- 文档需要更新

## 🎯 成功标准

1. ✅ 所有 Shopify 功能正常工作
2. ✅ 代码重复率 < 5%
3. ✅ 测试覆盖率 > 80%
4. ✅ 安全检查全部通过
5. ✅ 性能无明显下降