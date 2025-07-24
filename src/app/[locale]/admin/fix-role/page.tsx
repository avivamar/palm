'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FixAdminRolePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [fixResult, setFixResult] = useState<any>(null);

  const handleFixUserMatch = async () => {
    setLoading(true);
    setFixResult(null);

    try {
      const response = await fetch('/api/admin/fix-user-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('User matching fixed successfully');
        setFixResult(data);
      } else {
        toast.error(data.error || 'Failed to fix user matching');
        setFixResult({ error: data.error, details: data.details });
      }
    } catch (error) {
      console.error('Fix user match error:', error);
      toast.error('Network error occurred');
      setFixResult({ error: 'Network error', details: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncRole = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Try the new create-admin-user API first
      const response = await fetch('/api/admin/create-admin-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Admin user created successfully');
        setResult(data);
      } else {
        // If that fails, try the old sync-admin-role API
        console.log('Create admin user failed, trying sync method...');
        const syncResponse = await fetch('/api/admin/sync-admin-role', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const syncData = await syncResponse.json();

        if (syncResponse.ok) {
          toast.success(syncData.message || 'Role synced successfully');
          setResult(syncData);
        } else {
          toast.error(data.error || syncData.error || 'Failed to create admin user');
          setResult({
            error: data.error || syncData.error,
            details: data.details || syncData.details,
            suggestion: data.suggestion,
          });
        }
      }
    } catch (error) {
      console.error('Admin setup error:', error);
      toast.error('Network error occurred');
      setResult({ error: 'Network error', details: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Setup Admin User</CardTitle>
          <CardDescription>
            This utility will create or update your user in the database and set admin role if your email matches ADMIN_EMAIL environment variable.
            If the database tables don't exist, you'll get helpful instructions to set them up.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button
              onClick={handleFixUserMatch}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {loading ? 'Fixing...' : '1. Fix User Matching'}
            </Button>

            <Button
              onClick={handleSyncRole}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Setting up...' : '2. Setup Admin User'}
            </Button>
          </div>

          {fixResult && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Fix User Matching Result:</h3>
              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto">
                {JSON.stringify(fixResult, null, 2)}
              </pre>
            </div>
          )}

          {result && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Setup Admin User Result:</h3>
              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Step 1:</strong>
            {' '}
            Make sure you are logged in with the email set in ADMIN_EMAIL environment variable
          </p>
          <p>
            <strong>Step 2:</strong>
            {' '}
            Click "1. Fix User Matching" first to ensure your Supabase session matches your database user
          </p>
          <p>
            <strong>Step 3:</strong>
            {' '}
            Click "2. Setup Admin User" to create or update your admin role
          </p>
          <p>
            <strong>Step 4:</strong>
            {' '}
            If successful, you should see your role updated to "admin"
          </p>
          <p>
            <strong>Step 5:</strong>
            {' '}
            Try accessing
            {' '}
            <a href="/admin" className="text-blue-600 hover:underline">/admin</a>
            {' '}
            again
          </p>
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <p className="text-blue-700 dark:text-blue-300">
              <strong>💡 Tip:</strong>
              {' '}
              If you see "Database query failed" in the debug page, run "Fix User Matching" first to sync your session with the database.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
