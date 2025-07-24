/**
 * Monitoring module types
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

export type HealthStatus = 'healthy' | 'warning' | 'critical';

export type PaymentMetrics = {
  totalAttempts: number;
  successfulPayments: number;
  failedPayments: number;
  successRate: number;
  lastUpdated: Date;
};

export type PaymentAlert = {
  id: string;
  type: 'success_rate_low' | 'high_error_rate';
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Date;
};

export type HealthStatusData = {
  status: HealthStatus;
  metrics: PaymentMetrics;
  alerts: PaymentAlert[];
};

export type MonitoringTranslations = {
  title: string;
  description: string;
  systemHealth: {
    title: string;
    healthy: string;
    warning: string;
    critical: string;
  };
  alerts: {
    title: string;
    noAlerts: string;
    viewAll: string;
  };
  metrics: {
    totalPayments: string;
    successfulPayments: string;
    failedPayments: string;
    successRate: string;
  };
};
