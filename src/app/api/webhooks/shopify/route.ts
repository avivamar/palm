/**
 * Shopify Webhook Handler
 * Following CLAUDE.md: 商业价值优先，TypeScript严格模式
 */

import type { NextRequest } from 'next/server';
import crypto from 'node:crypto';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getDB } from '@/libs/DB';
import { WebhookLogger } from '@/libs/webhook-logger';
import { preordersSchema } from '@/models/Schema';

// Shopify webhook events we handle
const SUPPORTED_EVENTS = [
  'orders/create',
  'orders/updated',
  'orders/paid',
  'orders/cancelled',
  'orders/fulfilled',
  'app/uninstalled',
] as const;

type ShopifyWebhookEvent = typeof SUPPORTED_EVENTS[number];

type ShopifyWebhookPayload = {
  id: string;
  email?: string;
  order_number?: string;
  financial_status?: string;
  fulfillment_status?: string;
  total_price?: string;
  currency?: string;
  created_at?: string;
  updated_at?: string;
  tags?: string;
  line_items?: Array<{
    id: string;
    title: string;
    quantity: number;
    price: string;
  }>;
  customer?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
};

function verifyShopifyWebhook(rawBody: string, signature: string): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('SHOPIFY_WEBHOOK_SECRET not configured');
    return false;
  }

  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature),
  );
}

async function handleOrderCreate(payload: ShopifyWebhookPayload): Promise<void> {
  const db = await getDB();

  // Check if this is a Rolitt-synced order
  const isRolittOrder = payload.tags?.includes('rolitt-sync');

  if (isRolittOrder) {
    // This is an order we created, update our records
    await db.update(preordersSchema)
      .set({
        shopifyOrderId: payload.id,
        shopifyOrderNumber: payload.order_number,
        shopifyFulfillmentStatus: payload.fulfillment_status || 'unfulfilled',
        shopifySyncedAt: new Date(),
        shopifyError: null,
        shopifyLastAttemptAt: new Date(),
      })
      .where(eq(preordersSchema.email, payload.email || ''));
  }

  console.log(`Shopify order created: ${payload.id} (${payload.order_number})`);
}

async function handleOrderUpdated(payload: ShopifyWebhookPayload): Promise<void> {
  const db = await getDB();

  // Update existing order records
  await db.update(preordersSchema)
    .set({
      shopifyFulfillmentStatus: payload.fulfillment_status || 'unfulfilled',
      shopifySyncedAt: new Date(),
    })
    .where(eq(preordersSchema.shopifyOrderId, payload.id));

  console.log(`Shopify order updated: ${payload.id}`);
}

async function handleOrderPaid(payload: ShopifyWebhookPayload): Promise<void> {
  const db = await getDB();

  // Update payment status
  await db.update(preordersSchema)
    .set({
      shopifyFulfillmentStatus: payload.fulfillment_status || 'unfulfilled',
      shopifySyncedAt: new Date(),
    })
    .where(eq(preordersSchema.shopifyOrderId, payload.id));

  console.log(`Shopify order paid: ${payload.id}`);
}

async function handleOrderCancelled(payload: ShopifyWebhookPayload): Promise<void> {
  const db = await getDB();

  // Update order status
  await db.update(preordersSchema)
    .set({
      shopifyFulfillmentStatus: 'cancelled',
      shopifySyncedAt: new Date(),
    })
    .where(eq(preordersSchema.shopifyOrderId, payload.id));

  console.log(`Shopify order cancelled: ${payload.id}`);
}

async function handleOrderFulfilled(payload: ShopifyWebhookPayload): Promise<void> {
  const db = await getDB();

  // Update fulfillment status
  await db.update(preordersSchema)
    .set({
      shopifyFulfillmentStatus: 'fulfilled',
      shopifySyncedAt: new Date(),
    })
    .where(eq(preordersSchema.shopifyOrderId, payload.id));

  console.log(`Shopify order fulfilled: ${payload.id}`);
}

async function handleAppUninstalled(_payload: ShopifyWebhookPayload): Promise<void> {
  // Log app uninstallation
  console.log('Shopify app uninstalled');

  // Here you might want to:
  // - Update app installation status in database
  // - Send notification to admin
  // - Clean up any app-specific data
}

async function processShopifyWebhook(
  eventType: ShopifyWebhookEvent,
  payload: ShopifyWebhookPayload,
): Promise<void> {
  switch (eventType) {
    case 'orders/create':
      await handleOrderCreate(payload);
      break;
    case 'orders/updated':
      await handleOrderUpdated(payload);
      break;
    case 'orders/paid':
      await handleOrderPaid(payload);
      break;
    case 'orders/cancelled':
      await handleOrderCancelled(payload);
      break;
    case 'orders/fulfilled':
      await handleOrderFulfilled(payload);
      break;
    case 'app/uninstalled':
      await handleAppUninstalled(payload);
      break;
    default:
      console.log(`Unhandled Shopify webhook event: ${eventType}`);
  }
}

export async function POST(request: NextRequest) {
  const webhookId = `shopify_${Date.now()}`;

  try {
    // Get headers
    const headersList = await headers();
    const shopifyTopic = headersList.get('X-Shopify-Topic');
    const shopifySignature = headersList.get('X-Shopify-Hmac-Sha256');
    const shopifyShop = headersList.get('X-Shopify-Shop-Domain');

    if (!shopifyTopic || !shopifySignature) {
      return NextResponse.json(
        { error: 'Missing required Shopify headers' },
        { status: 400 },
      );
    }

    // Verify this is a supported event
    if (!SUPPORTED_EVENTS.includes(shopifyTopic as ShopifyWebhookEvent)) {
      console.log(`Unsupported Shopify webhook event: ${shopifyTopic}`);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Get raw body for signature verification
    const rawBody = await request.text();

    // Verify webhook signature
    if (!verifyShopifyWebhook(rawBody, shopifySignature)) {
      console.error('Shopify webhook signature verification failed');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 },
      );
    }

    // Parse payload
    const payload: ShopifyWebhookPayload = JSON.parse(rawBody);

    // Log webhook start
    const logId = await WebhookLogger.logWebhookEventStart(
      webhookId,
      'shopify',
      shopifyTopic,
      payload.id || 'unknown',
    );

    // Process the webhook
    await processShopifyWebhook(shopifyTopic as ShopifyWebhookEvent, payload);

    // Log success
    await WebhookLogger.logWebhookEventSuccess(logId, {
      shop: shopifyShop,
      event: shopifyTopic,
      orderId: payload.id,
      orderNumber: payload.order_number,
    });

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Shopify webhook processing error:', error);

    // Log failure
    const logId = await WebhookLogger.logWebhookEventStart(
      webhookId,
      'shopify',
      'error',
      'unknown',
    );
    await WebhookLogger.logWebhookEventFailure(logId, error as Error, {
      source: 'shopify',
      event: 'webhook_processing_error',
    });

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 },
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'shopify-webhooks',
    supportedEvents: SUPPORTED_EVENTS,
    timestamp: new Date().toISOString(),
  });
}
