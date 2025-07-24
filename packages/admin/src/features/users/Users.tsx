/**
 * Users Feature Component
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

'use client';

import type { User, UsersPagination, UserStats, UsersTranslations } from './types';
import { Activity, Calendar, MoreHorizontal, Search, Shield, User as UserIcon, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useAdminStore } from '../../stores/admin-store';

type UsersProps = {
  locale: string;
  translations: UsersTranslations;
  users: User[];
  searchQuery?: string;
  pagination?: UsersPagination;
};

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case 'admin':
      return 'destructive' as const;
    case 'moderator':
      return 'default' as const;
    case 'customer':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
}

function UserTable({ users, translations, searchQuery }: {
  users: User[];
  translations: UsersTranslations;
  searchQuery: string;
}) {
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
    || user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          {translations.table.title}
        </CardTitle>
        <CardDescription>
          {translations.table.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <div className="grid grid-cols-6 gap-4 p-4 font-medium border-b bg-muted/50">
            <div>{translations.table.headers.user}</div>
            <div>{translations.table.headers.role}</div>
            <div>{translations.table.headers.status}</div>
            <div>{translations.table.headers.joined}</div>
            <div>{translations.table.headers.lastLogin}</div>
            <div className="w-[50px]"></div>
          </div>
          {filteredUsers.map(user => (
            <div key={user.id} className="grid grid-cols-6 gap-4 p-4 border-b last:border-b-0 hover:bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  {user.photoURL
                    ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName || user.email}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )
                    : (
                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                </div>
                <div>
                  <div className="font-medium">
                    {user.displayName || 'Unnamed User'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user.email}
                  </div>
                </div>
              </div>
              <div>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role}
                </Badge>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    user.emailVerified ? 'bg-green-500' : 'bg-yellow-500',
                  )}
                  />
                  <span className="text-sm">
                    {user.emailVerified ? translations.table.status.verified : translations.table.status.pending}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {user.createdAt.toLocaleDateString()}
                </div>
              </div>
              <div>
                {user.lastLoginAt
                  ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Activity className="h-3 w-3" />
                        {user.lastLoginAt.toLocaleDateString()}
                      </div>
                    )
                  : (
                      <span className="text-sm text-muted-foreground">Never</span>
                    )}
              </div>
              <div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function UserStats() {
  const [stats, setStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/users/stats');
        if (response.ok) {
          const data = await response.json();
          setStats([
            {
              title: 'Total Users',
              value: data.totalUsers.toLocaleString(),
              change: data.totalUsersChange,
              description: 'from last month',
              icon: UserIcon,
            },
            {
              title: 'Admin Users',
              value: data.adminUsers.toString(),
              change: data.adminUsersChange,
              description: 'from last month',
              icon: Shield,
            },
            {
              title: 'New This Month',
              value: data.newThisMonth.toLocaleString(),
              change: data.newThisMonthChange,
              description: 'from last month',
              icon: UserPlus,
            },
            {
              title: 'Active Today',
              value: data.activeToday.toLocaleString(),
              change: data.activeTodayChange,
              description: 'from yesterday',
              icon: Activity,
            },
          ]);
        } else {
          // Fallback to mock data if API fails
          setStats([
            { title: 'Total Users', value: '0', change: '0%', description: 'API Error', icon: UserIcon },
            { title: 'Admin Users', value: '0', change: '0%', description: 'API Error', icon: Shield },
            { title: 'New This Month', value: '0', change: '0%', description: 'API Error', icon: UserPlus },
            { title: 'Active Today', value: '0', change: '0%', description: 'API Error', icon: Activity },
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
        // Fallback to mock data
        setStats([
          { title: 'Total Users', value: '0', change: '0%', description: 'Connection Error', icon: UserIcon },
          { title: 'Admin Users', value: '0', change: '0%', description: 'Connection Error', icon: Shield },
          { title: 'New This Month', value: '0', change: '0%', description: 'Connection Error', icon: UserPlus },
          { title: 'Active Today', value: '0', change: '0%', description: 'Connection Error', icon: Activity },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(index => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span>
                {' '}
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function Users({ translations, users, searchQuery = '', pagination }: UsersProps) {
  const { actions } = useAdminStore();
  const [currentSearchQuery, setCurrentSearchQuery] = useState(searchQuery);

  useEffect(() => {
    // Load users module on mount
    actions.loadModule('users');
  }, [actions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{translations.title}</h1>
          <p className="text-muted-foreground">
            {translations.description}
            {pagination && (
              <span className="ml-2 text-sm">
                (
                {pagination.total}
                {' '}
                total users)
              </span>
            )}
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          {translations.actions.addUser}
        </Button>
      </div>

      {/* User Statistics */}
      <UserStats />

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search and Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={translations.search.placeholder}
                value={currentSearchQuery}
                onChange={e => setCurrentSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline">
              Filter by Role
            </Button>
            <Button variant="outline">
              Filter by Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <UserTable
        users={users}
        translations={translations}
        searchQuery={currentSearchQuery}
      />

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing
                {' '}
                {((pagination.page - 1) * pagination.limit) + 1}
                {' '}
                to
                {' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)}
                {' '}
                of
                {' '}
                {pagination.total}
                {' '}
                users
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      const url = new URL(window.location.href);
                      url.searchParams.set('page', (pagination.page - 1).toString());
                      window.location.href = url.toString();
                    }
                  }}
                >
                  Previous
                </Button>
                <div className="text-sm">
                  Page
                  {' '}
                  {pagination.page}
                  {' '}
                  of
                  {' '}
                  {pagination.pages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      const url = new URL(window.location.href);
                      url.searchParams.set('page', (pagination.page + 1).toString());
                      window.location.href = url.toString();
                    }
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
