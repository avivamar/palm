import { getTranslations } from 'next-intl/server';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

type IForgotPasswordProps = {
  params: Promise<{ locale: string }>;
};

export default async function ForgotPasswordPage({ params }: IForgotPasswordProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ForgotPassword' });

  return (
    <AuthGuard redirectIfAuthenticated={true}>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">

          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-foreground">
            {t('title')}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {t('description')}
          </p>
        </div>

        <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-card px-8 py-8 shadow-sm border rounded-lg">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
