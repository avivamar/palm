/**
 * Shopify Status Check API Route
 * Following CLAUDE.md: 商业价值优先，TypeScript严格模式
 */

import { NextResponse } from 'next/server';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';

export async function GET() {
  try {
    // Verify admin access
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Authentication service not available' }, { status: 503 });
    }

    const supabase = await createServerClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check Shopify API connection
    let apiConnectionStatus: 'healthy' | 'warning' | 'critical' = 'warning';
    let apiConnectionDetails = 'Shopify API not configured';

    const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const shopifyToken = process.env.SHOPIFY_ACCESS_TOKEN;

    if (shopifyDomain && shopifyToken) {
      try {
        const response = await fetch(`https://${shopifyDomain}/admin/api/2023-10/shop.json`, {
          headers: {
            'X-Shopify-Access-Token': shopifyToken,
          },
        });

        if (response.ok) {
          apiConnectionStatus = 'healthy';
          apiConnectionDetails = 'Shopify API connection successful';
        } else {
          apiConnectionStatus = 'critical';
          apiConnectionDetails = `Shopify API error: ${response.status}`;
        }
      } catch (shopifyError) {
        apiConnectionStatus = 'critical';
        apiConnectionDetails = `Shopify connection failed: ${shopifyError instanceof Error ? shopifyError.message : 'Unknown error'}`;
      }
    }

    // Check product sync status (mock for now)
    const productSyncStatus: 'healthy' | 'warning' | 'critical' = 'warning';
    const productSyncDetails = 'Product sync not implemented';

    // Check config validation
    let configValidationStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    let configValidationDetails = 'Configuration validation passed';

    if (!shopifyDomain || !shopifyToken) {
      configValidationStatus = 'warning';
      configValidationDetails = 'Shopify environment variables missing';
    }

    return NextResponse.json({
      apiConnection: apiConnectionStatus,
      productSync: productSyncStatus,
      configValidation: configValidationStatus,
      details: {
        apiConnection: apiConnectionDetails,
        productSync: productSyncDetails,
        configValidation: configValidationDetails,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Shopify health check failed:', error);
    return NextResponse.json(
      {
        error: 'Shopify health check failed',
        apiConnection: 'critical',
        productSync: 'critical',
        configValidation: 'critical',
        details: {
          apiConnection: 'Health check system error',
          productSync: 'Health check system error',
          configValidation: 'Health check system error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
