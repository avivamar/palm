/**
 * Palm AI Service - 专门为手相分析优化的 AI 服务层
 * 封装了手相分析特定的 AI 交互逻辑
 */

import type { AIManager } from '@rolitt/ai-core';
import type { PalmAnalysisInput, PalmAnalysisOutput } from '../types';
import { loadPalmPrompt } from './palm-prompt-manager';
import { palmBaguaData, palmReflexData } from './data';
import { pickHook } from './hooks';

export interface PalmAIServiceConfig {
  aiManager: AIManager;
  defaultModel?: string;
  temperature?: number;
  maxTokens?: number;
}

export class PalmAIService {
  private aiManager: AIManager;
  private config: Required<Omit<PalmAIServiceConfig, 'aiManager'>>;

  constructor(config: PalmAIServiceConfig) {
    this.aiManager = config.aiManager;
    this.config = {
      defaultModel: config.defaultModel || 'gpt-4o-mini',
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 2000,
    };
  }

  /**
   * 执行手相分析
   */
  async analyzePalm(input: PalmAnalysisInput): Promise<PalmAnalysisOutput> {
    const systemPrompt = await loadPalmPrompt();
    const analysisContext = this.buildAnalysisContext(input);
    
    try {
      const response = await this.aiManager.generateCompletion({
        provider: 'openai',
        model: this.config.defaultModel,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: analysisContext,
          },
        ],
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
        responseFormat: { type: 'json_object' },
      });

      const result = this.parseAIResponse(response, input.lang);
      return this.enhanceWithHook(result, input.lang);
    } catch (error) {
      console.error('Palm AI analysis failed:', error);
      throw new Error('手相分析失败，请重试');
    }
  }

  /**
   * 构建分析上下文
   */
  private buildAnalysisContext(input: PalmAnalysisInput): string {
    const context = {
      birthDate: input.birthDate,
      birthTime: input.birthTime,
      abnormalZones: this.enrichZonesWithData(input.abnormalZones || []),
      abnormalReflexPoints: this.enrichReflexWithData(input.abnormalReflexPoints || []),
      majorLines: input.majorLines || {},
      lang: input.lang || 'zh',
    };

    return JSON.stringify(context, null, 2);
  }

  /**
   * 丰富八卦区数据
   */
  private enrichZonesWithData(zones: Array<{ area: string; mark?: string }>) {
    return zones.map(zone => {
      const baguaInfo = palmBaguaData.find(b => b.area === zone.area);
      return {
        ...zone,
        organ: baguaInfo?.organ || [],
        commonMarks: baguaInfo?.commonMarks || [],
        issues: baguaInfo?.issues || [],
      };
    });
  }

  /**
   * 丰富反射区数据
   */
  private enrichReflexWithData(points: Array<{ point: string; feature?: string }>) {
    return points.map(point => {
      const reflexInfo = palmReflexData.find(r => r.point === point.point);
      return {
        ...point,
        location: reflexInfo?.location || '',
        issues: reflexInfo?.issues || [],
      };
    });
  }

  /**
   * 解析 AI 响应
   */
  private parseAIResponse(response: any, lang?: string): PalmAnalysisOutput {
    try {
      const content = response.choices?.[0]?.message?.content || response.content;
      const parsed = JSON.parse(content);
      
      return {
        overallInsight: parsed.overallInsight || '',
        majorLines: parsed.majorLines || {},
        details: parsed.details || [],
        lifestyleTips: parsed.lifestyleTips || '',
        lang: lang || 'zh',
      };
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('AI 响应解析失败');
    }
  }

  /**
   * 添加付费引导钩子
   */
  private enhanceWithHook(result: PalmAnalysisOutput, lang?: string): PalmAnalysisOutput {
    const hookLang = (lang || 'zh') as 'zh' | 'en' | 'ja';
    const hook = pickHook(hookLang);
    
    return {
      ...result,
      lifestyleTips: `${result.lifestyleTips} ${hook}`,
    };
  }

  /**
   * 获取支持的语言列表
   */
  getSupportedLanguages(): string[] {
    return ['zh', 'en', 'ja'];
  }

  /**
   * 验证输入数据
   */
  validateInput(input: PalmAnalysisInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (input.abnormalZones) {
      const validZones = palmBaguaData.map(b => b.area);
      const invalidZones = input.abnormalZones.filter(z => !validZones.includes(z.area));
      if (invalidZones.length > 0) {
        errors.push(`无效的八卦区: ${invalidZones.map(z => z.area).join(', ')}`);
      }
    }

    if (input.abnormalReflexPoints) {
      const validPoints = palmReflexData.map(r => r.point);
      const invalidPoints = input.abnormalReflexPoints.filter(p => !validPoints.includes(p.point));
      if (invalidPoints.length > 0) {
        errors.push(`无效的反射点: ${invalidPoints.map(p => p.point).join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}