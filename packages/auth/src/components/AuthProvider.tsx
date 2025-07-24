/**
 * Unified Auth Context Provider
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

'use client';

import type { ReactNode } from 'react';
import type { AuthConfig, AuthContextType, AuthError, AuthProvider, AuthResult, AuthSession, AuthUser } from '../types';
import { createContext, use, useEffect, useState } from 'react';
import { SupabaseAuthProvider } from '../providers/supabase/SupabaseAuthProvider';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export type AuthProviderProps = {
  children: ReactNode;
  config: AuthConfig;
};

export function AuthProvider({ children, config }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [provider, setProvider] = useState<AuthProvider | null>(null);

  // Initialize auth provider
  useEffect(() => {
    let authProvider: AuthProvider | null = null;

    // Initialize Supabase provider
    if (config.supabase?.enabled && config.supabase.url && config.supabase.anonKey) {
      authProvider = new SupabaseAuthProvider({
        url: config.supabase.url,
        anonKey: config.supabase.anonKey,
      });
    }

    // TODO: Add Firebase provider initialization
    // if (config.firebase?.enabled && config.firebase.apiKey) {
    //   authProvider = new FirebaseAuthProvider(config.firebase);
    // }

    if (!authProvider) {
      setError({
        code: 'no_provider',
        message: 'No auth provider configured',
        provider: config.defaultProvider,
      });
      setLoading(false);
      return;
    }

    setProvider(authProvider);

    // Load initial session
    const loadSession = async () => {
      try {
        const session = await authProvider.getSession();
        if (session) {
          setSession(session);
          setUser(session.user);
        }
      } catch (err) {
        console.error('Failed to load session:', err);
        setError({
          code: 'session_load_failed',
          message: 'Failed to load session',
          provider: config.defaultProvider,
          originalError: err,
        });
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    loadSession();

    // Set up auth state listener for Supabase
    if (authProvider instanceof SupabaseAuthProvider) {
      const { data: { subscription } } = authProvider.onAuthStateChange((session) => {
        setSession(session);
        setUser(session?.user || null);
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }

    // Return empty cleanup function for other providers
    return () => {};
  }, [config]);

  // Auth methods
  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    if (!provider) {
      return {
        success: false,
        error: {
          code: 'no_provider',
          message: 'No auth provider available',
          provider: config.defaultProvider,
        },
      };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await provider.signIn(email, password);

      if (result.success && result.user && result.session) {
        setUser(result.user);
        setSession(result.session);
      } else if (result.error) {
        setError(result.error);
      }

      return result;
    } catch (err) {
      const authError: AuthError = {
        code: 'sign_in_failed',
        message: 'Sign in failed',
        provider: config.defaultProvider,
        originalError: err,
      };
      setError(authError);
      return { success: false, error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string): Promise<AuthResult> => {
    if (!provider) {
      return {
        success: false,
        error: {
          code: 'no_provider',
          message: 'No auth provider available',
          provider: config.defaultProvider,
        },
      };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await provider.signUp(email, password, displayName);

      if (result.success && result.user) {
        setUser(result.user);
        if (result.session) {
          setSession(result.session);
        }
      } else if (result.error) {
        setError(result.error);
      }

      return result;
    } catch (err) {
      const authError: AuthError = {
        code: 'sign_up_failed',
        message: 'Sign up failed',
        provider: config.defaultProvider,
        originalError: err,
      };
      setError(authError);
      return { success: false, error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signInWithProvider = async (oauthProvider: 'google' | 'github'): Promise<AuthResult> => {
    if (!provider) {
      return {
        success: false,
        error: {
          code: 'no_provider',
          message: 'No auth provider available',
          provider: config.defaultProvider,
        },
      };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await provider.signInWithProvider(oauthProvider);
      return result;
    } catch (err) {
      const authError: AuthError = {
        code: 'oauth_sign_in_failed',
        message: `${oauthProvider} sign in failed`,
        provider: config.defaultProvider,
        originalError: err,
      };
      setError(authError);
      return { success: false, error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    if (!provider) {
      return;
    }

    setLoading(true);
    try {
      await provider.signOut();
      setUser(null);
      setSession(null);
      setError(null);
    } catch (err) {
      console.error('Sign out failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordResetEmail = async (email: string): Promise<void> => {
    if (!provider) {
      throw new Error('No auth provider available');
    }
    return provider.sendPasswordResetEmail(email);
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    if (!provider) {
      throw new Error('No auth provider available');
    }
    return provider.updatePassword(newPassword);
  };

  const updateProfile = async (updates: Partial<AuthUser>): Promise<AuthUser> => {
    if (!provider) {
      throw new Error('No auth provider available');
    }

    const updatedUser = await provider.updateProfile(updates);
    setUser(updatedUser);
    return updatedUser;
  };

  const deleteAccount = async (): Promise<void> => {
    if (!provider) {
      throw new Error('No auth provider available');
    }

    await provider.deleteAccount();
    setUser(null);
    setSession(null);
  };

  const sendEmailVerification = async (): Promise<void> => {
    if (!provider) {
      throw new Error('No auth provider available');
    }
    return provider.sendEmailVerification();
  };

  const verifyEmail = async (token: string): Promise<void> => {
    if (!provider) {
      throw new Error('No auth provider available');
    }
    return provider.verifyEmail(token);
  };

  const contextValue: AuthContextType = {
    user,
    session,
    loading,
    error,
    initialized,
    signIn,
    signUp,
    signInWithProvider,
    signOut,
    sendPasswordResetEmail,
    updatePassword,
    updateProfile,
    deleteAccount,
    sendEmailVerification,
    verifyEmail,
  };

  return (
    <AuthContext value={contextValue}>
      {children}
    </AuthContext>
  );
}

export function useAuth(): AuthContextType {
  const context = use(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
