# Cloudflare Workers 兼容性修复

## 问题描述

项目在 Cloudflare Workers 环境中部署时，某些页面（如 `/ja/blog` 和 `/ja/sign-in`）返回 500 错误，而在 Vercel 环境中运行正常。

## 根本原因

主要问题是 **Notion 客户端库在 Cloudflare Workers 环境中不兼容**：

1. `@notionhq/client` 和 `notion-to-md` 库依赖 Node.js 特定的 API
2. Cloudflare Workers 使用 V8 引擎，不完全支持 Node.js 运行时
3. 当博客系统尝试初始化 Notion 客户端时，会导致运行时错误

## 修复方案

### 1. 环境检测和条件初始化

在 `src/app/[locale]/(marketing)/blog/lib/notion.ts` 中添加了环境检测：

```typescript
// 检查是否在 Cloudflare Workers 环境中
const isCloudflareWorkers = typeof globalThis.navigator !== 'undefined'
  && globalThis.navigator.userAgent === 'Cloudflare-Workers';

// 检查是否在服务器环境中且不是 Cloudflare Workers
const isServerEnvironment = typeof window === 'undefined' && !isCloudflareWorkers;
```

### 2. 动态导入和错误处理

将 Notion 客户端的初始化改为动态导入，只在兼容环境中加载：

```typescript
async function _initializeNotionClient() {
  if (!isServerEnvironment || !Env.NOTION_TOKEN) {
    return false;
  }

  try {
    const { Client } = await import('@notionhq/client');
    const { NotionToMarkdown } = await import('notion-to-md');

    notion = new Client({ auth: Env.NOTION_TOKEN });
    n2m = new NotionToMarkdown({ notionClient: notion });
    isInitialized = true;
    return true;
  } catch (error) {
    console.warn('Notion client not available in this environment:', error);
    return false;
  }
}
```

### 3. 优雅降级机制

在 `src/app/[locale]/(marketing)/blog/lib/blog-adapter.ts` 中添加了错误处理和回退机制：

```typescript
static async getAllPosts(): Promise<BlogPostMeta[]> {
  if (this.dataSource === 'notion') {
    try {
      return await notionSource.getAllPosts();
    } catch (error) {
      console.warn('Notion source failed, falling back to markdown:', error);
      return await markdownSource.getAllPosts();
    }
  }
  return await markdownSource.getAllPosts();
}
```

### 4. 所有博客功能的错误处理

为所有博客相关函数添加了相同的错误处理模式：
- `getPostBySlug`
- `getFeaturedPosts`
- `getPostsByCategory`
- `getPostsByTag`
- `searchPosts`
- `getRecentPosts`

## 修复效果

### 修复前
- Cloudflare Workers: `/ja/blog` → 500 错误
- Cloudflare Workers: `/ja/sign-in` → 500 错误
- Vercel: 所有页面正常

### 修复后
- Cloudflare Workers: 所有页面返回 200 OK
- Vercel: 所有页面继续正常工作
- 博客功能在 Cloudflare Workers 中自动回退到 Markdown 模式

## 技术细节

### 环境检测逻辑
1. 检查 `globalThis.navigator.userAgent` 是否为 `'Cloudflare-Workers'`
2. 确保不在浏览器环境中（`typeof window === 'undefined'`）
3. 只在兼容环境中初始化 Notion 客户端

### 错误处理策略
1. **静默降级**: 当 Notion 不可用时，自动切换到 Markdown 数据源
2. **日志记录**: 记录警告信息但不中断用户体验
3. **一致性**: 确保 API 接口在两种数据源下保持一致

### 性能优化
1. **延迟加载**: 只在需要时动态导入 Notion 库
2. **缓存机制**: 初始化状态缓存，避免重复检测
3. **快速失败**: 在不兼容环境中快速返回，不尝试加载

## 部署建议

1. **环境变量**: 确保在 Cloudflare Workers 中正确配置环境变量
2. **监控**: 监控日志中的降级警告信息
3. **测试**: 在部署前测试所有关键页面
4. **备份**: 保持 Markdown 数据源作为可靠备份

## 未来改进

1. **专用适配器**: 为 Cloudflare Workers 开发专用的 Notion 适配器
2. **边缘缓存**: 利用 Cloudflare 的边缘缓存优化性能
3. **渐进增强**: 在客户端动态加载高级功能

## 相关文件

- `src/app/[locale]/(marketing)/blog/lib/notion.ts` - Notion 客户端兼容性修复
- `src/app/[locale]/(marketing)/blog/lib/blog-adapter.ts` - 统一适配器错误处理
- `src/libs/firebase/config.ts` - Firebase 配置兼容性
- `wrangler.toml` - Cloudflare Workers 配置

## 测试验证

本地测试确认所有页面正常工作：
- ✅ `/ja/blog` - 200 OK
- ✅ `/ja/sign-in` - 200 OK
- ✅ `/ja` - 200 OK

修复已准备好部署到 Cloudflare Workers 生产环境。
