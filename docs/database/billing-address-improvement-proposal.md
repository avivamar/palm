# Billing Address 可读性改进方案

## 📋 问题描述

当前 `preorders` 表中的 `billing_address` 字段以 JSON 格式存储，例如：

```json
{
  "name": "fuq ma",
  "email": "yaerma@vip.qq.com",
  "phone": null,
  "address": {
    "city": null,
    "line1": "1111B S Governors Ave",
    "line2": null,
    "state": null,
    "country": "SG",
    "postal_code": "19904"
  },
  "tax_ids": [],
  "tax_exempt": "none"
}
```

这种格式虽然灵活，但在数据库查询和管理界面中可读性较差。

## 🎯 改进方案

### 方案一：添加扁平化字段（推荐）

在保留原有 `billingAddress` JSON 字段的同时，添加常用的扁平化字段，便于查询和显示：

#### 1. 数据库 Schema 修改

```typescript
// src/models/Schema.ts
export const preordersSchema = pgTable('preorders', {
  // ... 现有字段

  // 原有 JSON 字段（保留）
  billingAddress: jsonb('billing_address'),

  // 新增扁平化字段
  billingName: text('billing_name'),
  billingEmail: text('billing_email'),
  billingPhone: text('billing_phone'),
  billingAddressLine1: text('billing_address_line1'),
  billingAddressLine2: text('billing_address_line2'),
  billingCity: text('billing_city'),
  billingState: text('billing_state'),
  billingCountry: text('billing_country'),
  billingPostalCode: text('billing_postal_code'),

  // ... 其他字段
});
```

#### 2. 数据迁移脚本

```sql
-- 添加新字段
ALTER TABLE "preorders" ADD COLUMN "billing_name" text;
ALTER TABLE "preorders" ADD COLUMN "billing_email" text;
ALTER TABLE "preorders" ADD COLUMN "billing_phone" text;
ALTER TABLE "preorders" ADD COLUMN "billing_address_line1" text;
ALTER TABLE "preorders" ADD COLUMN "billing_address_line2" text;
ALTER TABLE "preorders" ADD COLUMN "billing_city" text;
ALTER TABLE "preorders" ADD COLUMN "billing_state" text;
ALTER TABLE "preorders" ADD COLUMN "billing_country" text;
ALTER TABLE "preorders" ADD COLUMN "billing_postal_code" text;

-- 从现有 JSON 数据中提取并填充新字段
UPDATE "preorders"
SET
  "billing_name" = billing_address->>'name',
  "billing_email" = billing_address->>'email',
  "billing_phone" = billing_address->>'phone',
  "billing_address_line1" = billing_address->'address'->>'line1',
  "billing_address_line2" = billing_address->'address'->>'line2',
  "billing_city" = billing_address->'address'->>'city',
  "billing_state" = billing_address->'address'->>'state',
  "billing_country" = billing_address->'address'->>'country',
  "billing_postal_code" = billing_address->'address'->>'postal_code'
WHERE billing_address IS NOT NULL;
```

#### 3. 更新写入逻辑

```typescript
// src/app/actions/preorderActions.ts
export async function createUserAndLinkPreorder(
  preorderId: string,
  paymentData: {
    email: string;
    sessionId: string;
    paymentIntentId: string;
    amount: string;
    currency: string;
    shippingAddress?: any;
    billingAddress?: any;
  },
): Promise<{ success: boolean; userId?: string; error?: string }> {
  // ... 现有逻辑

  // 提取 billing address 信息
  const billingInfo = billingAddress
    ? {
        billingName: billingAddress.name,
        billingEmail: billingAddress.email,
        billingPhone: billingAddress.phone,
        billingAddressLine1: billingAddress.address?.line1,
        billingAddressLine2: billingAddress.address?.line2,
        billingCity: billingAddress.address?.city,
        billingState: billingAddress.address?.state,
        billingCountry: billingAddress.address?.country,
        billingPostalCode: billingAddress.address?.postal_code,
      }
    : {};

  // 更新 preorder
  await db.update(preordersSchema)
    .set({
      userId,
      status: 'completed',
      sessionId,
      paymentIntentId,
      amount,
      currency,
      shippingAddress,
      billingAddress, // 保留原有 JSON
      ...billingInfo, // 添加扁平化字段
      updatedAt: new Date(),
    })
    .where(eq(preordersSchema.id, preorderId));
}
```

#### 4. 创建视图函数

```typescript
// src/libs/database/preorder-utils.ts
export function formatBillingAddress(preorder: any): string {
  if (!preorder.billingName && !preorder.billingAddressLine1) {
    return 'N/A';
  }

  const parts = [];

  if (preorder.billingName) {
    parts.push(`👤 ${preorder.billingName}`);
  }

  if (preorder.billingEmail) {
    parts.push(`📧 ${preorder.billingEmail}`);
  }

  if (preorder.billingPhone) {
    parts.push(`📞 ${preorder.billingPhone}`);
  }

  const addressParts = [
    preorder.billingAddressLine1,
    preorder.billingAddressLine2,
    preorder.billingCity,
    preorder.billingState,
    preorder.billingPostalCode,
    preorder.billingCountry,
  ].filter(Boolean);

  if (addressParts.length > 0) {
    parts.push(`🏠 ${addressParts.join(', ')}`);
  }

  return parts.join('\n');
}

export function getBillingAddressSummary(preorder: any): string {
  const name = preorder.billingName || 'Unknown';
  const country = preorder.billingCountry || 'Unknown';
  const city = preorder.billingCity || 'Unknown';

  return `${name} - ${city}, ${country}`;
}
```

### 方案二：创建专门的地址表

如果需要更规范的数据结构，可以创建独立的地址表：

```typescript
// 创建地址表
export const addressesSchema = pgTable('addresses', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'billing' | 'shipping'
  name: text('name'),
  email: text('email'),
  phone: text('phone'),
  line1: text('line1'),
  line2: text('line2'),
  city: text('city'),
  state: text('state'),
  country: text('country'),
  postalCode: text('postal_code'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow(),
});

// 在 preorders 表中引用
export const preordersSchema = pgTable('preorders', {
  // ... 现有字段
  billingAddressId: text('billing_address_id').references(() => addressesSchema.id),
  shippingAddressId: text('shipping_address_id').references(() => addressesSchema.id),
  // ...
});
```

## 🎯 推荐实施步骤

### 第一阶段：添加扁平化字段（方案一）

1. **生成数据库迁移**
   ```bash
   npm run db:generate
   ```

2. **更新 Schema.ts**
   - 添加新的扁平化字段
   - 保留原有 `billingAddress` JSON 字段

3. **创建数据迁移脚本**
   - 从现有 JSON 数据中提取信息
   - 填充新的扁平化字段

4. **更新应用逻辑**
   - 修改 `createUserAndLinkPreorder` 函数
   - 同时写入 JSON 和扁平化字段

5. **创建工具函数**
   - 格式化显示函数
   - 地址摘要函数

### 第二阶段：优化查询和显示

1. **更新管理界面**
   - 使用扁平化字段进行查询
   - 改善地址信息的显示格式

2. **添加索引**
   ```sql
   CREATE INDEX idx_preorders_billing_country ON preorders(billing_country);
   CREATE INDEX idx_preorders_billing_email ON preorders(billing_email);
   ```

3. **创建视图**
   ```sql
   CREATE VIEW preorders_with_formatted_address AS
   SELECT
     *,
     CONCAT_WS(', ',
       billing_name,
       billing_address_line1,
       billing_city,
       billing_country
     ) AS formatted_billing_address
   FROM preorders;
   ```

## 📊 优势对比

| 特性 | 当前方案 | 改进方案 |
|------|----------|----------|
| 数据完整性 | ✅ 完整 | ✅ 完整（JSON + 扁平化） |
| 查询性能 | ❌ 需要 JSON 操作 | ✅ 直接字段查询 |
| 可读性 | ❌ JSON 格式难读 | ✅ 清晰的字段名 |
| 索引支持 | ❌ 有限 | ✅ 完整支持 |
| 管理界面友好 | ❌ 需要解析 JSON | ✅ 直接显示 |
| 向后兼容 | N/A | ✅ 保留原有字段 |

## 🔧 实施建议

1. **优先级**：高 - 显著改善数据可读性和查询性能
2. **风险**：低 - 保留原有数据结构，向后兼容
3. **工作量**：中等 - 需要数据库迁移和代码更新
4. **影响范围**：数据库、后端逻辑、管理界面

## 📝 后续优化

1. **地址验证**：集成地址验证服务
2. **地址标准化**：统一地址格式
3. **地理编码**：添加经纬度信息
4. **地址历史**：保留地址变更历史

---

*创建时间：2025-01-08*
*作者：AI Assistant*
*状态：待实施*
