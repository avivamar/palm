/**
 * Confirmation Email Template
 * 注册确认邮件模板
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
 * 获取注册确认邮件的多语言内容
 */
function getConfirmationContent(locale: SupportedLocale) {
  const content = {
    'en': {
      subject: 'Welcome to Rolitt - Confirm Your Email',
      title: 'Welcome to Rolitt! 🎉',
      greeting: 'Hi there!',
      message: 'Thank you for joining Rolitt, your intelligent emotional AI companion! We\'re excited to have you on board.',
      instruction: 'To complete your registration and start your journey with Rolitt, please confirm your email address by clicking the button below:',
      buttonText: 'Confirm Email Address',
      alternativeText: 'If the button above doesn\'t work, you can also copy and paste the following link into your browser:',
      welcomeNote: 'Once confirmed, you\'ll be able to access all of Rolitt\'s features and begin your AI companionship experience.',
      supportText: 'If you didn\'t create this account, please ignore this email or contact our support team.',
      thankYou: 'Welcome aboard!',
      team: 'The Rolitt Team',
    },
    'es': {
      subject: 'Bienvenido a Rolitt - Confirma tu Email',
      title: '¡Bienvenido a Rolitt! 🎉',
      greeting: '¡Hola!',
      message: '¡Gracias por unirte a Rolitt, tu compañero de IA emocional inteligente! Estamos emocionados de tenerte a bordo.',
      instruction: 'Para completar tu registro y comenzar tu viaje con Rolitt, por favor confirma tu dirección de email haciendo clic en el botón de abajo:',
      buttonText: 'Confirmar Dirección de Email',
      alternativeText: 'Si el botón de arriba no funciona, también puedes copiar y pegar el siguiente enlace en tu navegador:',
      welcomeNote: 'Una vez confirmado, podrás acceder a todas las funciones de Rolitt y comenzar tu experiencia de compañía de IA.',
      supportText: 'Si no creaste esta cuenta, por favor ignora este email o contacta a nuestro equipo de soporte.',
      thankYou: '¡Bienvenido a bordo!',
      team: 'El Equipo Rolitt',
    },
    'zh-HK': {
      subject: '歡迎來到 Rolitt - 確認您的電子郵件',
      title: '歡迎來到 Rolitt！🎉',
      greeting: '您好！',
      message: '感謝您加入 Rolitt，您的智能情感 AI 夥伴！我們很高興您的加入。',
      instruction: '要完成註冊並開始您與 Rolitt 的旅程，請點擊下方按鈕確認您的電子郵件地址：',
      buttonText: '確認電子郵件地址',
      alternativeText: '如果上方按鈕無法使用，您也可以複製並貼上以下連結到瀏覽器中：',
      welcomeNote: '確認後，您將能夠使用 Rolitt 的所有功能，並開始您的 AI 夥伴體驗。',
      supportText: '如果您沒有創建此帳戶，請忽略此郵件或聯繫我們的支援團隊。',
      thankYou: '歡迎加入！',
      team: 'Rolitt 團隊',
    },
    'ja': {
      subject: 'Rolittへようこそ - メールアドレスの確認',
      title: 'Rolittへようこそ！🎉',
      greeting: 'こんにちは！',
      message: 'あなたの知的な感情AIコンパニオン、Rolittにご参加いただき、ありがとうございます！あなたをお迎えできて嬉しく思います。',
      instruction: '登録を完了し、Rolittとの旅を始めるために、下のボタンをクリックしてメールアドレスを確認してください：',
      buttonText: 'メールアドレスを確認',
      alternativeText: '上のボタンが機能しない場合は、以下のリンクをコピーしてブラウザに貼り付けることもできます：',
      welcomeNote: '確認後、Rolittのすべての機能にアクセスし、AIコンパニオンシップ体験を始めることができます。',
      supportText: 'このアカウントを作成していない場合は、このメールを無視するか、サポートチームにお問い合わせください。',
      thankYou: 'ようこそ！',
      team: 'Rolittチーム',
    },
  };

  return content[locale];
}

/**
 * 生成注册确认邮件模板
 * @param locale 语言
 * @param variables 模板变量
 * @returns 邮件模板内容
 */
export function generateConfirmationTemplate(
  locale: SupportedLocale,
  variables: SupabaseTemplateVariables,
): EmailTemplateContent {
  const content = getConfirmationContent(locale);
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
        
        <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #EBFF7F;">
          <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0' })}">
            ${content.welcomeNote}
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
    text: `${content.title}\n\n${content.greeting}\n\n${content.message}\n\n${content.instruction}\n\n${confirmationUrl}\n\n${content.welcomeNote}\n\n${content.supportText}\n\n${content.thankYou}\n${content.team}`,
  };
}
