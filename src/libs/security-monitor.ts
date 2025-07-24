/**
 * Security Configuration and Monitoring
 * Following CLAUDE.md: 商业价值优先，TypeScript严格模式，安全性优先
 */

import { isFeatureAvailable } from '@/libs/Env';
import { globalErrorHandler } from '@/libs/global-error-handler';

export type SecurityConfig = {
  // API Security
  rateLimit: {
    enabled: boolean;
    strictMode: boolean;
    alertThreshold: number; // requests per minute that trigger alerts
  };

  // Authentication Security
  auth: {
    sessionTimeout: number; // minutes
    maxLoginAttempts: number;
    lockoutDuration: number; // minutes
    requireEmailVerification: boolean;
  };

  // Admin Security
  admin: {
    enableAuditLogging: boolean;
    requireMFA: boolean;
    sessionTimeout: number; // minutes
    ipWhitelist: string[];
  };

  // Data Security
  data: {
    enableEncryption: boolean;
    backupRetention: number; // days
    enableDataCleanup: boolean;
    piiAnonymization: boolean;
  };

  // Monitoring
  monitoring: {
    enableErrorTracking: boolean;
    enablePerformanceMonitoring: boolean;
    alertChannels: ('email' | 'webhook' | 'slack')[];
    criticalErrorThreshold: number; // errors per hour
  };

  // Network Security
  network: {
    enableCSP: boolean;
    enableHSTS: boolean;
    allowedOrigins: string[];
    blockSuspiciousIPs: boolean;
  };
};

const PRODUCTION_SECURITY_CONFIG: SecurityConfig = {
  rateLimit: {
    enabled: true,
    strictMode: true,
    alertThreshold: 1000, // 1000 requests per minute
  },
  auth: {
    sessionTimeout: 30, // 30 minutes
    maxLoginAttempts: 5,
    lockoutDuration: 15, // 15 minutes
    requireEmailVerification: true,
  },
  admin: {
    enableAuditLogging: true,
    requireMFA: false, // TODO: Implement MFA
    sessionTimeout: 15, // 15 minutes for admin sessions
    ipWhitelist: [], // Empty means no IP restrictions
  },
  data: {
    enableEncryption: true,
    backupRetention: 30, // 30 days
    enableDataCleanup: true,
    piiAnonymization: true,
  },
  monitoring: {
    enableErrorTracking: true,
    enablePerformanceMonitoring: true,
    alertChannels: ['email', 'webhook'],
    criticalErrorThreshold: 50, // 50 errors per hour
  },
  network: {
    enableCSP: true,
    enableHSTS: true,
    allowedOrigins: [
      'https://www.rolitt.com',
      'https://www.rolitt.com',
      'https://app.rolitt.com',
    ],
    blockSuspiciousIPs: true,
  },
};

const DEVELOPMENT_SECURITY_CONFIG: SecurityConfig = {
  rateLimit: {
    enabled: false,
    strictMode: false,
    alertThreshold: 10000,
  },
  auth: {
    sessionTimeout: 1440, // 24 hours for development
    maxLoginAttempts: 10,
    lockoutDuration: 5, // 5 minutes
    requireEmailVerification: false,
  },
  admin: {
    enableAuditLogging: true,
    requireMFA: false,
    sessionTimeout: 1440, // 24 hours for development
    ipWhitelist: [],
  },
  data: {
    enableEncryption: false,
    backupRetention: 7, // 7 days
    enableDataCleanup: false,
    piiAnonymization: false,
  },
  monitoring: {
    enableErrorTracking: true,
    enablePerformanceMonitoring: false,
    alertChannels: [],
    criticalErrorThreshold: 1000,
  },
  network: {
    enableCSP: false,
    enableHSTS: false,
    allowedOrigins: ['*'],
    blockSuspiciousIPs: false,
  },
};

/**
 * Get security configuration based on environment
 */
export function getSecurityConfig(): SecurityConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? PRODUCTION_SECURITY_CONFIG : DEVELOPMENT_SECURITY_CONFIG;
}

/**
 * Security monitoring service
 */
export class SecurityMonitor {
  private config: SecurityConfig;
  private alertCounts: Map<string, number> = new Map();
  private lastAlertReset: number = Date.now();
  private alertResetInterval: number = 60 * 60 * 1000; // 1 hour
  private intervalId: NodeJS.Timeout | null = null;
  private initialized: boolean = false;

  constructor() {
    this.config = getSecurityConfig();
    // Delay initialization to avoid running during build
    if (typeof window !== 'undefined' || process.env.NODE_ENV !== 'production') {
      this.initialize();
    }
  }

  private initialize(): void {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    this.setupMonitoring();
  }

  private setupMonitoring(): void {
    // Only set up intervals in runtime, not during build
    if (typeof process !== 'undefined' && process.env.NEXT_PHASE === 'phase-production-build') {
      return;
    }

    // Reset alert counts every hour
    this.intervalId = setInterval(() => {
      this.resetAlertCounts();
    }, this.alertResetInterval);

    // Setup error tracking
    if (this.config.monitoring.enableErrorTracking) {
      globalErrorHandler.reportError = this.handleSecurityError.bind(this);
    }
  }

  /**
   * Cleanup method to clear intervals
   */
  cleanup(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private resetAlertCounts(): void {
    this.alertCounts.clear();
    this.lastAlertReset = Date.now();
    console.log('🔒 Security alert counts reset');
  }

  /**
   * Handle security-related errors
   */
  private async handleSecurityError(errorInfo: any): Promise<void> {
    const errorType = this.categorizeError(errorInfo);

    if (this.isCriticalError(errorType)) {
      await this.sendCriticalAlert(errorInfo, errorType);
    }

    this.incrementAlertCount(errorType);

    // Check if we've exceeded the critical error threshold
    const criticalCount = this.alertCounts.get('critical') || 0;
    if (criticalCount >= this.config.monitoring.criticalErrorThreshold) {
      await this.sendSystemAlert({
        type: 'critical_threshold_exceeded',
        count: criticalCount,
        threshold: this.config.monitoring.criticalErrorThreshold,
        timeWindow: '1 hour',
      });
    }
  }

  private categorizeError(errorInfo: any): string {
    const message = errorInfo.error?.message?.toLowerCase() || '';
    const stack = errorInfo.error?.stack?.toLowerCase() || '';

    // Security-related errors
    if (message.includes('unauthorized') || message.includes('forbidden')) {
      return 'security';
    }

    if (message.includes('rate limit') || message.includes('too many requests')) {
      return 'rate_limit';
    }

    if (message.includes('database') || message.includes('connection')) {
      return 'database';
    }

    if (message.includes('payment') || message.includes('stripe')) {
      return 'payment';
    }

    if (stack.includes('webhook') || message.includes('webhook')) {
      return 'webhook';
    }

    return 'general';
  }

  private isCriticalError(errorType: string): boolean {
    return ['security', 'database', 'payment'].includes(errorType);
  }

  private incrementAlertCount(errorType: string): void {
    const current = this.alertCounts.get(errorType) || 0;
    this.alertCounts.set(errorType, current + 1);

    if (this.isCriticalError(errorType)) {
      const criticalCount = this.alertCounts.get('critical') || 0;
      this.alertCounts.set('critical', criticalCount + 1);
    }
  }

  /**
   * Send critical security alert
   */
  private async sendCriticalAlert(errorInfo: any, errorType: string): Promise<void> {
    const alert = {
      type: 'critical_error',
      errorType,
      timestamp: new Date().toISOString(),
      error: {
        message: errorInfo.error?.message,
        stack: errorInfo.error?.stack?.substring(0, 1000), // Limit stack trace
      },
      context: {
        url: errorInfo.url,
        userAgent: errorInfo.userAgent,
        userId: errorInfo.userId,
      },
      environment: process.env.NODE_ENV,
    };

    console.error('🚨 CRITICAL SECURITY ALERT:', alert);

    // Send to configured alert channels
    await Promise.all(
      this.config.monitoring.alertChannels.map(channel =>
        this.sendAlertToChannel(channel, alert),
      ),
    );
  }

  /**
   * Send system-level alert
   */
  private async sendSystemAlert(alert: any): Promise<void> {
    const systemAlert = {
      type: 'system_alert',
      timestamp: new Date().toISOString(),
      ...alert,
      environment: process.env.NODE_ENV,
    };

    console.error('🚨 SYSTEM ALERT:', systemAlert);

    await Promise.all(
      this.config.monitoring.alertChannels.map(channel =>
        this.sendAlertToChannel(channel, systemAlert),
      ),
    );
  }

  /**
   * Send alert to specific channel
   */
  private async sendAlertToChannel(channel: string, alert: any): Promise<void> {
    try {
      switch (channel) {
        case 'email':
          await this.sendEmailAlert(alert);
          break;
        case 'webhook':
          await this.sendWebhookAlert(alert);
          break;
        case 'slack':
          await this.sendSlackAlert(alert);
          break;
        default:
          console.warn(`Unknown alert channel: ${channel}`);
      }
    } catch (error) {
      console.error(`Failed to send alert to ${channel}:`, error);
    }
  }

  private async sendEmailAlert(alert: any): Promise<void> {
    if (!isFeatureAvailable('resend')) {
      console.warn('Email alerts not available - Resend not configured');
      return;
    }

    // TODO: Implement email alerting with Resend
    console.log('📧 Email alert would be sent:', alert);
  }

  private async sendWebhookAlert(alert: any): Promise<void> {
    const webhookUrl = process.env.SECURITY_ALERT_WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('Webhook alerts not available - no webhook URL configured');
      return;
    }

    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alert),
      });
    } catch (error) {
      console.error('Failed to send webhook alert:', error);
    }
  }

  private async sendSlackAlert(alert: any): Promise<void> {
    const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!slackWebhookUrl) {
      console.warn('Slack alerts not available - no Slack webhook URL configured');
      return;
    }

    const slackMessage = {
      text: `🚨 Security Alert: ${alert.type}`,
      attachments: [
        {
          color: 'danger',
          fields: [
            {
              title: 'Error Type',
              value: alert.errorType || 'unknown',
              short: true,
            },
            {
              title: 'Environment',
              value: alert.environment,
              short: true,
            },
            {
              title: 'Timestamp',
              value: alert.timestamp,
              short: false,
            },
          ],
        },
      ],
    };

    try {
      await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackMessage),
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  /**
   * Ensure monitor is initialized (for API routes)
   */
  ensureInitialized(): void {
    if (!this.initialized) {
      this.initialize();
    }
  }

  /**
   * Get current monitoring statistics
   */
  getMonitoringStats(): {
    alertCounts: Record<string, number>;
    lastReset: string;
    config: SecurityConfig;
    uptime: number;
  } {
    this.ensureInitialized();
    return {
      alertCounts: Object.fromEntries(this.alertCounts),
      lastReset: new Date(this.lastAlertReset).toISOString(),
      config: this.config,
      uptime: process.uptime(),
    };
  }

  /**
   * Manually trigger a test alert
   */
  async sendTestAlert(): Promise<void> {
    const testAlert = {
      type: 'test_alert',
      timestamp: new Date().toISOString(),
      message: 'This is a test alert to verify monitoring systems',
      environment: process.env.NODE_ENV,
    };

    await Promise.all(
      this.config.monitoring.alertChannels.map(channel =>
        this.sendAlertToChannel(channel, testAlert),
      ),
    );
  }
}

/**
 * Security headers middleware configuration
 */
export function getSecurityHeaders(): Record<string, string> {
  const config = getSecurityConfig();
  const headers: Record<string, string> = {};

  if (config.network.enableHSTS) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  }

  if (config.network.enableCSP) {
    headers['Content-Security-Policy'] = [
      'default-src \'self\'',
      'script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' https://js.stripe.com https://cdn.jsdelivr.net',
      'style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com',
      'font-src \'self\' https://fonts.gstatic.com',
      'img-src \'self\' data: https: blob:',
      'connect-src \'self\' https: wss:',
      'frame-src \'self\' https://js.stripe.com',
    ].join('; ');
  }

  // Security headers that should always be present
  headers['X-Content-Type-Options'] = 'nosniff';
  headers['X-Frame-Options'] = 'DENY';
  headers['X-XSS-Protection'] = '1; mode=block';
  headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
  headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=()';

  return headers;
}

/**
 * Validate request against security policies
 */
export function validateRequestSecurity(request: {
  ip?: string;
  userAgent?: string;
  origin?: string;
}): {
  allowed: boolean;
  reason?: string;
} {
  const config = getSecurityConfig();

  // Check origin
  if (config.network.allowedOrigins.length > 0
    && !config.network.allowedOrigins.includes('*')
    && request.origin
    && !config.network.allowedOrigins.includes(request.origin)) {
    return {
      allowed: false,
      reason: 'Origin not allowed',
    };
  }

  // Check for suspicious patterns (basic implementation)
  if (request.userAgent) {
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /scanner/i,
      /hack/i,
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(request.userAgent!))) {
      return {
        allowed: false,
        reason: 'Suspicious user agent',
      };
    }
  }

  return { allowed: true };
}

// Lazy singleton to avoid initialization during build
let _securityMonitor: SecurityMonitor | null = null;

export const getSecurityMonitor = (): SecurityMonitor => {
  if (!_securityMonitor) {
    _securityMonitor = new SecurityMonitor();
  }
  return _securityMonitor;
};

// Export as const for backward compatibility
export const securityMonitor = new Proxy({} as SecurityMonitor, {
  get(_target, prop) {
    const monitor = getSecurityMonitor();
    return monitor[prop as keyof SecurityMonitor];
  },
});

// Development helper - only in runtime
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).__securityMonitor = securityMonitor;
  console.log('🔒 Security monitoring initialized');
}
