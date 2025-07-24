# Task 007: 重构 Shared 包结构

> **目标**：优化 `@rolitt/shared` 包的结构和导出，提供更好的类型和工具支持

---

## 📋 任务概述

**前置条件**：Task 001-006 已完成
**当前状态**：Shared 包结构可能不够清晰
**目标状态**：Shared 包结构清晰，导出完整
**预计时间**：20 分钟
**风险等级**：中

---

## 🎯 执行步骤

### Step 1: 分析现有 Shared 包结构

**查看当前结构**：
```bash
ls -la packages/shared/src/
```

### Step 2: 重构 Shared 包目录结构

#### 2.1 标准化目录结构
```
packages/shared/src/
├── index.ts              # 主入口文件
├── types/                # 类型定义
│   ├── index.ts
│   ├── auth.ts
│   ├── user.ts
│   ├── module.ts
│   └── api.ts
├── constants/            # 常量定义
│   ├── index.ts
│   ├── api.ts
│   ├── routes.ts
│   └── config.ts
├── utils/                # 工具函数
│   ├── index.ts
│   ├── validation.ts
│   ├── formatting.ts
│   └── helpers.ts
├── hooks/                # 共享 React Hooks
│   ├── index.ts
│   ├── useAuth.ts
│   ├── useApi.ts
│   └── useLocalStorage.ts
├── contracts/            # API 契约
│   ├── index.ts
│   ├── auth.ts
│   ├── user.ts
│   └── module.ts
└── schemas/              # 验证模式
    ├── index.ts
    ├── auth.ts
    ├── user.ts
    └── module.ts
```

### Step 3: 创建类型定义

#### 3.1 更新主类型文件
**文件路径**：`packages/shared/src/types/index.ts`

```typescript
export * from './api';
// 重新导出所有类型
export * from './auth';
export * from './module';
export * from './user';

// 通用类型
export type BaseEntity = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PaginationParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type Status = 'idle' | 'loading' | 'success' | 'error';

export type LoadingState = {
  status: Status;
  error?: string;
};
```

#### 3.2 创建认证类型
**文件路径**：`packages/shared/src/types/auth.ts`

```typescript
import { BaseEntity } from './index';

export type User = {
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  lastLoginAt?: Date;
} & BaseEntity;

export type AdminUser = {
  permissions: Permission[];
  modules: ModuleAccess[];
} & User;

export type UserRole = 'admin' | 'user' | 'moderator';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export type Permission = {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
};

export type ModuleAccess = {
  moduleId: string;
  permissions: string[];
  enabled: boolean;
};

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type RegisterData = {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};
```

#### 3.3 创建模块类型
**文件路径**：`packages/shared/src/types/module.ts`

```typescript
import { BaseEntity } from './index';

export type Module = {
  name: string;
  description: string;
  version: string;
  status: ModuleStatus;
  category: ModuleCategory;
  icon?: string;
  settings: ModuleSettings;
  dependencies: string[];
} & BaseEntity;

export type ModuleStatus = 'active' | 'inactive' | 'maintenance' | 'deprecated';
export type ModuleCategory = 'core' | 'integration' | 'utility' | 'custom';

export type ModuleSettings = {
  [key: string]: any;
};

export type ModuleState = {
  modules: Module[];
  activeModule?: Module;
  isLoading: boolean;
  error?: string;
};

export type ModuleConfig = {
  id: string;
  enabled: boolean;
  settings: ModuleSettings;
  lastUpdated: Date;
};
```

#### 3.4 创建 API 类型
**文件路径**：`packages/shared/src/types/api.ts`

```typescript
export type ApiEndpoint = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description?: string;
};

export type ApiError = {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
};

export type RequestConfig = {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
};

export type WebhookPayload = {
  event: string;
  data: any;
  timestamp: Date;
  signature?: string;
};
```

### Step 4: 创建常量定义

#### 4.1 API 常量
**文件路径**：`packages/shared/src/constants/api.ts`

```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
  },
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    GET: (id: string) => `/users/${id}`,
  },
  MODULES: {
    LIST: '/modules',
    GET: (id: string) => `/modules/${id}`,
    UPDATE: (id: string) => `/modules/${id}`,
    SETTINGS: (id: string) => `/modules/${id}/settings`,
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const API_CONFIG = {
  TIMEOUT: 10000,
  RETRIES: 3,
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
} as const;
```

#### 4.2 路由常量
**文件路径**：`packages/shared/src/constants/routes.ts`

```typescript
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ADMIN: {
    ROOT: '/admin',
    USERS: '/admin/users',
    MODULES: '/admin/modules',
    SETTINGS: '/admin/settings',
  },
  SHOPIFY: {
    ROOT: '/shopify',
    PRODUCTS: '/shopify/products',
    ORDERS: '/shopify/orders',
    CUSTOMERS: '/shopify/customers',
  },
} as const;

export const EXTERNAL_LINKS = {
  DOCUMENTATION: 'https://docs.rolitt.com',
  SUPPORT: 'https://support.rolitt.com',
  GITHUB: 'https://github.com/rolitt',
} as const;
```

### Step 5: 创建工具函数

#### 5.1 验证工具
**文件路径**：`packages/shared/src/utils/validation.ts`

```typescript
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  // 至少8位，包含大小写字母和数字
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

export const validateLength = (value: string, min: number, max?: number): boolean => {
  const length = value.length;
  if (length < min) {
    return false;
  }
  if (max && length > max) {
    return false;
  }
  return true;
};
```

#### 5.2 格式化工具
**文件路径**：`packages/shared/src/utils/formatting.ts`

```typescript
export const formatDate = (date: Date | string, format: 'short' | 'long' | 'time' = 'short'): string => {
  const d = new Date(date);

  switch (format) {
    case 'short':
      return d.toLocaleDateString();
    case 'long':
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'time':
      return d.toLocaleTimeString();
    default:
      return d.toLocaleDateString();
  }
};

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
```

### Step 6: 创建共享 Hooks

#### 6.1 本地存储 Hook
**文件路径**：`packages/shared/src/hooks/useLocalStorage.ts`

```typescript
import { useEffect, useState } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = typeof value === 'function' ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
```

### Step 7: 更新 Shared 包入口文件

**文件路径**：`packages/shared/src/index.ts`

```typescript
// 默认导出
export { default as packageInfo } from '../package.json';

// 常量导出
export * from './constants';

// 契约导出
export * from './contracts';

// Hooks 导出
export * from './hooks';

// 模式导出
export * from './schemas';

// 类型导出
export * from './types';

// 工具函数导出
export * from './utils';
```

### Step 8: 更新 Shared 包配置

#### 8.1 更新 package.json
**文件路径**：`packages/shared/package.json`

```json
{
  "name": "@rolitt/shared",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types/index.ts",
    "./constants": "./src/constants/index.ts",
    "./utils": "./src/utils/index.ts",
    "./hooks": "./src/hooks/index.ts",
    "./contracts": "./src/contracts/index.ts",
    "./schemas": "./src/schemas/index.ts"
  },
  "scripts": {
    "build": "tsc --noEmit",
    "dev": "tsc --noEmit --watch",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "typescript": "^5.2.2"
  },
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  }
}
```

---

## ✅ 验收标准

- [ ] Shared 包目录结构重构完成
- [ ] 类型定义完整且正确
- [ ] 常量定义清晰且有用
- [ ] 工具函数实用且经过测试
- [ ] 共享 Hooks 创建完成
- [ ] 入口文件正确导出所有模块
- [ ] package.json 配置更新完成
- [ ] 执行 `cd packages/shared && npm run build` 成功
- [ ] 执行 `cd packages/shared && npm run type-check` 成功

---

## 🧪 测试验证

```bash
# 验证 Shared 包构建
cd packages/shared
npm run build
npm run type-check

# 验证导出
node -e "console.log(Object.keys(require('./packages/shared/src/index.ts')))"

# 验证类型导入
echo "import { User, Module } from '@rolitt/shared';" | npx tsc --noEmit --stdin
```

---

## 🔄 回滚方案

```bash
# 恢复原有结构
git checkout packages/shared/
```

---

## 📝 注意事项

1. **向后兼容**：确保现有导入不会破坏
2. **类型安全**：所有类型定义要完整且正确
3. **文档化**：为复杂的工具函数添加注释
4. **测试覆盖**：重要的工具函数需要测试
5. **性能考虑**：避免在 Hooks 中进行重复计算

---

**🎯 完成此任务后，继续执行 Task 008: 迁移共享类型定义**
