import { useEmailManagementStore } from '../stores';

/**
 * Hook for email template management
 */
export const useEmailTemplates = () => {
  const store = useEmailManagementStore();
  
  return {
    templates: store.templates,
    currentTemplate: store.currentTemplate,
    isEditing: store.isEditing,
    isSaving: store.isSaving,
    
    // Actions
    loadTemplates: store.actions.loadTemplates,
    createTemplate: store.actions.createTemplate,
    updateTemplate: store.actions.updateTemplate,
    deleteTemplate: store.actions.deleteTemplate,
    duplicateTemplate: store.actions.duplicateTemplate,
    setCurrentTemplate: store.actions.setCurrentTemplate,
    updateCurrentTemplate: store.actions.updateCurrentTemplate,
    saveCurrentTemplate: store.actions.saveCurrentTemplate,
  };
};

/**
 * Hook for email preview functionality
 */
export const useEmailPreview = () => {
  const store = useEmailManagementStore();
  
  return {
    previewTemplate: store.previewTemplate,
    isPreviewMode: store.isPreviewMode,
    selectedTemplateType: store.selectedTemplateType,
    selectedLocale: store.selectedLocale,
    
    // Actions
    generatePreview: store.actions.generatePreview,
    setPreviewMode: store.actions.setPreviewMode,
    setSelectedTemplateType: store.actions.setSelectedTemplateType,
    setSelectedLocale: store.actions.setSelectedLocale,
  };
};

/**
 * Hook for email configuration management
 */
export const useEmailConfiguration = () => {
  const store = useEmailManagementStore();
  
  return {
    configuration: store.configuration,
    
    // Actions
    updateConfiguration: store.actions.updateConfiguration,
    resetConfiguration: store.actions.resetConfiguration,
    validateSupabaseConnection: store.actions.validateSupabaseConnection,
  };
};

/**
 * Hook for email testing functionality
 */
export const useEmailTesting = () => {
  const store = useEmailManagementStore();
  
  return {
    testResults: store.testResults,
    isTesting: store.isTesting,
    
    // Actions
    sendTestEmail: store.actions.sendTestEmail,
    clearTestResults: store.actions.clearTestResults,
  };
};

/**
 * Hook for email deployment functionality
 */
export const useEmailDeployment = () => {
  const store = useEmailManagementStore();
  
  return {
    isDeploying: store.isDeploying,
    stats: store.stats,
    
    // Actions
    deployToSupabase: store.actions.deployToSupabase,
    refreshStats: store.actions.refreshStats,
  };
};