# Task 008: 迁移共享类型定义

> **目标**：将各包中重复的类型定义迁移到 `@rolitt/shared`，消除重复代码

---

## 📋 任务概述

**前置条件**：Task 001-007 已完成
**当前状态**：各包中存在重复的类型定义
**目标状态**：类型定义统一管理，消除重复
**预计时间**：25 分钟
**风险等级**：中

---

## 🎯 执行步骤

### Step 1: 分析现有类型定义

#### 1.1 搜索重复类型
```bash
# 搜索常见类型定义
grep -r "interface User" packages/
grep -r "interface Module" packages/
grep -r "type.*Status" packages/
grep -r "interface.*Response" packages/
```

#### 1.2 识别可迁移的类型
**常见重复类型**：
- User 相关类型
- API 响应类型
- 状态枚举类型
- 分页相关类型
- 错误处理类型

### Step 2: 迁移 Admin 包类型

#### 2.1 分析 Admin 包现有类型
**查看文件**：`packages/admin/src/types/index.ts`

#### 2.2 迁移到 Shared 包
**将以下类型迁移到 `packages/shared/src/types/`**：

```typescript
// 从 packages/admin/src/types/index.ts 迁移
export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type ModuleState = {
  modules: Module[];
  loading: boolean;
  error: string | null;
};

// 迁移到 packages/shared/src/types/admin.ts
```

#### 2.3 更新 Admin 包导入
**文件路径**：`packages/admin/src/types/index.ts`

```typescript
// 从 shared 包导入通用类型
import type {
  AdminUser,
  ApiResponse,
  ModuleState,
  PaginatedResponse
} from '@rolitt/shared';

// 重新导出
export type { AdminUser, ModuleState };

// 保留 Admin 包特有的类型
export type AdminDashboardStats = {
  totalUsers: number;
  activeModules: number;
  systemHealth: 'good' | 'warning' | 'critical';
};

export type AdminSettings = {
  siteName: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  emailNotifications: boolean;
};
```

### Step 3: 迁移 Shopify 包类型

#### 3.1 创建 Shopify 特定类型
**文件路径**：`packages/shared/src/types/shopify.ts`

```typescript
import { BaseEntity } from './index';

export type ShopifyProduct = {
  shopifyId: string;
  title: string;
  description: string;
  vendor: string;
  productType: string;
  handle: string;
  status: 'active' | 'archived' | 'draft';
  variants: ShopifyVariant[];
  images: ShopifyImage[];
  tags: string[];
} & BaseEntity;

export type ShopifyVariant = {
  id: string;
  shopifyId: string;
  title: string;
  price: string;
  compareAtPrice?: string;
  sku?: string;
  inventoryQuantity: number;
  weight: number;
  weightUnit: string;
};

export type ShopifyImage = {
  id: string;
  shopifyId: string;
  src: string;
  alt?: string;
  position: number;
};

export type ShopifyOrder = {
  shopifyId: string;
  orderNumber: string;
  email: string;
  totalPrice: string;
  subtotalPrice: string;
  totalTax: string;
  currency: string;
  financialStatus: ShopifyFinancialStatus;
  fulfillmentStatus: ShopifyFulfillmentStatus;
  lineItems: ShopifyLineItem[];
  shippingAddress?: ShopifyAddress;
  billingAddress?: ShopifyAddress;
} & BaseEntity;

export type ShopifyFinancialStatus
  = | 'pending'
    | 'authorized'
    | 'partially_paid'
    | 'paid'
    | 'partially_refunded'
    | 'refunded'
    | 'voided';

export type ShopifyFulfillmentStatus
  = | 'fulfilled'
    | 'partial'
    | 'restocked'
    | null;

export type ShopifyLineItem = {
  id: string;
  shopifyId: string;
  variantId: string;
  title: string;
  quantity: number;
  price: string;
  totalDiscount: string;
};

export type ShopifyAddress = {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone?: string;
};

export type ShopifyWebhook = {
  id: string;
  topic: string;
  address: string;
  format: 'json' | 'xml';
  createdAt: Date;
  updatedAt: Date;
};

export type ShopifyStore = {
  id: string;
  name: string;
  domain: string;
  email: string;
  currency: string;
  timezone: string;
  planName: string;
  createdAt: Date;
};
```

#### 3.2 更新 Shopify 包导入
**文件路径**：`packages/shopify/src/types/index.ts`

```typescript
// 从 shared 包导入
import type {
  ApiResponse,
  PaginatedResponse,
  ShopifyOrder,
  ShopifyProduct,
  ShopifyStore,
  ShopifyVariant,
  ShopifyWebhook
} from '@rolitt/shared';

// 重新导出
export type {
  ShopifyOrder,
  ShopifyProduct,
  ShopifyStore,
  ShopifyVariant,
  ShopifyWebhook
};

// Shopify 包特有的类型
export type ShopifyConfig = {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  shopDomain: string;
  webhookSecret: string;
};

export type ShopifySync = {
  lastSyncAt: Date;
  status: 'idle' | 'syncing' | 'error';
  progress: number;
  error?: string;
};
```

### Step 4: 迁移 Auth 包类型

#### 4.1 更新 Auth 包类型
**文件路径**：`packages/auth/src/types/index.ts`

```typescript
// 从 shared 包导入认证相关类型
import type {
  ApiResponse,
  AuthState,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  User
} from '@rolitt/shared';

// 重新导出
export type {
  AuthState,
  AuthTokens,
  LoginCredentials,
  RegisterData,
  User
};

// Auth 包特有的类型
export type AuthConfig = {
  jwtSecret: string;
  tokenExpiry: number;
  refreshTokenExpiry: number;
  bcryptRounds: number;
};

export type SessionData = {
  userId: string;
  email: string;
  role: string;
  expiresAt: Date;
};

export type PasswordResetRequest = {
  email: string;
  token: string;
  expiresAt: Date;
};
```

### Step 5: 迁移 Email 包类型

#### 5.1 创建 Email 类型
**文件路径**：`packages/shared/src/types/email.ts`

```typescript
export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: EmailVariable[];
  createdAt: Date;
  updatedAt: Date;
};

export type EmailVariable = {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  required: boolean;
  defaultValue?: any;
  description?: string;
};

export type EmailMessage = {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: EmailAttachment[];
};

export type EmailAttachment = {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  encoding?: string;
};

export type EmailLog = {
  id: string;
  to: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  error?: string;
  sentAt?: Date;
  createdAt: Date;
};
```

#### 5.2 更新 Email 包导入
**文件路径**：`packages/email/src/types/index.ts`

```typescript
// 从 shared 包导入
import type {
  ApiResponse,
  EmailLog,
  EmailMessage,
  EmailTemplate
} from '@rolitt/shared';

// 重新导出
export type {
  EmailLog,
  EmailMessage,
  EmailTemplate
};

// Email 包特有的类型
export type EmailProvider = {
  name: string;
  config: EmailProviderConfig;
  enabled: boolean;
};

export type EmailProviderConfig = {
  host?: string;
  port?: number;
  secure?: boolean;
  auth?: {
    user: string;
    pass: string;
  };
  apiKey?: string;
};
```

### Step 6: 迁移 Payments 包类型

#### 6.1 创建 Payments 类型
**文件路径**：`packages/shared/src/types/payments.ts`

```typescript
import { BaseEntity } from './index';

export type Payment = {
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  providerId: string;
  providerPaymentId?: string;
  description?: string;
  metadata?: Record<string, any>;
} & BaseEntity;

export type PaymentStatus
  = | 'pending'
    | 'processing'
    | 'succeeded'
    | 'failed'
    | 'canceled'
    | 'refunded';

export type PaymentMethod
  = | 'card'
    | 'bank_transfer'
    | 'paypal'
    | 'stripe'
    | 'apple_pay'
    | 'google_pay';

export type PaymentProvider = {
  id: string;
  name: string;
  type: PaymentMethod;
  config: PaymentProviderConfig;
  enabled: boolean;
};

export type PaymentProviderConfig = {
  apiKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  environment: 'sandbox' | 'production';
  [key: string]: any;
};

export type Subscription = {
  customerId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  trialStart?: Date;
  trialEnd?: Date;
} & BaseEntity;

export type SubscriptionStatus
  = | 'active'
    | 'canceled'
    | 'incomplete'
    | 'incomplete_expired'
    | 'past_due'
    | 'trialing'
    | 'unpaid';
```

### Step 7: 更新 Shared 包导出

**文件路径**：`packages/shared/src/types/index.ts`

```typescript
export * from './admin';
export * from './api';
// 基础类型
export * from './auth';
export * from './email';
export * from './module';
export * from './payments';
export * from './shopify';
export * from './user';

// 通用类型保持不变...
```

### Step 8: 批量更新导入语句

#### 8.1 创建迁移脚本
**文件路径**：`scripts/migrate-types.js`

```javascript
const fs = require('node:fs');
const path = require('node:path');

// 类型迁移映射
const typeMigrations = {
  AdminUser: '@rolitt/shared',
  ModuleState: '@rolitt/shared',
  User: '@rolitt/shared',
  AuthState: '@rolitt/shared',
  ApiResponse: '@rolitt/shared',
  PaginatedResponse: '@rolitt/shared',
  ShopifyProduct: '@rolitt/shared',
  ShopifyOrder: '@rolitt/shared',
  EmailTemplate: '@rolitt/shared',
  Payment: '@rolitt/shared',
};

function updateImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let updatedContent = content;

  // 更新类型导入
  Object.entries(typeMigrations).forEach(([typeName, packageName]) => {
    // 匹配单独的类型导入
    const singleImportRegex = new RegExp(
      `import\\s+{\\s*${typeName}\\s*}\\s+from\\s+['"][^'"]+['"];?`,
      'g'
    );

    // 替换为从 shared 包导入
    updatedContent = updatedContent.replace(
      singleImportRegex,
      `import { ${typeName} } from '${packageName}';`
    );
  });

  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent);
    console.log(`✅ 更新 ${filePath}`);
  }
}

function migrateTypes() {
  console.log('🔄 开始迁移类型定义...');

  const packagesDir = './packages';
  const packages = fs.readdirSync(packagesDir);

  packages.forEach((pkg) => {
    if (pkg === 'shared') {
      return;
    } // 跳过 shared 包

    const packagePath = path.join(packagesDir, pkg);
    const srcPath = path.join(packagePath, 'src');

    if (fs.existsSync(srcPath)) {
      // 递归处理所有 .ts 和 .tsx 文件
      const processDirectory = (dir) => {
        const files = fs.readdirSync(dir);

        files.forEach((file) => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory()) {
            processDirectory(filePath);
          } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            updateImports(filePath);
          }
        });
      };

      processDirectory(srcPath);
    }
  });

  console.log('✅ 类型迁移完成！');
}

if (require.main === module) {
  migrateTypes();
}

module.exports = { migrateTypes };
```

#### 8.2 运行迁移脚本
```bash
node scripts/migrate-types.js
```

---

## ✅ 验收标准

- [ ] 重复类型定义已迁移到 Shared 包
- [ ] 各包正确导入 Shared 包中的类型
- [ ] 包特有的类型保留在各自包中
- [ ] 迁移脚本创建完成
- [ ] 执行 `npm run type-check` 成功
- [ ] 执行 `npm run build:packages` 成功
- [ ] 没有类型错误或导入错误

---

## 🧪 测试验证

```bash
# 运行类型迁移
node scripts/migrate-types.js

# 验证类型检查
npm run type-check

# 验证各包构建
npm run build:packages

# 检查是否还有重复类型
grep -r "interface User" packages/ | grep -v shared
grep -r "interface Module" packages/ | grep -v shared

# 验证导入是否正确
grep -r "@rolitt/shared" packages/
```

---

## 🔄 回滚方案

```bash
# 恢复原有类型定义
git checkout packages/*/src/types/

# 删除迁移脚本
rm scripts/migrate-types.js
```

---

## 📝 注意事项

1. **渐进迁移**：一次迁移一个类型，确保不破坏现有功能
2. **保持兼容**：确保迁移后的类型与原有类型完全兼容
3. **文档更新**：更新相关文档说明新的导入方式
4. **测试覆盖**：确保所有使用迁移类型的代码都经过测试
5. **版本管理**：考虑类型的版本兼容性

---

**🎯 完成此任务后，继续执行 Task 009: 更新包间依赖关系**
