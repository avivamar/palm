// Supabase 数据库类型定义 (基于 email 统一标识符)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string; // nanoid，平台无关
          email: string; // 核心统一标识符
          display_name: string | null;
          photo_url: string | null;
          role: string;
          phone: string | null;
          country: string | null;
          marketing_consent: boolean;
          email_verified: boolean;
          last_login_at: string | null;

          // 认证平台关联字段
          firebase_uid: string | null;
          supabase_id: string | null; // 仅用于关联，非主要标识符
          auth_source: string;

          // 支付平台集成字段
          stripe_customer_id: string | null;
          paypal_customer_id: string | null;

          // 电商平台集成字段
          shopify_customer_id: string | null;

          // 营销平台集成字段
          klaviyo_profile_id: string | null;

          // 用户行为数据
          referral_code: string | null;
          referral_count: number;

          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string; // 必需，核心标识符
          display_name?: string | null;
          photo_url?: string | null;
          role?: string;
          phone?: string | null;
          country?: string | null;
          marketing_consent?: boolean;
          email_verified?: boolean;
          last_login_at?: string | null;

          // 认证平台关联字段
          firebase_uid?: string | null;
          supabase_id?: string | null;
          auth_source?: string;

          // 支付平台集成字段
          stripe_customer_id?: string | null;
          paypal_customer_id?: string | null;

          // 电商平台集成字段
          shopify_customer_id?: string | null;

          // 营销平台集成字段
          klaviyo_profile_id?: string | null;

          // 用户行为数据
          referral_code?: string | null;
          referral_count?: number;

          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          photo_url?: string | null;
          role?: string;
          phone?: string | null;
          country?: string | null;
          marketing_consent?: boolean;
          email_verified?: boolean;
          last_login_at?: string | null;

          // 认证平台关联字段
          firebase_uid?: string | null;
          supabase_id?: string | null;
          auth_source?: string;

          // 支付平台集成字段
          stripe_customer_id?: string | null;
          paypal_customer_id?: string | null;

          // 电商平台集成字段
          shopify_customer_id?: string | null;

          // 营销平台集成字段
          klaviyo_profile_id?: string | null;

          // 用户行为数据
          referral_code?: string | null;
          referral_count?: number;

          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      auth_source: 'supabase' | 'firebase' | 'unified';
      user_role: 'customer' | 'admin' | 'moderator';
    };
  };
};

// 用户相关类型
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

// 统一认证用户类型 (基于 email)
export type AuthUser = {
  id: string; // nanoid
  email: string; // 核心标识符，跨平台唯一
  name?: string;
  displayName?: string; // 向后兼容
  avatar_url?: string;
  photoURL?: string; // 向后兼容
  emailVerified?: boolean; // 向后兼容
  auth_source: 'supabase' | 'firebase' | 'unified';

  // 平台关联 ID (可选)
  firebase_uid?: string;
  supabase_id?: string;
  stripe_customer_id?: string;
  shopify_customer_id?: string;
  klaviyo_profile_id?: string;

  // 向后兼容的元数据
  metadata?: Record<string, any>;

  // 向后兼容的 uid 属性
  uid?: string; // 映射到 id 字段
};

export type AuthResult = {
  user: AuthUser | null;
  session: any | null;
  error?: string;
};

export type AuthError = {
  code?: string;
} & Error;

// 用户同步数据类型
export type UserSyncData = {
  email: string; // 核心标识符
  name?: string;
  avatar_url?: string;
  auth_source: 'supabase' | 'firebase' | 'unified';

  // 平台特定数据
  firebase_uid?: string;
  supabase_id?: string;
  stripe_customer_id?: string;
  shopify_customer_id?: string;
  klaviyo_profile_id?: string;
};
