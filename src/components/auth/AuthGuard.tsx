'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type AuthGuardProps = {
  children: React.ReactNode;
  redirectIfAuthenticated?: boolean;
  redirectTo?: string;
};

/**
 * AuthGuard component to handle authentication-based redirects
 *
 * @param redirectIfAuthenticated - If true, redirects authenticated users away from this page
 * @param redirectTo - Where to redirect (default: '/dashboard' for auth pages, '/sign-in' for protected pages)
 */
export function AuthGuard({
  children,
  redirectIfAuthenticated = false,
  redirectTo,
}: AuthGuardProps) {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't do anything while auth is loading or not initialized
    if (loading || !initialized) {
      return;
    }

    // If redirectIfAuthenticated is true and user is logged in, redirect away
    if (redirectIfAuthenticated && user) {
      const defaultRedirect = redirectTo || '/dashboard';
      console.log(`Redirecting authenticated user from ${pathname} to ${defaultRedirect}`);
      router.replace(defaultRedirect);
      return;
    }

    // If redirectIfAuthenticated is false and user is not logged in, redirect to sign-in
    if (!redirectIfAuthenticated && !user) {
      const defaultRedirect = redirectTo || `/sign-in?redirect=${encodeURIComponent(pathname)}`;
      console.log(`Redirecting unauthenticated user from ${pathname} to ${defaultRedirect}`);
      router.replace(defaultRedirect);
    }
  }, [user, loading, initialized, redirectIfAuthenticated, redirectTo, router, pathname]);

  // Show loading while auth is initializing
  if (loading || !initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If redirectIfAuthenticated is true and user is authenticated, don't render children
  // (they will be redirected anyway)
  if (redirectIfAuthenticated && user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If redirectIfAuthenticated is false and user is not authenticated, don't render children
  // (they will be redirected anyway)
  if (!redirectIfAuthenticated && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // User is in the correct state, render children
  return <>{children}</>;
}
