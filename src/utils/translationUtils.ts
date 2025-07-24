/**
 * 翻译工具函数
 * 解决嵌套JSON结构的翻译键值获取问题
 */

export type TranslationObject = Record<string, any>;
export type TranslationFunction = (key: string) => string;
export type TranslationType = TranslationObject | TranslationFunction;

/**
 * 通用翻译获取函数，支持嵌套键值如 "quick_stats.account_status"
 * @param t 翻译对象或函数
 * @param key 翻译键值，支持点分隔的嵌套路径
 * @returns 翻译后的文本，如果找不到则返回原键值
 */
export function getNestedTranslation(t: TranslationType, key: string): string {
  // 如果是函数，直接调用
  if (typeof t === 'function') {
    return t(key);
  }

  // 处理嵌套键值
  const keys = key.split('.');
  let value: any = t;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // 如果找不到，返回原键值作为fallback
      return key;
    }
  }

  return typeof value === 'string' ? value : key;
}

/**
 * 创建翻译获取器函数的工厂函数
 * @param t 翻译对象或函数
 * @returns 绑定了翻译对象的获取函数
 */
export function createTranslationGetter(t: TranslationType) {
  return (key: string) => getNestedTranslation(t, key);
}

/**
 * 验证翻译对象是否包含指定的嵌套键
 * @param t 翻译对象
 * @param key 要检查的键
 * @returns 是否存在该键
 */
export function hasTranslationKey(t: TranslationObject, key: string): boolean {
  const keys = key.split('.');
  let value: any = t;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return false;
    }
  }

  return typeof value === 'string';
}

/**
 * 获取翻译对象的所有键路径（用于调试）
 * @param obj 翻译对象
 * @param prefix 键前缀
 * @returns 所有键路径的数组
 */
export function getAllTranslationKeys(obj: TranslationObject, prefix = ''): string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      keys.push(fullKey);
    } else if (typeof value === 'object' && value !== null) {
      keys.push(...getAllTranslationKeys(value, fullKey));
    }
  }

  return keys;
}
