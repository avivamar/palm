/**
 * Supabase Auth Email Templates Types
 * 邮件模板系统的类型定义
 */

// 支持的语言类型
export type SupportedLocale = 'en' | 'es' | 'ja' | 'zh-HK';

// 邮件模板类型
export type EmailTemplateType
  = | 'invite' // 用户邀请邮件
    | 'confirmation' // 注册确认邮件
    | 'recovery' // 密码重置邮件
    | 'magic_link' // 魔法链接登录邮件
    | 'email_change' // 邮箱变更确认邮件
    | 'reauthentication'; // 重新认证邮件（含OTP）

// Supabase 模板变量
export type SupabaseTemplateVariables = {
  /** 确认链接URL */
  ConfirmationURL?: string;
  /** 邀请链接URL */
  InviteURL?: string;
  /** 恢复链接URL */
  RecoveryURL?: string;
  /** 魔法链接URL */
  MagicLinkURL?: string;
  /** 6位OTP代码 */
  Token?: string;
  /** 哈希化的Token */
  TokenHash?: string;
  /** 应用站点URL */
  SiteURL?: string;
  /** 站点名称 */
  SiteName?: string;
  /** 用户邮箱 */
  Email?: string;
  /** 新邮箱（仅用于邮箱变更模板） */
  NewEmail?: string;
};

// 邮件模板内容结构
export type EmailTemplateContent = {
  /** 邮件主题 */
  subject: string;
  /** HTML 内容 */
  html: string;
  /** 纯文本内容（备用） */
  text?: string;
};

// 邮件模板配置
export type EmailTemplateConfig = {
  /** 模板类型 */
  type: EmailTemplateType;
  /** 语言 */
  locale: SupportedLocale;
  /** 模板内容 */
  content: EmailTemplateContent;
  /** 模板变量 */
  variables: SupabaseTemplateVariables;
};

// 品牌配置
export type BrandConfig = {
  /** 品牌名称 */
  brandName: string;
  /** 品牌主色 */
  primaryColor: string;
  /** Logo URL */
  logoUrl: string;
  /** 网站URL */
  websiteUrl: string;
  /** 支持邮箱 */
  supportEmail: string;
  /** 社交媒体链接 */
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
};

// 邮件模板渲染器接口
export type EmailTemplateRenderer = {
  render: (config: EmailTemplateConfig) => Promise<EmailTemplateContent>;
};

// 邮件模板管理器接口
export type EmailTemplateManager = {
  getTemplate: (type: EmailTemplateType, locale: SupportedLocale) => Promise<EmailTemplateContent>;
  renderTemplate: (type: EmailTemplateType, locale: SupportedLocale, variables: SupabaseTemplateVariables) => Promise<EmailTemplateContent>;
  validateTemplate: (content: EmailTemplateContent) => boolean;
};
