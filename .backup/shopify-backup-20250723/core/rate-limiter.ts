/**
 * 🚦 Shopify API限流管理器
 * 确保API调用不超出Shopify限制
 */

type RateLimitConfig = {
  strategy: 'conservative' | 'balanced' | 'aggressive';
  maxRequestsPerSecond: number;
};

type RateLimitState = {
  remaining: number;
  max: number;
  resetTime: Date;
  lastRequestTime: Date;
};

export class RateLimiter {
  private config: RateLimitConfig;
  private state: RateLimitState;
  private requestQueue: Array<() => void> = [];
  private isProcessing = false;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.state = {
      remaining: 40, // Shopify默认限制
      max: 40,
      resetTime: new Date(Date.now() + 60000),
      lastRequestTime: new Date(0),
    };
  }

  /**
   * ⏳ 等待限流通过
   */
  public async waitForRateLimit(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.requestQueue.push(resolve);
      this.processQueue();
    });
  }

  /**
   * 📊 更新限流状态
   */
  public updateRateLimit(remaining: number, max: number): void {
    this.state.remaining = remaining;
    this.state.max = max;
    this.state.resetTime = new Date(Date.now() + 60000); // 通常1分钟重置

    // 如果限流缓解，继续处理队列
    if (remaining > 0) {
      this.processQueue();
    }
  }

  /**
   * 🔄 处理请求队列
   */
  private processQueue(): void {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    const processNext = () => {
      if (this.requestQueue.length === 0) {
        this.isProcessing = false;
        return;
      }

      const now = new Date();
      const timeSinceLastRequest = now.getTime() - this.state.lastRequestTime.getTime();
      const minInterval = 1000 / this.config.maxRequestsPerSecond;

      // 🔧 检查是否需要等待
      if (timeSinceLastRequest < minInterval) {
        const waitTime = minInterval - timeSinceLastRequest;
        setTimeout(processNext, waitTime);
        return;
      }

      // 🔧 检查Shopify限流状态
      if (this.state.remaining <= this.getReservedQuota()) {
        // 限流接近，等待重置
        const waitTime = Math.max(0, this.state.resetTime.getTime() - now.getTime());
        if (waitTime > 0) {
          console.warn(`[RateLimiter] 接近限流限制，等待 ${waitTime}ms`);
          setTimeout(() => {
            this.state.remaining = this.state.max; // 重置限流
            processNext();
          }, waitTime);
          return;
        }
      }

      // 🚀 处理下一个请求
      const resolve = this.requestQueue.shift();
      if (resolve) {
        this.state.lastRequestTime = now;
        this.state.remaining = Math.max(0, this.state.remaining - 1);
        resolve();
      }

      // 🔄 继续处理队列
      setImmediate(processNext);
    };

    processNext();
  }

  /**
   * 🔒 获取保留配额
   */
  private getReservedQuota(): number {
    switch (this.config.strategy) {
      case 'conservative': return 10; // 保留25%
      case 'balanced': return 5; // 保留12.5%
      case 'aggressive': return 2; // 保留5%
      default: return 5;
    }
  }

  /**
   * 📊 获取限流状态
   */
  public getStatus(): {
    remaining: number;
    max: number;
    queueLength: number;
    strategy: string;
    resetIn: number;
  } {
    return {
      remaining: this.state.remaining,
      max: this.state.max,
      queueLength: this.requestQueue.length,
      strategy: this.config.strategy,
      resetIn: Math.max(0, this.state.resetTime.getTime() - Date.now()),
    };
  }

  /**
   * 🧹 清空队列（用于关闭或重置）
   */
  public clearQueue(): void {
    // 拒绝所有等待的请求
    this.requestQueue.forEach(resolve => resolve());
    this.requestQueue = [];
    this.isProcessing = false;
  }
}
