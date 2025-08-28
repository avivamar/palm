#!/usr/bin/env tsx
/**
 * Email Templates Test Script
 * 邮件模板测试脚本
 *
 * 这个脚本用于快速测试和验证邮件模板系统的功能
 *
 * Usage: npx tsx scripts/test-email-templates.ts [options]
 */

// 导入邮件模板相关类型和函数
import type { EmailTemplateContent, EmailTemplateType, SupabaseTemplateVariables, SupportedLocale } from '@rolitt/email';
import fs from 'node:fs';
import path from 'node:path';

import { fileURLToPath } from 'node:url';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'test-output', 'email-templates');

/**
 * 测试配置
 */
const TEST_CONFIG = {
  siteUrl: 'https://rolitt.com',
  testEmail: 'test@example.com',
  newTestEmail: 'newtest@example.com',
  testToken: '123456',
  baseConfirmUrl: 'https://rolitt.com/auth/confirm?token=test123',
};

const EMAIL_TYPES: EmailTemplateType[] = [
  'confirmation',
  'recovery',
  'invite',
  'magic_link',
  'email_change',
  'reauthentication',
];

const LOCALES: SupportedLocale[] = ['en', 'zh-HK', 'ja'];

/**
 * 生成测试用的模板变量
 */
function generateTestVariables(type: EmailTemplateType): SupabaseTemplateVariables {
  const baseVariables: SupabaseTemplateVariables = {
    SiteURL: TEST_CONFIG.siteUrl,
    Email: TEST_CONFIG.testEmail,
  };

  switch (type) {
    case 'confirmation':
      return {
        ...baseVariables,
        ConfirmationURL: `${TEST_CONFIG.siteUrl}/auth/confirm?token=conf_${Date.now()}`,
      };

    case 'recovery':
      return {
        ...baseVariables,
        ConfirmationURL: `${TEST_CONFIG.siteUrl}/auth/reset?token=reset_${Date.now()}`,
      };

    case 'invite':
      return {
        ...baseVariables,
        Email: TEST_CONFIG.newTestEmail,
        ConfirmationURL: `${TEST_CONFIG.siteUrl}/auth/invite?token=invite_${Date.now()}`,
      };

    case 'magic_link':
      return {
        ...baseVariables,
        ConfirmationURL: `${TEST_CONFIG.siteUrl}/auth/magic?token=magic_${Date.now()}`,
      };

    case 'email_change':
      return {
        ...baseVariables,
        NewEmail: TEST_CONFIG.newTestEmail,
        ConfirmationURL: `${TEST_CONFIG.siteUrl}/auth/email-change?token=change_${Date.now()}`,
      };

    case 'reauthentication':
      return {
        ...baseVariables,
        Token: TEST_CONFIG.testToken,
      };

    default:
      return baseVariables;
  }
}

/**
 * 模拟邮件模板生成器（实际使用时会导入真实的生成器）
 */
function mockGenerateEmailTemplate(
  type: EmailTemplateType,
  locale: SupportedLocale,
  variables: SupabaseTemplateVariables,
): EmailTemplateContent {
  const subjects = {
    confirmation: {
      'en': 'Confirm Your/* Thepalmistrylife Account',
      'es': 'Confirma tu cuenta de/* Thepalmistrylife',
      'zh-HK': '確認您的/* Thepalmistrylife 帳戶',
      'ja': 'Rolittアカウントの確認',
    },
    recovery: {
      'en': 'Reset Your/* Thepalmistrylife Password',
      'es': 'Restablecer tu contraseña de/* Thepalmistrylife',
      'zh-HK': '重設您的/* Thepalmistrylife 密碼',
      'ja': 'Rolittパスワードのリセット',
    },
    invite: {
      'en': 'You\'re invited to join/* Thepalmistrylife',
      'es': 'Estás invitado a unirte a/* Thepalmistrylife',
      'zh-HK': '邀請您加入/* Thepalmistrylife',
      'ja': 'Rolittへの招待',
    },
    magic_link: {
      'en': 'Your/* Thepalmistrylife Magic Link',
      'es': 'Tu enlace mágico de/* Thepalmistrylife',
      'zh-HK': '您的/* Thepalmistrylife 魔法連結',
      'ja': 'Rolittマジックリンク',
    },
    email_change: {
      'en': 'Confirm Your Email Change',
      'es': 'Confirma el cambio de tu email',
      'zh-HK': '確認您的電子郵件變更',
      'ja': 'メールアドレス変更の確認',
    },
    reauthentication: {
      'en': 'Verification Code for/* Thepalmistrylife',
      'es': 'Código de verificación para/* Thepalmistrylife',
      'zh-HK': 'Rolitt 驗證碼',
      'ja': 'Rolitt認証コード',
    },
  };

  const subject = subjects[type][locale];

  // 生成基本的 HTML 模板
  const html = `<!DOCTYPE html>
<html lang="${locale}" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: #EBFF7F; padding: 32px; text-align: center; }
    .content { padding: 32px; }
    .button { background: #EBFF7F; color: #1a1a1a; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
    .otp { font-size: 32px; font-weight: bold; color: #EBFF7F; background: #f8f9fa; padding: 16px; text-align: center; }
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
          ? `<p>Your verification code:</p><div class="otp">${variables.Token}</div>`
          : `<a href="${variables.ConfirmationURL}" class="button">Continue</a>`
      }
      ${type === 'email_change'
          ? `<p>From: ${variables.Email}</p><p>To: ${variables.NewEmail}</p>`
          : ''
      }
      <p>Email: ${variables.Email}</p>
      <p>Site: ${variables.SiteURL}</p>
    </div>
  </div>
</body>
</html>`;

  // 生成纯文本版本
  const text = `${subject}\n\n`
    + `${type === 'reauthentication'
      ? `Your verification code: ${variables.Token}`
      : `Continue: ${variables.ConfirmationURL}`
    }\n\n`
    + `${type === 'email_change'
      ? `From: ${variables.Email}\nTo: ${variables.NewEmail}\n\n`
      : ''
    }`
    + `Email: ${variables.Email}\n`
    + `Site: ${variables.SiteURL}\n\n`
    + `© 2024/* Thepalmistrylife. All rights reserved.`;

  return {
    subject,
    html,
    text,
  };
}

/**
 * 测试单个模板
 */
function testSingleTemplate(type: EmailTemplateType, locale: SupportedLocale): boolean {
  try {
    const variables = generateTestVariables(type);
    const template = mockGenerateEmailTemplate(type, locale, variables);

    // 验证模板内容
    if (!template.subject || !template.html || !template.text) {
      throw new Error('Template content is incomplete');
    }

    // 验证变量替换
    if (variables.ConfirmationURL && !template.html.includes(variables.ConfirmationURL)) {
      throw new Error('ConfirmationURL not found in template');
    }

    if (variables.Token && !template.html.includes(variables.Token)) {
      throw new Error('Token not found in template');
    }

    if (variables.Email && !template.html.includes(variables.Email)) {
      throw new Error('Email not found in template');
    }

    console.log(`✅ ${type} (${locale}): OK`);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ ${type} (${locale}): ${errorMessage}`);
    return false;
  }
}

/**
 * 生成测试报告
 */
function generateTestReport(results: Array<{ type: EmailTemplateType; locale: SupportedLocale; success: boolean; error?: string }>): string {
  const totalTests = results.length;
  const passedTests = results.filter(r => r.success).length;
  const failedTests = totalTests - passedTests;

  let report = `# Email Templates Test Report\n\n`;
  report += `**Generated**: ${new Date().toISOString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- **Total Tests**: ${totalTests}\n`;
  report += `- **Passed**: ${passedTests}\n`;
  report += `- **Failed**: ${failedTests}\n`;
  report += `- **Success Rate**: ${((passedTests / totalTests) * 100).toFixed(1)}%\n\n`;

  if (failedTests > 0) {
    report += `## Failed Tests\n\n`;
    results.filter(r => !r.success).forEach((result) => {
      report += `- **${result.type} (${result.locale})**: ${result.error || 'Unknown error'}\n`;
    });
    report += `\n`;
  }

  report += `## Detailed Results\n\n`;
  report += `| Type | Locale | Status |\n`;
  report += `|------|--------|--------|\n`;

  results.forEach((result) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    report += `| ${result.type} | ${result.locale} | ${status} |\n`;
  });

  return report;
}

/**
 * 保存模板到文件
 */
function saveTemplateToFile(template: EmailTemplateContent, type: EmailTemplateType, locale: SupportedLocale): void {
  const filename = `${type}-${locale}.html`;
  const filepath = path.join(outputDir, filename);

  fs.writeFileSync(filepath, template.html, 'utf8');

  // 同时保存纯文本版本
  const textFilename = `${type}-${locale}.txt`;
  const textFilepath = path.join(outputDir, textFilename);
  fs.writeFileSync(textFilepath, template.text || '', 'utf8');
}

/**
 * 运行完整测试套件
 */
function runFullTestSuite(): void {
  console.log('🚀 Starting Email Templates Test Suite...');
  console.log('');

  // 创建输出目录
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 Created output directory: ${outputDir}`);
  }

  const results: Array<{ type: EmailTemplateType; locale: SupportedLocale; success: boolean; error?: string }> = [];

  console.log('🧪 Running template tests...');

  // 测试所有模板组合
  EMAIL_TYPES.forEach((type) => {
    LOCALES.forEach((locale) => {
      try {
        const variables = generateTestVariables(type);
        const template = mockGenerateEmailTemplate(type, locale, variables);

        // 保存模板到文件
        saveTemplateToFile(template, type, locale);

        // 运行测试
        const success = testSingleTemplate(type, locale);
        results.push({ type, locale, success });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`❌ ${type} (${locale}): ${errorMessage}`);
        results.push({ type, locale, success: false, error: errorMessage });
      }
    });
  });

  console.log('');
  console.log('📊 Generating test report...');

  // 生成测试报告
  const report = generateTestReport(results);
  const reportPath = path.join(outputDir, 'test-report.md');
  fs.writeFileSync(reportPath, report, 'utf8');

  console.log('');
  console.log('✅ Test suite completed!');
  console.log('');
  console.log('📋 Results:');

  const totalTests = results.length;
  const passedTests = results.filter(r => r.success).length;
  const failedTests = totalTests - passedTests;

  console.log(`   - Total: ${totalTests}`);
  console.log(`   - Passed: ${passedTests}`);
  console.log(`   - Failed: ${failedTests}`);
  console.log(`   - Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log('');
  console.log('📁 Output files:');
  console.log(`   - Templates: ${outputDir}`);
  console.log(`   - Report: ${reportPath}`);
  console.log('');

  if (failedTests > 0) {
    console.log('⚠️  Some tests failed. Check the report for details.');
    process.exit(1);
  } else {
    console.log('🎉 All tests passed!');
  }
}

/**
 * 运行性能测试
 */
function runPerformanceTest(): void {
  console.log('⚡ Running performance tests...');

  const iterations = 100;
  const startTime = Date.now();

  for (let i = 0; i < iterations; i++) {
    EMAIL_TYPES.forEach((type) => {
      LOCALES.forEach((locale) => {
        const variables = generateTestVariables(type);
        mockGenerateEmailTemplate(type, locale, variables);
      });
    });
  }

  const endTime = Date.now();
  const totalTime = endTime - startTime;
  const avgTime = totalTime / (iterations * EMAIL_TYPES.length * LOCALES.length);

  console.log(`📈 Performance Results:`);
  console.log(`   - Total iterations: ${iterations}`);
  console.log(`   - Total templates: ${iterations * EMAIL_TYPES.length * LOCALES.length}`);
  console.log(`   - Total time: ${totalTime}ms`);
  console.log(`   - Average time per template: ${avgTime.toFixed(2)}ms`);
  console.log('');
}

/**
 * 运行安全测试
 */
function runSecurityTest(): void {
  console.log('🔒 Running security tests...');

  const maliciousInputs = [
    '<script>alert("xss")</script>',
    'javascript:alert("xss")',
    '" onload="alert(1)"',
    '<img src=x onerror=alert(1)>',
    '${7*7}', // eslint-disable-line no-template-curly-in-string
    '{{constructor.constructor("alert(1)")()}}',
  ];

  let securityIssues = 0;

  maliciousInputs.forEach((maliciousInput) => {
    try {
      const variables = {
        ...generateTestVariables('confirmation'),
        Email: `test+${maliciousInput}@example.com`,
        ConfirmationURL: `https://rolitt.com/auth/confirm?token=${encodeURIComponent(maliciousInput)}`,
      };

      const template = mockGenerateEmailTemplate('confirmation', 'en', variables);

      // 检查是否包含未转义的恶意内容
      if (template.html.includes('<script>')
        || template.html.includes('javascript:')
        || template.html.includes('onerror=')) {
        console.error(`❌ Security issue detected with input: ${maliciousInput}`);
        securityIssues++;
      } else {
        console.log(`✅ Input safely handled: ${maliciousInput.substring(0, 20)}...`);
      }
    } catch {
      console.log(`✅ Input rejected: ${maliciousInput.substring(0, 20)}...`);
    }
  });

  if (securityIssues === 0) {
    console.log('🎉 All security tests passed!');
  } else {
    console.error(`⚠️  ${securityIssues} security issues detected!`);
  }

  console.log('');
}

/**
 * 主函数
 */
function main(): void {
  const args = process.argv.slice(2);
  const command = args[0] || 'full';

  console.log('📧 Email Templates Test Script');
  console.log('==============================');
  console.log('');

  switch (command) {
    case 'full':
    case 'all':
      runFullTestSuite();
      runPerformanceTest();
      runSecurityTest();
      break;

    case 'basic':
    case 'test':
      runFullTestSuite();
      break;

    case 'performance':
    case 'perf':
      runPerformanceTest();
      break;

    case 'security':
    case 'sec':
      runSecurityTest();
      break;

    case 'help':
    case '--help':
    case '-h':
      console.log('Usage: npx tsx scripts/test-email-templates.ts [command]');
      console.log('');
      console.log('Commands:');
      console.log('  full, all     Run all tests (default)');
      console.log('  basic, test   Run basic template tests');
      console.log('  performance   Run performance tests');
      console.log('  security      Run security tests');
      console.log('  help          Show this help message');
      console.log('');
      break;

    default:
      console.error(`Unknown command: ${command}`);
      console.log('Use "help" for available commands.');
      process.exit(1);
  }
}

// 运行脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  generateTestVariables,
  mockGenerateEmailTemplate,
  runFullTestSuite,
  runPerformanceTest,
  runSecurityTest,
};
