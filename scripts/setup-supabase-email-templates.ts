#!/usr/bin/env tsx
/**
 * Supabase Email Templates Setup Script
 * Supabase 邮件模板设置脚本
 *
 * 这个脚本帮助生成所有 Supabase Auth 邮件模板的配置，
 * 可以直接复制到 Supabase Dashboard 中使用。
 *
 * Usage: npx tsx scripts/setup-supabase-email-templates.ts
 */

import type { EmailTemplateType, SupportedLocale } from '@rolitt/email';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'generated', 'supabase-email-templates');

/**
 * 邮件模板配置
 */
const EMAIL_TYPES: EmailTemplateType[] = [
  'invite',
  'confirmation',
  'recovery',
  'magic_link',
  'email_change',
  'reauthentication',
];

const LOCALES: SupportedLocale[] = ['en', 'es', 'ja', 'zh-HK'];

const LOCALE_NAMES = {
  'en': 'English',
  'es': 'Español',
  'ja': '日本語',
  'zh-HK': '繁體中文',
};

const TYPE_DESCRIPTIONS = {
  invite: 'User Invitation Email / 用户邀请邮件',
  confirmation: 'Registration Confirmation Email / 注册确认邮件',
  recovery: 'Password Reset Email / 密码重置邮件',
  magic_link: 'Magic Link Login Email / 魔法链接登录邮件',
  email_change: 'Email Change Confirmation / 邮箱变更确认邮件',
  reauthentication: 'Reauthentication Email (with OTP) / 重新认证邮件（含OTP）',
};

/**
 * 生成模板内容（模拟实际模板生成器）
 */
function generateTemplateContent(type: EmailTemplateType, locale: SupportedLocale): string {
  // 这里应该调用实际的模板生成器
  // 为了演示，我们生成一个基本的模板结构

  const brandColor = '#EBFF7F';
  const darkColor = '#1a1a1a';

  const subjects = {
    invite: {
      'en': 'You\'re invited to join Rolitt',
      'es': 'Estás invitado a unirte a Rolitt',
      'ja': 'Rolittへの招待',
      'zh-HK': '邀請您加入 Rolitt',
    },
    confirmation: {
      'en': 'Confirm Your Rolitt Account',
      'es': 'Confirma tu cuenta de Rolitt',
      'ja': 'Rolittアカウントの確認',
      'zh-HK': '確認您的 Rolitt 帳戶',
    },
    recovery: {
      'en': 'Reset Your Rolitt Password',
      'es': 'Restablecer tu contraseña de Rolitt',
      'ja': 'Rolittパスワードのリセット',
      'zh-HK': '重設您的 Rolitt 密碼',
    },
    magic_link: {
      'en': 'Your Rolitt Magic Link',
      'es': 'Tu enlace mágico de Rolitt',
      'ja': 'Rolittマジックリンク',
      'zh-HK': '您的 Rolitt 魔法連結',
    },
    email_change: {
      'en': 'Confirm Your Email Change',
      'es': 'Confirma el cambio de tu email',
      'ja': 'メールアドレス変更の確認',
      'zh-HK': '確認您的電子郵件變更',
    },
    reauthentication: {
      'en': 'Verification Code for Rolitt',
      'es': 'Código de verificación para Rolitt',
      'ja': 'Rolitt認証コード',
      'zh-HK': 'Rolitt 驗證碼',
    },
  };

  const getVariables = (type: EmailTemplateType) => {
    switch (type) {
      case 'reauthentication':
        return ['{{ .Token }}', '{{ .SiteURL }}', '{{ .Email }}'];
      case 'email_change':
        return ['{{ .ConfirmationURL }}', '{{ .SiteURL }}', '{{ .Email }}', '{{ .NewEmail }}'];
      default:
        return ['{{ .ConfirmationURL }}', '{{ .SiteURL }}', '{{ .Email }}'];
    }
  };

  const variables = getVariables(type);
  const subject = subjects[type][locale];

  return `<!DOCTYPE html>
<html lang="${locale}" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: ${darkColor};
      background-color: #f8f9fa;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: ${brandColor};
      color: ${darkColor};
      padding: 32px;
      text-align: center;
    }
    .content {
      padding: 32px;
    }
    .button {
      display: inline-block;
      background-color: ${brandColor};
      color: ${darkColor};
      padding: 12px 24px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 16px 0;
    }
    .otp-code {
      font-size: 32px;
      font-weight: bold;
      color: ${brandColor};
      background-color: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
      letter-spacing: 4px;
      margin: 16px 0;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 24px;
      text-align: center;
      font-size: 14px;
      color: #6c757d;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Rolitt</h1>
    </div>
    <div class="content">
      <h2>${subject}</h2>
      
      ${type === 'reauthentication'
        ? `
      <p>Your verification code is:</p>
      <div class="otp-code">{{ .Token }}</div>
      <p>This code will expire in 10 minutes.</p>
      `
        : `
      <p>Please click the button below to continue:</p>
      <a href="{{ .ConfirmationURL }}" class="button">Continue</a>
      `}
      
      ${type === 'email_change'
        ? `
      <p>Current email: {{ .Email }}</p>
      <p>New email: {{ .NewEmail }}</p>
      `
        : ''}
      
      <p>If you didn't request this, please ignore this email.</p>
      
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e9ecef;">
      
      <p><strong>Variables used in this template:</strong></p>
      <ul>
        ${variables.map(v => `<li><code>${v}</code></li>`).join('\n        ')}
      </ul>
    </div>
    <div class="footer">
      <p>&copy; 2024 Rolitt. All rights reserved.</p>
      <p>Visit us at <a href="{{ .SiteURL }}">{{ .SiteURL }}</a></p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * 生成配置说明
 */
function generateConfigInstructions(): string {
  return `# Supabase Email Templates Configuration Guide

## 配置步骤

1. 登录 Supabase Dashboard
2. 进入 **Authentication** > **Email Templates**
3. 选择要配置的邮件类型
4. 设置以下配置：
   - **Content Type**: \`text/html\`
   - **Subject**: 使用对应语言的主题
   - **Body**: 复制对应的 HTML 模板内容

## 模板变量说明

| 变量 | 描述 | 使用场景 |
|------|------|----------|
| \`{{ .ConfirmationURL }}\` | 确认链接URL | 大部分邮件类型 |
| \`{{ .Token }}\` | 6位OTP代码 | reauthentication |
| \`{{ .TokenHash }}\` | 哈希化的Token | 可选 |
| \`{{ .SiteURL }}\` | 应用站点URL | 所有邮件类型 |
| \`{{ .Email }}\` | 用户邮箱 | 所有邮件类型 |
| \`{{ .NewEmail }}\` | 新邮箱地址 | email_change |

## 注意事项

- 确保所有必需的变量都包含在模板中
- 测试模板在不同设备上的显示效果
- 定期检查邮件送达率和用户反馈
- 保持品牌一致性

## 多语言支持

本系统支持以下语言：
- English (en)
- 繁體中文 (zh-HK) 
- 日本語 (ja)

根据用户的语言偏好选择对应的模板。
`;
}

/**
 * 生成单个模板文件
 */
function generateTemplateFile(type: EmailTemplateType, locale: SupportedLocale): void {
  const content = generateTemplateContent(type, locale);
  const filename = `${type}-${locale}.html`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`✅ Generated: ${filename}`);
}

/**
 * 生成汇总文件
 */
function generateSummaryFile(): void {
  let summary = `# Supabase Email Templates Summary\n\n`;
  summary += `Generated on: ${new Date().toISOString()}\n\n`;

  summary += `## Available Templates\n\n`;

  EMAIL_TYPES.forEach((type) => {
    summary += `### ${type}\n`;
    summary += `**Description**: ${TYPE_DESCRIPTIONS[type]}\n\n`;

    summary += `**Available Languages**:\n`;
    LOCALES.forEach((locale) => {
      summary += `- [${LOCALE_NAMES[locale]} (${locale})](${type}-${locale}.html)\n`;
    });
    summary += `\n`;
  });

  summary += generateConfigInstructions();

  const filepath = path.join(outputDir, 'README.md');
  fs.writeFileSync(filepath, summary, 'utf8');
  console.log(`✅ Generated: README.md`);
}

/**
 * 生成 Supabase Dashboard 配置脚本
 */
function generateDashboardScript(): void {
  const script = `#!/bin/bash
# Supabase Email Templates Configuration Script
# 此脚本帮助快速配置 Supabase Dashboard 邮件模板

echo "🚀 Supabase Email Templates Configuration"
echo "==========================================="
echo ""
echo "📋 Available Templates:"

${EMAIL_TYPES.map(type => `echo "   - ${type}: ${TYPE_DESCRIPTIONS[type]}"`).join('\n')}

echo ""
echo "🌐 Available Languages:"
${LOCALES.map(locale => `echo "   - ${locale}: ${LOCALE_NAMES[locale]}"`).join('\n')}

echo ""
echo "📁 Template files are located in: ./generated/supabase-email-templates/"
echo ""
echo "📖 Configuration Instructions:"
echo "   1. Open Supabase Dashboard"
echo "   2. Go to Authentication > Email Templates"
echo "   3. Select email type"
echo "   4. Set Content Type to 'text/html'"
echo "   5. Copy template content from corresponding .html file"
echo "   6. Save configuration"
echo ""
echo "✅ Setup complete! Check the generated files for template content."
`;

  const filepath = path.join(outputDir, 'configure.sh');
  fs.writeFileSync(filepath, script, 'utf8');
  fs.chmodSync(filepath, '755'); // Make executable
  console.log(`✅ Generated: configure.sh`);
}

/**
 * 主函数
 */
function main(): void {
  console.log('🚀 Starting Supabase Email Templates Setup...');
  console.log('');

  // 创建输出目录
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${outputDir}`);
  }

  console.log('📧 Generating email templates...');

  // 生成所有模板文件
  EMAIL_TYPES.forEach((type) => {
    LOCALES.forEach((locale) => {
      generateTemplateFile(type, locale);
    });
  });

  console.log('');
  console.log('📄 Generating documentation...');

  // 生成汇总和说明文件
  generateSummaryFile();
  generateDashboardScript();

  console.log('');
  console.log('✅ Setup completed successfully!');
  console.log('');
  console.log('📋 Next Steps:');
  console.log(`   1. Review generated templates in: ${outputDir}`);
  console.log('   2. Follow instructions in README.md');
  console.log('   3. Configure templates in Supabase Dashboard');
  console.log('   4. Test email delivery');
  console.log('');
  console.log('🔗 Useful Commands:');
  console.log(`   - View templates: ls -la ${outputDir}`);
  console.log(`   - Read instructions: cat ${outputDir}/README.md`);
  console.log(`   - Run config helper: ${outputDir}/configure.sh`);
  console.log('');
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  EMAIL_TYPES,
  generateDashboardScript,
  generateSummaryFile,
  generateTemplateContent,
  generateTemplateFile,
  LOCALES,
  TYPE_DESCRIPTIONS,
};
