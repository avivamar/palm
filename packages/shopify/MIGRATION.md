# 迁移指南：从 src/libs/shopify 到 @rolitt/shopify

本指南帮助您从旧的 Shopify 集成（`src/libs/shopify`）迁移到新的独立包（`@rolitt/shopify`）。

## 📋 迁移步骤

### 1. 安装新包

```bash
# 在项目根目录
cd /path/to/your/project

# 如果使用 npm workspaces
npm install @rolitt/shopify@file:./packages/shopify

# 或者直接链接本地包
cd packages/shopify
npm link
cd ../../
npm link @rolitt/shopify
```

### 2. 更新环境变量

确保您的 `.env.local` 文件包含所有必要的 Shopify 配置：

```env
# 从 .env.example 复制并填写实际值
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxx
SHOPIFY_API_VERSION=2025-01
# ... 其他配置
```

### 3. 更新导入语句

#### 旧的导入方式：
```typescript
import { ShopifyAdminClient } from '@/libs/shopify/core/client';
import { OrderSyncService } from '@/libs/shopify/sync/orders';
import { ProductSyncService } from '@/libs/shopify/sync/products';
```

#### 新的导入方式：
```typescript
import { OrderService, ProductService, ShopifyIntegration } from '@rolitt/shopify';
```

### 4. 更新代码使用

#### 旧的使用方式：
```typescript
// 获取客户端
const client = ShopifyAdminClient.getInstance();

// 使用服务
const productSync = new ProductSyncService();
await productSync.syncAllProducts();

const orderSync = new OrderSyncService();
await orderSync.syncOrderToShopify(orderId);
```

#### 新的使用方式：
```typescript
// 初始化集成
const shopify = new ShopifyIntegration();

// 使用服务
const productService = shopify.getProductService();
await productService.syncAllProducts();

const orderService = shopify.getOrderService();
await orderService.syncOrder(orderData);
```

### 5. 更新 API 路由

#### 旧的 API 路由：
```typescript
// app/api/shopify/sync/route.ts
import { ShopifyAdminClient } from '@/libs/shopify/core/client';

export async function POST(request: Request) {
  const client = ShopifyAdminClient.getInstance();
  // ... 处理逻辑
}
```

#### 新的 API 路由：
```typescript
// app/api/shopify/[...path]/route.ts
import { createShopifyApiRoute } from '@rolitt/shopify/next';

export const { GET, POST, PUT, DELETE } = createShopifyApiRoute();
```

### 6. 更新 Webhook 处理

#### 旧的 Webhook 处理：
```typescript
// 手动处理 webhook 验证和路由
```

#### 新的 Webhook 处理：
```typescript
// 已经包含在 createShopifyApiRoute 中
// 自动处理验证和路由
```

## 🔧 配置迁移

### 功能开关对照表

| 旧配置 | 新配置 | 说明 |
|--------|--------|------|
| `SHOPIFY_FEATURES.ENABLED` | `SHOPIFY_INTEGRATION_ENABLED` | 主开关 |
| `SHOPIFY_FEATURES.PRODUCT_SYNC` | `SHOPIFY_PRODUCT_SYNC` | 产品同步 |
| `SHOPIFY_FEATURES.ORDER_SYNC` | `SHOPIFY_ORDER_SYNC` | 订单同步 |
| `SHOPIFY_FEATURES.INVENTORY_SYNC` | `SHOPIFY_INVENTORY_SYNC` | 库存同步 |
| `SHOPIFY_FEATURES.CUSTOMER_SYNC` | `SHOPIFY_CUSTOMER_SYNC` | 客户同步 |
| `SHOPIFY_FEATURES.WEBHOOK_PROCESSING` | `SHOPIFY_WEBHOOKS` | Webhook 处理 |

## 🚨 重要变更

### 1. 数据库依赖
新包不再直接依赖项目的数据库。您需要：
- 在调用同步服务时，传入数据
- 处理返回的结果并自行更新数据库

### 2. 错误处理
新包使用统一的错误格式：
```typescript
{
  success: boolean;
  error?: string;
  // ... 其他数据
}
```

### 3. 类型定义
所有类型现在都从 `@rolitt/shopify` 导出：
```typescript
import type {
  OrderSyncResult,
  ProductSyncResult,
  ShopifyOrder,
  ShopifyProduct
} from '@rolitt/shopify';
```

## 📝 迁移清单

- [ ] 备份现有代码
- [ ] 安装新包
- [ ] 更新环境变量
- [ ] 更新所有导入语句
- [ ] 更新服务初始化代码
- [ ] 更新 API 路由
- [ ] 测试产品同步功能
- [ ] 测试订单同步功能
- [ ] 测试 Webhook 处理
- [ ] 更新相关文档
- [ ] 删除旧的 `src/libs/shopify` 目录

## 🆘 常见问题

### Q: 如何处理自定义的同步逻辑？
A: 您可以扩展服务类或在调用服务方法前后添加自定义逻辑。

### Q: 如何访问原始的 Shopify 客户端？
A: 使用 `shopify.getClient()` 获取原始客户端实例。

### Q: 如何添加新的 Webhook 处理器？
A: 扩展 `WebhookHandler` 类并覆盖相应的处理方法。

## 📞 支持

如果在迁移过程中遇到问题，请：
1. 查看包的 README.md 文档
2. 检查类型定义获取更多信息
3. 提交 issue 到项目仓库
