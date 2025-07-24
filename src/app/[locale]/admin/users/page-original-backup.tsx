import { Activity, Calendar, MoreHorizontal, Search, Shield, User as UserIcon, UserPlus } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

type User = {
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

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case 'admin':
      return 'destructive';
    case 'moderator':
      return 'default';
    case 'customer':
      return 'secondary';
    default:
      return 'outline';
  }
}

function UserTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  );
}

// Mock data - in real app, this would come from your database
function getMockUsers(): User[] {
  return [
    {
      id: '1',
      email: 'aviva.mar@gmail.com',
      displayName: 'Aviva Mar',
      photoURL: null,
      role: 'admin',
      emailVerified: true,
      createdAt: new Date('2024-01-15'),
      lastLoginAt: new Date(),
      authSource: 'supabase',
    },
    {
      id: '2',
      email: 'customer1@example.com',
      displayName: 'John Doe',
      photoURL: null,
      role: 'customer',
      emailVerified: true,
      createdAt: new Date('2024-03-20'),
      lastLoginAt: new Date('2025-01-10'),
      authSource: 'firebase',
    },
    {
      id: '3',
      email: 'moderator@example.com',
      displayName: 'Jane Smith',
      photoURL: null,
      role: 'moderator',
      emailVerified: false,
      createdAt: new Date('2024-05-10'),
      lastLoginAt: new Date('2025-01-08'),
      authSource: 'supabase',
    },
  ];
}

async function UserTable({ searchQuery }: { searchQuery: string }) {
  // In real app, this would be a database query
  const users = getMockUsers();

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
    || user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const t = await getTranslations('admin.users');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          {t('table.title')}
        </CardTitle>
        <CardDescription>
          {t('table.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('table.headers.user')}</TableHead>
              <TableHead>{t('table.headers.role')}</TableHead>
              <TableHead>{t('table.headers.status')}</TableHead>
              <TableHead>{t('table.headers.joined')}</TableHead>
              <TableHead>{t('table.headers.lastLogin')}</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell>
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
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      user.emailVerified ? 'bg-green-500' : 'bg-yellow-500',
                    )}
                    />
                    <span className="text-sm">
                      {user.emailVerified ? t('table.status.verified') : t('table.status.pending')}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {user.createdAt.toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <UserIcon className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Shield className="mr-2 h-4 w-4" />
                        Change Role
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Deactivate User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function UserStats() {
  // Mock stats - in real app, this would come from your database
  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+20.1%',
      description: 'from last month',
      icon: UserIcon,
    },
    {
      title: 'Admin Users',
      value: '5',
      change: '+1',
      description: 'from last month',
      icon: Shield,
    },
    {
      title: 'New This Month',
      value: '247',
      change: '+12.5%',
      description: 'from last month',
      icon: UserPlus,
    },
    {
      title: 'Active Today',
      value: '89',
      change: '+5.2%',
      description: 'from yesterday',
      icon: Activity,
    },
  ];

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

export default async function UsersPage({ searchParams }: Omit<Props, 'params'>) {
  const { q: searchQuery = '' } = await searchParams;
  const t = await getTranslations('admin.users');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          {t('actions.addUser')}
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
                placeholder={t('search.placeholder')}
                value={searchQuery}
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
      <Suspense fallback={<UserTableSkeleton />}>
        <UserTable searchQuery={searchQuery as string} />
      </Suspense>
    </div>
  );
}
