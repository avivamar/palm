/**
 * Package communication contracts
 * Defines interfaces for inter-package communication
 */

import type { AdminUser, ApiResponse, ModuleState } from '../types';

/**
 * Main app to admin package communication contract
 */
export type MainToAdminContract = {
  // User data
  getCurrentUser: () => Promise<AdminUser | null>;
  getUserPermissions: (userId: string) => Promise<string[]>;

  // Navigation
  navigateToMain: (path: string) => void;

  // Shared services
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
};

/**
 * Admin package to main app communication contract
 */
export type AdminToMainContract = {
  // Events
  onUserUpdated: (user: AdminUser) => void;
  onModuleStateChanged: (module: string, state: ModuleState) => void;

  // Data requests
  requestUserData: (userId: string) => Promise<ApiResponse>;
  requestModuleData: (module: string) => Promise<ApiResponse>;
};

/**
 * Shared data access contract
 */
export type DataAccessContract = {
  // CRUD operations
  create: <T>(entity: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<T>;
  read: <T>(entity: string, id: string) => Promise<T | null>;
  update: <T>(entity: string, id: string, data: Partial<T>) => Promise<T>;
  delete: (entity: string, id: string) => Promise<void>;

  // Query operations
  query: <T>(entity: string, filters?: Record<string, any>) => Promise<T[]>;
  count: (entity: string, filters?: Record<string, any>) => Promise<number>;
};
