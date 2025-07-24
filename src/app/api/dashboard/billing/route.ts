/**
 * Dashboard Billing API Route
 * Following CLAUDE.md: 商业价值优先，TypeScript严格模式
 */

import type { NextRequest } from 'next/server';
import { and, desc, eq, gte } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDB } from '@/libs/DB';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';
import { preordersSchema } from '@/models/Schema';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
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

    // Get user's completed orders for billing history
    const completedOrders = await db
      .select()
      .from(preordersSchema)
      .where(
        and(
          eq(preordersSchema.email, userEmail),
          eq(preordersSchema.status, 'completed'),
        ),
      )
      .orderBy(desc(preordersSchema.createdAt));

    // Calculate billing statistics
    const totalSpent = completedOrders.reduce((sum: number, order: any) => {
      const amount = typeof order.amount === 'string'
        ? Number.parseFloat(order.amount)
        : order.amount || 0;
      return sum + amount;
    }, 0);

    const totalOrders = completedOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Get current month orders for usage stats
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const currentMonthOrders = await db
      .select()
      .from(preordersSchema)
      .where(
        and(
          eq(preordersSchema.email, userEmail),
          gte(preordersSchema.createdAt, currentMonth),
        ),
      );

    // Convert orders to invoice format
    const invoices = completedOrders.map((order: any) => {
      const amount = typeof order.amount === 'string'
        ? Number.parseFloat(order.amount)
        : order.amount || 0;

      return {
        id: `INV-${order.id}`,
        date: order.createdAt?.toISOString() || new Date().toISOString(),
        amount,
        status: 'paid' as const,
        description: `Order ${order.id}`,
        downloadUrl: `/api/invoices/INV-${order.id}/download`,
        orderId: order.id,
        sessionId: order.sessionId || null,
      };
    });

    // Mock current plan data (replace with real subscription data)
    const currentPlan = {
      name: 'Pro Plan',
      price: 29.99,
      currency: 'USD',
      interval: 'month',
      nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
    };

    // Mock payment methods (replace with real payment data from Stripe/etc)
    const paymentMethods = [
      {
        id: 'pm_1',
        type: 'card' as const,
        brand: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
        billingName: 'John Doe',
        billingAddress: {
          line1: '123 Main St',
          city: 'New York',
          postalCode: '10001',
          country: 'US',
        },
      },
    ];

    // Mock usage data (replace with real usage tracking)
    const usage = {
      apiCalls: 1247,
      storage: 2.3,
      bandwidth: 847,
    };

    const billingData = {
      currentPlan,
      paymentMethods,
      invoices,
      usage,
      stats: {
        totalSpent,
        totalOrders,
        avgOrderValue,
      },
      usageStats: {
        ordersThisMonth: currentMonthOrders.length,
        totalSpent,
        averageOrderValue: avgOrderValue,
      },
    };

    return NextResponse.json(billingData);
  } catch (error) {
    console.error('Error fetching billing data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing data' },
      { status: 500 },
    );
  }
}
