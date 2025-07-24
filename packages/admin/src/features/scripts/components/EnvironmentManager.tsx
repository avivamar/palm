/**
 * Environment Manager Component
 * Following .cursorrules: TypeScript strict mode, minimal code, business value focused
 */

'use client';

import { AlertTriangle, CheckCircle, RefreshCw, Settings, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';

type EnvStatus = 'success' | 'warning' | 'error' | 'loading';

type EnvCheckResult = {
  status: EnvStatus;
  message: string;
  details: string[];
  timestamp: string;
};

function getStatusIcon(status: EnvStatus) {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'loading':
      return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
  }
}

function getStatusBadge(status: EnvStatus) {
  switch (status) {
    case 'success':
      return <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>;
    case 'warning':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Warnings</Badge>;
    case 'error':
      return <Badge variant="destructive">Errors</Badge>;
    case 'loading':
      return <Badge variant="outline">Checking...</Badge>;
  }
}

export function EnvironmentManager() {
  const [result, setResult] = useState<EnvCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkEnvironment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/scripts/check-env');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        status: 'error',
        message: 'Failed to check environment',
        details: ['Network error or API unavailable'],
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDetail = (detail: string) => {
    // Extract emoji and clean text
    const cleaned = detail.replace(/^[✅❌⚠️]\s*/, '').trim();
    return cleaned;
  };

  const getDetailIcon = (detail: string) => {
    if (detail.includes('✅')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (detail.includes('❌')) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (detail.includes('⚠️')) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Environment Manager</h2>
        </div>
        <Button onClick={checkEnvironment} disabled={isLoading}>
          {isLoading
            ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              )
            : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Check Environment
                </>
              )}
        </Button>
      </div>

      {/* Status Overview */}
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(result.status)}
                <CardTitle>Environment Status</CardTitle>
              </div>
              {getStatusBadge(result.status)}
            </div>
            <CardDescription>
              Last checked:
              {' '}
              {new Date(result.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {result.message}
            </p>

            {result.details.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Environment Variables:</h4>
                <div className="space-y-1">
                  {result.details.map((detail, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {getDetailIcon(detail)}
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        {formatDetail(detail)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common environment management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              <Settings className="mr-2 h-4 w-4" />
              View .env.example
            </Button>
            <Button variant="outline" className="justify-start">
              <CheckCircle className="mr-2 h-4 w-4" />
              Test Stripe Connection
            </Button>
            <Button variant="outline" className="justify-start">
              <CheckCircle className="mr-2 h-4 w-4" />
              Test Database Connection
            </Button>
            <Button variant="outline" className="justify-start">
              <CheckCircle className="mr-2 h-4 w-4" />
              Test Supabase Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Environment Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Setup Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">1.</span>
              <span>
                Copy
                <code className="bg-muted px-1 rounded">.env.example</code>
                {' '}
                to
                <code className="bg-muted px-1 rounded">.env.local</code>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">2.</span>
              <span>Configure required variables: Stripe keys, Database URL, Supabase credentials</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">3.</span>
              <span>Run environment check to verify configuration</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">4.</span>
              <span>Test individual services using the quick actions above</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
