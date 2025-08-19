/**
 * Invite Email Template
 * 手相分析邀请邮件模板
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
 * 获取用户邀请邮件的多语言内容
 */
function getInviteContent(locale: SupportedLocale) {
  const content = {
    'en': {
      subject: 'You\'re invited to discover your palm\'s secrets! 🔮',
      title: 'Welcome to ThePalmistryLife! 🌟',
      greeting: 'Hi there!',
      message: 'You\'ve been invited to join ThePalmistryLife, the AI-powered platform that reveals the mysteries hidden in your palms.',
      invitation: 'Someone thought you\'d be fascinated by what your palms can reveal. We\'re excited to guide you on this mystical journey!',
      instruction: 'Click the button below to accept your invitation and start your palm reading journey:',
      buttonText: 'Start Palm Reading',
      alternativeText: 'If the button above doesn\'t work, you can also copy and paste the following link into your browser:',
      whatNext: 'Your palm reading journey starts here:',
      step1: '✅ Create your secure account',
      step2: '📸 Upload your palm photo',
      step3: '🔮 Get your AI palm analysis',
      step4: '✨ Discover your palm\'s secrets',
      expireNote: 'This invitation will expire in 7 days for security reasons.',
      needHelp: 'Need help with palm analysis?',
      supportText: 'Our palm reading experts are here to help you understand your analysis. Feel free to reach out if you have any questions.',
      thankYou: 'Welcome to your mystical journey!',
      team: 'The ThePalmistryLife Team',
    },
    'es': {
      subject: '¡Estás invitado a descubrir los secretos de tu palma! 🔮',
      title: '¡Bienvenido a ThePalmistryLife! 🌟',
      greeting: '¡Hola!',
      message: 'Has sido invitado a unirte a ThePalmistryLife, la plataforma impulsada por IA que revela los misterios ocultos en tus palmas.',
      invitation: 'Alguien pensó que te fascinaría lo que tus palmas pueden revelar. ¡Estamos emocionados de guiarte en este viaje místico!',
      instruction: 'Haz clic en el botón de abajo para aceptar tu invitación y comenzar tu viaje de lectura de palmas:',
      buttonText: 'Comenzar Lectura de Palmas',
      alternativeText: 'Si el botón de arriba no funciona, también puedes copiar y pegar el siguiente enlace en tu navegador:',
      whatNext: 'Tu viaje de lectura de palmas comienza aquí:',
      step1: '✅ Crea tu cuenta segura',
      step2: '📸 Sube la foto de tu palma',
      step3: '🔮 Obtén tu análisis de palma con IA',
      step4: '✨ Descubre los secretos de tu palma',
      expireNote: 'Esta invitación expirará en 7 días por razones de seguridad.',
      needHelp: '¿Necesitas ayuda con el análisis de palmas?',
      supportText: 'Nuestros expertos en lectura de palmas están aquí para ayudarte a entender tu análisis. No dudes en contactarnos si tienes alguna pregunta.',
      thankYou: '¡Bienvenido a tu viaje místico!',
      team: 'El Equipo de ThePalmistryLife',
    },
    'ja': {
      subject: 'あなたの手相の秘密を発見しませんか！🔮',
      title: 'ThePalmistryLifeへようこそ！🌟',
      greeting: 'こんにちは！',
      message: 'あなたは、手相に隠された神秘を明かすAI搭載プラットフォーム、ThePalmistryLifeに招待されました。',
      invitation: '誰かがあなたの手相が明かすことに魅力を感じると思っています。この神秘的な旅にご案内できて興奮しています！',
      instruction: '下のボタンをクリックして招待を受け入れ、手相占いの旅を始めてください：',
      buttonText: '手相占いを始める',
      alternativeText: '上のボタンが機能しない場合は、以下のリンクをコピーしてブラウザに貼り付けることもできます：',
      whatNext: 'あなたの手相占いの旅がここから始まります：',
      step1: '✅ 安全なアカウントを作成',
      step2: '📸 手相の写真をアップロード',
      step3: '🔮 AI手相分析を取得',
      step4: '✨ 手相の秘密を発見',
      expireNote: 'セキュリティ上の理由により、この招待は7日後に期限切れになります。',
      needHelp: '手相分析でヘルプが必要ですか？',
      supportText: '私たちの手相占い専門家が、分析の理解をお手伝いします。ご質問がございましたら、お気軽にお問い合わせください。',
      thankYou: '神秘的な旅へようこそ！',
      team: 'ThePalmistryLifeチーム',
    },
    'zh-HK': {
      subject: '邀請您發現手相的秘密！🔮',
      title: '歡迎來到 ThePalmistryLife！🌟',
      greeting: '您好！',
      message: '您已被邀請加入 ThePalmistryLife，這個由AI驅動的平台能揭示隱藏在您手相中的奧秘。',
      invitation: '有人認為您會對手相能揭示的內容感到著迷。我們很興奮能在這神秘之旅中指導您！',
      instruction: '點擊下方按鈕接受邀請並開始您的手相占卜之旅：',
      buttonText: '開始手相占卜',
      alternativeText: '如果上方按鈕無法使用，您也可以複製並貼上以下連結到瀏覽器中：',
      whatNext: '您的手相占卜之旅從這裡開始：',
      step1: '✅ 創建您的安全帳戶',
      step2: '📸 上傳您的手相照片',
      step3: '🔮 獲得AI手相分析',
      step4: '✨ 發現您手相的秘密',
      expireNote: '為了安全起見，此邀請將在 7 天後過期。',
      needHelp: '需要手相分析幫助？',
      supportText: '我們的手相占卜專家會幫助您理解分析結果。如果您有任何問題，請隨時聯繫我們。',
      thankYou: '歡迎踏上神秘之旅！',
      team: 'ThePalmistryLife 團隊',
    },
  };

  return content[locale];
}

/**
 * 生成用户邀请邮件模板
 * @param locale 语言
 * @param variables 模板变量
 * @returns 邮件模板内容
 */
export function generateInviteTemplate(
  locale: SupportedLocale,
  variables: SupabaseTemplateVariables,
): EmailTemplateContent {
  const content = getInviteContent(locale);
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
          ${content.invitation}
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
        
        <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; border-left: 4px solid #EBFF7F;">
          <h3 style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0 0 15px 0', fontWeight: 'bold', fontSize: '18px', color: '#333333' })}">
            ${content.whatNext}
          </h3>
          <div style="margin: 10px 0;">
            <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '8px 0', fontSize: '15px' })}">
              ${content.step1}
            </p>
            <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '8px 0', fontSize: '15px' })}">
              ${content.step2}
            </p>
            <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '8px 0', fontSize: '15px' })}">
              ${content.step3}
            </p>
            <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '8px 0', fontSize: '15px' })}">
              ${content.step4}
            </p>
          </div>
        </div>
        
        <div style="margin: 30px 0; padding: 20px; background-color: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107;">
          <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0', fontSize: '14px', color: '#856404' })}">
            ⏰ ${content.expireNote}
          </p>
        </div>
        
        <div style="margin: 30px 0; padding: 20px; background-color: #e7f3ff; border-radius: 6px; border-left: 4px solid #0066cc;">
          <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0 0 10px 0', fontWeight: 'bold', color: '#0066cc' })}">
            💡 ${content.needHelp}
          </p>
          <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0', fontSize: '14px' })}">
            ${content.supportText}
          </p>
        </div>
        
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
    text: `${content.title}\n\n${content.greeting}\n\n${content.message}\n\n${content.invitation}\n\n${content.instruction}\n\n${confirmationUrl}\n\n${content.whatNext}\n${content.step1}\n${content.step2}\n${content.step3}\n${content.step4}\n\n${content.expireNote}\n\n${content.needHelp}\n${content.supportText}\n\n${content.thankYou}\n${content.team}`,
  };
}
