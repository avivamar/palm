# 🚀 Supabase 邮件模板系统 - 快速入门指南

这是一个为 Rolitt 项目定制的 Supabase Auth 邮件模板系统，支持多语言、品牌定制和所有邮件类型。

## 📋 目录

- [快速开始](#快速开始)
- [支持的邮件类型](#支持的邮件类型)
- [可用命令](#可用命令)
- [基本使用](#基本使用)
- [Supabase 配置](#supabase-配置)
- [测试验证](#测试验证)
- [故障排除](#故障排除)

## 🚀 快速开始

### 1. 安装依赖

确保项目已安装所需依赖：

```bash
npm install
```

### 2. 环境配置

确保 `.env.local` 文件包含以下配置：

```env
# 应用配置
APP_URL=https://rolitt.com
SITE_URL=https://rolitt.com

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# 邮件服务配置（可选）
RESEND_API_KEY=your_resend_api_key
```

### 3. 生成邮件模板

```bash
# 生成所有邮件模板配置
npm run email:setup

# 仅生成模板文件（不包含配置脚本）
npm run email:generate
```

### 4. 测试模板

```bash
# 运行基本测试
npm run email:test

# 运行完整测试套件
npm run email:test:full
```

## 📧 支持的邮件类型

| 类型 | 描述 | 主要变量 |
|------|------|----------|
| `invite` | 用户邀请邮件 | `ConfirmationURL`, `Email` |
| `confirmation` | 注册确认邮件 | `ConfirmationURL`, `Email` |
| `recovery` | 密码重置邮件 | `ConfirmationURL`, `Email` |
| `magic_link` | 魔法链接登录邮件 | `ConfirmationURL`, `Email` |
| `email_change` | 邮箱变更确认邮件 | `ConfirmationURL`, `Email`, `NewEmail` |
| `reauthentication` | 重新认证邮件（含OTP） | `Token`, `Email` |

## 🛠️ 可用命令

### 邮件模板相关命令

```bash
# 测试命令
npm run email:test              # 运行所有测试
npm run email:test:full         # 运行完整测试套件（包含性能和安全测试）
npm run email:test:performance  # 仅运行性能测试
npm run email:test:security     # 仅运行安全测试
npm run email:validate          # 验证模板基本功能

# 设置命令
npm run email:setup             # 生成 Supabase 配置和模板
npm run email:generate          # 仅生成模板文件
```

### 开发命令

```bash
npm run dev                     # 启动开发服务器
npm run build                   # 构建项目
npm run lint                    # 代码检查
npm run test                    # 运行单元测试
```

## 💻 基本使用

### 在代码中使用邮件模板

```typescript
import { emailTemplateManager, generateEmailTemplate } from '@/templates/email';

// 生成单个邮件模板
const template = generateEmailTemplate(
  'confirmation', // 邮件类型
  'zh-HK', // 语言
  {
    ConfirmationURL: 'https://rolitt.com/auth/confirm?token=abc123',
    Email: 'user@example.com',
    SiteURL: 'https://rolitt.com'
  }
);

console.log(template.subject); // 邮件主题
console.log(template.html); // HTML 内容
console.log(template.text); // 纯文本内容
```

### 批量生成多语言模板

```typescript
import { generateMultipleEmailTemplates } from '@/templates/email';

// 生成多语言版本
const templates = generateMultipleEmailTemplates(
  'recovery',
  ['en', 'zh-HK', 'ja'],
  {
    ConfirmationURL: 'https://rolitt.com/auth/reset?token=xyz789',
    Email: 'user@example.com'
  }
);

templates.forEach((template) => {
  console.log(`${template.locale}: ${template.subject}`);
});
```

### Supabase 集成

```typescript
import { SupabaseEmailTemplateGenerator } from '@/templates/email/supabase-integration';

const generator = new SupabaseEmailTemplateGenerator({
  locale: 'zh-HK',
  siteUrl: 'https://rolitt.com',
  fromEmail: 'noreply@rolitt.com',
  fromName: 'Rolitt'
});

// 生成 Supabase Dashboard 配置
const dashboardTemplates = generator.generateForSupabaseDashboard();
console.log(dashboardTemplates);
```

## ⚙️ Supabase 配置

### 1. 在 Supabase Dashboard 中配置

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Authentication** > **Email Templates**
4. 运行 `npm run email:setup` 生成配置文件
5. 按照生成的 `supabase-email-templates/README.md` 指引配置

### 2. 使用生成的模板

运行设置命令后，会在 `supabase-email-templates/` 目录生成：

```
supabase-email-templates/
├── README.md                    # 配置指南
├── configure.sh                 # 自动配置脚本
├── templates/
│   ├── invite-en.html          # 英文邀请邮件
│   ├── invite-zh-HK.html       # 繁体中文邀请邮件
│   ├── invite-ja.html          # 日文邀请邮件
│   ├── confirmation-en.html    # 英文确认邮件
│   └── ...                     # 其他模板
└── dashboard-config.json        # Dashboard 配置参考
```

### 3. 环境变量配置

确保在不同环境中正确配置：

```env
# 开发环境
APP_URL=http://localhost:3000
SITE_URL=http://localhost:3000

# 生产环境
APP_URL=https://rolitt.com
SITE_URL=https://rolitt.com
```

## 🧪 测试验证

### 运行测试套件

```bash
# 基本功能测试
npm run email:validate

# 完整测试（推荐）
npm run email:test:full
```

### 测试输出

测试完成后，会在 `test-output/email-templates/` 目录生成：

- **HTML 文件**: 各种邮件类型的 HTML 版本
- **TXT 文件**: 对应的纯文本版本
- **test-report.md**: 详细的测试报告

### 手动验证

1. 检查生成的 HTML 文件在浏览器中的显示效果
2. 验证所有变量是否正确替换
3. 确认多语言内容的准确性
4. 测试响应式设计在不同设备上的表现

## 🔧 故障排除

### 常见问题

#### 1. 模板变量未替换

**问题**: 邮件中显示 `{{ .ConfirmationURL }}` 而不是实际链接

**解决方案**:
```typescript
// 确保传入所有必需的变量
const template = generateEmailTemplate('confirmation', 'en', {
  ConfirmationURL: 'https://rolitt.com/auth/confirm?token=abc123', // ✅ 必需
  Email: 'user@example.com', // ✅ 必需
  SiteURL: 'https://rolitt.com' // ✅ 必需
});
```

#### 2. 不支持的语言

**问题**: `Error: Unsupported locale: zh-CN`

**解决方案**:
```typescript
// 使用支持的语言代码
// 或者检查支持的语言
import { emailTemplateManager } from '@/templates/email';

const supportedLocales = ['en', 'zh-HK', 'ja'];
console.log(emailTemplateManager.getSupportedLocales());
```

#### 3. 环境变量问题

**问题**: 模板中的 URL 不正确

**解决方案**:
```bash
# 检查环境变量
echo $APP_URL
echo $SITE_URL

# 或在代码中验证
console.log(process.env.APP_URL);
console.log(process.env.SITE_URL);
```

#### 4. TypeScript 类型错误

**问题**: 类型不匹配错误

**解决方案**:
```typescript
// 使用正确的类型
import type { EmailTemplateType, SupportedLocale } from '@/templates/email/types';

const emailType: EmailTemplateType = 'confirmation'; // ✅
const locale: SupportedLocale = 'zh-HK'; // ✅
```

### 调试技巧

1. **启用详细日志**:
   ```typescript
   // 在开发环境中启用调试
   process.env.NODE_ENV = 'development';
   ```

2. **验证模板内容**:
   ```typescript
   import { validateEmailTemplate } from '@/templates/email/utils';

   const isValid = validateEmailTemplate(template);
   console.log('Template valid:', isValid);
   ```

3. **检查变量替换**:
   ```typescript
   // 检查是否还有未替换的变量
   const hasUnreplacedVars = template.html.includes('{{');
   if (hasUnreplacedVars) {
     console.warn('Template contains unreplaced variables');
   }
   ```

### 获取帮助

如果遇到其他问题：

1. 查看 [详细文档](./src/templates/email/README.md)
2. 查看 [集成指南](./docs/supabase-email-integration.md)
3. 运行 `npm run email:test:full` 获取详细的测试报告
4. 检查 `test-output/email-templates/test-report.md` 中的错误信息

## 📚 更多资源

- [完整文档](./src/templates/email/README.md)
- [集成指南](./docs/supabase-email-integration.md)
- [示例代码](./src/templates/email/examples.ts)
- [测试文件](./src/templates/email/__tests__/email-templates.test.ts)
- [Supabase Auth 文档](https://supabase.com/docs/guides/auth)

---

🎉 **恭喜！** 你已经成功设置了 Supabase 邮件模板系统。现在可以为你的用户提供美观、多语言的邮件体验了！
