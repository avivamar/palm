/**
 * @rolitt/email - Package Integration Tests
 *
 * Tests to verify the package works correctly after decoupling
 */

import type { EmailTemplateType, SupportedLocale } from '../types';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  emailTemplateManager,
  generateEmailTemplate,
  generateMultipleEmailTemplates,
  SupabaseEmailTemplateGenerator,
  VERSION,
} from '../index';

describe('@rolitt/email Package', () => {
  describe('Package Exports', () => {
    it('should export all required functions', () => {
      expect(generateEmailTemplate).toBeDefined();
      expect(generateMultipleEmailTemplates).toBeDefined();
      expect(SupabaseEmailTemplateGenerator).toBeDefined();
      expect(emailTemplateManager).toBeDefined();
    });

    it('should export configuration and constants', () => {
      expect(VERSION).toBe('1.0.0');
    });

    it('should export TypeScript types', () => {
      // Type checking - these should compile without errors
      const emailType: EmailTemplateType = 'confirmation';
      const locale: SupportedLocale = 'en';

      expect(emailType).toBe('confirmation');
      expect(locale).toBe('en');
    });
  });

  describe('Core Functionality', () => {
    it('should generate email templates correctly', () => {
      const template = generateEmailTemplate('confirmation', 'en', {
        ConfirmationURL: 'https://example.com/confirm?token=test123',
        SiteName: 'Test App',
      });

      expect(template).toHaveProperty('html');
      expect(template).toHaveProperty('text');
      expect(template.html).toContain('Test App');
      expect(template.html).toContain('https://example.com/confirm?token=test123');
      expect(template.text).toContain('Test App');
    });

    it('should generate multiple language templates', () => {
      const requests = [
        {
          type: 'invite' as EmailTemplateType,
          locale: 'en' as const,
          variables: {
            InviteURL: 'https://example.com/invite?token=invite123',
            SiteName: 'Multi-Lang App',
            SiteURL: 'https://example.com',
            Email: 'user@example.com',
          },
        },
        {
          type: 'invite' as EmailTemplateType,
          locale: 'zh-HK' as const,
          variables: {
            InviteURL: 'https://example.com/invite?token=invite123',
            SiteName: 'Multi-Lang App',
            SiteURL: 'https://example.com',
            Email: 'user@example.com',
          },
        },
        {
          type: 'invite' as EmailTemplateType,
          locale: 'ja' as const,
          variables: {
            InviteURL: 'https://example.com/invite?token=invite123',
            SiteName: 'Multi-Lang App',
            SiteURL: 'https://example.com',
            Email: 'user@example.com',
          },
        },
      ];

      const templates = generateMultipleEmailTemplates(requests);

      expect(templates).toHaveLength(3);
      expect(templates[0]?.template.text?.toLowerCase()).toContain('invite');
      expect(templates[1]?.template.text?.toLowerCase()).toContain('邀請');
      expect(templates[2]?.template.text?.toLowerCase()).toContain('招待');
    });

    it('should validate template manager functionality', () => {
      const supportedTypes = emailTemplateManager.getSupportedTypes();
      const supportedLocales = emailTemplateManager.getSupportedLocales();

      expect(supportedTypes).toContain('confirmation');
      expect(supportedTypes).toContain('invite');
      expect(supportedTypes).toContain('recovery');
      expect(supportedTypes).toContain('magic_link');
      expect(supportedTypes).toContain('email_change');
      expect(supportedTypes).toContain('reauthentication');

      expect(supportedLocales).toContain('en');
      expect(supportedLocales).toContain('zh-HK');
      expect(supportedLocales).toContain('ja');
    });
  });

  describe('Supabase Integration', () => {
    let generator: SupabaseEmailTemplateGenerator;

    beforeEach(() => {
      generator = new SupabaseEmailTemplateGenerator({
        defaultLocale: 'en',
        siteUrl: 'https://test.com',
        from: {
          email: 'test@test.com',
          name: 'Test App',
        },
      });
    });

    it('should create Supabase email generator', () => {
      expect(generator).toBeInstanceOf(SupabaseEmailTemplateGenerator);
    });

    it('should generate dashboard templates with Supabase variables', () => {
      const template = generator.generateSupabaseTemplate('confirmation');

      expect(template.body).toContain('https://test.com');
      expect(template.subject).toBeTruthy();
    });

    it('should generate templates with actual values', () => {
      const template = generator.generateForSupabase('confirmation', {
        ConfirmationURL: 'https://test.com/confirm?token=real123',
      });

      expect(template.html).toContain('https://test.com/confirm?token=real123');
      expect(template.html).not.toContain('{{ .ConfirmationURL }}');
    });

    it('should generate all email types', () => {
      const allTemplates = generator.generateAllTemplates('en');

      expect(allTemplates).toHaveProperty('invite');
      expect(allTemplates).toHaveProperty('confirmation');
      expect(allTemplates).toHaveProperty('recovery');
      expect(allTemplates).toHaveProperty('magic_link');
      expect(allTemplates).toHaveProperty('email_change');
      expect(allTemplates).toHaveProperty('reauthentication');
    });

    it('should update configuration', () => {
      generator.updateConfig({ defaultLocale: 'ja' });

      const template = generator.generateForSupabase('invite', {
        InviteURL: 'https://test.com/invite',
        SiteName: 'テストアプリ',
      });

      expect(template.text).toContain('招待');
    });
  });

  describe('Utility Functions', () => {
    it('should have utility functions available', () => {
      // Test that basic template generation works
      const template = generateEmailTemplate('confirmation', 'en', {
        ConfirmationURL: 'https://example.com/confirm',
        SiteName: 'Test Site',
      });

      expect(template).toBeDefined();
      expect(template.html).toBeDefined();
      expect(template.text).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should throw error for unsupported email type', () => {
      expect(() => {
        generateEmailTemplate('unsupported' as any, 'en', {});
      }).toThrow();
    });

    it('should throw error for unsupported locale', () => {
      expect(() => {
        generateEmailTemplate('confirmation', 'fr' as any, {
          ConfirmationURL: 'https://example.com',
          SiteName: 'Test',
        });
      }).toThrow();
    });

    it('should throw error for missing required variables', () => {
      expect(() => {
        generateEmailTemplate('confirmation', 'en', {});
      }).toThrow();
    });

    it('should handle invalid variables gracefully', () => {
      // Test that template generation works even with potentially invalid variables
      const template = generateEmailTemplate('confirmation', 'en', {
        ConfirmationURL: 'not-a-url',
        SiteName: 'Test App',
      });

      expect(template.html).toContain('not-a-url');
      expect(template.text).toContain('not-a-url');
    });
  });

  describe('Configuration', () => {
    it('should have version defined', () => {
      expect(VERSION).toBeDefined();
      expect(typeof VERSION).toBe('string');
    });
  });

  describe('Template Content Quality', () => {
    it('should generate responsive HTML templates', () => {
      const template = generateEmailTemplate('confirmation', 'en', {
        ConfirmationURL: 'https://example.com/confirm',
        SiteName: 'Test App',
      });

      // Check for responsive design elements
      expect(template.html).toContain('viewport');
      expect(template.html).toContain('max-width');
      expect(template.html).toContain('media');
    });

    it('should include accessibility features', () => {
      const template = generateEmailTemplate('invite', 'en', {
        InviteURL: 'https://example.com/invite',
        SiteName: 'Test App',
      });

      // Check for accessibility attributes
      expect(template.html).toContain('role=');
      expect(template.html).toContain('alt=');
      expect(template.html).toContain('lang=');
    });

    it('should include proper meta tags', () => {
      const template = generateEmailTemplate('recovery', 'en', {
        RecoveryURL: 'https://example.com/reset',
        SiteName: 'Test App',
      });

      expect(template.html).toContain('<meta');
      expect(template.html).toContain('charset="utf-8"');
      expect(template.html).toContain('http-equiv="X-UA-Compatible"');
    });

    it('should generate meaningful plain text versions', () => {
      const template = generateEmailTemplate('magic_link', 'en', {
        MagicLinkURL: 'https://example.com/magic',
        SiteName: 'Test App',
      });

      expect(template.text).toBeTruthy();
      expect((template.text ?? '').length).toBeGreaterThan(50);
      expect(template.text).toContain('Test App');
      expect(template.text).toContain('https://example.com/magic');
      expect(template.text).not.toContain('<');
      expect(template.text).not.toContain('>');
    });
  });

  describe('Multi-language Content', () => {
    it('should have different content for different languages', () => {
      const variables = {
        ConfirmationURL: 'https://example.com/confirm',
        SiteName: 'Test App',
      };

      const enTemplate = generateEmailTemplate('confirmation', 'en', variables);
      const zhTemplate = generateEmailTemplate('confirmation', 'zh-HK', variables);
      const jaTemplate = generateEmailTemplate('confirmation', 'ja', variables);

      // Content should be different
      expect(enTemplate.text).not.toBe(zhTemplate.text);
      expect(enTemplate.text).not.toBe(jaTemplate.text);
      expect(zhTemplate.text).not.toBe(jaTemplate.text);

      // But should contain the same variables
      [enTemplate, zhTemplate, jaTemplate].forEach((template) => {
        expect(template.html).toContain('Test App');
        expect(template.html).toContain('https://example.com/confirm');
      });
    });

    it('should have correct language attributes', () => {
      const enTemplate = generateEmailTemplate('confirmation', 'en', {
        ConfirmationURL: 'https://example.com/confirm',
        SiteName: 'Test App',
      });

      const zhTemplate = generateEmailTemplate('confirmation', 'zh-HK', {
        ConfirmationURL: 'https://example.com/confirm',
        SiteName: 'Test App',
      });

      expect(enTemplate.html).toContain('lang="en"');
      expect(zhTemplate.html).toContain('lang="zh-HK"');
    });
  });
});
