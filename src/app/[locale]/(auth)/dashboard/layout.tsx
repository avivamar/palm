'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { locale } = await params;
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();

        if (!response.ok || !data.isAuthenticated) {
          router.push(`/${locale}/sign-in`);
          return;
        }

        if (!data.isVerified) {
          router.push(`/${locale}/verify-email`);
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push(`/${locale}/sign-in`);
      }
    };
    checkAuth();
  }, [router, params]);

  if (!isAuthorized) {
    // You can return a loading skeleton here
    return (
      <div className="p-8">
        <Skeleton className="h-12 w-1/4" />
        <Skeleton className="h-8 w-full mt-4" />
        <Skeleton className="h-8 w-full mt-2" />
      </div>
    );
  }

  return <>{children}</>;
}
