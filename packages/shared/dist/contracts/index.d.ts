import type { AdminUser, ApiResponse, ModuleState } from '../types';
export type MainToAdminContract = {
    getCurrentUser: () => Promise<AdminUser | null>;
    getUserPermissions: (userId: string) => Promise<string[]>;
    navigateToMain: (path: string) => void;
    showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
};
export type AdminToMainContract = {
    onUserUpdated: (user: AdminUser) => void;
    onModuleStateChanged: (module: string, state: ModuleState) => void;
    requestUserData: (userId: string) => Promise<ApiResponse>;
    requestModuleData: (module: string) => Promise<ApiResponse>;
};
export type DataAccessContract = {
    create: <T>(entity: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<T>;
    read: <T>(entity: string, id: string) => Promise<T | null>;
    update: <T>(entity: string, id: string, data: Partial<T>) => Promise<T>;
    delete: (entity: string, id: string) => Promise<void>;
    query: <T>(entity: string, filters?: Record<string, any>) => Promise<T[]>;
    count: (entity: string, filters?: Record<string, any>) => Promise<number>;
};
//# sourceMappingURL=index.d.ts.map