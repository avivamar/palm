# Task 003: 更新 UI 导入路径

> **目标**：将各包中的 UI 组件导入从相对路径更新为 `@rolitt/ui` 标准导入

---

## 📋 任务概述

**前置条件**：Task 001, Task 002 已完成
**当前状态**：各包使用相对路径导入 UI 组件
**目标状态**：各包使用 `@rolitt/ui` 导入 UI 组件
**预计时间**：25 分钟
**风险等级**：中

---

## 🎯 执行步骤

### Step 1: 分析现有导入路径

**查找所有使用 UI 组件的文件**：
```bash
# 搜索相对路径导入
grep -r "from.*components/ui" packages/
grep -r "import.*components/ui" packages/

# 搜索 @/ 路径导入
grep -r "from.*@/components/ui" packages/
grep -r "import.*@/components/ui" packages/
```

### Step 2: 更新 Admin 包导入

#### 2.1 更新 Admin 包的 tsconfig.json
**文件路径**：`packages/admin/tsconfig.json`

**添加 UI 包引用**：
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": "./src",
    "rootDir": "./src",
    "paths": {
      "@/*": ["./*"],
      "@rolitt/ui": ["../../ui/src"],
      "@rolitt/ui/*": ["../../ui/src/*"],
      "@rolitt/shared": ["../shared/src"],
      "@rolitt/shared/*": ["../shared/src/*"]
    }
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../ui" },
    { "path": "../shared" }
  ]
}
```

#### 2.2 更新 Admin 包的 package.json
**文件路径**：`packages/admin/package.json`

**添加 UI 包依赖**：
```json
{
  "dependencies": {
    "@rolitt/ui": "workspace:*",
    "@rolitt/shared": "workspace:*"
  }
}
```

#### 2.3 更新 Admin 组件导入

**示例文件**：`packages/admin/src/components/ModuleCard.tsx`
```typescript
// 更新为
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@rolitt/ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// 原来的导入
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
```

**示例文件**：`packages/admin/src/components/QuickStat.tsx`
```typescript
// 更新为
import { Card, CardContent, CardHeader, CardTitle } from '@rolitt/ui';

// 原来的导入
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
```

### Step 3: 更新 Shopify 包导入

#### 3.1 更新 Shopify 包的 tsconfig.json
**文件路径**：`packages/shopify/tsconfig.json`

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": "./src",
    "rootDir": "./src",
    "paths": {
      "@/*": ["./*"],
      "@rolitt/ui": ["../../ui/src"],
      "@rolitt/ui/*": ["../../ui/src/*"],
      "@rolitt/shared": ["../shared/src"],
      "@rolitt/shared/*": ["../shared/src/*"]
    }
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../ui" },
    { "path": "../shared" }
  ]
}
```

#### 3.2 更新 Shopify 包的 package.json
**文件路径**：`packages/shopify/package.json`

```json
{
  "dependencies": {
    "@rolitt/ui": "workspace:*",
    "@rolitt/shared": "workspace:*"
  }
}
```

#### 3.3 更新 Shopify 组件导入
**批量更新所有 Shopify 包中的 UI 导入**

### Step 4: 更新其他包导入

#### 4.1 更新 Auth 包
**文件路径**：`packages/auth/tsconfig.json` 和 `packages/auth/package.json`

#### 4.2 更新 Email 包
**文件路径**：`packages/email/tsconfig.json` 和 `packages/email/package.json`

#### 4.3 更新 Payments 包
**文件路径**：`packages/payments/tsconfig.json` 和 `packages/payments/package.json`

### Step 5: 批量替换导入语句

**使用正则表达式批量替换**：

#### 5.1 替换相对路径导入
```bash
# 替换 ../../src/components/ui 导入
find packages/ -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "../../src/components/ui/\([^"]*\)"|from "@rolitt/ui"|g'
find packages/ -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '../../src/components/ui/\([^']*\)'|from '@rolitt/ui'|g"

# 替换 @/components/ui 导入
find packages/ -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@/components/ui/\([^"]*\)"|from "@rolitt/ui"|g'
find packages/ -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|from '@/components/ui/\([^']*\)'|from '@rolitt/ui'|g"
```

#### 5.2 优化导入语句
**将多个单独的导入合并为一个**：

```typescript
// 原来的多个导入
import { Button } from '@rolitt/ui';
import { Card } from '@rolitt/ui';
import { Badge } from '@rolitt/ui';

// 合并为一个导入
import { Badge, Button, Card } from '@rolitt/ui';
```

### Step 6: 更新根目录配置

#### 6.1 更新根 tsconfig.json 项目引用
**文件路径**：`tsconfig.json`

```json
{
  "references": [
    { "path": "./packages/ui" },
    { "path": "./packages/shared" },
    { "path": "./packages/admin" },
    { "path": "./packages/auth" },
    { "path": "./packages/email" },
    { "path": "./packages/payments" },
    { "path": "./packages/shopify" }
  ]
}
```

#### 6.2 更新根 package.json
**确保 workspaces 配置正确**：
```json
{
  "workspaces": [
    "packages/*"
  ]
}
```

### Step 7: 处理特殊情况

#### 7.1 处理 utils 函数导入
**如果组件中使用了 utils 函数**：
```typescript
// 更新为从 UI 包导入
import { cn } from '@rolitt/ui';

// 原来的导入
import { cn } from '@/lib/utils';
```

#### 7.2 处理类型导入
```typescript
// 更新为
import type { ButtonProps } from '@rolitt/ui';

// 原来的类型导入
import type { ButtonProps } from '@/components/ui/button';
```

---

## ✅ 验收标准

- [ ] 所有包的 `tsconfig.json` 已更新 UI 包引用
- [ ] 所有包的 `package.json` 已添加 UI 包依赖
- [ ] 所有 UI 组件导入已更新为 `@rolitt/ui`
- [ ] 所有 utils 函数导入已更新
- [ ] 所有类型导入已更新
- [ ] 执行 `npm install` 成功
- [ ] 执行 `npm run build` 成功
- [ ] 执行 `npx tsc --build` 成功
- [ ] 没有 TypeScript 类型错误

---

## 🧪 测试验证

```bash
# 安装依赖
npm install

# 验证 TypeScript 项目引用
npx tsc --build

# 验证各包构建
cd packages/admin && npm run build
cd packages/shopify && npm run build
cd packages/ui && npm run build

# 验证导入路径
grep -r "@rolitt/ui" packages/ | head -10

# 确认没有旧的导入路径
grep -r "components/ui" packages/ || echo "所有导入已更新"
```

---

## 🔄 回滚方案

如果出现问题，可以恢复原有导入：
```bash
# 恢复相对路径导入
find packages/ -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from "@rolitt/ui"|from "../../src/components/ui"|g'

# 恢复 tsconfig.json 配置
git checkout packages/*/tsconfig.json
git checkout packages/*/package.json
```

---

## 📝 注意事项

1. **依赖顺序**：确保 UI 包在其他包之前构建
2. **循环依赖**：避免 UI 包依赖其他业务包
3. **类型安全**：确保所有类型导入正确
4. **构建顺序**：使用 TypeScript 项目引用管理构建顺序
5. **开发体验**：确保 IDE 能正确解析新的导入路径

---

## 🚨 常见问题

**Q: 导入 `@rolitt/ui` 报错 "Module not found"？**
A: 检查根 `tsconfig.json` 中的 paths 配置和包的 references

**Q: TypeScript 编译报错？**
A: 运行 `npx tsc --build --force` 重新构建所有项目引用

**Q: IDE 无法识别导入？**
A: 重启 TypeScript 服务或重新加载 IDE

**Q: 某些组件导入失败？**
A: 检查 `packages/ui/src/index.ts` 中是否正确导出该组件

---

**🎯 完成此任务后，继续执行 Task 004: 标准化 tsconfig 配置**
