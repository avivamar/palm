# Stripe 产品管理指南

## 📋 概述

本指南帮助你配置和管理 Stripe 产品，消除手动配置颜色的出错可能。

## 🚀 快速开始

### 1. 检查当前配置

```bash
npm run stripe:check
```

这个命令会显示：
- ✅ Stripe 连接状态
- 📦 现有产品配置
- 💰 价格设置
- ⚠️  配置建议

### 2. 自动同步产品（推荐）

```bash
npm run stripe:sync
```

这个脚本会：
- 🔍 查找现有 Rolitt 产品
- 📦 创建产品（如果不存在）
- 💰 为所有颜色创建价格
- ⚙️  更新环境变量
- ✅ 验证配置完整性

### 3. 验证配置

```bash
npm run stripe:validate
```

## 📦 产品配置详情

### 支持的颜色
- Honey Khaki
- Sakura Pink
- Healing Green
- Moonlight Grey
- Red

### 价格设置
- 统一价格：$299.00 USD
- 每个颜色都有独立的 Price ID
- 支持 Stripe Checkout 集成

## 🔧 环境变量配置

脚本会自动更新 `.env.local` 中的以下变量：

```bash
# Stripe 产品配置
STRIPE_PRODUCT_ID="prod_xxxxxxxxxx"
COLOR_PRICE_MAP_JSON='{"Honey Khaki":"price_xxx","Sakura Pink":"price_yyy",...}'
```

## 📁 文件结构

```
scripts/
├── stripe-sync.ts       # 主同步脚本
└── check-stripe.js      # 配置检查脚本

src/app/actions/
└── productActions.ts    # 产品数据获取逻辑
```

## 🔄 工作流程

### 开发环境
1. 确保 Stripe 测试密钥已配置
2. 运行 `npm run stripe:sync`
3. 测试产品页面：`npm run dev`
4. 验证购买流程

### 生产环境
1. 配置 Stripe 生产密钥
2. 运行 `npm run stripe:sync`
3. 部署应用
4. 运行 `npm run stripe:check` 验证

## 🛡️ 安全注意事项

- ✅ 脚本只使用必要的 Stripe 权限
- ✅ 环境变量不会覆盖现有重要配置
- ✅ 支持测试和生产环境隔离
- ✅ 自动备份现有配置

## 🐛 故障排除

### 问题：Stripe 连接失败
```bash
❌ Stripe 连接失败: Invalid API Key
```
**解决方案**：检查 `STRIPE_SECRET_KEY` 是否正确配置

### 问题：产品创建失败
```bash
❌ 产品创建失败: Product already exists
```
**解决方案**：运行 `npm run stripe:check` 查看现有产品

### 问题：环境变量未更新
```bash
❌ 环境变量保存失败
```
**解决方案**：确保 `.env.local` 文件有写入权限

## 📊 配置验证

运行 `npm run stripe:check` 后，你应该看到：

```
🔍 检查 Stripe 配置...

📋 必需配置:
✅ STRIPE_SECRET_KEY: sk_test_...
✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: pk_test_...

📋 可选配置:
✅ STRIPE_PRODUCT_ID: prod_...
✅ COLOR_PRICE_MAP_JSON: 5 个颜色配置

🔗 测试 Stripe 连接...
✅ Stripe 连接成功: Rolitt

📦 检查产品配置...
✅ 产品存在: Rolitt AI Companion
✅ 找到 5 个价格
   - Honey Khaki: $299.00 (price_xxx)
   - Sakura Pink: $299.00 (price_yyy)
   - ...
```

## 🎯 最佳实践

1. **定期同步**：在产品更新后运行同步脚本
2. **备份配置**：保存重要的 Stripe 配置
3. **测试流程**：每次更改后测试完整购买流程
4. **监控日志**：关注构建和运行时日志
5. **版本控制**：不要将 `.env.local` 提交到 Git

## 🔗 相关资源

- [Stripe 产品文档](https://stripe.com/docs/api/products)
- [Stripe 价格文档](https://stripe.com/docs/api/prices)
- [Next.js 环境变量](https://nextjs.org/docs/basic-features/environment-variables)

---

**更新时间**: 2025-07-12
**版本**: 1.0
