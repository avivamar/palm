/**
 * Email Template Manager
 * 邮件模板管理器
 */

import type {
  EmailTemplateContent,
  EmailTemplateType,
  EmailTemplateManager as IEmailTemplateManager,
  SupabaseTemplateVariables,
  SupportedLocale,
} from '../types';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '../config';
import { validateEmailTemplate } from '../utils';
import { generateConfirmationTemplate } from './confirmation';
import { generateEmailChangeTemplate } from './email-change';
import { generateInviteTemplate } from './invite';
import { generateMagicLinkTemplate } from './magic-link';
import { generateReauthenticationTemplate } from './reauthentication';
import { generateRecoveryTemplate } from './recovery';

/**
 * 邮件模板管理器实现
 */
export class EmailTemplateManager implements IEmailTemplateManager {
  /**
   * 获取模板（接口要求的方法）
   * @param type 邮件类型
   * @param locale 语言
   * @returns 邮件模板内容
   */
  async getTemplate(type: EmailTemplateType, locale: SupportedLocale): Promise<EmailTemplateContent> {
    // 创建基础变量用于获取模板结构
    const baseVariables: SupabaseTemplateVariables = {
      SiteURL: 'https://example.com',
      Email: 'user@example.com',
      ConfirmationURL: 'https://example.com/confirm',
      Token: '123456',
    };
    return this.generateTemplate(type, locale, baseVariables);
  }

  /**
   * 渲染模板（接口要求的方法）
   * @param type 邮件类型
   * @param locale 语言
   * @param variables 模板变量
   * @returns 邮件模板内容
   */
  async renderTemplate(
    type: EmailTemplateType,
    locale: SupportedLocale,
    variables: SupabaseTemplateVariables,
  ): Promise<EmailTemplateContent> {
    return this.generateTemplate(type, locale, variables);
  }

  /**
   * 验证模板（接口要求的方法）
   * @param content 邮件模板内容
   * @returns 是否有效
   */
  validateTemplate(content: EmailTemplateContent): boolean {
    return validateEmailTemplate(content);
  }

  /**
   * 生成指定类型的邮件模板
   * @param type 邮件类型
   * @param locale 语言
   * @param variables 模板变量
   * @returns 邮件模板内容
   */
  generateTemplate(
    type: EmailTemplateType,
    locale: SupportedLocale,
    variables: SupabaseTemplateVariables,
  ): EmailTemplateContent {
    // 验证语言支持
    const validLocale = this.validateLocale(locale);

    // 验证模板变量
    this.validateVariables(type, variables);

    let template: EmailTemplateContent;

    try {
      // 根据类型生成对应模板
      switch (type) {
        case 'confirmation':
          template = generateConfirmationTemplate(validLocale, variables);
          break;
        case 'recovery':
          template = generateRecoveryTemplate(validLocale, variables);
          break;
        case 'invite':
          template = generateInviteTemplate(validLocale, variables);
          break;
        case 'magic_link':
          template = generateMagicLinkTemplate(validLocale, variables);
          break;
        case 'email_change':
          template = generateEmailChangeTemplate(validLocale, variables);
          break;
        case 'reauthentication':
          template = generateReauthenticationTemplate(validLocale, variables);
          break;
        default:
          throw new Error(`Unsupported email template type: ${type}`);
      }

      // 验证生成的模板
      const validation = validateEmailTemplate(template);
      if (!validation) {
        throw new Error(`Template validation failed`);
      }

      return template;
    } catch (error) {
      console.error(`Failed to generate ${type} template for locale ${validLocale}:`, error);
      throw error;
    }
  }

  /**
   * 批量生成多个模板
   * @param requests 模板请求数组
   * @returns 模板结果数组
   */
  generateMultipleTemplates(
    requests: Array<{
      type: EmailTemplateType;
      locale: SupportedLocale;
      variables: SupabaseTemplateVariables;
    }>,
  ): Array<{
    type: EmailTemplateType;
    locale: SupportedLocale;
    template: EmailTemplateContent;
    error?: string;
  }> {
    return requests.map((request) => {
      try {
        const template = this.generateTemplate(
          request.type,
          request.locale,
          request.variables,
        );
        return {
          type: request.type,
          locale: request.locale,
          template,
        };
      } catch (error) {
        return {
          type: request.type,
          locale: request.locale,
          template: {
            subject: 'Error',
            html: '',
            text: '',
          },
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });
  }

  /**
   * 获取支持的邮件类型
   * @returns 支持的邮件类型数组
   */
  getSupportedTypes(): EmailTemplateType[] {
    return [
      'confirmation',
      'recovery',
      'invite',
      'magic_link',
      'email_change',
      'reauthentication',
    ];
  }

  /**
   * 获取支持的语言
   * @returns 支持的语言数组
   */
  getSupportedLocales(): SupportedLocale[] {
    return SUPPORTED_LOCALES;
  }

  /**
   * 检查是否支持指定的邮件类型
   * @param type 邮件类型
   * @returns 是否支持
   */
  isTypeSupported(type: string): type is EmailTemplateType {
    return this.getSupportedTypes().includes(type as EmailTemplateType);
  }

  /**
   * 检查是否支持指定的语言
   * @param locale 语言
   * @returns 是否支持
   */
  isLocaleSupported(locale: string): locale is SupportedLocale {
    return this.getSupportedLocales().includes(locale as SupportedLocale);
  }

  /**
   * 验证并标准化语言
   * @param locale 语言
   * @returns 有效的语言
   */
  private validateLocale(locale: SupportedLocale): SupportedLocale {
    if (!this.isLocaleSupported(locale)) {
      console.warn(`Unsupported locale: ${locale}, falling back to ${DEFAULT_LOCALE}`);
      return DEFAULT_LOCALE;
    }
    return locale;
  }

  /**
   * 验证模板变量
   * @param type 邮件类型
   * @param variables 模板变量
   */
  private validateVariables(
    type: EmailTemplateType,
    variables: SupabaseTemplateVariables,
  ): void {
    // 基础验证
    if (!variables) {
      throw new Error('Template variables are required');
    }

    // 根据类型进行特定验证
    switch (type) {
      case 'confirmation':
      case 'recovery':
      case 'invite':
      case 'magic_link':
        if (!variables.ConfirmationURL) {
          throw new Error(`ConfirmationURL is required for ${type} template`);
        }
        break;

      case 'email_change':
        if (!variables.ConfirmationURL) {
          throw new Error('ConfirmationURL is required for email_change template');
        }
        if (!variables.NewEmail) {
          throw new Error('NewEmail is required for email_change template');
        }
        break;

      case 'reauthentication':
        if (!variables.Token) {
          throw new Error('Token (OTP) is required for reauthentication template');
        }
        break;
    }

    // 验证URL格式（如果提供）
    if (variables.ConfirmationURL && !this.isValidUrl(variables.ConfirmationURL)) {
      throw new Error('Invalid ConfirmationURL format');
    }

    if (variables.SiteURL && !this.isValidUrl(variables.SiteURL)) {
      throw new Error('Invalid SiteURL format');
    }

    // 验证邮箱格式（如果提供）
    if (variables.Email && !this.isValidEmail(variables.Email)) {
      throw new Error('Invalid Email format');
    }

    if (variables.NewEmail && !this.isValidEmail(variables.NewEmail)) {
      throw new Error('Invalid NewEmail format');
    }

    // 验证OTP格式（如果提供）
    if (variables.Token && !this.isValidOTP(variables.Token)) {
      throw new Error('Invalid Token (OTP) format - must be 6 digits');
    }
  }

  /**
   * 验证URL格式
   * @param url URL字符串
   * @returns 是否有效
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 验证邮箱格式
   * @param email 邮箱字符串
   * @returns 是否有效
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 验证OTP格式
   * @param otp OTP字符串
   * @returns 是否有效
   */
  private isValidOTP(otp: string): boolean {
    const otpRegex = /^\d{6}$/;
    return otpRegex.test(otp);
  }
}

/**
 * 创建邮件模板管理器实例
 * @returns 邮件模板管理器实例
 */
export function createEmailTemplateManager(): EmailTemplateManager {
  return new EmailTemplateManager();
}

/**
 * 默认邮件模板管理器实例
 */
export const emailTemplateManager = createEmailTemplateManager();

/**
 * 便捷函数：生成邮件模板
 * @param type 邮件类型
 * @param locale 语言
 * @param variables 模板变量
 * @returns 邮件模板内容
 */
export function generateEmailTemplate(
  type: EmailTemplateType,
  locale: SupportedLocale,
  variables: SupabaseTemplateVariables,
): EmailTemplateContent {
  return emailTemplateManager.generateTemplate(type, locale, variables);
}

/**
 * 便捷函数：批量生成邮件模板
 * @param requests 模板请求数组
 * @returns 模板结果数组
 */
export function generateMultipleEmailTemplates(
  requests: Array<{
    type: EmailTemplateType;
    locale: SupportedLocale;
    variables: SupabaseTemplateVariables;
  }>,
) {
  return emailTemplateManager.generateMultipleTemplates(requests);
}
