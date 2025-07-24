'use client';

import { LogOut, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import Link from 'next/link';

import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

type AuthStatusProps = {
  onAuthChange?: (isAuthenticated: boolean) => void;
  isMobile?: boolean;
  onMobileMenuToggle?: () => void;
};

function AuthStatusComponent({ onAuthChange, isMobile = false, onMobileMenuToggle }: AuthStatusProps) {
  const tAuth = useTranslations('Auth.Navbar');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setError(null);

        // 直接检查认证状态，移除不必要的测试API调用
        const authResponse = await fetch('/api/auth/session', {
          method: 'GET',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json',
          },
          // 添加超时和错误处理
          signal: AbortSignal.timeout(10000), // 10秒超时
        });

        if (authResponse.ok) {
          const data = await authResponse.json();
          const authenticated = data.isAuthenticated || false;
          setIsAuthenticated(authenticated);
          onAuthChange?.(authenticated);
        } else {
          // 对于非200状态码，仍然设置为未认证但不显示错误
          console.warn('Auth check failed with status:', authResponse.status);
          setIsAuthenticated(false);
          onAuthChange?.(false);
        }
      } catch (error) {
        // 网络错误或超时时，静默失败，不显示错误给用户
        console.warn('Auth check failed:', error);
        setIsAuthenticated(false);
        onAuthChange?.(false);
        // 不设置error状态，避免显示错误UI
      } finally {
        setIsLoading(false);
      }
    };

    // 添加延迟以避免在SSR期间立即执行
    const timeoutId = setTimeout(checkAuthStatus, 100);
    return () => clearTimeout(timeoutId);
  }, [onAuthChange]);

  // 处理登出
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      setIsAuthenticated(false);
      onAuthChange?.(false);
      // 可以添加重定向到首页的逻辑
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    const loadingContent = (
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
        <span className="text-sm text-gray-600">Loading...</span>
      </div>
    );

    if (isMobile) {
      return <div className="w-full h-9 bg-gray-200 animate-pulse rounded"></div>;
    }
    return loadingContent;
  }

  if (error) {
    // 在错误情况下显示默认的未登录状态
    if (isMobile) {
      return (
        <>
          <Button asChild variant="outline" className="w-full">
            <Link href="/sign-in" onClick={onMobileMenuToggle}>{tAuth('signin')}</Link>
          </Button>
          <Button asChild className="w-full">
            <Link href="/sign-up" onClick={onMobileMenuToggle}>{tAuth('signup')}</Link>
          </Button>
        </>
      );
    }

    return (
      <>
        <Button asChild variant="ghost">
          <Link href="/sign-in">{tAuth('signin')}</Link>
        </Button>
        <Button asChild>
          <Link href="/sign-up">{tAuth('signup')}</Link>
        </Button>
      </>
    );
  }

  if (isAuthenticated) {
    if (isMobile) {
      return (
        <>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard" onClick={onMobileMenuToggle}>
              <User className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              handleLogout();
              onMobileMenuToggle?.();
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </>
      );
    }
    return (
      <>
        <Button asChild variant="ghost">
          <Link href="/dashboard">
            <User className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </>
    );
  }

  // 未登录状态
  if (isMobile) {
    return (
      <>
        <Button asChild variant="outline" className="w-full">
          <Link href="/sign-in" onClick={onMobileMenuToggle}>{tAuth('signin')}</Link>
        </Button>
        <Button asChild className="w-full">
          <Link href="/sign-up" onClick={onMobileMenuToggle}>{tAuth('signup')}</Link>
        </Button>
      </>
    );
  }
  return (
    <>
      <Button asChild variant="ghost">
        <Link href="/sign-in">{tAuth('signin')}</Link>
      </Button>
      <Button asChild>
        <Link href="/sign-up">{tAuth('signup')}</Link>
      </Button>
    </>
  );
}

// 使用 dynamic import 避免 SSR 问题
const AuthStatus = dynamic(() => Promise.resolve(AuthStatusComponent), {
  ssr: false,
  loading: () => (
    <div className="flex items-center space-x-2">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
      <span className="text-sm text-gray-600">Loading auth...</span>
    </div>
  ),
});

export default AuthStatus;
