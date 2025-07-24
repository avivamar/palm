// 分析工具配置类型
export type AnalyticsConfig = {
  googleAnalytics?: {
    measurementId: string;
    enabled: boolean;
  };
  metaPixel?: {
    pixelId: string;
    enabled: boolean;
  };
  clarity?: {
    projectId: string;
    enabled: boolean;
  };
  tiktokPixel?: {
    pixelId: string;
    enabled: boolean;
  };
  klaviyo?: {
    companyId: string;
    enabled: boolean;
  };
};

// 事件参数类型
export type EventParameters = {
  [key: string]: string | number | boolean | undefined;
};

// 电商事件类型
export type EcommerceItem = {
  item_id: string;
  item_name: string;
  category?: string;
  quantity?: number;
  price?: number;
  variant?: string;
  brand?: string;
};

export type PurchaseEvent = {
  transaction_id: string;
  value: number;
  currency: string;
  items: EcommerceItem[];
  coupon?: string;
  shipping?: number;
  tax?: number;
};

export type AddToCartEvent = {
  currency: string;
  value: number;
  items: EcommerceItem[];
};

export type BeginCheckoutEvent = {
  currency: string;
  value: number;
  items: EcommerceItem[];
  coupon?: string;
};

// 用户属性类型
export type UserProperties = {
  user_id?: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  age?: number;
  gender?: string;
  country?: string;
  city?: string;
  [key: string]: string | number | boolean | undefined;
};

// 页面浏览事件类型
export type PageViewEvent = {
  page_title: string;
  page_location: string;
  page_referrer?: string;
  language?: string;
  screen_resolution?: string;
  user_agent?: string;
};

// 自定义事件类型
export type CustomEvent = {
  name: string;
  parameters?: EventParameters;
  value?: number;
  currency?: string;
};

// 表单事件类型
export type FormEvent = {
  form_id?: string;
  form_name?: string;
  form_action?: string;
  input_name?: string;
  success?: boolean;
  error_message?: string;
};

// 媒体事件类型
export type MediaEvent = {
  video_title?: string;
  video_url?: string;
  video_duration?: number;
  video_current_time?: number;
  video_percent?: number;
  audio_title?: string;
  audio_url?: string;
};

// 搜索事件类型
export type SearchEvent = {
  search_term: string;
  search_results?: number;
  search_category?: string;
};

// 社交分享事件类型
export type ShareEvent = {
  method: string; // 'facebook', 'twitter', 'email', etc.
  content_type: string;
  item_id?: string;
  content_title?: string;
  content_url?: string;
};

// 错误事件类型
export type ErrorEvent = {
  error_message: string;
  error_code?: string;
  error_category?: string;
  page_location?: string;
  user_agent?: string;
};

// 性能事件类型
export type PerformanceEvent = {
  metric_name: string; // 'LCP', 'FID', 'CLS', etc.
  metric_value: number;
  metric_unit?: string;
  page_location?: string;
};

// 分析提供者接口
export type AnalyticsProvider = {
  name: string;
  enabled: boolean;
  initialize: () => Promise<void> | void;
  trackEvent: (event: CustomEvent) => void;
  trackPageView: (event: PageViewEvent) => void;
  trackPurchase?: (event: PurchaseEvent) => void;
  trackUser?: (properties: UserProperties) => void;
  setUserId?: (userId: string) => void;
};

// 分析管理器接口
export type AnalyticsManager = {
  providers: AnalyticsProvider[];
  initialize: () => Promise<void>;
  trackEvent: (event: CustomEvent) => void;
  trackPageView: (event: PageViewEvent) => void;
  trackPurchase: (event: PurchaseEvent) => void;
  trackUser: (properties: UserProperties) => void;
  addProvider: (provider: AnalyticsProvider) => void;
  removeProvider: (providerName: string) => void;
  getProvider: (providerName: string) => AnalyticsProvider | undefined;
};

// 环境配置类型
export type EnvironmentConfig = {
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  enableDebugMode: boolean;
  enableConsentMode: boolean;
};

// 同意管理类型
export type ConsentSettings = {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  necessary: boolean;
};

// 调试信息类型
export type DebugInfo = {
  timestamp: number;
  event: CustomEvent;
  provider: string;
  success: boolean;
  error?: string;
};
