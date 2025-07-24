# Supabase Email Templates Integration Guide

本文档详细说明如何将自定义邮件模板系统集成到 Rolitt 项目的 Supabase Auth 中。

## 概述

我们已经为 Rolitt 项目创建了一个完整的 Supabase Auth 邮件模板系统，支持：

- ✅ 6种邮件类型：invite, confirmation, recovery, magic_link, email_change, reauthentication
- ✅ 3种语言：English, 繁體中文, 日本語
- ✅ Rolitt 品牌定制
- ✅ 响应式设计
- ✅ 安全性和无障碍性

## 文件结构

```
src/templates/email/
├── index.ts                    # 主导出文件
├── types.ts                    # TypeScript 类型定义
├── config.ts                   # 配置文件
├── utils.ts                    # 工具函数
├── supabase-integration.ts     # Supabase 集成
├── examples.ts                 # 使用示例
├── README.md                   # 详细文档
├── __tests__/
│   └── email-templates.test.ts # 测试文件
└── templates/
    ├── index.ts                # 模板导出
    ├── template-manager.ts     # 模板管理器
    ├── confirmation.ts         # 注册确认模板
    ├── recovery.ts             # 密码重置模板
    ├── invite.ts               # 用户邀请模板
    ├── magic-link.ts           # 魔法链接模板
    ├── email-change.ts         # 邮箱变更模板
    └── reauthentication.ts     # 重新认证模板
```

## 集成步骤

### 1. 安装依赖

确保项目中已安装必要的依赖：

```bash
# 如果还没有安装
npm install @supabase/supabase-js
```

### 2. 环境变量配置

确保 `.env.local` 中包含以下配置：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 应用配置
APP_URL=https://rolitt.com
SITE_URL=https://rolitt.com

# 邮件配置（可选）
RESEND_API_KEY=your_resend_api_key
```

### 3. 在代码中使用模板

#### 基本使用

```typescript
// app/auth/confirm/page.tsx
import { generateEmailTemplate } from '@/templates/email';

export default function ConfirmPage() {
  // 在服务器端生成邮件模板
  const emailTemplate = generateEmailTemplate('confirmation', 'en', {
    ConfirmationURL: 'https://rolitt.com/auth/confirm?token=abc123',
    SiteURL: 'https://rolitt.com',
    Email: 'user@example.com'
  });

  return (
    <div>
      <h1>Email Sent</h1>
      <p>Please check your email to confirm your account.</p>

      {/* 开发环境下预览邮件 */}
      {process.env.NODE_ENV === 'development' && (
        <details>
          <summary>Email Preview</summary>
          <div dangerouslySetInnerHTML={{ __html: emailTemplate.html }} />
        </details>
      )}
    </div>
  );
}
```

#### 与现有认证系统集成

```typescript
import { supabase } from '@/libs/supabase/config';
// src/libs/auth/email-service.ts
import { generateSupabaseEmailTemplate } from '@/templates/email';

export class EmailService {
  /**
   * 发送确认邮件
   */
  static async sendConfirmationEmail(
    email: string,
    confirmationUrl: string,
    locale: 'en' | 'zh-HK' | 'ja' = 'en'
  ) {
    const template = generateSupabaseEmailTemplate(
      'confirmation',
      {
        ConfirmationURL: confirmationUrl,
        SiteURL: process.env.SITE_URL || 'https://rolitt.com',
        Email: email
      },
      locale
    );

    // 如果使用第三方邮件服务（如 Resend）
    if (process.env.RESEND_API_KEY) {
      return await this.sendWithResend(email, template);
    }

    // 否则依赖 Supabase 的邮件服务
    return { success: true, template };
  }

  /**
   * 发送密码重置邮件
   */
  static async sendPasswordResetEmail(
    email: string,
    resetUrl: string,
    locale: 'en' | 'zh-HK' | 'ja' = 'en'
  ) {
    const template = generateSupabaseEmailTemplate(
      'recovery',
      {
        ConfirmationURL: resetUrl,
        SiteURL: process.env.SITE_URL || 'https://rolitt.com',
        Email: email
      },
      locale
    );

    return await this.sendWithResend(email, template);
  }

  /**
   * 使用 Resend 发送邮件
   */
  private static async sendWithResend(email: string, template: any) {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      const result = await resend.emails.send({
        from: 'Rolitt <noreply@rolitt.com>',
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text
      });

      return { success: true, result };
    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error };
    }
  }
}
```

#### API 路由集成

```typescript
// app/api/auth/send-confirmation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/libs/auth/email-service';

export async function POST(request: NextRequest) {
  try {
    const { email, confirmationUrl, locale } = await request.json();

    const result = await EmailService.sendConfirmationEmail(
      email,
      confirmationUrl,
      locale
    );

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 4. Supabase Dashboard 配置

#### 生成模板配置

```bash
# 运行设置脚本
npx tsx scripts/setup-supabase-email-templates.ts

# 查看生成的模板
ls -la generated/supabase-email-templates/
```

#### 在 Supabase Dashboard 中配置

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 **Authentication** > **Email Templates**
4. 对每种邮件类型进行配置：

**Confirmation Email (注册确认)**
```
Content Type: text/html
Subject: Confirm Your Rolitt Account
Body: [复制 confirmation-en.html 的内容]
```

**Recovery Email (密码重置)**
```
Content Type: text/html
Subject: Reset Your Rolitt Password
Body: [复制 recovery-en.html 的内容]
```

**Invite Email (用户邀请)**
```
Content Type: text/html
Subject: You're invited to join Rolitt
Body: [复制 invite-en.html 的内容]
```

**Magic Link Email (魔法链接)**
```
Content Type: text/html
Subject: Your Rolitt Magic Link
Body: [复制 magic-link-en.html 的内容]
```

**Email Change (邮箱变更)**
```
Content Type: text/html
Subject: Confirm Your Email Change
Body: [复制 email-change-en.html 的内容]
```

### 5. 多语言支持集成

#### 与 next-intl 集成

```typescript
import type { SupportedLocale } from '@/templates/email/types';
// src/libs/auth/localized-email.ts
import { getLocale } from 'next-intl/server';
import { generateEmailTemplate } from '@/templates/email';

/**
 * 根据用户语言偏好生成邮件模板
 */
export async function generateLocalizedEmailTemplate(
  type: string,
  variables: any,
  userLocale?: string
) {
  // 获取用户语言偏好
  const locale = userLocale || await getLocale();

  // 映射到支持的语言
  const supportedLocale: SupportedLocale
    = locale === 'zh' || locale === 'zh-HK'
      ? 'zh-HK'
      : locale === 'ja' ? 'ja' : 'en';

  return generateEmailTemplate(type as any, supportedLocale, variables);
}
```

#### 在用户注册流程中使用

```typescript
// app/auth/signup/actions.ts
import { generateLocalizedEmailTemplate } from '@/libs/auth/localized-email';

export async function signUpAction(formData: FormData) {
  const email = formData.get('email') as string;
  const locale = formData.get('locale') as string;

  // 创建用户账户
  const { data, error } = await supabase.auth.signUp({
    email,
    password: formData.get('password') as string,
    options: {
      data: {
        locale // 保存用户语言偏好
      }
    }
  });

  if (error) {
    return { error: error.message };
  }

  // 生成本地化邮件模板（用于预览或第三方邮件服务）
  const emailTemplate = await generateLocalizedEmailTemplate(
    'confirmation',
    {
      ConfirmationURL: `${process.env.SITE_URL}/auth/confirm?token=${data.user?.email_confirm_token}`,
      SiteURL: process.env.SITE_URL,
      Email: email
    },
    locale
  );

  return { success: true, template: emailTemplate };
}
```

### 6. 测试和验证

#### 运行测试

```bash
# 运行邮件模板测试
npm test src/templates/email/__tests__/

# 运行所有测试
npm test
```

#### 手动测试

```typescript
// scripts/test-email-templates.ts
import { runAllExamples } from '@/templates/email/examples';

// 运行所有示例
runAllExamples();
```

#### 在开发环境中预览

```typescript
// app/dev/email-preview/page.tsx (仅开发环境)
import { generateEmailTemplate } from '@/templates/email';

const mockVariables = {
  ConfirmationURL: 'https://rolitt.com/auth/confirm?token=preview123',
  SiteURL: 'https://rolitt.com',
  Email: 'preview@example.com',
  Token: '123456',
  NewEmail: 'new@example.com'
};

export default function EmailPreviewPage() {
  const templates = [
    generateEmailTemplate('confirmation', 'en', mockVariables),
    generateEmailTemplate('recovery', 'zh-HK', mockVariables),
    generateEmailTemplate('reauthentication', 'ja', mockVariables)
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Email Templates Preview</h1>

      {templates.map((template, index) => (
        <div key={index} className="mb-8 border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">
            {template.type} ({template.locale})
          </h2>
          <p className="mb-4"><strong>Subject:</strong> {template.subject}</p>

          <div className="border rounded p-4">
            <div dangerouslySetInnerHTML={{ __html: template.html }} />
          </div>

          <details className="mt-4">
            <summary>Plain Text Version</summary>
            <pre className="bg-gray-100 p-4 rounded mt-2 text-sm">
              {template.text}
            </pre>
          </details>
        </div>
      ))}
    </div>
  );
}
```

### 7. 监控和维护

#### 邮件发送监控

```typescript
// src/libs/monitoring/email-analytics.ts
export class EmailAnalytics {
  static async trackEmailSent(
    type: string,
    locale: string,
    success: boolean,
    error?: string
  ) {
    // 发送到分析服务
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'email_sent', {
        email_type: type,
        locale,
        success,
        error
      });
    }

    // 记录到日志
    console.log(`Email ${type} (${locale}): ${success ? 'SUCCESS' : 'FAILED'}`, error);
  }
}
```

#### 定期更新检查

```typescript
// scripts/check-email-templates.ts
import { emailTemplateManager } from '@/templates/email';

// 检查模板完整性
function checkTemplateIntegrity() {
  const types = emailTemplateManager.getSupportedTypes();
  const locales = emailTemplateManager.getSupportedLocales();

  console.log('Checking template integrity...');

  types.forEach((type) => {
    locales.forEach((locale) => {
      try {
        const template = generateEmailTemplate(type, locale, {
          ConfirmationURL: 'https://test.com',
          SiteURL: 'https://test.com',
          Email: 'test@test.com',
          Token: '123456',
          NewEmail: 'new@test.com'
        });

        console.log(`✅ ${type} (${locale}): OK`);
      } catch (error) {
        console.error(`❌ ${type} (${locale}): ${error.message}`);
      }
    });
  });
}

checkTemplateIntegrity();
```

## 故障排除

### 常见问题

1. **模板变量未替换**
   - 检查 Supabase Dashboard 中的模板配置
   - 确保使用正确的变量语法：`{{ .VariableName }}`

2. **邮件样式显示异常**
   - 确保使用内联样式
   - 测试不同邮件客户端的兼容性

3. **多语言显示问题**
   - 检查字符编码设置
   - 确保字体支持相应语言

4. **邮件发送失败**
   - 检查 Supabase 项目配置
   - 验证环境变量设置
   - 查看 Supabase Dashboard 的日志

### 调试技巧

```typescript
// 启用调试模式
supabaseEmailGenerator.updateConfig({
  developmentMode: true
});

// 生成调试信息
const template = generateSupabaseEmailTemplate('confirmation', variables, 'en');
console.log('Debug info:', template.debugInfo);
```

## 最佳实践

1. **性能优化**
   - 缓存生成的模板
   - 使用批量生成减少重复计算
   - 优化图片和资源加载

2. **安全性**
   - 验证所有用户输入
   - 使用 HTTPS 链接
   - 定期更新依赖包

3. **用户体验**
   - 提供纯文本版本
   - 确保移动端适配
   - 测试无障碍性

4. **维护性**
   - 保持模板版本控制
   - 定期测试邮件发送
   - 监控用户反馈

## 下一步

1. 根据用户反馈优化模板设计
2. 添加更多语言支持
3. 集成高级分析功能
4. 实现 A/B 测试功能
5. 添加邮件模板编辑器

---

如有问题或需要支持，请联系开发团队或查看项目文档。
