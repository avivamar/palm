/**
 * Palm AI 数据导出
 * 提供八卦区和反射区的数据访问
 */

import palmBaguaJSON from './palm-bagua.json';
import palmReflexJSON from './palm-reflex.json';

export interface BaguaZone {
  area: string;
  english: string;
  japanese: string;
  organ: string[];
  commonMarks: string[];
  issues: string[];
}

export interface ReflexPoint {
  point: string;
  english: string;
  japanese: string;
  location: string;
  issues: string[];
}

// 类型安全的数据导出
export const palmBaguaData: BaguaZone[] = palmBaguaJSON as BaguaZone[];
export const palmReflexData: ReflexPoint[] = palmReflexJSON as ReflexPoint[];

/**
 * 根据区域名称获取八卦区信息
 */
export function getBaguaZone(area: string): BaguaZone | undefined {
  return palmBaguaData.find(zone => zone.area === area);
}

/**
 * 根据反射点名称获取反射点信息
 */
export function getReflexPoint(point: string): ReflexPoint | undefined {
  return palmReflexData.find(reflex => reflex.point === point);
}

/**
 * 获取所有八卦区名称
 */
export function getAllBaguaZoneNames(): string[] {
  return palmBaguaData.map(zone => zone.area);
}

/**
 * 获取所有反射点名称
 */
export function getAllReflexPointNames(): string[] {
  return palmReflexData.map(reflex => reflex.point);
}

/**
 * 根据语言获取八卦区的翻译名称
 */
export function getBaguaZoneTranslation(area: string, lang: 'en' | 'ja'): string | undefined {
  const zone = getBaguaZone(area);
  return zone ? (lang === 'en' ? zone.english : zone.japanese) : undefined;
}

/**
 * 根据语言获取反射点的翻译名称
 */
export function getReflexPointTranslation(point: string, lang: 'en' | 'ja'): string | undefined {
  const reflex = getReflexPoint(point);
  return reflex ? (lang === 'en' ? reflex.english : reflex.japanese) : undefined;
}