/**
 * 简化的支付表单组件
 * 临时版本，避免构建问题
 */

'use client';

import type { Product } from '@/app/actions/productActions';
import { CheckCircle, Clock, Shield, Truck } from 'lucide-react';
import React, { useState } from 'react';
import { handleCheckout } from '@/app/actions/checkoutActions';
import { conversionTracker } from '@/components/analytics/ConversionTrackingSimple';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';

type PaymentFormProps = {
  selectedProduct?: Product;
};

type FormData = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export function PaymentForm({ selectedProduct }: PaymentFormProps) {
  const { user } = useAuth();

  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: user?.email || '',
    firstName: user?.displayName?.split(' ')[0] || '',
    lastName: user?.displayName?.split(' ').slice(1).join(' ') || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      conversionTracker.trackEvent('purchase', 'form_submit', {
        product: selectedProduct?.id,
        email: formData.email,
      });

      const formDataToSubmit = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSubmit.append(key, value);
      });

      if (selectedProduct) {
        formDataToSubmit.append('productId', selectedProduct.id);
        formDataToSubmit.append('colorId', selectedProduct.color || 'default');
      }

      await handleCheckout(formDataToSubmit);
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Payment Information
        </CardTitle>
        <CardDescription>
          Complete your order details below
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Summary */}
          {selectedProduct && (
            <div className="relative p-4 border rounded-lg bg-accent/50">
              <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs">
                Selected
              </Badge>
              <h3 className="font-semibold">{selectedProduct.name}</h3>
              <p className="text-sm text-muted-foreground">
                Color:
                {' '}
                {selectedProduct.color || 'default'}
              </p>
              <p className="text-lg font-bold">
                $
                {selectedProduct.price}
              </p>
            </div>
          )}

          {/* Basic Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={e => handleInputChange('firstName', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={e => handleInputChange('lastName', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
          </div>

          {/* Address Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={e => handleInputChange('address', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => handleInputChange('city', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={e => handleInputChange('state', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Postal Code</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={e => handleInputChange('postalCode', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
            <Truck className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Free Shipping</p>
              <p className="text-sm text-muted-foreground">
                Estimated delivery in 5-7 business days
              </p>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Security Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Your payment information is secure and encrypted</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Session expires in 15 minutes</span>
              </div>
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-md font-medium transition-colors"
          >
            {isProcessing ? 'Processing...' : `Complete Purchase - $${selectedProduct?.price || 0}`}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
