'use client';

import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { handleCheckout } from '@/app/actions/checkoutActions';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function DebugPaymentPage() {
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTestPayment = async () => {
    setIsTestLoading(true);
    setTestResult(null);

    const formData = new FormData();
    formData.append('priceId', 'price_1RdAu1BCMz50a5RzChT7XYGm'); // Using a test price ID
    formData.append('email', 'test@example.com');
    formData.append('locale', 'en');
    formData.append('color', 'Red');

    try {
      await handleCheckout(formData);
      setTestResult('Checkout process initiated. Redirecting...');
    } catch (err) {
      console.error('Test payment failed:', err);
      setTestResult(`错误: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setIsTestLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">支付系统调试</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>测试支付</CardTitle>
            <CardDescription>创建一个测试支付会话</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleTestPayment}
              disabled={isTestLoading}
              className="w-full"
            >
              {isTestLoading
                ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      创建测试支付中...
                    </>
                  )
                : (
                    '创建测试支付'
                  )}
            </Button>
            {testResult && (
              <div
                className={cn(
                  'p-3 rounded border',
                  testResult.includes('成功')
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800',
                )}
              >
                {testResult}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
