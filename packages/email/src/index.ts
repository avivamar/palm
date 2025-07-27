/**
 * @rolitt/email - Supabase Auth Email Templates Package
 *
 * A comprehensive email template system for Supabase Auth with multi-language support,
 * responsive design, and enterprise-grade security features.
 *
 * Features:
 * - 6 email types: invite, confirmation, recovery, magic link, email change, reauthentication
 * - 3 languages: English, Traditional Chinese, Japanese
 * - Responsive design with mobile-first approach
 * - Accessibility compliance (WCAG 2.1 AA)
 * - XSS protection and input validation
 * - TypeScript support with strict typing
 * - Comprehensive testing suite
 */

// Configuration types (from ./types, not ./config)
export {
  BRAND_CONFIG,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  EMAIL_STYLES,
  EMAIL_TEMPLATE_CONFIG,
  getEnvironmentConfig
} from './config';

// Supabase integration
export type { SupabaseEmailConfig } from './supabase-integration';
export {
  SupabaseEmailTemplateGenerator,
  createSupabaseEmailGenerator,
  supabaseEmailGenerator,
  generateSupabaseEmailTemplate,
  generateSupabaseDashboardTemplate
} from './supabase-integration';

// Template system - specific exports to avoid conflicts
export {
  createEmailTemplateManager,
  emailTemplateManager,
  generateEmailTemplate,
  generateMultipleEmailTemplates,
} from './templates';

// Export the class with a different name to avoid conflict
export { EmailTemplateManager as EmailTemplateManagerImpl } from './templates/template-manager';

// Core types
export type * from './types';

// Re-export commonly used functions for convenience
// (already exported above)

// Utilities
export {
  replaceTemplateVariables,
  generateInlineStyles,
  createEmailLayout,
  createEmailHeader,
  createEmailFooter,
  createOTPBlock,
  createButton,
  validateEmailTemplate,
  htmlToText,
  getTextDirection
} from './utils';

// Note: Only export functions that actually exist in utils
// export {
//   validateEmail,
//   validateURL,
//   validateOTP,
//   escapeHtml,
//   formatDate
// } from './utils';

// Default configuration
// export { DEFAULT_EMAIL_CONFIG } from './config';

// Version
export const VERSION = '1.0.0';

/**
 * Quick start example:
 *
 * ```typescript
 * import { generateEmailTemplate, SupabaseEmailTemplateGenerator } from '@rolitt/email';
 *
 * // Generate a single template
 * const template = generateEmailTemplate('confirmation', 'en', {
 *   ConfirmationURL: 'https://example.com/confirm?token=abc123',
 *   SiteName: 'My App'
 * });
 *
 * // Supabase integration
 * const generator = new SupabaseEmailTemplateGenerator({
 *   locale: 'en',
 *   siteURL: 'https://example.com',
 *   fromEmail: 'noreply@example.com',
 *   fromName: 'My App'
 * });
 *
 * const supabaseTemplate = generator.generateForSupabase('confirmation', {
 *   ConfirmationURL: 'https://example.com/confirm?token=abc123'
 * });
 * ```
 */
