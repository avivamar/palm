/**
 * Supabase Auth Email Template Integration
 * Supabase Auth 邮件模板集成
 */

import type {
  EmailTemplateContent,
  EmailTemplateType,
  SupabaseTemplateVariables,
  SupportedLocale,
} from './types';
import { DEFAULT_LOCALE, getEnvironmentConfig } from './config';
import { generateEmailTemplate } from './templates';

/**
 * Supabase Auth 邮件模板配置
 */
export type SupabaseEmailConfig = {
  /** 默认语言 */
  defaultLocale?: SupportedLocale;
  /** 站点URL */
  siteUrl?: string;
  /** 发件人信息 */
  from?: {
    name: string;
    email: string;
  };
  /** 是否启用开发模式 */
  developmentMode?: boolean;
};

/**
 * Supabase 邮件模板生成器
 */
export class SupabaseEmailTemplateGenerator {
  private config: SupabaseEmailConfig;

  constructor(config: SupabaseEmailConfig = {}) {
    const envConfig = getEnvironmentConfig();

    this.config = {
      defaultLocale: config.defaultLocale || DEFAULT_LOCALE,
      siteUrl: config.siteUrl || envConfig.siteUrl,
      from: config.from || {
        name: 'Rolitt',
        email: 'noreply@rolitt.com',
      },
      developmentMode: config.developmentMode || envConfig.isDevelopment,
      ...config,
    };
  }

  /**
   * 为 Supabase Auth 生成邮件模板
   * @param type 邮件类型
   * @param variables Supabase 提供的变量
   * @param locale 语言（可选）
   * @returns 邮件模板内容
   */
  generateForSupabase(
    type: EmailTemplateType,
    variables: Partial<SupabaseTemplateVariables>,
    locale?: SupportedLocale,
  ): EmailTemplateContent {
    const targetLocale = locale || this.config.defaultLocale || DEFAULT_LOCALE;

    // 补充默认变量
    const completeVariables: SupabaseTemplateVariables = {
      SiteURL: this.config.siteUrl || 'https://rolitt.com',
      Email: variables.Email || '',
      ...variables,
    };

    // 在开发模式下添加调试信息
    if (this.config.developmentMode) {
      console.log(`[Supabase Email] Generating ${type} template for locale ${targetLocale}`);
      console.log('[Supabase Email] Variables:', completeVariables);
    }

    try {
      const template = generateEmailTemplate(type, targetLocale, completeVariables);

      // 在开发模式下记录生成结果
      if (this.config.developmentMode) {
        console.log(`[Supabase Email] Successfully generated ${type} template`);
        console.log('[Supabase Email] Subject:', template.subject);
      }

      return template;
    } catch (error) {
      console.error(`[Supabase Email] Failed to generate ${type} template:`, error);

      // 返回错误模板
      return this.generateErrorTemplate(type, targetLocale, error);
    }
  }

  /**
   * 生成用于 Supabase Dashboard 的模板配置
   * @param type 邮件类型
   * @param locale 语言
   * @returns Supabase 模板配置
   */
  generateSupabaseTemplate(
    type: EmailTemplateType,
    locale: SupportedLocale = DEFAULT_LOCALE,
  ): {
    subject: string;
    body: string;
    contentType: 'text/html';
  } {
    // 使用示例变量生成模板
    const sampleVariables = this.getSampleVariables(type);
    const template = this.generateForSupabase(type, sampleVariables, locale);

    return {
      subject: template.subject,
      body: template.html,
      contentType: 'text/html' as const,
    };
  }

  /**
   * 批量生成所有类型的模板
   * @param locale 语言
   * @returns 所有模板的配置
   */
  generateAllTemplates(
    locale: SupportedLocale = DEFAULT_LOCALE,
  ): Record<EmailTemplateType, {
    subject: string;
    body: string;
    contentType: 'text/html';
  }> {
    const types: EmailTemplateType[] = [
      'confirmation',
      'recovery',
      'invite',
      'magic_link',
      'email_change',
      'reauthentication',
    ];

    const templates = {} as Record<EmailTemplateType, {
      subject: string;
      body: string;
      contentType: 'text/html';
    }>;

    for (const type of types) {
      templates[type] = this.generateSupabaseTemplate(type, locale);
    }

    return templates;
  }

  /**
   * 获取示例变量
   * @param type 邮件类型
   * @returns 示例变量
   */
  private getSampleVariables(type: EmailTemplateType): Partial<SupabaseTemplateVariables> {
    const baseVariables = {
      SiteURL: this.config.siteUrl || 'https://rolitt.com',
      Email: 'user@example.com',
    };

    switch (type) {
      case 'confirmation':
      case 'recovery':
      case 'invite':
      case 'magic_link':
        return {
          ...baseVariables,
          ConfirmationURL: `${baseVariables.SiteURL}/auth/confirm?token=sample-token`,
        };

      case 'email_change':
        return {
          ...baseVariables,
          ConfirmationURL: `${baseVariables.SiteURL}/auth/confirm?token=sample-token`,
          NewEmail: 'newemail@example.com',
        };

      case 'reauthentication':
        return {
          ...baseVariables,
          Token: '123456',
        };

      default:
        return baseVariables;
    }
  }

  /**
   * 生成错误模板
   * @param type 邮件类型
   * @param locale 语言
   * @param error 错误信息
   * @returns 错误模板
   */
  private generateErrorTemplate(
    type: EmailTemplateType,
    locale: SupportedLocale,
    error: unknown,
  ): EmailTemplateContent {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return {
      subject: `[Error] ${type} Email Template`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #dc3545;">Email Template Error</h1>
          <p>Failed to generate <strong>${type}</strong> email template for locale <strong>${locale}</strong>.</p>
          <p><strong>Error:</strong> ${errorMessage}</p>
          <p>Please check your template configuration and try again.</p>
          <hr>
          <p style="font-size: 12px; color: #666;">This is a fallback error template. Please contact support if this issue persists.</p>
        </div>
      `,
      text: `Email Template Error\n\nFailed to generate ${type} email template for locale ${locale}.\n\nError: ${errorMessage}\n\nPlease check your template configuration and try again.`,
    };
  }

  /**
   * 更新配置
   * @param newConfig 新配置
   */
  updateConfig(newConfig: Partial<SupabaseEmailConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 获取当前配置
   * @returns 当前配置
   */
  getConfig(): SupabaseEmailConfig {
    return { ...this.config };
  }
}

/**
 * 创建 Supabase 邮件模板生成器
 * @param config 配置
 * @returns 生成器实例
 */
export function createSupabaseEmailGenerator(
  config?: SupabaseEmailConfig,
): SupabaseEmailTemplateGenerator {
  return new SupabaseEmailTemplateGenerator(config);
}

/**
 * 默认 Supabase 邮件模板生成器实例
 */
export const supabaseEmailGenerator = createSupabaseEmailGenerator();

/**
 * 便捷函数：为 Supabase 生成邮件模板
 * @param type 邮件类型
 * @param variables 变量
 * @param locale 语言
 * @returns 邮件模板内容
 */
export function generateSupabaseEmailTemplate(
  type: EmailTemplateType,
  variables: Partial<SupabaseTemplateVariables>,
  locale?: SupportedLocale,
): EmailTemplateContent {
  return supabaseEmailGenerator.generateForSupabase(type, variables, locale);
}

/**
 * 便捷函数：生成 Supabase Dashboard 配置
 * @param type 邮件类型
 * @param locale 语言
 * @returns Supabase 模板配置
 */
export function generateSupabaseDashboardTemplate(
  type: EmailTemplateType,
  locale?: SupportedLocale,
) {
  return supabaseEmailGenerator.generateSupabaseTemplate(type, locale);
}
