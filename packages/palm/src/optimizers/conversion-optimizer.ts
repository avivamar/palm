import { AILogger, type Logger } from '@rolitt/ai-core';
import { PalmConfig } from '../config';
import { 
  QuickReport, 
  UserInfo, 
  ConversionHints, 
  ConversionStrategy,
  ConversionAction 
} from '../types';

/**
 * 转化优化器 - 智能商业转化策略
 * 
 * 核心功能：
 * - 基于用户行为的个性化转化策略
 * - A/B 测试支持
 * - 实时转化率监控
 * - 智能推荐算法
 */
export class ConversionOptimizer {
  private logger: Logger;

  constructor(private config: PalmConfig, logger?: Logger) {
    this.logger = logger || new AILogger();
  }

  /**
   * 优化转化策略
   * 基于简版报告和用户信息生成个性化转化提示
   */
  async optimize(
    quickReport: QuickReport,
    userInfo: UserInfo,
    userId: string
  ): Promise<ConversionHints> {
    try {
      this.logger.info('Starting conversion optimization', { userId });

      // 1. 分析用户特征
      const userProfile = await this.analyzeUserProfile(userInfo, userId);
      
      // 2. 计算报告质量分数
      const reportQuality = this.calculateReportQuality(quickReport);
      
      // 3. 获取转化策略
      const strategy = await this.selectConversionStrategy(userProfile, reportQuality);
      
      // 4. 生成个性化提示
      const conversionHints = await this.generateConversionHints(
        quickReport,
        userProfile,
        strategy
      );

      this.logger.info('Conversion optimization completed', { 
        userId, 
        strategy: strategy.type,
        urgencyLevel: conversionHints.urgencyLevel
      });

      return conversionHints;

    } catch (error) {
      this.logger.error('Conversion optimization failed', { 
        userId, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      // 返回默认转化提示
      return this.getDefaultConversionHints();
    }
  }

  /**
   * 记录转化行为
   */
  async trackConversion(
    userId: string, 
    action: ConversionAction
  ): Promise<void> {
    try {
      this.logger.info('Tracking conversion action', { 
        userId, 
        action: action.type 
      });

      // 记录用户行为数据
      // 在实际项目中，这里会写入数据库或分析平台
      
    } catch (error) {
      this.logger.error('Failed to track conversion', { 
        userId, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * 获取转化策略
   */
  async getConversionStrategy(userId: string): Promise<ConversionStrategy> {
    try {
      // A/B 测试逻辑
      if (this.config.conversion.abTesting.enabled) {
        return this.selectABTestVariant(userId);
      }
      
      // 默认策略
      return this.getDefaultStrategy();
      
    } catch (error) {
      this.logger.error('Failed to get conversion strategy', { 
        userId, 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return this.getDefaultStrategy();
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      // 检查配置
      if (!this.config.conversion.enabled) {
        return false;
      }
      
      // 检查策略可用性
      const strategy = this.getDefaultStrategy();
      if (!strategy) {
        return false;
      }
      
      return true;
      
    } catch (error) {
      this.logger.error('Conversion optimizer health check failed', { error });
      return false;
    }
  }

  // 私有方法

  /**
   * 分析用户画像
   */
  private async analyzeUserProfile(userInfo: UserInfo, userId: string) {
    return {
      language: userInfo.language,
      hasLocation: !!userInfo.location,
      hasBirthTime: !!userInfo.birthTime,
      engagementLevel: 'medium' as 'low' | 'medium' | 'high',
      userId
    };
  }

  /**
   * 计算报告质量分数
   */
  private calculateReportQuality(quickReport: QuickReport): number {
    let score = 0;
    let factors = 0;

    // 基于处理时间评分
    if (quickReport.metadata.processingTime < 30000) { // 30秒内
      score += 0.9;
    } else if (quickReport.metadata.processingTime < 45000) { // 45秒内
      score += 0.7;
    } else {
      score += 0.5;
    }
    factors++;

    // 基于内容丰富度评分
    const contentRichness = this.calculateContentRichness(quickReport);
    score += contentRichness;
    factors++;

    return factors > 0 ? score / factors : 0.5;
  }

  /**
   * 计算内容丰富度
   */
  private calculateContentRichness(quickReport: QuickReport): number {
    let score = 0;
    
    // 检查各个维度的内容长度
    if (quickReport.personality.summary.length > 100) score += 0.2;
    if (quickReport.health.summary.length > 100) score += 0.2;
    if (quickReport.career.summary.length > 100) score += 0.2;
    if (quickReport.relationship.summary.length > 100) score += 0.2;
    if (quickReport.fortune.summary.length > 100) score += 0.2;

    return score;
  }

  /**
   * 选择转化策略
   */
  private async selectConversionStrategy(
    userProfile: any,
    reportQuality: number
  ): Promise<ConversionStrategy> {
    
    // 高质量报告 + 高参与度用户 -> 个性化策略
    if (reportQuality > 0.8 && userProfile.engagementLevel === 'high') {
      return {
        type: 'personalized',
        message: '您的手掌特征非常独特，完整分析将为您揭示更多深层洞察！',
        discount: 25,
        validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时
      };
    }
    
    // 中等质量 -> 折扣策略
    if (reportQuality > 0.6) {
      return {
        type: 'discount',
        message: '限时特惠！立即解锁完整版报告，获得专业的人生指导！',
        discount: 20,
        validUntil: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12小时
      };
    }
    
    // 默认紧迫感策略
    return {
      type: 'urgency',
      message: '今日限定！错过将等待下次机会，立即解锁您的命运密码！',
      discount: 15,
      validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6小时
    };
  }

  /**
   * 生成转化提示
   */
  private async generateConversionHints(
    quickReport: QuickReport,
    userProfile: any,
    strategy: ConversionStrategy
  ): Promise<ConversionHints> {
    
    // 基于报告内容突出最吸引人的维度
    const highlightedDimensions = this.selectHighlightedDimensions(quickReport);
    
    // 确定紧急程度
    const urgencyLevel = this.determineUrgencyLevel(strategy, userProfile);
    
    return {
      highlightedDimensions,
      personalizedMessage: strategy.message,
      urgencyLevel,
      discount: strategy.discount
    };
  }

  /**
   * 选择突出显示的维度
   */
  private selectHighlightedDimensions(quickReport: QuickReport): string[] {
    // 基于内容长度和质量选择最佳维度
    const dimensionScores = [
      { name: 'personality', score: quickReport.personality.summary.length },
      { name: 'health', score: quickReport.health.summary.length },
      { name: 'career', score: quickReport.career.summary.length },
      { name: 'relationship', score: quickReport.relationship.summary.length },
      { name: 'fortune', score: quickReport.fortune.summary.length }
    ];
    
    // 选择得分最高的2-3个维度
    const sortedDimensions = dimensionScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(d => d.name);
    
    return sortedDimensions;
  }

  /**
   * 确定紧急程度
   */
  private determineUrgencyLevel(
    strategy: ConversionStrategy, 
    userProfile: any
  ): 'low' | 'medium' | 'high' {
    
    if (strategy.type === 'personalized' && userProfile.engagementLevel === 'high') {
      return 'high';
    }
    
    if (strategy.type === 'urgency') {
      return 'high';
    }
    
    if (strategy.type === 'discount') {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * A/B 测试变体选择
   */
  private selectABTestVariant(userId: string): ConversionStrategy {
    const variants = this.config.conversion.abTesting.variants;
    const trafficSplit = this.config.conversion.abTesting.trafficSplit;
    
    // 基于用户ID的哈希值分配变体
    const hash = this.hashCode(userId);
    const bucket = Math.abs(hash) % 100;
    
    let cumulative = 0;
    for (let i = 0; i < variants.length; i++) {
      cumulative += (trafficSplit[i] || 0) * 100;
      if (bucket < cumulative) {
        return this.getStrategyForVariant(variants[i] || 'control');
      }
    }
    
    return this.getDefaultStrategy();
  }

  /**
   * 获取变体对应的策略
   */
  private getStrategyForVariant(variant: string): ConversionStrategy {
    switch (variant) {
      case 'variant_a':
        return {
          type: 'discount',
          message: '🎯 特别优惠！完整版报告现在只需 $14.99！',
          discount: 25
        };
      case 'variant_b':
        return {
          type: 'urgency',
          message: '⏰ 限时48小时！立即解锁您的完整命运报告！',
          discount: 20
        };
      default:
        return this.getDefaultStrategy();
    }
  }

  /**
   * 获取默认策略
   */
  private getDefaultStrategy(): ConversionStrategy {
    return {
      type: 'personalized',
      message: '解锁完整版报告，获得更深入的个人洞察和专业指导！',
      discount: 15
    };
  }

  /**
   * 获取默认转化提示
   */
  private getDefaultConversionHints(): ConversionHints {
    return {
      highlightedDimensions: ['personality', 'career'],
      personalizedMessage: '解锁完整版报告，获得更深入的个人洞察！',
      urgencyLevel: 'medium',
      discount: 15
    };
  }

  /**
   * 计算字符串哈希值
   */
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return hash;
  }
}