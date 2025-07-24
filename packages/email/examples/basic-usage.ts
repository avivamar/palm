/**
 * @rolitt/email - Basic Usage Examples
 *
 * This file demonstrates how to use the @rolitt/email package
 * for generating Supabase Auth email templates.
 */

import type { EmailTemplateType, SupportedLocale } from '@rolitt/email';
import {
  emailTemplateManager,
  generateEmailTemplate,
  generateMultipleEmailTemplates,
  SupabaseEmailTemplateGenerator,
} from '@rolitt/email';

// =============================================================================
// 1. Basic Template Generation
// =============================================================================

/**
 * Generate a single email template
 */
function basicTemplateGeneration() {
  console.warn('\n=== Basic Template Generation ===');

  // Generate a confirmation email in English
  const confirmationEmail = generateEmailTemplate('confirmation', 'en', {
    ConfirmationURL: 'https://yourapp.com/confirm?token=abc123',
    SiteName: 'Your Amazing App',
  });

  console.warn('HTML Preview:', `${confirmationEmail.html.substring(0, 100)}...`);
  console.warn('Text Preview:', `${confirmationEmail.text?.substring(0, 100)}...`);

  // Generate an invite email in Japanese
  const inviteEmail = generateEmailTemplate('invite', 'ja', {
    InviteURL: 'https://yourapp.com/invite?token=xyz789',
    SiteName: 'あなたの素晴らしいアプリ',
  });

  console.warn('Japanese Invite Generated:', inviteEmail.text?.includes('招待') ?? false);
}

// =============================================================================
// 2. Multi-Language Template Generation
// =============================================================================

/**
 * Generate templates for multiple languages at once
 */
function multiLanguageGeneration() {
  console.warn('\n=== Multi-Language Generation ===');

  const allLanguages: SupportedLocale[] = ['en', 'zh-HK', 'ja'];

  const templates = generateMultipleEmailTemplates(
    allLanguages.map(locale => ({
      type: 'recovery',
      locale,
      variables: {
        RecoveryURL: 'https://yourapp.com/reset?token=reset123',
        SiteName: 'Your App',
      },
    })),
  );

  // Access templates by language
  const enTemplate = templates.find(t => t.locale === 'en');
  const zhTemplate = templates.find(t => t.locale === 'zh-HK');
  const jaTemplate = templates.find(t => t.locale === 'ja');

  console.warn('English template generated:', !!enTemplate?.template);
  console.warn('Chinese template generated:', !!zhTemplate?.template);
  console.warn('Japanese template generated:', !!jaTemplate?.template);

  // Check content differences
  console.warn('English contains "reset":', enTemplate?.template.text?.toLowerCase().includes('reset') ?? false);
  console.warn('Chinese contains "重設":', zhTemplate?.template.text?.includes('重設') ?? false);
  console.warn('Japanese contains "リセット":', jaTemplate?.template.text?.includes('リセット') ?? false);
}

// =============================================================================
// 3. Supabase Integration
// =============================================================================

/**
 * Use the Supabase integration for dashboard templates
 */
function supabaseIntegration() {
  console.warn('\n=== Supabase Integration ===');

  // Initialize the generator
  const emailGenerator = new SupabaseEmailTemplateGenerator({
    defaultLocale: 'en',
    siteUrl: 'https://yourapp.com',
    from: {
      email: 'noreply@yourapp.com',
      name: 'Your App Team',
    },
    developmentMode: true,
  });

  // Generate template for Supabase Dashboard
  const dashboardTemplate = emailGenerator.generateSupabaseTemplate('confirmation');
  console.warn('Dashboard template contains Supabase variables:', dashboardTemplate.body.includes('{{ .ConfirmationURL }}'));

  // Generate template with actual values
  const actualTemplate = emailGenerator.generateForSupabase('confirmation', {
    ConfirmationURL: 'https://yourapp.com/confirm?token=real123',
  });
  console.warn('Actual template has real URL:', actualTemplate.html.includes('https://yourapp.com/confirm'));

  // Generate all email types for dashboard
  const allTemplates = emailGenerator.generateAllTemplates();
  const emailTypes: EmailTemplateType[] = ['invite', 'confirmation', 'recovery', 'magic_link', 'email_change', 'reauthentication'];

  emailTypes.forEach((type) => {
    console.warn(`${type} template generated:`, !!allTemplates[type]);
  });
}

// =============================================================================
// 4. Template Manager Usage
// =============================================================================

/**
 * Use the template manager for validation and utilities
 */
function templateManagerUsage() {
  console.warn('\n=== Template Manager Usage ===');

  // Check supported types and locales
  console.warn('Supported email types:', emailTemplateManager.getSupportedTypes());
  console.warn('Supported locales:', emailTemplateManager.getSupportedLocales());

  // Validate template content
  const validTemplate = {
    subject: 'Test Subject',
    html: '<html><body>Test content</body></html>',
    text: 'Test content',
  };

  const invalidTemplate = {
    subject: '',
    html: '',
    text: '',
  };

  console.warn('Valid template passes validation:', emailTemplateManager.validateTemplate(validTemplate));
  console.warn('Invalid template fails validation:', !emailTemplateManager.validateTemplate(invalidTemplate));
}

// =============================================================================
// 5. Validation Functions
// =============================================================================

/**
 * Use built-in validation functions
 * Note: validateEmail and validateURL are not currently exported from the package
 */
function validationExamples() {
  console.warn('\n=== Validation Examples ===');

  // Simple email validation using regex
  const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/;
  console.warn('Valid email:', emailRegex.test('user@example.com'));
  console.warn('Invalid email:', !emailRegex.test('not-an-email'));

  // Simple URL validation using URL constructor
  function isValidURL(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  }

  console.warn('Valid URL:', isValidURL('https://example.com'));
  console.warn('Invalid URL:', !isValidURL('not-a-url'));

  // Test various URL formats
  const urls = [
    'https://example.com',
    'http://localhost:3000',
    'https://sub.domain.com/path?query=value',
    'ftp://invalid-protocol.com',
    'not-a-url-at-all',
  ];

  urls.forEach((url) => {
    console.warn(`"${url}" is valid:`, isValidURL(url));
  });
}

// =============================================================================
// 6. Error Handling
// =============================================================================

/**
 * Demonstrate proper error handling
 */
function errorHandlingExamples() {
  console.warn('\n=== Error Handling Examples ===');

  try {
    // This will throw an error - unsupported email type
    generateEmailTemplate('unsupported' as EmailTemplateType, 'en', {});
  } catch (error) {
    console.warn('Caught unsupported email type error:', error instanceof Error ? error.message : 'Unknown error');
  }

  try {
    // This will throw an error - unsupported locale
    generateEmailTemplate('confirmation', 'fr' as SupportedLocale, {
      ConfirmationURL: 'https://example.com',
      SiteName: 'Test',
    });
  } catch (error) {
    console.warn('Caught unsupported locale error:', error instanceof Error ? error.message : 'Unknown error');
  }

  try {
    // This will throw an error - missing required variables
    generateEmailTemplate('confirmation', 'en', {});
  } catch (error) {
    console.warn('Caught missing variables error:', error instanceof Error ? error.message : 'Unknown error');
  }
}

// =============================================================================
// 7. Advanced Configuration
// =============================================================================

/**
 * Advanced configuration and customization
 */
function advancedConfiguration() {
  console.warn('\n=== Advanced Configuration ===');

  // Create generator with custom configuration
  const customGenerator = new SupabaseEmailTemplateGenerator({
    defaultLocale: 'zh-HK',
    siteUrl: 'https://taiwan.yourapp.com',
    from: {
      email: 'no-reply@yourapp.tw',
      name: '您的應用程式團隊',
    },
    developmentMode: false,
  });

  // Generate template with custom config
  const customTemplate = customGenerator.generateForSupabase('invite', {
    InviteURL: 'https://taiwan.yourapp.com/invite?token=tw123',
    SiteName: '您的應用程式',
  });

  console.warn('Custom template generated with Chinese content:', customTemplate.text?.includes('邀請') ?? false);

  // Update configuration dynamically
  customGenerator.updateConfig({
    defaultLocale: 'ja',
    from: {
      email: 'no-reply@yourapp.jp',
      name: 'あなたのアプリチーム',
    },
  });

  const updatedTemplate = customGenerator.generateForSupabase('invite', {
    InviteURL: 'https://japan.yourapp.com/invite?token=jp123',
    SiteName: 'あなたのアプリ',
  });

  console.warn('Updated template generated with Japanese content:', updatedTemplate.text?.includes('招待') ?? false);
}

// =============================================================================
// Run All Examples
// =============================================================================

/**
 * Run all examples
 */
export function runAllExamples() {
  console.warn('🚀 Running @rolitt/email Examples\n');

  basicTemplateGeneration();
  multiLanguageGeneration();
  supabaseIntegration();
  templateManagerUsage();
  validationExamples();
  errorHandlingExamples();
  advancedConfiguration();

  console.warn('\n✅ All examples completed successfully!');
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}
