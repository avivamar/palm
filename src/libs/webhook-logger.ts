import { eq } from 'drizzle-orm';
import { getDB } from '@/libs/DB';
import { webhookLogsSchema } from '@/models/Schema';

export type WebhookLogData = {
  event: string;
  status: 'success' | 'failed' | 'pending' | 'retry' | 'expired';
  email?: string | null;
  error?: string | null;
  stripeEventId?: string | null;
  metadata?: Record<string, any>;
};

export type WebhookLogEntry = {
  id: string;
  event_type: string;
  event_id: string;
  status: 'started' | 'success' | 'failure';
  timestamp: Date;
  processing_time_ms?: number;
  klaviyo_success?: boolean;
  error_message?: string;
  metadata?: Record<string, any>;
};

export type KlaviyoEventLogEntry = {
  id: string;
  event_id: string;
  event_type: string;
  email: string;
  status: 'started' | 'success' | 'failure';
  timestamp: Date;
  response_time_ms?: number;
  error_message?: string;
  error_type?: string;
  rate_limited?: boolean;
  metadata?: Record<string, any>;
};

export type KlaviyoAlertLogEntry = {
  id: string;
  alert_type: string;
  severity: string;
  message: string;
  timestamp: Date;
  metrics?: Record<string, any>;
};

export class WebhookLogger {
  static async log(logData: WebhookLogData): Promise<number> {
    const db = await getDB();
    const result = await db.insert(webhookLogsSchema).values({
      ...logData,
      receivedAt: new Date(),
      createdAt: new Date(),
    }).returning({ id: webhookLogsSchema.id });

    const logId = result[0]?.id;
    if (!logId) {
      throw new Error('Failed to create webhook log in PostgreSQL');
    }
    return logId;
  }

  static async updateLog(
    logId: number,
    updates: Partial<Pick<WebhookLogData, 'status' | 'error' | 'metadata'>>,
  ): Promise<void> {
    const db = await getDB();
    await db.update(webhookLogsSchema).set({
      ...updates,
      updatedAt: new Date(),
    }).where(eq(webhookLogsSchema.id, logId));
  }

  static async logStripeEventStart(eventType: string, eventId: string, email?: string): Promise<number> {
    return this.log({
      event: eventType,
      status: 'pending',
      email,
      stripeEventId: eventId,
      metadata: { stripe_event_id: eventId },
    });
  }

  static async logStripeEventSuccess(
    logId: number,
    klaviyoSuccess: boolean,
    metadata: Record<string, any>,
  ) {
    const db = await getDB();
    await db.update(webhookLogsSchema).set({
      status: 'success',
      klaviyoEventSent: klaviyoSuccess,
      processedAt: new Date(),
      updatedAt: new Date(),
      ...metadata,
    }).where(eq(webhookLogsSchema.id, logId));
  }

  static async logStripeEventFailure(
    logId: number,
    error: string | Error,
    metadata: Record<string, any>,
  ) {
    const errorMessage = error instanceof Error ? error.message : error;
    await this.updateLog(logId, {
      status: 'failed',
      error: errorMessage,
      metadata,
    });
  }

  // Klaviyo 事件日志记录方法
  static async logKlaviyoEventStart(data: {
    eventId: string;
    eventType: string;
    email: string;
    timestamp: Date;
  }): Promise<number> {
    try {
      const db = await getDB();
      const result = await db
        .insert(webhookLogsSchema)
        .values({
          event: `klaviyo_${data.eventType}`,
          status: 'pending',
          email: data.email,
          stripeEventId: data.eventId,
          metadata: {
            email: data.email,
            source: 'klaviyo',
            eventType: data.eventType,
          },
          receivedAt: data.timestamp,
          createdAt: data.timestamp,
        })
        .returning({ id: webhookLogsSchema.id });

      return result[0].id;
    } catch (error) {
      console.error('Failed to log Klaviyo event start:', error);
      return -1;
    }
  }

  static async logKlaviyoEventSuccess(data: {
    logId: number;
    responseTime: number;
    metadata?: Record<string, any>;
    timestamp: Date;
  }): Promise<void> {
    try {
      const db = await getDB();
      await db
        .update(webhookLogsSchema)
        .set({
          status: 'success',
          klaviyoEventSent: true,
          processedAt: data.timestamp,
          updatedAt: data.timestamp,
          metadata: data.metadata,
        })
        .where(eq(webhookLogsSchema.id, data.logId));
    } catch (error) {
      console.error('Failed to log Klaviyo event success:', error);
    }
  }

  static async logKlaviyoEventFailure(data: {
    logId: number;
    error: string;
    errorType: string;
    rateLimited?: boolean;
    timestamp: Date;
  }): Promise<void> {
    try {
      await this.updateLog(data.logId, {
        status: 'failed',
        error: data.error,
        metadata: {
          errorType: data.errorType,
          rateLimited: data.rateLimited || false,
        },
      });
    } catch (error) {
      console.error('Failed to log Klaviyo event failure:', error);
    }
  }

  static async logKlaviyoAlert(alert: {
    id: string;
    type: string;
    severity: string;
    message: string;
    timestamp: Date;
    metrics?: Record<string, any>;
  }): Promise<void> {
    try {
      const db = await getDB();
      await db
        .insert(webhookLogsSchema)
        .values({
          event: `klaviyo_alert_${alert.type}`,
          status: 'pending',
          stripeEventId: alert.id,
          error: alert.message,
          metadata: {
            source: 'klaviyo_monitor',
            alertType: alert.type,
            severity: alert.severity,
            metrics: alert.metrics,
          },
          receivedAt: alert.timestamp,
          createdAt: alert.timestamp,
        });
    } catch (error) {
      console.error('Failed to log Klaviyo alert:', error);
    }
  }

  static async logStripeEvent(
    logId: number,
    status: 'expired' | 'failed' | 'success' | 'pending' | 'retry',
    metadata: Record<string, any>,
  ) {
    await this.updateLog(logId, {
      status,
      metadata,
    });
  }

  // 支付监控日志记录方法
  static async logPaymentMetric(data: {
    eventId: string;
    type: 'payment_success' | 'payment_failure';
    processingTime: number;
    error?: string;
    errorType?: string;
    timestamp: Date;
  }): Promise<void> {
    try {
      const db = await getDB();
      await db
        .insert(webhookLogsSchema)
        .values({
          event: `payment_metric_${data.type}`,
          status: data.type === 'payment_success' ? 'success' : 'failed',
          stripeEventId: data.eventId,
          error: data.error || null,
          metadata: {
            source: 'payment_monitor',
            processingTime: data.processingTime,
            errorType: data.errorType,
          },
          receivedAt: data.timestamp,
          createdAt: data.timestamp,
        });
    } catch (error) {
      console.error('Failed to log payment metric:', error);
    }
  }

  static async logPaymentAlert(alert: {
    id: string;
    type: 'success_rate_low' | 'high_error_rate' | 'processing_time_high' | 'webhook_failure';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
    metrics?: Record<string, any>;
  }): Promise<void> {
    try {
      const db = await getDB();
      await db
        .insert(webhookLogsSchema)
        .values({
          event: `payment_alert_${alert.type}`,
          status: 'pending',
          stripeEventId: alert.id,
          error: alert.message,
          metadata: {
            source: 'payment_monitor',
            alertType: alert.type,
            severity: alert.severity,
            metrics: alert.metrics,
          },
          receivedAt: alert.timestamp,
          createdAt: alert.timestamp,
        });
    } catch (error) {
      console.error('Failed to log payment alert:', error);
    }
  }

  // Shopify webhook logging methods
  static async logWebhookEventStart(
    webhookId: string,
    source: 'shopify' | 'stripe',
    eventType: string,
    eventId: string,
    email?: string,
  ): Promise<number> {
    try {
      const db = await getDB();
      const result = await db
        .insert(webhookLogsSchema)
        .values({
          event: `${source}_${eventType}`,
          status: 'pending',
          email: email || null,
          stripeEventId: eventId,
          metadata: {
            source,
            webhookId,
            eventType,
            eventId,
          },
          receivedAt: new Date(),
          createdAt: new Date(),
        })
        .returning({ id: webhookLogsSchema.id });

      return result[0].id;
    } catch (error) {
      console.error(`Failed to log ${source} webhook event start:`, error);
      return -1;
    }
  }

  static async logWebhookEventSuccess(
    logId: number,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      const db = await getDB();
      await db
        .update(webhookLogsSchema)
        .set({
          status: 'success',
          processedAt: new Date(),
          updatedAt: new Date(),
          metadata,
        })
        .where(eq(webhookLogsSchema.id, logId));
    } catch (error) {
      console.error('Failed to log webhook event success:', error);
    }
  }

  static async logWebhookEventFailure(
    logId: number,
    error: Error,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.updateLog(logId, {
        status: 'failed',
        error: error.message,
        metadata: {
          ...metadata,
          errorStack: error.stack,
        },
      });
    } catch (logError) {
      console.error('Failed to log webhook event failure:', logError);
    }
  }

  static async logShopifySync(data: {
    orderId: string;
    email: string;
    shopifyOrderId?: string;
    status: 'success' | 'failed';
    error?: string;
    timestamp: Date;
  }): Promise<void> {
    try {
      const db = await getDB();
      await db
        .insert(webhookLogsSchema)
        .values({
          event: `shopify_sync_${data.status}`,
          status: data.status === 'success' ? 'success' : 'failed',
          email: data.email,
          stripeEventId: data.orderId,
          error: data.error || null,
          metadata: {
            source: 'shopify_sync',
            orderId: data.orderId,
            shopifyOrderId: data.shopifyOrderId,
          },
          receivedAt: data.timestamp,
          createdAt: data.timestamp,
        });
    } catch (error) {
      console.error('Failed to log Shopify sync:', error);
    }
  }
}
