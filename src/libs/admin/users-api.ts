/**
 * Users API Client
 * Following CLAUDE.md: 商业价值优先，最小化代码，清晰类型定义
 */

export type UsersApiResponse = {
  users: Array<{
    id: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    role: 'customer' | 'admin' | 'moderator';
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type UsersApiParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
};

export async function fetchUsers(params: UsersApiParams = {}): Promise<UsersApiResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set('page', params.page.toString());
  }
  if (params.limit) {
    searchParams.set('limit', params.limit.toString());
  }
  if (params.search) {
    searchParams.set('search', params.search);
  }
  if (params.role) {
    searchParams.set('role', params.role);
  }

  const response = await fetch(`/api/admin/users?${searchParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function createUser(userData: {
  email: string;
  displayName?: string;
  role?: 'customer' | 'admin' | 'moderator';
}): Promise<{ user: any }> {
  const response = await fetch('/api/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error(`Failed to create user: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
