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
      subject: 'Welcome to ThePalmistryLife - Confirm Your Email',
      title: 'Welcome to ThePalmistryLife! 🎉',
      greeting: 'Hi there!',
      message: 'Thank you for joining ThePalmistryLife, your mystical palm reading companion! We\'re excited to help you discover the secrets hidden in your palms.',
      instruction: 'To complete your palm reading account setup and start your journey with ThePalmistryLife, please confirm your email address by clicking the button below:',
      buttonText: 'Confirm Email & Start Palm Reading',
      alternativeText: 'If the button above doesn\'t work, you can also copy and paste the following link into your browser:',
      welcomeNote: 'Once confirmed, you\'ll be able to access all of ThePalmistryLife\'s features and begin your palm analysis experience.',
      supportText: 'If you didn\'t create this palm reading account, please ignore this email or contact our support team.',
      thankYou: 'Welcome to the mystical world!',
      team: 'The ThePalmistryLife Team',
    },
    'es': {
      subject: 'Bienvenido a ThePalmistryLife - Confirma tu Email',
      title: '¡Bienvenido a ThePalmistryLife! 🎉',
      greeting: '¡Hola!',
      message: '¡Gracias por unirte a ThePalmistryLife, tu compañero místico de lectura de palmas! Estamos emocionados de ayudarte a descubrir los secretos ocultos en tus palmas.',
      instruction: 'Para completar la configuración de tu cuenta de lectura de palmas y comenzar tu viaje con ThePalmistryLife, por favor confirma tu dirección de email haciendo clic en el botón de abajo:',
      buttonText: 'Confirmar Email y Comenzar Lectura de Palmas',
      alternativeText: 'Si el botón de arriba no funciona, también puedes copiar y pegar el siguiente enlace en tu navegador:',
      welcomeNote: 'Una vez confirmado, podrás acceder a todas las funciones de ThePalmistryLife y comenzar tu experiencia de análisis de palmas.',
      supportText: 'Si no creaste esta cuenta de lectura de palmas, por favor ignora este email o contacta a nuestro equipo de soporte.',
      thankYou: '¡Bienvenido al mundo místico!',
      team: 'El Equipo ThePalmistryLife',
    },
    'zh-HK': {
      subject: '歡迎來到 ThePalmistryLife - 確認您的電子郵件',
      title: '歡迎來到 ThePalmistryLife！🎉',
      greeting: '您好！',
      message: '感謝您加入 ThePalmistryLife，您的神秘手相分析夥伴！我們很高興能幫助您發現手掌中隱藏的秘密。',
      instruction: '要完成手相分析帳戶設定並開始您與 ThePalmistryLife 的旅程，請點擊下方按鈕確認您的電子郵件地址：',
      buttonText: '確認電子郵件並開始手相分析',
      alternativeText: '如果上方按鈕無法使用，您也可以複製並貼上以下連結到瀏覽器中：',
      welcomeNote: '確認後，您將能夠使用 ThePalmistryLife 的所有功能，並開始您的手相分析體驗。',
      supportText: '如果您沒有創建此手相分析帳戶，請忽略此郵件或聯繫我們的支援團隊。',
      thankYou: '歡迎來到神秘世界！',
      team: 'ThePalmistryLife 團隊',
    },
    'ja': {
      subject: 'ThePalmistryLifeへようこそ - メールアドレスの確認',
      title: 'ThePalmistryLifeへようこそ！🎉',
      greeting: 'こんにちは！',
      message: 'あなたの神秘的な手相分析コンパニオン、ThePalmistryLifeにご参加いただき、ありがとうございます！あなたの手のひらに隠された秘密を発見するお手伝いができて嬉しく思います。',
      instruction: '手相分析アカウントの設定を完了し、ThePalmistryLifeとの旅を始めるために、下のボタンをクリックしてメールアドレスを確認してください：',
      buttonText: 'メールアドレスを確認して手相分析を開始',
      alternativeText: '上のボタンが機能しない場合は、以下のリンクをコピーしてブラウザに貼り付けることもできます：',
      welcomeNote: '確認後、ThePalmistryLifeのすべての機能にアクセスし、手相分析体験を始めることができます。',
      supportText: 'この手相分析アカウントを作成していない場合は、このメールを無視するか、サポートチームにお問い合わせください。',
      thankYou: '神秘的な世界へようこそ！',
      team: 'ThePalmistryLifeチーム',
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
