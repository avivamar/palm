/**
 * 会话状态缓存服务
 * 实现客户端会话状态缓存，减少对服务器的频繁请求
 */

type SessionCacheEntry = {
  isAuthenticated: boolean;
  isVerified: boolean;
  uid?: string;
  timestamp: number;
  expiresAt: number;
};

class SessionCache {
  private cache: SessionCacheEntry | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存
  private readonly STORAGE_KEY = 'rolitt_session_cache';
  private pendingRequest: Promise<SessionCacheEntry> | null = null;

  constructor() {
    // 从localStorage恢复缓存（如果可用）
    this.loadFromStorage();
  }

  /**
   * 从localStorage加载缓存
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SessionCacheEntry;
        if (parsed.expiresAt > Date.now()) {
          this.cache = parsed;
        } else {
          localStorage.removeItem(this.STORAGE_KEY);
        }
      }
    } catch (error) {
      console.warn('Failed to load session cache from storage:', error);
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * 保存缓存到localStorage
   */
  private saveToStorage(entry: SessionCacheEntry): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to save session cache to storage:', error);
    }
  }

  /**
   * 检查缓存是否有效
   */
  private isCacheValid(): boolean {
    return this.cache !== null && this.cache.expiresAt > Date.now();
  }

  /**
   * 获取会话状态（带缓存）
   */
  async getSessionStatus(): Promise<SessionCacheEntry> {
    // 如果缓存有效，直接返回
    if (this.isCacheValid()) {
      return this.cache!;
    }

    // 如果已有请求在进行中，等待该请求
    if (this.pendingRequest) {
      return this.pendingRequest;
    }

    // 发起新的请求
    this.pendingRequest = this.fetchSessionStatus();

    try {
      const result = await this.pendingRequest;
      return result;
    } finally {
      this.pendingRequest = null;
    }
  }

  /**
   * 从服务器获取会话状态
   */
  private async fetchSessionStatus(): Promise<SessionCacheEntry> {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      const data = await response.json();
      const now = Date.now();

      const entry: SessionCacheEntry = {
        isAuthenticated: response.ok && data.isAuthenticated,
        isVerified: data.isVerified || false,
        uid: data.uid,
        timestamp: now,
        expiresAt: now + this.CACHE_DURATION,
      };

      // 更新缓存
      this.cache = entry;
      this.saveToStorage(entry);

      return entry;
    } catch (error) {
      console.error('Failed to fetch session status:', error);

      // 返回未认证状态
      const entry: SessionCacheEntry = {
        isAuthenticated: false,
        isVerified: false,
        timestamp: Date.now(),
        expiresAt: Date.now() + 30 * 1000, // 30秒后重试
      };

      this.cache = entry;
      return entry;
    }
  }

  /**
   * 强制刷新缓存
   */
  async refreshCache(): Promise<SessionCacheEntry> {
    // this.invalidateCache();
    return this.getSessionStatus();
  }

  /**
   * 使缓存失效
   */
  invalidateCache(): void {
    this.cache = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * 更新缓存（用于登录/登出后立即更新）
   */
  updateCache(sessionData: Partial<SessionCacheEntry>): void {
    const now = Date.now();
    this.cache = {
      isAuthenticated: false,
      isVerified: false,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION,
      ...sessionData,
    };
    this.saveToStorage(this.cache);
  }

  /**
   * 获取缓存的会话状态（不发起网络请求）
   */
  getCachedStatus(): SessionCacheEntry | null {
    return this.isCacheValid() ? this.cache : null;
  }
}

// 单例实例
export const sessionCache = new SessionCache();

// 导出类型
export type { SessionCacheEntry };
