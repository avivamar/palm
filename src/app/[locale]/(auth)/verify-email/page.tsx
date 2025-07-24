import { getTranslations } from 'next-intl/server';

import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm';

type IVerifyEmailProps = {
  params: Promise<{ locale: string }>;
};

export default async function VerifyEmailPage({ params }: IVerifyEmailProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'VerifyEmail' });

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">

        <h2 className="mt-6 text-2xl font-bold leading-9 tracking-tight text-foreground">
          {t('title')}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-8 py-8 shadow sm:rounded-lg sm:px-10">
          <VerifyEmailForm />
        </div>
      </div>
    </div>
  );
}
