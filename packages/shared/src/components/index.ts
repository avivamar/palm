/**
 * Business component example using shared types
 * This demonstrates the preferred approach for new components
 */

import type * as React from 'react';
import type { AsyncState, Product, User } from '../types';
import type { CardProps } from '../ui';

// Business-specific component props using shared types
export type ProductCardProps = {
  product: Product;
  user?: User;
  onAddToCart?: (productId: string) => void;
  onViewDetails?: (productId: string) => void;
  loading?: boolean;
} & CardProps;

export type UserProfileProps = {
  user: User;
  onEdit?: () => void;
  onSave?: (userData: Partial<User>) => void;
  editMode?: boolean;
  saveState?: AsyncState<User>;
};

export type OrderSummaryProps = {
  items: Array<{
    product: Product;
    quantity: number;
  }>;
  total: number;
  currency: string;
  onCheckout?: () => void;
  checkoutState?: AsyncState<any>;
};

// Layout component props
export type PageHeaderProps = {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
  }>;
  actions?: React.ReactNode;
} & CardProps;

export type SidebarProps = {
  collapsed?: boolean;
  onToggle?: () => void;
  navigation: Array<{
    key: string;
    label: string;
    icon?: React.ReactNode;
    href?: string;
    children?: Array<{
      key: string;
      label: string;
      href: string;
    }>;
  }>;
  activeKey?: string;
};

// Form component props using shared validation types
export type ContactFormProps = {
  onSubmit: (data: ContactFormData) => void;
  initialData?: Partial<ContactFormData>;
  submitState?: AsyncState<any>;
};

export type ContactFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message: string;
  subject: string;
};

// Dashboard component props
export type DashboardStatsProps = {
  stats: Array<{
    key: string;
    label: string;
    value: string | number;
    change?: {
      value: number;
      type: 'increase' | 'decrease';
      period: string;
    };
    icon?: React.ReactNode;
  }>;
  loading?: boolean;
};

export type ChartContainerProps = {
  title: string;
  data: any[];
  type: 'line' | 'bar' | 'pie' | 'area';
  height?: number;
  loading?: boolean;
} & CardProps;