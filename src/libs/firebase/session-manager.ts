/**
 * Firebase 会话管理器
 * 提供token自动刷新、会话监控和安全管理功能
 */

// Dynamic Firebase auth imports to avoid SSG issues
import { getFirebaseAuth } from './config';
import { sessionCache } from './session-cache';

// 会话配置常量
const SESSION_CONFIG = {
  // Token刷新间隔 (50分钟，避免1小时过期)
  TOKEN_REFRESH_INTERVAL: 50 * 60 * 1000,

  // 会话检查间隔 (5分钟)
  SESSION_CHECK_INTERVAL: 5 * 60 * 1000,

  // 最大重试次数
  MAX_RETRY_ATTEMPTS: 3,

  // 重试延迟 (指数退避)
  RETRY_DELAY_BASE: 1000,
} as const;

// 全局状态管理
let tokenRefreshInterval: NodeJS.Timeout | null = null;
let sessionCheckInterval: NodeJS.Timeout | null = null;
let currentUser: any | null = null;

/**
 * 刷新用户token并更新session cookie
 */
async function refreshUserToken(user: any, retryCount = 0): Promise<boolean> {
  try {
    // 强制刷新token
    const freshToken = await user.getIdToken(true);

    // 更新session cookie
    const response = await fetch('/api/auth/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken: freshToken }),
    });

    if (!response.ok) {
      throw new Error(`Session update failed: ${response.status}`);
    }

    console.warn('🔄 Token refreshed successfully');
    return true;
  } catch (error) {
    console.error('Token refresh error:', error);

    // 指数退避重试
    if (retryCount < SESSION_CONFIG.MAX_RETRY_ATTEMPTS) {
      const delay = SESSION_CONFIG.RETRY_DELAY_BASE * (2 ** retryCount);
      console.warn(`🔄 Retrying token refresh in ${delay}ms (attempt ${retryCount + 1})`);

      setTimeout(() => {
        refreshUserToken(user, retryCount + 1);
      }, delay);
    } else {
      console.error('❌ Token refresh failed after maximum retries');
    }

    return false;
  }
}

/**
 * 检查会话状态
 */
async function checkSessionStatus(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      cache: 'no-cache',
    });

    const data = await response.json();
    return data.isAuthenticated || false;
  } catch (error) {
    console.error('Session check error:', error);
    return false;
  }
}

/**
 * 启动会话管理
 */
export function startSessionManager(user: any): void {
  if (!user) {
    console.warn('Cannot start session manager without user');
    return;
  }

  // 停止现有的管理器
  stopSessionManager();

  currentUser = user;
  console.warn('🚀 Starting session manager for user:', user.uid);

  // 立即刷新一次token
  refreshUserToken(user);

  // 设置定期token刷新
  tokenRefreshInterval = setInterval(() => {
    if (currentUser) {
      refreshUserToken(currentUser);
    }
  }, SESSION_CONFIG.TOKEN_REFRESH_INTERVAL);

  // 设置定期会话检查
  sessionCheckInterval = setInterval(async () => {
    const isSessionValid = await checkSessionStatus();
    if (!isSessionValid && currentUser) {
      console.warn('⚠️ Session invalid, attempting to refresh');
      await refreshUserToken(currentUser);
    }
  }, SESSION_CONFIG.SESSION_CHECK_INTERVAL);
}

/**
 * 停止会话管理
 */
export function stopSessionManager(): void {
  console.warn('🛑 Stopping session manager');

  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval);
    tokenRefreshInterval = null;
  }

  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
    sessionCheckInterval = null;
  }

  currentUser = null;
}

/**
 * 获取会话统计信息
 */
export function getSessionStats() {
  return {
    isActive: tokenRefreshInterval !== null,
    currentUser: currentUser?.uid || null,
    refreshInterval: SESSION_CONFIG.TOKEN_REFRESH_INTERVAL,
    checkInterval: SESSION_CONFIG.SESSION_CHECK_INTERVAL,
  };
}

/**
 * 手动刷新session
 */
export async function manualRefreshSession(): Promise<boolean> {
  if (!currentUser) {
    console.warn('No current user for manual refresh');
    return false;
  }

  return await refreshUserToken(currentUser);
}

type SessionListener = (state: SessionState) => void;

type SessionState = {
  user: any | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  isLoading: boolean;
};

class SessionManager {
  private listeners: Set<SessionListener> = new Set();
  private currentState: SessionState = {
    user: null,
    isAuthenticated: false,
    isVerified: false,
    isLoading: true,
  };

  private unsubscribe: (() => void) | null = null;
  private isInitialized = false;
  private retryCount = 0;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_BASE = 1000; // 1秒基础延迟

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Only proceed in browser environment
      if (typeof window === 'undefined') {
        this.updateState({
          user: null,
          isAuthenticated: false,
          isVerified: false,
          isLoading: false,
        });
        return;
      }

      // 检查 Firebase 是否正确配置 - 更严格的检查
      const firebaseAuth = await getFirebaseAuth();
      if (!firebaseAuth) {
        console.error('[SessionManager] Firebase auth is not properly configured');
        this.updateState({
          user: null,
          isAuthenticated: false,
          isVerified: false,
          isLoading: false,
        });
        return;
      }

      // 检查 auth 对象是否有效
      if (typeof firebaseAuth.onAuthStateChanged !== 'function') {
        console.error('[SessionManager] Firebase auth object is invalid');
        this.updateState({
          user: null,
          isAuthenticated: false,
          isVerified: false,
          isLoading: false,
        });
        return;
      }

      // 首先尝试从缓存获取状态
      const cachedStatus = sessionCache.getCachedStatus();
      if (cachedStatus) {
        this.updateState({
          user: null, // 用户对象需要从Firebase获取
          isAuthenticated: cachedStatus.isAuthenticated,
          isVerified: cachedStatus.isVerified,
          isLoading: false,
        });
      }

      // 设置Firebase认证状态监听器
      const { onAuthStateChanged } = await import('firebase/auth');
      this.unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
        console.warn('[SessionManager] Auth state changed:', {
          uid: user?.uid,
          emailVerified: user?.emailVerified,
        });

        await this.handleAuthStateChange(user);
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('[SessionManager] Initialization failed:', error);
      this.updateState({
        user: null,
        isAuthenticated: false,
        isVerified: false,
        isLoading: false,
      });
    }
  }

  private async handleAuthStateChange(user: any | null): Promise<void> {
    try {
      if (user) {
        // 用户已登录，验证会话
        const sessionStatus = await sessionCache.getSessionStatus();

        this.updateState({
          user,
          isAuthenticated: true,
          isVerified: sessionStatus.isVerified && user.emailVerified,
          isLoading: false,
        });

        // 更新缓存
        sessionCache.updateCache({
          isAuthenticated: true,
          isVerified: sessionStatus.isVerified && user.emailVerified,
          uid: user.uid,
        });

        console.warn('[SessionManager] User authenticated successfully:', user.uid);
      } else {
        // 用户未登录 - 这是正常状态，不需要重试
        this.updateState({
          user: null,
          isAuthenticated: false,
          isVerified: false,
          isLoading: false,
        });

        // 清除缓存
        // sessionCache.invalidateCache();
        console.warn('[SessionManager] User signed out or not authenticated');
      }

      this.retryCount = 0; // 重置重试计数
    } catch (error) {
      console.error('[SessionManager] Auth state change handling failed:', error);

      // 只有在处理已认证用户时才进行重试
      if (user && this.retryCount < this.MAX_RETRIES) {
        this.retryCount++;
        const delay = this.RETRY_DELAY_BASE * (2 ** this.retryCount);
        console.warn(`[SessionManager] Retrying auth state handling (${this.retryCount}/${this.MAX_RETRIES}) in ${delay}ms`);

        setTimeout(() => {
          this.handleAuthStateChange(user);
        }, delay);
      } else {
        // 达到最大重试次数或用户为null，设置为未认证状态
        this.updateState({
          user: null,
          isAuthenticated: false,
          isVerified: false,
          isLoading: false,
        });

        if (user) {
          console.error('[SessionManager] Max retries reached for user authentication');
        }
      }
    }
  }

  private updateState(newState: Partial<SessionState>): void {
    this.currentState = { ...this.currentState, ...newState };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentState);
      } catch (error) {
        console.error('[SessionManager] Listener error:', error);
      }
    });
  }

  // 公共方法
  subscribe(listener: SessionListener): () => void {
    this.listeners.add(listener);
    // 立即调用一次以获取当前状态
    listener(this.currentState);

    return () => {
      this.listeners.delete(listener);
    };
  }

  getCurrentState(): SessionState {
    return { ...this.currentState };
  }

  async refreshSession(): Promise<void> {
    try {
      const sessionStatus = await sessionCache.refreshCache();
      this.updateState({
        isAuthenticated: sessionStatus.isAuthenticated,
        isVerified: sessionStatus.isVerified,
      });
    } catch (error) {
      console.error('[SessionManager] Session refresh failed:', error);
    }
  }

  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.listeners.clear();
    this.isInitialized = false;
  }
}

// 单例实例
export const sessionManager = new SessionManager();

// 导出类型
export type { SessionListener, SessionState };
