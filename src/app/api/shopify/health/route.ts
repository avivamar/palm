import { ShopifyClient } from '@rolitt/shopify';
import { NextResponse } from 'next/server';

// Force dynamic rendering for health check
export const dynamic = 'force-dynamic';

type HealthCheckResponse = {
  status: 'healthy' | 'unhealthy';
  services: {
    shopifyApi: 'connected' | 'disconnected';
    configuration: 'valid' | 'invalid';
    timestamp: string;
  };
  details?: {
    shopDomain?: string;
    apiVersion: string;
    errors?: string[];
  };
};

export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
  const timestamp = new Date().toISOString();

  try {
    // Initialize Shopify client
    const shopifyClient = new ShopifyClient();

    // Perform health check
    const healthResult = await shopifyClient.healthCheck();

    if (healthResult.status === 'healthy') {
      return NextResponse.json({
        status: 'healthy',
        services: {
          shopifyApi: 'connected',
          configuration: 'valid',
          timestamp,
        },
        details: {
          apiVersion: '2025-01',
        },
      });
    } else {
      return NextResponse.json({
        status: 'unhealthy',
        services: {
          shopifyApi: 'disconnected',
          configuration: 'invalid',
          timestamp,
        },
        details: {
          apiVersion: '2025-01',
          errors: [healthResult.error || 'Unknown error'],
        },
      }, { status: 503 });
    }
  } catch (error) {
    console.error('[Shopify Health Check] Error:', error);

    return NextResponse.json({
      status: 'unhealthy',
      services: {
        shopifyApi: 'disconnected',
        configuration: 'invalid',
        timestamp,
      },
      details: {
        apiVersion: '2025-01',
        errors: [error instanceof Error ? error.message : 'Health check failed'],
      },
    }, { status: 503 });
  }
}
