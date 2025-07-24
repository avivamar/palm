/**
 * Reauthentication Email Template
 * 重新认证邮件模板（含OTP）
 */

import type { EmailTemplateContent, SupabaseTemplateVariables, SupportedLocale } from '../types';
import { EMAIL_STYLES } from '../config';
import {
  createEmailFooter,
  createEmailHeader,
  createEmailLayout,
  createOTPBlock,
  generateInlineStyles,
  replaceTemplateVariables,
} from '../utils';

/**
 * 获取重新认证邮件的多语言内容
 */
function getReauthenticationContent(locale: SupportedLocale) {
  const content = {
    'en': {
      subject: 'Rolitt Security Verification Required 🔐',
      title: 'Security Verification Required 🔐',
      greeting: 'Hi there!',
      message: 'For your security, we need to verify your identity before proceeding with this sensitive action.',
      reason: 'This verification was triggered because you\'re attempting to:',
      commonReasons: [
        '🔑 Change your password',
        '📧 Update your email address',
        '🗑️ Delete your account',
        '⚙️ Modify security settings',
        '💳 Update payment information',
      ],
      otpTitle: 'Your Verification Code',
      otpInstruction: 'Enter this 6-digit code in the verification form:',
      otpNote: 'This code is valid for 10 minutes only.',
      securityTitle: 'Security Information',
      securityPoints: [
        '🔒 This code is unique to this verification request',
        '⏰ Expires in 10 minutes for your security',
        '🔐 Can only be used once',
        '📱 Only enter this code on official Rolitt pages',
      ],
      troubleshootTitle: 'Having trouble?',
      troubleshootPoints: [
        '🔄 Request a new code if this one expires',
        '📧 Check your spam/junk folder',
        '🌐 Make sure you\'re on the official Rolitt website',
        '💬 Contact support if you continue having issues',
      ],
      notRequestedTitle: 'Didn\'t request this?',
      notRequestedText: 'If you didn\'t initiate this verification, someone may be trying to access your account. Please secure your account immediately and contact our support team.',
      securityTip: 'Never share this verification code with anyone. Rolitt staff will never ask for your verification codes.',
      supportText: 'If you have any security concerns or need assistance, please contact our support team immediately.',
      thankYou: 'Stay secure!',
      team: 'The Rolitt Security Team',
    },
    'es': {
      subject: 'Verificación de seguridad de Rolitt requerida 🔐',
      title: 'Verificación de seguridad requerida 🔐',
      greeting: '¡Hola!',
      message: 'Por tu seguridad, necesitamos verificar tu identidad antes de proceder con esta operación sensible.',
      reason: 'Esta verificación se activó porque estás intentando:',
      commonReasons: [
        '🔑 Cambiar tu contraseña',
        '📧 Actualizar tu dirección de correo electrónico',
        '🗑️ Eliminar tu cuenta',
        '⚙️ Modificar configuraciones de seguridad',
        '💳 Actualizar información de pago',
      ],
      otpTitle: 'Tu código de verificación',
      otpInstruction: 'Ingresa este código de 6 dígitos en el formulario de verificación:',
      otpNote: 'Este código es válido solo por 10 minutos.',
      securityTitle: 'Información de seguridad',
      securityPoints: [
        '🔒 Este código es único para esta solicitud de verificación',
        '⏰ Expira en 10 minutos por tu seguridad',
        '🔐 Solo se puede usar una vez',
        '📱 Solo ingresa este código en páginas oficiales de Rolitt',
      ],
      troubleshootTitle: '¿Tienes problemas?',
      troubleshootPoints: [
        '🔄 Solicita un nuevo código si este expira',
        '📧 Revisa tu carpeta de spam/correo no deseado',
        '🌐 Asegúrate de estar en el sitio web oficial de Rolitt',
        '💬 Contacta al soporte si continúas teniendo problemas',
      ],
      notRequestedTitle: '¿No solicitaste esto?',
      notRequestedText: 'Si no iniciaste esta verificación, alguien puede estar intentando acceder a tu cuenta. Por favor asegura tu cuenta inmediatamente y contacta a nuestro equipo de soporte.',
      securityTip: 'Nunca compartas este código de verificación con nadie. El personal de Rolitt nunca te pedirá tus códigos de verificación.',
      supportText: 'Si tienes alguna preocupación de seguridad o necesitas asistencia, por favor contacta a nuestro equipo de soporte inmediatamente.',
      thankYou: '¡Mantente seguro!',
      team: 'El Equipo de Seguridad de Rolitt',
    },
    'ja': {
      subject: 'Rolittセキュリティ認証が必要です 🔐',
      title: 'セキュリティ認証が必要です 🔐',
      greeting: 'こんにちは！',
      message: 'セキュリティのため、この機密性の高い操作を続行する前に、あなたの身元を確認する必要があります。',
      reason: 'この認証は以下の操作を試行しているためトリガーされました：',
      commonReasons: [
        '🔑 パスワードの変更',
        '📧 メールアドレスの更新',
        '🗑️ アカウントの削除',
        '⚙️ セキュリティ設定の変更',
        '💳 支払い情報の更新',
      ],
      otpTitle: 'あなたの認証コード',
      otpInstruction: '認証フォームにこの6桁のコードを入力してください：',
      otpNote: 'このコードは10分間のみ有効です。',
      securityTitle: 'セキュリティ情報',
      securityPoints: [
        '🔒 このコードはこの認証リクエスト固有のものです',
        '⏰ セキュリティのため10分で期限切れになります',
        '🔐 一度だけ使用可能',
        '📱 公式Rolittページでのみこのコードを入力してください',
      ],
      troubleshootTitle: '問題がありますか？',
      troubleshootPoints: [
        '🔄 このコードが期限切れの場合は新しいコードをリクエスト',
        '📧 スパム/迷惑メールフォルダを確認',
        '🌐 公式Rolittウェブサイトにいることを確認',
        '💬 問題が続く場合はサポートに連絡',
      ],
      notRequestedTitle: 'リクエストしていませんか？',
      notRequestedText: 'この認証を開始していない場合、誰かがあなたのアカウントにアクセスしようとしている可能性があります。すぐにアカウントを保護し、サポートチームに連絡してください。',
      securityTip: 'この認証コードを誰とも共有しないでください。Rolittスタッフが認証コードを求めることはありません。',
      supportText: 'セキュリティに関する懸念やサポートが必要な場合は、すぐにサポートチームに連絡してください。',
      thankYou: '安全にお過ごしください！',
      team: 'Rolittセキュリティチーム',
    },
    'zh-HK': {
      subject: 'Rolitt 安全驗證要求 🔐',
      title: '需要安全驗證 🔐',
      greeting: '您好！',
      message: '為了您的安全，我們需要在進行此敏感操作之前驗證您的身份。',
      reason: '此驗證是因為您正在嘗試：',
      commonReasons: [
        '🔑 變更您的密碼',
        '📧 更新您的電子郵件地址',
        '🗑️ 刪除您的帳戶',
        '⚙️ 修改安全設定',
        '💳 更新付款資訊',
      ],
      otpTitle: '您的驗證碼',
      otpInstruction: '在驗證表單中輸入此 6 位數字代碼：',
      otpNote: '此代碼僅在 10 分鐘內有效。',
      securityTitle: '安全資訊',
      securityPoints: [
        '🔒 此代碼是此驗證請求的唯一代碼',
        '⏰ 為了您的安全，10 分鐘後過期',
        '🔐 只能使用一次',
        '📱 只在官方 Rolitt 頁面輸入此代碼',
      ],
      troubleshootTitle: '遇到問題？',
      troubleshootPoints: [
        '🔄 如果此代碼過期，請請求新代碼',
        '📧 檢查您的垃圾郵件資料夾',
        '🌐 確保您在官方 Rolitt 網站上',
        '💬 如果持續遇到問題，請聯繫支援',
      ],
      notRequestedTitle: '沒有請求此操作？',
      notRequestedText: '如果您沒有啟動此驗證，可能有人正在嘗試存取您的帳戶。請立即保護您的帳戶並聯繫我們的支援團隊。',
      securityTip: '絕不要與任何人分享此驗證碼。Rolitt 工作人員絕不會要求您提供驗證碼。',
      supportText: '如果您有任何安全疑慮或需要協助，請立即聯繫我們的支援團隊。',
      thankYou: '保持安全！',
      team: 'Rolitt 安全團隊',
    },
  };

  return content[locale];
}

/**
 * 生成重新认证邮件模板
 * @param locale 语言
 * @param variables 模板变量
 * @returns 邮件模板内容
 */
export function generateReauthenticationTemplate(
  locale: SupportedLocale,
  variables: SupabaseTemplateVariables,
): EmailTemplateContent {
  const content = getReauthenticationContent(locale);
  const otpCode = variables.Token || '123456';

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
          <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0 0 15px 0', fontWeight: 'bold' })}">
            ${content.reason}
          </p>
          <div style="margin: 10px 0;">
            ${content.commonReasons.map(reason =>
              `<p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '5px 0', fontSize: '15px' })}">${reason}</p>`,
            ).join('')}
          </div>
        </div>
        
        <h2 style="${generateInlineStyles({ ...EMAIL_STYLES.title, fontSize: '24px', margin: '30px 0 20px 0' })}">
          ${content.otpTitle}
        </h2>
        
        <p style="${generateInlineStyles(EMAIL_STYLES.paragraph)}">
          ${content.otpInstruction}
        </p>
        
        ${createOTPBlock(otpCode, locale)}
        
        <div style="margin: 20px 0; padding: 15px; background-color: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107;">
          <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0', fontSize: '14px', color: '#856404', fontWeight: 'bold' })}">
            ⏰ ${content.otpNote}
          </p>
        </div>
        
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
        
        <div style="margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #e7f3ff 0%, #f0f8ff 100%); border-radius: 12px; border-left: 4px solid #0066cc;">
          <h3 style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0 0 15px 0', fontWeight: 'bold', fontSize: '18px', color: '#004085' })}">
            💡 ${content.troubleshootTitle}
          </h3>
          <div style="margin: 10px 0;">
            ${content.troubleshootPoints.map(point =>
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
        
        <div style="margin: 30px 0; padding: 20px; background-color: #fff8e1; border-radius: 6px; border-left: 4px solid #EBFF7F;">
          <p style="${generateInlineStyles({ ...EMAIL_STYLES.paragraph, margin: '0', fontSize: '14px', color: '#333333', fontWeight: 'bold' })}">
            🛡️ ${content.securityTip}
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
    text: `${content.title}\n\n${content.greeting}\n\n${content.message}\n\n${content.reason}\n${content.commonReasons.join('\n')}\n\n${content.otpTitle}\n${content.otpInstruction}\n\nVerification Code: ${otpCode}\n\n${content.otpNote}\n\n${content.securityTitle}\n${content.securityPoints.join('\n')}\n\n${content.troubleshootTitle}\n${content.troubleshootPoints.join('\n')}\n\n${content.notRequestedTitle}\n${content.notRequestedText}\n\n${content.securityTip}\n\n${content.supportText}\n\n${content.thankYou}\n${content.team}`,
  };
}
