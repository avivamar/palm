/**
 * Stripe webhook handler
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

import type { NextRequest } from 'next/server';
import { PaymentError } from '../../libs/errors';
import { StripeCheckoutService } from '../stripe/StripeCheckoutService';

export type WebhookHandlerConfig = {
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  stripeApiVersion?: string;
};

export class StripeWebhookHandler {
  private checkoutService: StripeCheckoutService;
  private webhookSecret: string;

  constructor(config: WebhookHandlerConfig) {
    this.checkoutService = new StripeCheckoutService(
      config.stripeSecretKey,
      config.stripeApiVersion,
    );
    this.webhookSecret = config.stripeWebhookSecret;
  }

  /**
   * Handle incoming webhook request
   */
  async handleWebhook(request: NextRequest): Promise<Response> {
    try {
      const body = await request.text();
      const signature = request.headers.get('stripe-signature');

      if (!signature) {
        throw new PaymentError('Missing Stripe signature', 'MISSING_SIGNATURE', 'stripe');
      }

      // Validate webhook
      const event = await this.checkoutService.validateWebhook(body, signature, this.webhookSecret);

      // Process event
      const result = await this.checkoutService.processWebhookEvent(event);

      return new Response(
        JSON.stringify({
          received: true,
          processed: result.processed,
          message: result.message,
          eventType: event.type,
          eventId: event.id,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    } catch (error) {
      console.error('Webhook error:', error);

      if (error instanceof PaymentError) {
        return new Response(
          JSON.stringify({
            error: error.message,
            code: error.code,
            provider: error.provider,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }

      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  }
}
