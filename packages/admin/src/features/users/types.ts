/**
 * Users module types
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

export type User = {
  id: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  role: 'customer' | 'admin' | 'moderator';
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  authSource: 'firebase' | 'supabase';
};

export type UserStats = {
  title: string;
  value: string;
  change: string;
  description: string;
  icon: any;
};

export type UsersPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type UsersTranslations = {
  title: string;
  description: string;
  actions: {
    addUser: string;
  };
  search: {
    placeholder: string;
  };
  table: {
    title: string;
    description: string;
    headers: {
      user: string;
      role: string;
      status: string;
      joined: string;
      lastLogin: string;
    };
    status: {
      verified: string;
      pending: string;
    };
  };
};
