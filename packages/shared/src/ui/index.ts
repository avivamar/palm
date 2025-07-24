/**
 * Shared UI type definitions and re-exports
 * Following .cursorrules rule #104: "将 shadcn/ui 组件放置在 components/ui/ 目录"
 *
 * Note: This file provides type definitions for UI components.
 * The actual components are imported from the main app during runtime.
 */

import * as React from 'react';

// Re-export utility function
export { cn } from '../utils';

// Common UI component props interfaces
export type SharedUIProps = {
  className?: string;
  children?: React.ReactNode;
};

// Enhanced component variant types
export type ComponentSize = 'sm' | 'md' | 'lg' | 'xl';
export type ComponentVariant = 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';

// Alert component variants
export type AlertProps = {
  variant?: 'default' | 'destructive' | 'warning' | 'info';
  title?: string;
  description?: string;
} & SharedUIProps;

// Badge component variants
export type BadgeProps = {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
} & SharedUIProps;

// Button component variants
export type ButtonProps = {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
} & SharedUIProps;

// Card component variants
export type CardProps = {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: ComponentSize;
} & SharedUIProps;

// Input component variants
export type InputProps = {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
} & SharedUIProps;

// Form component types
export type FormFieldProps = {
  name: string;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
} & SharedUIProps;

// Modal/Dialog component types
export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
} & SharedUIProps;

// Table component types
export type TableColumn<T = any> = {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
};

export type TableProps<T = any> = {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  rowKey?: string | ((record: T) => string);
  onRow?: (record: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>;
} & SharedUIProps;

// Toast/Notification types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastProps = {
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
};

// Layout component types
export type LayoutProps = {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: () => void;
} & SharedUIProps;

// Navigation types
export type NavItem = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  children?: NavItem[];
  disabled?: boolean;
  badge?: string | number;
};

export type NavigationProps = {
  items: NavItem[];
  activeKey?: string;
  mode?: 'horizontal' | 'vertical';
  collapsed?: boolean;
} & SharedUIProps;
