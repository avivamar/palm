/**
 * Scripts module types
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

export type SystemHealthData = {
  database: 'healthy' | 'warning' | 'critical';
  redis: 'healthy' | 'warning' | 'critical';
  api: 'healthy' | 'warning' | 'critical';
};

export type ShopifyStatus = {
  apiConnection: 'healthy' | 'warning' | 'critical';
  productSync: 'healthy' | 'warning' | 'critical';
  configValidation: 'healthy' | 'warning' | 'critical';
};

export type CoreScriptsData = {
  environmentValidation: 'healthy' | 'warning' | 'critical';
  buildValidation: 'healthy' | 'warning' | 'critical';
  stripeSync: 'healthy' | 'warning' | 'critical';
};

export type ScriptsTranslations = {
  title: string;
  description: string;
  health: {
    title: string;
    description: string;
  };
  tabs: {
    overview: string;
    shopify: string;
    environment: string;
    deployment: string;
    scripts: string;
  };
  overview: {
    coreScripts: string;
    shopifyStatus: string;
    systemHealth: string;
    coreScriptsCount: string;
    shopifyIntegrationStatus: string;
    systemOverallHealth: string;
  };
  statusLabels: {
    environmentValidation: string;
    buildValidation: string;
    stripeSync: string;
    apiConnection: string;
    productSync: string;
    configValidation: string;
    databaseConnection: string;
    redisCache: string;
    apiService: string;
  };
  shopify: {
    title: string;
    description: string;
    managementDescription: string;
  };
  environment: {
    title: string;
    description: string;
  };
  deployment: {
    title: string;
    description: string;
  };
  scripts: {
    title: string;
    description: string;
  };
};
