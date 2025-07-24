/**
 * Admin Users Page - Updated to use Admin Package
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

import type { User } from '@rolitt/admin';
import { Users } from '@rolitt/admin';
import { getTranslations } from 'next-intl/server';
import { fetchUsers } from '@/libs/admin/users-api';

// Force dynamic rendering for admin users page
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function UsersPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { q: searchQuery = '', page = '1', role = '' } = await searchParams;

  // Fetch translations and real user data
  const [t, usersResponse] = await Promise.all([
    getTranslations('admin'),
    fetchUsers({
      page: Number.parseInt(page as string),
      limit: 20,
      search: searchQuery as string,
      role: role as string,
    }).catch((error) => {
      console.error('Failed to fetch users:', error);
      // Fallback to empty data if API fails
      return {
        users: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 0 },
      };
    }),
  ]);

  // Transform API response to match component interface
  const users: User[] = usersResponse.users.map(user => ({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: user.role,
    emailVerified: user.emailVerified,
    createdAt: new Date(user.createdAt),
    lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : null,
    authSource: 'supabase' as const, // Default since API doesn't return this
  }));

  // Build translations object for the users component
  const translations = {
    title: t('users.title'),
    description: t('users.description'),
    actions: {
      addUser: t('users.actions.addUser'),
    },
    search: {
      placeholder: t('users.search.placeholder'),
    },
    table: {
      title: t('users.table.title'),
      description: t('users.table.description'),
      headers: {
        user: t('users.table.headers.user'),
        role: t('users.table.headers.role'),
        status: t('users.table.headers.status'),
        joined: t('users.table.headers.joined'),
        lastLogin: t('users.table.headers.lastLogin'),
      },
      status: {
        verified: t('users.table.status.verified'),
        pending: t('users.table.status.pending'),
      },
    },
  };

  return (
    <Users
      locale={locale}
      translations={translations}
      users={users}
      searchQuery={searchQuery as string}
      pagination={usersResponse.pagination}
    />
  );
}
