// Firebase 用户类型定义
export type UserProfile = {
  // 基础身份信息
  uid: string; // Firebase uid
  email: string; // 登录邮箱
  displayName: string; // 用户名称
  photoURL?: string; // 头像URL
  provider: 'google' | 'email' | 'apple'; // 登录方式

  // 系统对应关系

  stripeCustomerId?: string; // Stripe Customer ID (后续扩展)

  // 用户角色与权限
  role: 'customer' | 'admin' | 'beta_tester'; // 权限角色
  subscriptionPlan?: 'free' | 'pro' | 'premium'; // 订阅等级
  subscriptionStatus?: 'active' | 'cancelled' | 'past_due'; // 订阅状态

  // 用户偏好
  preferences: {
    language: string; // 界面语言 (zh-HK, en, etc.)
    currency: string; // 货币偏好
    timezone: string; // 时区
    newsletter: boolean; // 邮件订阅
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };

  // 元数据
  metadata: {
    source: 'web' | 'mobile' | 'pre_order'; // 来源渠道
    referralCode?: string; // 推荐码
    createdAt: Date;
    lastLoginAt: Date;
    lastOrderAt?: Date;
    totalOrders: number;
    totalSpent: {
      amount: string;
      currencyCode: string;
    };
  };
};

// 用户同步状态
export type UserSyncStatus = {
  firebase: boolean;

  lastSyncAt: Date;
  error?: string;
};
