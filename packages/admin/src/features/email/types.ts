import type { SupportedLocale, EmailTemplateType } from '@rolitt/email';

// 品牌配置
export interface BrandConfig {
  companyName: string;
  brandName: string;
  primaryColor: string;
  logoUrl: string;
  websiteUrl: string;
  supportEmail: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
}

/**
 * Email Management Types
 */

export interface EmailTemplate {
  id: string;
  type: EmailTemplateType;
  locale: SupportedLocale;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: Record<string, string>;
  lastModified: Date;
  isActive: boolean;
}

export interface EmailTemplatePreview {
  type: EmailTemplateType;
  locale: SupportedLocale;
  htmlContent: string;
  variables: Record<string, string>;
}

export interface EmailConfiguration {
  brandConfig: BrandConfig;
  defaultLocale: SupportedLocale;
  supportedLocales: SupportedLocale[];
  supabaseConfig: {
    projectUrl?: string;
    anonKey?: string;
    serviceRoleKey?: string;
  };
  smtpConfig: {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user?: string;
      pass?: string;
    };
  };
}

export interface EmailTestRequest {
  emailType: EmailTemplateType;
  locale: SupportedLocale;
  recipient: string;
  variables: Record<string, string>;
}

export interface EmailTestResult {
  id: string;
  success: boolean;
  timestamp: Date;
  recipient: string;
  emailType: EmailTemplateType;
  locale: SupportedLocale;
  messageId?: string;
  error?: string;
}

export interface EmailStats {
  totalTemplates: number;
  activeTemplates: number;
  supportedLanguages: number;
  lastDeployment?: Date;
  testsSent: number;
}

export interface EmailDeploymentStatus {
  isDeploying: boolean;
  lastDeployment?: Date;
  deploymentHistory: Array<{
    id: string;
    timestamp: Date;
    status: 'success' | 'failed';
    templatesDeployed: number;
    error?: string;
  }>;
}

export interface EmailManagementState {
  // Templates
  templates: EmailTemplate[];
  currentTemplate: EmailTemplate | null;
  previewTemplate: EmailTemplatePreview | null;
  currentPreview: EmailTemplatePreview | null;
  
  // Configuration
  configuration: EmailConfiguration;
  
  // UI State
  selectedTemplateType: EmailTemplateType | null;
  selectedLocale: SupportedLocale;
  isEditing: boolean;
  isPreviewMode: boolean;
  isSaving: boolean;
  isLoading: boolean;
  isTesting: boolean;
  isDeploying: boolean;
  error: string | null;
  
  // Test results
  testResults: EmailTestResult[];
  
  // Stats
  stats: EmailStats;
}

export interface EmailManagementActions {
  // Template management
  loadTemplates: () => Promise<void>;
  createTemplate: (type: EmailTemplateType, locale: SupportedLocale) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<EmailTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  duplicateTemplate: (id: string, newLocale?: SupportedLocale) => Promise<void>;
  
  // Template editing
  setCurrentTemplate: (template: EmailTemplate | null) => void;
  updateCurrentTemplate: (updates: Partial<EmailTemplate>) => void;
  saveCurrentTemplate: () => Promise<void>;
  
  // Preview
  generatePreview: (type: EmailTemplateType, locale: SupportedLocale, variables?: Record<string, string>) => Promise<void>;
  setPreviewMode: (enabled: boolean) => void;
  
  // Configuration
  updateConfiguration: (updates: Partial<EmailConfiguration>) => Promise<void>;
  resetConfiguration: () => void;
  
  // Testing
  sendTestEmail: (request: EmailTestRequest) => Promise<EmailTestResult>;
  clearTestResults: () => void;
  
  // Deployment
  deployToSupabase: () => Promise<void>;
  validateSupabaseConnection: () => Promise<boolean>;
  
  // UI actions
  setSelectedTemplateType: (type: EmailTemplateType | null) => void;
  setSelectedLocale: (locale: SupportedLocale) => void;
  setEditingMode: (editing: boolean) => void;
  
  // Stats
  refreshStats: () => Promise<void>;
}

export interface EmailManagementTranslations {
  title: string;
  subtitle: string;
  tabs: {
    templates: string;
    configuration: string;
    testing: string;
    deployment: string;
  };
  templates: {
    title: string;
    createNew: string;
    editTemplate: string;
    deleteTemplate: string;
    duplicateTemplate: string;
    templateTypes: Record<EmailTemplateType, string>;
    languages: Record<SupportedLocale, string>;
    fields: {
      subject: string;
      htmlContent: string;
      textContent: string;
      variables: string;
      lastModified: string;
      status: string;
    };
    actions: {
      save: string;
      cancel: string;
      preview: string;
      test: string;
      duplicate: string;
      delete: string;
    };
    status: {
      active: string;
      inactive: string;
      draft: string;
    };
  };
  configuration: {
    title: string;
    brandConfig: {
      title: string;
      companyName: string;
      primaryColor: string;
      logoUrl: string;
      websiteUrl: string;
      supportEmail: string;
    };
    localization: {
      title: string;
      defaultLocale: string;
      supportedLocales: string;
    };
    supabase: {
      title: string;
      projectUrl: string;
      anonKey: string;
      serviceRoleKey: string;
      testConnection: string;
    };
    smtp: {
      title: string;
      host: string;
      port: string;
      secure: string;
      username: string;
      password: string;
    };
  };
  testing: {
    title: string;
    selectTemplate: string;
    selectLanguage: string;
    recipientEmail: string;
    customVariables: string;
    sendTest: string;
    testResults: string;
    clearResults: string;
  };
  deployment: {
    title: string;
    deployToSupabase: string;
    deploymentStatus: string;
    lastDeployment: string;
    validateConnection: string;
  };
  messages: {
    templateSaved: string;
    templateDeleted: string;
    testEmailSent: string;
    deploymentSuccess: string;
    deploymentFailed: string;
    connectionValid: string;
    connectionInvalid: string;
    errors: {
      loadFailed: string;
      saveFailed: string;
      deleteFailed: string;
      testFailed: string;
      deploymentFailed: string;
      invalidConfiguration: string;
    };
  };
}