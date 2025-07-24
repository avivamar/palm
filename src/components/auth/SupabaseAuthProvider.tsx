'use client';

import type { AuthUser } from '@/libs/supabase/types';
import { createContext, use, useEffect, useState } from 'react';
import { supabaseAuth } from '@/libs/supabase/auth';

type SupabaseAuthContextType = {
  user: AuthUser | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, options?: { name?: string }) => Promise<{ error?: string }>;
  signOut: () => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
};

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取初始会话
    const getInitialSession = async () => {
      try {
        const currentSession = await supabaseAuth.getCurrentSession();
        const currentUser = await supabaseAuth.getCurrentUser();

        setSession(currentSession);
        setUser(currentUser);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // 监听认证状态变化
    const { data: { subscription } } = supabaseAuth.onAuthStateChange((authUser, authSession) => {
      setUser(authUser);
      setSession(authSession);
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await supabaseAuth.signIn(email, password);

      if (result.error) {
        return { error: result.error };
      }

      return {};
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'An error occurred during sign in',
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, options?: { name?: string }) => {
    try {
      setLoading(true);
      const result = await supabaseAuth.signUp(email, password, options);

      if (result.error) {
        return { error: result.error };
      }

      return {};
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'An error occurred during sign up',
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const result = await supabaseAuth.signOut();

      if (result.error) {
        return { error: result.error };
      }

      // 立即清除本地状态
      setUser(null);
      setSession(null);

      return {};
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'An error occurred during sign out',
      };
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await supabaseAuth.signInWithGoogle();

      if (result.error) {
        return { error: result.error };
      }

      return {};
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'An error occurred during Google sign in',
      };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const result = await supabaseAuth.resetPassword(email);

      if (result.error) {
        return { error: result.error };
      }

      return {};
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'An error occurred during password reset',
      };
    }
  };

  const value: SupabaseAuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    resetPassword,
  };

  return (
    <SupabaseAuthContext value={value}>
      {children}
    </SupabaseAuthContext>
  );
}

export function useSupabaseAuth() {
  const context = use(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}

// 兼容性别名
export const useAuth = useSupabaseAuth;
