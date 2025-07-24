'use client';

import { Download, Eye, Filter, Package, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

type Order = {
  id: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed';
  total: number;
  currency: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
    size?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  phone?: string;
};

type OrdersResponse = {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: {
    total: number;
    completed: number;
    processing: number;
    cancelled: number;
  };
};

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'delivered':
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'shipped':
      return 'bg-blue-100 text-blue-800';
    case 'processing':
      return 'bg-yellow-100 text-yellow-800';
    case 'pending':
      return 'bg-gray-100 text-gray-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function OrdersContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [ordersData, setOrdersData] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('dashboard');

  const fetchOrders = async (searchQuery?: string, statusQuery?: string, pageQuery?: number) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', (pageQuery || page).toString());
      params.set('limit', '10');

      if (statusQuery && statusQuery !== 'all') {
        params.set('status', statusQuery);
      }

      if (searchQuery) {
        params.set('search', searchQuery);
      }

      const response = await fetch(`/api/dashboard/orders?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrdersData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        setPage(1);
        fetchOrders(searchTerm, statusFilter, 1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle status filter
  useEffect(() => {
    setPage(1);
    fetchOrders(searchTerm, statusFilter, 1);
  }, [statusFilter]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchOrders(searchTerm, statusFilter, newPage);
  };

  if (loading && !ordersData) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-48" />
            </div>
          </CardContent>
        </Card>
        <OrdersSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Package className="h-8 w-8 text-blue-500" />
              {t('orders.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('orders.description')}
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-600">
                {t('orders.error')}
                :
                {' '}
                {error}
              </p>
              <Button variant="outline" onClick={() => fetchOrders(searchTerm, statusFilter, page)}>
                {t('orders.retry')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8 text-blue-500" />
            {t('orders.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('orders.description')}
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {t('orders.total_orders', { count: ordersData?.stats.total || 0 })}
        </div>
      </div>

      <Button variant="outline">
        <Download className="mr-2 h-4 w-4" />
        {t('orders.export_orders')}
      </Button>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('orders.search_placeholder')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder={t('orders.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('orders.all_statuses')}</SelectItem>
                <SelectItem value="pending">{t('orders.status_pending')}</SelectItem>
                <SelectItem value="processing">{t('orders.status_processing')}</SelectItem>
                <SelectItem value="shipped">{t('orders.status_shipped')}</SelectItem>
                <SelectItem value="delivered">{t('orders.status_delivered')}</SelectItem>
                <SelectItem value="cancelled">{t('orders.status_cancelled')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {loading
          ? (
              <OrdersSkeleton />
            )
          : ordersData?.orders && ordersData.orders.length > 0
            ? (
                ordersData.orders.map(order => (
                  <Card key={order.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{order.orderNumber}</h3>
                            <Badge className={getStatusColor(order.status)}>
                              {t(`orders.status_${order.status === 'completed' ? 'delivered' : order.status}`)}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>
                              {t('orders.order_date', { date: new Date(order.createdAt).toLocaleDateString() })}
                            </p>
                            <p>
                              {t('orders.items_count', { count: order.items.length })}
                            </p>
                            <p>
                              {t('orders.products')}
                              :
                              {' '}
                              {order.items.map(item => item.name).join(', ')}
                            </p>
                            {order.trackingNumber && (
                              <p>
                                {t('orders.tracking_number', { number: order.trackingNumber })}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <div className="text-right">
                            <p className="font-semibold text-lg">
                              $
                              {order.total.toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.currency}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            {t('orders.view_details')}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )
            : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{t('orders.no_orders')}</h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm || statusFilter !== 'all'
                          ? t('orders.no_orders_search')
                          : t('orders.no_orders_empty')}
                      </p>
                      <Button variant="outline">
                        {t('orders.start_shopping')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
      </div>

      {/* Pagination */}
      {ordersData && ordersData.pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >
            {t('orders.pagination.previous')}
          </Button>
          <span className="text-sm text-muted-foreground">
            {t('orders.pagination.page_info', { current: page, total: ordersData.pagination.totalPages })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === ordersData.pagination.totalPages}
          >
            {t('orders.pagination.next')}
          </Button>
        </div>
      )}

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{t('orders.summary.title')}</CardTitle>
          <CardDescription>{t('orders.summary.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{ordersData?.stats.total || 0}</p>
              <p className="text-sm text-muted-foreground">{t('orders.summary.total_orders')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                $
                {ordersData?.orders?.reduce((sum, order) => sum + order.total, 0).toFixed(2) || '0.00'}
              </p>
              <p className="text-sm text-muted-foreground">{t('orders.summary.total_spent')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                $
                {ordersData?.orders && ordersData.orders.length > 0
                  ? (ordersData.orders.reduce((sum, order) => sum + order.total, 0) / ordersData.orders.length).toFixed(2)
                  : '0.00'}
              </p>
              <p className="text-sm text-muted-foreground">{t('orders.summary.avg_order')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {ordersData?.stats.processing || 0}
              </p>
              <p className="text-sm text-muted-foreground">{t('orders.summary.pending_orders')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
