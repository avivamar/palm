import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

import type { AuthError, AuthResult, AuthUser } from './types';
import { createClient } from './config';

export class SupabaseAuthError extends Error implements AuthError {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'SupabaseAuthError';
  }
}

export class SupabaseAuthService {
  private supabase = createClient();

  // 用户注册
  async signUp(email: string, password: string, options?: { name?: string }): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: options?.name,
            auth_source: 'supabase',
          },
        },
      });

      if (error) {
        throw new SupabaseAuthError(error.message, error.message);
      }

      const user: AuthUser | null = data.user
        ? {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name,
            auth_source: 'supabase',
          }
        : null;

      return {
        user,
        session: data.session,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error.message : 'Unknown error during sign up',
      };
    }
  }

  // 用户登录
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new SupabaseAuthError(error.message, error.message);
      }

      const user: AuthUser | null = data.user
        ? {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name,
            auth_source: 'supabase',
          }
        : null;

      return {
        user,
        session: data.session,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error.message : 'Unknown error during sign in',
      };
    }
  }

  // 第三方登录 (Google)
  async signInWithGoogle(): Promise<AuthResult> {
    try {
      // 安全获取 origin，在构建时使用默认值
      const origin = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/api/auth/callback`,
        },
      });

      if (error) {
        throw new SupabaseAuthError(error.message, error.message);
      }

      return {
        user: null, // OAuth 会重定向，用户信息在回调中获取
        session: null,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error.message : 'Unknown error during Google sign in',
      };
    }
  }

  // 用户登出
  async signOut(): Promise<{ error?: string }> {
    try {
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        throw new SupabaseAuthError(error.message, error.message);
      }

      return {};
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error during sign out',
      };
    }
  }

  // 获取当前用户
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();

      if (error) {
        throw new SupabaseAuthError(error.message, error.message);
      }

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name,
        avatar_url: user.user_metadata?.avatar_url,
        auth_source: 'supabase',
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  // 获取当前会话
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();

      if (error) {
        throw new SupabaseAuthError(error.message, error.message);
      }

      return session;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  // 监听认证状态变化
  onAuthStateChange(callback: (user: AuthUser | null, session: any) => void) {
    return this.supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      const user: AuthUser | null = session?.user
        ? {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name,
            avatar_url: session.user.user_metadata?.avatar_url,
            auth_source: 'supabase',
          }
        : null;

      callback(user, session);
    });
  }

  // 密码重置
  async resetPassword(email: string): Promise<{ error?: string }> {
    try {
      // 安全获取 origin，在构建时使用默认值
      const origin = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset-password`,
      });

      if (error) {
        throw new SupabaseAuthError(error.message, error.message);
      }

      return {};
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error during password reset',
      };
    }
  }

  // 更新密码
  async updatePassword(newPassword: string): Promise<{ error?: string }> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new SupabaseAuthError(error.message, error.message);
      }

      return {};
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error during password update',
      };
    }
  }
}

// 导出服务实例
export const supabaseAuth = new SupabaseAuthService();
