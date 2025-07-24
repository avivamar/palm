import { getTranslations } from 'next-intl/server';

import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export default async function ResetPasswordPage({
  searchParams,
  params,
}: {
  searchParams?: Promise<{ oobCode?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const search = await searchParams;
  const oobCode = search?.oobCode;

  const t = await getTranslations({ locale, namespace: 'ResetPassword' });

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">

        <h2 className="mt-6 text-2xl font-bold leading-9 tracking-tight text-gray-900">
          {t('title')}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {t('description')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-8 py-8 shadow sm:rounded-lg sm:px-10">
          <ResetPasswordForm oobCode={oobCode} />
        </div>
      </div>
    </div>
  );
}
