import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SignUpForm } from '@/components/auth/SignUpForm';

type ISignUpProps = {
  params: Promise<{ locale: string }>;
};

export default async function SignUpPage({ params }: ISignUpProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SignUp' });

  return (
    <AuthGuard redirectIfAuthenticated={true}>
      <div className="flex flex-col justify-center px-6 py-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">

          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            {t('sign_up_title')}
          </h2>
        </div>

        <div className="mt-6 mx-auto w-full max-w-md">
          <div className="bg-white px-8 py-8 shadow sm:rounded-lg sm:px-10">
            <SignUpForm />
          </div>

          <p className="mt-10 text-center text-sm text-gray-500">
            {t('sign_up_footer')}
            {' '}
            <Link
              href={`/${locale}/sign-in`}
              className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            >
              {t('sign_up_footer_link')}
            </Link>
          </p>
        </div>
      </div>
    </AuthGuard>
  );
}

export async function generateMetadata({ params }: ISignUpProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SignUp' });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}
