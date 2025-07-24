'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 客户端用户同步 Hook
 * 在用户登录后异步同步用户数据到数据库
 */
export function useUserSync() {
  const { user } = useAuth();
  const syncAttemptedRef = useRef(false);

  useEffect(() => {
    // 只在用户存在且尚未尝试同步时执行
    if (user && !syncAttemptedRef.current) {
      syncAttemptedRef.current = true;

      // 异步同步用户数据
      const syncUser = async () => {
        try {
          const response = await fetch('/api/auth/sync-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            console.log('User synchronized successfully');
          } else {
            console.warn('User sync failed:', await response.text());
          }
        } catch (error) {
          console.warn('User sync error:', error);
        }
      };

      // 延迟执行，避免阻塞 UI
      setTimeout(syncUser, 1000);
    }
  }, [user]);
}
