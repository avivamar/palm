# 系统架构文档

本文档提供了 Rolitt 项目的完整系统架构概览，这是一个基于 Next.js 15 的现代化 AI 伴侣产品网站。

## 📋 文档索引

### 核心系统文档
- [Firebase 认证集成](./firebase-auth-integration.md) - 用户认证、权限管理和用户数据结构
- [支付系统集成](./payment-system-integration.md) - 支付处理、订阅管理和多提供商支持

### 系统概览
以下是项目的详细分析：
## 🏗️ 项目架构

### 技术栈
- **前端框架**: Next.js 15 (App Router) + React 19
- **样式系统**: Tailwind CSS 4 + shadcn/ui 组件库
- **动画**: Framer Motion + Lenis 平滑滚动
- **国际化**: next-intl (支持 4 种语言：英语、西班牙语、日语、繁体中文)
- **身份验证**: Firebase Auth
- **数据库**: Drizzle ORM + PostgreSQL/PGlite
- **表单验证**: React Hook Form + Zod
- **监控**: Sentry 错误追踪
- **测试**: Playwright (E2E) + Vitest (单元测试)
- **营销服务**: klaviyo API

### 目录结构
```
src/
├── app/                 # Next.js App Router
│   ├── [locale]/       # 国际化路由
│   ├── (auth)/         # 认证页面组
│   ├── (marketing)/    # 营销页面组
│   └── api/            # API 路由
├── components/         # UI 组件
│   ├── ui/            # 基础组件 (shadcn/ui)
│   └── animations/    # 动画组件
├── libs/              # 核心库 (数据库、环境配置)
├── models/            # 数据库模型
├── messages/          # 国际化消息
├── styles/            # 全局样式
├── utils/             # 工具函数
└── validations/       # 表单验证
```

## 🎨 设计系统

### 品牌色彩
- **主色调**: `#EBFF7F` (亮绿色)
- **深色模式**: `#d9eb6a`
- **背景色**: 浅色模式 `#fcfcfc`，深色模式 `#1a1a1a`

### UI 组件
基于 shadcn/ui 构建的组件库，包括：
- 基础组件：Button, Card, Input, Form 等
- 特殊组件：MagicCard, RainbowButton
- 动画组件：支持多种动画效果

## 🌍 国际化支持

### 支持语言
- 英语 (默认)
- 西班牙语、日语、
- 繁体中文

### 实现方式
- 使用 `next-intl` 进行路由级别的国际化
- 动态路由 `[locale]` 处理多语言
- 消息文件存储在 <mcfile name="zh-HK.json" path="src/messages/zh-HK.json"></mcfile> 等文件中

## 🔧 核心功能模块

### 1. 数据库层
- **配置**: <mcfile name="DB.ts" path="src/libs/DB.ts"></mcfile> - 支持 PostgreSQL 和 PGlite
- **模型**: <mcfile name="Schema.ts" path="src/models/Schema.ts"></mcfile> - 定义计数器表结构
- **迁移**: 使用 Drizzle Kit 管理数据库迁移

### 2. 环境配置
- **类型安全**: <mcfile name="Env.ts" path="src/libs/Env.ts"></mcfile> 使用 `@t3-oss/env-nextjs` 确保环境变量类型安全
- **支持变量**: Firebase 认证、数据库 URL、日志令牌等

### 3. API 路由
- **联系表单**: <mcfile name="route.ts" path="src/app/api/contact/route.ts"></mcfile> - 处理联系表单提交，集成 Resend 邮件服务
- **验证**: <mcfile name="ContactValidation.ts" path="src/validations/ContactValidation.ts"></mcfile> - 使用 Zod 进行表单验证

### 4. 页面组件
- **Hero 区域**: <mcfile name="StaticHero.tsx" path="src/components/StaticHero.tsx"></mcfile> - 包含视频模态框、动画效果
- **特性展示**: <mcfile name="StaticFeatures.tsx" path="src/components/StaticFeatures.tsx"></mcfile> - 使用 Framer Motion 动画
- **导航**: <mcfile name="Navbar.tsx" path="src/components/Navbar.tsx"></mcfile> - 响应式导航栏
- **页脚**: <mcfile name="Footer.tsx" path="src/components/Footer.tsx"></mcfile> - 包含社交媒体链接和联系信息

## 🧪 测试策略

### E2E 测试 (Playwright)
- **健全性检查**: <mcfile name="Sanity.check.e2e.ts" path="tests/e2e/Sanity.check.e2e.ts"></mcfile>
- **国际化测试**: I18n.e2e.ts
- **视觉回归测试**: Visual.e2e.ts

### 配置
- **Playwright**: <mcfile name="playwright.config.ts" path="playwright.config.ts"></mcfile> - 配置多浏览器测试
- **测试环境**: 支持本地开发和 CI 环境

## 🎯 产品特色

### AI 伴侣产品
根据国际化消息文件分析，这是一个 AI 伴侣产品的预订网站，主要功能包括：
- **预订系统**: 早鸟价格 $259（原价 $299）
- **产品时间线**: 2024年第二季度生产，第三季度交付
- **核心功能**: 先进 AI、自然对话、情感智能、魔法时刻

### 营销功能
- 多语言支持的产品介绍
- 特性展示和常见问题解答
- 联系表单和客户支持
- 社交媒体集成

## 🔒 安全与性能

### 安全措施
- 环境变量类型验证
- 表单输入验证
- Firebase Auth 身份验证集成
- Sentry 错误监控

### 性能优化
- Next.js 15 App Router 优化
- 图片优化和懒加载
- 代码分割和动态导入
- Tailwind CSS 优化

## 📱 响应式设计

项目采用移动优先的响应式设计：
- 断点配置：sm(640px), md(768px), lg(1024px), xl(1280px), 2xl(1536px)
- 移动端导航菜单
- 自适应布局和组件

这是一个结构完整、技术先进的现代化 Web 应用，专注于 AI 伴侣产品的营销和预订功能，具备良好的国际化支持、用户体验和开发者体验

## 🚀 Cloudflare 部署

### 使用 @opennextjs/cloudflare 部署到 Cloudflare Workers

本项目使用 `@opennextjs/cloudflare` 适配器来部署到 Cloudflare Workers，支持 Node.js runtime 和更广泛的 Next.js 功能。<mcreference link="https://opennext.js.org/cloudflare" index="2">2</mcreference>

#### 部署步骤

1. **安装依赖**
   ```bash
   npm install @opennextjs/cloudflare --save-dev
   ```

2. **构建和部署**
   ```bash
   # 构建应用
   npx opennextjs-cloudflare

   # 本地预览
   npx wrangler pages dev .worker-next/

   # 部署到 Cloudflare
   npx wrangler pages deploy .worker-next/
   ```

3. **配置 wrangler.toml**
   项目已包含 `wrangler.toml` 配置文件，支持 Node.js 兼容模式。

#### 优势

- **Node.js Runtime 支持**: 与 `@cloudflare/next-on-pages` 不同，支持 Next.js 的 Node.js runtime <mcreference link="https://developers.cloudflare.com/pages/framework-guides/nextjs/ssr/get-started/" index="4">4</mcreference>
- **更好的兼容性**: 支持更广泛的 Next.js 功能和渲染模式 <mcreference link="https://blog.cloudflare.com/deploying-nextjs-apps-to-cloudflare-workers-with-the-opennext-adapter/" index="3">3</mcreference>
- **无需 Edge Runtime**: 不需要为每个页面添加 `export const runtime = 'edge'` 配置
- **OpenNext 集成**: 基于 OpenNext 项目，提供更好的 Next.js 支持

#### 注意事项

- 确保 Vercel 部署不受影响：`@opennextjs/cloudflare` 仅在构建时使用，不会影响标准的 Next.js 构建
- 项目同时支持 Vercel 和 Cloudflare Workers 部署
- 使用 `npx opennextjs-cloudflare` 命令专门为 Cloudflare 构建

## 🔍 分析工具集成指导原则

基于 Google 官方最佳实践和性能优化建议，我们制定了以下分析工具集成规范：

### 脚本加载策略

根据 Next.js Script 组件的三种策略进行分类：

1. **beforeInteractive**: 关键脚本，在页面交互前执行
   - 用于必须在页面交互前加载的关键脚本
   - 例如：polyfills、关键的第三方库

2. **afterInteractive** (默认): 页面交互后执行
   - 用于重要但非阻塞的分析脚本
   - 例如：Google Analytics、Microsoft Clarity

3. **lazyOnload**: 延迟加载，适用于非关键脚本
   - 用于营销和转化追踪脚本
   - 例如：Meta Pixel、TikTok Pixel、Klaviyo

### 组件架构设计

```
src/components/analytics/
├── AnalyticsProvider.tsx      # 统一提供者组件，使用 Script 组件
├── services/
│   ├── GoogleAnalytics.tsx    # 使用 afterInteractive 策略
│   ├── MetaPixel.tsx          # 使用 lazyOnload 策略
│   ├── ClarityService.tsx     # 使用 afterInteractive 策略
│   ├── TikTokPixel.tsx        # 使用 lazyOnload 策略
│   └── KlaviyoService.tsx     # 动态导入，条件加载
├── hooks/
│   ├── useAnalytics.ts        # 统一分析 Hook
│   └── useTracking.ts         # 事件追踪 Hook
└── types/
    └── analytics.ts           # 分析相关类型定义
```

### 性能优化原则

1. **最小化 First Load JS**: 避免将大型分析库包含在初始包中
2. **动态导入**: 条件显示的组件使用 `dynamic()` 导入
3. **延迟加载**: 非关键脚本延迟 3 秒后加载
4. **服务器端处理**: 将大型库移到服务器端处理
5. **Bundle 分析**: 定期使用 `@next/bundle-analyzer` 分析包大小

### 实施规范

1. **使用 Next.js Script 组件**: 所有第三方脚本必须使用 `next/script` 组件
2. **策略选择**: 根据脚本重要性选择合适的 `strategy` 属性
3. **环境变量管理**: 所有分析工具的配置通过环境变量管理
4. **类型安全**: 使用 TypeScript 确保配置的类型安全
5. **条件加载**: 实现基于环境和用户偏好的条件加载
6. **错误处理**: 为所有分析脚本添加错误处理和降级方案

### 开发流程

1. **先分析再实施**: 使用 Bundle Analyzer 了解当前状态
2. **渐进式优化**: 逐步替换现有实现，避免破坏性更改
3. **性能监控**: 持续监控 Core Web Vitals 指标
4. **测试验证**: 确保分析功能在不同环境下正常工作

这些原则确保我们的分析工具集成既符合性能最佳实践，又保持良好的开发者体验和用户体验。

## 项目结构

```
rolittmain/
├── .next/                # Next.js 构建输出
├── public/               # 静态资源
├── src/
│   ├── app/              # Next.js App Router 结构
│   │   ├── [locale]/     # 国际化路由
│   │   │   ├── (marketing)/ # 面向公众的页面
│   │   │   ├── (auth)/   # 身份验证相关页面
│   │   │   └── dashboard/ # 用户仪表盘
│   ├── components/       # 可复用UI组件
│   │   ├── ui/           # 基础UI组件 (shadcn/ui)
│   │   └── animations/   # 动画组件
│   ├── libs/             # 服务集成 (Shopify 等)
│   ├── locales/          # 翻译文件
│   ├── messages/         # i18n 消息定义
│   ├── styles/           # 全局样式
│   ├── types/            # TypeScript 类型定义
│   ├── utils/            # 实用工具函数
│   ├── middleware.ts     # Next.js 中间件(路由,认证)
│   └── validations/      # 表单验证模式
├── tailwind.config.ts    # Tailwind CSS 配置
├── next.config.ts        # Next.js 配置
└── package.json          # 项目依赖
```

## 技术栈

1. **前端框架**:
   - Next.js 15 (App Router)
   - React 19

2. **样式**:
   - Tailwind CSS 4
   - shadcn/ui (基于 Radix UI 的组件)
   - Framer Motion 用于动画
   - Lenis 用于平滑滚动

3. **状态管理与表单**:
   - React Hook Form
   - Zod 用于验证

4. **国际化**:
   - next-intl 支持多语言
   - 动态本地化路由

5. **电子商务集成**:
   - Shopify Storefront API
   - GraphQL 用于数据获取

6. **身份验证**:
   - Clerk 用于用户管理

7. **分析与监控**:
   - Sentry 用于错误追踪
   - Facebook Pixel 用于转化追踪
   - Pino 用于日志记录

8. **数据库**:
   - Drizzle ORM
   - PostgreSQL

9. **开发运维与质量**:
   - TypeScript 用于类型安全
   - ESLint 用于代码质量
   - Vitest 用于单元测试
   - Playwright 用于端到端测试
   - Storybook 用于组件文档
   - Husky 用于 git 钩子

## 主要功能

1. **多语言网站**:
   - 通过 next-intl 内置国际化支持
   - 支持语言切换

2. **电子商务功能**:
   - 通过 Shopify 集成的产品列表
   - 购物车功能
   - 结账流程

3. **交互式UI元素**:
   - 带有视频模态框的 Hero 区域
   - 使用 Framer Motion 的动画
   - 自定义光标效果
   - 平滑滚动

4. **营销组件**:
   - FAQ 部分
   - 特性展示
   - 行动召唤(CTA)部分
   - 新闻通讯订阅

5. **用户认证**:
   - 注册/登录功能
   - 用户仪表盘

6. **SEO 优化**:
   - 使用 JSON-LD 的结构化数据
   - 动态元数据
   - 站点地图生成

## 项目概览

Rolitt 网站似乎是一个 AI 毛绒伴侣产品的营销和电子商务平台。该网站使用现代网络技术构建，重点关注：

1. **性能优化**：尽可能使用 Next.js 服务器组件、图像优化和高效的加载策略。

2. **用户体验**：流畅的动画、响应式设计和直观的 UI 组件。

## 🔗 系统集成关系

### 1. 认证与支付系统集成

当前项目已具备 Firebase 认证基础，支付系统将通过以下方式集成：

```typescript
// 用户数据结构扩展（支持支付信息）
type UserProfile = {
  uid: string;
  email: string;
  // ... 现有用户信息

  // 支付系统集成字段
  paymentProviders?: {
    stripe?: {
      customerId: string;
      defaultPaymentMethod?: string;
      createdAt: Date;
      status: 'active' | 'inactive';
    };
  };

  subscription?: {
    status: 'active' | 'canceled' | 'past_due' | 'trialing';
    planId: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    provider: string;
  };
};
```

### 2. 数据流向

```
用户访问网站 (营销页面)
        ↓
用户注册/登录 (Firebase Auth)
        ↓
创建用户档案 (Firestore)
        ↓
产品购买/订阅 (支付系统)
        ↓
Webhook 事件处理
        ↓
用户数据同步更新
        ↓
个性化体验提供
```

### 3. 技术栈集成

- **前端**: Next.js 15 + React 19 (现有)
- **认证**: Firebase Auth (现有)
- **支付**: Stripe + PayPal (待集成)
- **数据库**: Firestore + Drizzle ORM (混合使用)
- **监控**: Sentry (现有) + 支付监控 (待添加)

## 📚 相关文档

### 已完成文档
- [Firebase 认证集成详细文档](./firebase-auth-integration.md) - 用户认证、权限管理和数据结构
- [支付系统集成详细文档](./payment-system-integration.md) - 支付处理、订阅管理和多提供商支持

### 待创建文档
- [API 接口文档](./api-documentation.md) - RESTful API 设计和接口规范
- [部署指南](./deployment-guide.md) - 生产环境部署和配置
- [运维手册](./operations-manual.md) - 系统监控和故障处理
- [开发指南](./development-guide.md) - 开发环境搭建和编码规范

---

**注意**: 本文档会随着系统的发展持续更新，请定期查看最新版本。当前重点是完善认证和支付系统的集成，为用户提供完整的产品购买和订阅体验。
