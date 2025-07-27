import { AIManager, AILogger } from '@rolitt/ai-core';
import type {
  ConversionHints,
  FullReport,
  ImageData,
  PalmFeatures,
  QuickReport,
  UserInfo,
} from './types';
import { PalmAnalysisError } from './types';
import type { PalmConfig } from './config';
import { getConfig } from './config';
import { ImageProcessor } from './processors/image-processor';
import { FeatureExtractor } from './processors/feature-extractor';
import { ReportGenerator } from './generators/report-generator';
import { ConversionOptimizer } from './optimizers/conversion-optimizer';
import { CacheManager } from './utils/cache-manager';
import { MetricsCollector } from './utils/metrics-collector';

/**
 * Palm AI 核心分析引擎
 * 统一管理手掌图像分析、特征提取、报告生成和商业转化
 */
export class PalmAnalysisEngine {
  private config: PalmConfig;
  private logger: AILogger;
  private aiManager: AIManager;
  private imageProcessor: ImageProcessor;
  private featureExtractor: FeatureExtractor;
  private reportGenerator: ReportGenerator;
  private conversionOptimizer: ConversionOptimizer;
  private cacheManager: CacheManager;
  private metricsCollector: MetricsCollector;

  constructor(config?: Partial<PalmConfig>) {
    this.config = getConfig(config);
    this.logger = AILogger.getInstance();
    
    // 初始化核心组件
    this.aiManager = new AIManager({
      primaryProvider: this.config.aiServices.primaryProvider,
      fallbackProviders: this.config.aiServices.fallbackProviders,
      timeout: this.config.aiServices.timeout,
    });
    
    this.imageProcessor = new ImageProcessor(this.config, this.logger);
    this.featureExtractor = new FeatureExtractor(this.logger);
    this.reportGenerator = new ReportGenerator(this.config, this.aiManager, this.logger);
    this.conversionOptimizer = new ConversionOptimizer(this.config, this.logger);
    this.cacheManager = new CacheManager(this.config, this.logger);
    this.metricsCollector = new MetricsCollector(this.config, this.logger);
  }

  /**
   * 分析手掌图像并生成简版报告
   * 核心业务方法，必须在60秒内完成
   */
  async analyzeQuick(
    imageData: ImageData,
    userInfo: UserInfo,
    userId: string
  ): Promise<{ report: QuickReport; conversionHints: ConversionHints }> {
    const startTime = Date.now();
    const analysisId = `quick_${userId}_${Date.now()}`;
    
    try {
      this.logger.info('Starting quick palm analysis', { analysisId, userId });
      
      // 设置超时保护
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new PalmAnalysisError(
            'Quick analysis timeout exceeded',
            'TIMEOUT_ERROR',
            { timeout: this.config.performance.quickReportTimeout }
          ));
        }, this.config.performance.quickReportTimeout);
      });

      // 执行分析流程
      const analysisPromise = this._performQuickAnalysis(imageData, userInfo, userId, analysisId);
      
      // 竞争执行：分析 vs 超时
      const result = await Promise.race([analysisPromise, timeoutPromise]);
      
      const processingTime = Date.now() - startTime;
      this.logger.info('Quick analysis completed', { 
        analysisId, 
        processingTime,
        success: true 
      });
      
      // 收集指标
      this.metricsCollector.recordAnalysis({
        type: 'quick',
        processingTime,
        success: true,
        userId,
        timestamp: new Date(),
      });
      
      return result;
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error('Quick analysis failed', { 
        analysisId, 
        processingTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // 收集错误指标
      this.metricsCollector.recordAnalysis({
        type: 'quick',
        processingTime,
        success: false,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      });
      
      throw error;
    }
  }

  /**
   * 生成完整版报告
   * 基于已有的简版报告数据，生成详细分析
   */
  async analyzeComplete(
    quickReport: QuickReport,
    userInfo: UserInfo,
    userId: string
  ): Promise<FullReport> {
    const startTime = Date.now();
    const analysisId = `full_${userId}_${Date.now()}`;
    
    try {
      this.logger.info('Starting full palm analysis', { analysisId, userId });
      
      // 检查缓存
      const cacheKey = this.cacheManager.generateKey('full_report', {
        quickReportId: quickReport.metadata.id,
        userId,
      });
      
      const cachedReport = await this.cacheManager.get<FullReport>(cacheKey);
      if (cachedReport) {
        this.logger.info('Full report served from cache', { analysisId });
        return cachedReport;
      }
      
      // 生成完整报告
      const fullReport = await this.reportGenerator.generateFullReport(
        quickReport,
        userInfo,
        analysisId
      );
      
      // 缓存结果
      await this.cacheManager.set(
        cacheKey,
        fullReport,
        this.config.cache.ttl.fullReport
      );
      
      const processingTime = Date.now() - startTime;
      this.logger.info('Full analysis completed', { 
        analysisId, 
        processingTime 
      });
      
      // 收集指标
      this.metricsCollector.recordAnalysis({
        type: 'full',
        processingTime,
        success: true,
        userId,
        timestamp: new Date(),
      });
      
      return fullReport;
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error('Full analysis failed', { 
        analysisId, 
        processingTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  /**
   * 获取系统健康状态
   */
  async getHealthStatus() {
    try {
      const [
        imageProcessorHealth,
        featureExtractorHealth,
        aiCoreHealth,
        cacheHealth
      ] = await Promise.all([
        this.imageProcessor.healthCheck(),
        this.featureExtractor.healthCheck(),
        this.aiManager.getAllProvidersHealth().then(health => Object.values(health).every(Boolean)),
        this.cacheManager.healthCheck(),
      ]);

      const allHealthy = [
        imageProcessorHealth,
        featureExtractorHealth,
        aiCoreHealth,
        cacheHealth
      ].every(status => status);

      return {
        status: allHealthy ? 'healthy' : 'degraded',
        services: {
          imageProcessor: imageProcessorHealth,
          featureExtractor: featureExtractorHealth,
          aiCore: aiCoreHealth,
          cache: cacheHealth,
        },
        performance: await this.metricsCollector.getPerformanceMetrics(),
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Health check failed', { error });
      return {
        status: 'unhealthy' as const,
        services: {
          imageProcessor: false,
          featureExtractor: false,
          aiCore: false,
          cache: false,
        },
        performance: {
          avgProcessingTime: 0,
          successRate: 0,
          errorRate: 1,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * 执行快速分析的内部方法
   */
  private async _performQuickAnalysis(
    imageData: ImageData,
    userInfo: UserInfo,
    userId: string,
    analysisId: string
  ): Promise<{ report: QuickReport; conversionHints: ConversionHints }> {
    
    // 1. 检查图像特征缓存
    const imageCacheKey = this.cacheManager.generateKey('image_features', {
      imageHash: await this.imageProcessor.calculateHash(imageData.buffer),
    });
    
    let palmFeatures = await this.cacheManager.get<PalmFeatures>(imageCacheKey);
    
    if (!palmFeatures) {
      // 2. 处理图像
      const processedImage = await this.imageProcessor.process(imageData);
      
      // 3. 提取特征
      // 将 ProcessedImage 转换为 ImageData 格式
      const imageDataForExtraction: ImageData = {
        buffer: processedImage.buffer,
        mimeType: 'image/jpeg', // 处理后的图像都是 JPEG 格式
        size: processedImage.metadata.processedSize,
        width: processedImage.width,
        height: processedImage.height,
      };
      
      palmFeatures = await this.featureExtractor.extract(imageDataForExtraction);
      
      // 缓存特征
      await this.cacheManager.set(
        imageCacheKey,
        palmFeatures,
        this.config.cache.ttl.imageFeatures
      );
    }
    
    // 4. 生成简版报告
    const quickReport = await this.reportGenerator.generateQuickReport(
      palmFeatures,
      userInfo,
      analysisId
    );
    
    // 5. 优化转化策略
    const conversionHints = await this.conversionOptimizer.optimize(
      quickReport,
      userInfo,
      userId
    );
    
    return { report: quickReport, conversionHints };
  }

  /**
   * 清理资源
   */
  async dispose(): Promise<void> {
    try {
      await Promise.all([
        this.cacheManager.dispose(),
        this.metricsCollector.dispose(),
      ]);
      this.logger.info('PalmAnalysisEngine disposed successfully');
    } catch (error) {
      this.logger.error('Error disposing PalmAnalysisEngine', { error });
    }
  }
}

/**
 * 创建 Palm 分析引擎实例
 */
export function createPalmEngine(config?: Partial<PalmConfig>): PalmAnalysisEngine {
  return new PalmAnalysisEngine(config);
}

/**
 * 默认导出
 */
export default PalmAnalysisEngine;