/**
 * Multi-language subscription pricing data
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

import type { SubscriptionPlan } from '../../types';
import type { SubscriptionPlanIdType } from './SubscriptionPlans';
import { SUBSCRIPTION_PLANS } from './SubscriptionPlans';

// Supported locales matching Rolitt's i18n configuration
export type SupportedLocale = 'en' | 'es' | 'ja' | 'zh-HK';

// Localized plan translation
type SubscriptionPlanTranslation = {
  id: string;
  name: string;
  description: string;
  features: string[];
  limitations: string[];
  badge?: string; // e.g., "Most Popular", "Best Value"
};

// Multi-language pricing data structure
export const subscriptionPricingData: Record<SupportedLocale, Record<SubscriptionPlanIdType, {
  monthly: SubscriptionPlanTranslation;
  yearly: SubscriptionPlanTranslation;
}>> = {
  // English
  'en': {
    basic: {
      monthly: {
        id: 'basic_monthly',
        name: 'Basic',
        description: 'Essential AI companion features',
        features: [
          'Basic AI conversations',
          'Standard response time',
          'Email support',
          'Mobile app access',
        ],
        limitations: [
          'Limited conversation history',
          'Standard personality traits',
          'No voice interactions',
        ],
      },
      yearly: {
        id: 'basic_yearly',
        name: 'Basic',
        description: 'Essential AI companion features',
        badge: 'Save 17%',
        features: [
          'Basic AI conversations',
          'Standard response time',
          'Email support',
          'Mobile app access',
          '2 months free',
        ],
        limitations: [
          'Limited conversation history',
          'Standard personality traits',
          'No voice interactions',
        ],
      },
    },
    pro: {
      monthly: {
        id: 'pro_monthly',
        name: 'Pro',
        description: 'Advanced AI companion with premium features',
        badge: 'Most Popular',
        features: [
          'Advanced AI conversations',
          'Priority response time',
          'Voice interactions',
          'Personality customization',
          'Priority support',
          'Desktop app access',
        ],
        limitations: [
          'No video call capability',
          'Limited API access',
        ],
      },
      yearly: {
        id: 'pro_yearly',
        name: 'Pro',
        description: 'Advanced AI companion with premium features',
        badge: 'Most Popular • Save 17%',
        features: [
          'Advanced AI conversations',
          'Priority response time',
          'Voice interactions',
          'Personality customization',
          'Priority support',
          'Desktop app access',
          '2 months free',
        ],
        limitations: [
          'No video call capability',
          'Limited API access',
        ],
      },
    },
    premium: {
      monthly: {
        id: 'premium_monthly',
        name: 'Premium',
        description: 'Ultimate AI companion experience',
        features: [
          'Unlimited AI conversations',
          'Instant response time',
          'Advanced voice interactions',
          'Full personality customization',
          'Video call capability',
          'White-glove support',
          'Early access to new features',
          'Full API access',
        ],
        limitations: [],
      },
      yearly: {
        id: 'premium_yearly',
        name: 'Premium',
        description: 'Ultimate AI companion experience',
        badge: 'Best Value • Save 17%',
        features: [
          'Unlimited AI conversations',
          'Instant response time',
          'Advanced voice interactions',
          'Full personality customization',
          'Video call capability',
          'White-glove support',
          'Early access to new features',
          'Full API access',
          '2 months free',
        ],
        limitations: [],
      },
    },
  },

  // Spanish
  'es': {
    basic: {
      monthly: {
        id: 'basic_monthly',
        name: 'Básico',
        description: 'Funciones esenciales del compañero de IA',
        features: [
          'Conversaciones básicas de IA',
          'Tiempo de respuesta estándar',
          'Soporte por email',
          'Acceso a la app móvil',
        ],
        limitations: [
          'Historial de conversación limitado',
          'Rasgos de personalidad estándar',
          'Sin interacciones de voz',
        ],
      },
      yearly: {
        id: 'basic_yearly',
        name: 'Básico',
        description: 'Funciones esenciales del compañero de IA',
        badge: 'Ahorra 17%',
        features: [
          'Conversaciones básicas de IA',
          'Tiempo de respuesta estándar',
          'Soporte por email',
          'Acceso a la app móvil',
          '2 meses gratis',
        ],
        limitations: [
          'Historial de conversación limitado',
          'Rasgos de personalidad estándar',
          'Sin interacciones de voz',
        ],
      },
    },
    pro: {
      monthly: {
        id: 'pro_monthly',
        name: 'Pro',
        description: 'Compañero de IA avanzado con funciones premium',
        badge: 'Más Popular',
        features: [
          'Conversaciones avanzadas de IA',
          'Tiempo de respuesta prioritario',
          'Interacciones de voz',
          'Personalización de personalidad',
          'Soporte prioritario',
          'Acceso a la app de escritorio',
        ],
        limitations: [
          'Sin capacidad de videollamada',
          'Acceso limitado a la API',
        ],
      },
      yearly: {
        id: 'pro_yearly',
        name: 'Pro',
        description: 'Compañero de IA avanzado con funciones premium',
        badge: 'Más Popular • Ahorra 17%',
        features: [
          'Conversaciones avanzadas de IA',
          'Tiempo de respuesta prioritario',
          'Interacciones de voz',
          'Personalización de personalidad',
          'Soporte prioritario',
          'Acceso a la app de escritorio',
          '2 meses gratis',
        ],
        limitations: [
          'Sin capacidad de videollamada',
          'Acceso limitado a la API',
        ],
      },
    },
    premium: {
      monthly: {
        id: 'premium_monthly',
        name: 'Premium',
        description: 'Experiencia definitiva del compañero de IA',
        features: [
          'Conversaciones ilimitadas de IA',
          'Tiempo de respuesta instantáneo',
          'Interacciones avanzadas de voz',
          'Personalización completa de personalidad',
          'Capacidad de videollamada',
          'Soporte personalizado',
          'Acceso temprano a nuevas funciones',
          'Acceso completo a la API',
        ],
        limitations: [],
      },
      yearly: {
        id: 'premium_yearly',
        name: 'Premium',
        description: 'Experiencia definitiva del compañero de IA',
        badge: 'Mejor Valor • Ahorra 17%',
        features: [
          'Conversaciones ilimitadas de IA',
          'Tiempo de respuesta instantáneo',
          'Interacciones avanzadas de voz',
          'Personalización completa de personalidad',
          'Capacidad de videollamada',
          'Soporte personalizado',
          'Acceso temprano a nuevas funciones',
          'Acceso completo a la API',
          '2 meses gratis',
        ],
        limitations: [],
      },
    },
  },

  // Japanese
  'ja': {
    basic: {
      monthly: {
        id: 'basic_monthly',
        name: 'ベーシック',
        description: '基本的なAIコンパニオン機能',
        features: [
          '基本的なAI会話',
          '標準応答時間',
          'メールサポート',
          'モバイルアプリアクセス',
        ],
        limitations: [
          '会話履歴制限',
          '標準的な性格特性',
          '音声インタラクションなし',
        ],
      },
      yearly: {
        id: 'basic_yearly',
        name: 'ベーシック',
        description: '基本的なAIコンパニオン機能',
        badge: '17%お得',
        features: [
          '基本的なAI会話',
          '標準応答時間',
          'メールサポート',
          'モバイルアプリアクセス',
          '2ヶ月無料',
        ],
        limitations: [
          '会話履歴制限',
          '標準的な性格特性',
          '音声インタラクションなし',
        ],
      },
    },
    pro: {
      monthly: {
        id: 'pro_monthly',
        name: 'プロ',
        description: 'プレミアム機能付き高度なAIコンパニオン',
        badge: '最も人気',
        features: [
          '高度なAI会話',
          '優先応答時間',
          '音声インタラクション',
          '性格カスタマイズ',
          '優先サポート',
          'デスクトップアプリアクセス',
        ],
        limitations: [
          'ビデオ通話機能なし',
          '限定的なAPIアクセス',
        ],
      },
      yearly: {
        id: 'pro_yearly',
        name: 'プロ',
        description: 'プレミアム機能付き高度なAIコンパニオン',
        badge: '最も人気 • 17%お得',
        features: [
          '高度なAI会話',
          '優先応答時間',
          '音声インタラクション',
          '性格カスタマイズ',
          '優先サポート',
          'デスクトップアプリアクセス',
          '2ヶ月無料',
        ],
        limitations: [
          'ビデオ通話機能なし',
          '限定的なAPIアクセス',
        ],
      },
    },
    premium: {
      monthly: {
        id: 'premium_monthly',
        name: 'プレミアム',
        description: '究極のAIコンパニオン体験',
        features: [
          '無制限AI会話',
          '即座の応答時間',
          '高度な音声インタラクション',
          '完全な性格カスタマイズ',
          'ビデオ通話機能',
          'ホワイトグローブサポート',
          '新機能への早期アクセス',
          '完全なAPIアクセス',
        ],
        limitations: [],
      },
      yearly: {
        id: 'premium_yearly',
        name: 'プレミアム',
        description: '究極のAIコンパニオン体験',
        badge: '最高価値 • 17%お得',
        features: [
          '無制限AI会話',
          '即座の応答時間',
          '高度な音声インタラクション',
          '完全な性格カスタマイズ',
          'ビデオ通話機能',
          'ホワイトグローブサポート',
          '新機能への早期アクセス',
          '完全なAPIアクセス',
          '2ヶ月無料',
        ],
        limitations: [],
      },
    },
  },

  // Traditional Chinese (Hong Kong)
  'zh-HK': {
    basic: {
      monthly: {
        id: 'basic_monthly',
        name: '基礎版',
        description: '基本AI夥伴功能',
        features: [
          '基本AI對話',
          '標準響應時間',
          '電郵支援',
          '手機應用程式使用權',
        ],
        limitations: [
          '對話記錄限制',
          '標準個性特徵',
          '無語音互動',
        ],
      },
      yearly: {
        id: 'basic_yearly',
        name: '基礎版',
        description: '基本AI夥伴功能',
        badge: '節省17%',
        features: [
          '基本AI對話',
          '標準響應時間',
          '電郵支援',
          '手機應用程式使用權',
          '免費2個月',
        ],
        limitations: [
          '對話記錄限制',
          '標準個性特徵',
          '無語音互動',
        ],
      },
    },
    pro: {
      monthly: {
        id: 'pro_monthly',
        name: '專業版',
        description: '具備進階功能的高級AI夥伴',
        badge: '最受歡迎',
        features: [
          '進階AI對話',
          '優先響應時間',
          '語音互動',
          '個性定制',
          '優先支援',
          '桌面應用程式使用權',
        ],
        limitations: [
          '無視頻通話功能',
          'API使用權限制',
        ],
      },
      yearly: {
        id: 'pro_yearly',
        name: '專業版',
        description: '具備進階功能的高級AI夥伴',
        badge: '最受歡迎 • 節省17%',
        features: [
          '進階AI對話',
          '優先響應時間',
          '語音互動',
          '個性定制',
          '優先支援',
          '桌面應用程式使用權',
          '免費2個月',
        ],
        limitations: [
          '無視頻通話功能',
          'API使用權限制',
        ],
      },
    },
    premium: {
      monthly: {
        id: 'premium_monthly',
        name: '頂級版',
        description: '終極AI夥伴體驗',
        features: [
          '無限制AI對話',
          '即時響應時間',
          '進階語音互動',
          '完整個性定制',
          '視頻通話功能',
          '白手套支援',
          '新功能搶先體驗',
          '完整API使用權',
        ],
        limitations: [],
      },
      yearly: {
        id: 'premium_yearly',
        name: '頂級版',
        description: '終極AI夥伴體驗',
        badge: '最佳價值 • 節省17%',
        features: [
          '無限制AI對話',
          '即時響應時間',
          '進階語音互動',
          '完整個性定制',
          '視頻通話功能',
          '白手套支援',
          '新功能搶先體驗',
          '完整API使用權',
          '免費2個月',
        ],
        limitations: [],
      },
    },
  },
};

// Helper functions for localized pricing
export function getLocalizedPricingData(locale: SupportedLocale) {
  return subscriptionPricingData[locale] || subscriptionPricingData.en;
}

export function getLocalizedPlan(
  locale: SupportedLocale,
  planId: SubscriptionPlanIdType,
  interval: 'monthly' | 'yearly',
): SubscriptionPlanTranslation {
  const localizedData = getLocalizedPricingData(locale);
  return localizedData[planId][interval];
}

export function combineWithPricing(
  locale: SupportedLocale,
  planId: SubscriptionPlanIdType,
  interval: 'monthly' | 'yearly',
): SubscriptionPlan & SubscriptionPlanTranslation {
  const baseplan = SUBSCRIPTION_PLANS[planId][interval];
  const localizedPlan = getLocalizedPlan(locale, planId, interval);

  return {
    ...baseplan,
    ...localizedPlan,
  };
}

export function getAllLocalizedPlans(locale: SupportedLocale): Array<{
  id: SubscriptionPlanIdType;
  monthly: SubscriptionPlan & SubscriptionPlanTranslation;
  yearly: SubscriptionPlan & SubscriptionPlanTranslation;
  savings: number;
}> {
  return (['basic', 'pro', 'premium'] as SubscriptionPlanIdType[]).map((planId) => {
    const monthly = combineWithPricing(locale, planId, 'monthly');
    const yearly = combineWithPricing(locale, planId, 'yearly');

    const monthlyCost = monthly.amount * 12;
    const yearlyCost = yearly.amount;
    const savings = Math.round(((monthlyCost - yearlyCost) / monthlyCost) * 100);

    return {
      id: planId,
      monthly,
      yearly,
      savings,
    };
  });
}
