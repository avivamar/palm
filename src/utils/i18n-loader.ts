// 优化的多语言加载器 - 分离关键和非关键翻译

// 缓存已加载的翻译
const translationCache = new Map<string, any>();

/**
 * 加载首屏关键翻译文件
 * 只包含立即需要的翻译内容
 */
export async function loadCriticalTranslations(locale: string) {
  const cacheKey = `critical-${locale}`;

  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    // 只加载首屏必需的翻译文件
    const translations = {
      ...(await import(`@/locales/${locale}/core.json`)).default,
      ...(await import(`@/locales/${locale}/pages.json`)).default,
    };

    translationCache.set(cacheKey, translations);
    return translations;
  } catch (error) {
    console.error(`Failed to load critical translations for ${locale}:`, error);
    throw error;
  }
}

/**
 * 延迟加载次要翻译文件
 * 包含非首屏内容的翻译
 */
export async function loadSecondaryTranslations(locale: string) {
  const cacheKey = `secondary-${locale}`;

  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    // 延迟加载其他翻译文件
    const translations = {
      ...(await import(`@/locales/${locale}/business.json`)).default,
      dashboard: (await import(`@/locales/${locale}/dashboard.json`)).default,
      ...(await import(`@/locales/${locale}/commerce.json`)).default,
      ...(await import(`@/locales/${locale}/legal.json`)).default,
      ...(await import(`@/locales/${locale}/user.json`)).default,
      admin: (await import(`@/locales/${locale}/admin.json`)).default,
      ...(await import(`@/locales/${locale}/unauthorized.json`)).default,
      ...(await import(`@/locales/${locale}/validation.json`)).default,
    };

    translationCache.set(cacheKey, translations);
    return translations;
  } catch (error) {
    console.error(`Failed to load secondary translations for ${locale}:`, error);
    // 返回空对象而不是抛出错误，允许应用继续运行
    return {};
  }
}

/**
 * 预加载指定语言的翻译文件
 * 用于语言切换前的预加载
 */
export function preloadTranslations(locale: string) {
  // 使用 requestIdleCallback 在空闲时预加载
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      loadSecondaryTranslations(locale);
    });
  } else {
    // 降级方案：使用 setTimeout
    setTimeout(() => {
      loadSecondaryTranslations(locale);
    }, 1000);
  }
}

/**
 * 清理翻译缓存
 * 用于内存管理
 */
export function clearTranslationCache() {
  translationCache.clear();
}

/**
 * 获取缓存大小
 * 用于监控
 */
export function getCacheSize() {
  return translationCache.size;
}
