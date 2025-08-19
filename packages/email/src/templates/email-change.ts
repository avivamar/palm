/**
 * Email Change Email Template
 * 邮箱变更确认邮件模板
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
 * 获取邮箱变更邮件的多语言内容
 */
function getEmailChangeContent(locale: SupportedLocale) {
  const content = {
    'en': {
      subject: 'Confirm Your New Email Address - ThePalmistryLife',
      title: 'Email Address Change Request 📧',
      greeting: 'Hi there!',
      message: 'We received a request to change the email address for your ThePalmistryLife palm reading account.',
      currentEmail: 'Current email address:',
      newEmail: 'New email address:',
      instruction: 'To complete this change and continue your palm analysis journey, please click the button below to confirm your new email address:',
      buttonText: 'Confirm New Email & Continue Palm Reading',
      alternativeText: 'If the button above doesn\'t work, you can also copy and paste the following link into your browser:',
      importantTitle: 'Important Security Information',
      importantPoints: [
        '🔒 This confirmation was sent to your NEW email address',
        '⏰ This link will expire in 24 hours',
        '🔐 Only you should have access to this email',
        '📧 Your old email will remain active until confirmation',
      ],
      afterConfirmation: 'After confirmation:',
      afterPoints: [
        '✅ Your new email will become your primary login for palm analysis',
        '📬 All future palm reading notifications will be sent to the new address',
        '🔄 You can change your email again anytime in account settings',
      ],
      notRequestedTitle: 'Didn\'t request this change?',
      notRequestedText: 'If you didn\'t request this email change, please ignore this email and contact our support team immediately. Your palm reading account security may be at risk.',
      securityTip: 'For your security, we recommend using a strong, unique password and enabling two-factor authentication for your palm analysis account.',
      supportText: 'If you have any questions or concerns about this email change for your palm reading account, please contact our support team.',
      thankYou: 'Stay secure!',
      team: 'The ThePalmistryLife Team',
    },
    'es': {
      subject: 'Confirma tu Nueva Dirección de Email - ThePalmistryLife',
      title: 'Solicitud de Cambio de Dirección de Email 📧',
      greeting: '¡Hola!',
      message: 'Recibimos una solicitud para cambiar la dirección de email de tu cuenta de lectura de palmas de ThePalmistryLife.',
      currentEmail: 'Dirección de email actual:',
      newEmail: 'Nueva dirección de email:',
      instruction: 'Para completar este cambio y continuar tu viaje de análisis de palmas, por favor haz clic en el botón de abajo para confirmar tu nueva dirección de email:',
      buttonText: 'Confirmar Nuevo Email y Continuar Lectura de Palmas',
      alternativeText: 'Si el botón de arriba no funciona, también puedes copiar y pegar el siguiente enlace en tu navegador:',
      importantTitle: 'Información de Seguridad Importante',
      importantPoints: [
        '🔒 Esta confirmación fue enviada a tu NUEVA dirección de email',
        '⏰ Este enlace expirará en 24 horas',
        '🔐 Solo tú deberías tener acceso a este email',
        '📧 Tu email anterior permanecerá activo hasta la confirmación',
      ],
      afterConfirmation: 'Después de la confirmación:',
      afterPoints: [
        '✅ Tu nuevo email se convertirá en tu login principal para análisis de palmas',
        '📬 Todas las notificaciones futuras de lectura de palmas se enviarán a la nueva dirección',
        '🔄 Puedes cambiar tu email nuevamente en cualquier momento en configuración de cuenta',
      ],
      notRequestedTitle: '¿No solicitaste este cambio?',
      notRequestedText: 'Si no solicitaste este cambio de email, por favor ignora este email y contacta a nuestro equipo de soporte inmediatamente. La seguridad de tu cuenta de lectura de palmas puede estar en riesgo.',
      securityTip: 'Para tu seguridad, recomendamos usar una contraseña fuerte y única y habilitar la autenticación de dos factores para tu cuenta de análisis de palmas.',
      supportText: 'Si tienes alguna pregunta o preocupación sobre este cambio de email para tu cuenta de lectura de palmas, por favor contacta a nuestro equipo de soporte.',
      thankYou: '¡Mantente seguro!',
      team: 'El Equipo de ThePalmistryLife',
    },
    'zh-HK': {
      subject: '確認您的新電子郵件地址 - ThePalmistryLife',
      title: '電子郵件地址變更請求 📧',
      greeting: '您好！',
      message: '我們收到了變更您 ThePalmistryLife 手相分析帳戶電子郵件地址的請求。',
      currentEmail: '目前的電子郵件地址：',
      newEmail: '新的電子郵件地址：',
      instruction: '要完成此變更並繼續您的手相分析之旅，請點擊下方按鈕確認您的新電子郵件地址：',
      buttonText: '確認新電子郵件並繼續手相分析',
      alternativeText: '如果上方按鈕無法使用，您也可以複製並貼上以下連結到瀏覽器中：',
      importantTitle: '重要安全資訊',
      importantPoints: [
        '🔒 此確認郵件已發送到您的新電子郵件地址',
        '⏰ 此連結將在 24 小時後過期',
        '🔐 只有您應該能存取此電子郵件',
        '📧 您的舊電子郵件將保持活躍直到確認為止',
      ],
      afterConfirmation: '確認後：',
      afterPoints: [
        '✅ 您的新電子郵件將成為手相分析的主要登入方式',
        '📬 所有未來的手相分析通知將發送到新地址',
        '🔄 您可以隨時在帳戶設定中再次變更電子郵件',
      ],
      notRequestedTitle: '沒有請求此變更？',
      notRequestedText: '如果您沒有請求此電子郵件變更，請忽略此郵件並立即聯繫我們的支援團隊。您的手相分析帳戶安全可能面臨風險。',
      securityTip: '為了您的安全，我們建議為您的手相分析帳戶使用強而獨特的密碼並啟用雙重認證。',
      supportText: '如果您對手相分析帳戶的電子郵件變更有任何問題或疑慮，請聯繫我們的支援團隊。',
      thankYou: '保持安全！',
      team: 'ThePalmistryLife 團隊',
    },
    'ja': {
      subject: '新しいメールアドレスを確認してください - ThePalmistryLife',
      title: 'メールアドレス変更リクエスト 📧',
      greeting: 'こんにちは！',
      message: 'あなたのThePalmistryLife手相分析アカウントのメールアドレス変更のリクエストを受け取りました。',
      currentEmail: '現在のメールアドレス：',
      newEmail: '新しいメールアドレス：',
      instruction: 'この変更を完了し、手相分析の旅を続けるには、下のボタンをクリックして新しいメールアドレスを確認してください：',
      buttonText: '新しいメールを確認して手相分析を続ける',
      alternativeText: '上のボタンが機能しない場合は、以下のリンクをコピーしてブラウザに貼り付けることもできます：',
      importantTitle: '重要なセキュリティ情報',
      importantPoints: [
        '🔒 この確認は新しいメールアドレスに送信されました',
        '⏰ このリンクは24時間で期限切れになります',
        '🔐 このメールにアクセスできるのはあなただけです',
        '📧 確認まで古いメールは有効のままです',
      ],
      afterConfirmation: '確認後：',
      afterPoints: [
        '✅ 新しいメールが手相分析のプライマリログインになります',
        '📬 今後の手相分析通知はすべて新しいアドレスに送信されます',
        '🔄 アカウント設定でいつでもメールを再変更できます',
      ],
      notRequestedTitle: 'この変更をリクエストしていませんか？',
      notRequestedText: 'このメール変更をリクエストしていない場合は、このメールを無視して、すぐにサポートチームに連絡してください。手相分析アカウントのセキュリティが危険にさらされている可能性があります。',
      securityTip: 'セキュリティのため、手相分析アカウントに強力でユニークなパスワードを使用し、二要素認証を有効にすることをお勧めします。',
      supportText: '手相分析アカウントのメール変更について質問や懸念がある場合は、サポートチームにお問い合わせください。',
      thankYou: '安全にお過ごしください！',
      team: 'ThePalmistryLifeチーム',
    },
  };

  return content[locale];
}

/**
 * 生成邮箱变更邮件模板
 * @param locale 语言
 * @param variables 模板变量
 * @returns 邮件模板内容
 */
export function generateEmailChangeTemplate(
  locale: SupportedLocale,
  variables: SupabaseTemplateVariables,
): EmailTemplateContent {
  const content = getEmailChangeContent(locale);
  const confirmationUrl = variables.ConfirmationURL || '#';
  const currentEmail = variables.Email || 'your-current-email@example.com';
  const newEmail = variables.NewEmail || 'your-new-email@example.com';

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
        
        <div style="margin: 25px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #6c757d;">
          <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0 0 10px 0', fontWeight: 'bold' })}">
            ${content.currentEmail}
          </p>
          <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0 0 15px 0', fontSize: '16px', color: '#666666', fontFamily: 'monospace', backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: '4px' })}">
            ${currentEmail}
          </p>
          
          <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0 0 10px 0', fontWeight: 'bold' })}">
            ${content.newEmail}
          </p>
          <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0', fontSize: '16px', color: '#28a745', fontFamily: 'monospace', backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: '4px', fontWeight: 'bold' })}">
            ${newEmail}
          </p>
        </div>
        
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
        
        <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); border-radius: 12px; border-left: 4px solid #ffc107;">
          <h3 style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0 0 15px 0', fontWeight: 'bold', fontSize: '18px', color: '#856404' })}">
            ⚠️ ${content.importantTitle}
          </h3>
          <div style="margin: 10px 0;">
            ${content.importantPoints.map(point =>
              `<p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '8px 0', fontSize: '15px' })}">${point}</p>`,
            ).join('')}
          </div>
        </div>
        
        <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%); border-radius: 12px; border-left: 4px solid #28a745;">
          <h3 style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0 0 15px 0', fontWeight: 'bold', fontSize: '18px', color: '#155724' })}">
            ${content.afterConfirmation}
          </h3>
          <div style="margin: 10px 0;">
            ${content.afterPoints.map(point =>
              `<p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '8px 0', fontSize: '15px' })}">${point}</p>`,
            ).join('')}
          </div>
        </div>
        
        <div style="margin: 30px 0; padding: 20px; background-color: #f8d7da; border-radius: 6px; border-left: 4px solid #dc3545;">
          <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0 0 10px 0', fontWeight: 'bold', color: '#721c24' })}">
            🚨 ${content.notRequestedTitle}
          </p>
          <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0', color: '#721c24' })}">
            ${content.notRequestedText}
          </p>
        </div>
        
        <div style="margin: 30px 0; padding: 20px; background-color: #e7f3ff; border-radius: 6px; border-left: 4px solid #0066cc;">
          <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0', fontSize: '14px', color: '#004085' })}">
            💡 ${content.securityTip}
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
    text: `${content.title}\n\n${content.greeting}\n\n${content.message}\n\n${content.currentEmail} ${currentEmail}\n${content.newEmail} ${newEmail}\n\n${content.instruction}\n\n${confirmationUrl}\n\n${content.importantTitle}\n${content.importantPoints.join('\n')}\n\n${content.afterConfirmation}\n${content.afterPoints.join('\n')}\n\n${content.notRequestedTitle}\n${content.notRequestedText}\n\n${content.securityTip}\n\n${content.supportText}\n\n${content.thankYou}\n${content.team}`,
  };
}
