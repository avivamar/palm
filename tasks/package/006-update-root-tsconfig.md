# Task 006: 更新根 tsconfig.json 路径映射

> **目标**：优化根目录 TypeScript 配置，确保路径映射和项目引用的最佳实践

---

## 📋 任务概述

**前置条件**：Task 001-005 已完成
**当前状态**：根配置可能存在路径映射冲突
**目标状态**：根配置完全优化，支持所有包的路径映射
**预计时间**：10 分钟
**风险等级**：低

---

## 🎯 执行步骤

### Step 1: 更新根 tsconfig.json

**文件路径**：`tsconfig.json`

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"],
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
    ".next/types/**/*.ts",
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "packages/*/dist",
    "packages/*/node_modules",
    "packages/**/node_modules",
    ".next",
    "out",
    "dist"
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

### Step 2: 创建开发环境配置

#### 2.1 创建开发专用 tsconfig
**文件路径**：`tsconfig.dev.json`

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "src/**/*",
    "packages/*/src/**/*"
  ]
}
```

#### 2.2 创建构建专用 tsconfig
**文件路径**：`tsconfig.build.json`

```json
{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "noEmit": false,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "packages",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx"
  ]
}
```

### Step 3: 优化 Next.js 配置

#### 3.1 更新 next.config.js
**文件路径**：`next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // 启用 TypeScript 项目引用支持
    typedRoutes: true,
  },
  // 配置 webpack 别名，与 tsconfig paths 保持一致
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': './src',
      '@rolitt/ui': './packages/ui/src',
      '@rolitt/shared': './packages/shared/src',
      '@rolitt/admin': './packages/admin/src',
      '@rolitt/auth': './packages/auth/src',
      '@rolitt/email': './packages/email/src',
      '@rolitt/payments': './packages/payments/src',
      '@rolitt/shopify': './packages/shopify/src',
    };

    return config;
  },
  // 配置 transpile packages
  transpilePackages: [
    '@rolitt/ui',
    '@rolitt/shared',
    '@rolitt/admin',
    '@rolitt/auth',
    '@rolitt/email',
    '@rolitt/payments',
    '@rolitt/shopify',
  ],
};

module.exports = nextConfig;
```

### Step 4: 配置 IDE 支持

#### 4.1 创建 VS Code 配置
**文件路径**：`.vscode/settings.json`

```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "typescript.suggest.includeCompletionsForModuleExports": true,
  "typescript.workspaceSymbols.scope": "allOpenProjects",
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.includeCompletionsWithSnippetText": true,
  "typescript.suggest.includeCompletionsForImportStatements": true,
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true,
    "**/out": true,
    "**/*.tsbuildinfo": true
  },
  "files.exclude": {
    "**/*.tsbuildinfo": true,
    "**/dist": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.objectLiteralMethodSnippets.enabled": false
}
```

#### 4.2 创建 VS Code 任务配置
**文件路径**：`.vscode/tasks.json`

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "TypeScript: Build All Packages",
      "type": "shell",
      "command": "npm",
      "args": ["run", "build:packages"],
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared",
        "showReuseMessage": true,
        "clear": false
      },
      "problemMatcher": "$tsc"
    },
    {
      "label": "TypeScript: Watch All Packages",
      "type": "shell",
      "command": "npm",
      "args": ["run", "watch:packages"],
      "group": "build",
      "isBackground": true,
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared",
        "showReuseMessage": true,
        "clear": false
      },
      "problemMatcher": {
        "owner": "typescript",
        "fileLocation": "relative",
        "pattern": {
          "regexp": "^([^\\s].*)\\((\\d+|\\d+,\\d+|\\d+,\\d+,\\d+,\\d+)\\):\\s+(error|warning|info)\\s+(TS\\d+)\\s*:\\s*(.*)$",
          "file": 1,
          "location": 2,
          "severity": 3,
          "code": 4,
          "message": 5
        },
        "background": {
          "activeOnStart": true,
          "beginsPattern": "^\\s*\\d{1,2}:\\d{1,2}:\\d{1,2}(\\s+(AM|PM))?\\s+-\\s+File change detected\\. Starting incremental compilation\\.\.\\.$",
          "endsPattern": "^\\s*\\d{1,2}:\\d{1,2}:\\d{1,2}(\\s+(AM|PM))?\\s+-\\s+Found \\d+ errors?\\. Watching for file changes\\.$"
        }
      }
    },
    {
      "label": "Clean All Packages",
      "type": "shell",
      "command": "npm",
      "args": ["run", "clean:packages"],
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared",
        "showReuseMessage": true,
        "clear": false
      }
    }
  ]
}
```

### Step 5: 创建路径映射验证脚本

**文件路径**：`scripts/validate-paths.js`

```javascript
const fs = require('node:fs');
const path = require('node:path');

function validatePaths() {
  console.log('🔍 验证路径映射配置...');

  const rootTsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  const paths = rootTsconfig.compilerOptions?.paths || {};

  console.log('\n📁 根目录路径映射:');

  Object.entries(paths).forEach(([alias, targets]) => {
    console.log(`\n  ${alias}:`);

    targets.forEach((target) => {
      const resolvedPath = path.resolve(target);
      const exists = fs.existsSync(resolvedPath);
      const status = exists ? '✅' : '❌';
      console.log(`    ${status} ${target} -> ${resolvedPath}`);

      if (!exists) {
        console.log(`      ⚠️  路径不存在`);
      }
    });
  });

  // 验证包路径映射
  console.log('\n📦 验证包路径映射:');

  const packagesDir = './packages';
  const packages = fs.readdirSync(packagesDir);

  packages.forEach((pkg) => {
    const packagePath = path.join(packagesDir, pkg);
    const srcPath = path.join(packagePath, 'src');
    const tsconfigPath = path.join(packagePath, 'tsconfig.json');

    if (fs.existsSync(tsconfigPath)) {
      const packageTsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      const packagePaths = packageTsconfig.compilerOptions?.paths || {};

      console.log(`\n  📦 ${pkg}:`);
      console.log(`    src 目录: ${fs.existsSync(srcPath) ? '✅' : '❌'}`);
      console.log(`    路径映射: ${Object.keys(packagePaths).length} 个`);

      Object.entries(packagePaths).forEach(([alias, targets]) => {
        targets.forEach((target) => {
          const fullPath = path.resolve(packagePath, 'src', target);
          const exists = fs.existsSync(fullPath);
          const status = exists ? '✅' : '⚠️';
          console.log(`      ${status} ${alias} -> ${target}`);
        });
      });
    }
  });
}

function validateImports() {
  console.log('\n🔗 验证导入路径...');

  const { execSync } = require('node:child_process');

  try {
    // 检查是否有未解析的导入
    const result = execSync('npx tsc --noEmit --skipLibCheck', {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    if (result.trim() === '') {
      console.log('✅ 所有导入路径验证通过');
    } else {
      console.log('❌ 发现类型错误:');
      console.log(result);
    }
  } catch (error) {
    console.log('❌ TypeScript 验证失败:');
    console.log(error.stdout || error.message);
  }
}

if (require.main === module) {
  validatePaths();
  validateImports();
}

module.exports = { validatePaths, validateImports };
```

### Step 6: 更新 package.json 脚本

**文件路径**：`package.json`

```json
{
  "scripts": {
    "build": "turbo build",
    "build:packages": "node scripts/build-packages.js",
    "build:tsc": "tsc --build",
    "build:next": "next build",
    "clean": "turbo clean",
    "clean:packages": "node scripts/clean-packages.js",
    "dev": "next dev",
    "dev:turbo": "turbo dev",
    "type-check": "tsc --noEmit --project tsconfig.dev.json",
    "type-check:packages": "tsc --build --dry",
    "type-check:strict": "tsc --noEmit --strict",
    "watch:packages": "tsc --build --watch",
    "validate:paths": "node scripts/validate-paths.js",
    "validate:references": "node scripts/validate-references.js",
    "validate:all": "npm run validate:paths && npm run validate:references"
  }
}
```

---

## ✅ 验收标准

- [ ] 根 `tsconfig.json` 路径映射完整且正确
- [ ] `tsconfig.dev.json` 开发配置创建完成
- [ ] `tsconfig.build.json` 构建配置创建完成
- [ ] `next.config.js` 配置更新完成
- [ ] VS Code 配置文件创建完成
- [ ] 路径验证脚本创建完成
- [ ] package.json 脚本更新完成
- [ ] 执行 `npm run validate:all` 通过
- [ ] 执行 `npm run type-check` 成功
- [ ] 执行 `npm run build:tsc` 成功

---

## 🧪 测试验证

```bash
# 验证路径映射
npm run validate:paths

# 验证项目引用
npm run validate:references

# 验证所有配置
npm run validate:all

# 类型检查
npm run type-check

# 构建测试
npm run build:tsc

# Next.js 构建测试
npm run build:next

# 开发服务器测试
npm run dev
```

---

## 🔄 回滚方案

```bash
# 删除新创建的配置文件
rm tsconfig.dev.json
rm tsconfig.build.json
rm -rf .vscode
rm scripts/validate-paths.js

# 恢复原有配置
git checkout tsconfig.json
git checkout next.config.js
git checkout package.json
```

---

## 📝 注意事项

1. **路径一致性**：确保 tsconfig paths 与 webpack alias 一致
2. **开发体验**：配置 IDE 以获得最佳开发体验
3. **构建优化**：使用不同的 tsconfig 文件优化不同场景
4. **验证机制**：定期运行验证脚本确保配置正确
5. **Next.js 兼容**：确保配置与 Next.js 完全兼容

---

## 🚨 常见问题

**Q: IDE 无法识别路径映射？**
A: 重启 TypeScript 服务或重新加载工作区

**Q: Next.js 构建时找不到模块？**
A: 检查 `next.config.js` 中的 `transpilePackages` 配置

**Q: 路径映射在某些文件中不工作？**
A: 检查文件是否在 `include` 范围内

**Q: 开发服务器启动慢？**
A: 使用 `tsconfig.dev.json` 优化开发配置

---

**🎯 完成此任务后，继续执行后续的重构和优化任务**
