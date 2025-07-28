import type { Database } from './types';
import { createBrowserClient, createServerClient as createSSRServerClient } from '@supabase/ssr';

// 配置验证
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL
  && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  && !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('build-placeholder')
  && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.includes('build_time_placeholder'),
);

// 构建时检查
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'
  || (typeof process !== 'undefined' && process.env.NODE_ENV === 'test');

// 错误处理
export class SupabaseError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'SupabaseError';
  }
}

// 配置检查函数
export function validateSupabaseConfig(): void {
  if (!isBuildTime) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new SupabaseError('NEXT_PUBLIC_SUPABASE_URL is required', 'MISSING_URL');
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new SupabaseError('NEXT_PUBLIC_SUPABASE_ANON_KEY is required', 'MISSING_KEY');
    }
  }
}

// 客户端 Supabase 实例
export const createClient = () => {
  // 在构建时返回一个模拟客户端
  if (isBuildTime) {
    console.warn('Build time: Creating mock Supabase client');
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Not available during build') }),
        signUp: () => Promise.resolve({ data: null, error: new Error('Not available during build') }),
        signOut: () => Promise.resolve({ error: new Error('Not available during build') }),
        signInWithOAuth: () => Promise.resolve({ error: new Error('Not available during build') }),
        resend: () => Promise.resolve({ error: new Error('Not available during build') }),
        resetPasswordForEmail: () => Promise.resolve({ error: new Error('Not available during build') }),
        updateUser: () => Promise.resolve({ error: new Error('Not available during build') }),
        exchangeCodeForSession: () => Promise.resolve({ error: new Error('Not available during build') }),
      },
    } as any;
  }

  if (!isSupabaseConfigured) {
    console.error('Supabase configuration is incomplete. Please check environment variables:');
    console.error('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
    console.error('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');

    // 返回一个模拟客户端，避免应用崩溃
    return {
      auth: {
        getSession: () => Promise.resolve({ data: { session: null }, error: new SupabaseError('Supabase not configured') }),
        getUser: () => Promise.resolve({ data: { user: null }, error: new SupabaseError('Supabase not configured') }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithPassword: () => Promise.resolve({ data: null, error: new SupabaseError('Supabase not configured') }),
        signUp: () => Promise.resolve({ data: null, error: new SupabaseError('Supabase not configured') }),
        signOut: () => Promise.resolve({ error: new SupabaseError('Supabase not configured') }),
        signInWithOAuth: () => Promise.resolve({ error: new SupabaseError('Supabase not configured') }),
        resend: () => Promise.resolve({ error: new SupabaseError('Supabase not configured') }),
        resetPasswordForEmail: () => Promise.resolve({ error: new SupabaseError('Supabase not configured') }),
        updateUser: () => Promise.resolve({ error: new SupabaseError('Supabase not configured') }),
        exchangeCodeForSession: () => Promise.resolve({ error: new SupabaseError('Supabase not configured') }),
      },
    } as any;
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
};

// 服务端 Supabase 实例
export const createServerClient = async () => {
  if (!isSupabaseConfigured) {
    console.warn('Supabase configuration is incomplete. Some features may not work.');
    // 在构建时返回一个模拟对象
    if (isBuildTime) {
      return {
        auth: {
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        },
      } as any;
    }
    throw new SupabaseError('Supabase configuration is incomplete');
  }

  // 只在服务器环境中导入 cookies
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

  return createSSRServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};
