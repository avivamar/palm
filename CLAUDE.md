# 产品开发规范 v4.0

基于 Next.js 15 的现代化手相学网站，包含了手相学的所有功能，集成完整的支付系统、用户管理、内容管理、Shopify集成、多语言邮件模板系统和8个独立功能包的Monorepo架构。
根目录下 readme.md 详细介绍了本项目，本文档旨在让 claude 更好的理解本项目的开发规范，以及如何参与本项目的开发。

## **设计哲学**: "商业价值优先，技术服务业务" - 每一个技术决策都有明确的商业回报
深度解耦，即插即用！less is more，如无必要勿增实体，可选择性启用，零技术分裂。

## **🎯 项目核心架构**

```json
{
  "name": "palm-official",
  "version": "4.0.0",
  "架构模式": "monorepo + dual-auth + async-payment + 8-workspace-packages",
  "核心技术": [
    "Next.js 15.3.4 (App Router) + React 19.0.0",
    "PostgreSQL (Supabase) + Drizzle ORM + Redis (Upstash)",
    "Supabase Auth (主) + Firebase Auth (容灾备份)",
    "Stripe API '2025-06-30.basil' + Shopify Admin API",
    "8个独立功能包: @rolitt/{payments,referral,image-upload,auth,email,shopify,admin,shared}",
    "shadcn/ui + Tailwind CSS 4 + Framer Motion",
    "TypeScript 5.0 Strict Mode + Zod 验证"
  ],
  "部署平台": ["Railway (主要)", "Vercel", "Cloudflare Workers"],
  "第三方集成": ["Klaviyo营销", "Notion内容", "PostHog分析", "Sentry监控"]
}
```

---

## **🏗️ 项目结构规范**

```
src/
├── app/[locale]/          # 国际化路由 (en|es|ja|zh-HK)
│   ├── (marketing)/       # 营销页面组
│   ├── (auth)/           # 认证页面组
│   └── admin/            # 管理后台
├── actions/              # Server Actions
│   ├── checkoutActions.ts    # 支付处理
│   ├── productActions.ts     # 产品管理
│   └── userActions.ts        # 用户管理
├── api/                  # API 路由
│   ├── webhooks/stripe/  # Stripe Webhook
│   ├── products/         # 产品 API
│   └── contact/          # 联系表单
├── components/           # UI 组件
│   ├── ui/              # shadcn/ui 基础组件
│   ├── analytics/       # 分析工具组件
│   ├── auth/            # 认证组件
│   ├── payments/        # 支付组件
│   └── pre-order/       # 预订组件
├── libs/                # 核心库
│   ├── supabase/        # Supabase 配置 (主认证)
│   ├── firebase/        # Firebase 配置 (容灾备份)
│   ├── payments/        # Stripe 支付系统
│   ├── DB.ts           # PostgreSQL 连接
│   ├── Env.ts          # 环境配置验证
│   ├── Klaviyo.ts      # 营销集成
│   └── webhook-logger.ts # Webhook 日志
├── models/Schema.ts     # Drizzle 数据库模式
├── packages/            # 8个独立功能包架构 (Monorepo Workspaces)
│   ├── payments/        # @rolitt/payments - 支付系统包 ✨
│   │   ├── src/         # 支付核心代码
│   │   │   ├── features/ # 支付功能 (stripe, webhooks)
│   │   │   ├── components/ # 支付 UI 组件 (CheckoutForm)
│   │   │   ├── libs/    # 核心库和错误处理
│   │   │   └── types/   # 支付类型定义
│   │   └── package.json # 支付包依赖
│   ├── referral/        # @rolitt/referral - 推荐系统包 ✨
│   │   ├── src/         # 推荐系统核心代码
│   │   │   ├── mvp.ts   # 核心3函数 (generateLink, setCookieHeader, calculateReward)
│   │   │   ├── admin/   # 管理面板组件
│   │   │   ├── components/ # 用户推荐组件
│   │   │   └── tracking.ts # 推荐追踪和分析
│   │   └── package.json # 推荐包依赖
│   ├── image-upload/    # @rolitt/image-upload - 图片上传包 ✨
│   │   ├── src/         # 图片上传核心代码
│   │   │   ├── client.ts # Cloudflare R2 客户端
│   │   │   ├── hooks/   # React Hooks (useImageUpload)
│   │   │   ├── validator.ts # 三层安全验证
│   │   │   └── types.ts # 上传类型定义
│   │   └── package.json # 图片上传包依赖
│   ├── auth/            # @rolitt/auth - 认证系统包 ✨
│   │   ├── src/         # 认证核心代码
│   │   │   ├── providers/ # 认证提供商 (Supabase, Firebase)
│   │   │   ├── components/ # 认证 UI 组件
│   │   │   └── features/ # 认证功能模块
│   │   └── package.json # 认证包依赖
│   ├── email/           # @rolitt/email - 多语言邮件模板包 ✨
│   │   ├── src/         # 邮件模板源代码
│   │   │   ├── templates/ # 6种邮件类型模板 (invite, confirmation, recovery, etc.)
│   │   │   ├── config.ts  # 邮件配置和品牌定制
│   │   │   ├── utils.ts   # 邮件工具函数和验证
│   │   │   └── supabase-integration.ts # Supabase Auth 集成
│   │   └── package.json # 邮件包依赖
│   ├── shopify/         # @rolitt/shopify - Shopify 集成包 ✨
│   │   ├── src/         # Shopify 集成核心代码
│   │   │   ├── config/  # 配置管理和功能开关
│   │   │   ├── core/    # 核心功能 (client, error-handler, rate-limiter)
│   │   │   ├── services/ # 业务服务 (products, orders, inventory, customers)
│   │   │   ├── webhooks/ # Webhook 处理和验证
│   │   │   ├── monitoring/ # 监控和健康检查
│   │   │   └── integration/ # Next.js 集成支持
│   │   └── package.json # Shopify 包依赖
│   ├── admin/          # @rolitt/admin - 管理系统包 ✨
│   │   ├── src/         # Admin 源代码
│   │   │   ├── features/ # 功能模块 (users, orders, webhooks, scripts)
│   │   │   ├── components/ # UI 组件
│   │   │   ├── stores/  # Zustand 状态管理
│   │   │   └── types/   # TypeScript 类型定义
│   │   └── package.json # 独立依赖管理
│   └── shared/          # @rolitt/shared - 共享组件库 ✨
│       ├── src/         # 共享代码
│       │   ├── ui/      # 通用 UI 组件
│       │   ├── utils/   # 工具函数
│       │   ├── types/   # 共享类型定义
│       │   └── hooks/   # 通用 React Hooks
│       └── package.json # 共享包依赖
└── locales/            # 国际化文件 (4种语言)
```

**核心原则**：
- 🗄️ **PostgreSQL 为主数据库**，完全移除 Firestore 依赖
- 📦 **8个独立功能包解耦架构**，支持独立开发和部署
- 📧 **多语言邮件模板系统**，支持 Supabase Auth 集成
- 🛒 **Shopify 完整集成**，订单同步、产品管理、库存控制
- 🔐 **双认证系统**：Supabase (Web主) + Firebase (Flutter备)
- 🌍 **4语言支持**：英语、西班牙语、日语、繁体中文
- 💳 **支付系统包化**：独立的 Stripe 集成和 Webhook 处理
- 🎯 **推荐系统**：极简3函数实现完整推荐功能
- 🖼️ **图片上传系统**：Cloudflare R2 + 三层安全验证

---

## **🛠️ 代码开发五步流程**

### **1. 明确任务范围**
- 📋 分析任务，明确目标和验收标准
- 📝 列出需要修改的文件和组件，说明影响范围
- ⚠️ **只有计划清晰后才开始写代码**

### **2. 精准定位修改点**
- 🎯 确定具体文件和代码行
- 📁 避免无关文件改动
- 🚫 除非明确要求，否则不创建新抽象

### **3. 最小化代码改动**
- ✅ 只编写任务直接所需的代码
- 🚫 不添加不必要的日志、注释、测试
- 🚫 不进行'顺手'的额外修改

### **4. 严格检查代码**
- 🔍 检查正确性和副作用
- 🎨 保持与现有代码风格一致
- 📊 评估对下游系统的影响

### **5. 清晰交付成果**
- 📝 总结改动内容和原因
- 📋 列出所有修改文件
- ⚠️ 说明假设和潜在风险

**核心原则**：
- 🚫 **代码中不允许出现中文和中文标点符号！** 注释用中文
- 🏗️ **按功能组织开发**，不按类型组织
- 🎯 **单一职责原则**，每个函数只做一件事
- 🚫 **不过度设计**，遵循 YAGNI 原则
- 🚫 **移动优先**，移动优先，考虑到自适应和项目的 light 和 dark 模式

---

## **💾 双认证系统架构**

### **Supabase (主) + Firebase (备) 认证**

```typescript
// 主认证系统 - Supabase Auth (Web端)
type SupabaseAuthConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL;
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  features: ['邮箱/密码', 'Google OAuth', 'PostgreSQL集成'];
};

// 备用认证系统 - Firebase Auth (Flutter + 容灾)
type FirebaseAuthConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID;
  serviceAccountKey: process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
};

// 统一用户数据模型
type UnifiedUser = {
  supabaseId?: string; // Web主认证ID
  firebaseUid?: string; // Flutter认证ID
  email: string; // 统一标识符
  authSource: 'supabase' | 'firebase';
};
```

**架构优势**：
- 🚀 **环境变量减少67%**：从6个减少到主要2个配置
- 🛡️ **高可用性**：双系统容灾保障
- 📱 **多平台支持**：Web (Supabase) + Flutter (Firebase)
- 🔄 **数据一致性**：基于邮箱的统一标识

---

## **💳 支付系统规范**

### **"立即响应，后台处理"异步架构**

```typescript
// 前端：立即响应 (< 300ms 目标)
export async function handleCheckout(formData: FormData) {
  // 1. 创建预订记录 (status: initiated)
  const preorderId = await initiatePreorder(formData);

  // 2. 立即创建Stripe会话并跳转 (目标 < 100ms)
  const session = await createStripeSession(preorderId);
  redirect(session.url);
}

// 后台：Webhook异步处理
export async function POST(request: NextRequest) {
  const webhookId = await WebhookLogger.logStripeEventStart(eventType, eventId);

  try {
    // 并行处理：用户创建 + 数据同步 + 营销事件
    await Promise.all([
      createSupabaseUser(email),
      syncToPostgreSQL(orderData),
      sendKlaviyoEvent(userEvent)
    ]);

    await WebhookLogger.logStripeEventSuccess(webhookId);
  } catch (error) {
    await WebhookLogger.logStripeEventFailure(webhookId, error);
  }
}
```

**核心特性**：
- ⚡ **立即响应**：前端操作 < 100ms
- 🔄 **异步处理**：Webhook后台处理耗时操作
- 📦 **智能备用**：基于 `COLOR_PRICE_MAP_JSON` 容错
- 🔄 **幂等性保证**：防止重复处理相同事件
- 🔧 **统一API版本**：所有Stripe实例使用 `'2025-06-30.basil'`

**关键文件**：
- `src/app/actions/checkoutActions.ts` - 支付会话创建
- `src/app/api/webhooks/stripe/route.ts` - Webhook处理
- `src/libs/payments/` - 支付系统核心代码
- `src/libs/webhook-logger.ts` - 日志系统

---

## **🗄️ 数据库规范**

### **PostgreSQL + Drizzle ORM**

```typescript
// src/models/Schema.ts - 统一数据模型
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  supabaseId: varchar('supabase_id', { length: 255 }), // 主认证ID
  firebaseUid: varchar('firebase_uid', { length: 255 }), // 备份认证ID
  email: varchar('email', { length: 255 }).unique().notNull(),
  authSource: varchar('auth_source', { length: 20 }).default('supabase'),
});

export const preorders = pgTable('preorders', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).default('initiated'),
  // 状态流: initiated → processing → completed → fulfilled
});
```

**核心原则**：
- 🗄️ **PostgreSQL为主数据库**，移除Firestore依赖
- 🔧 使用Drizzle ORM，类型安全的数据操作
- 📊 `src/models/Schema.ts` 集中管理数据模型
- 🔗 `src/libs/DB.ts` 统一数据库连接
- 📋 migrations/ 目录管理数据库变更

---

## **📦 包解耦架构规范**

### **Monorepo + 8个独立功能包架构**

```typescript
// 8个独立功能包，模块化设计，独立开发和部署

// @rolitt/admin - 管理系统包
import { AdminDashboard, useAdminStore } from '@rolitt/admin';

// @rolitt/auth - 认证系统包
import { FirebaseAuthProvider, SupabaseAuthProvider } from '@rolitt/auth';

// @rolitt/email - 多语言邮件模板包
import { generateEmailTemplate, SupabaseEmailTemplateGenerator } from '@rolitt/email';

// @rolitt/image-upload - 图片上传包
import { uploadToR2, useImageUpload } from '@rolitt/image-upload';

// @rolitt/payments - 支付系统包
import { createStripeSession, handleWebhook } from '@rolitt/payments';

// @rolitt/referral - 推荐系统包 (极简3函数)
import { calculateReward, generateReferralLink, setCookieHeader } from '@rolitt/referral';

// @rolitt/shared - 共享组件库
import { Button, Card, useDebounce } from '@rolitt/shared';

// @rolitt/shopify - Shopify 集成包
import { ShopifyIntegration, syncOrderToShopify } from '@rolitt/shopify';

export type { AdminState, WebhookLog } from '@rolitt/admin';
export type { AuthConfig, UserSession } from '@rolitt/auth';
export type { EmailType, SupportedLocale } from '@rolitt/email';
export type { ImageValidation, UploadConfig } from '@rolitt/image-upload';
export type { PaymentConfig, StripeSessionData } from '@rolitt/payments';
export type { ReferralData, RewardCalculation } from '@rolitt/referral';
export type { SharedUIProps, UtilityTypes } from '@rolitt/shared';
export type { OrderSyncResult, ShopifyConfig } from '@rolitt/shopify';
```

**开发脚本**：
```bash
# 主应用开发
npm run dev              # 主应用开发服务器
npm run build            # 主应用构建
npm run test             # 主应用测试

# 包管理脚本
npm run packages:install # 安装所有包依赖
npm run packages:build   # 构建所有包
npm run packages:clean   # 清理包构建产物
npm run packages:test    # 测试所有包

# 支付系统包管理
npm run payments:dev     # 支付包开发模式
npm run payments:build   # 支付包构建
npm run payments:test    # 支付包测试

# 推荐系统包管理
npm run referral:dev     # 推荐包开发模式
npm run referral:test    # 推荐包测试
npm run referral:validate # 推荐包验证

# 图片上传包管理
npm run image:dev        # 图片上传包开发
npm run image:test       # 图片上传包测试
npm run image:validate   # 图片上传包验证

# 认证系统包管理
npm run auth:dev         # 认证包开发模式
npm run auth:test        # 认证包测试
npm run auth:validate    # 认证包验证

# 邮件模板系统管理
npm run email:setup      # 生成邮件模板配置
npm run email:generate   # 仅生成模板文件
npm run email:test       # 测试邮件模板
npm run email:validate   # 验证邮件模板

# Shopify 集成包管理
npm run shopify:dev      # Shopify包开发模式
npm run shopify:test     # 测试 Shopify 包
npm run shopify:validate # Shopify包验证

# Admin 包管理
npm run admin:dev        # Admin 包开发模式
npm run admin:check      # Admin 包类型检查
npm run admin:validate   # Admin 包验证
npm run admin:build-check # Admin 包构建检查

# 共享组件库管理
npm run shared:dev       # 共享包开发模式
npm run shared:build     # 共享包构建
npm run shared:test      # 共享包测试
npm run shared:storybook # 共享包组件文档
```

**架构优势**：
- ✅ **零技术分裂**：统一技术栈，无学习成本
- ✅ **零功能回归**：完全向后兼容
- ✅ **并行开发**：8个包独立开发，提升团队效率
- ✅ **类型安全**：100% TypeScript 覆盖，包间类型共享
- ✅ **插件化设计**：可选启用/禁用各个包
- ✅ **统一测试**：集成测试和单元测试并行
- ✅ **独立部署**：支持包级别的独立部署和版本管理
- ✅ **模块化复用**：包可在其他项目中复用

---

## **🎨 UI样式规范**

### **Tailwind CSS + shadcn/ui**

```typescript
// tailwind.config.ts - 品牌色配置
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '235 100% 75%', // 品牌主色
        }
      }
    }
  }
};
```

**核心原则**：
- 🎨 品牌主色 `#EBFF7F` 配置在 tailwind.config.js
- 📚 遵循 shadcn/ui 组件最佳实践
- 📱 移动优先的响应式设计
- 🌙 `dark:` 前缀支持暗色模式
- 🛠️ 使用 `clsx` 或 `cn` 处理条件样式

**shadcn/ui集成**：
```bash
npx shadcn@latest init          # 初始化
npx shadcn@latest add button    # 按需添加组件
```

---

## **🌍 国际化规范**

### **next-intl + 4语言支持**

```typescript
const locales = ['en', 'es', 'ja', 'zh-HK'] as const;
```

**翻译文件结构**：
```
src/locales/
├── en/common.json      # 英语
├── es/common.json      # 西班牙语
├── ja/common.json      # 日语
└── zh-HK/common.json   # 繁体中文
```

**实现要求**：
- 🌐 `app/[locale]` 路由结构
- 📝 翻译内容存放在 `src/locales/{lang}/*.json`
- 🔗 所有链接包含locale参数：`/es/about`
- 📄 避免硬编码，所有文案外部化
- 🔍 SEO的hreflang标签支持

---

## **📈 分析工具集成**

### **多平台分析配置**

```typescript
// src/components/analytics/AnalyticsProvider.tsx
const analyticsConfig = {
  googleAnalytics: process.env.NEXT_PUBLIC_GA_ID,
  metaPixel: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  tiktokPixel: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID,
  microsoftClarity: process.env.NEXT_PUBLIC_CLARITY_ID,
  postHog: process.env.NEXT_PUBLIC_POSTHOG_KEY,
};
```

**性能优化加载策略**：
```jsx
<Script strategy="beforeInteractive" src="critical.js" />
<Script strategy="afterInteractive" src="analytics.js" />
<Script strategy="lazyOnload" src="marketing.js" />
```

**集成的分析工具**：
- 📊 Google Analytics 4 (核心分析)
- 📱 Meta Pixel (社交转化)
- 🎵 TikTok Pixel (短视频营销)
- 🔍 Microsoft Clarity (用户行为)
- 📈 PostHog (产品分析)

---

## **🔧 开发工具和质量**

### **代码质量工具链**

```json
// 核心开发脚本
{
  "dev": "next dev",
  "build": "next build --no-lint",
  "test": "vitest run",
  "test:e2e": "playwright test",
  "lint": "eslint .",
  "check-types": "tsc --noEmit",
  "db:generate": "drizzle-kit generate",
  "db:migrate": "drizzle-kit migrate",
  "storybook": "storybook dev -p 6006"
}
```

**质量要求**：
- 🔍 **ESLint + Prettier** 代码风格统一
- 🧪 **Vitest + Playwright** 单元测试 + E2E测试
- 📚 **Storybook** 组件文档
- 🚫 **TypeScript Strict Mode**，避免 `any` 类型
- ✅ **测试覆盖率** 保持在80%以上
- 📋 **Conventional Commits** 提交规范

---

## **🚀 性能优化规范**

### **Core Web Vitals目标**

```typescript
const performanceTargets = {
  LCP: '< 2.5s', // Largest Contentful Paint
  FID: '< 100ms', // First Input Delay
  CLS: '< 0.1', // Cumulative Layout Shift
  bundleSize: {
    firstLoadJS: '250kb',
    totalSize: '500kb'
  }
};
```

**优化策略**：
- 🚀 **Server Components优先**，减少客户端JS
- 🖼️ **next/image** 响应式图片懒加载
- 📝 **next/font** 字体优化
- 📦 **代码分割** React.lazy + Suspense
- 💾 **多层缓存** 浏览器+CDN+API缓存
- 📊 **TanStack Query** 智能数据缓存

**监控工具**：
```bash
npm run build-stats     # Bundle分析
npm run monitor:lighthouse # 性能评估
```

---

## **🔒 安全与合规**

### **安全措施**

```typescript
// src/libs/Env.ts - 类型安全的环境变量
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

**安全原则**：
- 🔐 **双认证系统**：Supabase主 + Firebase备
- 🗄️ **PostgreSQL行级安全** + Supabase RLS
- 🛡️ **API安全**：请求验证和速率限制
- 🔑 **环境变量类型安全**，敏感信息不提交
- 📊 **Sentry错误监控**
- ✅ **GDPR + PCI DSS** 合规

---

## **🚀 部署选项**

### **多平台部署支持**

```bash
# Railway (主要部署)
npm run deploy:railway

# Vercel (备选)
npm run deploy:vercel

# Cloudflare Workers
npm run deploy:cloudflare
# 使用 @opennextjs/cloudflare 1.2.1
```

**环境配置**：
```bash
# 核心环境变量
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_SUPABASE_URL="https://..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## **📊 监控和调试**

### **健康检查和日志**

```bash
# 健康检查
curl -f $APP_URL/api/webhook/health

# 实时日志监控
npm run logs:railway
npm run logs:vercel

# Webhook日志查看
# 管理后台: /admin/webhook-logs
```

**监控工具**：
- 📊 **Webhook日志系统** 完整事件追踪
- 🔍 **Sentry错误监控** 实时错误追踪
- 📈 **性能指标** Core Web Vitals监控
- 🔧 **构建分析** Bundle大小优化

---

## **🧪 测试策略**

### **全面测试覆盖**

```bash
npm run test           # Vitest单元测试
npm run test:e2e       # Playwright E2E测试
npm run storybook      # 组件测试
npm run test-storybook # 视觉回归测试
```

**关键测试场景**：
- ✅ 完整支付流程测试
- ✅ 双认证系统切换测试
- ✅ Admin包功能集成测试
- ✅ 多语言功能测试
- ✅ Webhook事件处理测试

---

## **📚 重要配置文件**

### **关键配置和脚本**

```bash
# 数据库操作
npm run db:generate     # 生成迁移
npm run db:migrate      # 执行迁移
npm run db:studio       # 数据库管理界面

# Workspace 包管理
npm run packages:install # 安装所有包依赖
npm run packages:build   # 构建所有包
npm run packages:clean   # 清理包构建产物

# Admin 包管理
npm run admin:dev        # Admin 包开发模式
npm run admin:check      # Admin 包类型检查
npm run admin:validate   # Admin 包验证
npm run admin:build-check # Admin 包构建检查

# Shopify 集成包管理
npm run test:shopify     # 测试 Shopify 包

# 邮件模板系统管理
npm run email:setup      # 生成邮件模板配置
npm run email:generate   # 仅生成模板文件
npm run email:test       # 测试邮件模板
npm run email:test:full  # 完整测试邮件模板
npm run email:validate   # 验证邮件模板

# 验证工具
npm run check-env       # 环境变量检查
npm run stripe:validate # Stripe配置验证
npm run colors:validate # 颜色配置验证
npm run validate-locales # 国际化验证

# CI/CD
npm run ci:install      # CI安装
npm run ci:build        # CI构建
npm run ci:test         # CI测试
npm run setup:ci        # CI完整设置
```

**核心特性**：
- 🔧 **Railway安全构建** `scripts/railway-safe-build.sh`
- 📊 **Stripe同步脚本** `scripts/stripe-sync.ts`
- 🌈 **颜色同步脚本** `scripts/sync-colors.js`
- ✅ **环境检查工具** `scripts/check-env.js`
- 📧 **邮件模板设置** `scripts/setup-supabase-email-templates.ts`
- 🧪 **邮件模板测试** `scripts/test-email-templates.ts`
- 🛒 **Shopify包测试** `scripts/test-shopify-package.ts`

---

**Rolitt开发规范v4.0 - 专为AI Coding优化，集成8个独立功能包架构、完整支付系统、推荐系统、图片上传系统和多语言邮件模板系统，确保高质量、可维护的代码交付** 🚀

## **🚀 v4.0 主要更新**

### **新增功能包**:
- 💳 **@rolitt/payments**: 完整的支付系统包，支持Stripe集成、Webhook处理和支付UI组件
- 🎯 **@rolitt/referral**: 极简推荐系统包，仅3个核心函数实现完整推荐功能
- 🖼️ **@rolitt/image-upload**: 图片上传系统包，支持Cloudflare R2和三层安全验证
- 🔐 **@rolitt/auth**: 认证系统包，支持Supabase和Firebase双认证架构
- 🛒 **@rolitt/shopify**: 完整的Shopify集成包，支持订单同步、产品管理和库存控制
- 📧 **@rolitt/email**: 企业级多语言邮件模板系统，支持6种邮件类型和4种语言
- 📦 **@rolitt/admin**: 管理系统包，支持订单管理、用户管理和系统监控
- 🔧 **@rolitt/shared**: 共享组件库，提供通用UI组件和工具函数

### **架构升级**:
- ⚡ **8包独立架构**: 从3个包扩展到8个独立功能包，支持模块化开发
- 🔧 **完整脚本管理**: 每个包都有独立的开发、测试、验证工具链
- 🌍 **技术栈升级**: Next.js 15.3.4 + React 19.0.0 + TypeScript 5.0
- 📊 **监控完善**: 包级别的健康检查、测试覆盖和性能监控
- 💾 **数据库优化**: PostgreSQL主数据库 + Redis缓存 + Drizzle ORM
- 🔐 **安全增强**: 三层安全验证、双认证系统、完整的错误处理

### **业务功能增强**:
- 💳 **异步支付架构**: 支付驱动的用户创建，提升转化率和用户质量
- 🎯 **智能推荐系统**: 多级推荐奖励、精准营销追踪
- 🖼️ **企业级图片管理**: 智能压缩、CDN分发、多格式支持
- 📧 **专业邮件系统**: 品牌定制、多语言支持、自动化发送
- 🛒 **完整电商集成**: Shopify订单同步、库存管理、履约流程
- 📈 **全面数据分析**: 多平台分析工具、实时业务洞察
