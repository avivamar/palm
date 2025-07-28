/**
 * @rolitt/palm - Palm AI 核心分析包
 * 
 * 提供完整的手掌图像分析、特征提取、报告生成和商业转化功能
 * 
 * @version 1.0.0
 * @author Rolitt Team
 */

// 核心引擎
export { PalmAnalysisEngine, createPalmEngine } from './engine';

// 配置系统
export type { PalmConfig } from './config';
export { 
  defaultConfig, 
  getConfig, 
  loadConfigFromEnv, 
  mergeConfig, 
  validateConfig 
} from './config';

// 类型定义
export * from './types';

// 处理器
export type { ProcessedImage } from './processors/image-processor';
export { ImageProcessor } from './processors/image-processor';
export { FeatureExtractor } from './processors/feature-extractor';

// 生成器
export { ReportGenerator } from './generators/report-generator';

// 优化器 - 暂时禁用，修复部署问题
// export { ConversionOptimizer } from './optimizers/conversion-optimizer';

// 工具类
export { CacheManager } from './utils/cache-manager';
export { MetricsCollector } from './utils/metrics-collector';

// 常量和枚举
export const PALM_VERSION = '1.0.0';

export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp'
] as const;

export const ANALYSIS_TYPES = ['quick', 'complete'] as const;

export const HAND_TYPES = ['left', 'right'] as const;

export const SUPPORTED_LANGUAGES = ['zh', 'en', 'ja', 'es'] as const;

// 默认超时时间
export const DEFAULT_TIMEOUTS = {
  QUICK_ANALYSIS: 60000, // 60秒
  FULL_ANALYSIS: 300000, // 5分钟
  IMAGE_PROCESSING: 10000, // 10秒
  AI_REQUEST: 30000, // 30秒
} as const;

// 默认缓存TTL
export const DEFAULT_CACHE_TTL = {
  IMAGE_FEATURES: 3600, // 1小时
  QUICK_REPORT: 1800, // 30分钟
  FULL_REPORT: 7200, // 2小时
  AI_RESPONSE: 3600, // 1小时
} as const;

// 助手函数
export const PalmUtils = {
  /**
   * 验证图像文件格式
   */
  isValidImageFormat(mimeType: string): boolean {
    return SUPPORTED_IMAGE_FORMATS.includes(mimeType as any);
  },

  /**
   * 验证分析类型
   */
  isValidAnalysisType(type: string): type is 'quick' | 'complete' {
    return ANALYSIS_TYPES.includes(type as any);
  },

  /**
   * 验证手掌类型
   */
  isValidHandType(type: string): type is 'left' | 'right' {
    return HAND_TYPES.includes(type as any);
  },

  /**
   * 验证语言
   */
  isValidLanguage(lang: string): lang is 'zh' | 'en' | 'ja' | 'es' {
    return SUPPORTED_LANGUAGES.includes(lang as any);
  },

  /**
   * 格式化处理时间
   */
  formatProcessingTime(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    } else {
      return `${(ms / 60000).toFixed(1)}min`;
    }
  },

  /**
   * 计算置信度等级
   */
  getConfidenceLevel(confidence: number): 'low' | 'medium' | 'high' {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'medium';
    return 'low';
  },

  /**
   * 生成唯一ID
   */
  generateId(): string {
    return `palm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * 验证出生日期
   */
  isValidBirthDate(date: string): boolean {
    const birthDate = new Date(date);
    const now = new Date();
    const hundredYearsAgo = new Date(now.getFullYear() - 100, now.getMonth(), now.getDate());
    
    return birthDate <= now && birthDate >= hundredYearsAgo;
  },

  /**
   * 计算年龄
   */
  calculateAge(birthDate: Date): number {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    
    return age;
  }
};

// 错误类型导出
export {
  PalmAnalysisError,
  ImageProcessingError,
  FeatureExtractionError,
  ReportGenerationError,
  AIServiceError
} from './types';

// 健康检查函数
export async function checkPalmHealth(config?: Partial<import('./config').PalmConfig>): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: Record<string, boolean>;
  timestamp: Date;
}> {
  try {
    const { createPalmEngine } = await import('./engine');
    const engine = createPalmEngine(config);
    const health = await engine.getHealthStatus();
    
    return {
      status: health.status as 'healthy' | 'degraded' | 'unhealthy',
      components: health.services,
      timestamp: health.timestamp
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      components: {},
      timestamp: new Date()
    };
  }
}

// 版本信息
export const VERSION_INFO = {
  version: PALM_VERSION,
  buildDate: new Date().toISOString(),
  features: [
    'Image Processing',
    'Feature Extraction', 
    'AI Report Generation',
    'Conversion Optimization',
    'Multi-language Support',
    'Caching System',
    'Metrics Collection',
    'Health Monitoring'
  ]
} as const;