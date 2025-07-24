/**
 * Email Templates Index
 * 邮件模板索引文件
 */

// 导出所有邮件模板
export * from './confirmation';
export * from './email-change';
export * from './invite';
export * from './magic-link';
export * from './reauthentication';
export * from './recovery';
export * from './template-manager';

// 导出便捷函数
export {
  createEmailTemplateManager,
  emailTemplateManager,
  generateEmailTemplate,
  generateMultipleEmailTemplates,
} from './template-manager';
