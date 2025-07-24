# @rolitt/email

> 企业级 Supabase 认证邮件模板，支持多语言

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/rolitt/email)

## 功能特性

✨ **完整的邮件类型支持**
- 📧 邀请邮件
- ✅ 邮箱确认
- 🔐 密码重置
- 🪄 魔法链接认证
- 📬 邮箱变更确认
- 🔒 重新认证请求

🌍 **多语言支持**
- 🇺🇸 英语
- 🇹🇼 繁体中文 (繁體中文)
- 🇯🇵 日语 (日本語)

🎨 **专业设计**
- 📱 移动优先的响应式设计
- 🎯 Rolitt 品牌色彩定制
- ♿ WCAG 2.1 AA 无障碍合规
- 🔒 XSS 防护和输入验证

⚡ **开发者体验**
- 📘 完整的 TypeScript 支持
- 🧪 全面的测试套件
- 📚 详尽的文档
- 🔧 简易的 Supabase 集成

## 安装

```bash
npm install @rolitt/email
# 或者
yarn add @rolitt/email
# 或者
pnpm add @rolitt/email
```

## 快速开始

### 基本用法

```typescript
import { generateEmailTemplate } from '@rolitt/email';

// 生成确认邮件
const template = generateEmailTemplate('confirmation', 'en', {
  ConfirmationURL: 'https://yourapp.com/confirm?token=abc123',
  SiteName: 'Your App Name'
});

console.log(template.html); // HTML 版本
console.log(template.text); // 纯文本版本
```

### Supabase 集成

```typescript
import { SupabaseEmailTemplateGenerator } from '@rolitt/email';

// 使用你的配置初始化
const emailGenerator = new SupabaseEmailTemplateGenerator({
  locale: 'en',
  siteURL: 'https://yourapp.com',
  fromEmail: 'noreply@yourapp.com',
  fromName: 'Your App Name'
});

// 为 Supabase 控制台生成模板
const supabaseTemplate = emailGenerator.generateForSupabase('confirmation', {
  ConfirmationURL: '{{ .ConfirmationURL }}' // Supabase 变量
});

// 在 Supabase 控制台的邮件模板部分使用
console.log(supabaseTemplate.html);
```

### 多语言支持

```typescript
import { generateMultipleEmailTemplates } from '@rolitt/email';

// 为所有支持的语言生成模板
const templates = generateMultipleEmailTemplates('invite', ['en', 'zh-HK', 'ja'], {
  InviteURL: 'https://yourapp.com/invite?token=xyz789',
  SiteName: 'Your App Name'
});

// 按语言代码访问模板
console.log(templates.en.html); // 英语
console.log(templates['zh-HK'].html); // 繁体中文
console.log(templates.ja.html); // 日语
```

## 支持的邮件类型

| 类型 | 描述 | 必需变量 |
|------|-------------|-------------------|
| `invite` | 用户邀请邮件 | `InviteURL`, `SiteName` |
| `confirmation` | 邮箱确认 | `ConfirmationURL`, `SiteName` |
| `recovery` | 密码重置 | `RecoveryURL`, `SiteName` |
| `magic_link` | 魔法链接认证 | `MagicLinkURL`, `SiteName` |
| `email_change` | 邮箱变更确认 | `ConfirmationURL`, `NewEmail`, `SiteName` |
| `reauthentication` | 重新认证请求 | `Token`, `SiteName` |

## 支持的语言

| 代码 | 语言 | 本地名称 |
|------|----------|-------------|
| `en` | 英语 | English |
| `zh-HK` | 繁体中文 | 繁體中文 |
| `ja` | 日语 | 日本語 |

## API 参考

### 核心函数

#### `generateEmailTemplate(type, locale, variables)`

生成单个邮件模板。

**参数：**
- `type`: 邮件类型 (`'invite' | 'confirmation' | 'recovery' | 'magic_link' | 'email_change' | 'reauthentication'`)
- `locale`: 语言代码 (`'en' | 'zh-HK' | 'ja'`)
- `variables`: 模板变量对象

**返回值：** `{ html: string, text: string }`

#### `generateMultipleEmailTemplates(type, locales, variables)`

为多种语言生成模板。

**参数：**
- `type`: 邮件类型
- `locales`: 语言代码数组
- `variables`: 模板变量对象

**返回值：** 包含语言代码键和模板值的对象

### Supabase 集成

#### `SupabaseEmailTemplateGenerator`

用于 Supabase 特定邮件生成的类。

```typescript
const generator = new SupabaseEmailTemplateGenerator({
  locale: 'en',
  siteURL: 'https://yourapp.com',
  fromEmail: 'noreply@yourapp.com',
  fromName: 'Your App Name',
  brandColor: '#EBFF7F', // 可选：自定义品牌颜色
  developmentMode: false // 可选：启用开发日志
});
```

**方法：**
- `generateForSupabase(type, variables)`: 为 Supabase 控制台生成模板
- `generateForDashboard(type)`: 使用 Supabase 变量生成模板
- `generateAllTypes(variables)`: 生成所有邮件类型
- `updateConfig(newConfig)`: 更新配置

### 验证函数

```typescript
import { validateEmail, validateOTP, validateURL } from '@rolitt/email';

// 验证邮箱地址
const isValidEmail = validateEmail('user@example.com'); // true

// 验证 URL
const isValidURL = validateURL('https://example.com'); // true

// 验证 OTP（6位数字）
const isValidOTP = validateOTP('123456'); // true
```

## 配置

### 默认配置

```typescript
import { DEFAULT_EMAIL_CONFIG } from '@rolitt/email';

console.log(DEFAULT_EMAIL_CONFIG);
// {
//   brandColor: '#EBFF7F',
//   fontFamily: 'system-ui, -apple-system, sans-serif',
//   maxWidth: '600px',
//   borderRadius: '8px'
// }
```

### 自定义配置

```typescript
import { SupabaseEmailTemplateGenerator } from '@rolitt/email';

const generator = new SupabaseEmailTemplateGenerator({
  locale: 'en',
  siteURL: 'https://yourapp.com',
  fromEmail: 'noreply@yourapp.com',
  fromName: 'Your App Name',
  brandColor: '#FF6B6B', // 自定义品牌颜色
  developmentMode: true // 启用开发日志
});
```

## 测试

```bash
# 运行测试
npm test

# 监视模式运行测试
npm run test:watch

# 运行覆盖率测试
npm run test:coverage
```

## 开发

```bash
# 安装依赖
npm install

# 构建包
npm run build

# 监视变更
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint
npm run lint:fix
```

## 安全

🔒 **安全特性：**
- 通过 HTML 转义防护 XSS
- URL、邮箱和令牌的输入验证
- 安全的模板变量处理
- 核心功能无外部依赖

## 性能

⚡ **优化：**
- 轻量级包大小
- 可摇树优化的导出
- 高效的模板缓存
- 最少的运行时依赖

## 浏览器支持

- ✅ 现代浏览器 (ES2020+)
- ✅ Node.js 18+
- ✅ Next.js 14+
- ✅ React 18+

## 贡献

我们欢迎贡献！请查看我们的 [贡献指南](../../CONTRIBUTING.md) 了解详情。

## 许可证

MIT © [Rolitt Team](https://github.com/rolitt)

## 支持

- 📖 [文档](../../docs/supabase-email-integration.md)
- 🐛 [问题跟踪](https://github.com/rolitt/rolittmain/issues)
- 💬 [讨论](https://github.com/rolitt/rolittmain/discussions)

---

**由 Rolitt 团队用 ❤️ 制作**
