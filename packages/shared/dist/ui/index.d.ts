import * as React from 'react';
export { cn } from '../utils';
export type SharedUIProps = {
    className?: string;
    children?: React.ReactNode;
};
export type ComponentSize = 'sm' | 'md' | 'lg' | 'xl';
export type ComponentVariant = 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
export type AlertProps = {
    variant?: 'default' | 'destructive' | 'warning' | 'info';
    title?: string;
    description?: string;
} & SharedUIProps;
export type BadgeProps = {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
    size?: 'sm' | 'md' | 'lg';
} & SharedUIProps;
export type ButtonProps = {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    disabled?: boolean;
    loading?: boolean;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    type?: 'button' | 'submit' | 'reset';
} & SharedUIProps;
export type CardProps = {
    variant?: 'default' | 'elevated' | 'outlined';
    padding?: ComponentSize;
} & SharedUIProps;
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
export type FormFieldProps = {
    name: string;
    label?: string;
    required?: boolean;
    error?: string;
    helperText?: string;
} & SharedUIProps;
export type DialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
} & SharedUIProps;
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
export type LayoutProps = {
    header?: React.ReactNode;
    sidebar?: React.ReactNode;
    footer?: React.ReactNode;
    sidebarCollapsed?: boolean;
    onSidebarToggle?: () => void;
} & SharedUIProps;
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
//# sourceMappingURL=index.d.ts.map