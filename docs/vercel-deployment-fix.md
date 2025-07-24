# Vercel 部署问题修复文档

## 问题描述

在 Vercel 部署时遇到以下错误：
```
Error: ENOENT: no such file or directory, lstat '/vercel/path0/.next/server/app/[locale]/(marketing)/page_client-reference-manifest.js'
```

这是一个"幽灵问题"，本地 build 和 dev 都正常，但在 Vercel 部署时失败。

## 问题根源

经过分析发现，问题的根本原因是**重复路由冲突**：

1. **重复的页面文件**：
   - `src/app/[locale]/page.tsx` (根级别首页)
   - `src/app/[locale]/(marketing)/page.tsx` (营销路由组首页)

2. **Next.js 构建冲突**：
   - 两个文件内容完全相同
   - Next.js App Router 在生成客户端引用清单时产生冲突
   - Vercel 的构建环境对此更加敏感

## 解决方案

### 1. 删除重复文件
删除了 `src/app/[locale]/(marketing)/page.tsx` 文件，保留根级别的首页。

### 2. 集成营销布局功能
将营销路由组的布局功能直接集成到根级别首页中：

```tsx
// 添加营销布局组件
import { PageTransition } from '@/components/PageTransition';
import { ScrollIndicator } from '@/components/ScrollIndicator';
import { ScrollToTop } from '@/components/ScrollToTop';

// 在组件中使用
return (
  <>
    <ProductJsonLd />
    <ScrollIndicator />
    <PageTransition>
      <div className="flex flex-col w-full">
        <StaticHero />
        <StaticFeatures />
        <BlogShowcase posts={featuredPosts} />
        <StaticFAQ />
        <CTA />
      </div>
    </PageTransition>
    <ScrollToTop />
  </>
);
```

### 3. 验证修复
- ✅ 本地构建成功
- ✅ 路由结构正确
- ✅ 功能完整保留

## 最终路由结构

```
src/app/[locale]/
├── page.tsx                    # 根级别首页（唯一）
├── layout.tsx                  # 根级别布局
├── (marketing)/               # 营销路由组
│   ├── layout.tsx            # 营销布局（功能已集成到首页）
│   ├── about/page.tsx
│   ├── blog/page.tsx
│   ├── contact/page.tsx
│   └── ...其他营销页面
└── (auth)/                   # 认证路由组
    ├── dashboard/page.tsx
    └── ...其他认证页面
```

## 预防措施

1. **避免重复路由**：确保同一路径下不存在多个 `page.tsx` 文件
2. **路由组设计**：明确路由组的职责，避免功能重叠
3. **构建测试**：在部署前进行本地构建测试
4. **代码审查**：在 PR 中检查路由结构变更

## 技术细节

### Next.js App Router 路由解析
- Next.js 按照文件系统路由解析页面
- 路由组 `(group)` 不影响 URL 结构，但提供布局隔离
- 重复路由会导致构建时的客户端引用清单冲突

### Vercel vs 本地环境差异
- Vercel 的构建环境对路由冲突更加敏感
- 本地开发可能不会暴露某些构建时问题
- 建议在部署前进行完整的生产构建测试

## 相关文件

- `src/app/[locale]/page.tsx` - 修复后的首页
- `docs/vercel-deployment-fix.md` - 本文档
- `.cursorrules` - 项目开发规范

## 参考资料

- [Next.js App Router 文档](https://nextjs.org/docs/app)
- [Next.js 路由组文档](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Vercel 部署文档](https://vercel.com/docs/deployments)
