/**
 * Recovery Email Template
 * 密码重置邮件模板
 */

import type { EmailTemplateContent, SupabaseTemplateVariables, SupportedLocale } from '../types';
import { EMAIL_STYLES } from '../config';
import {
  createButton,
  createEmailFooter,
  createEmailHeader,
  createEmailLayout,
  generateInlineStyles,
  replaceTemplateVariables,
} from '../utils';

/**
 * 获取密码重置邮件的多语言内容
 */
function getRecoveryContent(locale: SupportedLocale) {
  const content = {
    'en': {
      subject: 'Reset Your Password',
      title: 'Password Reset Request 🔐',
      greeting: 'Hi there!',
      message: 'We received a request to reset the password for your Rolitt account.',
      instruction: 'If you requested this password reset, click the button below to create a new password:',
      buttonText: 'Reset Password',
      alternativeText: 'If the button above doesn\'t work, you can also copy and paste the following link into your browser:',
      securityNote: 'For your security, this link will expire in 24 hours.',
      notRequestedTitle: 'Didn\'t request this?',
      notRequestedText: 'If you didn\'t request a password reset, please ignore this email. Your password will remain unchanged.',
      supportText: 'If you\'re having trouble or have concerns about your account security, please contact our support team.',
      thankYou: 'Stay secure!',
      team: 'The Rolitt Team',
    },
    'es': {
      subject: 'Restablece tu contraseña de Rolitt',
      title: 'Solicitud de restablecimiento de contraseña 🔐',
      greeting: '¡Hola!',
      message: 'Recibimos una solicitud para restablecer la contraseña de tu cuenta de Rolitt.',
      instruction: 'Si solicitaste este restablecimiento de contraseña, haz clic en el botón de abajo para crear una nueva contraseña:',
      buttonText: 'Restablecer Contraseña',
      alternativeText: 'Si el botón de arriba no funciona, también puedes copiar y pegar el siguiente enlace en tu navegador:',
      securityNote: 'Por tu seguridad, este enlace expirará en 24 horas.',
      notRequestedTitle: '¿No solicitaste esto?',
      notRequestedText: 'Si no solicitaste un restablecimiento de contraseña, por favor ignora este correo. Tu contraseña permanecerá sin cambios.',
      supportText: 'Si tienes problemas o preocupaciones sobre la seguridad de tu cuenta, por favor contacta a nuestro equipo de soporte.',
      thankYou: '¡Mantente seguro!',
      team: 'El Equipo de Rolitt',
    },
    'ja': {
      subject: 'Rolittパスワードのリセット',
      title: 'パスワードリセットリクエスト 🔐',
      greeting: 'こんにちは！',
      message: 'あなたのRolittアカウントのパスワードリセットのリクエストを受け取りました。',
      instruction: 'このパスワードリセットをリクエストした場合は、下のボタンをクリックして新しいパスワードを作成してください：',
      buttonText: 'パスワードをリセット',
      alternativeText: '上のボタンが機能しない場合は、以下のリンクをコピーしてブラウザに貼り付けることもできます：',
      securityNote: 'セキュリティのため、このリンクは24時間で期限切れになります。',
      notRequestedTitle: 'リクエストしていませんか？',
      notRequestedText: 'パスワードリセットをリクエストしていない場合は、このメールを無視してください。パスワードは変更されません。',
      supportText: '問題がある場合やアカウントのセキュリティについて懸念がある場合は、サポートチームにお問い合わせください。',
      thankYou: '安全にお過ごしください！',
      team: 'Rolittチーム',
    },
    'zh-HK': {
      subject: '重設您的密碼',
      title: '密碼重設請求 🔐',
      greeting: '您好！',
      message: '我們收到了重設您帳戶密碼的請求。',
      instruction: '如果您請求了此密碼重設，請點擊下方按鈕創建新密碼：',
      buttonText: '重設密碼',
      alternativeText: '如果上方按鈕無法使用，您也可以複製並貼上以下連結到瀏覽器中：',
      securityNote: '為了您的安全，此連結將在 24 小時後過期。',
      notRequestedTitle: '沒有請求此操作？',
      notRequestedText: '如果您沒有請求密碼重設，請忽略此郵件。您的密碼將保持不變。',
      supportText: '如果您遇到問題或對帳戶安全有疑慮，請聯繫我們的支援團隊。',
      thankYou: '保持安全！',
      team: '團隊',
    },
  };

  return content[locale];
}

/**
 * 生成密码重置邮件模板
 * @param locale 语言
 * @param variables 模板变量
 * @returns 邮件模板内容
 */
export function generateRecoveryTemplate(
  locale: SupportedLocale,
  variables: SupabaseTemplateVariables,
): EmailTemplateContent {
  const content = getRecoveryContent(locale);
  const confirmationUrl = variables.ConfirmationURL || '#';

  // 创建邮件内容
  const emailContent = `
    ${createEmailHeader(locale)}
    <tr>
      <td class="content" style="${generateInlineStyles(EMAIL_STYLES.content)}">
        <h1 style="${generateInlineStyles(EMAIL_STYLES.title)}">
          ${content.title}
        </h1>
        
        <p style="${generateInlineStyles(EMAIL_STYLES.paragraph)}">
          ${content.greeting}
        </p>
        
        <p style="${generateInlineStyles(EMAIL_STYLES.paragraph)}">
          ${content.message}
        </p>
        
        <p style="${generateInlineStyles(EMAIL_STYLES.paragraph)}">
          ${content.instruction}
        </p>
        
        ${createButton(confirmationUrl, content.buttonText, locale)}
        
        <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, fontSize: '14px', color: '#666666' })}">
          ${content.alternativeText}
        </p>
        
        <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, fontSize: '14px', color: '#666666', wordBreak: 'break-all' })}">
          ${confirmationUrl}
        </p>
        
        <div style="margin: 30px 0; padding: 20px; background-color: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107;">
          <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0 0 10px 0', fontWeight: 'bold', color: '#856404' })}">
            ⚠️ ${content.securityNote}
          </p>
        </div>
        
        <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #6c757d;">
          <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0 0 10px 0', fontWeight: 'bold' })}">
            ${content.notRequestedTitle}
          </p>
          <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0' })}">
            ${content.notRequestedText}
          </p>
        </div>
        
        <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, fontSize: '14px', color: '#666666' })}">
          ${content.supportText}
        </p>
        
        <p style="${generateInlineStyles(EMAIL_STYLES.paragraph)}">
          ${content.thankYou}<br>
          <strong>${content.team}</strong>
        </p>
      </td>
    </tr>
    ${createEmailFooter(locale)}
  `;

  // 生成完整的HTML
  const html = createEmailLayout(emailContent, locale);

  // 替换模板变量
  const finalHtml = replaceTemplateVariables(html, variables);

  return {
    subject: content.subject,
    html: finalHtml,
    text: `${content.title}\n\n${content.greeting}\n\n${content.message}\n\n${content.instruction}\n\n${confirmationUrl}\n\n${content.securityNote}\n\n${content.notRequestedTitle}\n${content.notRequestedText}\n\n${content.supportText}\n\n${content.thankYou}\n${content.team}`,
  };
}
