/**
 * Palm AI 核心配置
 * 集中管理所有配置项，支持环境变量覆盖
 */

export interface PalmConfig {
  // 性能配置
  performance: {
    quickReportTimeout: number; // 简版报告超时时间（毫秒）
    fullReportTimeout: number; // 完整报告超时时间（毫秒）
    maxConcurrentAnalysis: number; // 最大并发分析数
    retryAttempts: number; // 重试次数
    retryDelay: number; // 重试延迟（毫秒）
  };

  // 图像处理配置
  imageProcessing: {
    maxFileSize: number; // 最大文件大小（字节）
    supportedFormats: string[]; // 支持的图像格式
    minResolution: { width: number; height: number }; // 最小分辨率
    maxResolution: { width: number; height: number }; // 最大分辨率
    compressionQuality: number; // 压缩质量 (0-1)
    preprocessingSteps: string[]; // 预处理步骤
  };

  // AI 服务配置
  aiServices: {
    primaryProvider: 'openai' | 'claude' | 'gemini';
    fallbackProviders: ('openai' | 'claude' | 'gemini')[];
    timeout: number; // AI 服务超时时间（毫秒）
    maxTokens: number; // 最大 token 数
    temperature: number; // 创造性参数
    retryOnFailure: boolean; // 失败时是否重试
  };

  // 缓存配置
  cache: {
    enabled: boolean;
    provider: 'redis' | 'memory';
    ttl: {
      imageFeatures: number; // 图像特征缓存时间（秒）
      quickReport: number; // 简版报告缓存时间（秒）
      fullReport: number; // 完整报告缓存时间（秒）
      aiResponse: number; // AI 响应缓存时间（秒）
    };
    maxSize: number; // 最大缓存大小（字节）
    compression: boolean; // 是否压缩缓存数据
  };

  // 商业转化配置
  conversion: {
    enabled: boolean;
    strategies: {
      discount: { enabled: boolean; maxDiscount: number };
      urgency: { enabled: boolean; timeWindow: number };
      socialProof: { enabled: boolean; threshold: number };
      personalized: { enabled: boolean; aiGenerated: boolean };
    };
    abTesting: {
      enabled: boolean;
      variants: string[];
      trafficSplit: number[];
    };
  };

  // 监控配置
  monitoring: {
    enabled: boolean;
    metrics: {
      performance: boolean;
      business: boolean;
      errors: boolean;
      usage: boolean;
    };
    alerting: {
      enabled: boolean;
      thresholds: {
        errorRate: number; // 错误率阈值
        responseTime: number; // 响应时间阈值（毫秒）
        conversionRate: number; // 转化率阈值
      };
    };
  };

  // 安全配置
  security: {
    dataRetention: {
      images: number; // 图像保留时间（天）
      reports: number; // 报告保留时间（天）
      logs: number; // 日志保留时间（天）
    };
    encryption: {
      enabled: boolean;
      algorithm: string;
      keyRotation: number; // 密钥轮换周期（天）
    };
    rateLimit: {
      enabled: boolean;
      requests: number; // 每分钟请求数
      burst: number; // 突发请求数
    };
  };

  // 国际化配置
  i18n: {
    defaultLanguage: 'zh' | 'en' | 'ja' | 'es';
    supportedLanguages: ('zh' | 'en' | 'ja' | 'es')[];
    fallbackLanguage: 'en';
    autoDetect: boolean;
  };
}

/**
 * 默认配置
 */
export const defaultConfig: PalmConfig = {
  performance: {
    quickReportTimeout: 60000, // 60秒
    fullReportTimeout: 300000, // 5分钟
    maxConcurrentAnalysis: 10,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  imageProcessing: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    supportedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    minResolution: { width: 300, height: 300 },
    maxResolution: { width: 4096, height: 4096 },
    compressionQuality: 0.8,
    preprocessingSteps: ['normalize', 'enhance', 'denoise'],
  },

  aiServices: {
    primaryProvider: 'openai',
    fallbackProviders: ['claude', 'gemini'],
    timeout: 30000, // 30秒
    maxTokens: 4000,
    temperature: 0.7,
    retryOnFailure: true,
  },

  cache: {
    enabled: true,
    provider: 'redis',
    ttl: {
      imageFeatures: 3600, // 1小时
      quickReport: 1800, // 30分钟
      fullReport: 7200, // 2小时
      aiResponse: 3600, // 1小时
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    compression: true,
  },

  conversion: {
    enabled: true,
    strategies: {
      discount: { enabled: true, maxDiscount: 30 },
      urgency: { enabled: true, timeWindow: 24 * 60 * 60 * 1000 }, // 24小时
      socialProof: { enabled: true, threshold: 100 },
      personalized: { enabled: true, aiGenerated: true },
    },
    abTesting: {
      enabled: true,
      variants: ['control', 'variant_a', 'variant_b'],
      trafficSplit: [0.4, 0.3, 0.3],
    },
  },

  monitoring: {
    enabled: true,
    metrics: {
      performance: true,
      business: true,
      errors: true,
      usage: true,
    },
    alerting: {
      enabled: true,
      thresholds: {
        errorRate: 0.05, // 5%
        responseTime: 60000, // 60秒
        conversionRate: 0.1, // 10%
      },
    },
  },

  security: {
    dataRetention: {
      images: 30, // 30天
      reports: 365, // 1年
      logs: 90, // 90天
    },
    encryption: {
      enabled: true,
      algorithm: 'AES-256-GCM',
      keyRotation: 90, // 90天
    },
    rateLimit: {
      enabled: true,
      requests: 60, // 每分钟60次
      burst: 10, // 突发10次
    },
  },

  i18n: {
    defaultLanguage: 'en',
    supportedLanguages: ['zh', 'en', 'ja', 'es'],
    fallbackLanguage: 'en',
    autoDetect: true,
  },
};

/**
 * 从环境变量加载配置
 */
export function loadConfigFromEnv(): Partial<PalmConfig> {
  // 在浏览器环境中返回空配置
  if (typeof process === 'undefined') {
    return {};
  }

  const envConfig: Partial<PalmConfig> = {};

  // 性能配置
  if (process.env.PALM_QUICK_REPORT_TIMEOUT) {
    envConfig.performance = {
      ...defaultConfig.performance,
      quickReportTimeout: parseInt(process.env.PALM_QUICK_REPORT_TIMEOUT),
    };
  }

  // AI 服务配置
  if (process.env.PALM_AI_PRIMARY_PROVIDER) {
    envConfig.aiServices = {
      ...defaultConfig.aiServices,
      primaryProvider: process.env.PALM_AI_PRIMARY_PROVIDER as 'openai' | 'claude' | 'gemini',
    };
  }

  // 缓存配置
  if (process.env.PALM_CACHE_ENABLED) {
    envConfig.cache = {
      ...defaultConfig.cache,
      enabled: process.env.PALM_CACHE_ENABLED === 'true',
    };
  }

  // 转化配置
  if (process.env.PALM_CONVERSION_ENABLED) {
    envConfig.conversion = {
      ...defaultConfig.conversion,
      enabled: process.env.PALM_CONVERSION_ENABLED === 'true',
    };
  }

  return envConfig;
}

/**
 * 合并配置
 */
export function mergeConfig(
  base: PalmConfig,
  override: Partial<PalmConfig>
): PalmConfig {
  return {
    performance: { ...base.performance, ...(override.performance || {}) },
    imageProcessing: { ...base.imageProcessing, ...(override.imageProcessing || {}) },
    aiServices: { ...base.aiServices, ...(override.aiServices || {}) },
    cache: { 
      ...base.cache, 
      ...(override.cache || {}),
      ttl: { ...base.cache.ttl, ...(override.cache?.ttl || {}) }
    },
    conversion: { 
      ...base.conversion, 
      ...(override.conversion || {}),
      strategies: { ...base.conversion.strategies, ...(override.conversion?.strategies || {}) },
      abTesting: { ...base.conversion.abTesting, ...(override.conversion?.abTesting || {}) }
    },
    monitoring: { 
      ...base.monitoring, 
      ...(override.monitoring || {}),
      metrics: { ...base.monitoring.metrics, ...(override.monitoring?.metrics || {}) },
      alerting: { 
        ...base.monitoring.alerting, 
        ...(override.monitoring?.alerting || {}),
        thresholds: { ...base.monitoring.alerting.thresholds, ...(override.monitoring?.alerting?.thresholds || {}) }
      }
    },
    security: { 
      ...base.security, 
      ...(override.security || {}),
      dataRetention: { ...base.security.dataRetention, ...(override.security?.dataRetention || {}) },
      encryption: { ...base.security.encryption, ...(override.security?.encryption || {}) },
      rateLimit: { ...base.security.rateLimit, ...(override.security?.rateLimit || {}) }
    },
    i18n: { ...base.i18n, ...(override.i18n || {}) },
  };
}

/**
 * 验证配置
 */
export function validateConfig(config: PalmConfig): void {
  // 验证超时时间
  if (config.performance.quickReportTimeout > 120000) {
    throw new Error('Quick report timeout cannot exceed 2 minutes');
  }

  // 验证文件大小
  if (config.imageProcessing.maxFileSize > 50 * 1024 * 1024) {
    throw new Error('Max file size cannot exceed 50MB');
  }

  // 验证 AI 服务配置
  if (!['openai', 'claude', 'gemini'].includes(config.aiServices.primaryProvider)) {
    throw new Error('Invalid primary AI provider');
  }

  // 验证缓存配置
  if (config.cache.enabled && !['redis', 'memory'].includes(config.cache.provider)) {
    throw new Error('Invalid cache provider');
  }

  // 验证语言配置
  const validLanguages = ['zh', 'en', 'ja', 'es'];
  if (!validLanguages.includes(config.i18n.defaultLanguage)) {
    throw new Error('Invalid default language');
  }
}

/**
 * 获取最终配置
 */
export function getConfig(override?: Partial<PalmConfig>): PalmConfig {
  const envConfig = loadConfigFromEnv();
  const mergedEnvConfig = mergeConfig(defaultConfig, envConfig);
  const finalConfig = mergeConfig(mergedEnvConfig, override || {});
  
  validateConfig(finalConfig);
  return finalConfig;
}