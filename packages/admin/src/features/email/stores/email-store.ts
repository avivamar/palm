import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  generateEmailTemplate, 
  type SupportedLocale, 
  type EmailTemplateType,
  type SupabaseTemplateVariables,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE
} from '@rolitt/email';
import type { 
  EmailManagementState, 
  EmailManagementActions,
  EmailTemplate,
  EmailTemplatePreview,
  EmailConfiguration,
  EmailTestRequest,
  EmailTestResult,
  BrandConfig
} from '../types';

type EmailManagementStore = EmailManagementState & {
  actions: EmailManagementActions;
};

const initialBrandConfig: BrandConfig = {
  companyName: 'Rolitt',
  brandName: 'Rolitt',
  primaryColor: '#EBFF7F',
  logoUrl: 'https://rolitt.com/palmlogo.svg',
  websiteUrl: 'https://rolitt.com',
  supportEmail: 'support@rolitt.com',
  socialLinks: {
    twitter: 'https://twitter.com/rolitt',
    facebook: 'https://facebook.com/rolitt',
    instagram: 'https://instagram.com/rolitt',
    linkedin: 'https://linkedin.com/company/rolitt',
  },
};

const initialConfiguration: EmailConfiguration = {
  brandConfig: initialBrandConfig,
  defaultLocale: DEFAULT_LOCALE,
  supportedLocales: SUPPORTED_LOCALES,
  supabaseConfig: {},
  smtpConfig: {},
};

const initialStats = {
  totalTemplates: 0,
  activeTemplates: 0,
  supportedLanguages: SUPPORTED_LOCALES.length,
  testsSent: 0,
};

export const useEmailManagementStore = create<EmailManagementStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      templates: [],
      currentTemplate: null,
      previewTemplate: null,
      currentPreview: null,
      configuration: initialConfiguration,
      selectedTemplateType: null,
      selectedLocale: DEFAULT_LOCALE,
      isEditing: false,
      isPreviewMode: false,
      isSaving: false,
      isLoading: false,
      isTesting: false,
      isDeploying: false,
      error: null,
      testResults: [],
      stats: initialStats,

      actions: {
        // Template management
        loadTemplates: async () => {
          try {
            // In a real implementation, this would load from API/database
            // For now, we'll generate sample templates
            const sampleTemplates: EmailTemplate[] = [];
            
            const templateTypes: EmailTemplateType[] = ['confirmation', 'recovery', 'invite', 'magic_link', 'email_change', 'reauthentication'];
            
            for (const type of templateTypes) {
              for (const locale of SUPPORTED_LOCALES) {
                const template = generateEmailTemplate(type, locale, {
                  ConfirmationURL: 'https://example.com/confirm',
                  SiteName: 'Rolitt',
                  Email: 'user@example.com',
                });
                
                sampleTemplates.push({
                  id: `${type}-${locale}`,
                  type,
                  locale,
                  subject: template.subject,
                  htmlContent: template.html,
                  textContent: template.text,
                  variables: {
                    ConfirmationURL: 'https://example.com/confirm',
                    SiteName: 'Rolitt',
                    Email: 'user@example.com',
                  },
                  lastModified: new Date(),
                  isActive: true,
                });
              }
            }
            
            set({ 
              templates: sampleTemplates,
              stats: {
                ...get().stats,
                totalTemplates: sampleTemplates.length,
                activeTemplates: sampleTemplates.filter(t => t.isActive).length,
              }
            });
          } catch (error) {
            console.error('Failed to load templates:', error);
          }
        },

        createTemplate: async (type: EmailTemplateType, locale: SupportedLocale) => {
          try {
            const template = generateEmailTemplate(type, locale, {
              SiteName: get().configuration.brandConfig.companyName,
            });
            
            const newTemplate: EmailTemplate = {
              id: `${type}-${locale}-${Date.now()}`,
              type,
              locale,
              subject: template.subject,
              htmlContent: template.html,
              textContent: template.text,
              variables: {},
              lastModified: new Date(),
              isActive: false,
            };
            
            set(state => ({
              templates: [...state.templates, newTemplate],
              currentTemplate: newTemplate,
              isEditing: true,
            }));
          } catch (error) {
            console.error('Failed to create template:', error);
          }
        },

        updateTemplate: async (id: string, updates: Partial<EmailTemplate>) => {
          set(state => ({
            templates: state.templates.map(t => 
              t.id === id 
                ? { ...t, ...updates, lastModified: new Date() }
                : t
            ),
          }));
        },

        deleteTemplate: async (id: string) => {
          set(state => ({
            templates: state.templates.filter(t => t.id !== id),
            currentTemplate: state.currentTemplate?.id === id ? null : state.currentTemplate,
          }));
        },

        duplicateTemplate: async (id: string, newLocale?: SupportedLocale) => {
          const template = get().templates.find(t => t.id === id);
          if (!template) return;
          
          const duplicated: EmailTemplate = {
            ...template,
            id: `${template.type}-${newLocale || template.locale}-${Date.now()}`,
            locale: newLocale || template.locale,
            lastModified: new Date(),
            isActive: false,
          };
          
          set(state => ({
            templates: [...state.templates, duplicated],
          }));
        },

        // Template editing
        setCurrentTemplate: (template: EmailTemplate | null) => {
          set({ currentTemplate: template, isEditing: !!template });
        },

        updateCurrentTemplate: (updates: Partial<EmailTemplate>) => {
          set(state => ({
            currentTemplate: state.currentTemplate 
              ? { ...state.currentTemplate, ...updates }
              : null,
          }));
        },

        saveCurrentTemplate: async () => {
          const { currentTemplate } = get();
          if (!currentTemplate) return;
          
          set({ isSaving: true });
          try {
            await get().actions.updateTemplate(currentTemplate.id, currentTemplate);
            set({ isEditing: false });
          } catch (error) {
            console.error('Failed to save template:', error);
          } finally {
            set({ isSaving: false });
          }
        },

        // Preview
        generatePreview: async (type: EmailTemplateType, locale: SupportedLocale, variables: Record<string, any> = {}) => {
          set((state) => ({ ...state, isLoading: true }));
          
          try {
            // 构建模板变量，确保与 SupabaseTemplateVariables 兼容
            const templateVariables: SupabaseTemplateVariables = {
              SiteName: get().configuration.brandConfig.brandName,
              SiteURL: get().configuration.brandConfig.websiteUrl,
              Email: variables.email || 'user@example.com',
              ...variables,
            };

            // 生成模板
            const template = await generateEmailTemplate(type, locale, templateVariables);
            
            // 创建预览对象
        const preview: EmailTemplatePreview = {
          type,
          locale,
          htmlContent: template.html,
          variables: templateVariables,
        };

            set((state) => ({
              ...state,
              currentPreview: preview,
              isLoading: false,
            }));
          } catch (error) {
            set((state) => ({
              ...state,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to generate preview',
            }));
          }
        },

        setPreviewMode: (enabled: boolean) => {
          set({ isPreviewMode: enabled });
        },

        // Configuration
        updateConfiguration: async (updates: Partial<EmailConfiguration>) => {
          set(state => ({
            configuration: { ...state.configuration, ...updates },
          }));
        },

        resetConfiguration: () => {
          set({ configuration: initialConfiguration });
        },

        // Testing
        sendTestEmail: async (request: EmailTestRequest) => {
          set((state) => ({ ...state, isLoading: true }));
          
          try {
            // 模拟发送测试邮件
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const result: EmailTestResult = {
              id: Date.now().toString(),
              success: true,
              timestamp: new Date(),
              recipient: request.recipient,
              emailType: request.emailType,
              locale: request.locale,
              messageId: `test_${Date.now()}`,
            };
            
            set((state) => ({
              ...state,
              testResults: [result, ...state.testResults],
              isLoading: false,
            }));
            
            return result;
          } catch (error) {
            const errorResult: EmailTestResult = {
              id: Date.now().toString(),
              success: false,
              timestamp: new Date(),
              recipient: request.recipient,
              emailType: request.emailType,
              locale: request.locale,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
            
            set((state) => ({
              ...state,
              testResults: [errorResult, ...state.testResults],
              isLoading: false,
            }));
            
            throw error;
          }
        },

        clearTestResults: () => {
          set({ testResults: [] });
        },

        // Deployment
        deployToSupabase: async () => {
          set({ isDeploying: true });
          
          try {
            const { configuration } = get();
            
            if (!configuration.supabaseConfig.projectUrl || !configuration.supabaseConfig.serviceRoleKey) {
              throw new Error('Supabase configuration is incomplete');
            }
            
            // In a real implementation, this would deploy to Supabase
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            set(state => ({
              stats: {
                ...state.stats,
                lastDeployment: new Date(),
              },
            }));
          } catch (error) {
            console.error('Deployment failed:', error);
            throw error;
          } finally {
            set({ isDeploying: false });
          }
        },

        validateSupabaseConnection: async (): Promise<boolean> => {
          try {
            const { configuration } = get();
            
            if (!configuration.supabaseConfig.projectUrl || !configuration.supabaseConfig.anonKey) {
              return false;
            }
            
            // In a real implementation, this would test the connection
            await new Promise(resolve => setTimeout(resolve, 1000));
            return true;
          } catch (error) {
            console.error('Connection validation failed:', error);
            return false;
          }
        },

        // UI actions
        setSelectedTemplateType: (type: EmailTemplateType | null) => {
          set({ selectedTemplateType: type });
        },

        setSelectedLocale: (locale: SupportedLocale) => {
          set({ selectedLocale: locale });
        },

        setEditingMode: (editing: boolean) => {
          set({ isEditing: editing });
        },

        // Stats
        refreshStats: async () => {
          const { templates } = get();
          set({
            stats: {
              totalTemplates: templates.length,
              activeTemplates: templates.filter(t => t.isActive).length,
              supportedLanguages: SUPPORTED_LOCALES.length,
              testsSent: get().stats.testsSent,
              lastDeployment: get().stats.lastDeployment,
            },
          });
        },
      },
    }),
    {
      name: 'email-management-store',
    }
  )
);