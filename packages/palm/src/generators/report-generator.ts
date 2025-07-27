import { AIManager, AILogger } from '@rolitt/ai-core';
import { type Logger } from '@rolitt/ai-core';
import { PalmConfig } from '../config';
import { 
  PalmFeatures, 
  UserInfo, 
  QuickReport, 
  FullReport, 
  ConversionHints,
  ReportGenerationError 
} from '../types';

/**
 * 报告生成器 - 基于手掌特征生成个性化报告
 * 
 * 核心功能：
 * - 60秒内生成简版报告（商业价值优先）
 * - 生成完整版详细报告
 * - 个性化内容定制
 * - 商业转化优化
 * - 多语言支持
 */
export class ReportGenerator {
  private aiManager: AIManager;
  private logger: Logger;

  constructor(private config: PalmConfig, aiManager?: AIManager, logger?: Logger) {
    this.aiManager = aiManager || new AIManager(config.aiServices);
    this.logger = logger || AILogger.getInstance();
  }

  /**
   * 生成简版报告（60秒内完成）
   */
  async generateQuickReport(
    features: PalmFeatures,
    userInfo: UserInfo,
    analysisId: string
  ): Promise<QuickReport> {
    try {
      const startTime = Date.now();
      this.logger.info('Starting quick report generation', { analysisId });

      // 并行生成各个维度的分析
      const [personality, health, career, relationship, fortune] = await Promise.all([
        this.generatePersonalityAnalysis(features, userInfo),
        this.generateHealthAnalysis(features, userInfo),
        this.generateCareerAnalysis(features, userInfo),
        this.generateRelationshipAnalysis(features, userInfo),
        this.generateFortuneAnalysis(features, userInfo)
      ]);

      // 生成转化提示
      const conversionHints = this.generateConversionHints(features, userInfo);

      const processingTime = Date.now() - startTime;

      const report: QuickReport = {
        personality,
        health,
        career,
        relationship,
        fortune,
        conversionHints,
        metadata: {
          id: analysisId,
          userId: analysisId.split('_')[1] || 'unknown',
          createdAt: new Date(),
          version: '1.0.0',
          processingTime,
          language: userInfo.language
        }
      };

      this.logger.info('Quick report generation completed', { 
        analysisId, 
        processingTime 
      });

      return report;
    } catch (error) {
      this.logger.error('Quick report generation failed', { 
        analysisId, 
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw new ReportGenerationError(
        `简版报告生成失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 生成完整版报告
   */
  async generateFullReport(
    quickReport: QuickReport,
    userInfo: UserInfo,
    analysisId: string
  ): Promise<FullReport> {
    try {
      const startTime = Date.now();
      this.logger.info('Starting full report generation', { analysisId });

      // 基于简版报告扩展，使用虚拟特征数据
      const virtualFeatures = this.extractFeaturesFromReport(quickReport);
      
      const [detailedAnalysis, recommendations, futureInsights, compatibility, dailyGuidance, monthlyForecast, yearlyOutlook] = await Promise.all([
        this.generateDetailedAnalysis(virtualFeatures, userInfo),
        this.generateRecommendations(virtualFeatures, userInfo),
        this.generateFutureInsights(virtualFeatures, userInfo),
        this.generateCompatibilityAnalysis(virtualFeatures, userInfo),
        this.generateDailyGuidance(virtualFeatures, userInfo),
        this.generateMonthlyForecast(virtualFeatures, userInfo),
        this.generateYearlyOutlook(virtualFeatures, userInfo)
      ]);

      const processingTime = Date.now() - startTime;

      const fullReport: FullReport = {
        ...quickReport,
        detailedAnalysis,
        recommendations,
        futureInsights,
        compatibility,
        dailyGuidance,
        monthlyForecast,
        yearlyOutlook
      };

      this.logger.info('Full report generation completed', { 
        analysisId, 
        processingTime 
      });

      return fullReport;
    } catch (error) {
      this.logger.error('Full report generation failed', { 
        analysisId, 
        error: error instanceof Error ? error.message : String(error)
      });
      
      throw new ReportGenerationError(
        `完整版报告生成失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 生成个性分析
   */
  private async generatePersonalityAnalysis(
    features: PalmFeatures,
    userInfo: UserInfo
  ): Promise<{ traits: string[]; strengths: string[]; challenges: string[]; summary: string }> {
    const prompt = this.buildPersonalityPrompt(features, userInfo);
    
    const response = await this.aiManager.generateText(prompt, undefined, {
      maxTokens: this.config.aiServices.maxTokens || 500,
      temperature: this.config.aiServices.temperature || 0.7,
      userId: `user_${Date.now()}`
    });

    return this.parsePersonalityResponse(response);
  }

  /**
   * 生成健康分析
   */
  private async generateHealthAnalysis(
    features: PalmFeatures,
    userInfo: UserInfo
  ): Promise<{ vitality: number; areas: string[]; recommendations: string[]; summary: string }> {
    const prompt = this.buildHealthPrompt(features, userInfo);
    
    const response = await this.aiManager.generateText(prompt, undefined, {
      maxTokens: this.config.aiServices.maxTokens || 400,
      temperature: this.config.aiServices.temperature || 0.6,
      userId: `user_${Date.now()}`
    });

    return this.parseHealthResponse(response);
  }

  /**
   * 生成事业分析
   */
  private async generateCareerAnalysis(
    features: PalmFeatures,
    userInfo: UserInfo
  ): Promise<{ aptitudes: string[]; opportunities: string[]; challenges: string[]; summary: string }> {
    const prompt = this.buildCareerPrompt(features, userInfo);
    
    const response = await this.aiManager.generateText(prompt, undefined, {
      maxTokens: this.config.aiServices.maxTokens || 450,
      temperature: this.config.aiServices.temperature || 0.7,
      userId: `user_${Date.now()}`
    });

    return this.parseCareerResponse(response);
  }

  /**
   * 生成感情分析
   */
  private async generateRelationshipAnalysis(
    features: PalmFeatures,
    userInfo: UserInfo
  ): Promise<{ compatibility: string[]; communication: string[]; challenges: string[]; summary: string }> {
    const prompt = this.buildRelationshipPrompt(features, userInfo);
    
    const response = await this.aiManager.generateText(prompt, undefined, {
      maxTokens: 400,
      temperature: 0.8,
      userId: `user_${Date.now()}`
    });

    return this.parseRelationshipResponse(response);
  }

  /**
   * 生成财运分析
   */
  private async generateFortuneAnalysis(
    features: PalmFeatures,
    userInfo: UserInfo
  ): Promise<{ financial: string[]; opportunities: string[]; timing: string[]; summary: string }> {
    const prompt = this.buildFortunePrompt(features, userInfo);
    
    const response = await this.aiManager.generateText(prompt, undefined, {
      maxTokens: 400,
      temperature: 0.7,
      userId: `user_${Date.now()}`
    });

    return this.parseFortuneResponse(response);
  }

  /**
   * 生成转化提示
   */
  private generateConversionHints(
    features: PalmFeatures,
    userInfo: UserInfo
  ): ConversionHints {
    // 基于特征置信度和用户信息生成个性化转化策略
    const confidence = features.confidence;
    const highlightedDimensions = [];
    
    // 根据手掌特征突出不同维度
    if (features.lines.lifeLine.clarity > 0.7) {
      highlightedDimensions.push('health');
    }
    if (features.lines.heartLine.clarity > 0.7) {
      highlightedDimensions.push('relationship');
    }
    if (features.lines.headLine.clarity > 0.7) {
      highlightedDimensions.push('career');
    }

    // 生成个性化消息
    const personalizedMessage = this.generatePersonalizedMessage(features, userInfo);
    
    // 确定紧急程度
    const urgencyLevel = confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low';
    
    // 计算折扣
    const discount = urgencyLevel === 'high' ? 20 : urgencyLevel === 'medium' ? 15 : 10;

    return {
      highlightedDimensions,
      personalizedMessage,
      urgencyLevel,
      discount
    };
  }

  /**
   * 从简版报告中提取虚拟特征数据
   */
  private extractFeaturesFromReport(quickReport: QuickReport): PalmFeatures {
    // 基于报告内容创建虚拟特征数据
    return {
      lines: {
        lifeLine: {
          points: [],
          length: quickReport.health.vitality / 10,
          depth: Math.random() * 0.8 + 0.2,
          clarity: Math.random() * 0.8 + 0.2,
        },
        headLine: {
          points: [],
          length: quickReport.career.aptitudes.length * 20,
          depth: Math.random() * 0.8 + 0.2,
          clarity: Math.random() * 0.8 + 0.2,
        },
        heartLine: {
          points: [],
          length: quickReport.relationship.compatibility.length * 15,
          depth: Math.random() * 0.8 + 0.2,
          clarity: Math.random() * 0.8 + 0.2,
        },
        fateLine: {
          points: [],
          length: quickReport.fortune.financial.length * 10,
          depth: Math.random() * 0.8 + 0.2,
          clarity: Math.random() * 0.8 + 0.2,
        },
      },
      shape: {
        type: 'square',
        width: 100,
        height: 120,
        ratio: 100 / 120,
        flexibility: Math.random() * 0.8 + 0.2,
      },
      fingers: {
        thumb: {
          length: 50,
          flexibility: Math.random() * 0.8 + 0.2,
          tip: 'square',
        },
        index: {
          length: 60,
          flexibility: Math.random() * 0.8 + 0.2,
          tip: 'conic',
        },
        middle: {
          length: 70,
          flexibility: Math.random() * 0.8 + 0.2,
          tip: 'square',
        },
        ring: {
          length: 65,
          flexibility: Math.random() * 0.8 + 0.2,
          tip: 'conic',
        },
        pinky: {
          length: 45,
          flexibility: Math.random() * 0.8 + 0.2,
          tip: 'spatulate',
        },
      },
      confidence: 0.8,
      processingTime: quickReport.metadata.processingTime,
    };
  }

  /**
   * 生成详细分析
   */
  private async generateDetailedAnalysis(
    _features: PalmFeatures,
    _userInfo: UserInfo
  ): Promise<{ palmistry: string; astrology: string; numerology: string; tarot: string }> {
    // 简化实现 - 实际需要更复杂的分析逻辑
    return {
      palmistry: '基于您的手掌线条和形状，显示出独特的个性特征...',
      astrology: '结合您的出生信息，星象显示...',
      numerology: '您的生命数字揭示了深层的命运密码...',
      tarot: '塔罗牌指引显示您当前的人生阶段...'
    };
  }

  /**
   * 生成建议
   */
  private async generateRecommendations(
    _features: PalmFeatures,
    _userInfo: UserInfo
  ): Promise<{ daily: string[]; weekly: string[]; monthly: string[]; yearly: string[] }> {
    return {
      daily: ['保持积极心态', '注意手部护理', '多与他人交流'],
      weekly: ['制定明确目标', '关注健康状况', '培养新技能'],
      monthly: ['回顾人生规划', '加强人际关系', '投资自我成长'],
      yearly: ['重大决策谨慎', '把握机遇时机', '平衡工作生活']
    };
  }

  /**
   * 生成未来洞察
   */
  private async generateFutureInsights(
    _features: PalmFeatures,
    _userInfo: UserInfo
  ): Promise<{ nextMonth: string; nextQuarter: string; nextYear: string; longTerm: string }> {
    return {
      nextMonth: '下个月将有新的机遇出现，保持开放心态',
      nextQuarter: '本季度适合专注于个人成长和技能提升',
      nextYear: '明年将是事业发展的关键年份',
      longTerm: '长期来看，您的人生轨迹呈现稳步上升趋势'
    };
  }

  /**
   * 生成兼容性分析
   */
  private async generateCompatibilityAnalysis(
    _features: PalmFeatures,
    _userInfo: UserInfo
  ): Promise<{ romantic: string[]; friendship: string[]; business: string[]; family: string[] }> {
    return {
      romantic: ['水象星座', '土象星座'],
      friendship: ['外向型人格', '创意型人才'],
      business: ['稳重型合作伙伴', '互补型团队'],
      family: ['理解型家庭成员', '支持型长辈']
    };
  }

  /**
   * 生成每日指导
   */
  private async generateDailyGuidance(
    features: PalmFeatures,
    userInfo: UserInfo
  ): Promise<Array<{ date: Date; guidance: string; luckyNumbers: number[]; luckyColors: string[] }>> {
    const guidance = [];
    const today = new Date();
    
    // 基于手掌特征生成个性化指导
    const baseGuidance = this.getPersonalizedGuidance(features);
    const luckyElements = this.getLuckyElements(features, userInfo);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      guidance.push({
        date,
        guidance: `第${i + 1}天：${baseGuidance[i % baseGuidance.length]}`,
        luckyNumbers: luckyElements.numbers.slice(i * 2, (i * 2) + 2),
        luckyColors: luckyElements.colors.slice(i % luckyElements.colors.length, (i % luckyElements.colors.length) + 2)
      });
    }
    
    return guidance;
  }

  private getPersonalizedGuidance(features: PalmFeatures): string[] {
    const guidance = [];
    
    // 基于生命线特征
    if (features.lines.lifeLine.clarity > 0.7) {
      guidance.push('专注于长远目标，您的坚持会带来回报');
    } else {
      guidance.push('保持内心平静，倾听直觉的声音');
    }
    
    // 基于智慧线特征
    if (features.lines.headLine.length > 0.8) {
      guidance.push('运用您的分析能力，做出明智决策');
    } else {
      guidance.push('相信直觉，有时简单的选择更有效');
    }
    
    // 基于感情线特征
    if (features.lines.heartLine.clarity > 0.6) {
      guidance.push('表达您的情感，加深人际关系');
    } else {
      guidance.push('给自己一些独处时间，反思内心需求');
    }
    
    // 基于手掌形状
    if (features.shape.type === 'square') {
      guidance.push('发挥您的实用主义，专注于具体行动');
    } else {
      guidance.push('拥抱创造力，尝试新的可能性');
    }
    
    return guidance;
  }

  private getLuckyElements(features: PalmFeatures, userInfo: UserInfo): { numbers: number[]; colors: string[] } {
    const numbers = [];
    const colors = [];
    
    // 基于生命线生成幸运数字
    const lifeLineScore = Math.floor(features.lines.lifeLine.clarity * 10);
    numbers.push(lifeLineScore || 1);
    
    // 基于智慧线生成幸运数字
    const headLineScore = Math.floor(features.lines.headLine.length * 10);
    numbers.push(headLineScore || 2);
    
    // 基于感情线生成幸运数字
    const heartLineScore = Math.floor(features.lines.heartLine.clarity * 10);
    numbers.push(heartLineScore || 3);
    
    // 基于出生月份生成数字
    numbers.push(userInfo.birthDate.getMonth() + 1);
    
    // 补充随机数字到14个
    while (numbers.length < 14) {
      numbers.push(Math.floor(Math.random() * 9) + 1);
    }
    
    // 基于手掌特征选择幸运颜色
    if (features.lines.lifeLine.clarity > 0.7) {
      colors.push('红色', '橙色');
    } else {
      colors.push('蓝色', '紫色');
    }
    
    if (features.shape.flexibility > 0.6) {
      colors.push('绿色', '黄色');
    } else {
      colors.push('白色', '银色');
    }
    
    if (features.lines.heartLine.depth > 0.5) {
      colors.push('粉色', '玫瑰金');
    } else {
      colors.push('灰色', '黑色');
    }
    
    return { numbers, colors };
  }

  /**
   * 生成月度预测
   */
  private async generateMonthlyForecast(
    features: PalmFeatures,
    _userInfo: UserInfo,
  ): Promise<Array<{ month: number; year: number; forecast: string; opportunities: string[]; challenges: string[] }>> {
    const forecast = [];
    const currentDate = new Date();
    
    // 基于手掌特征生成个性化预测
    const personalizedForecasts = this.getPersonalizedMonthlyForecasts(features);
    const opportunities = this.getMonthlyOpportunities(features);
    const challenges = this.getMonthlyChallenges(features);
    
    for (let i = 0; i < 12; i++) {
      const month = ((currentDate.getMonth() + i) % 12) + 1;
      const year = currentDate.getFullYear() + Math.floor((currentDate.getMonth() + i) / 12);
      
      forecast.push({
        month,
        year,
        forecast: personalizedForecasts[i % personalizedForecasts.length] || `${month}月将是充满机遇的月份`,
        opportunities: opportunities[i % opportunities.length] || ['事业发展', '人际关系'],
        challenges: challenges[i % challenges.length] || ['时间管理', '压力控制'],
      });
    }
    
    return forecast;
  }

  private getPersonalizedMonthlyForecasts(features: PalmFeatures): string[] {
    const forecasts = [];
    
    if (features.lines.lifeLine.clarity > 0.7) {
      forecasts.push('本月将是稳步前进的时期，您的努力会得到认可');
    } else {
      forecasts.push('本月适合内省和规划，为未来做好准备');
    }
    
    if (features.lines.headLine.length > 0.8) {
      forecasts.push('智慧和分析能力将为您带来突破性进展');
    } else {
      forecasts.push('直觉和创意思维将指引您找到新方向');
    }
    
    if (features.shape.flexibility > 0.6) {
      forecasts.push('适应性强的您将在变化中找到机遇');
    } else {
      forecasts.push('坚持既定方向将为您带来稳定收获');
    }
    
    return forecasts;
  }

  private getMonthlyOpportunities(features: PalmFeatures): string[][] {
    const opportunities = [];
    
    if (features.lines.heartLine.clarity > 0.6) {
      opportunities.push(['人际关系发展', '团队合作机会']);
    } else {
      opportunities.push(['个人成长', '技能提升']);
    }
    
    if (features.shape.type === 'square') {
      opportunities.push(['项目管理', '实务操作']);
    } else {
      opportunities.push(['创意表达', '艺术发展']);
    }
    
    opportunities.push(['学习新知', '拓展视野']);
    
    return opportunities;
  }

  private getMonthlyChallenges(features: PalmFeatures): string[][] {
    const challenges = [];
    
    if (features.lines.lifeLine.depth < 0.5) {
      challenges.push(['体力管理', '健康关注']);
    } else {
      challenges.push(['过度劳累', '工作平衡']);
    }
    
    if (features.lines.headLine.clarity < 0.6) {
      challenges.push(['决策困难', '信息过载']);
    } else {
      challenges.push(['过度分析', '行动迟缓']);
    }
    
    challenges.push(['时间管理', '优先级设定']);
    
    return challenges;
  }

  /**
   * 生成年度展望
   */
  private async generateYearlyOutlook(
    features: PalmFeatures,
    _userInfo: UserInfo,
  ): Promise<{ year: number; overview: string; quarters: Array<{ quarter: number; focus: string; opportunities: string[] }> }> {
    const currentYear = new Date().getFullYear();
    
    // 基于手掌特征生成个性化年度展望
    const overview = this.getPersonalizedYearlyOverview(features);
    const quarters = this.getPersonalizedQuarters(features);
    
    return {
      year: currentYear + 1,
      overview,
      quarters,
    };
  }

  private getPersonalizedYearlyOverview(features: PalmFeatures): string {
    if (features.lines.lifeLine.clarity > 0.8 && features.lines.headLine.length > 0.7) {
      return '明年将是突破性成长的一年，您的智慧和坚持将带来显著成果';
    } else if (features.shape.flexibility > 0.7) {
      return '明年将是适应和转变的一年，灵活性将成为您的最大优势';
    } else if (features.lines.heartLine.clarity > 0.6) {
      return '明年将是情感丰富和人际关系发展的一年';
    } else {
      return '明年将是内在成长和自我发现的一年';
    }
  }

  private getPersonalizedQuarters(features: PalmFeatures): Array<{ quarter: number; focus: string; opportunities: string[] }> {
    const quarters = [];
    
    // 第一季度
    if (features.lines.lifeLine.clarity > 0.7) {
      quarters.push({ quarter: 1, focus: '稳固基础', opportunities: ['建立长期目标', '制定详细计划'] });
    } else {
      quarters.push({ quarter: 1, focus: '探索可能', opportunities: ['尝试新方向', '开拓视野'] });
    }
    
    // 第二季度
    if (features.lines.headLine.length > 0.8) {
      quarters.push({ quarter: 2, focus: '智慧运用', opportunities: ['分析决策', '战略规划'] });
    } else {
      quarters.push({ quarter: 2, focus: '直觉引导', opportunities: ['创意发挥', '灵感捕捉'] });
    }
    
    // 第三季度
    if (features.shape.flexibility > 0.6) {
      quarters.push({ quarter: 3, focus: '灵活应变', opportunities: ['适应变化', '抓住机遇'] });
    } else {
      quarters.push({ quarter: 3, focus: '坚持执行', opportunities: ['专注目标', '稳步推进'] });
    }
    
    // 第四季度
    if (features.lines.heartLine.clarity > 0.6) {
      quarters.push({ quarter: 4, focus: '情感收获', opportunities: ['深化关系', '分享成果'] });
    } else {
      quarters.push({ quarter: 4, focus: '内在总结', opportunities: ['反思成长', '规划未来'] });
    }
    
    return quarters;
  }

  // 辅助方法 - 构建提示词
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    
    return age;
  }

  private buildPersonalityPrompt(features: PalmFeatures, userInfo: UserInfo): string {
    const age = this.calculateAge(userInfo.birthDate);
    return `基于以下手掌特征分析个性：
生命线清晰度: ${features.lines.lifeLine.clarity}
智慧线清晰度: ${features.lines.headLine.clarity}
感情线清晰度: ${features.lines.heartLine.clarity}
手掌形状: ${features.shape.type}
手掌比例: ${features.shape.ratio}
用户年龄: ${age}
用户性别: ${userInfo.gender}

请提供个性优势、挑战和总结。`;
  }

  private buildHealthPrompt(features: PalmFeatures, userInfo: UserInfo): string {
    const age = this.calculateAge(userInfo.birthDate);
    return `基于手掌特征分析健康状况：
生命线长度: ${features.lines.lifeLine.length}
生命线深度: ${features.lines.lifeLine.depth}
手掌柔韧性: ${features.shape.flexibility}
用户年龄: ${age}

请提供健康评分、关注领域、建议和总结。`;
  }

  private buildCareerPrompt(features: PalmFeatures, _userInfo: UserInfo): string {
    return `基于手掌特征分析事业发展：
智慧线特征: 长度${features.lines.headLine.length}, 清晰度${features.lines.headLine.clarity}
手指灵活性: ${features.fingers.index.flexibility}
手掌形状: ${features.shape.type}

请提供事业天赋、机遇、挑战和总结。`;
  }

  private buildRelationshipPrompt(features: PalmFeatures, userInfo: UserInfo): string {
    return `基于手掌特征分析感情状况：
感情线特征: 长度${features.lines.heartLine.length}, 清晰度${features.lines.heartLine.clarity}
手指形状: ${features.fingers.ring.tip}
用户性别: ${userInfo.gender}

请提供感情兼容性、沟通方式、挑战和总结。`;
  }

  private buildFortunePrompt(features: PalmFeatures, _userInfo: UserInfo): string {
    return `基于手掌特征分析财运：
命运线清晰度: ${features.lines.fateLine?.clarity || 0}
手掌宽度: ${features.shape.width}
拇指灵活性: ${features.fingers.thumb.flexibility}

请提供财运状况、机遇、时机和总结。`;
  }

  // 解析AI响应的辅助方法
  private parsePersonalityResponse(response: string): { traits: string[]; strengths: string[]; challenges: string[]; summary: string } {
    // 简化实现 - 实际需要更复杂的解析逻辑
    return {
      traits: ['理性思维', '情感丰富', '直觉敏锐'],
      strengths: ['坚韧不拔', '富有创造力', '善于沟通'],
      challenges: ['过于完美主义', '容易焦虑', '决策犹豫'],
      summary: response.substring(0, 200) + '...'
    };
  }

  private parseHealthResponse(response: string): { vitality: number; areas: string[]; recommendations: string[]; summary: string } {
    return {
      vitality: Math.floor(Math.random() * 30) + 70, // 70-100
      areas: ['心血管健康', '消化系统', '神经系统'],
      recommendations: ['规律作息', '均衡饮食', '适量运动'],
      summary: response.substring(0, 200) + '...'
    };
  }

  private parseCareerResponse(response: string): { aptitudes: string[]; opportunities: string[]; challenges: string[]; summary: string } {
    return {
      aptitudes: ['领导能力', '分析思维', '创新精神'],
      opportunities: ['管理岗位', '创业机会', '跨界发展'],
      challenges: ['团队协作', '压力管理', '技能更新'],
      summary: response.substring(0, 200) + '...'
    };
  }

  private parseRelationshipResponse(response: string): { compatibility: string[]; communication: string[]; challenges: string[]; summary: string } {
    return {
      compatibility: ['理解型伴侣', '互补型关系', '成长型友谊'],
      communication: ['直接表达', '倾听理解', '情感共鸣'],
      challenges: ['信任建立', '期望管理', '冲突解决'],
      summary: response.substring(0, 200) + '...'
    };
  }

  private parseFortuneResponse(response: string): { financial: string[]; opportunities: string[]; timing: string[]; summary: string } {
    return {
      financial: ['稳健投资', '多元化收入', '风险控制'],
      opportunities: ['房地产', '股票投资', '创业项目'],
      timing: ['春季有利', '秋季谨慎', '年底收获'],
      summary: response.substring(0, 200) + '...'
    };
  }

  private generatePersonalizedMessage(features: PalmFeatures, _userInfo: UserInfo): string {
    const confidence = features.confidence;
    
    if (confidence > 0.8) {
      return `您的手掌特征非常清晰，显示出独特的天赋和潜力！`;
    } else if (confidence > 0.6) {
      return `您的手掌透露出有趣的个性特征，值得深入了解。`;
    } else {
      return `虽然某些特征需要更仔细观察，但已经能看出您的独特之处。`;
    }
  }

  /**
   * 获取健康状态
   */
  getHealthStatus(): { status: 'healthy' | 'degraded' | 'unhealthy'; details: Record<string, unknown> } {
    return {
      status: 'healthy',
      details: {
        component: 'ReportGenerator',
        lastGeneration: new Date(),
        memoryUsage: typeof process !== 'undefined' ? process.memoryUsage?.() || {} : {}
      }
    };
  }
}