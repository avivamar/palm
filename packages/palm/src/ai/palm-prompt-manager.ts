/**
 * Palm Prompt Manager - 管理手相分析相关的所有 prompts
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface PalmPromptConfig {
  version?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * 加载手相分析主 prompt
 */
export async function loadPalmPrompt(_config?: PalmPromptConfig): Promise<string> {
  try {
    const promptPath = join(__dirname, 'prompts', 'analysis.md');
    const promptContent = readFileSync(promptPath, 'utf-8');
    
    // 提取系统提示词部分
    const systemPromptMatch = promptContent.match(/```markdown\n([\s\S]*?)\n```/);
    if (systemPromptMatch && systemPromptMatch[1]) {
      return systemPromptMatch[1].trim();
    }
    
    // 如果没有找到标记的部分，返回整个内容
    return promptContent;
  } catch (error) {
    console.error('Failed to load palm prompt:', error);
    // 返回默认 prompt
    return getDefaultPalmPrompt();
  }
}

/**
 * 获取默认的手相分析 prompt
 */
function getDefaultPalmPrompt(): string {
  return `你是一名融合中医手诊、反射区学与现代健康管理的 AI 分析师。

请遵循以下规则生成报告：
1. 用温和、专业口吻；避免"诊断"式断言，多使用"可能""倾向"。
2. 输入为 JSON：含 abnormalZones、abnormalReflexPoints、majorLines、birthDate、birthTime、lang。
3. 输出结构：
   - **Overall Insight**（≤3 句总结）
   - **Major Lines**（生命/智慧/感情/事业）
   - **Details**（依异常区/反射点给出原因+建议）
   - **Lifestyle Tips**（≤60 字）
4. lang = en / ja 时使用对应语言，否则中文。
5. 若收到 birthDate / birthTime，请结合太阳星座或生辰八字微调性格、健康与情绪描述。
6. 在 Lifestyle Tips 末尾追加一句诱导付费钩子，并与正文自然衔接。`;
}

/**
 * 获取特定场景的 prompt
 */
export function getScenarioPrompt(scenario: 'health' | 'career' | 'love' | 'wealth'): string {
  const prompts = {
    health: '请特别关注健康相关的八卦区和反射点，给出详细的养生建议。',
    career: '请着重分析事业线和智慧线，提供职业发展方向的建议。',
    love: '请深入解读感情线的特征，给出感情生活的见解和建议。',
    wealth: '请关注财富相关的纹路和特征，提供财运提升的建议。',
  };
  
  return prompts[scenario] || '';
}

/**
 * 获取多语言 prompt 增强
 */
export function getLanguageEnhancement(lang: 'zh' | 'en' | 'ja'): string {
  const enhancements = {
    zh: '请使用简洁优美的中文表达，适当使用成语和诗意的描述。',
    en: 'Please use clear and professional English, with a warm and encouraging tone.',
    ja: '丁寧で親しみやすい日本語でお答えください。専門用語は分かりやすく説明してください。',
  };
  
  return enhancements[lang] || enhancements.zh;
}

/**
 * 构建完整的系统 prompt
 */
export async function buildSystemPrompt(options: {
  scenario?: 'health' | 'career' | 'love' | 'wealth';
  lang?: 'zh' | 'en' | 'ja';
  config?: PalmPromptConfig;
}): Promise<string> {
  const basePrompt = await loadPalmPrompt(options.config);
  const parts = [basePrompt];
  
  if (options.scenario) {
    parts.push(getScenarioPrompt(options.scenario));
  }
  
  if (options.lang) {
    parts.push(getLanguageEnhancement(options.lang));
  }
  
  return parts.join('\n\n');
}

/**
 * 获取 prompt 版本信息
 */
export function getPromptVersion(): string {
  return 'v3.0-palm-optimized';
}