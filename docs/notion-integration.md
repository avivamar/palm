# Notion 博客集成指南

本项目支持使用 Notion 作为博客内容管理系统（CMS），同时保持与现有 Markdown 文件的兼容性。

## 功能特性

- 🔄 **智能数据源切换**：根据环境变量自动选择 Notion 或 Markdown 作为数据源
- 📝 **无缝内容管理**：市场团队可以在 Notion 中直接编辑和发布文章
- 🚀 **零停机迁移**：可以逐步从 Markdown 迁移到 Notion，无需重构现有代码
- 🎨 **保持现有设计**：前端界面和样式完全不变
- 🔍 **完整功能支持**：搜索、分类、标签、特色文章等功能完全兼容

## 设置步骤

### 1. 创建 Notion Integration

1. 访问 [Notion Developers](https://www.notion.so/my-integrations)
2. 点击 "+ New integration"
3. 填写集成信息：
   - Name: `Rolitt Blog Integration`
   - Associated workspace: 选择你的工作空间
   - Type: Internal
4. 点击 "Submit" 创建集成
5. 复制生成的 "Internal Integration Token"

### 2. 创建 Notion 数据库

1. 在 Notion 中创建一个新页面
2. 添加一个数据库，包含以下属性：

| 属性名 | 类型 | 说明 |
|--------|------|------|
| Title | Title | 文章标题 |
| Slug | Rich text | URL 路径（唯一标识符）|
| Date | Date | 发布日期 |
| Excerpt | Rich text | 文章摘要 |
| Author | Rich text | 作者 |
| Category | Select | 分类 |
| Tags | Multi-select | 标签 |
| Published | Checkbox | 是否发布 |
| Featured | Select | 是否为特色文章（需创建名为 'true' 的选项）|
| Image | URL | 封面图片链接 |

3. 将数据库共享给你的集成：
   - 点击数据库右上角的 "Share"
   - 点击 "Invite"
   - 搜索并选择你刚创建的集成
   - 给予 "Can edit" 权限

### 3. 获取数据库 ID

数据库 ID 可以从 Notion 数据库 URL 中获取：
```
https://www.notion.so/your-workspace/DATABASE_ID?v=...
```

### 4. 配置环境变量

在项目根目录的 `.env.local` 文件中添加：

```bash
# Notion Blog Integration
NOTION_TOKEN=secret_your_integration_token_here
NOTION_DATABASE_ID=your_database_id_here
```

### 5. Notion 客户端配置

为提高数据获取的稳定性，建议在 Notion 客户端初始化时增加超时配置。

打开 `src/app/[locale]/(marketing)/blog/lib/notion.ts` 文件，找到 `new Client()` 的部分，并添加 `timeoutMs` 选项：

```javascript
notion = new Client({
  auth: Env.NOTION_TOKEN,
  timeoutMs: 30000, // 超时时间设置为 30 秒
});
```

## 使用方法

### 创建新文章

1. 在 Notion 数据库中点击 "+ New"
2. 填写文章信息：
   - **Title**: 文章标题
   - **Slug**: URL 路径（如：`my-first-post`）
   - **Date**: 发布日期
   - **Excerpt**: 简短摘要
   - **Author**: 作者姓名
   - **Category**: 选择分类
   - **Tags**: 添加标签
   - **Published**: 勾选以发布
   - **Featured**: 勾选以设为特色文章
   - **Image**: 封面图片 URL

3. 在页面正文中编写文章内容（支持 Notion 的所有格式）
4. 保存后，文章将自动在网站上显示

### 编辑现有文章

1. 在 Notion 数据库中找到要编辑的文章
2. 直接修改内容或属性
3. 保存后更改会立即生效

### 管理文章状态

- **发布文章**: 勾选 "Published" 复选框
- **隐藏文章**: 取消勾选 "Published" 复选框
- **设为特色**: 在 "Featured" 属性中选择 'true' 选项
- **分类管理**: 在 "Category" 下拉菜单中添加新选项
- **标签管理**: 在 "Tags" 多选菜单中添加新标签

## 数据源切换

系统会根据环境变量自动选择数据源：

- **有 Notion 配置**: 使用 Notion 作为数据源
- **无 Notion 配置**: 使用 Markdown 文件作为数据源

这意味着你可以：
1. 在开发环境中使用 Markdown 文件
2. 在生产环境中使用 Notion
3. 随时在两者之间切换而无需修改代码

## 内容格式支持

Notion 内容会自动转换为 Markdown 格式，支持：

- ✅ 标题（H1-H6）
- ✅ 段落和换行
- ✅ **粗体** 和 *斜体*
- ✅ 链接
- ✅ 图片
- ✅ 列表（有序和无序）
- ✅ 引用块
- ✅ 代码块和行内代码
- ✅ 表格
- ✅ 分隔线

## 性能优化

- 文章内容会在构建时预渲染
- 支持 Next.js 的静态生成（SSG）
- 自动计算阅读时间
- 响应式图片处理

## 故障排除

### 常见问题

**Q: 文章没有显示在网站上**
A: 检查以下项目：
- 确保 "Published" 复选框已勾选
- 确认 Notion 集成有访问数据库的权限
- 检查环境变量是否正确配置

**Q: 图片无法显示**
A: 确保图片 URL 是公开可访问的，Notion 内部图片需要使用外部图床

**Q: 内容格式不正确**
A: 某些 Notion 特有的块类型可能不支持，建议使用标准的 Markdown 兼容格式

### 调试模式

在开发环境中，你可以检查当前使用的数据源：

```javascript
import { BlogAdapter } from './lib/blog-adapter';

console.log('Current data source:', BlogAdapter.getDataSourceType());
```

## 迁移建议

### 从 Markdown 迁移到 Notion

1. **准备阶段**：设置 Notion 数据库和集成
2. **测试阶段**：在开发环境中测试 Notion 集成
3. **内容迁移**：将现有 Markdown 文章手动复制到 Notion
4. **生产部署**：配置生产环境的 Notion 环境变量
5. **验证阶段**：确认所有功能正常工作

### 保持双重支持

你也可以选择保持两种数据源并存：
- 技术文档使用 Markdown（便于版本控制）
- 营销内容使用 Notion（便于团队协作）

## 技术架构

```
┌─────────────────┐    ┌──────────────────┐
│   Blog Pages    │    │   Blog Adapter   │
│                 │───▶│                  │
│ - page.tsx      │    │ - Auto-detection │
│ - [slug]/page   │    │ - Unified API    │
└─────────────────┘    └──────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
            ┌───────────────┐       ┌───────────────┐
            │   Markdown    │       │    Notion     │
            │   Source      │       │    Source     │
            │               │       │               │
            │ - File system │       │ - Notion API  │
            │ - Gray matter │       │ - notion-to-md│
            └───────────────┘       └───────────────┘
```

这种架构确保了：
- 代码的可维护性
- 数据源的灵活切换
- 功能的完整性
- 性能的优化
