/**
 * Magic Link Email Template
 * 魔法链接登录邮件模板
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
 * 获取魔法链接邮件的多语言内容
 */
function getMagicLinkContent(locale: SupportedLocale) {
  const content = {
    'en': {
      subject: 'Your ThePalmistryLife Magic Link 🪄',
      title: 'Sign in to ThePalmistryLife 🪄',
      greeting: 'Hi there!',
      message: 'You requested a magic link to sign in to your ThePalmistryLife palm reading account. No password needed!',
      instruction: 'Click the button below to securely sign in to your palm analysis account:',
      buttonText: 'Sign In & Continue Palm Reading',
      alternativeText: 'If the button above doesn\'t work, you can also copy and paste the following link into your browser:',
      securityTitle: 'Security Information',
      securityPoints: [
        '🔒 This link is unique and secure',
        '⏰ Valid for 1 hour only',
        '🔐 Can only be used once',
        '📱 Works on any device',
      ],
      notRequestedTitle: 'Didn\'t request this?',
      notRequestedText: 'If you didn\'t request this magic link, please ignore this email. Your palm reading account remains secure.',
      tipsTitle: 'Pro Tips',
      tips: [
        '💡 Bookmark this page after signing in for quick access to palm analysis',
        '🔔 Enable notifications to stay updated on your palm readings',
        '⚡ Magic links are faster and more secure than passwords',
      ],
      supportText: 'Having trouble signing in to your palm reading account? Our support team is here to help.',
      thankYou: 'Happy to have you back for more palm insights!',
      team: 'The ThePalmistryLife Team',
    },
    'es': {
      subject: 'Tu Enlace Mágico de ThePalmistryLife 🪄',
      title: 'Inicia sesión en ThePalmistryLife 🪄',
      greeting: '¡Hola!',
      message: 'Solicitaste un enlace mágico para iniciar sesión en tu cuenta de lectura de palmas de ThePalmistryLife. ¡No necesitas contraseña!',
      instruction: 'Haz clic en el botón de abajo para iniciar sesión de forma segura en tu cuenta de análisis de palmas:',
      buttonText: 'Iniciar Sesión y Continuar Lectura de Palmas',
      alternativeText: 'Si el botón de arriba no funciona, también puedes copiar y pegar el siguiente enlace en tu navegador:',
      securityTitle: 'Información de Seguridad',
      securityPoints: [
        '🔒 Este enlace es único y seguro',
        '⏰ Válido solo por 1 hora',
        '🔐 Solo se puede usar una vez',
        '📱 Funciona en cualquier dispositivo',
      ],
      notRequestedTitle: '¿No solicitaste esto?',
      notRequestedText: 'Si no solicitaste este enlace mágico, por favor ignora este email. Tu cuenta de lectura de palmas permanece segura.',
      tipsTitle: 'Consejos Pro',
      tips: [
        '💡 Marca esta página después de iniciar sesión para acceso rápido al análisis de palmas',
        '🔔 Habilita notificaciones para mantenerte actualizado sobre tus lecturas de palmas',
        '⚡ Los enlaces mágicos son más rápidos y seguros que las contraseñas',
      ],
      supportText: '¿Tienes problemas para iniciar sesión en tu cuenta de lectura de palmas? Nuestro equipo de soporte está aquí para ayudar.',
      thankYou: '¡Nos alegra tenerte de vuelta para más conocimientos de palmas!',
      team: 'El Equipo ThePalmistryLife',
    },
    'zh-HK': {
      subject: '您的 ThePalmistryLife 魔法連結 🪄',
      title: '登入 ThePalmistryLife 🪄',
      greeting: '您好！',
      message: '您請求了一個魔法連結來登入您的 ThePalmistryLife 手相分析帳戶。無需密碼！',
      instruction: '點擊下方按鈕安全地登入您的手相分析帳戶：',
      buttonText: '登入並繼續手相分析',
      alternativeText: '如果上方按鈕無法使用，您也可以複製並貼上以下連結到瀏覽器中：',
      securityTitle: '安全資訊',
      securityPoints: [
        '🔒 此連結是獨特且安全的',
        '⏰ 僅在 1 小時內有效',
        '🔐 只能使用一次',
        '📱 在任何設備上都可使用',
      ],
      notRequestedTitle: '沒有請求此操作？',
      notRequestedText: '如果您沒有請求此魔法連結，請忽略此郵件。您的手相分析帳戶仍然安全。',
      tipsTitle: '專業提示',
      tips: [
        '💡 登入後將此頁面加入書籤以便快速存取手相分析',
        '🔔 啟用通知以保持手相解讀的更新',
        '⚡ 魔法連結比密碼更快速且更安全',
      ],
      supportText: '登入手相分析帳戶遇到問題？我們的支援團隊隨時為您提供幫助。',
      thankYou: '很高興您回來獲得更多手相洞察！',
      team: 'ThePalmistryLife 團隊',
    },
    'ja': {
      subject: 'あなたのThePalmistryLifeマジックリンク 🪄',
      title: 'ThePalmistryLifeにサインイン 🪄',
      greeting: 'こんにちは！',
      message: 'あなたのThePalmistryLife手相分析アカウントにサインインするためのマジックリンクをリクエストしました。パスワードは不要です！',
      instruction: '下のボタンをクリックして、安全に手相分析アカウントにサインインしてください：',
      buttonText: 'サインインして手相リーディングを続ける',
      alternativeText: '上のボタンが機能しない場合は、以下のリンクをコピーしてブラウザに貼り付けることもできます：',
      securityTitle: 'セキュリティ情報',
      securityPoints: [
        '🔒 このリンクは一意で安全です',
        '⏰ 1時間のみ有効',
        '🔐 一度だけ使用可能',
        '📱 どのデバイスでも動作します',
      ],
      notRequestedTitle: 'リクエストしていませんか？',
      notRequestedText: 'このマジックリンクをリクエストしていない場合は、このメールを無視してください。手相分析アカウントは安全なままです。',
      tipsTitle: 'プロのヒント',
      tips: [
        '💡 サインイン後、このページをブックマークして手相分析に素早くアクセス',
        '🔔 通知を有効にして手相リーディングの最新情報を受け取る',
        '⚡ マジックリンクはパスワードより高速で安全です',
      ],
      supportText: '手相分析アカウントへのサインインに問題がありますか？サポートチームがお手伝いします。',
      thankYou: 'より多くの手相の洞察のためにお帰りなさい！',
      team: 'ThePalmistryLifeチーム',
    },
  };

  return content[locale];
}

/**
 * 生成魔法链接邮件模板
 * @param locale 语言
 * @param variables 模板变量
 * @returns 邮件模板内容
 */
export function generateMagicLinkTemplate(
  locale: SupportedLocale,
  variables: SupabaseTemplateVariables,
): EmailTemplateContent {
  const content = getMagicLinkContent(locale);
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
        
        <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%); border-radius: 12px; border-left: 4px solid #28a745;">
          <h3 style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0 0 15px 0', fontWeight: 'bold', fontSize: '18px', color: '#155724' })}">
            ${content.securityTitle}
          </h3>
          <div style="margin: 10px 0;">
            ${content.securityPoints.map(point =>
              `<p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '8px 0', fontSize: '15px' })}">${point}</p>`,
            ).join('')}
          </div>
        </div>
        
        <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #6c757d;">
          <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0 0 10px 0', fontWeight: 'bold' })}">
            ${content.notRequestedTitle}
          </p>
          <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0' })}">
            ${content.notRequestedText}
          </p>
        </div>
        
        <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%); border-radius: 12px; border-left: 4px solid #EBFF7F;">
          <h3 style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0 0 15px 0', fontWeight: 'bold', fontSize: '18px', color: '#333333' })}">
            ${content.tipsTitle}
          </h3>
          <div style="margin: 10px 0;">
            ${content.tips.map(tip =>
              `<p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '8px 0', fontSize: '15px' })}">${tip}</p>`,
            ).join('')}
          </div>
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
    text: `${content.title}\n\n${content.greeting}\n\n${content.message}\n\n${content.instruction}\n\n${confirmationUrl}\n\n${content.securityTitle}\n${content.securityPoints.join('\n')}\n\n${content.notRequestedTitle}\n${content.notRequestedText}\n\n${content.tipsTitle}\n${content.tips.join('\n')}\n\n${content.supportText}\n\n${content.thankYou}\n${content.team}`,
  };
}
