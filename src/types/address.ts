// 地址相关的 TypeScript 类型定义

export type Address = {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
};

export type ShippingAddress = {
  name: string;
  address: Address;
};

export type BillingAddress = {
  name: string;
  email?: string;
  phone?: string;
  address: Address;
};

// 预订数据结构
export type PreorderData = {
  id: string;
  email: string;
  color: string;
  priceId: string;
  amount?: number;
  currency?: string;
  preorder_number?: string;
  session_id?: string;
  payment_intent_id?: string;
  status: 'initiated' | 'completed' | 'failed' | 'cancelled';
  shipping_address?: ShippingAddress;
  billing_address?: BillingAddress;
  createdAt: Date;
  updatedAt: Date;
};

// Klaviyo 事件数据结构 - 仅包含基本地理信息
export type KlaviyoPreorderEventData = {
  color: string;
  preorder_id: string;
  locale: string;
  amount: number;
  currency: string;
  session_id: string;
  shipping_address?: {
    city?: string;
    state?: string;
    country?: string;
  };
  billing_address?: {
    city?: string;
    state?: string;
    country?: string;
  };
};
