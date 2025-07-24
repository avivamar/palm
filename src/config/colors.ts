/**
 * 集中化颜色配置文件
 * 统一管理所有产品颜色相关的配置
 */

// 颜色配置接口定义
export type ColorConfig = {
  /** 颜色的唯一标识符，与数据库枚举值保持一致 */
  id: string;
  /** 颜色的显示名称（支持多语言） */
  displayName: string;
  /** 颜色的英文名称 */
  englishName: string;
  /** 颜色的十六进制值 */
  hexValue: string;
  /** 对应的 Stripe 价格 ID */
  stripePriceId?: string;
  /** 产品图片路径 */
  imagePath: string;
  /** 是否启用该颜色 */
  enabled: boolean;
  /** 排序权重 */
  sortOrder: number;
};

// 颜色配置数据
export const PRODUCT_COLORS: ColorConfig[] = [
  {
    id: 'Honey Khaki',
    displayName: 'Honey Khaki',
    englishName: 'Honey Khaki',
    hexValue: '#D2B48C',
    stripePriceId: 'price_1RcljHBCMz50a5Rza9NvZH5z',
    imagePath: '/pre-order/khaki.png',
    enabled: true,
    sortOrder: 1,
  },
  {
    id: 'Sakura Pink',
    displayName: 'Sakura Pink',
    englishName: 'Sakura Pink',
    hexValue: '#FFB6C1',
    stripePriceId: 'price_1Rce39BCMz50a5RzuTd1P7E7',
    imagePath: '/pre-order/pink.png',
    enabled: true,
    sortOrder: 2,
  },
  {
    id: 'Healing Green',
    displayName: 'Healing Green',
    englishName: 'Healing Green',
    hexValue: '#90EE90',
    stripePriceId: 'price_1RcljHBCMz50a5RzxJORItSF',
    imagePath: '/pre-order/green.png',
    enabled: true,
    sortOrder: 3,
  },
  {
    id: 'Moonlight Grey',
    displayName: 'Moonlight Grey',
    englishName: 'Moonlight Grey',
    hexValue: '#D3D3D3',
    stripePriceId: 'price_1RcljHBCMz50a5RzozuqMuJN',
    imagePath: '/pre-order/grey.png',
    enabled: true,
    sortOrder: 4,
  },
  {
    id: 'Red',
    displayName: 'Classic Red',
    englishName: 'Classic Red',
    hexValue: '#FF0000',
    stripePriceId: 'price_1RdAu1BCMz50a5RzChT7XYGm', // 测试用价格 ID
    imagePath: '/pre-order/red.png',
    enabled: true,
    sortOrder: 5,
  },
];

// 工具函数

/**
 * 获取所有启用的颜色
 */
export const getEnabledColors = (): ColorConfig[] => {
  return PRODUCT_COLORS.filter(color => color.enabled).sort((a, b) => a.sortOrder - b.sortOrder);
};

/**
 * 根据颜色 ID 获取颜色配置
 */
export const getColorById = (id: string): ColorConfig | undefined => {
  return PRODUCT_COLORS.find(color => color.id === id);
};

/**
 * 获取颜色的显示名称
 */
export const getColorDisplayName = (id: string): string => {
  const color = getColorById(id);
  return color?.displayName || id;
};

/**
 * 获取颜色的 Stripe 价格 ID
 */
export const getColorStripePriceId = (id: string): string | undefined => {
  const color = getColorById(id);
  return color?.stripePriceId;
};

/**
 * 生成 Stripe 颜色价格映射对象
 */
export const generateStripePriceMap = (): Record<string, string> => {
  const priceMap: Record<string, string> = {};

  getEnabledColors().forEach((color) => {
    if (color.stripePriceId) {
      priceMap[color.id] = color.stripePriceId;
    }
  });

  // 添加默认价格
  const defaultColor = getEnabledColors()[0];
  if (defaultColor?.stripePriceId) {
    priceMap.default = defaultColor.stripePriceId;
  }

  return priceMap;
};

/**
 * 获取数据库枚举值数组
 */
export const getColorEnumValues = (): [string, ...string[]] => {
  const ids = getEnabledColors().map(color => color.id);
  if (ids.length === 0) {
    // Provide a fallback to prevent type errors on empty array
    return ['default_color'];
  }
  return ids as [string, ...string[]];
};

/**
 * 验证颜色 ID 是否有效
 */
export const isValidColorId = (id: string): boolean => {
  return getEnabledColors().some(color => color.id === id);
};

// 导出颜色 ID 类型
export type ProductColorId = ReturnType<typeof getColorEnumValues>[number];
