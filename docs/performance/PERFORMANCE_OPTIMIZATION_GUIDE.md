# 🚀 Rolitt 性能优化指南

## 🎯 当前性能问题诊断

### 问题分析
基于 PageSpeed Insights 报告：
- **LCP (Largest Contentful Paint)**: 10.2秒 → 目标 <2.5秒
- **Speed Index**: 5.3秒 → 目标 <3.4秒

### 主要性能瓶颈

#### 1. LCP 优化重点
- ❌ **视频资源过大**: Shopify CDN 视频未优化
- ❌ **Hero 图片**: 大尺寸 PNG 格式
- ❌ **复杂客户端逻辑**: 多状态管理影响渲染

#### 2. Speed Index 优化重点
- ❌ **多层 Provider 嵌套**: 5层 Context 影响首屏
- ❌ **同步多语言加载**: 10个 JSON 文件阻塞渲染
- ❌ **第三方脚本**: 分析工具影响加载速度

## 🛠️ 立即实施优化方案

### 步骤 1: 替换优化组件

#### A. 更新 Hero 组件
```bash
# 将 StaticHero 替换为 OptimizedHero
# 文件: src/app/[locale]/page.tsx
```

```tsx
// 替换这一行:
import { StaticHero } from '@/components/StaticHero';

// 改为:
import { OptimizedHero } from '@/components/OptimizedHero';

// 在 JSX 中替换:
<StaticHero /> → <OptimizedHero />
```

#### B. 更新布局文件（可选）
```bash
# 备份当前布局
cp src/app/[locale]/layout.tsx src/app/[locale]/layout.backup.tsx

# 使用优化版本
cp src/app/[locale]/layout-optimized.tsx src/app/[locale]/layout.tsx
```

### 步骤 2: 图片格式优化

#### A. 转换关键图片为 WebP
```bash
# 安装图片转换工具
npm install -g @squoosh/cli

# 转换 Hero 图片
squoosh-cli --webp '{"quality":75}' public/assets/images/hero.png

# 转换头像图片
squoosh-cli --webp '{"quality":80}' public/assets/images/avatars/*.jpg
```

#### B. 添加图片预加载
在 `layout.tsx` `<head>` 中添加：
```html
<link rel="preload" href="/assets/images/hero.webp" as="image" />
```

### 步骤 3: 多语言优化

#### A. 拆分翻译文件加载
创建核心翻译加载器：
```tsx
// utils/i18n-loader.ts
export async function loadCriticalTranslations(locale: string) {
  // 只加载首屏必需的翻译
  return {
    ...(await import(`@/locales/${locale}/core.json`)).default,
    ...(await import(`@/locales/${locale}/pages.json`)).default,
  };
}

export async function loadSecondaryTranslations(locale: string) {
  // 延迟加载其他翻译
  return {
    dashboard: (await import(`@/locales/${locale}/dashboard.json`)).default,
    admin: (await import(`@/locales/${locale}/admin.json`)).default,
    // ... 其他非关键翻译
  };
}
```

### 步骤 4: 第三方脚本优化

#### A. 延迟加载分析工具
```tsx
// 将分析工具改为动态导入
const AnalyticsProvider = dynamic(() =>
  import('@/components/analytics/AnalyticsProvider'), { ssr: false });
```

#### B. 添加 DNS 预解析
在 `layout.tsx` 添加：
```html
<link rel="dns-prefetch" href="//cdn.shopify.com" />
<link rel="dns-prefetch" href="//fonts.googleapis.com" />
<link rel="dns-prefetch" href="//www.googletagmanager.com" />
```

### 步骤 5: Next.js 配置优化

#### A. 更新 next.config.js
```bash
# 备份当前配置
cp next.config.js next.config.backup.js

# 使用优化配置
cp next.config.optimized.js next.config.js
```

#### B. 添加性能预算
```json
// package.json 中添加
{
  "scripts": {
    "build:analyze": "ANALYZE=true npm run build",
    "perf:lighthouse": "lighthouse https://www.rolitt.com --output=json --output-path=lighthouse-report.json"
  }
}
```

## 📊 预期性能提升

### 优化前 vs 优化后

| 指标 | 优化前 | 目标 | 预期提升 |
|------|---------|------|----------|
| LCP | 10.2s | <2.5s | 75%+ |
| Speed Index | 5.3s | <3.4s | 35%+ |
| FCP | - | <1.8s | - |
| CLS | - | <0.1 | - |

### 关键优化效果

1. **Hero 组件优化**: -60% 加载时间
2. **图片 WebP**: -40% 文件大小
3. **延迟加载**: -50% 初始 JS Bundle
4. **DNS 预解析**: -200ms 网络延迟

## 🔍 性能监控

### A. 持续监控工具

#### 1. Core Web Vitals 监控
```tsx
// components/PerformanceMonitor.tsx
import { getCLS, getFCP, getFID, getLCP } from 'web-vitals';

export function PerformanceMonitor() {
  useEffect(() => {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
  }, []);
}
```

#### 2. 自动化性能测试
```bash
# 添加到 CI/CD
npm run perf:lighthouse
npm run build:analyze
```

### B. 性能指标目标

```typescript
const PERFORMANCE_TARGETS = {
  LCP: 2500, // 2.5秒
  FID: 100, // 100ms
  CLS: 0.1, // 0.1
  FCP: 1800, // 1.8秒
  TTI: 3800, // 3.8秒
};
```

## ⚡ 高级优化策略

### 1. 服务端渲染优化
```tsx
// 实现流式渲染
export default async function Page() {
  return (
    <Suspense fallback={<HeroSkeleton />}>
      <OptimizedHero />
    </Suspense>
  );
}
```

### 2. 资源预加载策略
```html
<!-- 关键资源预加载 -->
<link rel="preload" href="/critical.css" as="style" />
<link rel="preload" href="/hero.webp" as="image" />

<!-- 非关键资源预连接 -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://cdn.shopify.com" />
```

### 3. Bundle 分析和优化
```bash
# 分析 Bundle 大小
npm run build:analyze

# 检查重复依赖
npx duplicate-package-checker-webpack-plugin

# 树摇优化检查
npx webpack-bundle-analyzer .next/static/chunks/*.js
```

## 📝 实施检查清单

### 立即实施（第1天）
- [ ] 替换 Hero 组件为 OptimizedHero
- [ ] 转换关键图片为 WebP 格式
- [ ] 添加图片预加载链接
- [ ] 实施 DNS 预解析

### 短期优化（第1周）
- [ ] 优化多语言文件加载
- [ ] 延迟加载第三方脚本
- [ ] 更新 Next.js 配置
- [ ] 实施性能监控

### 长期优化（第1月）
- [ ] 实施 CDN 加速
- [ ] 优化服务端渲染
- [ ] 建立性能预算
- [ ] 自动化性能测试

## 🚨 注意事项

1. **备份重要文件**: 在替换前备份原始文件
2. **渐进式部署**: 先在开发环境测试
3. **性能监控**: 部署后监控指标变化
4. **用户体验**: 确保优化不影响功能

---

**预期结果**: 通过以上优化，LCP 应降至 2.5秒以下，Speed Index 降至 3.4秒以下，显著提升用户体验和 SEO 排名。
