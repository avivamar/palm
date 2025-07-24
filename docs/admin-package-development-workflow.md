# Admin Package 独立开发工作流

## 🚀 快速开始

### 开发环境设置
```bash
# 1. 打开专用工作区
code admin-dev.code-workspace

# 2. 验证包结构
npm run admin:validate

# 3. 检查类型
npm run admin:check

# 4. 启动开发服务器
npm run dev
```

## 🛠️ 可用命令

### 核心开发命令
```bash
npm run admin:dev          # 启动开发服务器
npm run admin:check        # 检查TypeScript类型 (仅admin包)
npm run admin:validate     # 验证包结构和导出
npm run admin:build-check  # 检查构建状态
```

### 直接脚本调用
```bash
./scripts/admin-dev.sh help                    # 显示帮助
./scripts/admin-dev.sh create-feature analytics # 创建新功能
```

## 📦 开发新功能

### 1. 自动生成功能模板
```bash
# 创建新功能模板
./scripts/admin-dev.sh create-feature analytics

# 这将创建:
# packages/admin/src/features/analytics/
# ├── Analytics.tsx
# ├── types.ts
# └── index.ts
```

### 2. 更新包导出
```typescript
// packages/admin/src/index.ts
export { Analytics } from './features/analytics';
export type { AnalyticsProps, AnalyticsTranslations } from './features/analytics/types';
```

### 3. 创建主应用页面
```typescript
// src/app/[locale]/admin/analytics/page.tsx
import { getTranslations } from 'next-intl/server';
import { Analytics } from '@rolitt/admin';

export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AnalyticsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('admin.analytics');

  const translations = {
    title: t('title'),
    description: t('description'),
  };

  return <Analytics locale={locale} translations={translations} />;
}
```

### 4. 添加翻译
```json
// src/locales/en/admin.json
{
  "analytics": {
    "title": "Analytics",
    "description": "View detailed reports and insights"
  }
}
```

### 5. 更新导航 (可选)
```typescript
// 在AdminSidebar中添加新的导航项
{
  title: translations.analytics,
  href: `/${locale}/admin/analytics`,
  icon: BarChart3,
  disabled: false,
}
```

## 🔄 开发流程

### 日常开发
```bash
# 1. 开发admin功能
cd packages/admin/src/features/your-feature
# 编辑组件...

# 2. 实时类型检查
npm run admin:check

# 3. 验证包结构
npm run admin:validate

# 4. 在浏览器中测试
# http://localhost:3000/admin/your-feature
```

### 调试流程
```bash
# 1. 检查TypeScript错误
npm run admin:check

# 2. 检查导出是否正确
npm run admin:validate

# 3. 检查构建是否通过
npm run admin:build-check

# 4. 检查主应用集成
npm run dev
```

## 📁 VS Code 工作区

使用 `admin-dev.code-workspace` 获得最佳开发体验：

### 特性
- **🎯 多文件夹视图**: Root, Admin Package, Shared Package
- **⚡ 智能导入**: 自动组织导入和类型提示
- **🔧 集成任务**: 内置TypeScript检查和验证任务
- **🎨 语法高亮**: 完整的TSX和TypeScript支持

### 快捷键 (VS Code)
- `Ctrl+Shift+P` > "Tasks: Run Task" > "Admin: Type Check"
- `Ctrl+Shift+P` > "Tasks: Run Task" > "Admin: Validate Package"

## ⚡ 性能优化

### 开发时性能
- **增量编译**: 只重编译改变的admin组件
- **热重载**: admin组件修改立即生效
- **类型检查**: 只检查admin包相关错误

### 构建优化
- **代码分割**: admin功能按需加载
- **树摇**: 未使用的admin组件不会打包
- **类型安全**: 构建时捕获所有类型错误

## 🧪 测试指南

### 组件测试 (计划中)
```bash
# 单元测试
npm test packages/admin

# 集成测试
npm run test:e2e -- admin
```

### 手动测试清单
- [ ] 组件正确渲染
- [ ] 翻译正确显示
- [ ] 响应式布局正常
- [ ] 导航菜单工作
- [ ] 状态管理正常

## 🔗 相关资源

- **包文档**: [packages/admin/README.md](../packages/admin/README.md)
- **主应用Admin路由**: [src/app/[locale]/admin/](../src/app/[locale]/admin/)
- **翻译文件**: [src/locales/*/admin.json](../src/locales/)
- **开发脚本**: [scripts/admin-dev.sh](../scripts/admin-dev.sh)

## 🏆 最佳实践

### 组件开发
1. **'use client'**: 所有admin组件使用客户端组件
2. **TypeScript**: 完整的类型定义和接口
3. **Props传递**: 通过props接收数据和翻译
4. **状态管理**: 使用useAdminStore进行状态管理

### 代码组织
1. **功能分组**: 按feature组织，不按类型
2. **清晰导出**: 每个功能都有index.ts导出
3. **类型安全**: 导出所有公共类型
4. **文档齐全**: README和代码注释

### 性能考虑
1. **懒加载**: 使用动态导入大组件
2. **memo优化**: 对复杂组件使用React.memo
3. **依赖优化**: useEffect正确的依赖数组
4. **避免重渲染**: 正确使用useCallback和useMemo

---

**🎯 目标**: 提供高效、类型安全、易维护的Admin包开发体验
