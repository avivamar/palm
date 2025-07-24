import type { AuthResult, AuthUser } from '../supabase/types';

// 统一认证提供者接口
export type UnifiedAuthProvider = {
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, options?: { name?: string }) => Promise<AuthResult>;
  signOut: () => Promise<{ error?: string }>;
  getCurrentUser: () => Promise<AuthUser | null>;
  onAuthStateChange: (callback: (user: AuthUser | null, session: any) => void) => any;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  platform: 'web' | 'mobile';
};

// Supabase 认证提供者 (Web 端)
export class SupabaseAuthProvider implements UnifiedAuthProvider {
  platform = 'web' as const;

  constructor(private authService: any) {}

  async signIn(email: string, password: string): Promise<AuthResult> {
    return this.authService.signIn(email, password);
  }

  async signUp(email: string, password: string, options?: { name?: string }): Promise<AuthResult> {
    return this.authService.signUp(email, password, options);
  }

  async signOut(): Promise<{ error?: string }> {
    return this.authService.signOut();
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return this.authService.getCurrentUser();
  }

  onAuthStateChange(callback: (user: AuthUser | null, session: any) => void) {
    return this.authService.onAuthStateChange(callback);
  }

  async resetPassword(email: string): Promise<{ error?: string }> {
    return this.authService.resetPassword(email);
  }
}

// Firebase 认证提供者 (为 Flutter 准备)
export class FirebaseAuthProvider implements UnifiedAuthProvider {
  platform = 'mobile' as const;

  constructor(private firebaseAuth: any) {}

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      // Firebase 登录逻辑
      const userCredential = await this.firebaseAuth.signInWithEmailAndPassword(email, password);

      // 同步到 Supabase
      await this.syncToSupabase(userCredential.user);

      return {
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email!,
          name: userCredential.user.displayName,
          auth_source: 'firebase',
        },
        session: userCredential,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error.message : 'Firebase sign in failed',
      };
    }
  }

  async signUp(email: string, password: string, options?: { name?: string }): Promise<AuthResult> {
    try {
      // Firebase 注册逻辑
      const userCredential = await this.firebaseAuth.createUserWithEmailAndPassword(email, password);

      // 更新用户资料
      if (options?.name) {
        await userCredential.user.updateProfile({ displayName: options.name });
      }

      // 同步到 Supabase
      await this.syncToSupabase(userCredential.user);

      return {
        user: {
          id: userCredential.user.uid,
          email: userCredential.user.email!,
          name: userCredential.user.displayName || options?.name,
          auth_source: 'firebase',
        },
        session: userCredential,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error instanceof Error ? error.message : 'Firebase sign up failed',
      };
    }
  }

  async signOut(): Promise<{ error?: string }> {
    try {
      await this.firebaseAuth.signOut();
      return {};
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Firebase sign out failed',
      };
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const user = this.firebaseAuth.currentUser;
    if (!user) {
      return null;
    }

    return {
      id: user.uid,
      email: user.email!,
      name: user.displayName,
      auth_source: 'firebase',
    };
  }

  onAuthStateChange(callback: (user: AuthUser | null, session: any) => void) {
    return this.firebaseAuth.onAuthStateChanged((firebaseUser: any) => {
      const user: AuthUser | null = firebaseUser
        ? {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: firebaseUser.displayName,
            auth_source: 'firebase',
          }
        : null;

      callback(user, firebaseUser);
    });
  }

  async resetPassword(email: string): Promise<{ error?: string }> {
    try {
      await this.firebaseAuth.sendPasswordResetEmail(email);
      return {};
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Password reset failed',
      };
    }
  }

  // 同步 Firebase 用户到 Supabase
  private async syncToSupabase(firebaseUser: any): Promise<void> {
    try {
      await fetch('/api/auth/sync-firebase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          auth_source: 'firebase',
        }),
      });
    } catch (error) {
      console.error('Failed to sync Firebase user to Supabase:', error);
    }
  }
}

// 统一认证管理器
export class UnifiedAuthManager {
  private provider: UnifiedAuthProvider;

  constructor(provider: UnifiedAuthProvider) {
    this.provider = provider;
  }

  get platform() {
    return this.provider.platform;
  }

  async signIn(email: string, password: string) {
    return this.provider.signIn(email, password);
  }

  async signUp(email: string, password: string, options?: { name?: string }) {
    return this.provider.signUp(email, password, options);
  }

  async signOut() {
    return this.provider.signOut();
  }

  async getCurrentUser() {
    return this.provider.getCurrentUser();
  }

  onAuthStateChange(callback: (user: AuthUser | null, session: any) => void) {
    return this.provider.onAuthStateChange(callback);
  }

  async resetPassword(email: string) {
    return this.provider.resetPassword(email);
  }

  // 切换认证提供者
  switchProvider(newProvider: UnifiedAuthProvider) {
    this.provider = newProvider;
  }
}

// 工厂函数
export function createAuthManager(): UnifiedAuthManager {
  // 根据平台选择合适的认证提供者
  if (typeof window !== 'undefined') {
    // Web 端使用 Supabase
    import('../supabase/auth').then(({ supabaseAuth }) => {
      const provider = new SupabaseAuthProvider(supabaseAuth);
      return new UnifiedAuthManager(provider);
    });
  }

  // 默认使用 Supabase (服务端渲染)
  const provider = new SupabaseAuthProvider(null);
  return new UnifiedAuthManager(provider);
}
