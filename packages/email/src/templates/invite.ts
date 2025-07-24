/**
 * Invite Email Template
 * 用户邀请邮件模板
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
      subject: 'You\'re Invited to Join Rolitt! 🎉',
      title: 'Welcome to Rolitt! 🚀',
      greeting: 'Hi there!',
      message: 'You\'ve been invited to join Rolitt, the innovative platform that\'s transforming the way we work and collaborate.',
      invitation: 'Someone thought you\'d be a great addition to our community. We\'re excited to have you on board!',
      instruction: 'Click the button below to accept your invitation and create your account:',
      buttonText: 'Accept Invitation',
      alternativeText: 'If the button above doesn\'t work, you can also copy and paste the following link into your browser:',
      whatNext: 'What happens next?',
      step1: '✅ Create your secure account',
      step2: '🎯 Set up your profile',
      step3: '🚀 Start exploring Rolitt\'s features',
      step4: '🤝 Connect with your team',
      expireNote: 'This invitation will expire in 7 days for security reasons.',
      needHelp: 'Need help getting started?',
      supportText: 'Our support team is here to help you every step of the way. Feel free to reach out if you have any questions.',
      thankYou: 'Welcome aboard!',
      team: 'The Rolitt Team',
    },
    'es': {
      subject: '¡Estás invitado a unirte a Rolitt! 🎉',
      title: '¡Bienvenido a Rolitt! 🚀',
      greeting: '¡Hola!',
      message: 'Has sido invitado a unirte a Rolitt, la plataforma innovadora que está transformando la forma en que trabajamos y colaboramos.',
      invitation: 'Alguien pensó que serías una gran adición a nuestra comunidad. ¡Estamos emocionados de tenerte a bordo!',
      instruction: 'Haz clic en el botón de abajo para aceptar tu invitación y crear tu cuenta:',
      buttonText: 'Aceptar Invitación',
      alternativeText: 'Si el botón de arriba no funciona, también puedes copiar y pegar el siguiente enlace en tu navegador:',
      whatNext: '¿Qué pasa después?',
      step1: '✅ Crea tu cuenta segura',
      step2: '🎯 Configura tu perfil',
      step3: '🚀 Comienza a explorar las funciones de Rolitt',
      step4: '🤝 Conéctate con tu equipo',
      expireNote: 'Esta invitación expirará en 7 días por razones de seguridad.',
      needHelp: '¿Necesitas ayuda para comenzar?',
      supportText: 'Nuestro equipo de soporte está aquí para ayudarte en cada paso del camino. No dudes en contactarnos si tienes alguna pregunta.',
      thankYou: '¡Bienvenido a bordo!',
      team: 'El Equipo de Rolitt',
    },
    'ja': {
      subject: 'Rolittへのご招待！🎉',
      title: 'Rolittへようこそ！🚀',
      greeting: 'こんにちは！',
      message: 'あなたは、私たちの働き方やコラボレーションの方法を変革している革新的なプラットフォーム、Rolittに招待されました。',
      invitation: '誰かがあなたを私たちのコミュニティの素晴らしいメンバーだと思っています。あなたを迎えることができて興奮しています！',
      instruction: '下のボタンをクリックして招待を受け入れ、アカウントを作成してください：',
      buttonText: '招待を受け入れる',
      alternativeText: '上のボタンが機能しない場合は、以下のリンクをコピーしてブラウザに貼り付けることもできます：',
      whatNext: '次に何が起こりますか？',
      step1: '✅ 安全なアカウントを作成',
      step2: '🎯 プロフィールを設定',
      step3: '🚀 Rolittの機能を探索開始',
      step4: '🤝 チームとつながる',
      expireNote: 'セキュリティ上の理由により、この招待は7日後に期限切れになります。',
      needHelp: '始めるのにヘルプが必要ですか？',
      supportText: '私たちのサポートチームが、すべてのステップでお手伝いします。ご質問がございましたら、お気軽にお問い合わせください。',
      thankYou: 'ようこそ！',
      team: 'Rolittチーム',
    },
    'zh-HK': {
      subject: '邀請您加入 Rolitt！🎉',
      title: '歡迎來到 Rolitt！🚀',
      greeting: '您好！',
      message: '您已被邀請加入 Rolitt，這個正在改變我們工作和協作方式的創新平台。',
      invitation: '有人認為您會是我們社群的絕佳成員。我們很興奮能讓您加入！',
      instruction: '點擊下方按鈕接受邀請並創建您的帳戶：',
      buttonText: '接受邀請',
      alternativeText: '如果上方按鈕無法使用，您也可以複製並貼上以下連結到瀏覽器中：',
      whatNext: '接下來會發生什麼？',
      step1: '✅ 創建您的安全帳戶',
      step2: '🎯 設置您的個人資料',
      step3: '🚀 開始探索 Rolitt 的功能',
      step4: '🤝 與您的團隊連接',
      expireNote: '為了安全起見，此邀請將在 7 天後過期。',
      needHelp: '需要入門幫助？',
      supportText: '我們的支援團隊會在每一步為您提供幫助。如果您有任何問題，請隨時聯繫我們。',
      thankYou: '歡迎加入！',
      team: 'Rolitt 團隊',
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
