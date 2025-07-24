# Task 004: 标准化 tsconfig 配置

> **目标**：创建标准化的 TypeScript 配置模板，确保所有包使用一致的配置

---

## 📋 任务概述

**前置条件**：Task 001-003 已完成
**当前状态**：各包 tsconfig.json 配置不一致
**目标状态**：所有包使用标准化的 TypeScript 配置
**预计时间**：20 分钟
**风险等级**：低

---

## 🎯 执行步骤

### Step 1: 创建基础 tsconfig 模板

#### 1.1 创建共享基础配置
**文件路径**：`tsconfig.base.json`

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "forceConsistentCasingInFileNames": true,
    "allowSyntheticDefaultImports": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "exclude": [
    "node_modules",
    "dist",
    ".next",
    "out"
  ]
}
```

#### 1.2 创建包配置模板
**文件路径**：`tsconfig.package.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": "./src",
    "rootDir": "./src",
    "outDir": "./dist",
    "composite": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx"
  ]
}
```

### Step 2: 更新根目录 tsconfig.json

**文件路径**：`tsconfig.json`

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@rolitt/ui": ["./packages/ui/src"],
      "@rolitt/ui/*": ["./packages/ui/src/*"],
      "@rolitt/shared": ["./packages/shared/src"],
      "@rolitt/shared/*": ["./packages/shared/src/*"],
      "@rolitt/admin": ["./packages/admin/src"],
      "@rolitt/admin/*": ["./packages/admin/src/*"],
      "@rolitt/auth": ["./packages/auth/src"],
      "@rolitt/auth/*": ["./packages/auth/src/*"],
      "@rolitt/email": ["./packages/email/src"],
      "@rolitt/email/*": ["./packages/email/src/*"],
      "@rolitt/payments": ["./packages/payments/src"],
      "@rolitt/payments/*": ["./packages/payments/src/*"],
      "@rolitt/shopify": ["./packages/shopify/src"],
      "@rolitt/shopify/*": ["./packages/shopify/src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
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

### Step 3: 标准化 UI 包配置

**文件路径**：`packages/ui/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": "./src",
    "rootDir": "./src",
    "outDir": "./dist",
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
    "dist",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx"
  ],
  "references": []
}
```

### Step 4: 标准化 Shared 包配置

**文件路径**：`packages/shared/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": "./src",
    "rootDir": "./src",
    "outDir": "./dist",
    "composite": true,
    "paths": {
      "@/*": ["./*"],
      "@/types/*": ["./types/*"],
      "@/utils/*": ["./utils/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/contracts/*": ["./contracts/*"]
    }
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx"
  ],
  "references": []
}
```

### Step 5: 标准化业务包配置

#### 5.1 Admin 包配置
**文件路径**：`packages/admin/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": "./src",
    "rootDir": "./src",
    "outDir": "./dist",
    "composite": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/pages/*": ["./pages/*"],
      "@/types/*": ["./types/*"],
      "@/utils/*": ["./utils/*"],
      "@rolitt/ui": ["../ui/src"],
      "@rolitt/ui/*": ["../ui/src/*"],
      "@rolitt/shared": ["../shared/src"],
      "@rolitt/shared/*": ["../shared/src/*"]
    }
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx"
  ],
  "references": [
    { "path": "../ui" },
    { "path": "../shared" }
  ]
}
```

#### 5.2 Shopify 包配置
**文件路径**：`packages/shopify/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": "./src",
    "rootDir": "./src",
    "outDir": "./dist",
    "composite": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/types/*": ["./types/*"],
      "@/utils/*": ["./utils/*"],
      "@rolitt/ui": ["../ui/src"],
      "@rolitt/ui/*": ["../ui/src/*"],
      "@rolitt/shared": ["../shared/src"],
      "@rolitt/shared/*": ["../shared/src/*"]
    }
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx"
  ],
  "references": [
    { "path": "../ui" },
    { "path": "../shared" }
  ]
}
```

#### 5.3 其他包配置
**按照相同模式更新以下包**：
- `packages/auth/tsconfig.json`
- `packages/email/tsconfig.json`
- `packages/payments/tsconfig.json`

### Step 6: 创建构建脚本

#### 6.1 更新根 package.json 脚本
**文件路径**：`package.json`

```json
{
  "scripts": {
    "build": "turbo build",
    "build:packages": "tsc --build",
    "clean": "turbo clean && rm -rf .next",
    "clean:packages": "tsc --build --clean",
    "dev": "turbo dev",
    "type-check": "tsc --noEmit",
    "type-check:packages": "tsc --build --dry"
  }
}
```

#### 6.2 创建 turbo.json 配置
**文件路径**：`turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "type-check": {
      "dependsOn": ["^build"]
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

### Step 7: 验证配置一致性

#### 7.1 创建配置验证脚本
**文件路径**：`scripts/validate-tsconfig.js`

```javascript
const fs = require('node:fs');
const path = require('node:path');

const packagesDir = path.join(__dirname, '../packages');
const packages = fs.readdirSync(packagesDir);

const requiredFields = [
  'extends',
  'compilerOptions.baseUrl',
  'compilerOptions.rootDir',
  'compilerOptions.composite',
  'include'
];

packages.forEach((pkg) => {
  const tsconfigPath = path.join(packagesDir, pkg, 'tsconfig.json');

  if (fs.existsSync(tsconfigPath)) {
    const config = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

    console.log(`\n验证 ${pkg} 包配置:`);

    requiredFields.forEach((field) => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], config);
      const status = value !== undefined ? '✅' : '❌';
      console.log(`  ${status} ${field}: ${value || '未设置'}`);
    });
  }
});
```

---

## ✅ 验收标准

- [ ] `tsconfig.base.json` 基础配置创建完成
- [ ] 根目录 `tsconfig.json` 配置标准化
- [ ] 所有包的 `tsconfig.json` 使用一致的结构
- [ ] 所有包正确配置项目引用 (references)
- [ ] 路径映射配置正确且一致
- [ ] `turbo.json` 构建配置创建完成
- [ ] 执行 `npm run type-check` 成功
- [ ] 执行 `npx tsc --build` 成功
- [ ] 执行 `npm run build:packages` 成功

---

## 🧪 测试验证

```bash
# 验证 TypeScript 配置
npx tsc --showConfig

# 验证项目引用构建
npx tsc --build --verbose

# 验证各包类型检查
for pkg in packages/*/; do
  echo "检查 $pkg"
  cd "$pkg" && npx tsc --noEmit
  cd ../..
done

# 运行配置验证脚本
node scripts/validate-tsconfig.js

# 验证 Turbo 构建
npm run build:packages
```

---

## 🔄 回滚方案

如果出现问题，可以恢复原有配置：
```bash
# 删除新创建的配置文件
rm tsconfig.base.json
rm tsconfig.package.json
rm turbo.json
rm scripts/validate-tsconfig.js

# 恢复原有 tsconfig.json 文件
git checkout tsconfig.json
git checkout packages/*/tsconfig.json
```

---

## 📝 注意事项

1. **配置继承**：确保所有包正确继承基础配置
2. **路径映射**：保持路径映射的一致性和正确性
3. **项目引用**：正确设置依赖关系，避免循环引用
4. **构建顺序**：确保依赖包在使用包之前构建
5. **IDE 支持**：确保 IDE 能正确识别新的配置

---

## 🚨 常见问题

**Q: TypeScript 编译报错 "Project references may not form a cycle"？**
A: 检查 references 配置，确保没有循环依赖

**Q: 路径映射不生效？**
A: 检查 baseUrl 和 paths 配置，确保路径正确

**Q: 构建顺序错误？**
A: 使用 `tsc --build` 而不是 `tsc`，让 TypeScript 管理构建顺序

**Q: IDE 无法识别类型？**
A: 重启 TypeScript 服务或重新加载工作区

---

**🎯 完成此任务后，继续执行 Task 005: 配置 TypeScript 项目引用**
