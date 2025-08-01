export interface PalmStepConfig {
  id: number
  type: 'landing' | 'choice' | 'input' | 'analysis' | 'result' | 'payment'
  title: string
  seoTitle: string
  seoDescription: string
  features: string[]
  psychologyTriggers: string[]
  conversionGoal: string
  nextStep?: number
  requiredFields?: string[]
  analytics: {
    events: string[]
    goals: string[]
  }
}

export const PALM_STEPS_CONFIG: Record<number, PalmStepConfig> = {
  0: {
    id: 0,
    type: 'landing',
    title: '3分钟发现你的财富天赋密码',
    seoTitle: '免费财富天赋分析 - 发现你的投资潜力',
    seoDescription: '基于AI的手相财富分析，97.3%准确率，已帮助84万+用户发现投资机会',
    features: ['socialProof', 'scarcity', 'dynamicCounter'],
    psychologyTriggers: ['稀缺性', '社会认同', '权威性'],
    conversionGoal: 'engagement',
    nextStep: 1,
    analytics: {
      events: ['palm_landing_view', 'palm_cta_click'],
      goals: ['engagement_rate', 'continuation_rate']
    }
  },
  1: {
    id: 1,
    type: 'choice',
    title: '你的性别能量影响财富吸引力',
    seoTitle: '性别能量财富分析 - 投资成功率提升37%',
    seoDescription: '男性和女性的财富磁场完全不同，了解你的能量类型提升投资成功率',
    features: ['progressBar', 'choiceCards', 'statisticData'],
    psychologyTriggers: ['个性化', '投资统计', '能量概念'],
    conversionGoal: 'data_collection',
    nextStep: 2,
    requiredFields: ['gender'],
    analytics: {
      events: ['palm_gender_select', 'palm_step1_complete'],
      goals: ['selection_rate', 'drop_off_rate']
    }
  },
  2: {
    id: 2,
    type: 'choice',
    title: '你的内在能量决定财富流向',
    seoTitle: '内在能量财富分析 - 发现投资机会',
    seoDescription: '阳性能量善于主动创造财富，阴性能量擅长直觉投资获利',
    features: ['energyTypes', 'realTimeActivity', 'investmentStats'],
    psychologyTriggers: ['实时活动', '投资机会', '能量匹配'],
    conversionGoal: 'engagement_deepening',
    nextStep: 3,
    requiredFields: ['energyType'],
    analytics: {
      events: ['palm_energy_select', 'palm_step2_complete'],
      goals: ['engagement_depth', 'choice_confidence']
    }
  },
  3: {
    id: 3,
    type: 'choice',
    title: '发现你的财富优势手',
    seoTitle: '财富优势手分析 - 惯用手与投资能力',
    seoDescription: '惯用手决定主要财富流向，93.7%高净值人群掌纹显示明确财富手特征',
    features: ['handSelection', 'wealthStatistics', 'executivePower'],
    psychologyTriggers: ['高净值统计', '财富特征', '优势发现'],
    conversionGoal: 'trust_building',
    nextStep: 4,
    requiredFields: ['dominantHand'],
    analytics: {
      events: ['palm_hand_select', 'palm_step3_complete'],
      goals: ['trust_score', 'data_quality']
    }
  },
  4: {
    id: 4,
    type: 'choice',
    title: '定制你的财富报告内容',
    seoTitle: '个性化财富报告 - 专属投资指导',
    seoDescription: '选择最重要的2个领域，获得专属财富指导和投资建议',
    features: ['multiChoice', 'personalization', 'valueProposition'],
    psychologyTriggers: ['个性化价值', '专属感', '选择控制'],
    conversionGoal: 'customization',
    nextStep: 5,
    requiredFields: ['motivations'],
    analytics: {
      events: ['palm_motivation_select', 'palm_step4_complete'],
      goals: ['customization_rate', 'value_perception']
    }
  },
  5: {
    id: 5,
    type: 'analysis',
    title: '财富潜力正在解析中',
    seoTitle: 'AI财富分析进行中 - 个性化报告生成',
    seoDescription: 'AI正在分析你的财富潜力，生成个性化投资建议和机会识别',
    features: ['progressAnimation', 'analysisSteps', 'anticipation'],
    psychologyTriggers: ['期待感', '进度透明', '专业感'],
    conversionGoal: 'anticipation_building',
    nextStep: 6,
    analytics: {
      events: ['palm_analysis_view', 'palm_analysis_complete'],
      goals: ['completion_rate', 'waiting_time']
    }
  },
  6: {
    id: 6,
    type: 'input',
    title: '生辰信息增强分析精准度',
    seoTitle: '生辰财富分析 - 时间能量场影响',
    seoDescription: '结合生辰信息分析财富能量场，提升预测精准度',
    features: ['dateInput', 'precisionUpgrade'],
    psychologyTriggers: ['精准度', '个性化'],
    conversionGoal: 'data_enrichment',
    nextStep: 7,
    requiredFields: ['birthDate'],
    analytics: {
      events: ['palm_birth_input', 'palm_step6_complete'],
      goals: ['completion_rate', 'data_accuracy']
    }
  },
  7: {
    id: 7,
    type: 'choice',
    title: '识别你的核心掌纹特征',
    seoTitle: '掌纹特征分析 - 财富线识别',
    seoDescription: '识别核心掌纹特征，分析财富线和投资潜力',
    features: ['palmLineSelection'],
    psychologyTriggers: ['专业分析', '特征识别'],
    conversionGoal: 'engagement',
    nextStep: 8,
    requiredFields: ['palmLines'],
    analytics: {
      events: ['palm_lines_select', 'palm_step7_complete'],
      goals: ['engagement_rate']
    }
  },
  8: {
    id: 8,
    type: 'input',
    title: '手指长度决定投资风格',
    seoTitle: '手指分析 - 投资风格匹配',
    seoDescription: '手指长度分析投资风格和风险偏好',
    features: ['fingerAnalysis'],
    psychologyTriggers: ['科学分析', '风格匹配'],
    conversionGoal: 'data_collection',
    nextStep: 9,
    requiredFields: ['fingerLength'],
    analytics: {
      events: ['palm_fingers_input', 'palm_step8_complete'],
      goals: ['completion_rate']
    }
  },
  9: {
    id: 9,
    type: 'input',
    title: '地理位置优化分析',
    seoTitle: '地理财富分析 - 位置能量场',
    seoDescription: '结合地理位置分析财富能量场影响',
    features: ['locationInput'],
    psychologyTriggers: ['地域特色', '能量场'],
    conversionGoal: 'data_enrichment',
    nextStep: 10,
    analytics: {
      events: ['palm_location_input', 'palm_step9_complete'],
      goals: ['completion_rate']
    }
  },
  10: {
    id: 10,
    type: 'analysis',
    title: '深度分析进行中',
    seoTitle: '深度财富分析 - AI处理中',
    seoDescription: 'AI深度分析你的财富潜力',
    features: ['progressAnimation'],
    psychologyTriggers: ['期待感', '专业处理'],
    conversionGoal: 'anticipation',
    nextStep: 11,
    analytics: {
      events: ['palm_progress_view', 'palm_step10_complete'],
      goals: ['completion_rate']
    }
  },
  11: {
    id: 11,
    type: 'choice',
    title: '设定掌纹优先级',
    seoTitle: '掌纹优先级 - 财富重点分析',
    seoDescription: '设定分析重点，获得精准财富建议',
    features: ['prioritySelection'],
    psychologyTriggers: ['个性化', '重点突出'],
    conversionGoal: 'customization',
    nextStep: 12,
    requiredFields: ['palmLinePriority'],
    analytics: {
      events: ['palm_priority_select', 'palm_step11_complete'],
      goals: ['customization_rate']
    }
  },
  12: {
    id: 12,
    type: 'input',
    title: '上传手掌照片',
    seoTitle: '手掌扫描 - AI图像分析',
    seoDescription: '上传手掌照片，AI分析掌纹特征',
    features: ['imageUpload', 'cameraAccess'],
    psychologyTriggers: ['AI技术', '精准分析'],
    conversionGoal: 'data_collection',
    nextStep: 13,
    requiredFields: ['palmImage'],
    analytics: {
      events: ['palm_upload_view', 'palm_image_upload'],
      goals: ['upload_rate']
    }
  },
  13: {
    id: 13,
    type: 'input',
    title: '拍摄手掌照片',
    seoTitle: '手掌拍摄 - 专业扫描',
    seoDescription: '专业手掌拍摄指导，确保分析准确性',
    features: ['cameraCapture', 'guidance'],
    psychologyTriggers: ['专业指导', '质量保证'],
    conversionGoal: 'data_quality',
    nextStep: 14,
    analytics: {
      events: ['palm_capture_view', 'palm_photo_taken'],
      goals: ['capture_rate']
    }
  },
  14: {
    id: 14,
    type: 'analysis',
    title: '扫描分析进度',
    seoTitle: '扫描进度 - AI分析处理',
    seoDescription: 'AI正在扫描分析你的手掌特征',
    features: ['scanProgress', 'realTimeAnalysis'],
    psychologyTriggers: ['实时处理', '专业技术'],
    conversionGoal: 'anticipation',
    nextStep: 15,
    analytics: {
      events: ['palm_scan_progress', 'palm_scan_complete'],
      goals: ['completion_rate']
    }
  },
  15: {
    id: 15,
    type: 'analysis',
    title: 'AI深度分析',
    seoTitle: 'AI分析进行中 - 财富潜力解析',
    seoDescription: 'AI深度分析财富潜力和投资机会',
    features: ['aiAnalysis', 'deepLearning'],
    psychologyTriggers: ['AI技术', '深度分析'],
    conversionGoal: 'trust_building',
    nextStep: 16,
    analytics: {
      events: ['palm_ai_analysis', 'palm_analysis_complete'],
      goals: ['completion_rate']
    }
  },
  16: {
    id: 16,
    type: 'input',
    title: '邮箱验证获取报告',
    seoTitle: '邮箱验证 - 获取财富报告',
    seoDescription: '验证邮箱获取完整财富分析报告',
    features: ['emailVerification'],
    psychologyTriggers: ['价值获取', '完整报告'],
    conversionGoal: 'lead_generation',
    nextStep: 17,
    requiredFields: ['email'],
    analytics: {
      events: ['palm_email_input', 'palm_email_verified'],
      goals: ['lead_conversion_rate']
    }
  },
  17: {
    id: 17,
    type: 'result',
    title: '财富故事揭晓',
    seoTitle: '财富故事 - 个人财富密码',
    seoDescription: '揭晓你的财富故事和投资密码',
    features: ['storytelling', 'revelation'],
    psychologyTriggers: ['故事化', '揭秘感'],
    conversionGoal: 'engagement',
    nextStep: 18,
    analytics: {
      events: ['palm_story_view', 'palm_story_complete'],
      goals: ['engagement_rate']
    }
  },
  18: {
    id: 18,
    type: 'payment',
    title: '选择您的财富分析方案',
    seoTitle: '财富分析付费方案 - 专业投资指导',
    seoDescription: '选择适合的分析方案，获得专业的财富指导和投资建议',
    features: ['pricingOptions', 'valueStacking', 'payAsYouCanModel'],
    psychologyTriggers: ['价值包装', '按能力付费', '投资理念'],
    conversionGoal: 'monetization',
    nextStep: 19,
    requiredFields: ['selectedPrice'],
    analytics: {
      events: ['palm_pricing_view', 'palm_price_select', 'palm_payment_init'],
      goals: ['conversion_rate', 'average_order_value', 'payment_completion']
    }
  },
  19: {
    id: 19,
    type: 'payment',
    title: '投资方案推荐',
    seoTitle: '投资方案推荐 - 个性化投资建议',
    seoDescription: '基于财富分析推荐最适合的投资方案',
    features: ['investmentPlan', 'riskAssessment'],
    psychologyTriggers: ['个性化推荐', '投资机会'],
    conversionGoal: 'investment_guidance',
    nextStep: 20,
    requiredFields: ['investmentPlan'],
    analytics: {
      events: ['palm_investment_view', 'palm_investment_select'],
      goals: ['investment_conversion_rate']
    }
  },
  20: {
    id: 20,
    type: 'payment',
    title: '专属财富指导报告',
    seoTitle: '最终优惠 - 专属财富报告限时特价',
    seoDescription: '专业财富顾问服务限时特价，获得价值$294的完整财富分析报告',
    features: ['finalOffer', 'valueStack', 'urgency', 'guarantee'],
    psychologyTriggers: ['最后机会', '价值包装', '退款保证'],
    conversionGoal: 'final_conversion',
    analytics: {
      events: ['palm_final_offer_view', 'palm_final_purchase'],
      goals: ['final_conversion_rate', 'revenue_per_visitor']
    }
  }
}

// A/B测试配置
export const PALM_EXPERIMENTS = {
  'landing-version': {
    variants: ['original', 'financial-focus', 'urgency-enhanced'],
    weights: [0.4, 0.3, 0.3],
    goal: 'continuation_rate'
  },
  'pricing-strategy': {
    variants: ['fixed-19', 'sliding-scale', 'donation-model'],
    weights: [0.5, 0.3, 0.2],
    goal: 'conversion_rate'
  },
  'psychology-intensity': {
    variants: ['subtle', 'moderate', 'aggressive'],
    weights: [0.3, 0.4, 0.3],
    goal: 'completion_rate'
  }
}

// 获取实验变体
export function getExperimentVariant(experimentKey: string, userId?: string): string {
  const experiment = PALM_EXPERIMENTS[experimentKey as keyof typeof PALM_EXPERIMENTS]
  if (!experiment) return 'original'
  
  // 基于用户ID或随机数分配变体
  const hash = userId ? 
    userId.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 
    Math.random()
  
  const normalized = (hash % 100) / 100
  let cumulative = 0
  
  for (let i = 0; i < experiment.variants.length; i++) {
    const weight = experiment.weights[i]
    const variant = experiment.variants[i]
    if (weight !== undefined && variant !== undefined) {
      cumulative += weight
      if (normalized < cumulative) {
        return variant
      }
    }
  }
  
  return experiment.variants[0] || 'original'
}