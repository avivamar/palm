'use client';

import { useState, useEffect } from 'react';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { createClient } from '@/libs/supabase/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AuthTestPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    checkAuth();
    runTests();
  }, []);

  const checkAuth = async () => {
    try {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth check error:', error);
        toast.error('Failed to check authentication status');
      } else {
        setUser(session?.user || null);
        if (session?.user) {
          toast.success('You are logged in!');
        }
      }
    } catch (error) {
      console.error('Unexpected auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const runTests = async () => {
    const results: any = {};
    
    // Test 1: Check Supabase configuration
    results.supabaseConfig = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
    };

    // Test 2: Check database connection
    try {
      const supabase = createClient();
      const { error } = await supabase.from('users').select('id').limit(1);
      results.database = error ? `⚠️ ${error.message}` : '✅ Connected';
    } catch (error) {
      results.database = '❌ Failed';
    }

    // Test 3: Check auth service
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.getSession();
      results.authService = error ? `⚠️ ${error.message}` : '✅ Available';
    } catch (error) {
      results.authService = '❌ Failed';
    }

    setTestResults(results);
  };

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error('Failed to sign out');
        console.error('Sign out error:', error);
      } else {
        setUser(null);
        toast.success('Signed out successfully');
      }
    } catch (error) {
      console.error('Unexpected sign out error:', error);
    }
  };

  const handleTestGoogleOAuth = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        toast.error(`OAuth test failed: ${error.message}`);
      } else if (data?.url) {
        toast.success('OAuth URL generated successfully!');
        console.log('OAuth URL:', data.url);
      }
    } catch (error) {
      toast.error('OAuth test failed');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">🔐 Supabase Auth Test Page</h1>

      {/* System Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>📊 System Status</CardTitle>
          <CardDescription>Configuration and connection status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="font-mono text-sm">
              <p>🔑 Supabase URL: {testResults.supabaseConfig?.url}</p>
              <p>🔑 Anon Key: {testResults.supabaseConfig?.anonKey}</p>
              <p>🔑 Google Client ID: {testResults.supabaseConfig?.googleClientId}</p>
              <p>💾 Database: {testResults.database}</p>
              <p>🔐 Auth Service: {testResults.authService}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current User Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>👤 Current User</CardTitle>
          <CardDescription>Your authentication status</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : user ? (
            <div className="space-y-2">
              <p className="text-green-600 font-semibold">✅ Authenticated</p>
              <div className="text-sm space-y-1">
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Provider:</strong> {user.app_metadata?.provider || 'email'}</p>
                <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
              </div>
              <Button onClick={handleSignOut} variant="outline" className="mt-4">
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-500">Not authenticated</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Authentication Options */}
      {!user && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🚀 Sign In Options</CardTitle>
            <CardDescription>Test different authentication methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Google OAuth</h3>
              <GoogleSignInButton />
            </div>

            <div>
              <h3 className="font-semibold mb-2">Test OAuth Configuration</h3>
              <Button onClick={handleTestGoogleOAuth} variant="outline">
                Test Google OAuth Setup
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">1. Supabase Dashboard Configuration:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Go to Authentication → Providers</li>
              <li>Enable Google provider</li>
              <li>Add Google Client ID and Secret</li>
              <li>Authorized redirect URL: <code className="bg-gray-100 px-1 rounded">{`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`}</code></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. Google Cloud Console:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Add authorized JavaScript origins: <code className="bg-gray-100 px-1 rounded">http://localhost:3000</code></li>
              <li>Add authorized redirect URIs:</li>
              <li className="ml-4"><code className="bg-gray-100 px-1 rounded">{`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`}</code></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. Environment Variables (.env.local):</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs">
{`DATABASE_URL="postgres://..."
NEXT_PUBLIC_SUPABASE_URL="https://[project].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
NEXT_PUBLIC_GOOGLE_CLIENT_ID="[client-id].apps.googleusercontent.com"`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}