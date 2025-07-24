'use client';

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  CreditCard,
  Download,
  Plus,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false);
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('dashboard');

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/dashboard/billing');

      if (!response.ok) {
        throw new Error('Failed to fetch billing data');
      }

      const data = await response.json();
      setBillingData(data);
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

  const handleAddPaymentMethod = () => {
    // TODO: Implement add payment method functionality
    setIsAddingPaymentMethod(true);
  };

  const handleRemovePaymentMethod = (_methodId: string) => {
    // TODO: Implement remove payment method functionality
    // Remove payment method from user account
  };

  const handleSetDefaultPaymentMethod = (_methodId: string) => {
    // TODO: Implement set default payment method functionality
    // Set payment method as default
  };

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
          <CardTitle>{t('billing.current_plan.title')}</CardTitle>
          <CardDescription>
            {t('billing.current_plan.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold">{billingData.currentPlan.name}</h3>
              <p className="text-muted-foreground">
                $
                {billingData.currentPlan.price.toFixed(2)}
                /
                {billingData.currentPlan.interval}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('billing.current_plan.next_billing', {
                  date: new Date(billingData.currentPlan.nextBilling).toLocaleDateString(),
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">{t('billing.current_plan.change_plan')}</Button>
              <Button variant="outline">{t('billing.current_plan.cancel_subscription')}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{t('billing.payment_methods.title')}</CardTitle>
              <CardDescription>
                {t('billing.payment_methods.description')}
              </CardDescription>
            </div>
            <Button onClick={handleAddPaymentMethod}>
              <Plus className="mr-2 h-4 w-4" />
              {t('billing.payment_methods.add_payment_method')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {billingData.paymentMethods.length > 0
              ? (
                  billingData.paymentMethods.map((method, index) => (
                    <div key={method.id}>
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <CreditCard className="h-8 w-8 text-muted-foreground" />
                          <div>
                            {method.type === 'card' && (
                              <>
                                <p className="font-medium">
                                  {method.brand?.toUpperCase()}
                                  {' '}
                                  ****
                                  {' '}
                                  {method.last4 ?? ''}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {t('billing.payment_methods.expires', {
                                    month: method.expiryMonth ?? 0,
                                    year: method.expiryYear ?? 0,
                                  })}
                                </p>
                              </>
                            )}
                            {method.type === 'paypal' && (
                              <>
                                <p className="font-medium">PayPal</p>
                                <p className="text-sm text-muted-foreground">{method.email ?? ''}</p>
                              </>
                            )}
                            {method.type === 'bank' && (
                              <>
                                <p className="font-medium">{method.bankName ?? ''}</p>
                                <p className="text-sm text-muted-foreground">
                                  {t('billing.payment_methods.ending_in', { last4: method.last4 ?? '' })}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {method.isDefault && (
                            <Badge variant="secondary">{t('billing.payment_methods.default')}</Badge>
                          )}
                          <div className="flex gap-2">
                            {!method.isDefault && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSetDefaultPaymentMethod(method.id)}
                              >
                                {t('billing.payment_methods.set_default')}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemovePaymentMethod(method.id)}
                            >
                              {t('billing.payment_methods.remove')}
                            </Button>
                          </div>
                        </div>
                      </div>
                      {index < billingData.paymentMethods.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))
                )
              : (
                  <div className="text-center py-8">
                    <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t('billing.payment_methods.no_methods')}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t('billing.payment_methods.no_methods_desc')}
                    </p>
                    <Button onClick={handleAddPaymentMethod}>
                      <Plus className="mr-2 h-4 w-4" />
                      {t('billing.payment_methods.add_payment_method')}
                    </Button>
                  </div>
                )}
          </div>
        </CardContent>
      </Card>

      {/* Add Payment Method Form */}
      {isAddingPaymentMethod && (
        <Card>
          <CardHeader>
            <CardTitle>{t('billing.payment_methods.add_payment_method')}</CardTitle>
            <CardDescription>
              {t('billing.payment_methods.add_payment_method_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cardNumber">{t('billing.payment_methods.card_number')}</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                <div>
                  <Label htmlFor="cardName">{t('billing.payment_methods.cardholder_name')}</Label>
                  <Input id="cardName" placeholder="John Doe" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="expiryMonth">{t('billing.payment_methods.expiry_month')}</Label>
                  <Input id="expiryMonth" placeholder="MM" />
                </div>
                <div>
                  <Label htmlFor="expiryYear">{t('billing.payment_methods.expiry_year')}</Label>
                  <Input id="expiryYear" placeholder="YYYY" />
                </div>
                <div>
                  <Label htmlFor="cvv">{t('billing.payment_methods.cvv')}</Label>
                  <Input id="cvv" placeholder="123" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button>{t('billing.payment_methods.add_payment_method')}</Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddingPaymentMethod(false)}
                >
                  {t('billing.payment_methods.cancel')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
