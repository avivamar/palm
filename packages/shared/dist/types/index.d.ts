export type BaseEntity = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
};
export type ApiResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
};
export type PaginationParams = {
    page: number;
    limit: number;
    sort?: string;
    order?: 'asc' | 'desc';
};
export type PaginatedResponse<T> = {
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
} & ApiResponse<T[]>;
export type Status = 'pending' | 'in_progress' | 'completed' | 'failed';
export type HealthStatus = 'healthy' | 'warning' | 'critical';
export type UserRole = 'customer' | 'admin' | 'beta_tester';
export type Locale = 'en' | 'es' | 'ja' | 'zh-HK';
export type AdminUser = {
    id: string;
    email: string;
    role: UserRole;
    permissions: string[];
    lastLoginAt?: Date;
};
export type ModuleState<T = any> = {
    loaded: boolean;
    loading?: boolean;
    data?: T;
    error?: string;
};
export type PackageContract = {
    name: string;
    version: string;
    exports: Record<string, any>;
};
export type Product = {
    id: string;
    name: string;
    description?: string;
    price: number;
    currency: string;
    images: string[];
    status: 'active' | 'inactive' | 'draft';
    createdAt: Date;
    updatedAt: Date;
};
export type Order = {
    id: string;
    userId: string;
    products: Array<{
        productId: string;
        quantity: number;
        price: number;
    }>;
    total: number;
    currency: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shippingAddress?: Address;
    billingAddress?: Address;
    createdAt: Date;
    updatedAt: Date;
};
export type Address = {
    id?: string;
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: string;
};
export type User = {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role: UserRole;
    preferences: {
        locale: Locale;
        notifications: boolean;
        marketing: boolean;
    };
    addresses: Address[];
    createdAt: Date;
    updatedAt: Date;
};
export type ApiError = {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: Date;
};
export type ApiResponseWithMeta<T = any> = ApiResponse<T> & {
    meta?: {
        requestId: string;
        timestamp: Date;
        version: string;
    };
};
export type ValidationError = {
    field: string;
    message: string;
    code: string;
};
export type FormState<T = any> = {
    data: T;
    errors: ValidationError[];
    isSubmitting: boolean;
    isValid: boolean;
};
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type AsyncState<T = any> = {
    state: LoadingState;
    data?: T;
    error?: ApiError;
    lastUpdated?: Date;
};
//# sourceMappingURL=index.d.ts.map