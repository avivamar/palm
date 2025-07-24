# 颜色配置管理系统

## 概述

为了简化颜色管理和减少未来添加新颜色时的修改工作，我们实现了一个集中化的颜色配置系统。该系统提供了统一的颜色配置管理、自动同步脚本和动态加载功能。

### 🎯 核心特性

- **一处修改，全局生效**: 只需在 `colors.ts` 中添加颜色配置
- **自动同步**: 脚本自动更新环境变量、数据库 Schema 和文档
- **类型安全**: 完整的 TypeScript 类型检查和智能提示
- **配置验证**: 自动检查配置完整性、文件存在性和格式正确性
- **零停机更新**: 支持动态颜色启用/禁用，无需重启服务

## 系统架构

### 1. 集中化配置文件

**文件位置**: `src/config/colors.ts`

这是整个颜色系统的核心配置文件，包含：
- 颜色定义（ID、显示名称、英文名称、十六进制值）
- Stripe 价格 ID 映射
- 产品图片路径
- 启用/禁用状态
- 排序权重

### 2. 自动同步脚本

**文件位置**: `scripts/sync-colors.js`

提供以下功能：
- 自动更新 `.env.local` 中的颜色价格映射
- 同步数据库 Schema 中的枚举值
- 生成颜色配置文档
- 验证配置完整性

### 3. 动态组件加载

前端组件现在动态读取颜色配置，无需硬编码颜色列表。

## 🚀 快速开始

### 第一次使用

1. **验证当前配置**
   ```bash
   npm run colors:validate
   ```

2. **查看当前可用颜色**
   ```bash
   cat docs/colors-config.md
   ```

3. **同步现有配置**
   ```bash
   npm run sync-colors
   ```

## 使用指南

### 添加新颜色

1. **更新颜色配置**

   在 `src/config/colors.ts` 中添加新的颜色配置：

   ```typescript
   {
     id: 'Ocean Blue',
     displayName: '海洋蓝',
     englishName: 'Ocean Blue',
     hexValue: '#0077BE',
     stripePriceId: 'price_1234567890', // 从 Stripe 获取
     imagePath: '/pre-order/blue.png',
     enabled: true,
     sortOrder: 6,
   },
   ```

2. **添加产品图片**

   将对应的产品图片添加到 `public/pre-order/` 目录。

3. **在 Stripe 中创建价格对象**

   - 登录 Stripe Dashboard
   - 创建新的价格对象
   - 在价格对象的 metadata 中添加 `color: "Ocean Blue"`
   - 复制价格 ID 到配置文件中

4. **运行同步脚本**

   ```bash
   npm run sync-colors
   ```

   这将自动：
   - 更新 `.env.local` 文件
   - 更新数据库 Schema
   - 生成新的文档

5. **更新数据库**

   ```bash
   # 生成数据库迁移（如果有 Schema 变化）
   npm run db:generate

   # 应用迁移到数据库
   npm run db:migrate
   ```

   > **注意**: 如果是新增颜色，数据库枚举会自动更新。如果没有变化，`db:generate` 会显示 "No schema changes, nothing to migrate 😴"

### 禁用颜色

1. 在 `src/config/colors.ts` 中将对应颜色的 `enabled` 设置为 `false`
2. 运行 `npm run sync-colors`

### 修改颜色顺序

1. 在 `src/config/colors.ts` 中调整 `sortOrder` 值
2. 运行 `npm run sync-colors`

## 可用命令

```bash
# 同步所有颜色配置
npm run sync-colors

# 仅验证配置（不修改文件）
npm run colors:validate
```

## 配置验证

同步脚本会自动验证：
- 必需字段的完整性
- 产品图片文件是否存在
- Stripe 价格 ID 格式是否正确

## 文件结构

```
├── src/
│   ├── config/
│   │   └── colors.ts              # 集中化颜色配置
│   ├── components/
│   │   └── pre-order/
│   │       └── ProductSelection.tsx # 动态加载颜色的组件
│   └── models/
│       └── Schema.ts              # 数据库 Schema（自动同步）
├── scripts/
│   └── sync-colors.js             # 颜色同步脚本
├── docs/
│   ├── colors-config.md           # 自动生成的颜色文档
│   └── colors-management.md       # 本文档
├── public/
│   └── pre-order/
│       ├── khaki.png
│       ├── pink.png
│       ├── green.png
│       ├── grey.png
│       └── red.png
└── .env.local                     # 环境变量（自动同步）
```

## 优势

1. **集中管理**: 所有颜色配置在一个文件中管理
2. **自动同步**: 脚本自动同步配置到各个文件
3. **类型安全**: TypeScript 提供完整的类型检查
4. **动态加载**: 前端组件动态读取配置，无需硬编码
5. **配置验证**: 自动验证配置完整性和文件存在性
6. **文档生成**: 自动生成最新的配置文档

## 注意事项

1. **Stripe 配置**: 确保在 Stripe 中正确设置价格对象的 metadata
2. **图片文件**: 添加新颜色时记得添加对应的产品图片
3. **数据库迁移**: 修改颜色枚举后需要生成并应用数据库迁移
4. **环境同步**: 在生产环境中也需要相应更新 Stripe 配置

## 🔧 故障排除

### 常见问题及解决方案

#### 1. TypeScript 编译错误

**问题**: 运行 `npm run sync-colors` 时出现 TypeScript 编译错误

**解决方案**:
```bash
# 检查 TypeScript 配置
npx tsc src/config/colors.ts --noEmit --skipLibCheck

# 如果仍有问题，清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

**常见错误类型**:
- `Cannot find module 'JSX'`: 已通过 `--skipLibCheck` 参数解决
- `Cannot find module 'tough-cookie'`: 第三方库类型问题，已在脚本中处理

#### 2. 编译后文件不存在

**问题**: 提示 "编译后的文件不存在"

**解决方案**:
```bash
# 手动测试编译
npx tsc src/config/colors.ts --outDir temp --target es2020 --module commonjs --esModuleInterop --skipLibCheck

# 检查生成的文件
ls -la temp/
```

#### 3. 图片不显示

**问题**: 前端页面中产品图片无法显示

**解决方案**:
- 检查图片路径: `public/pre-order/{color}.png`
- 验证图片文件名与配置中的 `imagePath` 一致
- 确保图片格式为 PNG 且大小适中

#### 4. Stripe 集成问题

**问题**: 支付流程中价格 ID 无效

**解决方案**:
- 验证 Stripe 价格 ID 格式: `price_` 开头
- 检查 Stripe Dashboard 中价格对象的 metadata
- 确保价格对象状态为 "active"

#### 5. 数据库同步问题

**问题**: 新颜色在数据库中不可用

**解决方案**:
```bash
# 检查 Schema 文件
cat src/models/Schema.ts | grep productColorEnum

# 强制重新生成迁移
npm run db:generate
npm run db:migrate
```

### 🛠️ 调试工具

```bash
# 验证配置但不修改文件
npm run colors:validate

# 检查 TypeScript 编译（详细输出）
npx tsc src/config/colors.ts --noEmit --skipLibCheck

# 查看当前颜色配置
node -e "console.log(JSON.stringify(require('./src/config/colors.ts'), null, 2))"

# 检查环境变量同步
grep COLOR_PRICE_MAP .env.local

# 验证数据库连接
npm run db:studio
```

### 📋 检查清单

添加新颜色前请确认:

- [ ] 颜色配置完整（所有必需字段）
- [ ] 产品图片已添加到 `public/pre-order/`
- [ ] Stripe 价格对象已创建并设置 metadata
- [ ] 运行 `npm run sync-colors` 成功
- [ ] 数据库迁移已生成和应用
- [ ] 前端页面显示正常

## 🚀 性能优化

### 缓存策略

- **静态生成**: 颜色配置在构建时静态生成，提高运行时性能
- **图片优化**: 使用 Next.js Image 组件自动优化产品图片
- **懒加载**: 产品图片支持懒加载，减少初始页面加载时间

### 最佳实践

1. **颜色命名规范**
   - 使用描述性名称（如 "Honey Khaki" 而非 "Color1"）
   - 保持英文名称简洁且易于理解
   - 中文显示名称要符合用户习惯

2. **图片规范**
   - 推荐尺寸: 400x400px
   - 格式: PNG（支持透明背景）
   - 文件大小: < 100KB
   - 命名: 使用小写英文，与颜色 ID 对应

3. **Stripe 配置规范**
   - 价格对象必须设置 `color` metadata
   - 使用描述性的价格名称
   - 定期检查价格对象状态

## 📊 配置示例

### 完整的颜色配置示例

```typescript
// src/config/colors.ts
export const PRODUCT_COLORS: ColorConfig[] = [
  {
    id: 'Honey Khaki',
    displayName: '蜂蜜卡其',
    englishName: 'Honey Khaki',
    hexValue: '#D2B48C',
    stripePriceId: 'price_1RcljHBCMz50a5Rza9NvZH5z',
    imagePath: '/pre-order/khaki.png',
    enabled: true,
    sortOrder: 1,
  },
  {
    id: 'Limited Edition Gold',
    displayName: '限量版金色',
    englishName: 'Limited Edition Gold',
    hexValue: '#FFD700',
    stripePriceId: 'price_1234567890abcdef',
    imagePath: '/pre-order/gold.png',
    enabled: false, // 暂时禁用
    sortOrder: 10,
  },
];
```

### Stripe 价格对象配置

在 Stripe Dashboard 中创建价格对象时，请确保设置以下 metadata：

```json
{
  "color": "Honey Khaki",
  "product_type": "pre_order",
  "display_order": "1"
}
```

## 🔄 CI/CD 集成

### 自动化检查

建议在 CI/CD 流程中添加颜色配置检查：

```yaml
# .github/workflows/colors-check.yml
name: Colors Configuration Check

on:
  pull_request:
    paths:
      - src/config/colors.ts
      - public/pre-order/**

jobs:
  validate-colors:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run colors:validate
 ```

## 🌐 未来扩展

该系统为未来的扩展提供了良好的基础：

### 短期计划
- **多语言支持**: 支持更多语言的颜色名称
- **颜色分组**: 按季节、系列等分组管理
- **库存集成**: 与库存管理系统集成

### 长期计划
- **A/B 测试**: 支持颜色展示的 A/B 测试
- **个性化推荐**: 基于用户偏好推荐颜色
- **动态定价**: 支持基于需求的动态定价
- **AR 预览**: 增强现实颜色预览功能

## 📝 版本历史

### v1.2.0 (当前版本)
- ✅ 修复 TypeScript 编译错误（添加 `--skipLibCheck` 参数）
- ✅ 改进错误处理和调试信息
- ✅ 优化文件路径处理
- ✅ 增强配置验证功能
- ✅ 完善文档和故障排除指南

### v1.1.0
- ✅ 实现自动同步脚本
- ✅ 添加数据库 Schema 自动更新
- ✅ 支持颜色启用/禁用功能
- ✅ 生成自动化文档

### v1.0.0
- ✅ 集中化颜色配置系统
- ✅ 基础的颜色管理功能
- ✅ Stripe 集成支持

## 🤝 贡献指南

### 如何贡献

1. **报告问题**
   - 在添加新颜色时遇到问题，请提供详细的错误信息
   - 包含运行环境信息（Node.js 版本、操作系统等）

2. **提出改进建议**
   - 新的颜色管理功能需求
   - 性能优化建议
   - 用户体验改进

3. **代码贡献**
   - Fork 项目并创建功能分支
   - 确保所有测试通过
   - 更新相关文档
   - 提交 Pull Request

### 开发环境设置

```bash
# 克隆项目
git clone <repository-url>
cd rolittmain

# 安装依赖
npm install

# 验证颜色配置
npm run colors:validate

# 运行同步脚本
npm run sync-colors
```

### 测试新功能

```bash
# 添加测试颜色
# 编辑 src/config/colors.ts

# 验证配置
npm run colors:validate

# 同步配置
npm run sync-colors

# 检查生成的文件
cat docs/colors-config.md
grep COLOR_PRICE_MAP .env.local
```

---

**📞 需要帮助？**

如果在使用颜色配置系统时遇到问题，请：
1. 查看本文档的故障排除部分
2. 运行 `npm run colors:validate` 检查配置
3. 查看 `docs/colors-config.md` 了解当前配置状态
4. 联系开发团队获取支持

**🎨 让我们一起打造更好的颜色管理体验！**
