'use client';

import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import type { ReactNode } from 'react';
import type { AuthUser } from '@/libs/supabase/types';
import { useRouter } from 'next/navigation';
import { createContext, use, useEffect, useState } from 'react';

import { toast } from 'sonner';
import { syncUserToDatabase } from '@/app/actions/userActions';
import { createClient } from '@/libs/supabase/config';

// Define the shape of the context's value
type AuthContextType = {
  user: AuthUser | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, options?: { name?: string }) => Promise<{ error?: string }>;
  signOut: () => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  clearError: () => void;
  resendVerificationEmail: () => Promise<{ error?: string }>;
  sendPasswordResetEmail: (email: string) => Promise<{ error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;
  confirmPasswordReset: (oobCode: string, newPassword: string) => Promise<{ error?: string }>;
};

// A dummy implementation for the initial context value
const unimplemented = () => Promise.resolve({ error: 'Authentication not initialized' });

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  loading: true,
  error: null,
  initialized: false,
  signIn: unimplemented,
  signUp: unimplemented,
  signOut: unimplemented,
  signInWithGoogle: unimplemented,
  clearError: () => {},
  resendVerificationEmail: unimplemented,
  sendPasswordResetEmail: unimplemented,
  updatePassword: unimplemented,
  confirmPasswordReset: unimplemented,
});

// The AuthProvider component that will wrap the application
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Helper function to convert Supabase user to AuthUser
  const convertToAuthUser = (supabaseUser: SupabaseUser): AuthUser => ({
    id: supabaseUser.id,
    email: supabaseUser.email!,
    name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name,
    displayName: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name, // 向后兼容
    avatar_url: supabaseUser.user_metadata?.avatar_url,
    photoURL: supabaseUser.user_metadata?.avatar_url, // 向后兼容
    emailVerified: !!supabaseUser.email_confirmed_at, // 向后兼容
    auth_source: 'supabase',
    supabase_id: supabaseUser.id,
    metadata: supabaseUser.user_metadata || {}, // 向后兼容
    uid: supabaseUser.id, // 向后兼容的 uid 属性
  });

  // Clear error function
  const clearError = () => setError(null);

  // Sign in function
  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      clearError();
      setLoading(true);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        toast.error(signInError.message);
        return { error: signInError.message };
      }

      if (data.user) {
        toast.success('Sign in successful!');
        router.push('/dashboard');
        return {};
      }

      return { error: 'Sign in failed' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during sign in';
      setError(errorMessage);
      toast.error(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, options?: { name?: string }): Promise<{ error?: string }> => {
    try {
      clearError();
      setLoading(true);

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: options?.name,
            full_name: options?.name,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        toast.error(signUpError.message);
        return { error: signUpError.message };
      }

      if (data.user) {
        toast.success('Registration successful!', {
          description: 'Please check your email to verify your account.',
        });
        // Don't redirect immediately, let user verify email first
        return {};
      }

      return { error: 'Sign up failed' };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during sign up';
      setError(errorMessage);
      toast.error(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async (): Promise<{ error?: string }> => {
    try {
      clearError();
      setLoading(true);

      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        setError(signOutError.message);
        toast.error(signOutError.message);
        return { error: signOutError.message };
      }

      toast.success('Signed out successfully');
      router.push('/');
      return {};
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during sign out';
      setError(errorMessage);
      toast.error(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Google sign in function
  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    try {
      clearError();
      setLoading(true);

      // 安全获取 origin，在构建时使用默认值
      const origin = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/api/auth/callback`,
        },
      });

      if (googleError) {
        setError(googleError.message);
        toast.error(googleError.message);
        return { error: googleError.message };
      }

      // OAuth will redirect, so we don't need to handle success here
      return {};
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during Google sign in';
      setError(errorMessage);
      toast.error(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Resend verification email
  const resendVerificationEmail = async (): Promise<{ error?: string }> => {
    try {
      if (!supabaseUser?.email) {
        const errorMessage = 'No user email found';
        setError(errorMessage);
        toast.error(errorMessage);
        return { error: errorMessage };
      }

      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: supabaseUser.email,
      });

      if (resendError) {
        setError(resendError.message);
        toast.error(resendError.message);
        return { error: resendError.message };
      }

      toast.success('Verification email sent!');
      return {};
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while resending verification email';
      setError(errorMessage);
      toast.error(errorMessage);
      return { error: errorMessage };
    }
  };

  // Send password reset email
  const sendPasswordResetEmail = async (email: string): Promise<{ error?: string }> => {
    try {
      clearError();
      setLoading(true);

      // 安全获取当前语言设置和 origin
      const currentLocale = typeof window !== 'undefined'
        ? window.location.pathname.split('/')[1] || 'en'
        : 'en';
      const origin = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      const supabaseLocaleMap: Record<string, string> = {
        'en': 'en',
        'es': 'es',
        'ja': 'ja',
        'zh-HK': 'zh', // Supabase 只支持 'zh'，不支持 'zh-HK'
      };
      const locale = supabaseLocaleMap[currentLocale] || 'en';

      // 构建重定向URL，确保使用原始locale
      const redirectUrl = `${origin}/${currentLocale}/reset-password`;

      console.log('Password reset - Email:', email);
      console.log('Password reset - Original locale:', currentLocale);
      console.log('Password reset - Supabase locale:', locale);
      console.log('Password reset - Redirect URL:', redirectUrl);

      // 使用映射后的语言和重定向URL
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
        // 如果 Supabase 支持语言设置，可以添加
        // options: { locale }
      });

      if (resetError) {
        console.error('Password reset error:', resetError);
        throw resetError;
      }

      console.log('Password reset email sent successfully');
      toast.success('Password reset email sent. Please check your inbox.');
      return {};
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while sending password reset email';
      console.error('Password reset failed:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async (newPassword: string): Promise<{ error?: string }> => {
    try {
      clearError();
      setLoading(true);

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        toast.error(updateError.message);
        return { error: updateError.message };
      }

      toast.success('Password updated successfully!');
      return {};
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating password';
      setError(errorMessage);
      toast.error(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Confirm password reset (for reset password flow)
  const confirmPasswordReset = async (oobCode: string, newPassword: string): Promise<{ error?: string }> => {
    try {
      clearError();
      setLoading(true);

      // For Supabase, we need to exchange the code for a session and then update the password
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(oobCode);

      if (exchangeError) {
        setError(exchangeError.message);
        toast.error(exchangeError.message);
        return { error: exchangeError.message };
      }

      // Now update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        toast.error(updateError.message);
        return { error: updateError.message };
      }

      toast.success('Password has been reset successfully!');
      router.push('/sign-in');
      return {};
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while resetting password';
      setError(errorMessage);
      toast.error(errorMessage);
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Set up auth state listener
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError(sessionError.message);
        } else if (session?.user && isMounted) {
          const authUser = convertToAuthUser(session.user);
          setUser(authUser);
          setSupabaseUser(session.user);

          // Sync user to database
          try {
            await syncUserToDatabase({
              id: session.user.id,
              email: session.user.email!,
              displayName: authUser.name || null,
              photoURL: authUser.avatar_url || null,
              supabaseId: session.user.id,
              authSource: 'supabase',
            });
          } catch (syncError) {
            console.error('User sync failed:', syncError);
            // Don't show error to user as this is background operation
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setError('Failed to initialize authentication');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: Session | null) => {
      if (!isMounted) {
        return;
      }

      try {
        if (session?.user) {
          const authUser = convertToAuthUser(session.user);
          setUser(authUser);
          setSupabaseUser(session.user);

          // Sync user to database on sign in
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            try {
              await syncUserToDatabase({
                id: session.user.id,
                email: session.user.email!,
                displayName: authUser.name || null,
                photoURL: authUser.avatar_url || null,
                supabaseId: session.user.id,
                authSource: 'supabase',
              });
            } catch (syncError) {
              console.error('User sync failed:', syncError);
            }
          }
        } else {
          setUser(null);
          setSupabaseUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    });

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const value: AuthContextType = {
    user,
    supabaseUser,
    loading,
    error,
    initialized,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    clearError,
    resendVerificationEmail,
    sendPasswordResetEmail,
    updatePassword,
    confirmPasswordReset,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

// Custom hook to consume the context
export const useAuth = (): AuthContextType => {
  // Server-side rendering check
  const isServer = typeof window === 'undefined';

  const context = use(AuthContext);

  if (isServer) {
    return {
      user: null,
      supabaseUser: null,
      loading: true,
      error: null,
      initialized: false,
      signIn: unimplemented,
      signUp: unimplemented,
      signOut: unimplemented,
      signInWithGoogle: unimplemented,
      clearError: () => {},
      resendVerificationEmail: unimplemented,
      sendPasswordResetEmail: unimplemented,
      updatePassword: unimplemented,
      confirmPasswordReset: unimplemented,
    };
  }

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
