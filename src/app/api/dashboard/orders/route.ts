/**
 * Dashboard Orders API Route
 * Following CLAUDE.md: 商业价值优先，TypeScript严格模式
 */

import type { NextRequest } from 'next/server';
import { and, desc, eq, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDB } from '@/libs/DB';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';
import { preordersSchema } from '@/models/Schema';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify user authentication
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Authentication service not available' }, { status: 503 });
    }

    const supabase = await createServerClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDB();
    const userEmail = session.user.email;

    if (!userEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = Number.parseInt(searchParams.get('page') || '1');
    const limit = Number.parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Build query conditions
    const conditions = [eq(preordersSchema.email, userEmail)];

    if (status && status !== 'all') {
      conditions.push(eq(preordersSchema.status, status as 'initiated' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'));
    }

    if (search) {
      conditions.push(
        sql`${preordersSchema.color} ILIKE ${`%${search}%`} OR ${preordersSchema.id}::text ILIKE ${`%${search}%`}`,
      );
    }

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(preordersSchema)
      .where(and(...conditions));

    const totalCount = countResult[0]?.count || 0;

    // Fetch orders with pagination
    const ordersResult = await db
      .select({
        id: preordersSchema.id,
        email: preordersSchema.email,
        status: preordersSchema.status,
        amount: preordersSchema.amount,
        color: preordersSchema.color,
        createdAt: preordersSchema.createdAt,
        updatedAt: preordersSchema.updatedAt,
        sessionId: preordersSchema.sessionId,
        billingName: preordersSchema.billingName,
        billingAddressLine1: preordersSchema.billingAddressLine1,
        billingCity: preordersSchema.billingCity,
        billingPostalCode: preordersSchema.billingPostalCode,
        billingCountry: preordersSchema.billingCountry,
        billingPhone: preordersSchema.billingPhone,
      })
      .from(preordersSchema)
      .where(and(...conditions))
      .orderBy(desc(preordersSchema.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    // Transform database results to match expected order format
    const orders = ordersResult.map((order: any) => ({
      id: `order_${order.id}`,
      orderNumber: `ORD-${order.id}`,
      status: order.status as 'pending' | 'processing' | 'completed' | 'cancelled',
      total: Number(order.amount) || 0,
      currency: 'USD',
      items: [
        {
          id: `item_${order.id}`,
          name: `Rolitt AI Companion - ${order.color}`,
          quantity: 1,
          price: Number(order.amount) || 0,
          image: `/images/products/rolitt-${order.color?.toLowerCase()}.jpg`,
          size: 'Standard',
        },
      ],
      createdAt: order.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: order.updatedAt?.toISOString() || new Date().toISOString(),
      shippingAddress: {
        name: order.billingName || '',
        address: order.billingAddressLine1 || '',
        city: order.billingCity || '',
        zipCode: order.billingPostalCode || '',
        country: order.billingCountry || 'US',
      },
      trackingNumber: order.status === 'completed' ? `TRK${order.id}${Date.now().toString().slice(-6)}` : undefined,
      stripeSessionId: order.sessionId,
      phone: order.billingPhone,
    }));

    // Calculate statistics
    const statsResult = await db
      .select({
        total: sql<number>`count(*)`,
        completed: sql<number>`count(case when ${preordersSchema.status} = 'completed' then 1 end)`,
        processing: sql<number>`count(case when ${preordersSchema.status} = 'processing' then 1 end)`,
        cancelled: sql<number>`count(case when ${preordersSchema.status} = 'cancelled' then 1 end)`,
      })
      .from(preordersSchema)
      .where(eq(preordersSchema.email, userEmail));

    const stats = statsResult[0] || {
      total: 0,
      completed: 0,
      processing: 0,
      cancelled: 0,
    };

    const response = {
      orders,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      stats,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch orders',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
