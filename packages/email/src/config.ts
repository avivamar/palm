/**
 * Supabase Auth Email Templates Configuration
 * 邮件模板系统的配置文件
 */

import type { BrandConfig, SupportedLocale } from './types';

// Rolitt 品牌配置
export const BRAND_CONFIG: BrandConfig = {
  brandName: 'Rolitt',
  primaryColor: '#EBFF7F', // Rolitt 品牌主色
  logoUrl: 'https://rolitt.com/logo.svg',
  websiteUrl: 'https://rolitt.com',
  supportEmail: 'support@rolitt.com',
  socialLinks: {
    twitter: 'https://twitter.com/rolitt',
    facebook: 'https://facebook.com/rolitt',
    instagram: 'https://instagram.com/rolitt',
    linkedin: 'https://linkedin.com/company/rolitt',
  },
};

// 支持的语言列表
export const SUPPORTED_LOCALES: SupportedLocale[] = ['en', 'es', 'ja', 'zh-HK'];

// 默认语言
export const DEFAULT_LOCALE: SupportedLocale = 'en';

// 邮件模板基础样式
export const EMAIL_STYLES = {
  // 容器样式
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    lineHeight: '1.6',
    color: '#333333',
    backgroundColor: '#ffffff',
  },

  // 头部样式
  header: {
    backgroundColor: BRAND_CONFIG.primaryColor,
    padding: '40px 20px',
    textAlign: 'center' as const,
    borderRadius: '8px 8px 0 0',
  },

  // Logo样式
  logo: {
    maxWidth: '120px',
    height: 'auto',
  },

  // 内容区域样式
  content: {
    padding: '40px 20px',
    backgroundColor: '#ffffff',
  },

  // 标题样式
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#1a1a1a',
  },

  // 段落样式
  paragraph: {
    fontSize: '16px',
    marginBottom: '16px',
    color: '#4a4a4a',
  },

  // 按钮样式
  button: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: BRAND_CONFIG.primaryColor,
    color: '#000000',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '16px',
    margin: '20px 0',
  },

  // OTP代码样式
  otpCode: {
    fontSize: '32px',
    fontWeight: 'bold',
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
    backgroundColor: '#f5f5f5',
    padding: '16px 24px',
    borderRadius: '8px',
    textAlign: 'center' as const,
    letterSpacing: '4px',
    margin: '20px 0',
    border: `2px solid ${BRAND_CONFIG.primaryColor}`,
  },

  // 页脚样式
  footer: {
    backgroundColor: '#f8f9fa',
    padding: '30px 20px',
    textAlign: 'center' as const,
    borderRadius: '0 0 8px 8px',
    borderTop: '1px solid #e9ecef',
  },

  // 页脚文本样式
  footerText: {
    fontSize: '14px',
    color: '#6c757d',
    marginBottom: '10px',
  },

  // 社交链接样式
  socialLinks: {
    marginTop: '20px',
  },

  // 社交链接项样式
  socialLink: {
    display: 'inline-block',
    margin: '0 10px',
    color: '#6c757d',
    textDecoration: 'none',
  },
};

// 邮件模板默认配置
export const EMAIL_TEMPLATE_CONFIG = {
  // 邮件编码
  charset: 'UTF-8',

  // 邮件类型
  contentType: 'text/html',

  // 发件人信息
  from: {
    name: BRAND_CONFIG.brandName,
    email: 'noreply@rolitt.com',
  },

  // 回复邮箱
  replyTo: BRAND_CONFIG.supportEmail,

  // 邮件优先级
  priority: 'normal' as const,

  // 是否包含纯文本版本
  includeTextVersion: true,
};

// 环境配置
export const getEnvironmentConfig = () => {
  const isDevelopment = (typeof process !== 'undefined' && process.env?.NODE_ENV) === 'development';
  const siteUrl = (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_APP_URL || process.env?.SITE_URL)) || 'https://rolitt.com';

  return {
    isDevelopment,
    siteUrl,
    logoUrl: isDevelopment
      ? `${siteUrl}/logo.svg`
      : BRAND_CONFIG.logoUrl,
    websiteUrl: isDevelopment
      ? siteUrl
      : BRAND_CONFIG.websiteUrl,
  };
};
