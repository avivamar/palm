/**
 * Admin Debug Page - Check current user and admin status
 */

import { getUserRole, getUserRoleByEmail } from '@/app/actions/userActions';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';

export default async function AdminDebugPage() {
  const debugInfo: any = {
    supabaseConfigured: isSupabaseConfigured,
    session: null,
    userRole: null,
    userRoleByEmail: null,
    adminEmail: process.env.ADMIN_EMAIL,
    error: null,
  };

  try {
    if (isSupabaseConfigured) {
      const supabase = await createServerClient();
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        debugInfo.error = error.message;
      } else if (session) {
        debugInfo.session = {
          userId: session.user.id,
          email: session.user.email,
          role: session.user.role,
          metadata: session.user.user_metadata,
        };

        // Check user role by ID
        const roleResult = await getUserRole(session.user.id);
        debugInfo.userRole = roleResult;

        // Check user role by email
        if (session.user.email) {
          const roleByEmailResult = await getUserRoleByEmail(session.user.email);
          debugInfo.userRoleByEmail = roleByEmailResult;
        }
      }
    }
  } catch (error) {
    debugInfo.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Debug Information</h1>

      <Card>
        <CardHeader>
          <CardTitle>Environment Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-medium">Supabase Configured:</dt>
              <dd>
                <Badge variant={debugInfo.supabaseConfigured ? 'default' : 'destructive'}>
                  {debugInfo.supabaseConfigured ? 'Yes' : 'No'}
                </Badge>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Admin Email (ENV):</dt>
              <dd className="font-mono text-sm">{debugInfo.adminEmail || 'Not set'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Session</CardTitle>
        </CardHeader>
        <CardContent>
          {debugInfo.session
            ? (
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="font-medium">User ID:</dt>
                    <dd className="font-mono text-sm">{debugInfo.session.userId}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Email:</dt>
                    <dd className="font-mono text-sm">{debugInfo.session.email}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Is Admin Email:</dt>
                    <dd>
                      <Badge variant={debugInfo.session.email === debugInfo.adminEmail ? 'default' : 'destructive'}>
                        {debugInfo.session.email === debugInfo.adminEmail ? 'Yes' : 'No'}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              )
            : (
                <p className="text-muted-foreground">No active session</p>
              )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Role Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">By User ID:</h4>
            {debugInfo.userRole
              ? (
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt>Success:</dt>
                      <dd>
                        <Badge variant={debugInfo.userRole.success ? 'default' : 'destructive'}>
                          {String(debugInfo.userRole.success)}
                        </Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Role:</dt>
                      <dd className="font-mono">{debugInfo.userRole.role || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Is Admin:</dt>
                      <dd>
                        <Badge variant={debugInfo.userRole.role === 'admin' ? 'default' : 'destructive'}>
                          {debugInfo.userRole.role === 'admin' ? 'Yes' : 'No'}
                        </Badge>
                      </dd>
                    </div>
                    {debugInfo.userRole.error && (
                      <div className="flex justify-between">
                        <dt>Error:</dt>
                        <dd className="text-red-600">{debugInfo.userRole.error}</dd>
                      </div>
                    )}
                  </dl>
                )
              : (
                  <p className="text-muted-foreground">Not checked</p>
                )}
          </div>

          <div>
            <h4 className="font-medium mb-2">By Email:</h4>
            {debugInfo.userRoleByEmail
              ? (
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt>Success:</dt>
                      <dd>
                        <Badge variant={debugInfo.userRoleByEmail.success ? 'default' : 'destructive'}>
                          {String(debugInfo.userRoleByEmail.success)}
                        </Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Role:</dt>
                      <dd className="font-mono">{debugInfo.userRoleByEmail.role || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Is Admin:</dt>
                      <dd>
                        <Badge variant={debugInfo.userRoleByEmail.role === 'admin' ? 'default' : 'destructive'}>
                          {debugInfo.userRoleByEmail.role === 'admin' ? 'Yes' : 'No'}
                        </Badge>
                      </dd>
                    </div>
                    {debugInfo.userRoleByEmail.error && (
                      <div className="flex justify-between">
                        <dt>Error:</dt>
                        <dd className="text-red-600">{debugInfo.userRoleByEmail.error}</dd>
                      </div>
                    )}
                  </dl>
                )
              : (
                  <p className="text-muted-foreground">Not checked</p>
                )}
          </div>
        </CardContent>
      </Card>

      {debugInfo.error && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-red-50 p-4 rounded overflow-x-auto">
              {debugInfo.error}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Debug Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
