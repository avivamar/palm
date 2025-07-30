/**
 * Palm AI 服务导出
 * 提供手相分析专用的 AI 服务接口
 */

export { PalmAIService } from './palm-ai-service';
export type { PalmAIServiceConfig } from './palm-ai-service';

export { 
  loadPalmPrompt, 
  buildSystemPrompt, 
  getScenarioPrompt,
  getLanguageEnhancement,
  getPromptVersion 
} from './palm-prompt-manager';
export type { PalmPromptConfig } from './palm-prompt-manager';

export { pickHook, getHookByIndex, getAllHooks } from './hooks';

export {
  palmBaguaData,
  palmReflexData,
  getBaguaZone,
  getReflexPoint,
  getAllBaguaZoneNames,
  getAllReflexPointNames,
  getBaguaZoneTranslation,
  getReflexPointTranslation,
} from './data';
export type { BaguaZone, ReflexPoint } from './data';