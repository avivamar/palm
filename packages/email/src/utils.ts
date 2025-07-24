/**
 * Supabase Auth Email Templates Utilities
 * 邮件模板系统的工具函数
 */

import type { EmailTemplateContent, SupabaseTemplateVariables, SupportedLocale } from './types';
import { EMAIL_STYLES, getEnvironmentConfig } from './config';

/**
 * 替换模板中的变量
 * @param template 模板字符串
 * @param variables 变量对象
 * @returns 替换后的字符串
 */
export function replaceTemplateVariables(
  template: string,
  variables: SupabaseTemplateVariables,
): string {
  let result = template;

  // 替换所有 {{ .VariableName }} 格式的变量
  Object.entries(variables).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const regex = new RegExp(`{{\\s*\\.${key}\\s*}}`, 'g');
      result = result.replace(regex, String(value));
    }
  });

  return result;
}

/**
 * 生成内联CSS样式字符串
 * @param styles 样式对象
 * @returns CSS字符串
 */
export function generateInlineStyles(styles: Record<string, any>): string {
  return Object.entries(styles)
    .map(([property, value]) => {
      // 将驼峰命名转换为CSS属性名
      const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssProperty}: ${value}`;
    })
    .join('; ');
}

/**
 * 创建邮件HTML结构的基础模板
 * @param content 邮件内容
 * @param locale 语言
 * @returns 完整的HTML邮件模板
 */
export function createEmailLayout(
  content: string,
  locale: SupportedLocale = 'en',
): string {
  // const envConfig = getEnvironmentConfig();

  return `
<!DOCTYPE html>
<html lang="${locale}" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Rolitt</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      outline: none;
      text-decoration: none;
    }
    
    /* Responsive styles */
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .content {
        padding: 20px !important;
      }
      .header {
        padding: 20px !important;
      }
      .footer {
        padding: 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" class="container" style="${generateInlineStyles(EMAIL_STYLES.container)}; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-radius: 8px; overflow: hidden;">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 创建邮件头部
 * @param locale 语言
 * @returns 头部HTML
 */
export function createEmailHeader(_locale: SupportedLocale = 'en'): string {
  const envConfig = getEnvironmentConfig();

  return `
<tr>
  <td class="header" style="${generateInlineStyles(EMAIL_STYLES.header)}">
    <img src="${envConfig.logoUrl}" alt="Rolitt" style="${generateInlineStyles(EMAIL_STYLES.logo)}" />
  </td>
</tr>`;
}

/**
 * 创建邮件页脚
 * @param locale 语言
 * @returns 页脚HTML
 */
export function createEmailFooter(locale: SupportedLocale = 'en'): string {
  const envConfig = getEnvironmentConfig();

  // 根据语言获取页脚文本
  const footerTexts = {
    'en': {
      company: 'Rolitt - Your Intelligent Emotional AI Companion',
      address: 'Made with ❤️ by Rolitt Team',
      unsubscribe: 'If you no longer wish to receive these emails, you can unsubscribe here.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
    },
    'es': {
      company: 'Rolitt - Tu Compañero de IA Emocional Inteligente',
      address: 'Hecho con ❤️ por el Equipo Rolitt',
      unsubscribe: 'Si ya no deseas recibir estos correos, puedes darte de baja aquí.',
      privacy: 'Política de Privacidad',
      terms: 'Términos de Servicio',
    },
    'zh-HK': {
      company: 'Rolitt - 您的智能情感 AI 夥伴',
      address: '由 Rolitt 團隊用 ❤️ 製作',
      unsubscribe: '如果您不希望再收到這些郵件，可以在此取消訂閱。',
      privacy: '隱私政策',
      terms: '服務條款',
    },
    'ja': {
      company: 'Rolitt - あなたの知的な感情AIコンパニオン',
      address: 'Rolittチームが❤️を込めて制作',
      unsubscribe: 'これらのメールを受信したくない場合は、こちらから配信停止できます。',
      privacy: 'プライバシーポリシー',
      terms: '利用規約',
    },
  };

  const texts = footerTexts[locale];

  return `
<tr>
  <td class="footer" style="${generateInlineStyles(EMAIL_STYLES.footer)}">
    <p style="${generateInlineStyles(EMAIL_STYLES.footerText)}">
      <strong>${texts.company}</strong>
    </p>
    <p style="${generateInlineStyles(EMAIL_STYLES.footerText)}">
      ${texts.address}
    </p>
    <div style="${generateInlineStyles(EMAIL_STYLES.socialLinks)}">
      <a href="${envConfig.websiteUrl}/privacy" style="${generateInlineStyles(EMAIL_STYLES.socialLink)}">${texts.privacy}</a>
      |
      <a href="${envConfig.websiteUrl}/terms" style="${generateInlineStyles(EMAIL_STYLES.socialLink)}">${texts.terms}</a>
    </div>
    <p style="${generateInlineStyles({ ...EMAIL_STYLES.footerText, marginTop: '20px' })}">
      ${texts.unsubscribe}
    </p>
  </td>
</tr>`;
}

/**
 * 创建OTP代码显示块
 * @param token OTP代码
 * @param locale 语言
 * @returns OTP HTML块
 */
export function createOTPBlock(token: string, locale: SupportedLocale = 'en'): string {
  const labels = {
    'en': 'Your verification code:',
    'es': 'Tu código de verificación:',
    'zh-HK': '您的驗證碼：',
    'ja': '認証コード：',
  };

  return `
<div style="text-align: center; margin: 30px 0;">
  <p style="${generateInlineStyles(EMAIL_STYLES.paragraph)}">
    ${labels[locale]}
  </p>
  <div style="${generateInlineStyles(EMAIL_STYLES.otpCode)}">
    ${token}
  </div>
</div>`;
}

/**
 * 创建按钮
 * @param url 链接地址
 * @param text 按钮文本
 * @param locale 语言
 * @returns 按钮HTML
 */
export function createButton(
  url: string,
  text: string,
  _locale: SupportedLocale = 'en',
): string {
  return `
<div style="text-align: center; margin: 30px 0;">
  <a href="${url}" style="${generateInlineStyles(EMAIL_STYLES.button)}" target="_blank">
    ${text}
  </a>
</div>`;
}

/**
 * 验证邮件模板内容
 * @param content 邮件内容
 * @returns 是否有效
 */
export function validateEmailTemplate(content: EmailTemplateContent): boolean {
  // 检查必需字段
  if (!content.subject || !content.html) {
    return false;
  }

  // 检查HTML是否包含基本结构
  const hasBasicStructure = content.html.includes('<html')
    && content.html.includes('<body')
    && content.html.includes('</html>');

  return hasBasicStructure;
}

/**
 * 转换HTML为纯文本（用于邮件的文本版本）
 * @param html HTML内容
 * @returns 纯文本内容
 */
export function htmlToText(html: string): string {
  return html
    // 移除HTML标签
    .replace(/<[^>]*>/g, '')
    // 转换HTML实体
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    // 清理多余的空白
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 获取语言对应的文本方向
 * @param locale 语言代码
 * @returns 文本方向
 */
export function getTextDirection(_locale: SupportedLocale): 'ltr' | 'rtl' {
  // 目前支持的语言都是从左到右
  return 'ltr';
}
