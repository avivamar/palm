/**
 * 星座相关的类型定义和工具函数
 * 用于计算用户的星座信息并生成个性化内容
 */

// 星座类型定义
export type ZodiacSign = {
  name: string;
  nameEn: string;
  symbol: string;
  element: string;
  quality: string;
  rulingPlanet: string;
  dateRange: string;
  traits: string[];
  luckyNumbers: number[];
  luckyColors: string[];
};

// 星盘类型定义
export type AstrologyChart = {
  sun: string;
  moon?: string;
  rising?: string;
  mercury?: string;
  venus?: string;
  birthLocation?: {
    name: string;
    latitude: number;
    longitude: number;
  };
  birthDate?: string;
  birthTime?: string;
};

// 十二星座数据
export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    name: '白羊座',
    nameEn: 'Aries',
    symbol: '♈',
    element: '火',
    quality: '基本',
    rulingPlanet: '火星',
    dateRange: '3月21日 - 4月19日',
    traits: ['勇敢', '热情', '冲动', '领导力强', '直率'],
    luckyNumbers: [1, 8, 17],
    luckyColors: ['红色', '橙色'],
  },
  {
    name: '金牛座',
    nameEn: 'Taurus',
    symbol: '♉',
    element: '土',
    quality: '固定',
    rulingPlanet: '金星',
    dateRange: '4月20日 - 5月20日',
    traits: ['稳重', '务实', '固执', '享受美食', '艺术天赋'],
    luckyNumbers: [2, 6, 9],
    luckyColors: ['绿色', '粉色'],
  },
  {
    name: '双子座',
    nameEn: 'Gemini',
    symbol: '♊',
    element: '风',
    quality: '变动',
    rulingPlanet: '水星',
    dateRange: '5月21日 - 6月20日',
    traits: ['聪明', '好奇', '善变', '沟通能力强', '多才多艺'],
    luckyNumbers: [5, 7, 14],
    luckyColors: ['黄色', '银色'],
  },
  {
    name: '巨蟹座',
    nameEn: 'Cancer',
    symbol: '♋',
    element: '水',
    quality: '基本',
    rulingPlanet: '月亮',
    dateRange: '6月21日 - 7月22日',
    traits: ['敏感', '情感丰富', '保护欲强', '家庭观念重', '直觉敏锐'],
    luckyNumbers: [2, 7, 11],
    luckyColors: ['白色', '银色'],
  },
  {
    name: '狮子座',
    nameEn: 'Leo',
    symbol: '♌',
    element: '火',
    quality: '固定',
    rulingPlanet: '太阳',
    dateRange: '7月23日 - 8月22日',
    traits: ['自信', '慷慨', '戏剧性', '领导才能', '创造力强'],
    luckyNumbers: [1, 3, 10],
    luckyColors: ['金色', '橙色'],
  },
  {
    name: '处女座',
    nameEn: 'Virgo',
    symbol: '♍',
    element: '土',
    quality: '变动',
    rulingPlanet: '水星',
    dateRange: '8月23日 - 9月22日',
    traits: ['完美主义', '分析能力强', '实用', '服务精神', '注重细节'],
    luckyNumbers: [3, 15, 20],
    luckyColors: ['深蓝色', '灰色'],
  },
  {
    name: '天秤座',
    nameEn: 'Libra',
    symbol: '♎',
    element: '风',
    quality: '基本',
    rulingPlanet: '金星',
    dateRange: '9月23日 - 10月22日',
    traits: ['和谐', '公正', '优雅', '社交能力强', '犹豫不决'],
    luckyNumbers: [6, 15, 24],
    luckyColors: ['粉色', '淡蓝色'],
  },
  {
    name: '天蝎座',
    nameEn: 'Scorpio',
    symbol: '♏',
    element: '水',
    quality: '固定',
    rulingPlanet: '冥王星',
    dateRange: '10月23日 - 11月21日',
    traits: ['神秘', '强烈', '洞察力强', '复仇心重', '变革能力'],
    luckyNumbers: [4, 13, 27],
    luckyColors: ['深红色', '黑色'],
  },
  {
    name: '射手座',
    nameEn: 'Sagittarius',
    symbol: '♐',
    element: '火',
    quality: '变动',
    rulingPlanet: '木星',
    dateRange: '11月22日 - 12月21日',
    traits: ['乐观', '自由', '哲学思考', '冒险精神', '直言不讳'],
    luckyNumbers: [3, 9, 22],
    luckyColors: ['紫色', '深蓝色'],
  },
  {
    name: '摩羯座',
    nameEn: 'Capricorn',
    symbol: '♑',
    element: '土',
    quality: '基本',
    rulingPlanet: '土星',
    dateRange: '12月22日 - 1月19日',
    traits: ['务实', '有野心', '责任感强', '传统', '耐心'],
    luckyNumbers: [8, 10, 26],
    luckyColors: ['黑色', '深绿色'],
  },
  {
    name: '水瓶座',
    nameEn: 'Aquarius',
    symbol: '♒',
    element: '风',
    quality: '固定',
    rulingPlanet: '天王星',
    dateRange: '1月20日 - 2月18日',
    traits: ['独立', '创新', '人道主义', '叛逆', '理想主义'],
    luckyNumbers: [4, 7, 11],
    luckyColors: ['蓝色', '银色'],
  },
  {
    name: '双鱼座',
    nameEn: 'Pisces',
    symbol: '♓',
    element: '水',
    quality: '变动',
    rulingPlanet: '海王星',
    dateRange: '2月19日 - 3月20日',
    traits: ['敏感', '富有想象力', '同情心强', '艺术天赋', '逃避现实'],
    luckyNumbers: [7, 12, 16],
    luckyColors: ['海蓝色', '紫色'],
  },
];

/**
 * 根据出生日期计算星座
 * @param birthDate 出生日期字符串 (YYYY-MM-DD格式)
 * @returns 对应的星座信息，如果日期无效则返回null
 */
export function calculateZodiacSign(birthDate: string): ZodiacSign | null {
  if (!birthDate) {
    return null;
  }

  const date = new Date(birthDate);
  const month = date.getMonth() + 1; // JavaScript月份从0开始
  const day = date.getDate();

  // 星座日期范围判断
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return ZODIAC_SIGNS[0]!; // 白羊座
  }
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return ZODIAC_SIGNS[1]!; // 金牛座
  }
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return ZODIAC_SIGNS[2]!; // 双子座
  }
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return ZODIAC_SIGNS[3]!; // 巨蟹座
  }
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return ZODIAC_SIGNS[4]!; // 狮子座
  }
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return ZODIAC_SIGNS[5]!; // 处女座
  }
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return ZODIAC_SIGNS[6]!; // 天秤座
  }
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return ZODIAC_SIGNS[7]!; // 天蝎座
  }
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return ZODIAC_SIGNS[8]!; // 射手座
  }
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return ZODIAC_SIGNS[9]!; // 摩羯座
  }
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return ZODIAC_SIGNS[10]!; // 水瓶座
  }
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) {
    return ZODIAC_SIGNS[11]!; // 双鱼座
  }

  return null;
}

/**
 * 生成个性化的星座内容
 * @param zodiacSign 星座信息
 * @param birthLocation 出生地点（可选）
 * @returns 个性化内容对象
 */
export function generatePersonalizedContent(
  zodiacSign: ZodiacSign,
  birthLocation?: { name: string; latitude: number; longitude: number },
) {
  const content = {
    greeting: `您好，${zodiacSign.name}！`,
    personality: `作为${zodiacSign.name}，您天生具有${zodiacSign.traits.slice(0, 3).join('、')}的特质。`,
    element: `您属于${zodiacSign.element}象星座，由${zodiacSign.rulingPlanet}守护。`,
    luckyElements: `您的幸运数字是 ${zodiacSign.luckyNumbers.join('、')}，幸运颜色为${zodiacSign.luckyColors.join('和')}。在重要决策时，这些元素可能为您带来额外的好运。`,
    todayFortune: `今日运势：${zodiacSign.element}象能量强劲，适合${zodiacSign.element === '火' ? '开展新项目或表达创意' : zodiacSign.element === '土' ? '处理实务或制定计划' : zodiacSign.element === '风' ? '沟通交流或学习新知' : '关注内心感受或艺术创作'}。${birthLocation ? `您的出生地${birthLocation.name}的地理能量与您的星座特质相得益彰。` : ''}`,
  };

  return content;
}

/**
 * 生成基础星盘信息
 * @param birthDate 出生日期
 * @param birthLocation 出生地点（可选）
 * @param birthTime 出生时间（可选）
 * @returns 星盘信息或null
 */
export function generateAstrologyChart(
  birthDate: string,
  birthLocation?: { name: string; latitude: number; longitude: number },
  birthTime?: string,
): AstrologyChart | null {
  const sunSign = calculateZodiacSign(birthDate);
  if (!sunSign) {
    return null;
  }

  return {
    sun: sunSign.nameEn,
    birthLocation,
    birthDate,
    birthTime,
  };
}

/**
 * 获取所有星座信息
 * @returns 所有星座的数组
 */
export function getAllZodiacSigns(): ZodiacSign[] {
  return ZODIAC_SIGNS;
}