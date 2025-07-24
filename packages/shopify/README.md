# @rolitt/shopify Package

## 📦 概述

`@rolitt/shopify` 是一个完全解耦的 Shopify 集成包，遵循与 `@rolitt/admin` 和 `@rolitt/auth` 相同的架构模式。该包提供了与 Shopify 平台的所有集成功能，包括产品同步、订单管理、库存控制等。

## 🏗️ 架构设计


## 技术参考资料：
https://context7.com/shopify/ui-extensions
https://context7.com/shopify/storefront-api-learning-kit
https://context7.com/webcomponents.shopify.dev/llmstxt
https://shopify.dev/docs/api
https://shopify.dev/docs/api/admin-graphql （2025-07 最新版）

### 核心原则

1. **完全解耦**：可以独立于主应用运行
2. **单向数据流**：数据只从 Rolitt 系统流向 Shopify
3. **插件化设计**：作为可选插件，可随时启用/禁用
4. **类型安全**：完整的 TypeScript 支持
5. **环境隔离**：独立的配置管理

### 目录结构

```
packages/shopify/
├── src/
│   ├── index.ts              # 包的主入口
│   ├── config/               # 配置管理
│   │   ├── index.ts
│   │   ├── validation.ts
│   │   └── feature-flags.ts
│   ├── core/                 # 核心功能
│   │   ├── client.ts         # Shopify API 客户端
│   │   ├── error-handler.ts  # 错误处理
│   │   ├── rate-limiter.ts   # API 限流
│   │   └── data-sanitizer.ts # 数据脱敏
│   ├── services/             # 业务服务
│   │   ├── products.ts       # 产品同步服务
│   │   ├── orders.ts         # 订单同步服务
│   │   ├── inventory.ts      # 库存管理服务
│   │   └── customers.ts      # 客户管理服务
│   ├── webhooks/             # Webhook 处理
│   │   ├── handlers/
│   │   ├── verification.ts
│   │   └── router.ts
│   ├── monitoring/           # 监控和健康检查
│   │   ├── health-check.ts
│   │   └── metrics.ts
│   ├── types/                # 类型定义
│   │   ├── index.ts
│   │   ├── api.ts
│   │   └── models.ts
│   └── utils/                # 工具函数
│       └── index.ts
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🚀 使用方法

### 安装

```bash
# 在主项目中
npm install @rolitt/shopify
```

### 基础配置

```typescript
// 在主应用中
import { ShopifyIntegration } from '@rolitt/shopify';

// 初始化
const shopify = new ShopifyIntegration({
  storeDomain: process.env.SHOPIFY_STORE_DOMAIN,
  adminAccessToken: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
  apiVersion: '2025-01',
  features: {
    productSync: true,
    orderSync: true,
    inventorySync: true,
    webhooks: true,
  },
});

// 使用服务
const productService = shopify.getProductService();
await productService.syncAllProducts();
```

### 在 Next.js 中集成

```typescript
// app/api/shopify/[...path]/route.ts
import { createShopifyHandler } from '@rolitt/shopify/next';

const handler = createShopifyHandler({
  // 配置选项
});

export { handler as GET, handler as POST };
```

## 🔧 环境变量

```env
# Shopify 基础配置
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxx
SHOPIFY_API_VERSION=2025-01

# 功能开关
SHOPIFY_INTEGRATION_ENABLED=true
SHOPIFY_PRODUCT_SYNC=true
SHOPIFY_ORDER_SYNC=true
SHOPIFY_INVENTORY_SYNC=true
SHOPIFY_WEBHOOKS=true

# 高级配置
SHOPIFY_WEBHOOK_SECRET=xxxxx
SHOPIFY_RATE_LIMIT_STRATEGY=balanced
SHOPIFY_BATCH_SIZE=50
SHOPIFY_SYNC_INTERVAL=300000
```

## 📡 API 参考

### ShopifyIntegration 类

主要的集成类，提供所有 Shopify 功能的入口。

```typescript
class ShopifyIntegration {
  constructor(config: ShopifyConfig);

  // 获取各种服务
  getProductService(): ProductService;
  getOrderService(): OrderService;
  getInventoryService(): InventoryService;
  getCustomerService(): CustomerService;

  // 健康检查
  healthCheck(): Promise<HealthCheckResult>;

  // 配置管理
  updateConfig(config: Partial<ShopifyConfig>): void;
  getConfig(): ShopifyConfig;
}
```

### ProductService

产品同步服务。

```typescript
class ProductService {
  // 同步所有产品
  syncAllProducts(): Promise<ProductSyncResult>;

  // 同步单个产品
  syncProduct(productId: string): Promise<SingleProductSyncResult>;

  // 批量同步
  batchSync(productIds: string[]): Promise<BatchSyncResult>;

  // 更新产品
  updateProduct(productId: string, data: ProductUpdateData): Promise<UpdateResult>;

  // 删除产品
  deleteProduct(productId: string): Promise<DeleteResult>;
}
```

### OrderService

订单管理服务。

```typescript
class OrderService {
  // 创建订单
  createOrder(orderData: OrderData): Promise<OrderCreateResult>;

  // 同步订单
  syncOrder(orderId: string): Promise<OrderSyncResult>;

  // 更新订单状态
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<StatusUpdateResult>;

  // 批量同步
  batchSyncOrders(orderIds: string[]): Promise<BatchOrderSyncResult>;
}
```

## 🧪 测试

```bash
# 运行单元测试
npm test

# 运行集成测试
npm run test:integration

# 运行特定测试
npm test -- --grep "ProductService"
```

## 🔄 迁移指南

### 从 src/libs/shopify 迁移

1. **安装新包**
   ```bash
   npm install @rolitt/shopify
   ```

2. **更新导入**
   ```typescript
   // 新的
   import { ShopifyClient } from '@rolitt/shopify';

   // 旧的
   import { ShopifyAdminClient } from '@/libs/shopify/core/client';
   ```

3. **更新配置**
   ```typescript
   // 旧的
   const client = ShopifyAdminClient.getInstance();

   // 新的
   const shopify = new ShopifyIntegration(config);
   const client = shopify.getClient();
   ```

4. **更新服务调用**
   ```typescript
   // 旧的
   const syncService = new ProductSyncService();

   // 新的
   const productService = shopify.getProductService();
   ```

## 📊 监控和调试

### 启用调试模式

```typescript
const shopify = new ShopifyIntegration({
  // ... 其他配置
  debug: true,
  logger: customLogger, // 可选：自定义日志记录器
});
```

### 查看指标

```typescript
const metrics = await shopify.getMetrics();
console.log(metrics);
// {
//   apiCalls: 1234,
//   syncedProducts: 456,
//   syncedOrders: 789,
//   errors: 12,
//   lastSync: '2025-01-13T10:00:00Z'
// }
```

## 🤝 贡献指南

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

## 📝 许可证

本项目采用私有许可证。详见 LICENSE 文件。
