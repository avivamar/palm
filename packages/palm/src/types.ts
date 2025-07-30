import { z } from 'zod';

// 用户信息验证模式
export const UserInfoSchema = z.object({
  birthDate: z.date(),
  birthTime: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']),
  location: z.string().optional(),
  language: z.enum(['zh', 'en', 'ja', 'es']).default('en'),
});

// 图像数据验证模式
export const ImageDataSchema = z.object({
  buffer: z.instanceof(Buffer),
  mimeType: z.string().regex(/^image\/(jpeg|jpg|png|webp)$/),
  size: z.number().max(10 * 1024 * 1024), // 10MB max
  width: z.number().min(300).max(4096),
  height: z.number().min(300).max(4096),
});

// 手掌线条验证模式
export const PalmLinesSchema = z.object({
  lifeLine: z.object({
    points: z.array(z.object({ x: z.number(), y: z.number() })),
    length: z.number(),
    depth: z.number().min(0).max(1),
    clarity: z.number().min(0).max(1),
  }),
  headLine: z.object({
    points: z.array(z.object({ x: z.number(), y: z.number() })),
    length: z.number(),
    depth: z.number().min(0).max(1),
    clarity: z.number().min(0).max(1),
  }),
  heartLine: z.object({
    points: z.array(z.object({ x: z.number(), y: z.number() })),
    length: z.number(),
    depth: z.number().min(0).max(1),
    clarity: z.number().min(0).max(1),
  }),
  fateLine: z.object({
    points: z.array(z.object({ x: z.number(), y: z.number() })),
    length: z.number(),
    depth: z.number().min(0).max(1),
    clarity: z.number().min(0).max(1),
  }).optional(),
});

// 手掌形状验证模式
export const PalmShapeSchema = z.object({
  type: z.enum(['square', 'rectangular', 'spatulate', 'conic', 'psychic']),
  width: z.number(),
  height: z.number(),
  ratio: z.number(),
  flexibility: z.number().min(0).max(1),
});

// 手指特征验证模式
export const FingerFeaturesSchema = z.object({
  thumb: z.object({
    length: z.number(),
    flexibility: z.number().min(0).max(1),
    tip: z.enum(['square', 'conic', 'spatulate']),
  }),
  index: z.object({
    length: z.number(),
    flexibility: z.number().min(0).max(1),
    tip: z.enum(['square', 'conic', 'spatulate']),
  }),
  middle: z.object({
    length: z.number(),
    flexibility: z.number().min(0).max(1),
    tip: z.enum(['square', 'conic', 'spatulate']),
  }),
  ring: z.object({
    length: z.number(),
    flexibility: z.number().min(0).max(1),
    tip: z.enum(['square', 'conic', 'spatulate']),
  }),
  pinky: z.object({
    length: z.number(),
    flexibility: z.number().min(0).max(1),
    tip: z.enum(['square', 'conic', 'spatulate']),
  }),
});

// 手掌特征验证模式
export const PalmFeaturesSchema = z.object({
  lines: PalmLinesSchema,
  shape: PalmShapeSchema,
  fingers: FingerFeaturesSchema,
  confidence: z.number().min(0).max(1),
  processingTime: z.number(),
});

// 报告元数据验证模式
export const ReportMetadataSchema = z.object({
  id: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  language: z.enum(['zh', 'en', 'ja', 'es']),
  version: z.string(),
  processingTime: z.number(),
});

// 简版报告验证模式
export const QuickReportSchema = z.object({
  personality: z.object({
    traits: z.array(z.string()),
    strengths: z.array(z.string()),
    challenges: z.array(z.string()),
    summary: z.string(),
  }),
  health: z.object({
    vitality: z.number().min(0).max(100),
    areas: z.array(z.string()),
    recommendations: z.array(z.string()),
    summary: z.string(),
  }),
  career: z.object({
    aptitudes: z.array(z.string()),
    opportunities: z.array(z.string()),
    challenges: z.array(z.string()),
    summary: z.string(),
  }),
  relationship: z.object({
    compatibility: z.array(z.string()),
    communication: z.array(z.string()),
    challenges: z.array(z.string()),
    summary: z.string(),
  }),
  fortune: z.object({
    financial: z.array(z.string()),
    opportunities: z.array(z.string()),
    timing: z.array(z.string()),
    summary: z.string(),
  }),
  conversionHints: z.object({
    highlightedDimensions: z.array(z.string()),
    personalizedMessage: z.string(),
    urgencyLevel: z.enum(['low', 'medium', 'high']),
    discount: z.number().min(0).max(100).optional(),
  }),
  metadata: ReportMetadataSchema,
});

// 完整版报告验证模式
export const FullReportSchema = QuickReportSchema.extend({
  detailedAnalysis: z.object({
    palmistry: z.string(),
    astrology: z.string(),
    numerology: z.string(),
    tarot: z.string(),
  }),
  recommendations: z.object({
    daily: z.array(z.string()),
    weekly: z.array(z.string()),
    monthly: z.array(z.string()),
    yearly: z.array(z.string()),
  }),
  futureInsights: z.object({
    nextMonth: z.string(),
    nextQuarter: z.string(),
    nextYear: z.string(),
    longTerm: z.string(),
  }),
  compatibility: z.object({
    romantic: z.array(z.string()),
    friendship: z.array(z.string()),
    business: z.array(z.string()),
    family: z.array(z.string()),
  }),
  dailyGuidance: z.array(z.object({
    date: z.date(),
    guidance: z.string(),
    luckyNumbers: z.array(z.number()),
    luckyColors: z.array(z.string()),
  })),
  monthlyForecast: z.array(z.object({
    month: z.number().min(1).max(12),
    year: z.number(),
    forecast: z.string(),
    opportunities: z.array(z.string()),
    challenges: z.array(z.string()),
  })),
  yearlyOutlook: z.object({
    year: z.number(),
    overview: z.string(),
    quarters: z.array(z.object({
      quarter: z.number().min(1).max(4),
      focus: z.string(),
      opportunities: z.array(z.string()),
    })),
  }),
});

// 分析结果验证模式
export const AnalysisResultSchema = z.object({
  features: PalmFeaturesSchema,
  quickReport: QuickReportSchema,
  fullReport: FullReportSchema.optional(),
  processingTime: z.number(),
  confidence: z.number().min(0).max(1),
});

// 健康状态验证模式
export const HealthStatusSchema = z.object({
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  services: z.object({
    imageProcessor: z.boolean(),
    featureExtractor: z.boolean(),
    aiCore: z.boolean(),
    cache: z.boolean(),
  }),
  performance: z.object({
    avgProcessingTime: z.number(),
    successRate: z.number().min(0).max(1),
    errorRate: z.number().min(0).max(1),
  }),
  timestamp: z.date(),
});

// 导出类型
export type UserInfo = z.infer<typeof UserInfoSchema>;
export type ImageData = z.infer<typeof ImageDataSchema>;
export type PalmLines = z.infer<typeof PalmLinesSchema>;
export type PalmShape = z.infer<typeof PalmShapeSchema>;
export type FingerFeatures = z.infer<typeof FingerFeaturesSchema>;
export type PalmFeatures = z.infer<typeof PalmFeaturesSchema>;
export type ReportMetadata = z.infer<typeof ReportMetadataSchema>;
export type QuickReport = z.infer<typeof QuickReportSchema>;
export type FullReport = z.infer<typeof FullReportSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type HealthStatus = z.infer<typeof HealthStatusSchema>;

// 转化相关类型
export interface ConversionHints {
  highlightedDimensions: string[];
  personalizedMessage: string;
  urgencyLevel: 'low' | 'medium' | 'high';
  discount?: number;
}

export interface ConversionStrategy {
  type: 'discount' | 'urgency' | 'social_proof' | 'personalized';
  message: string;
  discount?: number;
  validUntil?: Date;
}

export interface ConversionAction {
  type: 'view_report' | 'click_upgrade' | 'complete_payment' | 'abandon';
  timestamp: Date;
  metadata?: Record<string, any>;
}

// 缓存相关类型
export interface CacheKey {
  type: 'image_features' | 'report' | 'ai_response';
  hash: string;
  ttl: number;
}

export interface CacheEntry<T> {
  data: T;
  createdAt: Date;
  expiresAt: Date;
  hits: number;
}

// 错误类型
export class PalmAnalysisError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'PalmAnalysisError';
  }
}

export class ImageProcessingError extends PalmAnalysisError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'IMAGE_PROCESSING_ERROR', details);
    this.name = 'ImageProcessingError';
  }
}

export class FeatureExtractionError extends PalmAnalysisError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'FEATURE_EXTRACTION_ERROR', details);
    this.name = 'FeatureExtractionError';
  }
}

export class ReportGenerationError extends PalmAnalysisError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'REPORT_GENERATION_ERROR', details);
    this.name = 'ReportGenerationError';
  }
}

export class AIServiceError extends PalmAnalysisError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'AI_SERVICE_ERROR', details);
    this.name = 'AIServiceError';
  }
}

// Palm AI 分析相关类型
export interface MajorLineDetail {
  length?: string;
  depth?: string;
  direction?: string;
  branch?: string;
  island?: string;
  rootStyle?: string;
  curve?: string;
  end?: string;
  exists?: boolean;
  origin?: string;
  continuity?: string;
  interpretation?: string;
}

export interface PalmAnalysisInput {
  birthDate?: string;  // "1995-07-28"
  birthTime?: string;  // "14:30"
  abnormalZones?: { area: string; mark?: string }[];
  abnormalReflexPoints?: { point: string; feature?: string }[];
  majorLines?: {
    lifeLine?: MajorLineDetail;
    headLine?: MajorLineDetail;
    heartLine?: MajorLineDetail;
    fateLine?: MajorLineDetail;
  };
  lang?: "zh" | "en" | "ja";
}

export interface PalmAnalysisOutput {
  overallInsight: string;
  majorLines: {
    lifeLine?: MajorLineDetail;
    headLine?: MajorLineDetail;
    heartLine?: MajorLineDetail;
    fateLine?: MajorLineDetail;
  };
  details: Array<{
    type: 'zone' | 'reflex';
    name: string;
    description: string;
    suggestion: string;
  }>;
  lifestyleTips: string;
  lang: string;
}