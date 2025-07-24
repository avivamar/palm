# Task 005: 配置 TypeScript 项目引用

> **目标**：设置 TypeScript Project References，优化构建性能和依赖管理

---

## 📋 任务概述

**前置条件**：Task 001-004 已完成
**当前状态**：包之间缺乏正确的项目引用
**目标状态**：建立完整的 TypeScript 项目引用体系
**预计时间**：15 分钟
**风险等级**：低

---

## 🎯 执行步骤

### Step 1: 分析包依赖关系

#### 1.1 依赖关系图
```mermaid
graph TD
    UI["@rolitt/ui"]
    SHARED["@rolitt/shared"]
    ADMIN["@rolitt/admin"]
    AUTH["@rolitt/auth"]
    EMAIL["@rolitt/email"]
    PAYMENTS["@rolitt/payments"]
    SHOPIFY["@rolitt/shopify"]

    ADMIN --> UI
    ADMIN --> SHARED
    SHOPIFY --> UI
    SHOPIFY --> SHARED
    AUTH --> SHARED
    EMAIL --> SHARED
    PAYMENTS --> SHARED

    UI -.-> "无依赖"
    SHARED -.-> "无依赖"
```

#### 1.2 构建顺序
1. **第一层**：`@rolitt/ui`, `@rolitt/shared` (无依赖)
2. **第二层**：`@rolitt/admin`, `@rolitt/auth`, `@rolitt/email`, `@rolitt/payments`, `@rolitt/shopify`

### Step 2: 配置基础包项目引用

#### 2.1 UI 包配置 (无依赖)
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
    "declaration": true,
    "declarationMap": true,
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
    "**/*.test.tsx"
  ],
  "references": []
}
```

#### 2.2 Shared 包配置 (无依赖)
**文件路径**：`packages/shared/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": "./src",
    "rootDir": "./src",
    "outDir": "./dist",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
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
    "**/*.test.tsx"
  ],
  "references": []
}
```

### Step 3: 配置业务包项目引用

#### 3.1 Admin 包配置
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
    "declaration": true,
    "declarationMap": true,
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/pages/*": ["./pages/*"],
      "@/types/*": ["./types/*"],
      "@/utils/*": ["./utils/*"]
    }
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.test.tsx"
  ],
  "references": [
    { "path": "../ui" },
    { "path": "../shared" }
  ]
}
```

#### 3.2 Shopify 包配置
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
    "declaration": true,
    "declarationMap": true,
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/types/*": ["./types/*"],
      "@/utils/*": ["./utils/*"]
    }
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.test.tsx"
  ],
  "references": [
    { "path": "../ui" },
    { "path": "../shared" }
  ]
}
```

#### 3.3 Auth 包配置
**文件路径**：`packages/auth/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": "./src",
    "rootDir": "./src",
    "outDir": "./dist",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "paths": {
      "@/*": ["./*"],
      "@/types/*": ["./types/*"],
      "@/utils/*": ["./utils/*"]
    }
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.test.tsx"
  ],
  "references": [
    { "path": "../shared" }
  ]
}
```

#### 3.4 Email 包配置
**文件路径**：`packages/email/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": "./src",
    "rootDir": "./src",
    "outDir": "./dist",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "paths": {
      "@/*": ["./*"],
      "@/templates/*": ["./templates/*"],
      "@/types/*": ["./types/*"],
      "@/utils/*": ["./utils/*"]
    }
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.test.tsx"
  ],
  "references": [
    { "path": "../shared" }
  ]
}
```

#### 3.5 Payments 包配置
**文件路径**：`packages/payments/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": "./src",
    "rootDir": "./src",
    "outDir": "./dist",
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "paths": {
      "@/*": ["./*"],
      "@/providers/*": ["./providers/*"],
      "@/types/*": ["./types/*"],
      "@/utils/*": ["./utils/*"]
    }
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "**/*.test.ts",
    "**/*.test.tsx"
  ],
  "references": [
    { "path": "../shared" }
  ]
}
```

### Step 4: 配置根项目引用

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
  "exclude": [
    "node_modules",
    "packages/*/dist",
    "packages/*/node_modules"
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

### Step 5: 创建构建脚本

#### 5.1 创建包构建脚本
**文件路径**：`scripts/build-packages.js`

```javascript
const { execSync } = require('node:child_process');
const path = require('node:path');

// 构建顺序：先构建无依赖的包，再构建有依赖的包
const buildOrder = [
  // 第一层：无依赖
  ['ui', 'shared'],
  // 第二层：依赖第一层
  ['admin', 'auth', 'email', 'payments', 'shopify']
];

function buildPackage(packageName) {
  console.log(`🔨 构建 @rolitt/${packageName}...`);
  try {
    execSync(`cd packages/${packageName} && npx tsc --build`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log(`✅ @rolitt/${packageName} 构建成功`);
  } catch (error) {
    console.error(`❌ @rolitt/${packageName} 构建失败:`, error.message);
    process.exit(1);
  }
}

function buildLayer(packages) {
  console.log(`\n🚀 构建层级: ${packages.join(', ')}`);

  // 并行构建同一层级的包
  const promises = packages.map((pkg) => {
    return new Promise((resolve, reject) => {
      try {
        buildPackage(pkg);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });

  return Promise.all(promises);
}

async function buildAll() {
  console.log('🎯 开始构建所有包...');

  try {
    for (const layer of buildOrder) {
      await buildLayer(layer);
    }
    console.log('\n🎉 所有包构建完成！');
  } catch (error) {
    console.error('\n💥 构建失败:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  buildAll();
}

module.exports = { buildAll, buildPackage };
```

#### 5.2 创建清理脚本
**文件路径**：`scripts/clean-packages.js`

```javascript
const fs = require('node:fs');
const path = require('node:path');

function cleanPackage(packageName) {
  const distPath = path.join(__dirname, '../packages', packageName, 'dist');
  const tsbuildInfoPath = path.join(__dirname, '../packages', packageName, 'tsconfig.tsbuildinfo');

  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
    console.log(`🧹 清理 @rolitt/${packageName}/dist`);
  }

  if (fs.existsSync(tsbuildInfoPath)) {
    fs.unlinkSync(tsbuildInfoPath);
    console.log(`🧹 清理 @rolitt/${packageName}/tsconfig.tsbuildinfo`);
  }
}

function cleanAll() {
  console.log('🧹 清理所有包构建产物...');

  const packagesDir = path.join(__dirname, '../packages');
  const packages = fs.readdirSync(packagesDir);

  packages.forEach((pkg) => {
    if (fs.statSync(path.join(packagesDir, pkg)).isDirectory()) {
      cleanPackage(pkg);
    }
  });

  console.log('✅ 清理完成！');
}

if (require.main === module) {
  cleanAll();
}

module.exports = { cleanAll, cleanPackage };
```

#### 5.3 更新 package.json 脚本
**文件路径**：`package.json`

```json
{
  "scripts": {
    "build": "turbo build",
    "build:packages": "node scripts/build-packages.js",
    "build:tsc": "tsc --build",
    "clean": "turbo clean",
    "clean:packages": "node scripts/clean-packages.js",
    "dev": "turbo dev",
    "type-check": "tsc --noEmit",
    "type-check:packages": "tsc --build --dry",
    "watch:packages": "tsc --build --watch"
  }
}
```

### Step 6: 验证项目引用

#### 6.1 创建验证脚本
**文件路径**：`scripts/validate-references.js`

```javascript
const fs = require('node:fs');
const path = require('node:path');

function validateReferences() {
  console.log('🔍 验证项目引用配置...');

  const packagesDir = path.join(__dirname, '../packages');
  const packages = fs.readdirSync(packagesDir);

  packages.forEach((pkg) => {
    const tsconfigPath = path.join(packagesDir, pkg, 'tsconfig.json');

    if (fs.existsSync(tsconfigPath)) {
      const config = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

      console.log(`\n📦 ${pkg}:`);
      console.log(`  composite: ${config.compilerOptions?.composite || false}`);
      console.log(`  references: ${config.references?.length || 0} 个`);

      if (config.references) {
        config.references.forEach((ref) => {
          const refPath = path.resolve(path.dirname(tsconfigPath), ref.path);
          const exists = fs.existsSync(path.join(refPath, 'tsconfig.json'));
          console.log(`    ${exists ? '✅' : '❌'} ${ref.path}`);
        });
      }
    }
  });
}

if (require.main === module) {
  validateReferences();
}

module.exports = { validateReferences };
```

---

## ✅ 验收标准

- [ ] 所有包的 `tsconfig.json` 配置了 `composite: true`
- [ ] 基础包 (ui, shared) 无项目引用
- [ ] 业务包正确引用依赖的基础包
- [ ] 根 `tsconfig.json` 包含所有包的引用
- [ ] 构建脚本创建完成
- [ ] 验证脚本创建完成
- [ ] 执行 `npm run build:tsc` 成功
- [ ] 执行 `npm run build:packages` 成功
- [ ] 执行 `node scripts/validate-references.js` 通过

---

## 🧪 测试验证

```bash
# 清理所有构建产物
npm run clean:packages

# 验证项目引用配置
node scripts/validate-references.js

# 使用 TypeScript 构建
npm run build:tsc

# 使用自定义脚本构建
npm run build:packages

# 验证增量构建
touch packages/ui/src/index.ts
npm run build:tsc

# 验证监听模式
npm run watch:packages
```

---

## 🔄 回滚方案

```bash
# 删除构建脚本
rm scripts/build-packages.js
rm scripts/clean-packages.js
rm scripts/validate-references.js

# 恢复 tsconfig.json 配置
git checkout tsconfig.json
git checkout packages/*/tsconfig.json

# 恢复 package.json 脚本
git checkout package.json
```

---

## 📝 注意事项

1. **构建顺序**：确保依赖包在使用包之前构建
2. **循环依赖**：避免包之间的循环引用
3. **增量构建**：利用 TypeScript 的增量构建特性
4. **并行构建**：同一层级的包可以并行构建
5. **错误处理**：构建失败时及时停止并报告错误

---

## 🚨 常见问题

**Q: 构建报错 "Project references may not form a cycle"？**
A: 检查 references 配置，确保没有循环依赖

**Q: 增量构建不工作？**
A: 确保所有包都设置了 `composite: true`

**Q: 构建顺序错误？**
A: 检查依赖关系，确保构建脚本按正确顺序执行

**Q: 某个包构建失败？**
A: 检查该包的依赖是否已正确构建

---

**🎯 完成此任务后，继续执行 Task 006: 更新根 tsconfig.json 路径映射**
