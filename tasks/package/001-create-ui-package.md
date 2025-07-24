# Task 001: 创建 UI 包

> **目标**：创建独立的 `@rolitt/ui` 包，为迁移共享 UI 组件做准备

---

## 📋 任务概述

**当前状态**：UI 组件位于 `src/components/ui/` 目录
**目标状态**：创建 `packages/ui` 包，支持 `@rolitt/ui` 导入
**预计时间**：15 分钟
**风险等级**：低

---

## 🎯 执行步骤

### Step 1: 创建 UI 包目录结构
```bash
mkdir -p packages/ui/src/components
mkdir -p packages/ui/src/lib
```

### Step 2: 创建 UI 包的 package.json
**文件路径**：`packages/ui/package.json`
```json
{
  "name": "@rolitt/ui",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./components/*": "./src/components/*.tsx",
    "./lib/*": "./src/lib/*.ts"
  },
  "scripts": {
    "build": "tsc --noEmit",
    "dev": "tsc --noEmit --watch",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.294.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.2.2"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  }
}
```

### Step 3: 创建 UI 包的 tsconfig.json
**文件路径**：`packages/ui/tsconfig.json`
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "baseUrl": "./src",
    "rootDir": "./src",
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true,
    "composite": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"]
    }
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ],
  "references": []
}
```

### Step 4: 创建 UI 包的入口文件
**文件路径**：`packages/ui/src/index.ts`
```typescript
export { Avatar, AvatarFallback, AvatarImage } from './components/avatar';
export { Badge } from './components/badge';
export type { BadgeProps } from './components/badge';
// UI Components
export { Button } from './components/button';
// Types
export type { ButtonProps } from './components/button';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/card';
export type { CardProps } from './components/card';
export { Checkbox } from './components/checkbox';
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './components/dialog';
export { Input } from './components/input';
export type { InputProps } from './components/input';
export { Label } from './components/label';
export type { LabelProps } from './components/label';
export { Progress } from './components/progress';
export { RadioGroup, RadioGroupItem } from './components/radio-group';
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/select';
export { Separator } from './components/separator';
export { Slider } from './components/slider';
export { Switch } from './components/switch';
export { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './components/table';

export { Tabs, TabsContent, TabsList, TabsTrigger } from './components/tabs';

export { Textarea } from './components/textarea';
export type { TextareaProps } from './components/textarea';
export { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from './components/toast';
export { Toaster } from './components/toaster';
export { toast, useToast } from './components/use-toast';
// Utility functions
export { cn } from './lib/utils';
```

### Step 5: 创建 utils 工具函数
**文件路径**：`packages/ui/src/lib/utils.ts`
```typescript
import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Step 6: 更新根目录 package.json
**在 workspaces 中添加 ui 包**：
```json
{
  "workspaces": [
    "packages/*"
  ]
}
```

### Step 7: 更新根目录 tsconfig.json
**添加 @rolitt/ui 路径映射**：
```json
{
  "compilerOptions": {
    "paths": {
      "@rolitt/ui": ["./packages/ui/src"],
      "@rolitt/ui/*": ["./packages/ui/src/*"],
      "@rolitt/admin": ["./packages/admin/src"],
      "@rolitt/admin/*": ["./packages/admin/src/*"],
      "@rolitt/shared": ["./packages/shared/src"],
      "@rolitt/shared/*": ["./packages/shared/src/*"],
      "@rolitt/auth": ["./packages/auth/src"],
      "@rolitt/auth/*": ["./packages/auth/src/*"],
      "@rolitt/email": ["./packages/email/src"],
      "@rolitt/email/*": ["./packages/email/src/*"],
      "@rolitt/payments": ["./packages/payments/src"],
      "@rolitt/payments/*": ["./packages/payments/src/*"],
      "@rolitt/shopify": ["./packages/shopify/src"],
      "@rolitt/shopify/*": ["./packages/shopify/src/*"]
    }
  }
}
```

---

## ✅ 验收标准

- [ ] `packages/ui` 目录结构创建完成
- [ ] `packages/ui/package.json` 配置正确
- [ ] `packages/ui/tsconfig.json` 配置正确
- [ ] `packages/ui/src/index.ts` 入口文件创建
- [ ] `packages/ui/src/lib/utils.ts` 工具函数创建
- [ ] 根目录 `tsconfig.json` 路径映射更新
- [ ] 执行 `npm install` 成功
- [ ] 执行 `npm run build` 无错误

---

## 🧪 测试验证

```bash
# 安装依赖
npm install

# 验证 TypeScript 配置
npx tsc --noEmit

# 验证 UI 包构建
cd packages/ui && npm run build

# 验证路径映射
node -e "console.log(require.resolve('@rolitt/ui'))"
```

---

## 🔄 回滚方案

如果出现问题，可以删除以下内容回滚：
```bash
rm -rf packages/ui
# 恢复 tsconfig.json 中的 paths 配置
```

---

## 📝 注意事项

1. **依赖管理**：UI 包使用 peerDependencies 避免重复安装 React
2. **TypeScript 配置**：使用 composite 模式支持项目引用
3. **导出策略**：支持按需导入和批量导入
4. **向后兼容**：暂时不删除原有 UI 组件，保持系统稳定

---

**🎯 完成此任务后，继续执行 Task 002: 迁移 UI 组件**
