/**
 * Supabase auth provider implementation
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuthError, AuthProvider, AuthResult, AuthSession, AuthUser } from '../../types';
import { createClient } from '@supabase/supabase-js';

export class SupabaseAuthProvider implements AuthProvider {
  readonly name = 'supabase' as const;
  private client: SupabaseClient;

  constructor(
    private config: {
      url: string;
      anonKey: string;
    },
  ) {
    this.client = createClient(config.url, config.anonKey);
  }

  get isConfigured(): boolean {
    return Boolean(this.config.url && this.config.anonKey);
  }

  private mapSupabaseUser(user: any): AuthUser {
    return {
      id: user.id,
      email: user.email || '',
      displayName: user.user_metadata?.display_name || user.user_metadata?.full_name || user.email?.split('@')[0],
      photoURL: user.user_metadata?.avatar_url,
      emailVerified: user.email_confirmed_at != null,
      provider: 'supabase',
      createdAt: new Date(user.created_at),
      lastLoginAt: user.last_sign_in_at ? new Date(user.last_sign_in_at) : undefined,
      metadata: user.user_metadata,
    };
  }

  private mapSupabaseSession(session: any): AuthSession {
    return {
      user: this.mapSupabaseUser(session.user),
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: new Date(session.expires_at * 1000),
      provider: 'supabase',
    };
  }

  private mapSupabaseError(error: any): AuthError {
    return {
      code: error.status?.toString() || 'unknown',
      message: error.message || 'Unknown error occurred',
      provider: 'supabase',
      originalError: error,
    };
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error: this.mapSupabaseError(error),
        };
      }

      if (!data.user || !data.session) {
        return {
          success: false,
          error: {
            code: 'no_user_session',
            message: 'No user or session returned',
            provider: 'supabase',
          },
        };
      }

      return {
        success: true,
        user: this.mapSupabaseUser(data.user),
        session: this.mapSupabaseSession(data.session),
      };
    } catch (error) {
      return {
        success: false,
        error: this.mapSupabaseError(error),
      };
    }
  }

  async signUp(email: string, password: string, displayName?: string): Promise<AuthResult> {
    try {
      const { data, error } = await this.client.auth.signUp({
        email,
        password,
        options: {
          data: displayName ? { display_name: displayName } : undefined,
        },
      });

      if (error) {
        return {
          success: false,
          error: this.mapSupabaseError(error),
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: {
            code: 'no_user',
            message: 'No user returned from sign up',
            provider: 'supabase',
          },
        };
      }

      const result: AuthResult = {
        success: true,
        user: this.mapSupabaseUser(data.user),
      };

      if (data.session) {
        result.session = this.mapSupabaseSession(data.session);
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: this.mapSupabaseError(error),
      };
    }
  }

  async signInWithProvider(provider: 'google' | 'github'): Promise<AuthResult> {
    try {
      const { error } = await this.client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        return {
          success: false,
          error: this.mapSupabaseError(error),
        };
      }

      // OAuth redirect will handle the rest
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: this.mapSupabaseError(error),
      };
    }
  }

  async signOut(): Promise<void> {
    await this.client.auth.signOut();
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw this.mapSupabaseError(error);
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await this.client.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw this.mapSupabaseError(error);
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user }, error } = await this.client.auth.getUser();

    if (error || !user) {
      return null;
    }

    return this.mapSupabaseUser(user);
  }

  async updateProfile(updates: Partial<AuthUser>): Promise<AuthUser> {
    const updateData: any = {};

    if (updates.displayName) {
      updateData.data = { display_name: updates.displayName };
    }

    const { data, error } = await this.client.auth.updateUser(updateData);

    if (error || !data.user) {
      throw this.mapSupabaseError(error);
    }

    return this.mapSupabaseUser(data.user);
  }

  async deleteAccount(): Promise<void> {
    // Note: Supabase doesn't have a direct delete user method in the client
    // This would typically be handled by a server-side function
    throw new Error('Account deletion must be handled server-side');
  }

  async getSession(): Promise<AuthSession | null> {
    const { data: { session }, error } = await this.client.auth.getSession();

    if (error || !session) {
      return null;
    }

    return this.mapSupabaseSession(session);
  }

  async refreshSession(): Promise<AuthSession | null> {
    const { data: { session }, error } = await this.client.auth.refreshSession();

    if (error || !session) {
      return null;
    }

    return this.mapSupabaseSession(session);
  }

  async sendEmailVerification(): Promise<void> {
    const { error } = await this.client.auth.resend({
      type: 'signup',
      email: await this.getCurrentUserEmail(),
    });

    if (error) {
      throw this.mapSupabaseError(error);
    }
  }

  async verifyEmail(_token: string): Promise<void> {
    // This is typically handled by the auth callback URL
    // The token verification happens automatically when user clicks the email link
    throw new Error('Email verification is handled automatically via callback URL');
  }

  private async getCurrentUserEmail(): Promise<string> {
    const user = await this.getCurrentUser();
    if (!user?.email) {
      throw new Error('No current user or email found');
    }
    return user.email;
  }

  // Event listeners
  onAuthStateChange(callback: (session: AuthSession | null) => void) {
    return this.client.auth.onAuthStateChange((_event, session) => {
      callback(session ? this.mapSupabaseSession(session) : null);
    });
  }
}
