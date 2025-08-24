'use client';

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  CreditCard,
  Download,
  Sparkles,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type PaymentMethod = {
  id: string;
  type: 'card' | 'paypal' | 'bank';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  email?: string;
  bankName?: string;
  billingName?: string;
  billingAddress?: {
    line1?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
};

type Invoice = {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
  downloadUrl?: string;
  orderId?: string;
  sessionId?: string;
};

type CurrentPlan = {
  name: string;
  price: number;
  currency: string;
  interval: string;
  nextBilling: string;
  status: string;
};

type BillingData = {
  currentPlan: CurrentPlan;
  paymentMethods: PaymentMethod[];
  invoices: Invoice[];
  usage: {
    apiCalls: number;
    storage: number;
    bandwidth: number;
  };
  stats: {
    totalSpent: number;
    totalOrders: number;
    avgOrderValue: number;
  };
};

// Skeleton component for loading state
function BillingSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

const getStatusIcon = (status: Invoice['status']) => {
  switch (status) {
    case 'paid':
      return <CheckCircle className="h-4 w-4" />;
    case 'pending':
      return <Calendar className="h-4 w-4" />;
    case 'overdue':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return null;
  }
};

export function BillingContent() {
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('dashboard');

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // For demo purposes, we'll simulate getting user status
      const user = { email: 'demo@example.com' };

      // For now, return mock data. This will be replaced with real API call
      const mockData: BillingData = {
        currentPlan: {
          name: user ? 'Free Trial' : 'No Plan',
          price: 0,
          currency: 'USD',
          interval: 'month',
          nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: user ? 'active' : 'inactive',
        },
        paymentMethods: [],
        invoices: [],
        usage: {
          apiCalls: 0,
          storage: 0,
          bandwidth: 0,
        },
        stats: {
          totalSpent: 0,
          totalOrders: 0,
          avgOrderValue: 0,
        },
      };

      setBillingData(mockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchBillingData();
  }, []);

  const handleDownloadInvoice = (invoiceId: string) => {
    // TODO: Implement download invoice functionality
    const invoice = billingData?.invoices.find(inv => inv.id === invoiceId);
    if (invoice?.downloadUrl) {
      window.open(invoice.downloadUrl, '_blank');
    }
  };

  if (loading) {
    return <BillingSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <CreditCard className="h-8 w-8" />
              {t('billing.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('billing.description')}
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-600">
                {t('billing.error', { error })}
              </p>
              <Button variant="outline" onClick={fetchBillingData}>
                {t('billing.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!billingData) {
    return <BillingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="h-8 w-8" />
            {t('billing.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('billing.description')}
          </p>
        </div>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {t('billing.current_plan.title')}
          </CardTitle>
          <CardDescription>
            {t('billing.current_plan.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {billingData.currentPlan.status === 'inactive' ? (
            <div className="text-center py-8">
              <Sparkles className="mx-auto h-12 w-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Start Your Palm Reading Journey
              </h3>
              <p className="text-muted-foreground mb-6">
                Get unlimited palm readings with AI-powered insights
              </p>
              <Button 
                onClick={() => window.location.href = '/palm'}
                className="bg-primary hover:bg-primary/90"
              >
                Start Free Trial
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold">{billingData.currentPlan.name}</h3>
                <p className="text-muted-foreground">
                  $
                  {billingData.currentPlan.price.toFixed(2)}
                  /
                  {billingData.currentPlan.interval}
                </p>
                {billingData.currentPlan.price === 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    Free trial active - Upload and analyze palm photos for free!
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/pricing'}
                >
                  {billingData.currentPlan.price === 0 ? 'View Plans' : t('billing.current_plan.change_plan')}
                </Button>
                {billingData.currentPlan.price > 0 && (
                  <Button variant="outline" className="text-destructive hover:text-destructive">
                    {t('billing.current_plan.cancel_subscription')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>{t('billing.payment_methods.title')}</CardTitle>
          <CardDescription>
            {t('billing.payment_methods.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Payment methods are managed through our secure checkout process.
            </p>
            {billingData.currentPlan.price > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Your subscription payments are processed securely through Stripe.
              </p>
            )}
          </div>
        </CardContent>
      </Card>


      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>{t('billing.billing_history.title')}</CardTitle>
          <CardDescription>
            {t('billing.billing_history.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
              <div>{t('billing.billing_history.invoice_id')}</div>
              <div>{t('billing.billing_history.date')}</div>
              <div>{t('billing.billing_history.amount')}</div>
              <div>{t('billing.billing_history.status')}</div>
              <div>{t('billing.billing_history.download')}</div>
            </div>
            {billingData.invoices.length > 0
              ? (
                  billingData.invoices.map(invoice => (
                    <div key={invoice.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 py-3 border-b last:border-b-0">
                      <div className="font-medium">{invoice.id}</div>
                      <div className="text-muted-foreground">
                        {new Date(invoice.date).toLocaleDateString()}
                      </div>
                      <div className="font-semibold">
                        $
                        {invoice.amount.toFixed(2)}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(invoice.status)}
                        <Badge variant={invoice.status === 'paid' ? 'default' : invoice.status === 'pending' ? 'secondary' : 'destructive'}>
                          {t(`billing.billing_history.${invoice.status}`)}
                        </Badge>
                      </div>
                      <div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice.id)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          {t('billing.billing_history.download')}
                        </Button>
                      </div>
                    </div>
                  ))
                )
              : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t('billing.billing_history.no_invoices')}</h3>
                    <p className="text-muted-foreground">
                      {t('billing.billing_history.no_invoices_desc')}
                    </p>
                  </div>
                )}
          </div>
        </CardContent>
      </Card>

      {/* Usage This Month */}
      <Card>
        <CardHeader>
          <CardTitle>{t('billing.usage.title')}</CardTitle>
          <CardDescription>
            {t('billing.usage.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {billingData.stats.totalOrders}
              </div>
              <div className="text-sm text-muted-foreground">
                {t('billing.usage_stats.orders_this_month')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                $
                {billingData.stats.totalSpent.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                {t('billing.usage_stats.total_spent')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                $
                {billingData.stats.avgOrderValue.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                {t('billing.usage_stats.avg_order_value')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
