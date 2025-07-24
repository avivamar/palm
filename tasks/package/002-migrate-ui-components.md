# Task 002: 迁移 UI 组件到 UI 包

> **目标**：将 `src/components/ui/` 中的所有组件迁移到 `packages/ui/src/components/`

---

## 📋 任务概述

**前置条件**：Task 001 已完成
**当前状态**：UI 组件位于 `src/components/ui/` 目录
**目标状态**：UI 组件位于 `packages/ui/src/components/` 目录
**预计时间**：20 分钟
**风险等级**：中

---

## 🎯 执行步骤

### Step 1: 检查现有 UI 组件
**查看当前 UI 组件列表**：
```bash
ls -la src/components/ui/
```

### Step 2: 迁移核心 UI 组件

#### 2.1 迁移 Button 组件
**源文件**：`src/components/ui/button.tsx`
**目标文件**：`packages/ui/src/components/button.tsx`

**迁移内容**：
```typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

#### 2.2 迁移 Badge 组件
**源文件**：`src/components/ui/badge.tsx`
**目标文件**：`packages/ui/src/components/badge.tsx`

#### 2.3 迁移 Card 组件
**源文件**：`src/components/ui/card.tsx`
**目标文件**：`packages/ui/src/components/card.tsx`

#### 2.4 迁移 Input 组件
**源文件**：`src/components/ui/input.tsx`
**目标文件**：`packages/ui/src/components/input.tsx`

#### 2.5 迁移其他组件
**按照相同模式迁移以下组件**：
- `label.tsx`
- `textarea.tsx`
- `select.tsx`
- `dialog.tsx`
- `tabs.tsx`
- `avatar.tsx`
- `progress.tsx`
- `separator.tsx`
- `switch.tsx`
- `checkbox.tsx`
- `radio-group.tsx`
- `slider.tsx`
- `table.tsx`
- `toast.tsx`
- `toaster.tsx`
- `use-toast.ts`

### Step 3: 处理导入路径

**所有迁移的组件需要更新导入路径**：
```typescript
// 原来的导入
import { cn } from '@/lib/utils';

// 更新为
import { cn } from '@/lib/utils';
```

### Step 4: 更新 UI 包入口文件
**文件路径**：`packages/ui/src/index.ts`

**根据实际迁移的组件更新导出**：
```typescript
export { Avatar, AvatarFallback, AvatarImage } from './components/avatar';
export { Badge, badgeVariants } from './components/badge';
export type { BadgeProps } from './components/badge';
// 基础组件
export { Button, buttonVariants } from './components/button';
// 类型导出
export type { ButtonProps } from './components/button';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/card';

export { Checkbox } from './components/checkbox';
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './components/dialog';
export { Input } from './components/input';
export { Label } from './components/label';

// 反馈组件
export { Progress } from './components/progress';
export { RadioGroup, RadioGroupItem } from './components/radio-group';
// 复合组件
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/select';
// 布局组件
export { Separator } from './components/separator';

export { Slider } from './components/slider';
// 表单组件
export { Switch } from './components/switch';
export { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './components/table';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './components/tabs';

export { Textarea } from './components/textarea';
export { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from './components/toast';

export { Toaster } from './components/toaster';

export { toast, useToast } from './components/use-toast';
// 工具函数
export { cn } from './lib/utils';
```

### Step 5: 创建组件类型定义
**为每个组件创建适当的 TypeScript 类型导出**

### Step 6: 验证组件功能
**创建简单的测试文件验证组件正常工作**：

**文件路径**：`packages/ui/src/__test__/components.test.tsx`
```typescript
import React from 'react';
import { Button, Badge, Card } from '../index';

// 简单的组件渲染测试
const TestComponents = () => {
  return (
    <div>
      <Button>Test Button</Button>
      <Badge>Test Badge</Badge>
      <Card>
        <Card.Header>
          <Card.Title>Test Card</Card.Title>
        </Card.Header>
      </Card>
    </div>
  );
};

export default TestComponents;
```

---

## ✅ 验收标准

- [ ] 所有 UI 组件已迁移到 `packages/ui/src/components/`
- [ ] 组件导入路径已更新为使用内部路径
- [ ] `packages/ui/src/index.ts` 正确导出所有组件
- [ ] 组件类型定义完整
- [ ] 执行 `cd packages/ui && npm run build` 成功
- [ ] 执行 `cd packages/ui && npm run type-check` 成功
- [ ] 原有 `src/components/ui/` 目录保持不变（向后兼容）

---

## 🧪 测试验证

```bash
# 验证 UI 包构建
cd packages/ui
npm run build
npm run type-check

# 验证组件导入
node -e "console.log(Object.keys(require('./packages/ui/src/index.ts')))"

# 验证 TypeScript 类型
npx tsc --noEmit --project packages/ui/tsconfig.json
```

---

## 🔄 回滚方案

如果出现问题，可以删除迁移的文件：
```bash
rm -rf packages/ui/src/components/*
# 恢复 packages/ui/src/index.ts 为空导出
```

---

## 📝 注意事项

1. **保持向后兼容**：不删除原有 `src/components/ui/` 中的文件
2. **导入路径**：确保所有内部导入使用相对路径或 `@/` 别名
3. **类型安全**：确保所有组件的 TypeScript 类型正确导出
4. **依赖管理**：确保 UI 包的依赖项在 package.json 中正确声明
5. **样式处理**：确保 Tailwind CSS 类名在新环境中正常工作

---

## 🚨 常见问题

**Q: 组件导入 `@/lib/utils` 报错？**
A: 检查 `packages/ui/tsconfig.json` 中的 paths 配置

**Q: Radix UI 组件报错？**
A: 确保 `packages/ui/package.json` 中包含所需的 Radix UI 依赖

**Q: Tailwind 样式不生效？**
A: 确保 Tailwind 配置包含 UI 包的路径

---

**🎯 完成此任务后，继续执行 Task 003: 更新 UI 导入路径**
