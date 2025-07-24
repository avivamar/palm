import type { LogEntry, Logger, LogLevel } from '../core/interfaces';

export class AILogger implements Logger {
  private static instance: AILogger;

  static getInstance(): AILogger {
    if (!this.instance) {
      this.instance = new AILogger();
    }
    return this.instance;
  }

  private createLogEntry(level: LogLevel, message: string, metadata?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date(),
      metadata: metadata ? this.sanitizeMetadata(metadata) : undefined,
    };
  }

  private sanitizeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(metadata)) {
      // Remove sensitive information
      if (key.toLowerCase().includes('key')
        || key.toLowerCase().includes('token')
        || key.toLowerCase().includes('secret')
        || key.toLowerCase().includes('password')) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'string' && value.length > 1000) {
        // Truncate very long strings
        sanitized[key] = `${value.substring(0, 1000)}... [TRUNCATED]`;
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
    const logEntry = this.createLogEntry(level, message, metadata);

    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(logEntry);
    }

    // In production, integrate with external logging service
    if (process.env.NODE_ENV === 'production') {
      this.logToExternalService(logEntry);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const { level, message, timestamp, metadata } = entry;
    const logData = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(metadata && { metadata }),
    };

    switch (level) {
      case 'debug':
        console.debug(JSON.stringify(logData, null, 2));
        break;
      case 'info':
        console.info(JSON.stringify(logData, null, 2));
        break;
      case 'warn':
        console.warn(JSON.stringify(logData, null, 2));
        break;
      case 'error':
        console.error(JSON.stringify(logData, null, 2));
        break;
    }
  }

  private logToExternalService(entry: LogEntry): void {
    // Integrate with external logging service
    if (entry.level === 'error' && typeof window === 'undefined') {
      // Server-side error logging
      try {
        // Example: External error tracking service integration
        // For now, just log to stderr
        console.error('AI_CORE_ERROR:', JSON.stringify(entry));
      } catch {
        // Ignore logging errors
      }
    }
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log('warn', message, metadata);
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    this.log('error', message, metadata);
  }

  // Utility methods
  logAIRequest(provider: string, model: string, userId?: string): void {
    this.info('AI request initiated', {
      provider,
      model,
      userId,
      category: 'ai_request',
    });
  }

  logAIResponse(provider: string, model: string, responseTime: number, cached: boolean, userId?: string): void {
    this.info('AI response completed', {
      provider,
      model,
      responseTime,
      cached,
      userId,
      category: 'ai_response',
    });
  }

  logCacheOperation(operation: string, key: string, hit?: boolean): void {
    this.debug('Cache operation', {
      operation,
      key: this.hashKey(key), // Hash the key for privacy
      hit,
      category: 'cache',
    });
  }

  logRateLimit(identifier: string, remaining: number, resetTime?: Date): void {
    this.info('Rate limit check', {
      identifier: this.hashKey(identifier), // Hash identifier for privacy
      remaining,
      resetTime: resetTime?.toISOString(),
      category: 'rate_limit',
    });
  }

  private hashKey(key: string): string {
    // Simple hash for privacy without exposing actual keys
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}
