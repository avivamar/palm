# Palm AI 核心功能包设计文档 - 最小化方案

## 🎯 商业价值驱动的设计原则

1. **AI First**：以 AI 分析为核心，其他功能围绕 AI 展开
2. **转化优先**：每个功能都要服务于商业转化
3. **性能至上**：60 秒简版报告是硬性要求
4. **可扩展性**：支持多模型、多语言、多维度分析

## 🏗️ 最小化架构

### 系统架构图

```mermaid
graph TB
    subgraph "用户交互层"
        A[图像上传] --> B[个人信息输入]
        B --> C[分析请求]
    end
    
    subgraph "@rolitt/palm 核心包"
        C --> D[PalmAnalysisEngine]
        D --> E[ImageProcessor]
        D --> F[FeatureExtractor]
        D --> G[ReportGenerator]
        
        E --> H[图像预处理]
        F --> I[特征识别]
        G --> J[简版报告]
        G --> K[完整版报告]
    end
    
    subgraph "AI 服务层"
        I --> L[@rolitt/ai-core]
        J --> L
        K --> L
        L --> M[OpenAI/Claude/Gemini]
    end
    
    subgraph "商业转化层"
        J --> N[转化引导]
        N --> O[@rolitt/payments]
        O --> K
    end
    
    subgraph "数据存储"
        P[PostgreSQL]
        Q[Redis Cache]
        R[图像存储]
    end
    
    D --> P
    G --> Q
    E --> R
    
    style D fill:#99ccff
    style L fill:#99ff99
    style N fill:#ffcc99
```

### 核心设计原则

1. **单一职责**：每个模块专注一个核心功能
2. **依赖注入**：可插拔的 AI 模型和存储后端
3. **异步优先**：所有耗时操作都异步处理
4. **缓存优化**：智能缓存策略提升性能

## 🔧 核心组件设计

### 1. PalmAnalysisEngine - 核心分析引擎

**商业价值**：统一的分析入口，确保一致性和可维护性

```typescript
class PalmAnalysisEngine {
  // 核心分析流程
  async analyzeComplete(
    imageData: ImageData, 
    userInfo: UserInfo
  ): Promise<AnalysisResult>;
  
  // 快速简版分析（60秒内完成）
  async analyzeQuick(
    imageData: ImageData, 
    userInfo: UserInfo
  ): Promise<QuickAnalysisResult>;
  
  // 健康检查
  async healthCheck(): Promise<HealthStatus>;
}
```

### 2. ImageProcessor - 图像处理器

**商业价值**：确保图像质量，提升分析准确性

```typescript
class ImageProcessor {
  // 图像预处理
  async preprocess(image: Buffer): Promise<ProcessedImage>;
  
  // 质量检测
  async validateQuality(image: ProcessedImage): Promise<QualityReport>;
  
  // 特征增强
  async enhanceFeatures(image: ProcessedImage): Promise<EnhancedImage>;
}
```

### 3. FeatureExtractor - 特征提取器

**商业价值**：准确识别手掌特征，是 AI 分析的基础

```typescript
class FeatureExtractor {
  // 提取手掌线条特征
  async extractPalmLines(image: EnhancedImage): Promise<PalmLines>;
  
  // 提取手掌形状特征
  async extractPalmShape(image: EnhancedImage): Promise<PalmShape>;
  
  // 提取手指特征
  async extractFingerFeatures(image: EnhancedImage): Promise<FingerFeatures>;
}
```

### 4. ReportGenerator - 报告生成器

**商业价值**：核心商业转化点，简版引导完整版购买

```typescript
class ReportGenerator {
  // 生成简版报告（免费，引导付费）
  async generateQuickReport(
    features: PalmFeatures, 
    userInfo: UserInfo
  ): Promise<QuickReport>;
  
  // 生成完整版报告（付费）
  async generateFullReport(
    features: PalmFeatures, 
    userInfo: UserInfo
  ): Promise<FullReport>;
  
  // 生成转化引导内容
  async generateConversionHints(
    quickReport: QuickReport
  ): Promise<ConversionHints>;
}
```

## 📊 数据模型设计

### 核心数据结构

```typescript
// 用户信息
interface UserInfo {
  birthDate: Date;
  birthTime?: string;
  gender: 'male' | 'female' | 'other';
  location?: string;
  language: 'zh' | 'en' | 'ja' | 'es';
}

// 手掌特征
interface PalmFeatures {
  lines: PalmLines;
  shape: PalmShape;
  fingers: FingerFeatures;
  mounts: PalmMounts;
  confidence: number;
}

// 简版报告
interface QuickReport {
  personality: PersonalityInsight;
  health: HealthInsight;
  career: CareerInsight;
  relationship: RelationshipInsight;
  fortune: FortuneInsight;
  conversionHints: ConversionHints;
  metadata: ReportMetadata;
}

// 完整版报告
interface FullReport extends QuickReport {
  detailedAnalysis: DetailedAnalysis;
  recommendations: Recommendations;
  futureInsights: FutureInsights;
  compatibility: CompatibilityAnalysis;
  dailyGuidance: DailyGuidance;
  monthlyForecast: MonthlyForecast;
  yearlyOutlook: YearlyOutlook;
}
```

## 🚀 性能优化策略

### 1. 分层缓存架构

```typescript
// L1: 内存缓存（热数据）
// L2: Redis 缓存（温数据）
// L3: 数据库（冷数据）

class CacheStrategy {
  // 图像特征缓存（避免重复处理）
  async cacheImageFeatures(imageHash: string, features: PalmFeatures): Promise<void>;
  
  // 报告缓存（相同特征+用户信息）
  async cacheReport(cacheKey: string, report: Report): Promise<void>;
  
  // AI 响应缓存（相同提示词）
  async cacheAIResponse(promptHash: string, response: AIResponse): Promise<void>;
}
```

### 2. 异步处理流水线

```typescript
// 流水线处理，提升并发性能
class ProcessingPipeline {
  async processImage(image: Buffer): Promise<ProcessedImage> {
    // 并行处理：预处理 + 质量检测
    const [processed, quality] = await Promise.all([
      this.imageProcessor.preprocess(image),
      this.imageProcessor.validateQuality(image)
    ]);
    
    return { processed, quality };
  }
  
  async extractFeatures(image: ProcessedImage): Promise<PalmFeatures> {
    // 并行特征提取
    const [lines, shape, fingers] = await Promise.all([
      this.featureExtractor.extractPalmLines(image),
      this.featureExtractor.extractPalmShape(image),
      this.featureExtractor.extractFingerFeatures(image)
    ]);
    
    return { lines, shape, fingers };
  }
}
```

## 🎯 商业转化设计

### 1. 智能转化引导

```typescript
class ConversionOptimizer {
  // 基于用户行为的个性化推荐
  async generatePersonalizedHints(
    userBehavior: UserBehavior,
    quickReport: QuickReport
  ): Promise<ConversionHints>;
  
  // A/B 测试不同的转化策略
  async getConversionStrategy(userId: string): Promise<ConversionStrategy>;
  
  // 实时转化率监控
  async trackConversion(userId: string, action: ConversionAction): Promise<void>;
}
```

### 2. 报告预览策略

```typescript
// 简版报告展示策略
interface QuickReportDisplay {
  // 完整展示的维度（吸引用户）
  fullDimensions: ['personality', 'health'];
  
  // 部分展示的维度（引导付费）
  previewDimensions: ['career', 'relationship', 'fortune'];
  
  // 完全隐藏的维度（付费解锁）
  hiddenDimensions: ['compatibility', 'futureInsights', 'dailyGuidance'];
}
```

## 🔒 安全与隐私设计

### 1. 数据保护策略

```typescript
class DataProtection {
  // 图像加密存储
  async encryptAndStore(image: Buffer, userId: string): Promise<string>;
  
  // 个人信息匿名化
  async anonymizeUserInfo(userInfo: UserInfo): Promise<AnonymizedUserInfo>;
  
  // 自动数据清理
  async scheduleDataCleanup(userId: string, retentionDays: number): Promise<void>;
}
```

### 2. 访问控制

```typescript
class AccessControl {
  // 报告访问权限验证
  async verifyReportAccess(userId: string, reportId: string): Promise<boolean>;
  
  // 付费状态验证
  async verifyPaymentStatus(userId: string, reportType: ReportType): Promise<boolean>;
  
  // API 调用限流
  async checkRateLimit(userId: string, action: string): Promise<boolean>;
}
```

## 📈 监控与分析设计

### 1. 业务指标监控

```typescript
class BusinessMetrics {
  // 转化漏斗分析
  async trackConversionFunnel(userId: string, step: ConversionStep): Promise<void>;
  
  // 用户满意度追踪
  async trackUserSatisfaction(userId: string, rating: number): Promise<void>;
  
  // 报告准确性评估
  async trackReportAccuracy(reportId: string, feedback: UserFeedback): Promise<void>;
}
```

### 2. 技术性能监控

```typescript
class TechnicalMetrics {
  // AI 模型性能监控
  async trackAIPerformance(model: string, responseTime: number): Promise<void>;
  
  // 图像处理性能监控
  async trackImageProcessing(processingTime: number, imageSize: number): Promise<void>;
  
  // 缓存命中率监控
  async trackCacheHitRate(cacheType: string, hitRate: number): Promise<void>;
}
```

## 🔄 集成策略

### 与现有包的集成

```typescript
// 与 @rolitt/ai-core 集成
import { AIManager } from '@rolitt/ai-core';

// 与 @rolitt/payments 集成
import { PaymentProcessor } from '@rolitt/payments';

// 与 @rolitt/image-upload 集成
import { ImageUploader } from '@rolitt/image-upload';

class PalmIntegration {
  constructor(
    private aiManager: AIManager,
    private paymentProcessor: PaymentProcessor,
    private imageUploader: ImageUploader
  ) {}
  
  async processFullWorkflow(
    imageFile: File,
    userInfo: UserInfo
  ): Promise<WorkflowResult> {
    // 1. 上传图像
    const imageUrl = await this.imageUploader.upload(imageFile);
    
    // 2. 分析图像
    const analysis = await this.analyzeImage(imageUrl, userInfo);
    
    // 3. 生成简版报告
    const quickReport = await this.generateQuickReport(analysis);
    
    // 4. 如果用户付费，生成完整版报告
    if (await this.paymentProcessor.verifyPayment(userInfo.userId)) {
      const fullReport = await this.generateFullReport(analysis);
      return { quickReport, fullReport };
    }
    
    return { quickReport };
  }
}
```

这个最小化设计确保我们专注于核心商业价值：**快速准确的手掌分析 + 高效的商业转化**。