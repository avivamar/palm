/**
 * Palm AI Bridge - 桥接新旧 AI 接口
 * 提供向后兼容的接口，便于平滑迁移
 */

import type { AIManager } from '@rolitt/ai-core';
import { PalmAIService } from './palm-ai-service';
import type { PalmAnalysisInput, PalmAnalysisOutput } from '../types';

/**
 * 创建 Palm AI 桥接服务
 * 用于从 ai-core 的通用接口迁移到 palm 专用接口
 */
export function createPalmAIBridge(aiManager: AIManager) {
  const palmService = new PalmAIService({
    aiManager,
    defaultModel: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 2000,
  });

  return {
    /**
     * 分析手相（兼容旧接口）
     */
    async analyze(input: PalmAnalysisInput): Promise<PalmAnalysisOutput> {
      return palmService.analyzePalm(input);
    },

    /**
     * 获取 Palm AI 服务实例
     */
    getService(): PalmAIService {
      return palmService;
    },

    /**
     * 验证输入数据
     */
    validateInput(input: PalmAnalysisInput): { valid: boolean; errors: string[] } {
      return palmService.validateInput(input);
    },

    /**
     * 获取支持的语言
     */
    getSupportedLanguages(): string[] {
      return palmService.getSupportedLanguages();
    },
  };
}

/**
 * 从 AI-Core 的 prompt loader 迁移到 Palm 专用 prompt
 */
export async function migratePalmPrompts() {
  console.log('Palm prompts have been migrated to palm package');
  console.log('Please update your imports from:');
  console.log('  @rolitt/ai-core/prompts/palm/analysis');
  console.log('To:');
  console.log('  @rolitt/palm/ai');
}

/**
 * 帮助函数：将旧格式转换为新格式
 */
export function convertLegacyInput(legacyInput: any): PalmAnalysisInput {
  return {
    birthDate: legacyInput.birthDate,
    birthTime: legacyInput.birthTime,
    abnormalZones: legacyInput.abnormalZones || [],
    abnormalReflexPoints: legacyInput.abnormalReflexPoints || [],
    majorLines: legacyInput.majorLines || {},
    lang: legacyInput.lang || 'zh',
  };
}