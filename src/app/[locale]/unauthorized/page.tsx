import { ArrowLeft, Home, KeyRound, ShieldX, User } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createServerClient, isSupabaseConfigured } from '@/libs/supabase/config';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function UnauthorizedPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('unauthorized');

  // Get current session info
  let session = null;
  let isAdminEmail = false;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (isSupabaseConfigured) {
    const supabase = await createServerClient();
    const { data } = await supabase.auth.getSession();
    session = data.session;
    isAdminEmail = session?.user?.email === adminEmail;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-2xl space-y-4">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <ShieldX className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {t('title')}
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              {t('description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              {t('message')}
            </p>

            {session && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Current User
                </h3>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Email:</dt>
                    <dd className="font-mono">{session.user.email}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">User ID:</dt>
                    <dd className="font-mono text-xs">{session.user.id}</dd>
                  </div>
                </dl>
              </div>
            )}

            {isAdminEmail && (
              <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <KeyRound className="h-5 w-5" />
                    Admin Access Issue Detected
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">
                    Your email matches the ADMIN_EMAIL configuration, but your database role might not be set correctly.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button asChild className="w-full">
                      <Link href={`/${locale}/admin/fix-role`}>
                        Fix Admin Role
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/${locale}/admin/debug`}>
                        View Debug Information
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col gap-2">
              <Button asChild variant="default" className="w-full">
                <Link href={`/${locale}/dashboard`} className="flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {t('backToDashboard')}
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href={`/${locale}`} className="flex items-center justify-center gap-2">
                  <Home className="w-4 h-4" />
                  {t('backToHome')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {process.env.NODE_ENV === 'development' && (
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Development Info</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="text-xs space-y-1">
                <div className="flex justify-between">
                  <dt>Admin Email (ENV):</dt>
                  <dd className="font-mono">{adminEmail || 'Not set'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Is Admin Email:</dt>
                  <dd>
                    <Badge variant={isAdminEmail ? 'default' : 'secondary'} className="text-xs">
                      {isAdminEmail ? 'Yes' : 'No'}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Supabase Configured:</dt>
                  <dd>
                    <Badge variant={isSupabaseConfigured ? 'default' : 'destructive'} className="text-xs">
                      {isSupabaseConfigured ? 'Yes' : 'No'}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'unauthorized' });

  return {
    title: t('title'),
    description: t('description'),
  };
}
